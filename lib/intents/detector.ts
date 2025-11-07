import { Intent, IntentResult } from '@/types';
import {
  INTENT_PATTERNS,
  URGENT_KEYWORDS,
  POSITIVE_KEYWORDS,
  NEGATIVE_KEYWORDS,
} from './patterns';

export class IntentDetector {
  /**
   * Detect intent from user message
   */
  async detect(message: string): Promise<IntentResult> {
    // First, try pattern matching (fast and reliable)
    const patternResult = this.detectByPattern(message);

    if (patternResult.confidence >= 0.8) {
      return patternResult;
    }

    // If pattern matching is uncertain, return with lower confidence
    return patternResult;
  }

  /**
   * Detect intent using pattern matching
   */
  private detectByPattern(message: string): IntentResult {
    const normalizedMessage = message.toLowerCase().trim();

    // Sort patterns by priority
    const sortedPatterns = [...INTENT_PATTERNS].sort(
      (a, b) => a.priority - b.priority
    );

    // Check each pattern
    for (const patternGroup of sortedPatterns) {
      for (const pattern of patternGroup.patterns) {
        if (pattern.test(normalizedMessage)) {
          // Extract entities if applicable
          const entities = this.extractEntities(message, patternGroup.intent);

          return {
            type: patternGroup.intent,
            confidence: 0.9,
            entities,
          };
        }
      }
    }

    // No pattern matched
    return {
      type: Intent.UNKNOWN,
      confidence: 0.5,
    };
  }

  /**
   * Extract entities from message based on intent
   */
  private extractEntities(
    message: string,
    intent: Intent
  ): Record<string, any> {
    const entities: Record<string, any> = {};

    // Extract card-related entities
    if (
      intent === Intent.CARD_LOST ||
      intent === Intent.CARD_MANAGEMENT
    ) {
      // Extract card type (credit, debit, etc.)
      const cardTypeMatch = message.match(/\b(credit|debit|atm)\s+card/i);
      if (cardTypeMatch) {
        entities.cardType = cardTypeMatch[1].toLowerCase();
      }

      // Extract last 4 digits if mentioned
      const last4Match = message.match(/\b(\d{4})\b/);
      if (last4Match) {
        entities.cardLast4 = last4Match[1];
      }
    }

    // Extract account type
    if (
      intent === Intent.BALANCE_INQUIRY ||
      intent === Intent.TRANSACTION_INQUIRY
    ) {
      const accountTypeMatch = message.match(/\b(checking|savings|credit)\b/i);
      if (accountTypeMatch) {
        entities.accountType = accountTypeMatch[1].toLowerCase();
      }
    }

    // Extract location information
    if (intent === Intent.BRANCH_LOCATOR) {
      // Extract city or zip code
      const zipMatch = message.match(/\b(\d{5})\b/);
      if (zipMatch) {
        entities.zipCode = zipMatch[1];
      }

      // Look for city names (this is simplified)
      const cityMatch = message.match(/\b(in|near)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)/);
      if (cityMatch) {
        entities.city = cityMatch[2];
      }
    }

    // Check for urgency
    entities.isUrgent = URGENT_KEYWORDS.some((keyword) =>
      message.toLowerCase().includes(keyword)
    );

    return entities;
  }

  /**
   * Analyze sentiment of the message
   */
  analyzeSentiment(message: string): {
    score: number;
    label: 'positive' | 'neutral' | 'negative';
  } {
    const lowerMessage = message.toLowerCase();

    let score = 0;

    // Check positive keywords
    for (const keyword of POSITIVE_KEYWORDS) {
      if (lowerMessage.includes(keyword)) {
        score += 1;
      }
    }

    // Check negative keywords
    for (const keyword of NEGATIVE_KEYWORDS) {
      if (lowerMessage.includes(keyword)) {
        score -= 1;
      }
    }

    // Normalize score to -1 to 1 range
    const normalizedScore = Math.max(-1, Math.min(1, score / 3));

    let label: 'positive' | 'neutral' | 'negative' = 'neutral';
    if (normalizedScore > 0.3) label = 'positive';
    else if (normalizedScore < -0.3) label = 'negative';

    return { score: normalizedScore, label };
  }

  /**
   * Check if message indicates frustration or need for escalation
   */
  shouldEscalate(message: string, attemptCount: number = 1): boolean {
    const sentiment = this.analyzeSentiment(message);

    // Escalate if negative sentiment and multiple attempts
    if (sentiment.label === 'negative' && attemptCount >= 2) {
      return true;
    }

    // Escalate if explicitly asking for human
    const intent = this.detectByPattern(message);
    if (intent.type === Intent.HUMAN_HANDOFF) {
      return true;
    }

    // Escalate if urgent keywords and multiple attempts
    if (intent.entities?.isUrgent && attemptCount >= 2) {
      return true;
    }

    return false;
  }
}

// Export singleton instance
export const intentDetector = new IntentDetector();
