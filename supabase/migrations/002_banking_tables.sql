-- Banking Simulation Tables
-- These tables simulate a banking backend for demo purposes

-- ============================================================================
-- ACCOUNTS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS demo_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('checking', 'savings', 'credit')),
  account_number TEXT NOT NULL, -- Last 4 digits only for display
  current_balance DECIMAL(12, 2) NOT NULL DEFAULT 0,
  available_balance DECIMAL(12, 2) NOT NULL DEFAULT 0,
  pending_amount DECIMAL(12, 2) NOT NULL DEFAULT 0,
  credit_limit DECIMAL(12, 2), -- Only for credit accounts
  currency TEXT NOT NULL DEFAULT 'USD',
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'frozen', 'closed')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for faster user lookups
CREATE INDEX IF NOT EXISTS idx_demo_accounts_user_id ON demo_accounts(user_id);
CREATE INDEX IF NOT EXISTS idx_demo_accounts_type ON demo_accounts(user_id, type);

-- ============================================================================
-- TRANSACTIONS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS demo_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id UUID NOT NULL REFERENCES demo_accounts(id) ON DELETE CASCADE,
  amount DECIMAL(12, 2) NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'other',
  type TEXT NOT NULL CHECK (type IN ('debit', 'credit')),
  status TEXT NOT NULL DEFAULT 'completed' CHECK (status IN ('pending', 'completed', 'declined', 'refunded')),
  merchant_name TEXT,
  reference_number TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for faster account lookups
CREATE INDEX IF NOT EXISTS idx_demo_transactions_account_id ON demo_transactions(account_id);
CREATE INDEX IF NOT EXISTS idx_demo_transactions_created_at ON demo_transactions(account_id, created_at DESC);

-- ============================================================================
-- CARDS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS demo_cards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  account_id UUID REFERENCES demo_accounts(id) ON DELETE SET NULL,
  card_type TEXT NOT NULL CHECK (card_type IN ('debit', 'credit')),
  card_name TEXT NOT NULL, -- e.g., "Visa Platinum", "Mastercard Gold"
  last_four TEXT NOT NULL,
  expiry_month INTEGER NOT NULL,
  expiry_year INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'frozen', 'lost', 'expired', 'cancelled')),
  daily_limit DECIMAL(12, 2) DEFAULT 5000,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for faster user lookups
CREATE INDEX IF NOT EXISTS idx_demo_cards_user_id ON demo_cards(user_id);

-- ============================================================================
-- USER PROFILES TABLE (extends auth.users)
-- ============================================================================
CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  phone TEXT,
  address TEXT,
  city TEXT,
  state TEXT,
  zip_code TEXT,
  date_of_birth DATE,
  is_demo_seeded BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE demo_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE demo_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE demo_cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- Accounts: Users can only see their own accounts
CREATE POLICY "Users can view own accounts"
  ON demo_accounts FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own accounts"
  ON demo_accounts FOR UPDATE
  USING (auth.uid() = user_id);

-- Transactions: Users can only see transactions for their accounts
CREATE POLICY "Users can view own transactions"
  ON demo_transactions FOR SELECT
  USING (
    account_id IN (
      SELECT id FROM demo_accounts WHERE user_id = auth.uid()
    )
  );

-- Cards: Users can only see and update their own cards
CREATE POLICY "Users can view own cards"
  ON demo_cards FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own cards"
  ON demo_cards FOR UPDATE
  USING (auth.uid() = user_id);

-- User Profiles: Users can only see and update their own profile
CREATE POLICY "Users can view own profile"
  ON user_profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON user_profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON user_profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- ============================================================================
-- SERVICE ROLE POLICIES (for backend operations)
-- ============================================================================

-- Allow service role to insert accounts (for seeding)
CREATE POLICY "Service role can insert accounts"
  ON demo_accounts FOR INSERT
  WITH CHECK (true);

-- Allow service role to insert transactions (for seeding)
CREATE POLICY "Service role can insert transactions"
  ON demo_transactions FOR INSERT
  WITH CHECK (true);

-- Allow service role to insert cards (for seeding)
CREATE POLICY "Service role can insert cards"
  ON demo_cards FOR INSERT
  WITH CHECK (true);

-- ============================================================================
-- UPDATED_AT TRIGGER
-- ============================================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_demo_accounts_updated_at
  BEFORE UPDATE ON demo_accounts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_demo_cards_updated_at
  BEFORE UPDATE ON demo_cards
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_profiles_updated_at
  BEFORE UPDATE ON user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
