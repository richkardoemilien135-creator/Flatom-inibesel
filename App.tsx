
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Product, CartItem, Category, Reservation, PaymentMethod, Comment } from './types';
import { PRODUCTS as INITIAL_PRODUCTS, CATEGORIES } from './constants';
import ProductCard from './components/ProductCard';
import CartSidebar from './components/CartSidebar';
import CommentModal from './components/CommentModal';

const BOUTIQUE_INFO: Record<string, { desc: string, img: string, color: string }> = {
  'Rad': { desc: 'Dènye mòd pou fanm ak gason', img: 'https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?auto=format&fit=crop&q=80&w=400', color: 'from-pink-500 to-rose-600' },
  'Sandal': { desc: 'Konfò ak elegans pou pye w', img: 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?auto=format&fit=crop&q=80&w=400', color: 'from-amber-400 to-orange-500' },
  'Cheve': { desc: 'Pi bon kalite cheve natirèl', img: 'https://images.unsplash.com/photo-1522337660859-02fbefad157a?auto=format&fit=crop&q=80&w=400', color: 'from-purple-500 to-indigo-600' },
  'Bijou': { desc: 'Klere plis ak bèl bijou nou yo', img: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&q=80&w=400', color: 'from-yellow-400 to-yellow-600' },
  'Kosmetik': { desc: 'Tout sa w bezwen pou w parèt bèl', img: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&q=80&w=400', color: 'from-green-400 to-emerald-600' },
  'Elektrik': { desc: 'Materyèl ak zouti elektrik modèn', img: 'https://images.unsplash.com/photo-1558002038-1055907df827?auto=format&fit=crop&q=80&w=400', color: 'from-blue-500 to-cyan-600' },
};

const App: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState<Category | 'Mall'>('Mall');
  const [searchTerm, setSearchTerm] = useState('');
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [activeView, setActiveView] = useState<'Boutik' | 'Rezèvasyon' | 'Jesyon'>('Boutik');
  const [paymentStep, setPaymentStep] = useState<{method: PaymentMethod, total: number, seller?: string} | null>(null);
  
  const [isAdmin, setIsAdmin] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [pinInput, setPinInput] = useState('');
  const [authError, setAuthError] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  const MASTER_PIN = "2025";
  const DIRECT_PHONE = "+1 849-470-6077";
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [allProducts, setAllProducts] = useState<Product[]>(() => {
    const saved = localStorage.getItem('res_products');
    return saved ? JSON.parse(saved) : INITIAL_PRODUCTS;
  });

  const [productComments, setProductComments] = useState<Record<string, Comment[]>>(() => {
    const saved = localStorage.getItem('res_comments');
    return saved ? JSON.parse(saved) : {};
  });

  const [reservations, setReservations] = useState<Reservation[]>(() => {
    const saved = localStorage.getItem('res_reservations');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => { localStorage.setItem('res_products', JSON.stringify(allProducts)); }, [allProducts]);
  useEffect(() => { localStorage.setItem('res_comments', JSON.stringify(productComments)); }, [productComments]);
  useEffect(() => { localStorage.setItem('res_reservations', JSON.stringify(reservations)); }, [reservations]);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [newProduct, setNewProduct] = useState<Partial<Product>>({ category: 'Rad', price: 0, image: '', name: '', description: '', seller: '$emilien' });
  const [selectedCommentProduct, setSelectedCommentProduct] = useState<Product | null>(null);
  const [adminCategory, setAdminCategory] = useState<Category>('Rad');

  const showSuccess = (msg: string) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(''), 3000);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!isAdmin) return; // Sekirite anplis
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setNewProduct(prev => ({ ...prev, image: reader.result as string }));
        showSuccess("Foto a chaje byen!");
      };
      reader.readAsDataURL(file);
    }
  };

  const triggerFilePicker = () => {
    if (isAdmin) {
      fileInputRef.current?.click();
    }
  };

  const addToCart = (product: Product) => {
    setCartItems(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) return prev.map(item => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item);
      return [...prev, { ...product, quantity: 1 }];
    });
    setIsCartOpen(true);
  };

  const reserveProduct = (product: Product) => {
    const newRes: Reservation = {
      id: Date.now().toString(),
      product,
      date: new Date().toLocaleDateString('ht-HT', { day: 'numeric', month: 'long', year: 'numeric' }),
      status: 'Pandan'
    };
    setReservations(prev => [newRes, ...prev]);
    showSuccess("Atik la rezève!");
  };

  const addComment = (productId: string, text: string, userName: string) => {
    const newComment: Comment = { id: Date.now().toString(), userName, text, date: new Date().toLocaleDateString('ht-HT') };
    setProductComments(prev => ({ ...prev, [productId]: [newComment, ...(prev[productId] || [])] }));
  };

  const deleteComment = (productId: string, commentId: string) => {
    if (!isAdmin) return;
    setProductComments(prev => ({ ...prev, [productId]: (prev[productId] || []).filter(c => c.id !== commentId) }));
  };

  const get30Slots = (cat: Category, filterText: string = '') => {
    const realProducts = allProducts.filter(p => p.category === cat && p.name.toLowerCase().includes(filterText.toLowerCase()));
    const slots: (Product & { isPlaceholder?: boolean })[] = [...realProducts];
    const placeholdersNeeded = 30 - slots.length;
    
    for (let i = 0; i < placeholdersNeeded; i++) {
      slots.push({
        id: `placeholder-${cat}-${slots.length}`,
        name: 'Disponib Talè',
        category: cat,
        price: 0,
        image: '',
        description: 'Mèt boutik la ap prepare yon bèl atik pou ou nan fenèt sa a.',
        isPlaceholder: true,
        seller: ''
      });
    }
    return slots;
  };

  const galleryWindows = useMemo(() => {
    if (activeCategory === 'Mall') return [];
    return get30Slots(activeCategory as Category, searchTerm);
  }, [activeCategory, allProducts, searchTerm]);

  const adminSlots = useMemo(() => get30Slots(adminCategory), [adminCategory, allProducts]);

  const handleAdminAuth = (e: React.FormEvent) => {
    e.preventDefault();
    if (pinInput === MASTER_PIN) {
      setIsAdmin(true);
      setShowLoginModal(false);
      setActiveView('Jesyon');
      setPinInput('');
      showSuccess("Byenveni mèt boutik la!");
    } else {
      setAuthError(true);
      setTimeout(() => setAuthError(false), 2000);
    }
  };

  const handleViewChange = (view: 'Boutik' | 'Rezèvasyon' | 'Jesyon') => {
    if (view === 'Jesyon' && !isAdmin) setShowLoginModal(true);
    else {
      setActiveView(view);
      if (view === 'Boutik') setActiveCategory('Mall');
    }
  };

  const handleSaveProduct = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!isAdmin) return;
    
    const price = Number(newProduct.price);
    const finalImage = newProduct.image || `https://picsum.photos/seed/item-${Date.now()}/600/800`;

    if (editingId) {
      setAllProducts(prev => prev.map(p => p.id === editingId ? { 
        ...p, 
        name: newProduct.name!, 
        category: newProduct.category as Category, 
        price, 
        image: finalImage, 
        description: newProduct.description!,
        seller: newProduct.seller
      } : p));
      setEditingId(null);
      showSuccess("Pwodwi a modifye!");
    } else {
      const p: Product = { 
        id: Date.now().toString(), 
        name: newProduct.name!, 
        category: newProduct.category as Category, 
        price, 
        image: finalImage, 
        description: newProduct.description!,
        seller: newProduct.seller
      };
      setAllProducts(prev => [p, ...prev]);
      showSuccess("Pwodwi a ajoute!");
    }
    
    setNewProduct({ category: adminCategory, price: 0, image: '', name: '', description: '', seller: '$emilien' });
  };

  const deleteProduct = (id: string) => {
    if(!isAdmin) return;
    if(window.confirm("Èske w vle retire pwodwi sa a nèt?")) {
      setAllProducts(prev => prev.filter(p => p.id !== id));
      showSuccess("Pwodwi a efase!");
      setEditingId(null);
      setNewProduct({ category: adminCategory });
    }
  };

  const getPaymentDetails = (method: PaymentMethod, seller?: string) => {
    const currentSeller = seller || '$emilien';
    if (method === 'Wise') return { label: 'Wise Tag / Tag Peman', value: currentSeller };
    if (method === 'Bank') return { label: 'Kont Bankè / Non Mèt', value: currentSeller };
    return { label: 'Nimewo MonCash', value: DIRECT_PHONE };
  };

  return (
    <div className="min-h-screen flex flex-col font-sans bg-slate-50 selection:bg-blue-100">
      {/* Global Success Notification */}
      {successMsg && (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 z-[200] animate-in slide-in-from-top-10">
          <div className="bg-slate-900 text-white px-8 py-4 rounded-3xl shadow-2xl font-black flex items-center gap-3 border border-slate-700">
            <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="4" d="M5 13l4 4L19 7" /></svg>
            </div>
            {successMsg}
          </div>
        </div>
      )}

      {/* Navbar */}
      <nav className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-100 px-4 py-4 lg:px-8 shadow-sm">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3 cursor-pointer group" onClick={() => handleViewChange('Boutik')}>
            <div className={`w-12 h-12 ${isAdmin ? 'bg-blue-600' : 'bg-slate-900'} rounded-2xl flex items-center justify-center shadow-lg transform group-hover:scale-110 transition-all`}>
              <span className="text-white font-black text-2xl tracking-tighter italic">RES</span>
            </div>
            <div>
              <h1 className="text-xl font-black text-slate-900 uppercase leading-none tracking-tighter">LA FAMILLE <span className={isAdmin ? 'text-blue-600' : 'text-slate-900'}>RES</span></h1>
              <p className="text-[9px] font-bold text-slate-400 tracking-widest uppercase mt-1 italic">Mòd ak Stil Inivèsèl</p>
            </div>
          </div>

          <div className="hidden md:flex items-center gap-4 bg-slate-100/50 p-1.5 rounded-2xl border border-slate-200/50">
            <button onClick={() => handleViewChange('Boutik')} className={`px-6 py-2.5 rounded-xl text-sm font-black transition-all ${activeView === 'Boutik' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400 hover:text-slate-900'}`}>Boutik</button>
            <button onClick={() => handleViewChange('Rezèvasyon')} className={`px-6 py-2.5 rounded-xl text-sm font-black transition-all ${activeView === 'Rezèvasyon' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400 hover:text-slate-900'}`}>Rezèvasyon</button>
            <button onClick={() => handleViewChange('Jesyon')} className={`px-6 py-2.5 rounded-xl text-sm font-black transition-all ${activeView === 'Jesyon' ? 'bg-blue-600 text-white shadow-lg' : 'text-blue-600 hover:bg-white'}`}>{isAdmin ? 'TABLO MÈT' : 'ADMIN'}</button>
          </div>

          <button onClick={() => setIsCartOpen(true)} className="relative p-4 bg-slate-900 text-white rounded-2xl hover:scale-105 transition-all shadow-xl shadow-slate-200">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg>
            {cartItems.length > 0 && <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-black w-6 h-6 rounded-full flex items-center justify-center border-2 border-white">{cartItems.reduce((a, b) => a + b.quantity, 0)}</span>}
          </button>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-grow max-w-7xl mx-auto px-4 py-8 lg:py-16 w-full">
        {activeView === 'Boutik' ? (
          activeCategory === 'Mall' ? (
            <div className="animate-in fade-in slide-in-from-bottom-8 duration-700">
              <div className="text-center mb-20 space-y-6">
                <h2 className="text-6xl md:text-8xl font-black text-slate-900 tracking-tighter leading-none">GRAND <span className="text-blue-600">MALL</span></h2>
                <p className="text-slate-500 font-bold text-xl uppercase tracking-widest italic opacity-60">Chwazi yon depatman nan boutik la</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                {CATEGORIES.filter(c => c !== 'Tout').map((cat) => {
                  const info = BOUTIQUE_INFO[cat];
                  return (
                    <div key={cat} onClick={() => setActiveCategory(cat as Category)} className="group relative h-[500px] rounded-[4rem] overflow-hidden cursor-pointer shadow-3xl hover:-translate-y-6 transition-all duration-700 border-4 border-white">
                      <img src={info.img} className="absolute inset-0 w-full h-full object-cover group-hover:scale-125 transition-all duration-1000" alt={cat} />
                      <div className={`absolute inset-0 bg-gradient-to-t ${info.color} opacity-80 group-hover:opacity-90`} />
                      <div className="absolute inset-0 p-12 flex flex-col justify-end text-white">
                        <h3 className="text-5xl font-black mb-4 tracking-tighter uppercase">{cat}</h3>
                        <p className="text-white/90 font-medium mb-10 text-lg leading-relaxed">{info.desc}</p>
                        <div className="bg-white text-slate-900 px-10 py-5 rounded-3xl font-black text-xs uppercase tracking-[0.2em] w-fit shadow-2xl group-hover:translate-x-4 transition-all">GADE PRODUIT YO</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="animate-in slide-in-from-right-8 duration-500">
              <div className="flex flex-col md:flex-row items-center justify-between mb-16 gap-8 bg-white p-10 rounded-[3.5rem] shadow-sm border border-slate-100">
                <div className="flex items-center gap-6">
                  <button onClick={() => setActiveCategory('Mall')} className="w-16 h-16 bg-slate-50 rounded-3xl flex items-center justify-center text-slate-400 hover:bg-slate-900 hover:text-white transition-all shadow-inner">
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M15 19l-7-7 7-7" /></svg>
                  </button>
                  <div>
                    <h2 className="text-4xl font-black text-slate-900 tracking-tighter uppercase">{activeCategory}</h2>
                    <p className="text-xs font-black text-blue-600 uppercase tracking-widest mt-1">Galri konplè</p>
                  </div>
                </div>
                <div className="relative w-full md:w-[450px]">
                  <input type="text" placeholder={`Chache nan ${activeCategory}...`} className="w-full bg-slate-50 border-3 border-slate-100 rounded-3xl px-16 py-6 outline-none focus:border-blue-500 transition-all font-bold text-lg" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
                  <svg className="w-6 h-6 absolute left-6 top-1/2 -translate-y-1/2 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 pb-32">
                {galleryWindows.map((p) => (
                  <ProductCard key={p.id} product={p} onAddToCart={p.isPlaceholder ? () => {} : addToCart} onReserve={p.isPlaceholder ? () => {} : reserveProduct} onOpenComments={p.isPlaceholder ? () => {} : setSelectedCommentProduct} commentCount={productComments[p.id]?.length || 0} ownerPhone={DIRECT_PHONE} isAdmin={isAdmin} onAdminAction={() => { if(isAdmin && p.isPlaceholder) { setAdminCategory(activeCategory as Category); setActiveView('Jesyon'); } }} />
                ))}
              </div>
            </div>
          )
        ) : activeView === 'Rezèvasyon' ? (
           <div className="max-w-4xl mx-auto animate-in fade-in py-10">
             <div className="text-center mb-16 space-y-4">
                <h2 className="text-5xl font-black text-slate-900 tracking-tighter uppercase">Rezèvasyon yo</h2>
             </div>
             {reservations.length === 0 ? (
               <div className="bg-white p-24 rounded-[4rem] text-center border-2 border-dashed border-slate-200">
                 <p className="text-slate-400 font-black text-2xl italic">Ou poko gen rezèvasyon.</p>
               </div>
             ) : (
               <div className="space-y-6">
                 {reservations.map(res => (
                   <div key={res.id} className="bg-white p-10 rounded-[3rem] shadow-sm border border-slate-100 flex flex-col md:flex-row items-center justify-between group gap-6">
                     <div className="flex items-center gap-8 w-full">
                       <img src={res.product.image} className="w-28 h-28 rounded-[2rem] object-cover shadow-2xl" alt="" />
                       <div className="flex-grow">
                         <h4 className="font-black text-slate-900 text-2xl tracking-tighter">{res.product.name}</h4>
                         <p className="text-xs text-slate-400 font-black uppercase tracking-widest mt-2 bg-slate-50 px-3 py-1 rounded-full w-fit">{res.date}</p>
                       </div>
                       <div className="text-right">
                         <p className="text-2xl font-black text-blue-600 italic">HTG {res.product.price.toLocaleString()}</p>
                       </div>
                     </div>
                     <span className={`px-10 py-4 rounded-2xl text-xs font-black uppercase tracking-[0.2em] shadow-lg ${res.status === 'Pandan' ? 'bg-amber-100 text-amber-700' : 'bg-green-100 text-green-700'}`}>{res.status}</span>
                   </div>
                 ))}
               </div>
             )}
          </div>
        ) : (
          /* JESYON VIEW (ADMIN ONLY) */
          isAdmin && (
            <div className="max-w-7xl mx-auto space-y-16 animate-in zoom-in duration-500 pb-32">
              <div className="flex flex-col md:flex-row items-center justify-between bg-white p-12 rounded-[4rem] shadow-xl border border-blue-100 gap-8 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4">
                  <div className="bg-blue-600 text-white px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg">Mòd Mèt Sèlman</div>
                </div>
                <div>
                  <h2 className="text-5xl font-black text-slate-900 tracking-tighter uppercase leading-none">ETAJÈ JESTYON</h2>
                  <p className="text-slate-400 font-bold text-lg mt-2 italic">Chwazi fenèt ou vle ranpli a.</p>
                </div>
                <div className="flex flex-wrap items-center justify-center gap-3 bg-slate-50 p-3 rounded-[2.5rem] border border-slate-100">
                   {CATEGORIES.filter(c => c !== 'Tout').map(c => (
                     <button key={c} onClick={() => setAdminCategory(c as Category)} className={`px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${adminCategory === c ? 'bg-white text-blue-600 shadow-xl scale-105' : 'text-slate-400 hover:text-slate-600'}`}>{c}</button>
                   ))}
                </div>
                <button onClick={() => setIsAdmin(false)} className="bg-red-50 text-red-500 px-10 py-5 rounded-3xl font-black hover:bg-red-500 hover:text-white transition-all shadow-2xl shadow-red-50 uppercase tracking-widest text-xs">Fèmen Seksyon an</button>
              </div>

              {/* Shelf Visualization */}
              <div className="bg-white rounded-[5rem] p-16 shadow-2xl border border-slate-100 relative overflow-hidden">
                <div className="flex flex-col md:flex-row items-center justify-between mb-12 gap-6 relative z-10">
                  <h3 className="text-3xl font-black text-slate-900 uppercase tracking-tighter italic">Galri {adminCategory} <span className="text-blue-600 opacity-40">/ 30 Plas</span></h3>
                </div>
                
                <div className="grid grid-cols-3 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-10 gap-5 relative z-10">
                  {adminSlots.map((slot, idx) => (
                    <div 
                      key={slot.id} 
                      onClick={() => {
                        if (slot.isPlaceholder) {
                          setEditingId(null);
                          setNewProduct({ category: adminCategory, name: '', price: 0, description: '', image: '', seller: '$emilien' });
                        } else {
                          setEditingId(slot.id);
                          setNewProduct(slot);
                        }
                        document.getElementById('product-form')?.scrollIntoView({ behavior: 'smooth' });
                      }}
                      className={`aspect-square rounded-[2rem] flex flex-col items-center justify-center p-2 cursor-pointer transition-all border-4 group relative ${slot.isPlaceholder ? 'bg-slate-50 border-dashed border-slate-200 hover:border-blue-400 hover:bg-white shadow-inner' : 'bg-white border-white shadow-lg hover:border-blue-600 hover:scale-110'}`}
                    >
                      {slot.isPlaceholder ? (
                        <svg className="w-6 h-6 text-slate-200 group-hover:text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M12 4v16m8-8H4" /></svg>
                      ) : (
                        <img src={slot.image} className="w-full h-full object-cover rounded-2xl" alt="" />
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Form Section */}
              <div id="product-form" className="max-w-4xl mx-auto bg-white p-16 rounded-[5rem] shadow-3xl border border-blue-100 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-2 bg-blue-600"></div>
                <div className="text-center mb-12">
                  <h3 className="text-4xl font-black text-slate-900 tracking-tighter uppercase mb-4">{editingId ? 'EDITE PWODWI' : 'METE NOUVO ATIK'}</h3>
                </div>
                
                <form onSubmit={handleSaveProduct} className="space-y-10">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                    <div className="space-y-6">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] ml-6">Non Pwodwi</label>
                        <input type="text" required className="w-full bg-slate-50 border-3 border-slate-100 rounded-[2rem] px-8 py-5 outline-none font-bold text-lg focus:border-blue-500 transition-all shadow-inner" value={newProduct.name || ''} onChange={e => setNewProduct({...newProduct, name: e.target.value})} />
                      </div>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] ml-6">Kategori</label>
                          <select className="w-full bg-slate-50 border-3 border-slate-100 rounded-[2rem] px-8 py-5 outline-none font-black text-slate-600 shadow-inner appearance-none" value={newProduct.category} onChange={e => setNewProduct({...newProduct, category: e.target.value as Category})}>
                            {CATEGORIES.filter(c => c !== 'Tout').map(c => <option key={c} value={c}>{c}</option>)}
                          </select>
                        </div>
                        <div className="space-y-2">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] ml-6">Pri (HTG)</label>
                          <input type="number" required className="w-full bg-slate-50 border-3 border-slate-100 rounded-[2rem] px-8 py-5 outline-none font-black text-blue-600 text-xl shadow-inner focus:border-blue-500 transition-all" value={newProduct.price || ''} onChange={e => setNewProduct({...newProduct, price: Number(e.target.value)})} />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] ml-6">Mèt Atik la ($tag)</label>
                        <input type="text" required className="w-full bg-slate-50 border-3 border-slate-100 rounded-[2rem] px-8 py-5 outline-none font-black text-blue-600 shadow-inner focus:border-blue-500 transition-all" value={newProduct.seller || ''} onChange={e => setNewProduct({...newProduct, seller: e.target.value})} />
                      </div>
                      
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] ml-6">Deskripsyon</label>
                        <textarea required className="w-full bg-slate-50 border-3 border-slate-100 rounded-[2.5rem] px-8 py-5 outline-none font-medium h-48 resize-none focus:border-blue-500 transition-all shadow-inner" value={newProduct.description || ''} onChange={e => setNewProduct({...newProduct, description: e.target.value})} />
                      </div>
                    </div>

                    <div className="space-y-6">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] ml-6">Foto (Klike anba pou chwazi)</label>
                        <div 
                          onClick={triggerFilePicker}
                          className="aspect-[4/5] bg-slate-50 rounded-[3rem] border-4 border-dashed border-slate-100 flex items-center justify-center overflow-hidden relative group shadow-inner cursor-pointer hover:border-blue-600 transition-all hover:bg-blue-50"
                        >
                          <input 
                            type="file" 
                            ref={fileInputRef} 
                            onChange={handleFileUpload} 
                            accept="image/*" 
                            className="hidden" 
                          />
                          {newProduct.image ? (
                            <>
                              <img src={newProduct.image} className="w-full h-full object-cover transition-transform group-hover:scale-105" alt="Preview" />
                              <div className="absolute inset-0 bg-blue-600/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                 <div className="bg-white px-6 py-3 rounded-2xl font-black text-blue-600 shadow-xl text-[10px] uppercase">CHANJE FOTO SA A</div>
                              </div>
                            </>
                          ) : (
                            <div className="text-center p-10 space-y-4">
                              <div className="w-20 h-20 bg-white rounded-[2rem] mx-auto flex items-center justify-center text-slate-200 shadow-xl group-hover:text-blue-600 group-hover:scale-110 transition-all">
                                 <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M12 4v16m8-8H4" /></svg>
                              </div>
                              <p className="text-xs font-black text-slate-300 uppercase tracking-widest group-hover:text-blue-600">CHWAZI YON FOTO</p>
                            </div>
                          )}
                        </div>
                        <input type="text" placeholder="Oswa kole yon lyen foto isit la..." className="w-full mt-4 bg-slate-50 border-2 border-slate-100 rounded-xl px-4 py-2 text-[10px] outline-none font-medium text-slate-400" value={newProduct.image || ''} onChange={e => setNewProduct({...newProduct, image: e.target.value})} />
                      </div>
                    </div>
                  </div>

                  <div className="pt-10 flex flex-col sm:flex-row gap-6">
                    <button type="submit" className="flex-grow bg-blue-600 hover:bg-blue-700 text-white py-8 rounded-[3rem] font-black text-2xl shadow-3xl shadow-blue-200 active:scale-95 transition-all uppercase tracking-tighter">
                      {editingId ? 'KONFIME CHANJMAN' : 'METE ATIK LA NAN FENÈT LA'}
                    </button>
                    {editingId && (
                      <button type="button" onClick={() => deleteProduct(editingId)} className="bg-red-50 text-red-500 px-12 py-8 rounded-[3rem] font-black uppercase tracking-widest text-xs hover:bg-red-500 hover:text-white transition-all">EFASYON</button>
                    )}
                  </div>
                </form>
              </div>
            </div>
          )
        )}
      </main>

      {/* Auth Modal (PIN 2025) */}
      {showLoginModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/90 backdrop-blur-xl" onClick={() => setShowLoginModal(false)}>
          <div className="relative bg-white w-full max-w-sm rounded-[4rem] p-12 text-center animate-in zoom-in" onClick={e => e.stopPropagation()}>
            <div className="w-20 h-20 bg-blue-600 rounded-3xl mx-auto mb-8 flex items-center justify-center text-white shadow-2xl">
               <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
            </div>
            <h3 className="text-3xl font-black text-slate-900 mb-2 tracking-tighter uppercase">KÒD MÈT BOUTIK</h3>
            <p className="text-slate-400 font-bold mb-8 italic text-sm">Sèl mèt boutik la ki ka antre isit la.</p>
            <form onSubmit={handleAdminAuth} className="space-y-6">
              <input type="password" required className={`w-full text-center text-5xl tracking-[0.5em] bg-slate-50 border-3 ${authError ? 'border-red-500 animate-shake' : 'border-slate-100'} rounded-[2.5rem] py-6 outline-none font-black focus:border-blue-500 transition-all`} placeholder="****" value={pinInput} onChange={e => setPinInput(e.target.value)} autoFocus />
              <button type="submit" className="w-full bg-blue-600 text-white py-6 rounded-[2.5rem] font-black text-xl shadow-2xl hover:bg-blue-700 active:scale-95 transition-all uppercase tracking-widest">ANTRE</button>
            </form>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="bg-white border-t border-slate-100 py-24 px-4 text-center">
        <div className="max-w-4xl mx-auto space-y-8">
          <div className="flex items-center justify-center gap-4">
            <div className={`w-12 h-12 ${isAdmin ? 'bg-blue-600' : 'bg-slate-900'} rounded-[1.5rem] flex items-center justify-center font-black text-white text-xl italic`}>RES</div>
            <span className="font-black text-3xl tracking-tighter uppercase text-slate-900">LA FAMILLE RES</span>
          </div>
          <div className="text-[10px] text-slate-300 font-black uppercase tracking-[0.8em]">© 2024 - 2025 RES BOUTIQUE - TOUT DWA REZÈVE</div>
        </div>
      </footer>

      {/* Floating WhatsApp */}
      <a href={`https://wa.me/${DIRECT_PHONE.replace(/\D/g, '')}`} target="_blank" rel="noreferrer" className="fixed bottom-10 left-10 z-[100] bg-green-500 text-white w-20 h-20 rounded-[2.5rem] shadow-3xl flex items-center justify-center hover:scale-110 active:scale-90 transition-all group">
         <svg className="w-10 h-10" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" /></svg>
      </a>

      {/* Modals */}
      <CartSidebar isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} items={cartItems} onRemove={id => setCartItems(prev => prev.filter(i => i.id !== id))} onUpdateQty={(id, qty) => setCartItems(prev => prev.map(i => i.id === id ? {...i, quantity: qty} : i))} onCheckout={(m) => {
        const seller = cartItems.length > 0 ? cartItems[0].seller : '$emilien';
        setPaymentStep({method: m, total: cartItems.reduce((a, b) => a + b.price * b.quantity, 0), seller});
      }} />
      
      {selectedCommentProduct && (
        <CommentModal product={selectedCommentProduct} comments={productComments[selectedCommentProduct.id] || []} onClose={() => setSelectedCommentProduct(null)} onAddComment={(t, u) => addComment(selectedCommentProduct.id, t, u)} isAdmin={isAdmin} onDeleteComment={id => deleteComment(selectedCommentProduct.id, id)} />
      )}

      {paymentStep && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/95 backdrop-blur-2xl" onClick={() => setPaymentStep(null)}>
          <div className="relative bg-white w-full max-w-xl rounded-[4rem] p-16 shadow-3xl animate-in zoom-in" onClick={e => e.stopPropagation()}>
             <h3 className="text-4xl font-black text-center mb-10 tracking-tighter uppercase">Peman {paymentStep.method}</h3>
             <div className="bg-slate-50 p-12 rounded-[3.5rem] border-3 border-slate-100 text-center shadow-inner">
                <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">Montan total</p>
                <p className="text-6xl font-black text-slate-900 mb-10 tracking-tighter italic">HTG {paymentStep.total.toLocaleString()}</p>
                <div className="flex flex-col gap-4">
                  <p className="text-xs font-black text-slate-400 uppercase tracking-widest italic">Voye montan sa a nan:</p>
                  <div className="flex items-center justify-between bg-white p-6 rounded-[2rem] border border-slate-200 shadow-xl">
                      <div className="text-left">
                        <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest">{getPaymentDetails(paymentStep.method, paymentStep.seller).label}</p>
                        <p className="text-3xl font-black text-slate-900 tracking-tighter">{getPaymentDetails(paymentStep.method, paymentStep.seller).value}</p>
                      </div>
                      <button onClick={() => {navigator.clipboard.writeText(getPaymentDetails(paymentStep.method, paymentStep.seller).value); showSuccess("Kopye!");}} className="w-14 h-14 bg-blue-600 text-white rounded-2xl flex items-center justify-center shadow-lg hover:scale-110 active:scale-95 transition-all">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" /></svg>
                      </button>
                  </div>
                </div>
             </div>
             <button onClick={() => {setCartItems([]); setPaymentStep(null); setIsCartOpen(false); showSuccess("Mèsi bòs!");}} className="w-full bg-slate-900 text-white py-8 rounded-[3rem] font-black text-2xl shadow-3xl mt-12 hover:bg-black active:scale-95 transition-all uppercase">Mwen fin voye l</button>
          </div>
        </div>
      )}

      <style>{`
        @keyframes shake { 0%, 100% { transform: translateX(0); } 25% { transform: translateX(-10px); } 75% { transform: translateX(10px); } }
        .animate-shake { animation: shake 0.2s ease-in-out 0s 2; }
        .shadow-3xl { box-shadow: 0 35px 60px -15px rgba(0, 0, 0, 0.3); }
      `}</style>
    </div>
  );
};

export default App;
