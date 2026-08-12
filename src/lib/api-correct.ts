import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string;
if (!supabaseUrl || !supabaseAnonKey) throw new Error('Missing VITE_SUPABASE_URL or VITE_SUPABASE_PUBLISHABLE_KEY');
export const supabase = createClient(supabaseUrl, supabaseAnonKey);
const ADMIN_EMAILS = ['bolajilasisi13@gmail.com', 'lasisibolaji15@gmail.com'];
function makeError(message: string, status = 400) { const e = new Error(message) as Error & { response?: { data: { error: string }; status: number } }; e.response = { data: { error: message }, status }; return e; }
async function ensureProfile() { const { error } = await supabase.rpc('lb_ensure_profile'); if (error) throw makeError(error.message); }
export const auth = {
  async getUser() { const { data } = await supabase.auth.getUser(); if (!data.user) return null; return { userId:data.user.id,email:data.user.email||undefined,name:data.user.user_metadata?.full_name||data.user.email?.split('@')[0]||'Customer' }; },
  async signIn() {
    const email = window.prompt('Enter your email address'); if (!email) throw makeError('Sign-in cancelled');
    const password = window.prompt('Enter your password (8+ characters)'); if (!password) throw makeError('Sign-in cancelled');
    let { data, error } = await supabase.auth.signInWithPassword({ email:email.trim(), password });
    if (error) { const create=window.confirm('Account not found or password is incorrect. Create a new account with this email?'); if (!create) throw makeError(error.message,401); const signUp=await supabase.auth.signUp({email:email.trim(),password,options:{data:{full_name:email.trim().split('@')[0]}}}); if(signUp.error) throw makeError(signUp.error.message); if(!signUp.data.session||!signUp.data.user) throw makeError('Account created. Check your email to confirm the account, then sign in again.',403); data=signUp.data; }
    if(!data.user||!data.session) throw makeError('Could not create a signed-in session.',401); await ensureProfile();
    return {user:{userId:data.user.id,email:data.user.email||undefined,name:data.user.user_metadata?.full_name||data.user.email?.split('@')[0]||'Customer'},accessToken:data.session.access_token,expiresIn:3600};
  },
  async signOut(){await supabase.auth.signOut();}
};
async function currentUser(){const {data}=await supabase.auth.getUser();if(!data.user)throw makeError('Please sign in first.',401);return data.user;}
function isAdmin(email?:string|null){return !!email&&ADMIN_EMAILS.includes(email.toLowerCase());}
export const api = {
  async get(url:string){const user=await currentUser();
    if(url==='/api/wallet'){await ensureProfile();const {data,error}=await supabase.from('lb_wallets').select('balance').eq('user_id',user.id).maybeSingle();if(error)throw makeError(error.message);return{data:{balance:Number(data?.balance||0)}};}
    if(url==='/api/deposits'){const {data,error}=await supabase.from('lb_deposits').select('*').eq('user_id',user.id).order('created_at',{ascending:false}).limit(50);if(error)throw makeError(error.message);return{data:{deposits:(data||[]).map(mapDeposit)}};}
    if(url==='/api/orders'){if(isAdmin(user.email)){const {data,error}=await supabase.rpc('lb_admin_list_orders');if(error)throw makeError(error.message);return{data:{orders:(data||[]).map(mapOrder)}};}const {data,error}=await supabase.from('lb_orders').select('*').eq('user_id',user.id).order('created_at',{ascending:false}).limit(200);if(error)throw makeError(error.message);return{data:{orders:(data||[]).map(mapOrder)}};}
    if(url==='/api/admin/deposits'){if(!isAdmin(user.email))throw makeError('Admin access required',403);const {data,error}=await supabase.rpc('lb_admin_list_deposits');if(error)throw makeError(error.message);return{data:{deposits:(data||[]).map(mapDeposit)}};}
    throw makeError(`Unknown GET route: ${url}`,404);
  },
  async post(url:string,body:any={}){const user=await currentUser();
    if(url==='/api/deposits'){const {data,error}=await supabase.rpc('lb_create_deposit',{p_amount:Number(body.amount),p_method:body.method||'Bank Transfer - Naira'});if(error)throw makeError(error.message);return{data:{deposit:mapDeposit(data)}};}
    if(url==='/api/orders'){const {data,error}=await supabase.rpc('lb_create_order',{p_product:body.product,p_details:body.details,p_amount:Number(body.amount),p_social_platform:body.socialPlatform||null,p_social_service:body.socialService||null,p_quantity:Number.isFinite(Number(body.quantity))?Number(body.quantity):null});if(error)throw makeError(error.message,error.message.toLowerCase().includes('insufficient')?402:400);return{data:{id:data.id,status:data.status,chargedAmount:Number(data.charged_amount),balance:await getBalance(user.id)}};}
    if(url==='/api/admin/funds'){if(!isAdmin(user.email))throw makeError('Admin access required',403);const {data,error}=await supabase.rpc('lb_admin_add_funds',{p_email:String(body.email),p_amount:Number(body.amount),p_description:body.description||'Admin wallet funding'});if(error)throw makeError(error.message);return{data:{balance:Number(data||0)}};}
    throw makeError(`Unknown POST route: ${url}`,404);
  },
  async put(url:string,body:any={}){const user=await currentUser();
    const m=url.match(/^\/api\/deposits\/([^/]+)\/confirm-transfer$/);if(m){const {data,error}=await supabase.rpc('lb_confirm_transfer',{p_deposit_id:m[1]});if(error)throw makeError(error.message);return{data:{deposit:mapDeposit(data)}};}
    const a=url.match(/^\/api\/admin\/deposits\/([^/]+)\/approve$/);if(a){if(!isAdmin(user.email))throw makeError('Admin access required',403);const {data,error}=await supabase.rpc('lb_admin_approve_deposit',{p_deposit_id:a[1]});if(error)throw makeError(error.message);return{data:{ok:true,deposit:mapDeposit(data)}};}
    const r=url.match(/^\/api\/admin\/deposits\/([^/]+)\/reject$/);if(r){if(!isAdmin(user.email))throw makeError('Admin access required',403);const {data,error}=await supabase.rpc('lb_admin_reject_deposit',{p_deposit_id:r[1]});if(error)throw makeError(error.message);return{data:{ok:true,deposit:mapDeposit(data)}};}
    const o=url.match(/^\/api\/admin\/orders\/([^/]+)$/);if(o){if(!isAdmin(user.email))throw makeError('Admin access required',403);const {data,error}=await supabase.rpc('lb_admin_update_order',{p_order_id:o[1],p_status:body.status});if(error)throw makeError(error.message);return{data:{ok:true,order:mapOrder(data)}};}
    throw makeError(`Unknown PUT route: ${url}`,404);
  }
};
async function getBalance(userId:string){const {data}=await supabase.from('lb_wallets').select('balance').eq('user_id',userId).maybeSingle();return Number(data?.balance||0);}
function mapDeposit(d:any){return{id:d.id,userId:d.user_id,customerName:d.customer_name,customerEmail:d.customer_email,amount:Number(d.amount),method:d.method,status:d.status,createdAt:d.created_at,bankDetails:d.bank_details,processedAt:d.processed_at,transferConfirmedAt:d.transfer_confirmed_at};}
function mapOrder(o:any){return{id:o.id,userId:o.user_id,customerName:o.customer_name,customerEmail:o.customer_email,product:o.product,details:o.details,status:o.status,createdAt:o.created_at,chargedAmount:Number(o.charged_amount),socialPlatform:o.social_platform,socialService:o.social_service,quantity:o.quantity,refundedAt:o.refunded_at};}
