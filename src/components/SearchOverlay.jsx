import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, X, Calendar, MapPin, Egg, Rocket, Ghost } from 'lucide-react'; // Nuove icone

export default function SearchOverlay({ isOpen, onClose, memories, onResultClick, birthDate }) {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState([]);

    // Stato per messaggi di errore specifici ("feedback")
    // Struttura: { icon: IconComponent, title: string, subtitle: string }
    const [feedback, setFeedback] = useState(null);

    // Estraniamo l'anno di nascita
    const birthYear = new Date(birthDate).getFullYear();
    const maxAge = 90;
    const deathYear = birthYear + maxAge;

    useEffect(() => {
        // Reset se vuoto
        if (!query.trim()) {
            setResults([]);
            setFeedback(null);
            return;
        }

        const lowerQuery = query.toLowerCase();
        const found = [];
        let newFeedback = null;

        // --- CASO 1: È UN ANNO? (4 cifre) ---
        if (!isNaN(query) && query.length === 4) {
            const yearNum = parseInt(query);

            if (yearNum < birthYear) {
                // PRIMA DELLA NASCITA
                newFeedback = {
                    icon: Egg,
                    title: "Non eri ancora nato",
                    subtitle: `Il tuo viaggio è iniziato nel ${birthYear}.`
                };
            } else if (yearNum > deathYear) {
                // TROPPO FUTURO
                newFeedback = {
                    icon: Rocket,
                    title: "Oltre l'orizzonte",
                    subtitle: `La timeline arriva fino al ${deathYear}.`
                };
            } else {
                // ANNO VALIDO
                found.push({
                    type: 'year',
                    id: `year-${yearNum}`,
                    title: `Vai all'anno ${yearNum}`,
                    subtitle: 'Salta nel tempo',
                    year: yearNum,
                    weekIndex: 0
                });
            }
        }
        // --- CASO 2: RICERCA TESTUALE ---
        else {
            Object.entries(memories).forEach(([key, data]) => {
                if (data.note && data.note.toLowerCase().includes(lowerQuery)) {
                    const [year, weekIndex] = key.split('-');
                    found.push({
                        type: 'memory',
                        id: key,
                        title: data.note,
                        subtitle: `Settimana ${parseInt(weekIndex) + 1} del ${year}`,
                        year: parseInt(year),
                        weekIndex: parseInt(weekIndex),
                        color: data.color
                    });
                }
            });

            // Se è testo e non trovo nulla
            if (found.length === 0 && isNaN(query)) {
                newFeedback = {
                    icon: Ghost,
                    title: "Nessun ricordo trovato",
                    subtitle: `Non hai mai scritto "${query}" nelle tue note.`
                };
            }
        }

        setResults(found);
        setFeedback(newFeedback);

    }, [query, memories, birthYear, deathYear]);

    // Resetta tutto alla chiusura
    useEffect(() => {
        if (!isOpen) {
            setQuery('');
            setFeedback(null);
        }
    }, [isOpen]);

    if (!isOpen) return null;

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/90 backdrop-blur-xl flex flex-col pt-20 px-6"
        >
            {/* Header Input */}
            <div className="flex items-center gap-4 mb-8">
                <div className="flex-1 relative group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-500 group-focus-within:text-accent-glow transition-colors" size={20} />
                    <input
                        autoFocus
                        type="text"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="Cerca ricordi o anni..."
                        className="w-full bg-white/5 border border-white/10 rounded-xl py-4 pl-12 pr-4 text-white placeholder-neutral-600 focus:outline-none focus:border-accent-glow/50 focus:bg-white/10 transition-all text-lg"
                    />
                </div>
                <button
                    onClick={onClose}
                    className="p-4 bg-white/5 rounded-xl text-neutral-400 hover:text-white hover:bg-white/10 transition-colors"
                >
                    <X size={24} />
                </button>
            </div>

            {/* Contenitore Risultati */}
            <div className="flex-1 overflow-y-auto pb-10">

                {/* 1. STATO INIZIALE (Vuoto) */}
                {!query && (
                    <div className="text-center mt-20 opacity-30">
                        <Search size={48} className="mx-auto mb-4" />
                        <p className="text-sm font-medium">Cerca un anno (es. 2016) <br/> o una parola chiave.</p>
                    </div>
                )}

                {/* 2. FEEDBACK SPECIFICO (Eccezioni) */}
                {feedback && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="text-center mt-20 px-10"
                    >
                        <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6 text-neutral-500 border border-white/5">
                            <feedback.icon size={32} />
                        </div>
                        <h3 className="text-xl font-bold text-white mb-2">{feedback.title}</h3>
                        <p className="text-neutral-500 leading-relaxed">{feedback.subtitle}</p>
                    </motion.div>
                )}

                {/* 3. LISTA RISULTATI (Validi) */}
                <div className="space-y-2">
                    {results.map((item) => (
                        <motion.button
                            key={item.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            onClick={() => onResultClick(item)}
                            className="w-full flex items-center gap-4 p-4 rounded-xl hover:bg-white/5 transition-colors text-left border border-transparent hover:border-white/5 group"
                        >
                            <div className={`w-12 h-12 rounded-full flex items-center justify-center ${item.type === 'memory' ? item.color || 'bg-neutral-700' : 'bg-white/10'}`}>
                                {item.type === 'memory' ? <MapPin size={20} className="text-white" /> : <Calendar size={20} className="text-white" />}
                            </div>

                            <div className="flex-1 min-w-0">
                                <h4 className="text-white font-medium truncate group-hover:text-accent-glow transition-colors">
                                    {item.title}
                                </h4>
                                <p className="text-neutral-500 text-sm">
                                    {item.subtitle}
                                </p>
                            </div>
                        </motion.button>
                    ))}
                </div>

            </div>
        </motion.div>
    );
}