import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Play, Zap, Heart, Check, Share2, Star } from 'lucide-react';

const MovieDetail = ({ selectedItem, onClose, onAddToAi, isFavorite, toggleFavorite, onSimilarClick, onActorClick }) => {
  const [playingTrailer, setPlayingTrailer] = useState(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const handleEsc = (e) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  useEffect(() => {
    const container = document.getElementById('detail-content');
    if (container) container.scrollTop = 0;
  }, [selectedItem.id]);

  const getTrailerKey = (details) => {
    if (!details.videos || !details.videos.results) return null;
    const trailer = details.videos.results.find(
      vid => vid.site === "YouTube" && (vid.type === "Trailer" || vid.type === "Teaser")
    );
    return trailer ? trailer.key : null;
  };

  const handleShare = () => {
    const text = `Fluxify'da bunu keşfet: ${selectedItem.title || selectedItem.name}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <AnimatePresence mode='wait'>
      <motion.div 
        key="modal-overlay"
        initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} 
        className="fixed inset-0 z-[200] flex items-center justify-center p-0 md:p-10 bg-black/80 backdrop-blur-md"
      >
        <div className="absolute inset-0" onClick={onClose} />

        <motion.div 
          key={selectedItem.id}
          initial={{scale:0.95, y:20, opacity: 0}} animate={{scale:1, y:0, opacity: 1}} exit={{scale:0.95, y:20, opacity: 0}}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          className="w-full max-w-6xl h-full md:max-h-[90vh] bg-[#0a0a0a] md:rounded-[2.5rem] border border-white/10 overflow-hidden flex flex-col md:flex-row shadow-[0_0_100px_rgba(0,0,0,0.8)] relative z-10"
        >
          <button onClick={onClose} className="absolute top-6 right-6 z-[210] p-2.5 bg-black/20 hover:bg-red-500 hover:text-white text-white/50 rounded-full transition-all border border-white/5 backdrop-blur-md"><X size={20}/></button>
          
          <div className="w-full md:w-[400px] shrink-0 relative flex flex-col bg-[#111]">
            <div className="relative h-full">
               <img src={`https://image.tmdb.org/t/p/w500${selectedItem.poster_path}`} className="w-full h-full object-cover opacity-80" />
               <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-[#0a0a0a]/20 to-transparent" />
            </div>
            
            <div className="p-8 absolute bottom-0 w-full space-y-4">
               <div className="flex gap-3 items-center">
                  <Stat label="Rating" val={selectedItem.vote_average?.toFixed(1)} />
                  <Stat label="Yıl" val={(selectedItem.release_date || selectedItem.first_air_date)?.split('-')[0]} />
                  <Stat label="Süre" val={selectedItem.runtime ? `${selectedItem.runtime} dk` : 'N/A'} />
               </div>
               
               <div className="flex flex-col gap-2">
                 <div className="flex gap-2">
                    {getTrailerKey(selectedItem) && (
                        <button 
                        onClick={() => setPlayingTrailer(getTrailerKey(selectedItem))}
                        className="flex-1 py-3 rounded-xl bg-cyan-400 text-black font-black uppercase text-[10px] tracking-widest hover:bg-cyan-300 transition-all flex items-center justify-center gap-2"
                        >
                        <Play size={14} fill="currentColor" /> Fragman
                        </button>
                    )}
                    <button onClick={() => toggleFavorite(selectedItem)} className={`px-4 rounded-xl border font-bold transition-all ${isFavorite ? 'bg-red-500 border-red-500 text-white' : 'bg-white/5 border-white/10 text-white hover:bg-white/10'}`}>
                        {isFavorite ? <Check size={18} /> : <Heart size={18} />}
                    </button>
                    <button onClick={handleShare} className="px-4 rounded-xl border border-white/10 bg-white/5 text-white hover:bg-white/10 transition-all relative">
                        {copied ? <Check size={18} className="text-green-400"/> : <Share2 size={18} />}
                    </button>
                 </div>

                 <button onClick={() => onAddToAi(selectedItem)} className="w-full py-3 rounded-xl bg-white/5 border border-white/10 text-gray-300 font-bold uppercase text-[10px] tracking-widest hover:bg-white hover:text-black transition-all flex items-center justify-center gap-2 group">
                   <Zap size={14} className="group-hover:animate-bounce" /> Senteze Ekle
                 </button>
               </div>
            </div>
          </div>

          <div id="detail-content" className="flex-1 p-8 md:p-12 overflow-y-auto custom-scrollbar flex flex-col bg-gradient-to-br from-[#0a0a0a] to-[#050505]">
            <div className="flex flex-wrap gap-2 mb-6">
              {selectedItem.genres?.map(g => (
                <span key={g.id} className="px-3 py-1 bg-white/5 border border-white/10 rounded-full text-[9px] font-bold uppercase text-gray-400 tracking-widest">{g.name}</span>
              ))}
            </div>
            
            <h2 className="text-4xl md:text-5xl font-black uppercase tracking-tighter leading-[0.9] mb-6 text-transparent bg-clip-text bg-gradient-to-br from-white to-gray-500">
                {selectedItem.title || selectedItem.name}
            </h2>
            
            <div className="space-y-10">
              <div>
                <h4 className="flex items-center gap-2 text-cyan-400 text-[10px] font-black uppercase tracking-[0.2em] mb-3"><span className="w-8 h-[1px] bg-cyan-400"></span> Özet</h4>
                <p className="text-base md:text-lg font-medium text-gray-400 leading-relaxed max-w-2xl">{selectedItem.overview || "Bu içerik için özet bilgisi bulunmuyor."}</p>
              </div>

              <div>
                <h4 className="flex items-center gap-2 text-cyan-400 text-[10px] font-black uppercase tracking-[0.2em] mb-4"><span className="w-8 h-[1px] bg-cyan-400"></span> Oyuncular</h4>
                <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide -ml-2 px-2">
                  {selectedItem.credits?.cast.slice(0, 8).map(c => (
                    <div 
                        key={c.id} 
                        onClick={() => onActorClick(c.id, c.name)}
                        className="min-w-[100px] flex flex-col gap-2 group cursor-pointer"
                >
                       <div className="overflow-hidden rounded-xl border border-white/5 aspect-[3/4] relative">
                         <img src={c.profile_path ? `https://image.tmdb.org/t/p/w200${c.profile_path}` : 'https://via.placeholder.com/150'} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500" />
                         <div className="absolute inset-0 bg-cyan-400/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <Zap size={20} className="text-white drop-shadow-lg" />
                         </div>
                       </div>
                       <div>
                            <p className="font-bold text-[10px] uppercase truncate text-gray-300 group-hover:text-cyan-400 transition-colors">{c.name}</p>
                            <p className="text-[9px] text-gray-600 uppercase truncate">{c.character}</p>
                       </div>
                    </div>
                  ))}
                </div>
              </div>

              {selectedItem.similar && selectedItem.similar.results.length > 0 && (
                <div>
                    <h4 className="flex items-center gap-2 text-cyan-400 text-[10px] font-black uppercase tracking-[0.2em] mb-4"><span className="w-8 h-[1px] bg-cyan-400"></span> Bunları da Sevebilirsin</h4>
                    <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide -ml-2 px-2">
                        {selectedItem.similar.results.slice(0, 10).map(m => (
                            <div key={m.id} onClick={() => onSimilarClick(m.id)} className="min-w-[140px] group cursor-pointer relative">
                                <div className="aspect-[3/4.5] rounded-xl overflow-hidden border border-white/5 mb-2 relative">
                                    <img src={m.poster_path ? `https://image.tmdb.org/t/p/w200${m.poster_path}` : 'https://via.placeholder.com/150'} className="w-full h-full object-cover opacity-70 group-hover:opacity-100 transition-opacity" />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-80" />
                                    <span className="absolute bottom-2 left-2 text-[9px] font-bold text-yellow-500 flex items-center gap-1">
                                        <Star size={8} fill="currentColor" /> {m.vote_average?.toFixed(1)}
                                    </span>
                                </div>
                                <p className="text-[10px] font-bold text-gray-400 group-hover:text-white truncate transition-colors">{m.title || m.name}</p>
                            </div>
                        ))}
                    </div>
                </div>
              )}
            </div>
          </div>

          {playingTrailer && (
            <div className="absolute inset-0 z-[300] bg-black flex items-center justify-center">
              <button onClick={() => setPlayingTrailer(null)} className="absolute top-6 right-6 p-4 text-white hover:text-red-500 transition-colors z-50"><X size={32} /></button>
              <iframe width="100%" height="100%" src={`https://www.youtube.com/embed/${playingTrailer}?autoplay=1&rel=0`} title="YouTube" frameBorder="0" allow="autoplay; encrypted-media" allowFullScreen></iframe>
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

const Stat = ({ label, val }) => (
  <div className="flex-1 bg-white/5 p-2.5 rounded-lg border border-white/5 text-center">
    <p className="text-[8px] text-gray-500 font-mono uppercase tracking-widest mb-0.5">{label}</p>
    <p className="text-xs font-bold text-gray-200">{val}</p>
  </div>
);

export default MovieDetail;