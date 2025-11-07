import { Intent, IntentPattern } from '@/types';

/**
 * Intent patterns for pattern-based classification
 */
export const INTENT_PATTERNS: IntentPattern[] = [
  // Card Lost - Highest priority
  {
    intent: Intent.CARD_LOST,
    patterns: [
      /lost.*card/i,
      /card.*lost/i,
      /card.*stolen/i,
      /stolen.*card/i,
      /missing.*card/i,
      /can'?t find.*card/i,
      /cannot find.*card/i,
      /lost.*debit/i,
      /lost.*credit/i,
    ],
    priority: 1,
  },

  // Card Management
  {
    intent: Intent.CARD_MANAGEMENT,
    patterns: [
      /freeze.*card/i,
      /block.*card/i,
      /unfreeze.*card/i,
      /unblock.*card/i,
      /activate.*card/i,
      /card.*activation/i,
      /disable.*card/i,
      /enable.*card/i,
      /lock.*card/i,
      /unlock.*card/i,
    ],
    priority: 2,
  },

  // Balance Inquiry
  {
    intent: Intent.BALANCE_INQUIRY,
    patterns: [
      /check.*balance/i,
      /account.*balance/i,
      /balance.*check/i,
      /how much.*account/i,
      /how much.*have/i,
      /what'?s.*balance/i,
      /show.*balance/i,
      /view.*balance/i,
      /current.*balance/i,
      /available.*balance/i,
    ],
    priority: 2,
  },

  // Transaction Inquiry
  {
    intent: Intent.TRANSACTION_INQUIRY,
    patterns: [
      /transaction/i,
      /recent.*activity/i,
      /account.*activity/i,
      /transaction.*history/i,
      /recent.*transactions/i,
      /view.*transactions/i,
      /statement/i,
      /purchase.*history/i,
      /payment.*history/i,
    ],
    priority: 3,
  },

  // Branch Locator
  {
    intent: Intent.BRANCH_LOCATOR,
    patterns: [
      /find.*branch/i,
      /branch.*near/i,
      /branch.*location/i,
      /nearest.*branch/i,
      /branch.*hours/i,
      /find.*atm/i,
      /atm.*near/i,
      /nearest.*atm/i,
      /branch.*address/i,
      /where.*branch/i,
    ],
    priority: 3,
  },

  // Human Handoff
  {
    intent: Intent.HUMAN_HANDOFF,
    patterns: [
      /speak.*agent/i,
      /talk.*agent/i,
      /human.*agent/i,
      /speak.*person/i,
      /talk.*person/i,
      /speak.*representative/i,
      /customer.*service/i,
      /talk.*someone/i,
      /speak.*someone/i,
      /real.*person/i,
      /live.*agent/i,
    ],
    priority: 1,
  },

  // FAQ - General questions
  {
    intent: Intent.FAQ,
    patterns: [
      /what.*is/i,
      /how.*do/i,
      /how.*can/i,
      /tell.*me.*about/i,
      /explain/i,
      /information.*about/i,
      /details.*about/i,
    ],
    priority: 5,
  },
];

/**
 * Keywords that indicate high-priority situations
 */
export const URGENT_KEYWORDS = [
  'urgent',
  'emergency',
  'fraud',
  'fraudulent',
  'stolen',
  'unauthorized',
  'help',
  'immediately',
  'asap',
  'scam',
  'hacked',
];

/**
 * Keywords that indicate positive sentiment
 */
export const POSITIVE_KEYWORDS = [
  'thank',
  'thanks',
  'great',
  'excellent',
  'perfect',
  'appreciate',
  'helpful',
  'good',
];

/**
 * Keywords that indicate negative sentiment
 */
export const NEGATIVE_KEYWORDS = [
  'frustrated',
  'angry',
  'upset',
  'terrible',
  'awful',
  'horrible',
  'useless',
  'disappointed',
  'ridiculous',
];
