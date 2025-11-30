import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { X, Calendar, Save, Lock, Camera, Trash2 } from 'lucide-react';

export default function Level3_Detail({ weekData, onClose, onSave, onDelete, initialData }) {
    const [note, setNote] = useState('');
    const [selectedColor, setSelectedColor] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const [compressedFile, setCompressedFile] = useState(null);

    const fileInputRef = useRef(null);

    const isFuture = weekData.timeStatus === 'future';
    const isPresent = weekData.timeStatus === 'present';

    let ageText = `Avevi ${weekData.dateRange.age} anni`;
    if (isPresent) ageText = `Hai ${weekData.dateRange.age} anni`;

    useEffect(() => {
        if (initialData) {
            setNote(initialData.note || '');
            setSelectedColor(initialData.color || null);
            setImagePreview(initialData.image || null);
            setCompressedFile(null);
        } else {
            setNote('');
            setSelectedColor(null);
            setImagePreview(null);
            setCompressedFile(null);
        }
    }, [initialData, weekData]);

    const compressImage = (file) => {
        return new Promise((resolve) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = (event) => {
                const img = new Image();
                img.src = event.target.result;
                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    const MAX_WIDTH = 1080;
                    const scaleSize = MAX_WIDTH / img.width;
                    const newWidth = (img.width > MAX_WIDTH) ? MAX_WIDTH : img.width;
                    const newHeight = (img.width > MAX_WIDTH) ? (img.height * scaleSize) : img.height;

                    canvas.width = newWidth;
                    canvas.height = newHeight;

                    const ctx = canvas.getContext('2d');
                    ctx.drawImage(img, 0, 0, newWidth, newHeight);

                    canvas.toBlob((blob) => {
                        resolve({
                            blob: blob,
                            preview: canvas.toDataURL('image/jpeg', 0.7)
                        });
                    }, 'image/jpeg', 0.7);
                };
            };
        });
    };

    const handleImageUpload = async (e) => {
        const file = e.target.files[0];
        if (file) {
            try {
                const { blob, preview } = await compressImage(file);
                setImagePreview(preview);
                setCompressedFile(blob);
            } catch (err) {
                alert("Errore nella compressione dell'immagine");
            }
        }
    };

    const handleConfirm = () => {
        onSave({
            note,
            color: selectedColor,
            imageBlob: compressedFile,
            currentImageUrl: imagePreview
        });
    };

    if (!weekData) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center pointer-events-none">
            <motion.div
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose}
                className="absolute inset-0 bg-black/60 backdrop-blur-sm pointer-events-auto"
            />
            <motion.div
                initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
                transition={{ type: "spring", damping: 25, stiffness: 300 }}
                className="bg-surfaceHighlight/90 border-t border-white/10 w-full sm:w-[450px] sm:rounded-2xl sm:mb-10 sm:border p-6 rounded-t-3xl shadow-2xl pointer-events-auto relative z-10 max-h-[90vh] overflow-y-auto"
            >
                <div className="w-12 h-1.5 bg-neutral-700 rounded-full mx-auto mb-6" />

                <div className="flex items-start justify-between mb-6">
                    <div>
                        <h3 className="text-neutral-400 text-xs font-medium uppercase tracking-widest mb-1 flex items-center gap-2">
                            <Calendar size={12} /> Settimana {weekData.weekIndex + 1}
                        </h3>
                        <h2 className="text-2xl font-bold text-white">{weekData.dateRange.start} - {weekData.dateRange.end}</h2>
                        <p className="text-accent-glow text-sm font-medium mt-1">{ageText}</p>
                    </div>
                    <button onClick={onClose} className="p-2 bg-neutral-800 rounded-full text-neutral-400 hover:bg-neutral-700 hover:text-white transition-colors"><X size={20} /></button>
                </div>

                {isFuture ? (
                    <div className="py-8 text-center space-y-4 border-t border-white/5">
                        <div className="w-12 h-12 bg-white/5 rounded-full flex items-center justify-center mx-auto text-neutral-500">
                            <Lock size={20} />
                        </div>
                        <div>
                            <p className="text-white font-medium">Il futuro non è ancora scritto.</p>
                            <p className="text-neutral-500 text-sm mt-1">Torna quando avrai vissuto questa settimana.</p>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {/* SEZIONE FOTO */}
                        <div>
                            <label className="block text-xs text-neutral-500 uppercase tracking-wider mb-2 font-semibold">Foto del momento</label>
                            <input type="file" accept="image/*" ref={fileInputRef} onChange={handleImageUpload} className="hidden" />

                            {!imagePreview ? (
                                <button onClick={() => fileInputRef.current.click()} className="w-full h-32 border-2 border-dashed border-white/10 rounded-xl flex flex-col items-center justify-center gap-2 text-neutral-500 hover:text-white hover:border-white/30 hover:bg-white/5 transition-all">
                                    <Camera size={24} /> <span className="text-xs font-medium">Aggiungi scatto</span>
                                </button>
                            ) : (
                                <div className="relative w-full h-48 rounded-xl overflow-hidden border border-white/10 group">
                                    <img src={imagePreview} alt="Ricordo" className="w-full h-full object-cover" />
                                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4">
                                        <button onClick={() => { setImagePreview(null); setCompressedFile(null); }} className="p-3 bg-red-500/80 rounded-full text-white hover:bg-red-500 transition-colors"><Trash2 size={20} /></button>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* SEZIONE MEMORIA */}
                        <div>
                            <label className="block text-xs text-neutral-500 uppercase tracking-wider mb-2 font-semibold">La tua memoria</label>
                            <textarea value={note} onChange={(e) => setNote(e.target.value)} className="w-full bg-black/20 border border-white/10 rounded-xl p-4 text-white placeholder-neutral-600 focus:outline-none focus:border-accent-glow/50 transition-colors resize-none h-24 text-sm leading-relaxed" placeholder={isPresent ? "Come sta andando questa settimana?" : "Cosa ricordi di quei giorni?"} />
                        </div>

                        {/* SEZIONE COLORE - FIX PADDING */}
                        <div>
                            <label className="block text-xs text-neutral-500 uppercase tracking-wider mb-3 font-semibold">Colore dell'anima</label>
                            {/* Ho cambiato pb-2 con p-2 qui sotto */}
                            <div className="flex justify-between sm:justify-start sm:gap-4 overflow-x-auto p-2 scrollbar-hide -mx-2 px-2">
                                {[ { color: 'bg-slate-500', name: 'Neutro' }, { color: 'bg-red-500', name: 'Amore' }, { color: 'bg-orange-500', name: 'Energia' }, { color: 'bg-yellow-500', name: 'Felicità' }, { color: 'bg-green-500', name: 'Natura' }, { color: 'bg-blue-500', name: 'Tristezza' }, { color: 'bg-purple-500', name: 'Creatività' }].map((item) => (
                                    <button
                                        key={item.color}
                                        onClick={() => setSelectedColor(item.color)}
                                        // Aggiunto relative e z-index per sicurezza
                                        className={`
                                            relative z-10
                                            min-w-[32px] h-8 rounded-full ${item.color} 
                                            transition-all duration-200 
                                            ring-2 ring-offset-2 ring-offset-surfaceHighlight
                                            ${selectedColor === item.color ? 'scale-110 ring-white z-20' : 'ring-transparent hover:scale-105 opacity-80 hover:opacity-100'}
                                        `}
                                        title={item.name}
                                    />
                                ))}
                            </div>
                        </div>

                        <div className="space-y-3 mt-6">
                            <button onClick={handleConfirm} className="w-full bg-white text-black font-bold py-4 rounded-xl flex items-center justify-center gap-2 hover:bg-neutral-200 transition-all active:scale-95 shadow-lg shadow-white/5">
                                <Save size={18} /> Salva Ricordo
                            </button>

                            {initialData && (
                                <button
                                    onClick={onDelete}
                                    className="w-full bg-red-500/10 border border-red-500/20 text-red-500 font-bold py-4 rounded-xl flex items-center justify-center gap-2 hover:bg-red-500/20 transition-all active:scale-95"
                                >
                                    <Trash2 size={18} />
                                    Elimina Ricordo
                                </button>
                            )}
                        </div>
                    </div>
                )}
            </motion.div>
        </div>
    );
}