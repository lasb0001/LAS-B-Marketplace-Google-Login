import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing VITE_SUPABASE_URL or VITE_SUPABASE_PUBLISHABLE_KEY');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

const ADMIN_EMAILS = ['bolajilasisi13@gmail.com', 'lasisibolaji15@gmail.com'];

function makeError(message: string, status = 400) {
  const e = new Error(message) as Error & {
    response?: { data: { error: string }; status: number };
  };
  e.response = { data: { error: message }, status };
  return e;
}

async function currentUser() {
  const { data, error } = await supabase.auth.getUser();
  if (error) throw makeError(error.message, 401);
  if (!data.user) throw makeError('Please sign in first.', 401);
  return data.user;
}

function isAdmin(email?: string | null) {
  return !!email && ADMIN_EMAILS.includes(email.toLowerCase());
}

async function ensureProfile() {
  const user = await currentUser();

  const { data: existing, error: readError } = await supabase
    .from('profiles')
    .select('id')
    .eq('id', user.id)
    .maybeSingle();

  if (readError) throw makeError(readError.message);

  if (!existing) {
    const { error } = await supabase.from('profiles').insert({
      id: user.id,
      email: user.email || '',
      full_name:
        user.user_metadata?.full_name ||
        user.email?.split('@')[0] ||
        'Customer',
    });

    if (error && !error.message.toLowerCase().includes('duplicate')) {
      throw makeError(error.message);
    }
  }

  // Make sure a wallet exists for the user.
  const { data: wallet, error: walletReadError } = await supabase
    .from('wallets')
    .select('user_id')
    .eq('user_id', user.id)
    .maybeSingle();

  if (walletReadError) throw makeError(walletReadError.message);

  if (!wallet) {
    const { error } = await supabase.from('wallets').insert({
      user_id: user.id,
      balance: 0,
      total_deposits: 0,
      referral_balance: 0,
    });

    if (error && !error.message.toLowerCase().includes('duplicate')) {
      throw makeError(error.message);
    }
  }

  return user;
}

function mapDeposit(d: any) {
  return {
    id: d.id,
    userId: d.user_id,
    customerName: d.profiles?.full_name || d.customer_name || '',
    customerEmail: d.profiles?.email || d.customer_email || '',
    amount: Number(d.amount || 0),
    method: d.payment_method || 'Bank Transfer - Naira',
    status: d.status,
    createdAt: d.created_at,
    bankDetails: {
      bankName: 'Moniepoint MFB',
      accountName: 'Bolaji Opemiposi Lasisi',
      accountNumber: '5293467308',
    },
    transferConfirmedAt: d.confirmed_at,
    confirmedAt: d.confirmed_at,
    processedAt: d.processed_at,
    adminNote: d.admin_note,
    transferConfirmed: !!d.transfer_confirmed,
  };
}

function mapOrder(o: any) {
  return {
    id: o.id,
    userId: o.user_id,
    customerName: o.customer_name,
    customerEmail: o.customer_email,
    product: o.service_name || o.product,
    details: o.description || o.details || '',
    status: o.status,
    createdAt: o.created_at,
    chargedAmount: Number(o.amount ?? o.charged_amount ?? 0),
    amount: Number(o.amount ?? o.charged_amount ?? 0),
    socialPlatform: o.social_platform,
    socialService: o.social_service,
    quantity: o.quantity,
    refundedAt: o.refunded_at,
  };
}

async function getBalance(userId: string) {
  const { data, error } = await supabase
    .from('wallets')
    .select('balance')
    .eq('user_id', userId)
    .maybeSingle();

  if (error) throw makeError(error.message);
  return Number(data?.balance || 0);
}

