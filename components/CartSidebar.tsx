
import React from 'react';
import { CartItem, PaymentMethod } from '../types';

interface CartSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  onRemove: (id: string) => void;
  onUpdateQty: (id: string, qty: number) => void;
  onCheckout: (method: PaymentMethod) => void;
}

const CartSidebar: React.FC<CartSidebarProps> = ({ 
  isOpen, 
  onClose, 
  items, 
  onRemove, 
  onUpdateQty,
  onCheckout
}) => {
  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      
      <div className="relative w-full max-w-md bg-white h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
        <div className="p-6 border-b flex items-center justify-between">
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
            Charyo RES
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="flex-grow overflow-y-auto p-6 space-y-8">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-slate-400 space-y-4">
              <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center">
                <svg className="w-12 h-12 opacity-20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <p className="text-lg font-bold">Charyo a vid!</p>
              <button 
                onClick={onClose}
                className="text-blue-600 font-bold hover:underline"
              >
                Al fè chwa ou kounye a
              </button>
            </div>
          ) : (
            items.map((item) => (
              <div key={item.id} className="flex gap-4 group">
                <div className="relative shrink-0">
                  <img src={item.image} alt={item.name} className="w-20 h-24 object-cover rounded-2xl shadow-sm border border-slate-100" />
                  <span className="absolute -top-2 -right-2 bg-slate-900 text-white text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center border-2 border-white">
                    {item.quantity}
                  </span>
                </div>
                <div className="flex-grow flex flex-col justify-between py-1">
                  <div>
                    <h4 className="font-bold text-slate-800 leading-tight">{item.name}</h4>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-slate-400 font-medium italic">Pri inite: HTG {item.price.toLocaleString()}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between mt-3">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1 bg-slate-50 rounded-xl p-1 border border-slate-100">
                        <button 
                          onClick={() => onUpdateQty(item.id, Math.max(1, item.quantity - 1))}
                          className="w-7 h-7 rounded-lg bg-white shadow-sm flex items-center justify-center hover:bg-slate-50 active:scale-90 transition-all font-bold text-slate-600"
                        >
                          -
                        </button>
                        <span className="font-black text-sm w-6 text-center">{item.quantity}</span>
                        <button 
                          onClick={() => onUpdateQty(item.id, item.quantity + 1)}
                          className="w-7 h-7 rounded-lg bg-white shadow-sm flex items-center justify-center hover:bg-slate-50 active:scale-90 transition-all font-bold text-slate-600"
                        >
                          +
                        </button>
                      </div>
                      {item.quantity > 1 && (
                        <span className="text-[10px] font-black text-blue-600 bg-blue-50 px-2.5 py-1.5 rounded-lg border border-blue-100 animate-in fade-in zoom-in duration-300">
                          Total: HTG {(item.price * item.quantity).toLocaleString()}
                        </span>
                      )}
                    </div>
                    <button 
                      onClick={() => onRemove(item.id)}
                      className="text-xs font-bold text-red-400 hover:text-red-600 uppercase tracking-wider transition-colors"
                    >
                      Retire
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {items.length > 0 && (
          <div className="p-6 border-t bg-slate-50 space-y-4 shadow-[0_-10px_20px_-15px_rgba(0,0,0,0.1)]">
            <div className="flex justify-between items-center py-2">
              <span className="text-slate-500 font-bold uppercase tracking-widest text-xs">Montan Global</span>
              <span className="text-2xl font-black text-slate-900">HTG {total.toLocaleString()}</span>
            </div>
            
            <div className="grid grid-cols-1 gap-3">
              <button 
                onClick={() => onCheckout('MonCash')}
                className="w-full bg-[#E51D24] text-white py-4 rounded-2xl font-black flex items-center justify-center gap-3 shadow-lg shadow-red-100 hover:opacity-90 active:scale-[0.98] transition-all"
              >
                Peye ak MonCash
              </button>
              <button 
                onClick={() => onCheckout('Wise')}
                className="w-full bg-[#00B9FF] text-white py-4 rounded-2xl font-black flex items-center justify-center gap-3 shadow-lg shadow-blue-100 hover:opacity-90 active:scale-[0.98] transition-all"
              >
                Peye ak Wise
              </button>
              <button 
                onClick={() => onCheckout('Bank')}
                className="w-full bg-slate-900 text-white py-4 rounded-2xl font-black flex items-center justify-center gap-3 shadow-lg shadow-slate-200 hover:opacity-90 active:scale-[0.98] transition-all"
              >
                Transfè Bankè
              </button>
            </div>
            <p className="text-[10px] text-slate-400 text-center font-bold uppercase tracking-widest">
              Lajistis pral voye yon imèl konfimasyon
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CartSidebar;
