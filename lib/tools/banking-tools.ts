import { tool } from 'ai';
import { z } from 'zod';
import { knowledgeRetriever } from '../rag/retriever';

/**
 * Tool for searching the knowledge base
 */
export const searchKnowledgeBase = tool({
  description:
    'Search the banking knowledge base for policies, products, FAQs, and procedures. Use this when the user asks general banking questions or needs information about bank services, policies, or products. ALWAYS provide the user\'s question or key terms as the query parameter.',
  inputSchema: z.object({
    query: z.string().describe('The user\'s question or search terms to find relevant information. REQUIRED. Example: "branch hours", "overdraft policy", "account types"'),
    category: z
      .enum(['policy', 'product', 'faq', 'procedure'])
      .optional()
      .describe('Optional category to narrow the search'),
  }),
  execute: async ({ query, category }) => {
    try {
      console.log('searchKnowledgeBase called with:', { query, category, queryType: typeof query });

      if (!query || typeof query !== 'string') {
        return {
          success: false,
          message: 'Invalid query provided.',
        };
      }

      const documents = await knowledgeRetriever.retrieve(query, {
        categoryFilter: category,
        topK: 3,
        threshold: 0.6,
      });

      console.log('Retrieved documents:', { count: documents.length, documents });

      if (documents.length === 0) {
        console.log('No documents found, returning failure');
        return {
          success: false,
          message: 'No relevant information found in the knowledge base.',
        };
      }

      const context = knowledgeRetriever.formatContext(documents);
      console.log('Tool returning context:', { success: true, contextLength: context.length, sourceCount: documents.length });

      return {
        success: true,
        context,
        sourceCount: documents.length,
      };
    } catch (error) {
      console.error('Knowledge search error:', error);
      return {
        success: false,
        message: 'Error searching knowledge base.',
      };
    }
  },
});

/**
 * Tool for card management operations
 */
export const cardManagement = tool({
  description:
    'Manage credit or debit cards: freeze, unfreeze, report lost/stolen, or order replacement. Use this when users need to take action on their cards.',
  inputSchema: z.object({
    action: z
      .enum(['freeze', 'unfreeze', 'report_lost', 'order_replacement'])
      .describe('The action to perform on the card'),
    cardLast4: z
      .string()
      .optional()
      .describe('Last 4 digits of the card (if provided)'),
    reason: z.string().optional().describe('Reason for the action'),
  }),
  execute: async ({ action, cardLast4, reason }) => {
    // This is a mock implementation - in production, this would call actual banking APIs
    const actionMessages = {
      freeze: `Card ${cardLast4 ? `ending in **${cardLast4}` : ''} has been successfully frozen. No transactions can be made with this card until you unfreeze it.`,
      unfreeze: `Card ${cardLast4 ? `ending in **${cardLast4}` : ''} has been successfully unfrozen. You can now use it for transactions.`,
      report_lost: `Card ${cardLast4 ? `ending in **${cardLast4}` : ''} has been reported as lost/stolen and frozen for your security. A replacement card will be ordered automatically.`,
      order_replacement: `A replacement card has been ordered and will arrive in 5-7 business days at your registered address.`,
    };

    return {
      success: true,
      message: actionMessages[action],
      action,
      cardLast4,
      timestamp: new Date().toISOString(),
    };
  },
});

/**
 * Tool for checking account balance
 */
export const checkBalance = tool({
  description:
    'Check the balance of checking, savings, or credit card accounts. Requires user authentication.',
  inputSchema: z.object({
    accountType: z
      .enum(['checking', 'savings', 'credit'])
      .describe('Type of account to check'),
  }),
  execute: async ({ accountType }) => {
    // Mock implementation - would connect to actual banking system
    const mockBalances = {
      checking: {
        currentBalance: 2547.89,
        availableBalance: 2147.89,
        pending: 400.0,
        currency: 'USD',
      },
      savings: {
        currentBalance: 15420.5,
        availableBalance: 15420.5,
        pending: 0,
        currency: 'USD',
      },
      credit: {
        currentBalance: -850.25,
        availableBalance: 4149.75,
        pending: 0,
        currency: 'USD',
        creditLimit: 5000.0,
      },
    };

    const balance = mockBalances[accountType];

    return {
      success: true,
      accountType,
      ...balance,
      timestamp: new Date().toISOString(),
    };
  },
});