export const auth = {
  async getUser() {
    const { data } = await supabase.auth.getUser();
    if (!data.user) return null;

    return {
      userId: data.user.id,
      email: data.user.email || undefined,
      name:
        data.user.user_metadata?.full_name ||
        data.user.email?.split('@')[0] ||
        'Customer',
    };
  },

  async signIn(email: string, password: string) {
    const cleanEmail = email.trim().toLowerCase();

    if (!cleanEmail || !password) {
      throw makeError('Enter your email and password.');
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email: cleanEmail,
      password,
    });

    if (error) throw makeError(error.message, 401);
    if (!data.user || !data.session) {
      throw makeError('Could not create a signed-in session.', 401);
    }

    await ensureProfile();

    return {
      user: {
        userId: data.user.id,
        email: data.user.email || undefined,
        name:
          data.user.user_metadata?.full_name ||
          data.user.email?.split('@')[0] ||
          'Customer',
      },
      accessToken: data.session.access_token,
      expiresIn: 3600,
    };
  },

  async signUp(email: string, password: string, fullName: string) {
    const cleanEmail = email.trim().toLowerCase();
    const name = fullName.trim() || cleanEmail.split('@')[0] || 'Customer';

    if (!cleanEmail || !password) {
      throw makeError('Enter your email and password.');
    }

    if (password.length < 8) {
      throw makeError('Password must be at least 8 characters.');
    }

    const { data, error } = await supabase.auth.signUp({
      email: cleanEmail,
      password,
      options: { data: { full_name: name } },
    });

    if (error) throw makeError(error.message, 400);
    if (!data.user) throw makeError('Could not create the account.', 400);

    if (!data.session) {
      throw makeError(
        'Account created. Check your email to confirm the account, then sign in.',
        403
      );
    }

    await ensureProfile();

    return {
      user: {
        userId: data.user.id,
        email: data.user.email || undefined,
        name: data.user.user_metadata?.full_name || name,
      },
      accessToken: data.session.access_token,
      expiresIn: 3600,
    };
  },

  async signInWithGoogle() {
    const redirectTo = `${window.location.origin}/`;
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo },
    });

    if (error) throw makeError(error.message, 400);
    return data;
  },

  async signOut() {
    await supabase.auth.signOut();
  },
};

