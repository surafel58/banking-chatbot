import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';
import { createClient } from '@supabase/supabase-js';
import { headers } from 'next/headers';

// Generate random account number (last 4 digits)
function generateAccountNumber(): string {
  return Math.floor(1000 + Math.random() * 9000).toString();
}

// Generate random card last 4
function generateCardLast4(): string {
  return Math.floor(1000 + Math.random() * 9000).toString();
}

// Generate expiry month and year
function generateExpiry(): { month: number; year: number } {
  const now = new Date();
  const futureYear = now.getFullYear() + Math.floor(Math.random() * 3) + 2; // 2-4 years from now
  const month = Math.floor(Math.random() * 12) + 1;
  return { month, year: futureYear };
}

// Generate random transactions for an account
function generateTransactions(accountId: string, count: number = 10) {
  const categories = ['Shopping', 'Dining', 'Bills', 'Entertainment', 'Transport', 'Income', 'Transfer'];
  const descriptions: Record<string, string[]> = {
    Shopping: ['Amazon Purchase', 'Walmart', 'Target', 'Best Buy', 'Costco'],
    Dining: ['Starbucks', 'McDonalds', 'Chipotle', 'Local Restaurant', 'DoorDash'],
    Bills: ['Electric Bill', 'Internet Bill', 'Phone Bill', 'Water Bill', 'Insurance'],
    Entertainment: ['Netflix', 'Spotify', 'Movie Theater', 'Concert Tickets', 'Gaming'],
    Transport: ['Gas Station', 'Uber', 'Lyft', 'Parking', 'Metro Card'],
    Income: ['Direct Deposit - Salary', 'Freelance Payment', 'Refund', 'Interest Payment'],
    Transfer: ['Transfer from Savings', 'Transfer to Savings', 'Zelle Payment', 'Wire Transfer'],
  };

  const transactions = [];
  const now = new Date();

  for (let i = 0; i < count; i++) {
    const category = categories[Math.floor(Math.random() * categories.length)];
    const descList = descriptions[category];
    const description = descList[Math.floor(Math.random() * descList.length)];

    const isCredit = category === 'Income' || (category === 'Transfer' && Math.random() > 0.5);
    const amount = isCredit
      ? Math.floor(Math.random() * 3000) + 100
      : -(Math.floor(Math.random() * 200) + 5);

    const daysAgo = Math.floor(Math.random() * 30);
    const transactionDate = new Date(now);
    transactionDate.setDate(transactionDate.getDate() - daysAgo);

    transactions.push({
      account_id: accountId,
      amount: Math.abs(amount),
      description,
      category,
      merchant_name: description,
      type: (isCredit ? 'credit' : 'debit') as 'credit' | 'debit',
      status: (Math.random() > 0.1 ? 'completed' : 'pending') as 'pending' | 'completed' | 'declined',
      created_at: transactionDate.toISOString(),
    });
  }

  return transactions.sort((a, b) =>
    new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );
}

export async function POST(req: Request) {
  try {
    // Get the authorization header
    const headersList = await headers();
    const authorization = headersList.get('authorization');

    if (!authorization?.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Unauthorized - missing token' },
        { status: 401 }
      );
    }

    const token = authorization.substring(7);
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

    // Create a client with the user's token
    const supabaseAuth = createClient(supabaseUrl, supabaseAnonKey, {
      global: {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    });

    // Get the current user from the session
    const { data: { user }, error: userError } = await supabaseAuth.auth.getUser();

    if (userError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Use server client with service role for database operations
    const supabase = createServerClient();

    // Check if user already has accounts (already seeded)
    const { data: existingAccounts } = await supabase
      .from('demo_accounts')
      .select('id')
      .eq('user_id', user.id)
      .limit(1);

    if (existingAccounts && existingAccounts.length > 0) {
      return NextResponse.json({ message: 'Account already seeded' });
    }

    // Create user profile
    await supabase
      .from('user_profiles')
      .upsert({
        id: user.id,
        full_name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'Demo User',
        is_demo_seeded: true,
      });

    // Create demo accounts
    const accounts = [
      {
        user_id: user.id,
        type: 'checking' as const,
        account_number: `****${generateAccountNumber()}`,
        current_balance: 2547.89,
        available_balance: 2147.89,
        pending_amount: 400.00,
        currency: 'USD',
        status: 'active',
      },
      {
        user_id: user.id,
        type: 'savings' as const,
        account_number: `****${generateAccountNumber()}`,
        current_balance: 15420.50,
        available_balance: 15420.50,
        pending_amount: 0,
        currency: 'USD',
        status: 'active',
      },
      {
        user_id: user.id,
        type: 'credit' as const,
        account_number: `****${generateAccountNumber()}`,
        current_balance: 850.25, // Amount owed
        available_balance: 4149.75,
        pending_amount: 0,
        credit_limit: 5000.00,
        currency: 'USD',
        status: 'active',
      },
    ];

    const { data: insertedAccounts, error: accountError } = await supabase
      .from('demo_accounts')
      .insert(accounts)
      .select();

    if (accountError) {
      console.error('Error creating accounts:', accountError);
      return NextResponse.json(
        { error: 'Failed to create accounts' },
        { status: 500 }
      );
    }

    // Generate transactions for checking account
    const checkingAccount = insertedAccounts?.find(a => a.type === 'checking');
    if (checkingAccount) {
      const transactions = generateTransactions(checkingAccount.id, 15);
      await supabase.from('demo_transactions').insert(transactions);
    }

    // Generate some transactions for credit account
    const creditAccount = insertedAccounts?.find(a => a.type === 'credit');
    if (creditAccount) {
      const transactions = generateTransactions(creditAccount.id, 8);
      await supabase.from('demo_transactions').insert(transactions);
    }

    // Create demo cards
    const debitExpiry = generateExpiry();
    const creditExpiry = generateExpiry();

    const cards = [
      {
        user_id: user.id,
        account_id: checkingAccount?.id,
        card_type: 'debit' as const,
        card_name: 'SecureBank Visa Debit',
        last_four: generateCardLast4(),
        expiry_month: debitExpiry.month,
        expiry_year: debitExpiry.year,
        status: 'active' as const,
        daily_limit: 3000,
      },
      {
        user_id: user.id,
        account_id: creditAccount?.id,
        card_type: 'credit' as const,
        card_name: 'SecureBank Platinum Mastercard',
        last_four: generateCardLast4(),
        expiry_month: creditExpiry.month,
        expiry_year: creditExpiry.year,
        status: 'active' as const,
        daily_limit: 5000,
      },
    ];

    await supabase.from('demo_cards').insert(cards);

    return NextResponse.json({
      message: 'Demo account seeded successfully',
      accounts: insertedAccounts?.length || 0,
    });
  } catch (error) {
    console.error('Error seeding account:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
