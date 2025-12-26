import React from 'react';
import { X, ArrowDownUp, Calendar, Star, Layers, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const FilterPanel = ({ isOpen, closePanel, filters, setFilters, genres }) => {
  
  const handleChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          className="overflow-hidden border-b border-white/5 bg-[#080808]"
        >
          {/* MOBİL İÇİN GRID AYARI: grid-cols-1 md:grid-cols-4 */}
          <div className="p-6 md:p-8 grid grid-cols-1 md:grid-cols-4 gap-6 md:gap-8 max-w-7xl mx-auto relative">
            
            <button onClick={closePanel} className="absolute top-2 right-2 p-2 text-gray-500 hover:text-white md:hidden">
              <X size={20} />
            </button>

            <div className="space-y-3">
              <label className="flex items-center gap-2 text-[10px] font-bold text-cyan-400 uppercase tracking-widest">
                <Layers size={12} /> Tür
              </label>
              <div className="relative">
                <select 
                  value={filters.genre} 
                  onChange={(e) => handleChange('genre', e.target.value)}
                  style={{ colorScheme: 'dark' }} 
                  className="w-full bg-[#111] border border-white/10 rounded-xl px-4 py-3 text-[11px] font-bold uppercase outline-none focus:border-cyan-400 text-gray-200 appearance-none cursor-pointer hover:bg-white/5 transition-colors shadow-inner"
                >
                  <option value="" className="bg-[#111] text-gray-400">Tüm Türler</option>
                  {genres.map(g => (
                    <option key={g.id} value={g.id} className="bg-[#111] text-white py-2">
                      {g.name}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" size={14} />
              </div>
            </div>

            <div className="space-y-3">
              <label className="flex items-center gap-2 text-[10px] font-bold text-cyan-400 uppercase tracking-widest">
                <Calendar size={12} /> Yıl ({filters.year || 'Tümü'})
              </label>
              <div className="px-1">
                <input 
                  type="range" 
                  min="1990" 
                  max="2025" 
                  value={filters.year || 2025} 
                  onChange={(e) => handleChange('year', e.target.value)}
                  className="w-full h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-cyan-400 hover:accent-cyan-300 transition-all"
                />
                <div className="flex justify-between text-[9px] text-gray-600 font-mono mt-2">
                  <span>1990</span>
                  <span>2025</span>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <label className="flex items-center gap-2 text-[10px] font-bold text-cyan-400 uppercase tracking-widest">
                <Star size={12} /> Puan ({filters.rating}+)
              </label>
              <div className="px-1">
                <input 
                  type="range" 
                  min="0" 
                  max="10" 
                  step="0.5"
                  value={filters.rating} 
                  onChange={(e) => handleChange('rating', e.target.value)}
                  className="w-full h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-cyan-400 hover:accent-cyan-300 transition-all"
                />
                <div className="flex justify-between text-[9px] text-gray-600 font-mono mt-2">
                  <span>0</span>
                  <span>10</span>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <label className="flex items-center gap-2 text-[10px] font-bold text-cyan-400 uppercase tracking-widest">
                <ArrowDownUp size={12} /> Sıralama
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button 
                  onClick={() => handleChange('sortBy', 'popularity.desc')}
                  className={`py-2.5 rounded-xl text-[10px] font-bold uppercase border transition-all ${filters.sortBy === 'popularity.desc' ? 'bg-cyan-400 text-black border-cyan-400' : 'bg-transparent text-gray-500 border-white/10 hover:border-white/30'}`}
                >
                  Popüler
                </button>
                <button 
                  onClick={() => handleChange('sortBy', 'vote_average.desc')}
                  className={`py-2.5 rounded-xl text-[10px] font-bold uppercase border transition-all ${filters.sortBy === 'vote_average.desc' ? 'bg-cyan-400 text-black border-cyan-400' : 'bg-transparent text-gray-500 border-white/10 hover:border-white/30'}`}
                >
                  En İyi
                </button>
              </div>
            </div>

          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default FilterPanel;