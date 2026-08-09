import { useEffect, useMemo, useState } from 'react';
import { api, auth } from './lib/api';
import { Facebook, Instagram, Linkedin, Mail, Menu, MessageCircle, Shield, Twitter, Youtube, LogIn, LogOut, ChevronDown, ShoppingCart, X, WalletCards, CreditCard, ArrowLeft, CheckCircle2, Home, ClipboardList, ReceiptText, UserRound, FileText, ChevronRight, ChevronUp, Megaphone, Smartphone, Phone } from 'lucide-react';

const ADMIN_EMAILS = ['bolajilasisi13@gmail.com', 'lasisibolaji15@gmail.com'];
const MIN_DEPOSIT = 100;
const MERCHANT_BANK = { bankName: 'Moniepoint MFB', accountName: 'Bolaji Opemiposi Lasisi', accountNumber: '5293467308' };
const categories = ['Facebook Accounts', 'Instagram Accounts', 'TikTok Accounts', 'Twitter (X) Accounts', 'YouTube Accounts', 'Discord Accounts', 'Reddit Accounts', 'Pinterest Accounts', 'Snapchat Accounts', 'LinkedIn Accounts', 'Email Accounts', 'Phone Numbers'];

type Product = { id:string; name:string; stock:number; price:number; description:string };
type Order = { id:string; userId:string; customerName:string; customerEmail:string; product:string; details:string; status:string; createdAt:string };
type Deposit = { id:string; userId:string; customerName:string; customerEmail:string; amount:number; method:string; status:string; createdAt:string; bankDetails?:typeof MERCHANT_BANK; transferConfirmedAt?:string };

/* const productsByCategory: Record<string, Product[]> = {\n  'Facebook Accounts': [\n    {id:'fb-aged',name:'Old Facebook Account',stock:250,price:3500,description:'Age: 2+ Years\\nCountry: Random\\nProfile: Aged\\nPage Creation: Available\\nEmail Access: Included\\nDelivery: Instant'},\n    {id:'fb-page-create',name:'Facebook Account — Can Create Page',stock:180,price:5000,description:'Age: Aged\\nCountry: Random\\nPage Creation: Available\\nProfile: Complete\\nEmail Access: Included\\nDelivery: Instant'},\n    {id:'fb-with-page',name:'Facebook Account — With Page',stock:120,price:7500,description:'Age: Aged\\nCountry: Random\\nPage: Included\\nProfile: Complete\\nEmail Access: Included\\nDelivery: Instant'},\n    {id:'fb-random',name:'Random Country Facebook Account',stock:400,price:2500,description:'Age: Aged\\nCountry: Random\\nProfile: Basic\\nEmail Access: Included\\nDelivery: Instant'}\n  ],\n  'Instagram Accounts': [\n    {id:'ig-aged',name:'Aged Instagram Account',stock:220,price:4000,description:'Age: Aged\\nCountry: Random\\nFollowers: Low/Organic\\nProfile: Active\\nEmail Access: Included\\nDelivery: Instant'},\n    {id:'ig-1k',name:'Instagram Account — 1K+ Followers',stock:160,price:6000,description:'Followers: 1,000+\\nAge: Aged\\nCountry: Random\\nProfile: Active\\nEmail Access: Included\\nDelivery: Instant'},\n    {id:'ig-empty',name:'Empty Instagram Account',stock:300,price:3000,description:'Age: Aged\\nFollowers: 0\\nCountry: Random\\nProfile: Empty\\nEmail Access: Included\\nDelivery: Instant'}\n  ],\n  'TikTok Accounts': [\n    {id:'tt-aged',name:'Old TikTok Account',stock:300,price:4000,description:'Age: Aged\\nCountry: Random\\nFollowers: Low/Organic\\nProfile: Active\\nEmail Access: Included\\nDelivery: Instant'},\n    {id:'tt-1k',name:'TikTok Account — 1K+ Followers',stock:150,price:6000,description:'Followers: 1,000+\\nAge: Aged\\nCountry: Random\\nProfile: Active\\nEmail Access: Included\\nDelivery: Instant'},\n    {id:'tt-5k',name:'TikTok Account — 5K+ Followers',stock:100,price:10000,description:'Followers: 5,000+\\nAge: Aged\\nCountry: Random\\nProfile: Active\\nEmail Access: Included\\nDelivery: Instant'},\n    {id:'tt-10k',name:'TikTok Account — 10K+ Followers',stock:75,price:18000,description:'Followers: 10,000+\\nAge: Aged\\nCountry: Random\\nProfile: Active\\nEmail Access: Included\\nDelivery: Instant'}\n  ],\n  'Twitter (X) Accounts': [{id:'x-aged-empty',name:'Aged Empty Twitter/X Account',stock:275,price:4000,description:'Age: 2+ Years\\nFollowers: 0–50\\nCountry: Random\\nProfile: Aged\\nEmail Access: Included\\nDelivery: Instant'}],\n  'YouTube Accounts': [\n    {id:'yt-channel',name:'YouTube Channel',stock:85,price:15000,description:'Channel: Established\\nCountry: Random\\nContent: Varies\\nAccess: Included\\nDelivery: Instant'},\n    {id:'yt-established',name:'Established YouTube Channel',stock:45,price:25000,description:'Channel: Established\\nAudience: Existing\\nCountry: Random\\nAccess: Included\\nDelivery: Instant'}\n  ],\n  'Discord Accounts': [{id:'discord-aged',name:'Aged Discord Account',stock:200,price:3500,description:'Age: Aged\\nCountry: Random\\nProfile: Active\\nEmail Access: Included\\nDelivery: Instant'}],\n  'Reddit Accounts': [{id:'reddit-aged',name:'Aged Reddit Account',stock:180,price:3000,description:'Age: Aged\\nKarma: Existing\\nCountry: Random\\nEmail Access: Included\\nDelivery: Instant'}],\n  'Pinterest Accounts': [{id:'pinterest-aged',name:'Aged Pinterest Account',stock:160,price:3000,description:'Age: Aged\\nCountry: Random\\nProfile: Active\\nEmail Access: Included\\nDelivery: Instant'}],\n  'Snapchat Accounts': [{id:'snap-aged',name:'Aged Snapchat Account',stock:190,price:3500,description:'Age: Aged\\nCountry: Random\\nProfile: Active\\nEmail Access: Included\\nDelivery: Instant'}],\n  'LinkedIn Accounts': [{id:'linkedin-aged',name:'Aged LinkedIn Account',stock:90,price:5000,description:'Age: Aged\\nCountry: Random\\nProfile: Complete\\nEmail Access: Included\\nDelivery: Instant'}],\n  'Email Accounts': [{id:'email-account',name:'Email Account',stock:500,price:1500,description:'Age: Standard\\nCountry: Random\\nAccess: Included\\nDelivery: Instant'}],\n  'Phone Numbers': [{id:'phone-number',name:'Phone Number Verification',stock:350,price:1500,description:'Type: Verification Number\\nCountry: Random\\nUse: Verification\\nDelivery: Instant'}]\n};

};
*/ const productsByCategory: Record<string, Product[]> = { 'Facebook Accounts': [{id:'fb-aged',name:'Old Facebook Account',stock:250,price:3500,description:'Age: 2+ Years • Country: Random • Profile: Aged • Page Creation: Available • Email Access: Included • Delivery: Instant'},{id:'fb-page-create',name:'Facebook Account — Can Create Page',stock:180,price:5000,description:'Age: Aged • Country: Random • Page Creation: Available • Profile: Complete • Email Access: Included • Delivery: Instant'},{id:'fb-with-page',name:'Facebook Account — With Page',stock:120,price:7500,description:'Age: Aged • Country: Random • Page: Included • Profile: Complete • Email Access: Included • Delivery: Instant'}], 'Instagram Accounts': [{id:'ig-aged',name:'Aged Instagram Account',stock:220,price:4000,description:'Age: Aged • Country: Random • Followers: Low/Organic • Profile: Active • Email Access: Included • Delivery: Instant'},{id:'ig-1k',name:'Instagram Account — 1K+ Followers',stock:160,price:6000,description:'Followers: 1,000+ • Age: Aged • Country: Random • Profile: Active • Email Access: Included • Delivery: Instant'}], 'TikTok Accounts': [{id:'tt-aged',name:'Old TikTok Account',stock:300,price:4000,description:'Age: Aged • Country: Random • Followers: Low/Organic • Profile: Active • Email Access: Included • Delivery: Instant'},{id:'tt-1k',name:'TikTok Account — 1K+ Followers',stock:150,price:6000,description:'Followers: 1,000+ • Age: Aged • Country: Random • Profile: Active • Email Access: Included • Delivery: Instant'},{id:'tt-5k',name:'TikTok Account — 5K+ Followers',stock:100,price:10000,description:'Followers: 5,000+ • Age: Aged • Country: Random • Profile: Active • Email Access: Included • Delivery: Instant'},{id:'tt-10k',name:'TikTok Account — 10K+ Followers',stock:75,price:18000,description:'Followers: 10,000+ • Age: Aged • Country: Random • Profile: Active • Email Access: Included • Delivery: Instant'}], 'Twitter (X) Accounts': [{id:'x-aged-empty',name:'Aged Empty Twitter/X Account',stock:275,price:4000,description:'Age: 2+ Years • Followers: 0–50 • Country: Random • Profile: Aged • Email Access: Included • Delivery: Instant'}], 'YouTube Accounts': [{id:'yt-channel',name:'YouTube Channel',stock:85,price:15000,description:'Channel: Established • Country: Random • Content: Varies • Access: Included • Delivery: Instant'}], 'Discord Accounts': [{id:'discord-aged',name:'Aged Discord Account',stock:200,price:3500,description:'Age: Aged • Country: Random • Profile: Active • Email Access: Included • Delivery: Instant'}], 'Reddit Accounts': [{id:'reddit-aged',name:'Aged Reddit Account',stock:180,price:3000,description:'Age: Aged • Karma: Existing • Country: Random • Email Access: Included • Delivery: Instant'}], 'Pinterest Accounts': [{id:'pinterest-aged',name:'Aged Pinterest Account',stock:160,price:3000,description:'Age: Aged • Country: Random • Profile: Active • Email Access: Included • Delivery: Instant'}], 'Snapchat Accounts': [{id:'snap-aged',name:'Aged Snapchat Account',stock:190,price:3500,description:'Age: Aged • Country: Random • Profile: Active • Email Access: Included • Delivery: Instant'}], 'LinkedIn Accounts': [{id:'linkedin-aged',name:'Aged LinkedIn Account',stock:90,price:5000,description:'Age: Aged • Country: Random • Profile: Complete • Email Access: Included • Delivery: Instant'}], 'Email Accounts': [{id:'email-account',name:'Email Account',stock:500,price:1500,description:'Age: Standard • Country: Random • Access: Included • Delivery: Instant'}], 'Phone Numbers': [{id:'phone-number',name:'Phone Number Verification',stock:350,price:1500,description:'Type: Verification Number • Country: Random • Use: Verification • Delivery: Instant'}] }; const socialIcons = [Facebook, Instagram, Twitter, Youtube, Mail, MessageCircle, Linkedin, Shield];

