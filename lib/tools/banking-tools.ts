import { tool } from 'ai';
import { z } from 'zod';
import { knowledgeRetriever } from '../rag/retriever';
import { createServerClient } from '../supabase/server';

/**
 * Factory function to create banking tools with user context
 * This allows tools to check authentication and access user-specific data
 */
export function createBankingTools(userId: string | null) {
  const supabase = createServerClient();

  /**
   * Agentic RAG Tool: getInformation
   * NO AUTH REQUIRED - Public knowledge base
   */
  const getInformation = tool({
    description: `Retrieve information from the SecureBank knowledge base.
IMPORTANT: You MUST call this tool before answering ANY questions about:
- Bank policies (overdraft, fees, interest rates, etc.)
- Products and services (account types, loans, credit cards)
- Procedures (how to open account, transfer limits, etc.)
- FAQs and general banking information
- Branch hours and services

If the initial search doesn't return relevant results, try:
1. Rephrasing the query with different keywords
2. Using a more specific or broader search term
3. Searching for related concepts

Only respond with "I don't have information about that" if multiple search attempts return no relevant results.`,
    parameters: z.object({
      query: z.string().describe('The search query to find relevant information.'),
    }),
    execute: async ({ query }: { query: string }) => {
      try {
        console.log('[Agentic RAG] getInformation called with:', { query });

        if (!query || typeof query !== 'string') {
          return {
            success: false,
            message: 'Invalid query provided.',
            information: null,
          };
        }

        const documents = await knowledgeRetriever.retrieve(query, {
          topK: 4,
          threshold: 0.5,
        });

        console.log('[Agentic RAG] Retrieved documents:', {
          count: documents.length,
          queries: query,
          topScores: documents.slice(0, 3).map(d => d.similarity)
        });

        if (documents.length === 0) {
          return {
            success: false,
            message: 'No relevant information found for this query. Try rephrasing or searching for related terms.',
            information: null,
            suggestion: 'Try a different search query or ask about a related topic.',
          };
        }

        const information = documents.map((doc, index) => ({
          relevanceRank: index + 1,
          content: doc.content,
          source: doc.metadata?.source || 'Knowledge Base',
          category: doc.metadata?.category || 'general',
          similarityScore: doc.similarity?.toFixed(3) || 'N/A',
        }));

        return {
          success: true,
          message: `Found ${documents.length} relevant document(s).`,
          information,
          totalResults: documents.length,
        };
      } catch (error) {
        console.error('[Agentic RAG] Knowledge search error:', error);
        return {
          success: false,
          message: 'Error searching knowledge base. Please try again.',
          information: null,
        };
      }
    },
  });


  /**
   * Tool for card management operations
   * AUTH REQUIRED - Personal account action
   */
  const cardManagement = tool({
    description: 'Manage credit or debit cards: freeze, unfreeze, report lost/stolen, or order replacement. Requires user to be signed in.',
    parameters: z.object({
      action: z.enum(['freeze', 'unfreeze', 'report_lost', 'order_replacement']).describe('The action to perform on the card'),
      cardLast4: z.string().optional().describe('Last 4 digits of the card (if provided)'),
      reason: z.string().optional().describe('Reason for the action'),
    }),
    execute: async ({ action, cardLast4, reason }: { action: 'freeze' | 'unfreeze' | 'report_lost' | 'order_replacement'; cardLast4?: string; reason?: string }) => {
      // Check authentication
      if (!userId) {
        return {
          success: false,
          requiresAuth: true,
          message: 'Please sign in to manage your cards.',
        };
      }

      try {
        // Find the user's card
        let query = supabase
          .from('demo_cards')
          .select('*')
          .eq('user_id', userId);

        if (cardLast4) {
          query = query.eq('last_four', cardLast4);
        }

        const { data: cards, error: cardError } = await query;

        if (cardError || !cards || cards.length === 0) {
          return {
            success: false,
            message: cardLast4
              ? `No card found ending in ${cardLast4}.`
              : 'No cards found on your account.',
          };
        }

        const card = cards[0];

        // Determine new status based on action
        let newStatus: string;
        switch (action) {
          case 'freeze':
            newStatus = 'frozen';
            break;
          case 'unfreeze':
            newStatus = 'active';
            break;
          case 'report_lost':
            newStatus = 'lost';
            break;
          default:
            newStatus = card.status;
        }

        // Update card status in database
        if (action !== 'order_replacement') {
          await supabase
            .from('demo_cards')
            .update({ status: newStatus, updated_at: new Date().toISOString() })
            .eq('id', card.id);
        }

        const actionMessages = {
          freeze: `Your ${card.card_name} ending in **${card.last_four}** has been successfully frozen. No transactions can be made with this card until you unfreeze it.`,
          unfreeze: `Your ${card.card_name} ending in **${card.last_four}** has been successfully unfrozen. You can now use it for transactions.`,
          report_lost: `Your ${card.card_name} ending in **${card.last_four}** has been reported as lost/stolen and frozen for your security. A replacement card will be ordered automatically.`,
          order_replacement: `A replacement for your ${card.card_name} has been ordered and will arrive in 5-7 business days at your registered address.`,
        };

        return {
          success: true,
          message: actionMessages[action],
          action,
          cardName: card.card_name,
          cardLast4: card.last_four,
          newStatus,
          timestamp: new Date().toISOString(),
        };
      } catch (error) {
        console.error('Error managing card:', error);
        return {
          success: false,
          message: 'Error processing card request. Please try again.',
        };
      }
    },
  });

  /**
   * Tool for finding branch locations
   * NO AUTH REQUIRED - Public information
   */
  const findLocation = tool({
    description: 'Find nearby bank branches or ATMs based on location. No sign-in required.',
    parameters: z.object({
      locationType: z.enum(['branch', 'atm']).describe('Type of location to find'),
      zipCode: z.string().optional().describe('ZIP code to search near'),
      city: z.string().optional().describe('City name to search in'),
      limit: z.number().optional().default(3).describe('Maximum number of results'),
    }),
    execute: async ({ locationType, zipCode, city, limit = 3 }: { locationType: 'branch' | 'atm'; zipCode?: string; city?: string; limit?: number }) => {
      // Mock implementation - no auth required
      const mockLocations = [
        {
          id: '1',
          name: 'SecureBank Main Branch',
          address: '123 Main Street',
          city: city || 'Downtown',
          state: 'NY',
          zipCode: zipCode || '10001',
          phone: '(555) 123-4567',
          hours: {
            'Monday-Friday': '9:00 AM - 5:00 PM',
            Saturday: '9:00 AM - 1:00 PM',
            Sunday: 'Closed',
          },
          services: ['Full Service', 'ATM', 'Safe Deposit Boxes', 'Notary Service'],
          distance: 0.5,
        },
        {
          id: '2',
          name: 'SecureBank East Branch',
          address: '456 East Avenue',
          city: city || 'Eastside',
          state: 'NY',
          zipCode: zipCode || '10002',
          phone: '(555) 234-5678',
          hours: {
            'Monday-Friday': '9:00 AM - 5:00 PM',
            Saturday: '9:00 AM - 12:00 PM',
            Sunday: 'Closed',
          },
          services: ['Full Service', 'ATM', 'Drive-through'],
          distance: 1.2,
        },
        {
          id: '3',
          name: 'SecureBank West Branch',
          address: '789 West Boulevard',
          city: city || 'Westside',
          state: 'NY',
          zipCode: zipCode || '10003',
          phone: '(555) 345-6789',
          hours: {
            'Monday-Friday': '9:00 AM - 6:00 PM',
            Saturday: '10:00 AM - 2:00 PM',
            Sunday: 'Closed',
          },
          services: ['Full Service', 'ATM', 'Business Banking'],
          distance: 2.1,
        },
      ];

      const results = mockLocations.slice(0, limit);

      return {
        success: true,
        locationType,
        count: results.length,
        locations: results,
        searchCriteria: { zipCode, city },
      };
    },
  });

  /**
   * Tool for initiating human agent handoff
   * NO AUTH REQUIRED - Anyone can request help
   */
  const requestHumanAgent = tool({
    description: 'Request to transfer the conversation to a human agent. Use when the user explicitly asks to speak with someone, or when the issue is too complex.',
    parameters: z.object({
      reason: z.string().describe('Brief reason why human agent is needed'),
      priority: z.enum(['low', 'medium', 'high', 'urgent']).optional().default('medium').describe('Priority level'),
    }),
    execute: async ({ reason, priority = 'medium' }: { reason: string; priority?: 'low' | 'medium' | 'high' | 'urgent' }) => {
      const queuePosition = Math.floor(Math.random() * 5) + 1;
      const estimatedWaitMinutes = queuePosition * 3;

      return {
        success: true,
        handoffInitiated: true,
        queuePosition,
        estimatedWaitMinutes,
        priority,
        reason,
        isAuthenticated: !!userId,
        message: `I'm connecting you with one of our agents. Your position in queue is ${queuePosition}. Estimated wait time: ${estimatedWaitMinutes} minutes.`,
      };
    },
  });

  return {
    // Public tools (no auth required)
    getInformation,
    findLocation,
    requestHumanAgent,

    // Protected tools (auth required)
    cardManagement,
  };
}

// For backward compatibility - export a default instance with null userId
export const bankingTools = createBankingTools(null);
