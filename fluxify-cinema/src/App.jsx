import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Cpu, LayoutGrid, Fingerprint, MonitorPlay, ChevronDown, Filter, Calendar, Star, X, Heart, Ghost, User, Plus, Film } from 'lucide-react';
import { fetchTrending, fetchGenres, fetchDetails, searchGlobal, fetchDiscovery } from './services/api';
import ItemCard from './components/ItemCard';
import MovieDetail from './components/MovieDetail';
import FilterPanel from './components/FilterPanel';

const App = () => {
  const [view, setView] = useState('home');
  const [mediaType, setMediaType] = useState('movie');
  const [genres, setGenres] = useState([]);
  
  const [favorites, setFavorites] = useState(() => {
    const saved = localStorage.getItem('fluxify_favorites');
    return saved ? JSON.parse(saved) : [];
  });

  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [filters, setFilters] = useState({
    genre: '',
    year: '',
    rating: 0,
    sortBy: 'popularity.desc',
    actorId: null,
    actorName: null
  });

  const [items, setItems] = useState([]);
  const [page, setPage] = useState(1);
  const [loadingMore, setLoadingMore] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [aiSlots, setAiSlots] = useState([]);
  const [aiResults, setAiResults] = useState([]);
  const [isScanning, setIsScanning] = useState(false);
  const [isSlotSearchOpen, setIsSlotSearchOpen] = useState(false);
  const [slotQuery, setSlotQuery] = useState("");
  const [slotResults, setSlotResults] = useState([]);

  useEffect(() => {
    localStorage.setItem('fluxify_favorites', JSON.stringify(favorites));
  }, [favorites]);

  useEffect(() => {
    document.oncontextmenu = (e) => e.preventDefault();
    initGenres();
    loadContent();
  }, [mediaType, filters.sortBy, filters.genre, filters.year, filters.rating, filters.actorId]);

  const toggleFavorite = (item) => {
    if (favorites.find(f => f.id === item.id)) {
        setFavorites(favorites.filter(f => f.id !== item.id));
    } else {
        setFavorites([item, ...favorites]);
    }
  };

  const initGenres = async () => {
    try { const res = await fetchGenres(mediaType); setGenres(res.data.genres); } catch (e) {}
  };

  const loadContent = async () => {
    setPage(1);
    try {
        const hasFilter = filters.genre || filters.year || filters.rating > 0 || filters.sortBy !== 'popularity.desc' || filters.actorId;
        const res = hasFilter 
            ? await fetchDiscovery(mediaType, filters, 1) 
            : await fetchTrending(mediaType, 1);
        setItems(res.data.results);
    } catch (e) {}
  };

  const loadMore = async () => {
    setLoadingMore(true);
    const nextPage = page + 1;
    try {
        const hasFilter = filters.genre || filters.year || filters.rating > 0 || filters.sortBy !== 'popularity.desc' || filters.actorId;
        const res = hasFilter 
            ? await fetchDiscovery(mediaType, filters, nextPage) 
            : await fetchTrending(mediaType, nextPage);
        setItems(prev => [...prev, ...res.data.results]);
        setPage(nextPage);
    } catch (e) {}
    setLoadingMore(false);
  };

  const handleSearch = async (val) => {
    setQuery(val);
    if (val.length > 2) {
      try { const res = await searchGlobal(mediaType, val); setResults(res.data.results); } catch (e) {}
    } else setResults([]);
  };

  const handleSlotSearch = async (val) => {
    setSlotQuery(val);
    if (val.length > 2) {
      try { 
          const res = await searchGlobal('movie', val); 
          setSlotResults(res.data.results); 
      } catch (e) {}
    } else setSlotResults([]);
  };

  const addFromSlotSearch = (item) => {
    if(aiSlots.length < 3 && !aiSlots.find(slot => slot.id === item.id)) {
        setAiSlots(prev => [...prev, item]);
    }
    setIsSlotSearchOpen(false);
    setSlotQuery("");
    setSlotResults([]);
  };

  const openDetails = useCallback(async (id) => {
    try { const res = await fetchDetails(mediaType, id); setSelectedItem(res.data); } catch (e) {}
  }, [mediaType]);

  const addToAi = (item) => {
    if(aiSlots.length < 3 && !aiSlots.find(slot => slot.id === item.id)) {
        setAiSlots(prev => [...prev, item]);
    }
    setSelectedItem(null);
    setTimeout(() => setView('ai'), 300);
  };

  const runAiEngine = async () => {
    if (aiSlots.length < 3) return;
    setIsScanning(true);
    try {
        const promises = aiSlots.map(m => fetchDetails(m.media_type || 'movie', m.id));
        const res = await Promise.all(promises);
        const final = res.flatMap(r => r.data.similar.results).sort(() => 0.5 - Math.random()).slice(0, 12);
        setTimeout(() => { setAiResults(final); setIsScanning(false); }, 2000);
    } catch (e) { setIsScanning(false); }
  };

  const handleSimilarClick = async (id) => {
    openDetails(id);
  };

  const handleActorClick = (id, name) => {
    setSelectedItem(null);
    setFilters(prev => ({ ...prev, actorId: id, actorName: name, genre: '', year: '' }));
    setView('home');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const clearActorFilter = () => {
    setFilters(prev => ({ ...prev, actorId: null, actorName: null }));
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white selection:bg-cyan-400 selection:text-black text-[13px] font-sans overflow-x-hidden relative">
      
      <div className="fixed inset-0 -z-10 bg-[#050505]">
         <div className={`absolute inset-0 transition-opacity duration-1000 ${selectedItem ? 'opacity-40' : 'opacity-20'}`}>
            {selectedItem ? (
                 <img src={`https://image.tmdb.org/t/p/w500${selectedItem.poster_path}`} className="w-full h-full object-cover blur-[100px] scale-110" />
            ) : (
                <div className="w-full h-full bg-[radial-gradient(circle_at_50%_0%,#111827,transparent)]" />
            )}
         </div>
         <div className="absolute inset-0 opacity-[0.03] bg-[url('https://grainy-gradients.vercel.app/noise.svg')]"></div>
      </div>
      
      <nav className="fixed left-0 top-0 h-screen w-16 bg-black/80 backdrop-blur-xl border-r border-white/5 flex flex-col items-center py-8 z-[100]">
        <div className="w-10 h-10 bg-gradient-to-br from-cyan-400 to-blue-600 rounded-xl flex items-center justify-center shadow-[0_0_20px_rgba(34,211,238,0.2)] mb-10">
          <Fingerprint className="text-black" size={20} />
        </div>
        <div className="flex flex-col gap-8">
          <NavBtn icon={<LayoutGrid size={20}/>} active={view === 'home'} onClick={() => setView('home')} tooltip="Keşfet" />
          <NavBtn icon={<Heart size={20}/>} active={view === 'favorites'} onClick={() => setView('favorites')} tooltip="Favoriler" />
          <NavBtn icon={<Cpu size={20}/>} active={view === 'ai'} onClick={() => setView('ai')} tooltip="AI Lab" />
        </div>
      </nav>

      <main className="pl-16 min-h-screen">
        <header className="h-20 flex items-center justify-between px-8 border-b border-white/5 sticky top-0 bg-[#050505]/80 backdrop-blur-md z-50 transition-all">
          <div className="flex items-center gap-6">
            <div className="flex bg-white/5 p-1 rounded-xl border border-white/10">
              <button onClick={() => setMediaType('movie')} className={`px-5 py-2 rounded-lg text-[10px] font-black uppercase transition-all ${mediaType==='movie'?'bg-cyan-400 text-black shadow-md':'text-gray-400 hover:text-white'}`}>Film</button>
              <button onClick={() => setMediaType('tv')} className={`px-5 py-2 rounded-lg text-[10px] font-black uppercase transition-all ${mediaType==='tv'?'bg-cyan-400 text-black shadow-md':'text-gray-400 hover:text-white'}`}>Dizi</button>
            </div>

            <button 
              onClick={() => setIsFilterOpen(!isFilterOpen)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl border text-[10px] font-bold uppercase transition-all ${isFilterOpen ? 'bg-cyan-400/10 border-cyan-400 text-cyan-400' : 'bg-white/5 border-white/10 text-gray-400 hover:border-white/30 hover:text-white'}`}
            >
              <Filter size={14} /> Filtrele
            </button>
          </div>

          <div className="relative w-96 group z-[60]">
            <div className={`absolute inset-0 bg-cyan-400/10 rounded-2xl blur-lg transition-opacity duration-500 ${query ? 'opacity-100' : 'opacity-0'}`} />
            <div className="relative flex items-center">
                <Search className="absolute left-4 text-gray-500 group-focus-within:text-cyan-400 transition-colors" size={16} />
                <input 
                value={query}
                onChange={(e) => handleSearch(e.target.value)}
                placeholder="Fluxify Veritabanında Ara..."
                className="w-full bg-[#0a0a0a] border border-white/10 rounded-2xl py-3.5 pl-11 pr-4 outline-none focus:border-cyan-400/50 transition-all text-[12px] placeholder:text-gray-600 text-white shadow-xl"
                />
            </div>
            
            <AnimatePresence>
              {results.length > 0 && (
                <motion.div 
                    initial={{opacity:0, y:10}} animate={{opacity:1, y:0}} exit={{opacity:0, y:10}} 
                    className="absolute top-full mt-4 w-[450px] right-0 bg-[#0a0a0a] border border-white/10 rounded-2xl p-3 shadow-[0_20px_50px_rgba(0,0,0,0.8)] max-h-[500px] overflow-y-auto z-[70] custom-scrollbar"
                >
                  <div className="flex items-center justify-between px-2 mb-2">
                     <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Sonuçlar ({results.length})</span>
                     <button onClick={() => {setResults([]); setQuery("")}} className="text-[10px] text-red-400 hover:text-red-300">Kapat</button>
                  </div>
                  {results.map(m => (
                    <div key={m.id} onClick={() => {openDetails(m.id); setResults([]); setQuery("");}} className="flex gap-4 p-3 hover:bg-white/5 rounded-xl cursor-pointer group transition-all border border-transparent hover:border-white/5 mb-1 relative overflow-hidden">
                      <div className="absolute left-0 top-0 bottom-0 w-1 bg-cyan-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                      <img src={m.poster_path ? `https://image.tmdb.org/t/p/w200${m.poster_path}` : 'https://via.placeholder.com/100x150?text=No+Image'} className="w-16 h-24 object-cover rounded-lg bg-[#111]" />
                      <div className="flex flex-col justify-center py-1">
                        <h4 className="font-bold text-[14px] text-gray-200 group-hover:text-cyan-400 leading-tight mb-2 pr-4">{m.title || m.name}</h4>
                        <div className="flex items-center gap-3">
                            <span className="flex items-center gap-1.5 text-[10px] font-mono text-gray-500 bg-white/5 px-2 py-1 rounded-md"><Calendar size={10} /> {(m.release_date || m.first_air_date)?.split('-')[0] || 'N/A'}</span>
                            <span className="flex items-center gap-1 text-[10px] font-bold text-yellow-500/80"><Star size={10} fill="currentColor" /> {m.vote_average?.toFixed(1)}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </header>

        <FilterPanel isOpen={isFilterOpen} closePanel={() => setIsFilterOpen(false)} filters={filters} setFilters={setFilters} genres={genres} />

        <div className="p-8">
          {view === 'home' && (
            <motion.div initial={{opacity:0}} animate={{opacity:1}} transition={{duration:0.5}}>
              
              <div className="mb-8 flex justify-between items-end border-b border-white/5 pb-4">
                <div>
                  <h1 className="text-3xl font-black uppercase tracking-tight italic text-white">
                    Fluxify // <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">Discover</span>
                  </h1>
                  
                  {filters.actorName ? (
                     <div className="mt-3 flex items-center gap-3">
                        <p className="text-[10px] text-gray-500 font-mono">OYUNCU FİLTRESİ:</p>
                        <div className="flex items-center gap-2 bg-cyan-400/10 border border-cyan-400/30 px-3 py-1 rounded-lg">
                           <User size={12} className="text-cyan-400"/>
                           <span className="text-[11px] font-bold text-cyan-400 uppercase">{filters.actorName}</span>
                           <button onClick={clearActorFilter} className="ml-2 hover:text-white"><X size={12}/></button>
                        </div>
                     </div>
                  ) : (
                    <p className="text-[10px] text-gray-500 mt-1 font-mono">
                       {filters.genre || filters.year ? 'Filtrelenmiş Sonuçlar' : 'Günlük Trendler ve Akış'}
                    </p>
                  )}
                  
                </div>
                <div className="text-[9px] font-mono text-gray-600 uppercase tracking-widest bg-white/5 px-2 py-1 rounded">v3.3</div>
              </div>
              
              {items.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 opacity-50"><Ghost size={40} className="mb-4 text-gray-600"/><div className="text-gray-500">Veri akışı sağlanamadı.</div></div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6 mb-10">
                  {items.map(m => <ItemCard key={m.id} item={m} onClick={() => openDetails(m.id)} />)}
                </div>
              )}

              <div className="flex justify-center pb-10">
                <button onClick={loadMore} disabled={loadingMore} className="px-8 py-3 bg-white/5 hover:bg-cyan-400/20 border border-white/10 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all flex items-center gap-2 disabled:opacity-50">
                  {loadingMore ? <div className="animate-spin w-4 h-4 border-2 border-cyan-400 border-t-transparent rounded-full"/> : <ChevronDown size={16} />}
                  {loadingMore ? "Yükleniyor..." : "Daha Fazla Göster"}
                </button>
              </div>
            </motion.div>
          )}

          {view === 'favorites' && (
            <motion.div initial={{opacity:0}} animate={{opacity:1}}>
               <div className="mb-8 flex justify-between items-end border-b border-white/5 pb-4">
                <div>
                  <h1 className="text-3xl font-black uppercase tracking-tight italic text-white">Fluxify // <span className="text-red-500">Collection</span></h1>
                  <p className="text-[10px] text-gray-500 mt-1 font-mono">Kişisel Arşiviniz ({favorites.length} İçerik)</p>
                </div>
              </div>
              {favorites.length === 0 ? (
                 <div className="flex flex-col items-center justify-center py-32 opacity-40">
                    <Heart size={64} className="mb-6 text-gray-700"/>
                    <h3 className="text-xl font-bold text-gray-500 mb-2">Henüz favori yok</h3>
                    <p className="text-gray-600 text-[11px]">Keşfet menüsünden içerik eklemeye başla.</p>
                 </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6 mb-10">
                  {favorites.map(m => <ItemCard key={m.id} item={m} onClick={() => openDetails(m.id)} />)}
                </div>
              )}
            </motion.div>
          )}

          {view === 'ai' && (
             <div className="max-w-7xl mx-auto pt-4">
              <div className="mb-10 text-center">
                <h2 className="text-3xl font-black uppercase italic tracking-tighter">AI Synthesis <span className="text-cyan-400">Lab</span></h2>
                <p className="text-gray-500 font-mono text-[10px] mt-2 tracking-widest opacity-60">3 HEDEF VERİ GİRİŞİ EKLE</p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
                <div className="col-span-1 md:col-span-5 space-y-6">
                  {/* KUTUCUKLAR (SLOTS) */}
                  <div className="grid grid-cols-3 gap-4">
                    {[0, 1, 2].map(i => (
                      <div 
                        key={i} 
                        onClick={() => !aiSlots[i] && setIsSlotSearchOpen(true)}
                        className={`aspect-[3/4] rounded-2xl border-2 border-dashed border-white/20 bg-white/5 flex items-center justify-center relative overflow-hidden group transition-all duration-300 ${!aiSlots[i] ? 'cursor-pointer hover:border-cyan-400/60 hover:bg-cyan-400/10 hover:shadow-[0_0_30px_rgba(34,211,238,0.1)]' : 'border-white/10'}`}
                      >
                        {aiSlots[i] ? (
                          <>
                            <img src={`https://image.tmdb.org/t/p/w300${aiSlots[i].poster_path}`} className="w-full h-full object-cover" />
                            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center backdrop-blur-sm">
                                <button onClick={(e) => { e.stopPropagation(); setAiSlots(aiSlots.filter((_, idx) => idx !== i)); }} className="p-3 bg-red-500 rounded-full hover:bg-red-400 text-white shadow-lg transform hover:scale-110 transition-all"><X size={20}/></button>
                            </div>
                          </>
                        ) : (
                            <div className="flex flex-col items-center gap-3 opacity-30 group-hover:opacity-100 group-hover:text-cyan-400 transition-all duration-300">
                                <Plus size={80} strokeWidth={0.8} className="drop-shadow-[0_0_10px_rgba(34,211,238,0.5)]" /> 
                                <span className="text-xs font-black uppercase tracking-[0.2em] hidden group-hover:block animate-pulse">Ekle</span>
                            </div>
                        )}
                      </div>
                    ))}
                  </div>
                  <button onClick={runAiEngine} disabled={aiSlots.length < 3 || isScanning} className="w-full py-6 rounded-2xl bg-gradient-to-r from-cyan-400 to-cyan-500 text-black font-black text-lg tracking-widest uppercase hover:from-cyan-300 hover:to-cyan-400 transition-all disabled:opacity-20 disabled:grayscale shadow-[0_0_40px_rgba(34,211,238,0.2)] hover:shadow-[0_0_60px_rgba(34,211,238,0.4)] transform hover:-translate-y-1">
                    {isScanning ? "Sentezleniyor..." : "Sentezi Başlat"}
                  </button>
                </div>

                <div className="col-span-1 md:col-span-7 bg-white/[0.02] border border-white/5 rounded-3xl p-8 min-h-[600px] relative overflow-hidden shadow-2xl">
                  {isScanning && (
                    <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center z-10 backdrop-blur-md">
                      <div className="w-16 h-16 border-4 border-cyan-400 border-t-transparent rounded-full animate-spin mb-6 shadow-[0_0_30px_rgba(34,211,238,0.4)]" />
                      <p className="text-xs font-mono text-cyan-400 tracking-[0.5em] animate-pulse uppercase">Veriler İşleniyor...</p>
                    </div>
                  )}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-5 overflow-y-auto max-h-[600px] pr-2 scrollbar-hide">
                    {aiResults.map(m => (
                      <div key={m.id} className="cursor-pointer group" onClick={() => openDetails(m.id)}>
                        <div className="relative rounded-xl overflow-hidden mb-3 border border-white/5 group-hover:border-cyan-400/50 transition-all shadow-lg">
                            <img src={`https://image.tmdb.org/t/p/w300${m.poster_path}`} className="w-full aspect-[2/3] object-cover grayscale group-hover:grayscale-0 transition-all duration-500" />
                            <div className="absolute inset-0 bg-cyan-400/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                        <p className="text-[10px] font-bold uppercase truncate opacity-50 group-hover:opacity-100 text-center group-hover:text-cyan-400 transition-all">{m.title || m.name}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      <AnimatePresence>
        {isSlotSearchOpen && (
           <motion.div 
             initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}
             className="fixed inset-0 z-[250] flex items-center justify-center p-4 bg-black/95 backdrop-blur-xl"
           >
              <div className="absolute inset-0" onClick={() => setIsSlotSearchOpen(false)} />
              <motion.div 
                initial={{scale:0.95, y:20}} animate={{scale:1, y:0}} exit={{scale:0.95, y:20}}
                className="w-full max-w-3xl bg-[#0a0a0a] border border-cyan-400/30 rounded-3xl p-8 shadow-[0_0_100px_rgba(34,211,238,0.15)] relative z-10"
              >
                  <button onClick={() => setIsSlotSearchOpen(false)} className="absolute top-6 right-6 p-2 text-gray-500 hover:text-white transition-colors bg-white/5 rounded-full"><X size={24}/></button>
                  
                  <div className="text-center mb-8">
                    <h3 className="text-3xl font-black uppercase italic tracking-tighter text-white">AI Veri <span className="text-cyan-400">Kaynağı</span></h3>
                    <p className="text-sm text-gray-500 font-mono mt-2">Sentezleme motoruna eklenecek içeriği seç.</p>
                  </div>

                  <div className="relative mb-8 group">
                    <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-cyan-400 transition-transform group-focus-within:scale-110" size={24} />
                    <input 
                      autoFocus
                      value={slotQuery}
                      onChange={(e) => handleSlotSearch(e.target.value)}
                      placeholder="Film adı giriniz..."
                      className="w-full bg-white/5 border border-white/10 rounded-2xl py-6 pl-16 pr-6 outline-none focus:border-cyan-400/50 transition-all text-xl text-white placeholder:text-gray-600 shadow-inner focus:bg-white/10"
                    />
                  </div>

                  <div className="grid grid-cols-1 gap-3 max-h-[450px] overflow-y-auto custom-scrollbar pr-2">
                     {slotResults.length === 0 && slotQuery.length > 2 && (
                        <div className="text-center py-12 flex flex-col items-center opacity-50">
                            <Ghost size={48} className="mb-4 text-gray-600"/>
                            <span className="text-gray-500">Sonuç bulunamadı.</span>
                        </div>
                     )}
                     {slotResults.map(m => (
                        <div key={m.id} onClick={() => addFromSlotSearch(m)} className="flex items-center gap-6 p-4 rounded-2xl hover:bg-white/5 cursor-pointer group border border-transparent hover:border-cyan-400/20 transition-all duration-300">
                            <img src={m.poster_path ? `https://image.tmdb.org/t/p/w200${m.poster_path}` : 'https://via.placeholder.com/100'} className="w-20 h-28 object-cover rounded-xl bg-[#111] shadow-xl group-hover:scale-105 transition-transform" />
                            <div className="flex-1">
                                <h4 className="font-bold text-xl text-gray-200 group-hover:text-cyan-400 transition-colors mb-2">{m.title || m.name}</h4>
                                <div className="flex items-center gap-4 mb-3">
                                    <span className="text-xs font-mono text-gray-400 bg-white/5 px-3 py-1 rounded-lg border border-white/5">{(m.release_date || m.first_air_date)?.split('-')[0] || 'N/A'}</span>
                                    <span className="flex items-center gap-1.5 text-xs font-bold text-yellow-500"><Star size={12} fill="currentColor"/> {m.vote_average?.toFixed(1)}</span>
                                </div>
                                <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed">{m.overview || "Özet yok."}</p>
                            </div>
                            <div className="opacity-0 group-hover:opacity-100 transition-all transform translate-x-4 group-hover:translate-x-0 duration-300">
                                <div className="bg-cyan-400 text-black p-4 rounded-2xl shadow-[0_0_20px_rgba(34,211,238,0.4)] hover:scale-110 transition-transform"><Plus size={24} strokeWidth={2.5} /></div>
                            </div>
                        </div>
                     ))}
                  </div>
              </motion.div>
           </motion.div>
        )}
      </AnimatePresence>

      {selectedItem && (
        <MovieDetail 
          selectedItem={selectedItem} 
          onClose={() => setSelectedItem(null)} 
          onAddToAi={addToAi} 
          isFavorite={!!favorites.find(f => f.id === selectedItem.id)}
          toggleFavorite={toggleFavorite}
          onSimilarClick={handleSimilarClick}
          onActorClick={handleActorClick} 
        />
      )}
    </div>
  );
};

const NavBtn = ({ icon, active, onClick, tooltip }) => (
  <div onClick={onClick} className={`p-3 rounded-xl cursor-pointer transition-all duration-300 group relative ${active ? 'bg-cyan-400 text-black shadow-lg shadow-cyan-400/20 scale-110' : 'text-gray-500 hover:text-white hover:bg-white/5'}`}>
    {icon}
    <span className="absolute left-14 top-1/2 -translate-y-1/2 bg-white text-black text-[9px] font-bold px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-[200]">
        {tooltip}
    </span>
  </div>
);

export default App;