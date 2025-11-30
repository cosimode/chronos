import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { X, Save, LogOut, Loader2 } from 'lucide-react';
import { supabase } from '../supabaseClient';

export default function SettingsOverlay({ isOpen, onClose, userData, onUpdate, onLogout }) {
    const [name, setName] = useState(userData.name);
    const [birthDate, setBirthDate] = useState(userData.birthDate);
    const [loading, setLoading] = useState(false);

    // Sincronizza lo stato locale se userData cambia esternamente
    useEffect(() => {
        setName(userData.name);
        setBirthDate(userData.birthDate);
    }, [userData]);

    const handleSave = async () => {
        setLoading(true);
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error("Utente non loggato");

            // Aggiorna Supabase
            const { error } = await supabase
                .from('chronos_profiles')
                .update({ name, birth_date: birthDate })
                .eq('id', user.id);

            if (error) throw error;

            // Aggiorna lo stato dell'App
            onUpdate({ name, birthDate });
            onClose();

        } catch (error) {
            alert("Errore aggiornamento: " + error.message);
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-6"
        >
            <motion.div
                initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }}
                className="bg-surfaceHighlight border border-white/10 w-full max-w-sm rounded-3xl p-6 shadow-2xl"
            >
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold text-white">Impostazioni</h2>
                    <button onClick={onClose} className="p-2 bg-white/5 rounded-full text-neutral-400 hover:text-white transition-colors">
                        <X size={20} />
                    </button>
                </div>

                <div className="space-y-4">
                    <div>
                        <label className="block text-xs text-neutral-500 uppercase tracking-wider mb-2">Nome</label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full bg-black/20 border border-white/10 rounded-xl p-3 text-white focus:border-accent-glow/50 outline-none"
                        />
                    </div>

                    <div>
                        <label className="block text-xs text-neutral-500 uppercase tracking-wider mb-2">Data di Nascita</label>
                        <input
                            type="date"
                            value={birthDate}
                            onChange={(e) => setBirthDate(e.target.value)}
                            className="w-full bg-black/20 border border-white/10 rounded-xl p-3 text-white focus:border-accent-glow/50 outline-none appearance-none min-w-full"
                            style={{ colorScheme: 'dark' }}
                        />
                        <p className="text-[10px] text-red-400 mt-2">
                            Modificare la data ricalcolerà l'intera timeline.
                        </p>
                    </div>

                    <div className="pt-4 space-y-3">
                        <button
                            onClick={handleSave}
                            disabled={loading}
                            className="w-full bg-white text-black font-bold py-3 rounded-xl flex items-center justify-center gap-2 hover:bg-neutral-200 transition-all active:scale-95 disabled:opacity-50"
                        >
                            {loading ? <Loader2 className="animate-spin" size={18} /> : <><Save size={18} /> Salva Modifiche</>}
                        </button>

                        <button
                            onClick={onLogout}
                            className="w-full bg-red-500/10 border border-red-500/20 text-red-500 font-medium py-3 rounded-xl flex items-center justify-center gap-2 hover:bg-red-500/20 transition-all active:scale-95"
                        >
                            <LogOut size={18} /> Logout
                        </button>
                    </div>
                </div>
            </motion.div>
        </motion.div>
    );
}