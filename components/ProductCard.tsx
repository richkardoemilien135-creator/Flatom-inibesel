
import React from 'react';
import { Product } from '../types';

interface ProductCardProps {
  product: Product & { isPlaceholder?: boolean };
  onAddToCart: (p: Product) => void;
  onReserve: (p: Product) => void;
  onOpenComments: (p: Product) => void;
  commentCount: number;
  ownerPhone: string;
  isAdmin?: boolean;
  onAdminAction?: () => void;
}

const ProductCard: React.FC<ProductCardProps> = ({ 
  product, 
  onAddToCart, 
  onReserve, 
  onOpenComments, 
  commentCount,
  ownerPhone,
  isAdmin,
  onAdminAction
}) => {
  if (product.isPlaceholder) {
    return (
      <div 
        onClick={onAdminAction}
        className={`relative group bg-slate-100/50 rounded-[3rem] border-4 border-dashed border-slate-200 h-[500px] flex flex-col items-center justify-center p-12 text-center transition-all duration-700 ${isAdmin ? 'cursor-pointer hover:border-blue-500 hover:bg-blue-50/50 hover:scale-105' : 'opacity-60'}`}
      >
        <div className={`w-24 h-24 rounded-[2rem] flex items-center justify-center mb-8 transition-all duration-700 ${isAdmin ? 'bg-blue-600 text-white shadow-2xl shadow-blue-100 group-hover:rotate-180' : 'bg-white text-slate-200 shadow-inner'}`}>
          {isAdmin ? (
            <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="4" d="M12 4v16m8-8H4" /></svg>
          ) : (
            <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          )}
        </div>
        <h3 className="font-black text-slate-400 text-2xl tracking-tighter uppercase leading-none">{isAdmin ? 'Ranpli Plas sa a' : 'Vini Talè'}</h3>
        <p className="text-[10px] text-slate-300 font-black uppercase tracking-[0.4em] mt-6">FENÈT # {product.id.split('-').pop()}</p>
        
        {isAdmin && (
          <div className="absolute inset-x-12 bottom-12 opacity-0 group-hover:opacity-100 transition-all transform translate-y-4 group-hover:translate-y-0">
            <span className="text-[10px] font-black text-blue-600 bg-white px-8 py-3 rounded-2xl shadow-xl border border-blue-50 tracking-widest uppercase">RANPLI FENÈT SA</span>
          </div>
        )}
      </div>
    );
  }

  const whatsappLink = `https://wa.me/${ownerPhone.replace(/\D/g, '')}?text=${encodeURIComponent(
    `Bonjou bòs RES, mwen enterese nan "${product.name}" (HTG ${product.price.toLocaleString()}) nan fenèt la. Mèt la se ${product.seller}. Èske l disponib?`
  )}`;

  return (
    <div className="bg-white rounded-[3rem] shadow-xl hover:shadow-3xl hover:shadow-blue-200/50 transition-all duration-700 group flex flex-col h-full border-4 border-white overflow-hidden relative">
      <div className="relative aspect-[4/5] overflow-hidden bg-slate-100">
        <img src={product.image} alt={product.name} className="w-full h-full object-cover group-hover:scale-125 transition-transform duration-[1.5s]" />
        
        {/* Badges */}
        <div className="absolute top-6 left-6 flex flex-col gap-2">
           <div className="bg-white/95 backdrop-blur-md px-5 py-2 rounded-2xl text-[10px] font-black uppercase tracking-widest text-slate-900 shadow-xl border border-white/50">{product.category}</div>
           {product.seller && (
             <div className="bg-amber-400 text-white px-4 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest shadow-lg w-fit">Mèt: {product.seller}</div>
           )}
        </div>
        
        <div className="absolute top-6 right-6 bg-slate-900/90 backdrop-blur-md text-white text-[9px] font-black px-4 py-2 rounded-2xl uppercase tracking-[0.2em] shadow-2xl border border-white/20">F-{product.id.slice(-2)}</div>
        
        {/* Admin Edit Trigger */}
        {isAdmin && (
           <div 
             onClick={onAdminAction}
             className="absolute inset-0 bg-blue-600/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer z-10"
           >
             <div className="bg-white px-8 py-4 rounded-3xl font-black text-blue-600 shadow-2xl scale-75 group-hover:scale-100 transition-transform">
               MODIYE FENÈT LA
             </div>
           </div>
        )}
      </div>
      
      <div className="p-8 flex flex-col flex-grow">
        <div className="flex justify-between items-start mb-3">
          <h3 className="font-black text-2xl text-slate-900 leading-none group-hover:text-blue-600 transition-colors tracking-tighter uppercase">{product.name}</h3>
          <button onClick={() => onOpenComments(product)} className="flex items-center gap-2 text-slate-300 hover:text-blue-600 transition-colors bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-100">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" /></svg>
            <span className="text-xs font-black">{commentCount}</span>
          </button>
        </div>
        <p className="text-slate-400 text-sm mb-8 line-clamp-2 font-medium italic">"{product.description}"</p>
        <div className="mb-10 flex items-end gap-2">
           <span className="text-4xl font-black text-slate-900 tracking-tighter italic">HTG {product.price.toLocaleString()}</span>
        </div>
        
        <div className="space-y-4 mt-auto">
          <a href={whatsappLink} target="_blank" rel="noreferrer" className="w-full bg-green-500 hover:bg-green-600 text-white py-5 rounded-[2rem] font-black text-xs uppercase tracking-[0.2em] flex items-center justify-center gap-3 shadow-2xl transition-all active:scale-95">
             ACHTE SOU WHATSAPP
          </a>
          <div className="grid grid-cols-2 gap-4">
            <button onClick={() => onAddToCart(product)} className="bg-slate-900 hover:bg-black text-white py-5 rounded-[1.5rem] font-black text-[10px] uppercase tracking-widest shadow-2xl active:scale-95 transition-all">PANIER</button>
            <button onClick={() => onReserve(product)} className="bg-blue-50 border-2 border-blue-100 text-blue-600 py-5 rounded-[1.5rem] font-black text-[10px] uppercase tracking-widest hover:bg-blue-100 active:scale-95 transition-all">REZÈVE</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
