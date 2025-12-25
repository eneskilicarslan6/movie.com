import React, { memo } from 'react';
import { motion } from 'framer-motion';
import { Star } from 'lucide-react';

const ItemCard = memo(({ item, onClick }) => (
  <motion.div 
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    whileHover={{ y: -5 }} 
    transition={{ duration: 0.2 }}
    onClick={onClick} 
    className="group cursor-pointer relative"
  >
    <div className="aspect-[3/4.5] rounded-xl overflow-hidden border border-white/5 relative bg-[#111] transition-all group-hover:border-cyan-400/50 group-hover:shadow-lg shadow-black/50">
      
      <img 
        src={`https://image.tmdb.org/t/p/w300${item.poster_path}`} 
        className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity duration-300" 
        loading="lazy"
        alt={item.title || item.name}
      />

      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent opacity-90" />
      
      <div className="absolute bottom-0 left-0 right-0 p-3 transform translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
        <h3 className="font-bold text-[11px] leading-tight text-white mb-1 line-clamp-2">
          {item.title || item.name}
        </h3>
        
        <div className="flex items-center justify-between mt-2 opacity-60 group-hover:opacity-100 transition-opacity">
           <span className="text-[9px] font-mono text-cyan-400 uppercase tracking-widest bg-cyan-400/10 px-1.5 py-0.5 rounded">
             {(item.release_date || item.first_air_date)?.split('-')[0] || 'N/A'}
           </span>
           <div className="flex items-center gap-1 text-[9px] font-bold text-yellow-500">
             <Star size={8} fill="currentColor" />
             {item.vote_average?.toFixed(1)}
           </div>
        </div>
      </div>
    </div>
  </motion.div>
));

export default ItemCard;