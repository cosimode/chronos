import React, { useState, useEffect } from 'react';
import { AnimatePresence } from 'framer-motion';
import Level0_Onboarding from './components/Level0_Onboarding';
import Level1_Home from './components/Level1_Home';
import Level2_Timeline from './components/Level2_Timeline';
import { generateLifeData } from './utils/lifeData';
import { supabase } from './supabaseClient';

function App() {
    const [userData, setUserData] = useState(null);
    const [zoomLevel, setZoomLevel] = useState(0);
    const [loading, setLoading] = useState(true);

    // Controllo sessione all'avvio
    useEffect(() => {
        const checkSession = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (session?.user) {
                const { data: profile } = await supabase
                    .from('chronos_profiles')
                    .select('*')
                    .eq('id', session.user.id)
                    .maybeSingle();

                if (profile) {
                    setUserData({ name: profile.name, birthDate: profile.birth_date });
                    setZoomLevel(1);
                }
            }
            setLoading(false);
        };
        checkSession();
    }, []);

    const handleOnboardingComplete = (name, birthDate) => {
        setUserData({ name, birthDate });
        setZoomLevel(1);
    };

    // Funzione per aggiornare i dati dalle Impostazioni
    const handleProfileUpdate = (newData) => {
        setUserData(newData);
        // Forziamo il ricalcolo dei dati passando le nuove props
    };

    const handleLogout = async () => {
        await supabase.auth.signOut();
        setUserData(null);
        setZoomLevel(0);
    };

    if (loading) return <div className="h-screen w-screen bg-black flex items-center justify-center text-white">Caricamento...</div>;

    const lifeStats = userData ? generateLifeData(userData.birthDate) : null;

    return (
        <div className="h-screen w-screen bg-background text-white font-sans overflow-hidden selection:bg-accent-glow selection:text-black relative">

            <AnimatePresence mode="wait">

                {zoomLevel === 0 && !userData && (
                    <Level0_Onboarding key="level0" onComplete={handleOnboardingComplete} />
                )}

                {zoomLevel === 1 && userData && (
                    <Level1_Home
                        key="level1"
                        percentage={lifeStats.percentage}
                        weeksLived={lifeStats.totalWeeksLived}
                        userData={userData} // Passiamo i dati utente
                        onUpdateUser={handleProfileUpdate} // Passiamo la funzione update
                        onLogout={handleLogout} // Passiamo logout
                        onZoomIn={() => setZoomLevel(2)}
                    />
                )}

                {zoomLevel === 2 && userData && (
                    <Level2_Timeline
                        key="level2"
                        birthDate={userData.birthDate}
                        onBack={() => setZoomLevel(1)}
                    />
                )}

            </AnimatePresence>
        </div>
    );
}

export default App;