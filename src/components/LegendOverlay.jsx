import React from 'react';
import { motion } from 'framer-motion';
import { X, Info } from 'lucide-react';
import { ERA_INFO } from '../utils/constants';

export default function LegendOverlay({ isOpen, onClose }) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/80 backdrop-blur-md">
            <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-surfaceHighlight border border-white/10 w-full max-w-sm rounded-3xl p-6 shadow-2xl max-h-[80vh] overflow-y-auto"
            >
                <div className="flex justify-between items-center mb-6">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-white/5 rounded-full text-accent-glow">
                            <Info size={20} />
                        </div>
                        <h2 className="text-xl font-bold text-white">Mappa delle Ere</h2>
                    </div>
                    <button onClick={onClose} className="p-2 bg-white/5 rounded-full text-neutral-400 hover:text-white transition-colors">
                        <X size={20} />
                    </button>
                </div>

                <div className="space-y-4">
                    {ERA_INFO.map((era) => (
                        <div key={era.name} className="flex items-center gap-4 p-3 rounded-xl hover:bg-white/5 transition-colors">
                            {/* Pallino Colore */}
                            <div className={`w-8 h-8 rounded-lg ${era.color} shadow-lg shadow-black/50 ring-1 ring-white/10`} />

                            <div>
                                <h3 className="text-white font-medium text-sm">{era.name}</h3>
                                <p className="text-neutral-500 text-xs">{era.desc}</p>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="mt-8 pt-6 border-t border-white/5 text-center">
                    <p className="text-neutral-600 text-xs leading-relaxed">
                        "La vita non si misura in anni, ma in colori." <br/>
                        Ogni decade porta con sé una nuova sfumatura.
                    </p>
                </div>
            </motion.div>
        </div>
    );
}