export const api = {
  async get(url: string) {
  const user = await currentUser();

  if (url === '/api/wallet') {
    await ensureProfile();
    return { data: { balance: await getBalance(user.id) } };
  }

  if (url === '/api/deposits') {
    const { data, error } = await supabase
      .from('deposits')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(200);

    if (error) throw makeError(error.message);

    return {
      data: {
        deposits: (data || []).map(mapDeposit),
      },
    };
  }

  if (url === '/api/orders') {
  const amount = Number(body.amount);

  if (!Number.isFinite(amount) || amount <= 0) {
    throw makeError('Invalid order amount.');
  }

  const balance = await getBalance(user.id);

  if (amount > balance) {
    throw makeError('Insufficient balance.', 402);
  }

  const { data: order, error: orderError } = await supabase
    .from('orders')
    .insert({
      user_id: user.id,
      service_name: body.product || 'Marketplace Order',
      description: body.details || '',
      amount,
      status: 'Pending',
      refunded: false,
    })
    .select('*')
    .single();

  if (orderError) {
    throw makeError(orderError.message);
  }

  if (!order) {
    throw makeError('Order was created but could not be read back.');
  }

  const newBalance = balance - amount;

  const { error: walletError } = await supabase
    .from('wallets')
    .update({
      balance: newBalance,
      updated_at: new Date().toISOString(),
    })
    .eq('user_id', user.id);

  if (walletError) {
    // Roll back the order if the wallet could not be charged.
    await supabase
      .from('orders')
      .delete()
      .eq('id', order.id);

    throw makeError(walletError.message);
  }

  return {
    data: {
      id: order.id,
      status: order.status,
      chargedAmount: amount,
      balance: newBalance,
    },
  };
            }

  if (url === '/api/admin/deposits') {
    if (!isAdmin(user.email)) {
      throw makeError('Admin access required', 403);
    }

    const { data, error } = await supabase
      .from('deposits')
      .select('*, profiles(full_name,email)')
      .order('created_at', { ascending: false })
      .limit(200);

    if (error) throw makeError(error.message);

    return {
      data: {
        deposits: (data || []).map(mapDeposit),
      },
    };
  }

  throw makeError(`Unknown GET route: ${url}`, 404);
},

  async post(url: string, body: any = {}) {
    const user = await currentUser();

    if (url === '/api/deposits') {
      const amount = Number(body.amount);

      if (!Number.isFinite(amount) || amount <= 0) {
        throw makeError('Enter a valid deposit amount.');
      }

      const { data, error } = await supabase
        .from('deposits')
        .insert({
          user_id: user.id,
          amount,
          payment_method: body.method || 'Bank Transfer - Naira',
          status: 'Pending',
          transfer_confirmed: false,
        })
        .select('*')
.single();

      if (error) throw makeError(error.message);
      return { data: { deposit: mapDeposit(data) } };
    }

    if (url === '/api/orders') {
      const amount = Number(body.amount);

      if (!Number.isFinite(amount) || amount <= 0) {
        throw makeError('Invalid order amount.');
      }

      const balance = await getBalance(user.id);
      if (amount > balance) {
        throw makeError('Insufficient balance.', 402);
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('full_name,email')
        .eq('id', user.id)
        .maybeSingle();

      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert({
          user_id: user.id,
          service_name: body.product || 'Marketplace Order',
          description: body.details || '',
          amount,
          status: 'Pending',
          refunded: false,
        })
        .select('*');

      if (orderError) throw makeError(orderError.message);

      const row = Array.isArray(order) ? order[0] : order;

         if (!row) {
      throw makeError('Order was created but could not be read back.');
}

      const newBalance = balance - amount;

      const { data: newBalance, error: walletError } = await supabase.rpc(
  'admin_add_funds',
  {
    target_user_id: profile.id,
    amount_to_add: amount,
  }
);

if (walletError) {
  throw makeError(walletError.message);
}

return {
  data: {
    balance: Number(newBalance),
  },
};
    }

    if (url === '/api/admin/funds') {
      if (!isAdmin(user.email)) {
        throw makeError('Admin access required', 403);
      }

      const email = String(body.email || '').trim().toLowerCase();
      const amount = Number(body.amount);

      if (!email || !Number.isFinite(amount) || amount <= 0) {
        throw makeError('Enter a valid customer email and amount.');
      }

      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('id')
        .eq('email', email)
        .maybeSingle();

      if (profileError) throw makeError(profileError.message);
      if (!profile) throw makeError('Customer account not found.');

      const currentBalance = await getBalance(profile.id);
      const newBalance = currentBalance + amount;

      const { data: updatedWallet, error: walletError } = await supabase
  .from('wallets')
  .upsert(
    {
      user_id: profile.id,
      balance: newBalance,
      updated_at: new Date().toISOString(),
    },
    {
      onConflict: 'user_id',
    }
  )
  .select('user_id, balance')
  .single();

if (walletError) {
  throw makeError(walletError.message);
}

if (!updatedWallet) {
  throw makeError('Customer wallet could not be created or updated.');
}

return {
  data: {
    balance: Number(updatedWallet.balance),
  },
};
    }

    throw makeError(`Unknown POST route: ${url}`, 404);
  },

  async put(url: string, body: any = {}) {
    const user = await currentUser();

    const confirmMatch = url.match(/^\/api\/deposits\/([^/]+)\/confirm-transfer$/);

    if (confirmMatch) {
      const depositId = confirmMatch[1];

      const { data, error } = await supabase
        .from('deposits')
        .update({
          transfer_confirmed: true,
          status: 'Pending',
        })
        .eq('id', depositId)
        .eq('user_id', user.id)
        .select('*');

      if (error) throw makeError(error.message);
      return { data: { deposit: mapDeposit(data) } };
    }

    const approveMatch = url.match(/^\/api\/admin\/deposits\/([^/]+)\/approve$/);

if (approveMatch) {
  if (!isAdmin(user.email)) {
    throw makeError('Admin access required', 403);
  }

  const depositId = approveMatch[1];

  const { data, error } = await supabase.rpc(
    'admin_approve_deposit_live',
    { p_deposit_id: depositId }
  );

  if (error) throw makeError(error.message);

  return {
    data: {
      ok: true,
      deposit: mapDeposit(data),
    },
  };
}

    const rejectMatch = url.match(/^\/api\/admin\/deposits\/([^/]+)\/reject$/);

    if (rejectMatch) {
      if (!isAdmin(user.email)) {
        throw makeError('Admin access required', 403);
      }

      const depositId = rejectMatch[1];

      const { data, error } = await supabase
        .from('deposits')
        .update({
          status: 'Rejected',
          admin_note: body.note || null,
          processed_at: new Date().toISOString(),
        })
        .eq('id', depositId)
        .select('*');

      if (error) throw makeError(error.message);
      return { data: { ok: true, deposit: mapDeposit(data) } };
    }

    const orderMatch = url.match(/^\/api\/admin\/orders\/([^/]+)$/);

    if (orderMatch) {
      if (!isAdmin(user.email)) {
        throw makeError('Admin access required', 403);
      }

      const { data, error } = await supabase
        .from('orders')
        .update({ status: body.status || 'Pending' })
        .eq('id', orderMatch[1])
        .select('*');

      if (error) throw makeError(error.message);
      return { data: { ok: true, order: mapOrder(data) } };
    }

    throw makeError(`Unknown PUT route: ${url}`, 404);
  },
};