/**
 * Tool for finding branch locations
 */
export const findLocation = tool({
  description:
    'Find nearby bank branches or ATMs based on location. Use when users want to find physical banking locations.',
  inputSchema: z.object({
    locationType: z
      .enum(['branch', 'atm'])
      .describe('Type of location to find'),
    zipCode: z
      .string()
      .optional()
      .describe('ZIP code to search near (if provided)'),
    city: z.string().optional().describe('City name to search in'),
    limit: z
      .number()
      .optional()
      .default(3)
      .describe('Maximum number of results to return'),
  }),
  execute: async ({ locationType, zipCode, city, limit = 3 }) => {
    // Mock implementation - would connect to actual location database
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
        services: [
          'Full Service',
          'ATM',
          'Safe Deposit Boxes',
          'Notary Service',
        ],
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
 * Tool for viewing recent transactions
 */
export const viewTransactions = tool({
  description:
    'View recent transactions for an account. Shows the last few transactions with details.',
  inputSchema: z.object({
    accountType: z
      .enum(['checking', 'savings', 'credit'])
      .describe('Type of account to view transactions for'),
    limit: z
      .number()
      .optional()
      .default(5)
      .describe('Number of recent transactions to show'),
  }),
  execute: async ({ accountType, limit = 5 }) => {
    // Mock implementation
    const mockTransactions = [
      {
        id: 'tx1',
        date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
        description: 'Grocery Store Purchase',
        amount: -87.43,
        type: 'debit' as const,
        status: 'completed' as const,
        category: 'Shopping',
      },
      {
        id: 'tx2',
        date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        description: 'Direct Deposit - Salary',
        amount: 2500.0,
        type: 'credit' as const,
        status: 'completed' as const,
        category: 'Income',
      },
      {
        id: 'tx3',
        date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
        description: 'Electric Bill Payment',
        amount: -125.67,
        type: 'debit' as const,
        status: 'completed' as const,
        category: 'Bills',
      },
      {
        id: 'tx4',
        date: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
        description: 'Restaurant',
        amount: -45.28,
        type: 'debit' as const,
        status: 'completed' as const,
        category: 'Dining',
      },
      {
        id: 'tx5',
        date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
        description: 'ATM Withdrawal',
        amount: -100.0,
        type: 'debit' as const,
        status: 'completed' as const,
        category: 'Cash',
      },
    ];

    const transactions = mockTransactions.slice(0, limit);

    return {
      success: true,
      accountType,
      transactions,
      count: transactions.length,
    };
  },
});

/**
 * Tool for initiating human agent handoff
 */
export const requestHumanAgent = tool({
  description:
    'Request to transfer the conversation to a human agent. Use when the user explicitly asks to speak with someone, or when the issue is too complex to handle.',
  inputSchema: z.object({
    reason: z
      .string()
      .describe('Brief reason why human agent is needed'),
    priority: z
      .enum(['low', 'medium', 'high', 'urgent'])
      .optional()
      .default('medium')
      .describe('Priority level of the request'),
  }),
  execute: async ({ reason, priority = 'medium' }) => {
    // Mock implementation - would integrate with actual queue system
    const queuePosition = Math.floor(Math.random() * 5) + 1;
    const estimatedWaitMinutes = queuePosition * 3;

    return {
      success: true,
      handoffInitiated: true,
      queuePosition,
      estimatedWaitMinutes,
      priority,
      reason,
      message: `I'm connecting you with one of our agents. Your position in queue is ${queuePosition}. Estimated wait time: ${estimatedWaitMinutes} minutes.`,
    };
  },
});

// Export all tools as an object for easy use in the chat API
export const bankingTools = {
  searchKnowledgeBase,
  cardManagement,
  checkBalance,
  findLocation,
  viewTransactions,
  requestHumanAgent,
};
