import React, { useRef, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { generateLifeData, getWeekDateRange } from '../utils/lifeData';
import { ArrowLeft, Search, Loader2, Info } from 'lucide-react'; // Aggiunto Info
import Level3_Detail from './Level3_Detail.jsx';
import { differenceInWeeks, startOfYear, isBefore, addWeeks } from 'date-fns';
import SearchOverlay from './SearchOverlay.jsx';
import LegendOverlay from './LegendOverlay.jsx'; // Aggiunto Import
import { supabase } from '../supabaseClient';
import { ERA_COLORS } from '../utils/constants'; // Aggiunto Import Costanti

export default function Level2_Timeline({ onBack, birthDate }) {
    const { years } = generateLifeData(birthDate);
    const scrollRef = useRef(null);
    const [selectedWeek, setSelectedWeek] = useState(null);

    // Stati Overlay
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const [isLegendOpen, setIsLegendOpen] = useState(false); // Nuovo stato

    const [memories, setMemories] = useState({});
    const [loading, setLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    const today = new Date();
    const currentYearDate = startOfYear(today);
    const currentWeekOfThisYear = differenceInWeeks(today, currentYearDate);
    const birthDateObj = new Date(birthDate);

    // 1. CARICAMENTO
    useEffect(() => {
        fetchMemories();
    }, []);

    const fetchMemories = async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            const { data, error } = await supabase
                .from('chronos_memories')
                .select('*')
                .eq('user_id', user.id);

            if (error) throw error;

            const memoriesMap = {};
            data.forEach(item => {
                const key = `${item.year}-${item.week_index}`;
                memoriesMap[key] = {
                    note: item.note,
                    color: item.color,
                    image: item.image_url
                };
            });
            setMemories(memoriesMap);
        } catch (error) {
            console.error('Errore caricamento:', error);
        } finally {
            setLoading(false);
        }
    };

    // 2. SALVATAGGIO
    const handleSaveMemory = async (data) => {
        setIsSaving(true);
        const year = selectedWeek.year;
        const week = selectedWeek.weekIndex;
        const key = `${year}-${week}`;

        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error("Utente non loggato");

            let publicUrl = data.currentImageUrl;

            if (data.imageBlob) {
                const fileName = `${user.id}/${year}-${week}-${Date.now()}.jpg`;
                const { error: uploadError } = await supabase.storage
                    .from('chronos_bucket')
                    .upload(fileName, data.imageBlob, { upsert: true, contentType: 'image/jpeg' });

                if (uploadError) throw uploadError;
                const { data: urlData } = supabase.storage.from('chronos_bucket').getPublicUrl(fileName);
                publicUrl = urlData.publicUrl;
            }

            const { error: dbError } = await supabase
                .from('chronos_memories')
                .upsert({
                    user_id: user.id, year, week_index: week, note: data.note, color: data.color, image_url: publicUrl
                }, { onConflict: 'user_id, year, week_index' });

            if (dbError) {
                await supabase.from('chronos_memories').delete().match({ user_id: user.id, year, week_index: week });
                await supabase.from('chronos_memories').insert({
                    user_id: user.id, year, week_index: week, note: data.note, color: data.color, image_url: publicUrl
                });
            }

            setMemories(prev => ({ ...prev, [key]: { note: data.note, color: data.color, image: publicUrl } }));
            setSelectedWeek(null);
        } catch (error) {
            alert("Errore: " + error.message);
        } finally {
            setIsSaving(false);
        }
    };

    // 3. CANCELLA
    const handleDeleteMemory = async () => {
        if (!selectedWeek || !confirm("Cancellare ricordo?")) return;
        setIsSaving(true);
        const { year, weekIndex: week } = selectedWeek;
        const key = `${year}-${week}`;

        try {
            const { data: { user } } = await supabase.auth.getUser();
            const { error } = await supabase.from('chronos_memories').delete().match({ user_id: user.id, year, week_index: week });
            if (error) throw error;

            setMemories(prev => { const n = { ...prev }; delete n[key]; return n; });
            setSelectedWeek(null);
        } catch (error) {
            alert("Errore: " + error.message);
        } finally {
            setIsSaving(false);
        }
    };

    const handleWeekClick = (year, weekIndex) => {
        const dateRange = getWeekDateRange(birthDate, year, weekIndex);
        let timeStatus = 'past';
        if (year > today.getFullYear()) timeStatus = 'future';
        else if (year === today.getFullYear()) {
            if (weekIndex > currentWeekOfThisYear) timeStatus = 'future';
            else if (weekIndex === currentWeekOfThisYear) timeStatus = 'present';
        }
        setSelectedWeek({ year, weekIndex, dateRange, timeStatus });
    };

    useEffect(() => {
        if (scrollRef.current && !loading) {
            setTimeout(() => {
                const currentEl = document.getElementById(`year-${today.getFullYear()}`);
                if (currentEl) currentEl.scrollIntoView({ behavior: 'auto', block: 'center' });
            }, 500);
        }
    }, [loading]);

    const handleSearchResultClick = (result) => {
        setIsSearchOpen(false);
        setTimeout(() => {
            const yearEl = document.getElementById(`year-${result.year}`);
            if (yearEl) yearEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
            if (result.type === 'memory') handleWeekClick(result.year, result.weekIndex);
        }, 300);
    };

    if (loading) return <div className="h-[100dvh] w-full flex items-center justify-center bg-background"><Loader2 className="animate-spin text-accent-glow" size={40} /></div>;

    return (
        <motion.div
            className="h-[100dvh] w-full bg-background flex flex-col relative overflow-hidden"
            initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, x: 100 }} transition={{ duration: 0.5 }}
        >
            {isSaving && (
                <div className="absolute inset-0 z-[60] bg-black/50 backdrop-blur-sm flex items-center justify-center flex-col gap-4">
                    <Loader2 className="animate-spin text-white" size={40} />
                    <p className="text-white font-medium">Operazione in corso...</p>
                </div>
            )}

            {/* HEADER FISSO */}
            <div className="absolute top-0 left-0 w-full pt-12 pb-6 px-6 flex items-center justify-between bg-gradient-to-b from-background via-background/95 to-transparent z-30">
                {/* Sinistra: Back */}
                <button onClick={onBack} className="p-2 -ml-2 rounded-full hover:bg-white/10 text-neutral-400 hover:text-white transition-colors">
                    <ArrowLeft size={24} />
                </button>

                <h2 className="text-sm font-semibold tracking-widest uppercase text-neutral-500">Timeline</h2>

                {/* Destra: Info & Search */}
                <div className="flex gap-1 -mr-2">
                    <button onClick={() => setIsLegendOpen(true)} className="p-2 rounded-full hover:bg-white/10 text-neutral-400 hover:text-white transition-colors">
                        <Info size={24} />
                    </button>
                    <button onClick={() => setIsSearchOpen(true)} className="p-2 rounded-full hover:bg-white/10 text-neutral-400 hover:text-accent-glow transition-colors">
                        <Search size={24} />
                    </button>
                </div>
            </div>

            {/* TIMELINE LIST */}
            <div
                ref={scrollRef}
                className="flex-1 overflow-y-auto px-4 pb-20 scrollbar-hide"
                style={{ paddingTop: '8rem', maskImage: 'linear-gradient(to bottom, transparent, black 5%, black 95%, transparent)', WebkitMaskImage: 'linear-gradient(to bottom, transparent, black 5%, black 95%, transparent)' }}
            >
                <div className="space-y-8 max-w-3xl mx-auto">
                    {years.map((year) => (
                        <div key={year.year} id={`year-${year.year}`} className={`relative flex flex-col gap-3 p-3 rounded-2xl border border-white/5 transition-all duration-500 ${year.isCurrent ? 'bg-white/5 border-accent-glow/20 shadow-[0_0_30px_-10px_rgba(74,222,128,0.15)]' : 'opacity-100'}`}>
                            <div className="flex justify-between items-end px-1">
                                <div className="flex items-baseline gap-2">
                                    <span className={`text-2xl font-bold ${year.isCurrent ? 'text-accent-glow' : 'text-white'}`}>{year.year}</span>
                                    <span className="text-xs text-neutral-500 font-medium uppercase tracking-wide">Età {year.age}</span>
                                </div>
                                {year.eraName && <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium text-white/70 ${year.eraColor}`}>{year.eraName}</span>}
                            </div>

                            <div className="grid grid-cols-[repeat(13,1fr)] gap-1.5 md:gap-2">
                                {Array.from({ length: 52 }).map((_, weekIndex) => {
                                    const memoryKey = `${year.year}-${weekIndex}`;
                                    const savedMemory = memories[memoryKey];
                                    let dotClass = "bg-white/5";

                                    const startOfThisYear = new Date(year.year, 0, 1);
                                    const weekEndDate = addWeeks(startOfThisYear, weekIndex + 1);
                                    if (isBefore(weekEndDate, birthDateObj)) return <div key={weekIndex} className="w-full aspect-square md:w-3.5 md:h-3.5 md:aspect-auto rounded-[2px] bg-transparent border border-white/5 opacity-20 pointer-events-none" />;

                                    if (savedMemory?.color) dotClass = savedMemory.color;
                                    else if (year.isPast) dotClass = ERA_COLORS[year.eraName] || ERA_COLORS["Default"];
                                    else if (year.isCurrent) {
                                        if (weekIndex < currentWeekOfThisYear) dotClass = ERA_COLORS[year.eraName] || ERA_COLORS["Default"];
                                        else if (weekIndex === currentWeekOfThisYear) dotClass = "bg-accent-glow animate-pulse scale-125 shadow-[0_0_10px_rgba(74,222,128,0.8)] z-10";
                                    }

                                    return (
                                        <div
                                            key={weekIndex}
                                            className={`w-full aspect-square md:w-3.5 md:h-3.5 md:aspect-auto rounded-[2px] transition-all duration-300 cursor-pointer hover:scale-150 hover:z-20 hover:shadow-lg hover:shadow-white/20 ${dotClass} ${savedMemory ? 'shadow-[0_0_8px_rgba(255,255,255,0.3)] ring-1 ring-white/20' : ''}`}
                                            onClick={() => handleWeekClick(year.year, weekIndex)}
                                        />
                                    );
                                })}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* OVERLAYS */}
            <AnimatePresence>
                {isSearchOpen && <SearchOverlay isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} memories={memories} birthDate={birthDate} onResultClick={handleSearchResultClick} />}
            </AnimatePresence>

            <AnimatePresence>
                {isLegendOpen && <LegendOverlay isOpen={isLegendOpen} onClose={() => setIsLegendOpen(false)} />}
            </AnimatePresence>

            <AnimatePresence>
                {selectedWeek && (
                    <Level3_Detail
                        weekData={selectedWeek}
                        initialData={memories[`${selectedWeek.year}-${selectedWeek.weekIndex}`]}
                        onClose={() => setSelectedWeek(null)}
                        onSave={handleSaveMemory}
                        onDelete={handleDeleteMemory}
                    />
                )}
            </AnimatePresence>
        </motion.div>
    );
}