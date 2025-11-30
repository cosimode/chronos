import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Sparkles, Loader2, AlertCircle } from 'lucide-react';
import { supabase } from '../supabaseClient';

export default function Level0_Onboarding({ onComplete }) {
    const [step, setStep] = useState('auth'); // 'auth' o 'profile'
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Auth
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isSignUp, setIsSignUp] = useState(true);

    // Profile
    const [name, setName] = useState('');
    const [birthDate, setBirthDate] = useState('');

    const handleAuth = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            let result;
            if (isSignUp) {
                result = await supabase.auth.signUp({ email, password });
            } else {
                result = await supabase.auth.signInWithPassword({ email, password });
            }

            if (result.error) throw result.error;

            const user = result.data.user;

            // Se l'utente esiste (Login o Registrazione immediata)
            if (user) {
                // FIX 406: Usiamo maybeSingle() invece di single()
                // maybeSingle non rompe tutto se non trova il profilo
                const { data: profile, error: profileError } = await supabase
                    .from('chronos_profiles')
                    .select('*')
                    .eq('id', user.id)
                    .maybeSingle();

                if (profile) {
                    onComplete(profile.name, profile.birth_date);
                } else {
                    // Se non ha profilo, andiamo al prossimo step
                    setStep('profile');
                }
            } else {
                // Caso raro: se la conferma email è ancora attiva
                setError("Controlla la tua email per confermare l'iscrizione!");
            }
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleProfileSave = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null); // Reset errori precedenti

        try {
            // FIX "NULL ID": Controlliamo se l'utente è davvero loggato
            const { data: { user } } = await supabase.auth.getUser();

            if (!user) {
                throw new Error("Sessione scaduta. Riprova il login.");
            }

            const { error: dbError } = await supabase
                .from('chronos_profiles')
                .insert([{
                    id: user.id,
                    name: name,
                    birth_date: birthDate
                }]);

            if (dbError) throw dbError;

            onComplete(name, birthDate);

        } catch (err) {
            console.error("Errore salvataggio:", err);
            setError(err.message);
            // Se l'errore è grave, forse conviene tornare al login
            if (err.message.includes("Sessione")) setStep('auth');
        } finally {
            setLoading(false);
        }
    };

    return (
        <motion.div
            className="h-full w-full flex flex-col items-center justify-center px-6 relative overflow-hidden bg-background"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
        >
            <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-blue-900/10 to-background pointer-events-none" />

            <div className="z-10 w-full max-w-sm space-y-8">

                <div className="text-center space-y-2">
                    <motion.div
                        initial={{ scale: 0 }} animate={{ scale: 1 }}
                        className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-white/10"
                    >
                        <Sparkles className="text-accent-glow" size={24} />
                    </motion.div>
                    <h1 className="text-3xl font-bold text-white">Memento Mori</h1>
                    <p className="text-neutral-500 text-sm">Il tuo tempo, visualizzato.</p>
                </div>

                {error && (
                    <div className="bg-red-500/10 border border-red-500/20 p-3 rounded-lg flex items-center gap-2 text-red-400 text-sm">
                        <AlertCircle size={16} />
                        {error}
                    </div>
                )}

                {step === 'auth' && (
                    <form onSubmit={handleAuth} className="space-y-4">
                        <div className="space-y-2">
                            <input
                                type="email" required placeholder="Email" value={email} onChange={e => setEmail(e.target.value)}
                                className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-white focus:border-accent-glow/50 outline-none transition-all"
                            />
                            <input
                                type="password" required placeholder="Password" value={password} onChange={e => setPassword(e.target.value)}
                                className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-white focus:border-accent-glow/50 outline-none transition-all"
                            />
                        </div>

                        <button
                            type="submit" disabled={loading}
                            className="w-full bg-white text-black font-bold py-4 rounded-xl flex items-center justify-center gap-2 hover:bg-neutral-200 transition-all disabled:opacity-50"
                        >
                            {loading ? <Loader2 className="animate-spin" /> : (isSignUp ? 'Crea Account' : 'Accedi')}
                        </button>

                        <p className="text-center text-neutral-500 text-sm mt-4">
                            {isSignUp ? "Hai già un account?" : "Nuovo qui?"}
                            <button type="button" onClick={() => setIsSignUp(!isSignUp)} className="text-white ml-2 hover:underline">
                                {isSignUp ? "Accedi" : "Registrati"}
                            </button>
                        </p>
                    </form>
                )}

                {step === 'profile' && (
                    <form onSubmit={handleProfileSave} className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-xs font-semibold text-neutral-400 uppercase ml-1">Come ti chiami?</label>
                            <input
                                type="text" required value={name} onChange={e => setName(e.target.value)}
                                className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-white outline-none"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-semibold text-neutral-400 uppercase ml-1">Data di nascita</label>
                            <input
                                type="date"
                                required
                                value={birthDate}
                                onChange={e => setBirthDate(e.target.value)}
                                className="w-full min-w-full appearance-none bg-white/5 border border-white/10 rounded-xl p-4 text-white outline-none focus:border-accent-glow/50 transition-all"
                                style={{ colorScheme: 'dark' }} // Forza icona calendario bianca
                            />
                        </div>

                        <button
                            type="submit" disabled={loading}
                            className="w-full bg-white text-black font-bold py-4 rounded-xl flex items-center justify-center gap-2 hover:bg-neutral-200 transition-all"
                        >
                            {loading ? <Loader2 className="animate-spin" /> : <>Inizia <ArrowRight size={18} /></>}
                        </button>
                    </form>
                )}
            </div>
        </motion.div>
    );
}