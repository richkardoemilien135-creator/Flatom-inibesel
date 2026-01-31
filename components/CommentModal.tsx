
import React, { useState } from 'react';
import { Product, Comment } from '../types';

interface CommentModalProps {
  product: Product;
  comments: Comment[];
  onClose: () => void;
  onAddComment: (text: string, userName: string) => void;
  isAdmin?: boolean;
  onDeleteComment?: (id: string) => void;
}

const CommentModal: React.FC<CommentModalProps> = ({ 
  product, 
  comments, 
  onClose, 
  onAddComment,
  isAdmin,
  onDeleteComment
}) => {
  const [userName, setUserName] = useState('');
  const [commentText, setCommentText] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userName.trim() || !commentText.trim()) return;
    onAddComment(commentText, userName);
    setCommentText('');
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" onClick={onClose} />
      <div className="relative bg-white w-full max-w-xl rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in duration-300">
        {/* Header */}
        <div className="p-6 border-b flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-4">
            <img src={product.image} className="w-12 h-12 rounded-xl object-cover shadow-sm" alt={product.name} />
            <div>
              <h3 className="font-bold text-slate-800 leading-tight">{product.name}</h3>
              <p className="text-xs text-blue-600 font-black uppercase tracking-wider">Kòmantè ak Revi</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full transition-colors text-slate-500">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Comments List */}
        <div className="flex-grow overflow-y-auto p-6 space-y-6">
          {comments.length === 0 ? (
            <div className="text-center py-12 text-slate-400">
              <svg className="w-16 h-16 mx-auto mb-4 opacity-20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              <p className="font-medium italic">Pa gen kòmantè ankò. Se ou menm ki pou premye!</p>
            </div>
          ) : (
            comments.map((c) => (
              <div key={c.id} className="bg-slate-50 p-4 rounded-2xl border border-slate-100 relative group">
                <div className="flex justify-between items-start mb-2">
                  <span className="font-black text-slate-800 text-sm">{c.userName}</span>
                  <div className="flex items-center gap-3">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{c.date}</span>
                    {isAdmin && onDeleteComment && (
                      <button 
                        onClick={() => onDeleteComment(c.id)}
                        className="text-red-500 hover:bg-red-50 p-1 rounded transition-colors"
                        title="Efase kòmantè sa a"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    )}
                  </div>
                </div>
                <p className="text-slate-600 text-sm leading-relaxed">{c.text}</p>
              </div>
            ))
          )}
        </div>

        {/* Input Form */}
        <div className="p-6 border-t bg-white">
          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="text"
              placeholder="Non ou..."
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none font-medium text-sm transition-all"
              required
            />
            <div className="flex gap-2">
              <textarea
                placeholder="Ekri kòmantè w la..."
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                className="flex-grow px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none font-medium text-sm resize-none h-20 transition-all"
                required
              />
              <button
                type="submit"
                className="bg-blue-600 text-white px-6 rounded-2xl font-bold hover:bg-blue-700 transition-all flex items-center justify-center shadow-lg shadow-blue-100"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CommentModal;