function App() {
  const [user, setUser] = useState<any>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [deposits, setDeposits] = useState<Deposit[]>([]);
  const [balance, setBalance] = useState(0);
  const [totalDeposits, setTotalDeposits] = useState(0);
  const [view, setView] = useState<'dashboard'|'buySocials'|'buyAccounts'|'phoneVerification'|'orders'|'admin'|'deposit'|'transactions'|'profile'|'privacy'>('dashboard');
  const [category, setCategory] = useState('');
  const [productId, setProductId] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [depositAmount, setDepositAmount] = useState('');
  const [socialPlatform, setSocialPlatform] = useState('');
  const [socialService, setSocialService] = useState('');
  const [socialLink, setSocialLink] = useState('');
  const [socialQuantity, setSocialQuantity] = useState(100);
  const [currentDeposit, setCurrentDeposit] = useState<Deposit | null>(null);
  const [transferConfirmOpen, setTransferConfirmOpen] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'signin'|'signup'>('signin');
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authName, setAuthName] = useState('');
  const [confirmingDeposit, setConfirmingDeposit] = useState<Deposit | null>(null);
  const [adminFundingEmail, setAdminFundingEmail] = useState('');
  const [adminFundingAmount, setAdminFundingAmount] = useState('');
  const [transactions, setTransactions] = useState<Deposit[]>([]);
  const [categoryOpen, setCategoryOpen] = useState(false);
  const [productOpen, setProductOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [placeOrderOpen, setPlaceOrderOpen] = useState(false);
  const [termsOpen, setTermsOpen] = useState(false);
  const [phoneCountry, setPhoneCountry] = useState('');
  const [phoneService, setPhoneService] = useState('');
  const [notice, setNotice] = useState('');
  const [loading, setLoading] = useState(false);
  const isAdmin = !!user?.email && ADMIN_EMAILS.includes(user.email.toLowerCase());
  const categoryProducts = useMemo(() => productsByCategory[category] || [], [category]);
  const selectedProduct = categoryProducts.find(p => p.id === productId);
  const total = selectedProduct ? selectedProduct.price * Math.max(1, quantity) : 0;
  const socialServices: Record<string, {name:string; rate:number; min:number}[]> = {
    Instagram: [{name:'Instagram (Non Drop) — Followers',rate:4500,min:100},{name:'Instagram (Non Drop) — Likes',rate:1000,min:100},{name:'Instagram (Non Drop) — Views',rate:120,min:500}],
    TikTok: [{name:'TikTok (Non Drop) — Followers',rate:6000,min:100},{name:'TikTok (Non Drop) — Likes',rate:1500,min:100},{name:'TikTok (Non Drop) — Views',rate:24,min:500}],
    Facebook: [{name:'Facebook (Non Drop) — Page Followers',rate:5000,min:100},{name:'Facebook (Non Drop) — Post Likes',rate:800,min:100},{name:'Facebook (Non Drop) — Video Views',rate:50,min:500}],
    YouTube: [{name:'YouTube (Non Drop) — Subscribers',rate:25000,min:100},{name:'YouTube (Non Drop) — Views',rate:1500,min:500},{name:'YouTube (Non Drop) — Likes',rate:4500,min:100}],
    Twitter: [{name:'Twitter (Non Drop) — Followers',rate:4500,min:100},{name:'Twitter (Non Drop) — Likes',rate:1500,min:100},{name:'Twitter (Non Drop) — Comments',rate:55000,min:50}],
  };
  const selectedSocialService = (socialServices[socialPlatform] || []).find(s => s.name === socialService);
  const socialTotal = selectedSocialService ? (selectedSocialService.rate * Math.max(selectedSocialService.min, socialQuantity)) / 1000 : 0;
  const phoneServices: Record<string, {name:string; price:number; stock:number}[]> = {
    'United States': [{name:'WhatsApp',price:900,stock:127},{name:'Telegram',price:650,stock:148},{name:'Instagram',price:250,stock:184},{name:'Facebook',price:450,stock:139},{name:'TikTok',price:350,stock:166},{name:'Google',price:500,stock:121}],
    'United Kingdom': [{name:'WhatsApp',price:1000,stock:96},{name:'Telegram',price:700,stock:112},{name:'Instagram',price:300,stock:105},{name:'Facebook',price:500,stock:88},{name:'TikTok',price:400,stock:94},{name:'Google',price:550,stock:81}],
    'Canada': [{name:'WhatsApp',price:950,stock:104},{name:'Telegram',price:680,stock:117},{name:'Instagram',price:280,stock:126},{name:'Facebook',price:480,stock:97},{name:'TikTok',price:380,stock:111}],
    'Germany': [{name:'WhatsApp',price:1100,stock:83},{name:'Telegram',price:750,stock:91},{name:'Instagram',price:320,stock:78},{name:'Facebook',price:550,stock:72},{name:'TikTok',price:450,stock:86}],
    'France': [{name:'WhatsApp',price:1050,stock:79},{name:'Telegram',price:720,stock:93},{name:'Instagram',price:300,stock:82},{name:'Facebook',price:520,stock:75},{name:'TikTok',price:430,stock:89}],
    'Nigeria': [{name:'WhatsApp',price:350,stock:260},{name:'Telegram',price:300,stock:240},{name:'Instagram',price:220,stock:285},{name:'Facebook',price:250,stock:230},{name:'TikTok',price:280,stock:245}],
    'India': [{name:'WhatsApp',price:300,stock:310},{name:'Telegram',price:260,stock:335},{name:'Instagram',price:180,stock:355},{name:'Facebook',price:220,stock:300},{name:'TikTok',price:240,stock:325}],
    'South Africa': [{name:'WhatsApp',price:700,stock:116},{name:'Telegram',price:520,stock:129},{name:'Instagram',price:260,stock:143},{name:'Facebook',price:380,stock:108},{name:'TikTok',price:330,stock:120}],
    'Australia': [{name:'WhatsApp',price:1200,stock:61},{name:'Telegram',price:820,stock:73},{name:'Instagram',price:360,stock:68},{name:'Facebook',price:600,stock:54},{name:'TikTok',price:480,stock:66}],
    'Netherlands': [{name:'WhatsApp',price:1150,stock:67},{name:'Telegram',price:790,stock:78},{name:'Instagram',price:340,stock:71},{name:'Facebook',price:570,stock:62},{name:'TikTok',price:460,stock:69}],
  };
  const selectedPhone = (phoneServices[phoneCountry] || []).find(s => s.name === phoneService);

  useEffect(() => { auth.getUser().then(setUser).catch(() => setUser(null)); }, []);
  useEffect(() => { if (user) { loadOrders(); loadWallet(); loadCustomerDeposits(); if (isAdmin) loadDeposits(); } }, [user, isAdmin]);

  async function loadOrders() { try { const r = await api.get('/api/orders'); setOrders(r.data.orders || []); } catch { setOrders([]); } }
  async function loadWallet() { try { const r = await api.get('/api/wallet'); setBalance(Number(r.data.balance || 0)); } catch { setBalance(0); } }
  async function loadCustomerDeposits() { try { const r = await api.get('/api/deposits'); const list = r.data.deposits || []; setTransactions(list); setTotalDeposits(list.filter((d:Deposit) => d.status === 'Approved').reduce((sum:number, d:Deposit) => sum + Number(d.amount || 0), 0)); const latest = list.find((d:Deposit) => d.status === 'Pending'); setCurrentDeposit(latest || null); } catch { setTransactions([]); setTotalDeposits(0); } }
  async function loadDeposits() { try { const r = await api.get('/api/admin/deposits'); setDeposits(r.data.deposits || []); } catch { setDeposits([]); } }
  async function loadLatestDeposit() { try { const r = await api.get('/api/deposits'); const latest = (r.data.deposits || []).find((d:Deposit) => d.status === 'Pending'); if (latest) setCurrentDeposit(latest); } catch { /* keep the current in-memory state */ } }

  function openAuth(mode:'signin'|'signup'='signin') {
    setAuthMode(mode); setAuthEmail(''); setAuthPassword(''); setAuthName(''); setNotice(''); setAuthOpen(true); setMenuOpen(false);
  }
  async function submitAuth(e?:{preventDefault:()=>void}) {
    e?.preventDefault();
    if (!authEmail.trim() || !authPassword) { setNotice('Enter your email and password.'); return; }
    if (authMode === 'signup' && authPassword.length < 8) { setNotice('Password must be at least 8 characters.'); return; }
    setLoading(true); setNotice('');
    try {
      const result = authMode === 'signin' ? await auth.signIn(authEmail, authPassword) : await auth.signUp(authEmail, authPassword, authName);
      if (result?.user) { setUser(result.user); setAuthOpen(false); setNotice(authMode === 'signin' ? 'Signed in successfully.' : 'Account created successfully.'); }
    } catch (e:any) { setNotice(e?.response?.data?.error || e?.message || (authMode === 'signin' ? 'Sign-in failed.' : 'Account creation failed.')); }
    finally { setLoading(false); }
  }
  async function signIn() { openAuth('signin'); }
  async function signInWithGoogle() {
    setLoading(true); setNotice('');
    try { await auth.signInWithGoogle(); }
    catch (e:any) { setNotice(e?.response?.data?.error || e?.message || 'Google sign-in failed.'); setLoading(false); }
  }

  async function confirmTransfer(deposit: Deposit) {
    setLoading(true); setNotice('');
    try { const r = await api.put(`/api/deposits/${deposit.id}/confirm-transfer`, {}); setCurrentDeposit(r.data.deposit); await loadCustomerDeposits(); setTransferConfirmOpen(false); setConfirmingDeposit(null); setNotice('Transfer confirmation submitted. Your deposit is now marked for admin review.'); }
    catch (e:any) { setNotice(e?.response?.data?.error || 'Could not confirm this transfer.'); }
    finally { setLoading(false); }
  }

  async function adminAddFunds() {
    const email = adminFundingEmail.trim(); const amount = Number(adminFundingAmount);
    if (!email || !Number.isFinite(amount) || amount <= 0) { setNotice('Enter a valid customer email and amount.'); return; }
    setLoading(true); setNotice('');
    try { const r = await api.post('/api/admin/funds', { email, amount, description: 'Admin wallet funding' }); setAdminFundingAmount(''); setNotice(`Funds added successfully. Customer balance is now ₦${Number(r.data.balance || 0).toFixed(2)}.`); }
    catch (e:any) { setNotice(e?.response?.data?.error || 'Could not add funds.'); }
    finally { setLoading(false); }
  }

  function chooseCategory(value:string) { setCategory(value); setProductId(''); setQuantity(1); setCategoryOpen(false); setProductOpen(false); setNotice(''); }
  function chooseProduct(value:string) { setProductId(value); setProductOpen(false); setNotice(''); }
  function chooseSocialPlatform(value:string) { setSocialPlatform(value); setSocialService(''); setSocialQuantity(100); setNotice(''); }
  function chooseSocialService(value:string) { setSocialService(value); const item = (socialServices[socialPlatform] || []).find(s => s.name === value); setSocialQuantity(item?.min || 100); setNotice(''); }
  function choosePhoneCountry(value:string) { setPhoneCountry(value); setPhoneService(''); setNotice(''); }
  function choosePhoneService(value:string) { setPhoneService(value); setNotice(''); }
  async function purchasePhoneNumber() {
    if (!phoneCountry || !selectedPhone) { setNotice('Select a country and service first.'); return; }
    const currentUser = user || await auth.getUser();
    if (!currentUser) { setNotice('Please sign in before purchasing.'); return; }
    if (selectedPhone.stock <= 0) { setNotice('This service is currently out of stock.'); return; }
    if (selectedPhone.price > balance) { setNotice('Insufficient balance. Deposit funds before purchasing.'); return; }
    setLoading(true); setNotice('');
    try {
      const details = `Country: ${phoneCountry}\nService: ${phoneService}\nType: One-time SMS verification\nPrice: ₦${selectedPhone.price.toFixed(2)}\nStock at selection: ${selectedPhone.stock}`;
      await api.post('/api/orders', { product: `${phoneCountry} — ${phoneService} Verification Number`, details, amount: selectedPhone.price });
      await loadOrders(); await loadWallet(); setNotice(`Number purchase placed successfully. ₦${selectedPhone.price.toFixed(2)} has been deducted from your balance.`);
    } catch { setNotice('Could not purchase this number. Please try again.'); }
    finally { setLoading(false); }
  }

  function openDeposit() { if (!user) { setMenuOpen(false); setNotice('Please sign in before making a deposit.'); return; } setDepositAmount(''); setNotice(''); setView('deposit'); setMenuOpen(false); window.scrollTo({top:0, behavior:'smooth'}); }
  async function proceedDeposit() {
    const amount = Number(depositAmount);
    if (!Number.isFinite(amount) || amount < MIN_DEPOSIT) { setNotice(`Minimum deposit is ₦${MIN_DEPOSIT.toFixed(2)}.`); return; }
    if (!user) { setNotice('Please sign in before making a deposit.'); return; }
    setLoading(true); setNotice('');
    try {
      const r = await api.post('/api/deposits', { amount, method: 'Bank Transfer - Naira' });
      setCurrentDeposit(r.data.deposit); await loadCustomerDeposits(); setNotice('Payment request created. Use the saved bank details below to make your transfer. Your balance and Total Deposits will change only after admin approval.');
    } catch (e:any) { setNotice(e?.response?.data?.error || 'Could not create the deposit request. Please try again.'); }
    finally { setLoading(false); }
  }

  async function purchase() {
    if (!selectedProduct) { setNotice('Select a product first.'); return; }
    const currentUser = user || await auth.getUser();
    if (!currentUser) { setNotice('Please sign in before purchasing.'); return; }
    if (total > balance) { setNotice('Insufficient balance. Deposit funds before purchasing this product.'); return; }
    setLoading(true); setNotice('');
    try {
      const details = `Category: ${category}\nQuantity: ${quantity}\nUnit price: ₦${selectedProduct.price.toFixed(2)}\nTotal: ₦${total.toFixed(2)}\nDescription: ${selectedProduct.description}`;
      await api.post('/api/orders', { product: selectedProduct.name, details, amount: total });
      await loadOrders(); await loadWallet(); setView('orders'); setNotice(`Order placed successfully. ₦${total.toFixed(2)} has been deducted from your balance.`);
    } catch { setNotice('Could not place the order. Please try again.'); }
    finally { setLoading(false); }
  }

  async function purchaseSocial() {
    if (!selectedSocialService || !socialPlatform || !socialLink.trim()) { setNotice('Select a platform, service and enter the post/profile link.'); return; }
    const currentUser = user || await auth.getUser();
    if (!currentUser) { setNotice('Please sign in before purchasing.'); return; }
    const minimum = selectedSocialService.min;
    if (socialQuantity < minimum) { setNotice(`Minimum quantity for this service is ${minimum.toLocaleString()}.`); return; }
    if (socialTotal > balance) { setNotice('Insufficient balance. Deposit funds before placing this order.'); return; }
    setLoading(true); setNotice('');
    try {
      const details = `Platform: ${socialPlatform}\nService: ${socialService}\nLink: ${socialLink.trim()}\nQuantity: ${socialQuantity.toLocaleString()}\nTotal: ₦${socialTotal.toFixed(2)}`;
      await api.post('/api/orders', { product: `${socialPlatform} ${socialService}`, details, amount: socialTotal, socialPlatform, socialService, quantity: socialQuantity });
      await loadOrders(); await loadWallet(); setNotice(`Social order placed successfully. ₦${socialTotal.toFixed(2)} has been deducted from your balance.`); setSocialLink('');
    } catch { setNotice('Could not place the social order. Please try again.'); }
    finally { setLoading(false); }
  }

  async function updateOrderStatus(id:string, status:string) {
    try { await api.put(`/api/admin/orders/${id}`, { status }); await loadOrders(); setNotice(`Order marked ${status}.`); }
    catch { setNotice('Could not update the order.'); }
  }

  async function approveDeposit(id:string) {
    try { await api.put(`/api/admin/deposits/${id}/approve`, {}); await loadDeposits(); setNotice('Deposit approved and customer balance funded.'); }
    catch { setNotice('Could not approve this deposit. It may already have been processed.'); }
  }

  async function rejectDeposit(id:string) {
    try { await api.put(`/api/admin/deposits/${id}/reject`, {}); await loadDeposits(); setNotice('Deposit rejected.'); }
    catch { setNotice('Could not reject this deposit.'); }
  }

  function openView(next:'dashboard'|'buySocials'|'buyAccounts'|'phoneVerification'|'orders'|'deposit'|'transactions'|'profile'|'privacy') { setView(next); setMenuOpen(false); setNotice(''); window.scrollTo({ top:0, behavior:'smooth' }); }
  function scrollToShop() { openView('dashboard'); }

  return <div className='app'>
    <header className='topbar'>
      <button className='brandMark' onClick={scrollToShop} aria-label='LAS B Marketplace'><span className='brandLogo'>LB</span></button>
      <div className='balanceRow'><div className='currencyBox'><span className='currencyIcon'>₦</span><b>Currency</b></div><div className='balanceBox'><span>Balance</span><strong>₦{balance.toFixed(2)}</strong></div></div>
      <button className='menuButton' onClick={() => setMenuOpen(true)} aria-label='Open menu'><Menu size={34}/></button>
    </header>

    {menuOpen && <div className='drawerBackdrop' onClick={() => setMenuOpen(false)}><aside className='drawer' onClick={e=>e.stopPropagation()}><div className='drawerHead'><span className='drawerLogo'>LB</span><button className='drawerClose' onClick={()=>setMenuOpen(false)} aria-label='Close menu'><X size={30}/></button></div><nav className='drawerNav'><button className='drawerItem' onClick={scrollToShop}><Home size={25}/><span>Dashboard</span></button>{isAdmin && <button className='drawerItem' onClick={()=>{setView('admin');setMenuOpen(false);setNotice('');window.scrollTo({top:0,behavior:'smooth'})}}><Shield size={25}/><span>Admin Dashboard</span></button>}<button className='drawerItem' onClick={openDeposit}><WalletCards size={25}/><span>Deposit Funds</span></button><button className='drawerItem drawerParent' onClick={()=>setPlaceOrderOpen(v=>!v)}><span className='drawerItemMain'><ShoppingCart size={25}/><span>Place an Order</span></span>{placeOrderOpen?<ChevronUp size={24}/>:<ChevronDown size={24}/>}</button>{placeOrderOpen && <div className='drawerSubmenu'><button className='drawerSubItem' onClick={()=>openView('buySocials')}><Megaphone size={21}/><span>Boost Social</span></button><button className='drawerSubItem' onClick={()=>openView('buyAccounts')}><ClipboardList size={21}/><span>Buy Accounts</span></button><button className='drawerSubItem' onClick={()=>openView('phoneVerification')}><Phone size={21}/><span>Phone Numbers Verification</span></button></div>}<button className='drawerItem' onClick={()=>{if(user){setView('orders');setMenuOpen(false);window.scrollTo({top:0,behavior:'smooth'})}else{setNotice('Please sign in to view your order history.');setMenuOpen(false)}}}><ClipboardList size={25}/><span>{isAdmin ? 'All Customer Orders' : 'Order History'}</span></button><button className='drawerItem' onClick={()=>openView('transactions')}><ReceiptText size={25}/><span>Transaction History</span></button><button className='drawerItem' onClick={()=>openView('profile')}><UserRound size={25}/><span>Profile</span></button><button className='drawerItem' onClick={()=>openView('privacy')}><FileText size={25}/><span>Privacy Policy</span></button></nav><div className='drawerDivider'></div>{user ? <button className='drawerLogout' onClick={async()=>{await auth.signOut();setUser(null);setBalance(0);setMenuOpen(false);setView('dashboard')}}><LogOut size={25}/><span>Log out</span></button> : <button className='drawerLogout' onClick={signIn}><LogIn size={25}/><span>Sign in / Create Account</span></button>}</aside></div>}

    <main>
      {view === 'dashboard' && <section className='dashboardShell'>
        <div className='dashboardAnnouncement'><div className='dashboardAnnouncementHead'><Megaphone size={25}/><span>Announcements/Update</span></div><div className='announcementBody'>updates will be posted here!!</div></div>
        <div className='dashboardActions'><button className='dashAction boost' onClick={()=>openView('buySocials')}><Megaphone size={25}/><span>Boost<br/>Social</span></button><button className='dashAction accounts' onClick={()=>openView('buyAccounts')}><UserRound size={25}/><span>Buy<br/>Accounts</span></button><button className='dashAction phone' onClick={()=>openView('phoneVerification')}><Phone size={25}/><span>Phone Numbers Verification</span></button></div>
        <div className='dashboardStats'><div className='statCard'><span className='statIcon'><ShoppingCart size={32}/></span><div><b>Total Orders</b><strong>{orders.length}</strong></div></div><div className='statCard'><span className='statIcon'><span className='nairaBig'>₦</span></span><div><b>Balance</b><strong>₦{balance.toFixed(2)}</strong></div></div><div className='statCard'><span className='statIcon'><span className='pigIcon'>▣</span></span><div><b>Total Deposits</b><strong>₦{totalDeposits.toFixed(2)}</strong></div></div><div className='statCard'><span className='statIcon'><span className='giftIcon'>◆</span></span><div><b>Referral Balance</b><strong>₦0.00</strong></div></div></div>
        <div className='dashboardGuides'><div className='guideHeading'>⌯<span>SMM/ Boost Socials</span> <small>☞</small></div><button className='guideButton' onClick={()=>setNotice('Boost Social guides will be added here.')}>Show Guides <ChevronDown size={20}/></button><div className='guideHeading accountGuide'>▤<span>Buy Accounts</span> <small>☞</small></div><div className='guideText'>Platform for buying social media accounts, including Facebook, TikTok, Twitter, Instagram, email, and other services available upon request.</div></div>
        {isAdmin && <div className='adminDashboard'><div className='adminDashboardHead'><h3>Customer Orders</h3><button className='adminRefresh' onClick={loadOrders}>Refresh</button></div>{orders.length===0?<div className='adminEmpty'>No customer orders yet. A deposit request is not an order; orders appear here after a customer completes a product purchase.</div>:<div className='adminOrderList'>{orders.map(o=><div className='adminOrderItem' key={o.id}><div className='adminOrderTop'><b>{o.product}</b><span className={`status ${o.status.toLowerCase()}`}>{o.status}</span></div><small>{o.customerName || 'Customer'} · {o.customerEmail || 'No email'}</small><small>{new Date(o.createdAt).toLocaleString()}</small><p>{o.details}</p><div className='adminInlineControls'><button onClick={()=>updateOrderStatus(o.id,'Processing')}>Processing</button><button onClick={()=>updateOrderStatus(o.id,'In Progress')}>In Progress</button><button onClick={()=>updateOrderStatus(o.id,'Completed')}>Completed</button></div></div>)}</div>}</div>}
        {notice && <div className='noticeMessage'>{notice}</div>}
      </section>}

      {view === 'buySocials' && <section className='shopShell socialOrderShell'>
        <div className='pageHero compactSocialHero'><div><span className='eyebrow'>SOCIAL SERVICES</span><h2>Buy Socials</h2><p>Choose only the service you need. Simple, fast and clear.</p></div><button onClick={scrollToShop}><ArrowLeft size={17}/> Back</button></div>
        <div className='socialInfo'><Megaphone size={20}/><div><b>Boost your social presence</b><span>Use a valid public link. Orders are sent to your Order History after purchase.</span></div></div>
        <section className='socialOrderCard'>
          <label>Platform</label><select className='socialSelect' value={socialPlatform} onChange={e=>chooseSocialPlatform(e.target.value)}><option value=''>Select Platform</option><option>Instagram</option><option>TikTok</option><option>Facebook</option><option>YouTube</option><option>Twitter</option></select>
          <label>Service</label><select className='socialSelect' value={socialService} disabled={!socialPlatform} onChange={e=>chooseSocialService(e.target.value)}><option value=''>Select Service</option>{(socialServices[socialPlatform] || []).map(s=><option key={s.name} value={s.name}>{s.name}</option>)}</select>
          <label>Link</label><input className='socialInput' value={socialLink} onChange={e=>setSocialLink(e.target.value)} placeholder='https://'/>
          <label>Quantity <em>{selectedSocialService ? `(Minimum ${selectedSocialService.min.toLocaleString()})` : ''}</em></label><input className='socialInput' type='number' min={selectedSocialService?.min || 100} value={socialQuantity} disabled={!selectedSocialService} onChange={e=>setSocialQuantity(Math.max(1, Number(e.target.value)||1))}/>
          <div className='socialSummary'><span>Total Charge</span><strong>₦{socialTotal.toFixed(2)}</strong></div>
          <button className='socialPurchaseButton' disabled={loading} onClick={purchaseSocial}><ShoppingCart size={19}/> {loading ? 'Processing…' : 'Place Social Order'}</button>
          {notice && <div className='noticeMessage'>{notice}</div>}
        </section>
      </section>}

      {view === 'phoneVerification' && <section className='contentPage phonePage'>
        <div className='pageHero phoneHero'><div><span className='eyebrow'>SMS / OTP SERVICE</span><h2>Phone Number Verification</h2><p>Buy a number for one-time SMS verification. Prices vary by country and service.</p></div><button onClick={scrollToShop}><ArrowLeft size={17}/> Back</button></div>
        <div className='phoneNotice'><Smartphone size={21}/><div><b>One-time verification numbers</b><span>Select a country and service to see the current price and available stock.</span></div></div>
        <section className='phoneCard'>
          <label>Country</label><select className='phoneSelect' value={phoneCountry} onChange={e=>choosePhoneCountry(e.target.value)}><option value=''>Select Country</option>{Object.keys(phoneServices).map(c=><option key={c}>{c}</option>)}</select>
          <label>Service</label><select className='phoneSelect' value={phoneService} disabled={!phoneCountry} onChange={e=>choosePhoneService(e.target.value)}><option value=''>Select Service</option>{(phoneServices[phoneCountry] || []).map(s=><option key={s.name}>{s.name}</option>)}</select>
          {selectedPhone ? <div className='phoneQuote'><div><span>Price</span><strong>₦{selectedPhone.price.toFixed(2)}</strong></div><div><span>Available</span><strong>{selectedPhone.stock}</strong></div></div> : <div className='phoneHint'>Choose a country and service to view pricing.</div>}
          <button className='phonePurchaseButton' disabled={!selectedPhone || loading} onClick={purchasePhoneNumber}><Phone size={19}/> {loading ? 'Processing…' : 'Purchase Number'}</button>
        </section>
        <section className='phoneRules'><div className='phoneRulesHead'><Shield size={19}/><b>Service Rules</b></div><ul><li>Use the number only when you are ready to request the SMS code.</li><li>OTP received successfully means the order is completed and non-refundable.</li><li>If the service cannot receive the required SMS within the active window, the order can be reviewed for a refund.</li></ul></section>
        {notice && <div className='noticeMessage'>{notice}</div>}
      </section>}

      {view === 'buyAccounts' && <section className='shopShell buyAccountsShell'>
        <div className='socialBar'>{socialIcons.map((Icon,i)=><Icon key={i} size={25} strokeWidth={2.5}/>)}</div>
        <div className='notice blueNotice'>Request an Account if not found.<br/>Login (with VPN) and secure all accounts within 24hrs of purchase</div>
        <button className='notice redNotice' onClick={()=>setTermsOpen(true)}>⚠️ Click to read our Policies before buying a product – no excuse for ignorance!</button>
        <section className='selectorPanel'>
          <label>Category</label><button className={`selectBox ${categoryOpen ? 'focused' : ''}`} onClick={()=>setCategoryOpen(v=>!v)}><span>{category || 'Select Category'}</span><ChevronDown size={24}/></button>
          {categoryOpen && <div className='optionSheet'><div className='sheetTitle'>Select Category</div>{categories.map(c=><button key={c} className='optionRow' onClick={()=>chooseCategory(c)}><span>{c}</span><span className={`radio ${category===c?'checked':''}`}></span></button>)}</div>}
          <label>Product</label><button className={`selectBox ${!category ? 'disabled' : ''}`} disabled={!category} onClick={()=>setProductOpen(v=>!v)}><span>{selectedProduct?.name || 'Select Product'}</span><ChevronDown size={24}/></button>
          {productOpen && category && <div className='optionSheet productSheet'><div className='sheetTitle'>Select Product</div>{categoryProducts.length===0 ? <div className='emptyProducts'>Products for <b>{category}</b> will appear here once they are added.</div> : categoryProducts.map(p=><button key={p.id} className='optionRow productRow' onClick={()=>chooseProduct(p.id)}><span>{p.name}</span><span className={`radio ${productId===p.id?'checked':''}`}></span></button>)}</div>}
          <label>Stock <em>(Available)</em></label><div className='fieldBox'>{selectedProduct ? selectedProduct.stock : ''}</div><label>Quantity <em>(How many do you want to buy?)</em></label><input className='fieldBox inputBox' type='number' min='1' max={selectedProduct?.stock || 1} value={quantity} disabled={!selectedProduct} onChange={e=>setQuantity(Math.max(1, Number(e.target.value)||1))}/><label>Cost</label><div className='fieldBox'>{selectedProduct ? selectedProduct.price.toFixed(2) : ''}</div><label>Description</label><textarea className='descriptionBox' value={selectedProduct?.description || ''} readOnly placeholder='Select a product to view its description.'/><div className='totalBox'>Total Charge: ₦{total.toFixed(2)}</div><div className='termsCard'><p>By purchasing any product, you agree that you are fully aware of these terms and policies and agree to follow them.</p><button onClick={()=>setTermsOpen(true)}>View Terms &amp; Conditions</button></div><button className='purchaseButton' disabled={!selectedProduct || loading} onClick={purchase}><ShoppingCart size={21}/> {loading ? 'Processing…' : 'Purchase'}</button>{notice && <div className='noticeMessage'>{notice}</div>}
        </section>
      </section>}

      {view === 'deposit' && <section className='contentPage depositPage'><div className='pageHead'><div><span className='eyebrow'>WALLET</span><h2>Deposit Funds</h2></div><button onClick={scrollToShop}><ArrowLeft size={18}/> Back</button></div><div className='depositCard'><div className='depositTitle'><CreditCard size={28}/><h3>Payment Methods</h3></div><label>Select Payment Method:</label><div className='paymentSelect'>Korapay - Naira (₦)<span>⌃</span></div><label>Amount (₦):</label><input className='depositInput' type='number' min={MIN_DEPOSIT} value={depositAmount} onChange={e=>setDepositAmount(e.target.value)} placeholder='Enter amount in Naira'/><small>Minimum: ₦{MIN_DEPOSIT}</small><button className='proceedButton' onClick={proceedDeposit} disabled={loading}><WalletCards size={21}/> {loading ? 'Creating request…' : 'Proceed to Payment'}</button>{notice && <div className='noticeMessage'>{notice}</div>}{currentDeposit && <div className='pendingMini'><b>Pending deposit: ₦{Number(currentDeposit.amount).toFixed(2)}</b><span>Make your transfer to the account below. This deposit will not increase your balance or Total Deposits until an admin approves it.</span><div className='transferDetails'><div><small>Bank</small><strong>{currentDeposit.bankDetails?.bankName || MERCHANT_BANK.bankName}</strong></div><div><small>Account Name</small><strong>{currentDeposit.bankDetails?.accountName || MERCHANT_BANK.accountName}</strong></div><div><small>Account Number</small><strong>{currentDeposit.bankDetails?.accountNumber || MERCHANT_BANK.accountNumber}</strong></div><div><small>Amount</small><strong>₦{Number(currentDeposit.amount).toFixed(2)}</strong></div></div><button onClick={()=>{setConfirmingDeposit(currentDeposit);setTransferConfirmOpen(true)}} disabled={!!currentDeposit.transferConfirmedAt}>{currentDeposit.transferConfirmedAt ? 'Transfer Confirmed / Waiting for Approval' : 'Transfer Made / Waiting for Approval'}</button></div>}</div></section>}

      {view === 'transactions' && <section className='contentPage historyPage'><div className='pageHero'><div><span className='eyebrow'>WALLET</span><h2>Transaction History</h2><p>Review your deposits, payment method and approval status.</p></div><button onClick={async()=>{await loadCustomerDeposits();setNotice('Transactions refreshed.');}}><ReceiptText size={17}/> Refresh</button></div><div className='historySearch'><ReceiptText size={19}/><input placeholder='Search transactions...' aria-label='Search transactions'/></div>{transactions.length===0?<div className='emptyState'><ReceiptText size={34}/><b>No transactions yet</b><span>Your deposits and payment activity will appear here.</span></div>:<div className='transactionList'>{transactions.map((d,i)=><article className='transactionCard' key={d.id || i}><div className='transactionTop'><div className='transactionRef'>{d.id}</div><span className={`status ${d.status.toLowerCase()}`}>{d.status}</span></div><div className='transactionMeta'><span>Type</span><strong>{d.method?.includes('Bank')?'Korapay / Naira':'Manual'}</strong></div><div className='transactionMeta'><span>Date</span><strong>{new Date(d.createdAt).toLocaleString()}</strong></div><div className='transactionAmount'><span>Amount</span><strong>₦{Number(d.amount).toFixed(2)}</strong></div></article>)}</div>}{notice&&<div className='noticeMessage'>{notice}</div>}</section>}      {view === 'profile' && <section className='contentPage profilePage'><div className='pageHero profileHero'><div><span className='eyebrow'>ACCOUNT</span><h2>Profile</h2><p>Manage your account information and security.</p></div><span className='profileBadge'><UserRound size={21}/></span></div><div className='profileCard'><div className='sectionIntro'><div className='sectionIcon'><UserRound size={22}/></div><div><h3>Account Details</h3><p>Manage your basic profile information</p></div></div><label>Username</label><div className='profileField'>{user?.name || 'Customer'}</div><label>Email</label><div className='profileField'>{user?.email || 'Not available'}</div></div><div className='profileCard securityCard'><div className='sectionIntro'><div className='sectionIcon'><Shield size={22}/></div><div><h3>Password &amp; Security</h3><p>Keep your account secure</p></div></div><label>Old Password</label><input className='profileField profileInput' type='password' placeholder='Enter old password'/><label>New Password</label><input className='profileField profileInput' type='password' placeholder='Enter new password'/><label>Repeat New Password</label><input className='profileField profileInput' type='password' placeholder='Repeat new password'/><button className='saveProfileButton' onClick={()=>setNotice('Password changes are managed by your sign-in provider. Your account information above is read directly from your signed-in profile.')}>Save Security Changes</button></div>{notice&&<div className='noticeMessage'>{notice}</div>}</section>}      {view === 'privacy' && <section className='contentPage legalPage'><div className='legalBanner'><FileText size={26}/><div><span>LAS B MARKETPLACE</span><h2>Privacy Policy, Terms of Service &amp; Usage Policy</h2></div></div><button className='legalMenuButton' onClick={()=>setMenuOpen(true)}><Menu size={19}/> Menu</button><article className='legalCard'><div className='legalIntro'><Shield size={28}/><div><h3>Your privacy and safe use matter</h3><p>By using our platform, placing an order, or purchasing an account, you agree to comply with the rules and terms below.</p></div></div><section><h3>1. Privacy Policy</h3><p>We collect only information needed to operate your account, process deposits, manage orders and provide customer support. This may include your name, email address, account activity and transaction records.</p></section><section><h3>2. Account Information</h3><p>Keep your sign-in details private. Do not share access to your account with other people. You are responsible for activity carried out through your account.</p></section><section><h3>3. Deposits &amp; Transactions</h3><p>Deposit requests remain pending until verified and approved by an administrator. A pending deposit does not increase your available balance or Total Deposits. Keep transfer evidence until a deposit has been approved.</p></section><section><h3>4. Orders &amp; Purchases</h3><p>Review product details, quantity, price and instructions before purchasing. Orders are recorded for processing and support. Follow applicable rules of the platforms connected to any purchased service or account.</p></section><section><h3>5. Acceptable Use</h3><p>Do not use the marketplace for fraud, impersonation, harassment, unauthorized access, spam, or any activity that violates applicable law or third-party platform rules.</p></section><section><h3>6. Changes &amp; Contact</h3><p>We may update these policies when our services change. Continued use of the platform after an update means you accept the revised terms. Contact support through the available support channel if you need help.</p></section><div className='legalNotice'><CheckCircle2 size={20}/><span>By continuing to use LAS B Marketplace, you confirm that you have read and agree to these policies.</span></div><button className='legalBackButton' onClick={scrollToShop}><ArrowLeft size={18}/> Go Back</button></article></section>}      {view === 'orders' && <section className='contentPage'><div className='pageHead'><div><span className='eyebrow'>{isAdmin ? 'ADMIN AREA' : 'CUSTOMER AREA'}</span><h2>{isAdmin ? 'All Customer Orders' : 'My Orders'}</h2></div><button onClick={async()=>{await loadOrders();setNotice('Order list refreshed.');}}>Refresh</button></div>{orders.length===0?<div className='emptyState'>{isAdmin ? 'No customer orders yet. Orders appear here after a customer completes a product purchase.' : 'You have no orders yet.'}</div>:<div className='orders'>{orders.map(o=><div className='order' key={o.id}><div><b>{o.product}</b><p>{o.details}</p><small>{o.customerName || 'Customer'} · {o.customerEmail || 'No email'} · {new Date(o.createdAt).toLocaleString()}</small></div><div className='adminControls'><span className={`status ${o.status.toLowerCase()}`}>{o.status}</span>{isAdmin&&<select value={o.status} onChange={e=>updateOrderStatus(o.id,e.target.value)}><option>Pending</option><option>Processing</option><option>In Progress</option><option>Completed</option><option>Cancelled</option></select>}</div></div>)}</div>}{notice&&<div className='noticeMessage'>{notice}</div>}</section>}

      {view === 'admin' && isAdmin && <section className='contentPage'><div className='pageHead'><div><span className='eyebrow'>PRIVATE ADMIN</span><h2>Admin Dashboard</h2></div><button onClick={async()=>{await loadOrders();await loadDeposits();}}>Refresh</button></div>
        <div className='adminSection'><h3>Add Funds to Customer</h3><div className='adminFundingForm'><input className='socialInput' value={adminFundingEmail} onChange={e=>setAdminFundingEmail(e.target.value)} placeholder='Customer Gmail / email'/><input className='socialInput' type='number' min='1' value={adminFundingAmount} onChange={e=>setAdminFundingAmount(e.target.value)} placeholder='Amount (₦)'/><button className='proceedButton' onClick={adminAddFunds} disabled={loading}>Add Funds</button></div></div>
        <div className='adminSection'><h3>Pending Deposits</h3>{deposits.length===0?<div className='emptyState'>No deposit requests yet.</div>:<div className='orders'>{deposits.map(d=><div className='order' key={d.id}><div><b>₦{Number(d.amount).toFixed(2)} deposit</b><p>{d.method}</p><small>{d.customerName || 'Customer'} · {d.customerEmail} · {new Date(d.createdAt).toLocaleString()}</small></div><div className='adminControls'><span className={`status ${d.status.toLowerCase()}`}>{d.status}</span>{d.status==='Pending'&&<><button className='approveButton' onClick={()=>approveDeposit(d.id)}>Approve &amp; Fund</button><button className='rejectButton' onClick={()=>rejectDeposit(d.id)}>Reject</button></>}</div></div>)}</div>}</div>
        <div className='adminSection'><h3>Orders</h3>{orders.length===0?<div className='emptyState'>No orders yet.</div>:<div className='orders'>{orders.map(o=><div className='order' key={o.id}><div><b>{o.product}</b><p>{o.details}</p><small>{o.customerName || 'Customer'} · {o.customerEmail} · {new Date(o.createdAt).toLocaleString()}</small></div><div className='adminControls'><span className={`status ${o.status.toLowerCase()}`}>{o.status}</span><select value={o.status} onChange={e=>updateOrderStatus(o.id,e.target.value)}><option>Pending</option><option>Processing</option><option>In Progress</option><option>Completed</option><option>Cancelled</option></select></div></div>)}</div>}</div>
        {notice&&<div className='noticeMessage'>{notice}</div>}
      </section>}
    </main>

    {transferConfirmOpen && confirmingDeposit && <div className='modalBackdrop' onClick={()=>setTransferConfirmOpen(false)}><div className='termsModal' onClick={e=>e.stopPropagation()}><div className='modalHead'><h3>Confirm Transfer</h3><button onClick={()=>setTransferConfirmOpen(false)}><X size={22}/></button></div><p>Have you completed the bank transfer of <b>₦{Number(confirmingDeposit.amount).toFixed(2)}</b> to the account shown above?</p><p>This only notifies the admin that the transfer was made. Your wallet will be credited after the transfer is verified and approved.</p><div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'8px'}}><button className='modalClose' onClick={()=>setTransferConfirmOpen(false)}>Not yet</button><button className='modalClose' onClick={()=>confirmTransfer(confirmingDeposit)} disabled={loading}>{loading?'Confirming…':'Yes, I transferred'}</button></div></div></div>}

    {authOpen && <div className='modalBackdrop' onClick={()=>setAuthOpen(false)}><div className='authModal' onClick={e=>e.stopPropagation()}><div className='modalHead'><div><span className='eyebrow'>LAS B MARKETPLACE</span><h3>{authMode==='signin'?'Welcome back':'Create your account'}</h3></div><button onClick={()=>setAuthOpen(false)} aria-label='Close'><X size={22}/></button></div><div className='authTabs'><button className={authMode==='signin'?'active':''} onClick={()=>{setAuthMode('signin');setNotice('')}}>Sign In</button><button className={authMode==='signup'?'active':''} onClick={()=>{setAuthMode('signup');setNotice('')}}>Create Account</button></div><form onSubmit={submitAuth} className='authForm'>{authMode==='signup'&&<label>Full name<input value={authName} onChange={e=>setAuthName(e.target.value)} placeholder='Your full name' autoComplete='name'/></label>}<label>Email address<input type='email' value={authEmail} onChange={e=>setAuthEmail(e.target.value)} placeholder='you@example.com' autoComplete='email' required/></label><label>Password<input type='password' value={authPassword} onChange={e=>setAuthPassword(e.target.value)} placeholder={authMode==='signup'?'At least 8 characters':'Your password'} autoComplete={authMode==='signup'?'new-password':'current-password'} minLength={authMode==='signup'?8:1} required/></label>{notice&&<div className='authNotice'>{notice}</div>}<button className='authSubmit' type='submit' disabled={loading}>{loading?(authMode==='signin'?'Signing in…':'Creating account…'):(authMode==='signin'?'Sign In':'Create Account')}</button></form><div className='authDivider'><span>OR</span></div><button className='googleAuthButton' type='button' onClick={signInWithGoogle} disabled={loading}><span className='googleMark'>G</span><span>Continue with Google</span></button><p className='authHint'>{authMode==='signin'?'Use your email/password or continue with Google.':'Use a valid email. You may need to confirm it by email before signing in.'}</p></div></div>}

    {termsOpen && <div className='modalBackdrop' onClick={()=>setTermsOpen(false)}><div className='termsModal' onClick={e=>e.stopPropagation()}><div className='modalHead'><h3>Terms &amp; Conditions</h3><button onClick={()=>setTermsOpen(false)}><X size={22}/></button></div><p>Review the product description, quantity, price and any instructions before purchasing. Deposit requests remain pending until payment is verified by the administrator. Keep purchased accounts secure and follow applicable platform rules and product instructions.</p><button className='modalClose' onClick={()=>setTermsOpen(false)}>I Understand</button></div></div>}
    <footer>© {new Date().getFullYear()} LAS B Marketplace. All rights reserved.</footer>
  </div>;
}

export default App;
