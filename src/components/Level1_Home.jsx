import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Settings } from 'lucide-react';
import SettingsOverlay from './SettingsOverlay';

export default function Level1_Home({ onZoomIn, percentage, weeksLived, userData, onUpdateUser, onLogout }) {
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);

    const circumference = 2 * Math.PI * 120;
    const strokeDashoffset = circumference - (percentage / 100) * circumference;

    return (
        <motion.div
            className="h-full w-full flex flex-col items-center justify-center relative overflow-hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 0.9, filter: "blur(10px)" }}
            transition={{ duration: 0.8 }}
        >
            {/* TASTO IMPOSTAZIONI (Alto a destra) */}
            <div className="absolute top-6 right-6 z-20">
                <button
                    onClick={() => setIsSettingsOpen(true)}
                    className="p-3 bg-white/5 rounded-full text-neutral-400 hover:text-white hover:bg-white/10 transition-colors"
                >
                    <Settings size={20} />
                </button>
            </div>

            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-accent-glow/20 rounded-full blur-[100px] animate-breathe" />

            <div className="z-10 text-center space-y-8" onClick={onZoomIn}>

                <div className="relative w-64 h-64 mx-auto flex items-center justify-center cursor-pointer group">
                    <svg className="w-full h-full transform -rotate-90">
                        <circle cx="128" cy="128" r="120" stroke="#262626" strokeWidth="4" fill="transparent" />
                        <motion.circle
                            cx="128" cy="128" r="120" stroke="#4ade80" strokeWidth="4" fill="transparent"
                            strokeDasharray={circumference}
                            strokeDashoffset={strokeDashoffset}
                            strokeLinecap="round"
                            initial={{ strokeDashoffset: circumference }}
                            animate={{ strokeDashoffset: strokeDashoffset }}
                            transition={{ duration: 2, ease: "easeOut" }}
                            className="drop-shadow-[0_0_10px_rgba(74,222,128,0.5)]"
                        />
                    </svg>

                    <div className="absolute flex flex-col items-center animate-float">
                        <span className="text-5xl font-bold tracking-tighter text-white">{percentage}%</span>
                        <span className="text-xs font-medium text-neutral-400 uppercase tracking-widest mt-2">Vissuto</span>
                    </div>
                </div>

                <motion.div
                    initial={{ y: 50, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.5 }}
                    className="grid grid-cols-1 gap-3 w-full max-w-xs px-10"
                >
                    <div className="bg-surfaceHighlight/50 backdrop-blur-md border border-white/5 p-4 rounded-2xl text-center">
                        <h3 className="text-neutral-500 text-[10px] uppercase">Settimane Vissute</h3>
                        <p className="text-white text-xl font-bold">{weeksLived.toLocaleString()}</p>
                    </div>
                </motion.div>

                <div className="space-y-1">
                    <p className="text-white text-lg font-medium">Ciao, {userData?.name}</p>
                    <p className="text-neutral-600 text-xs animate-pulse">Tocca per esplorare</p>
                </div>
            </div>

            {/* OVERLAY IMPOSTAZIONI */}
            <AnimatePresence>
                {isSettingsOpen && (
                    <SettingsOverlay
                        isOpen={isSettingsOpen}
                        onClose={() => setIsSettingsOpen(false)}
                        userData={userData}
                        onUpdate={onUpdateUser}
                        onLogout={onLogout}
                    />
                )}
            </AnimatePresence>
        </motion.div>
    );
}