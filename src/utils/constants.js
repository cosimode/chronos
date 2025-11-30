export const ERA_INFO = [
    { name: "Infanzia", color: "bg-indigo-500", desc: "La scoperta del mondo" },
    { name: "Adolescenza", color: "bg-purple-500", desc: "La ricerca dell'identità" },
    { name: "Vent'anni", color: "bg-emerald-500", desc: "Energia e costruzione" },
    { name: "Trent'anni", color: "bg-teal-600", desc: "Consolidamento" },
    { name: "Quarant'anni", color: "bg-cyan-600", desc: "Consapevolezza" },
    { name: "Cinquant'anni", color: "bg-sky-600", desc: "Saggezza attiva" },
    { name: "Sessant'anni", color: "bg-amber-600", desc: "L'età del raccolto" },
    { name: "Settant'anni", color: "bg-orange-600", desc: "Eredità e memoria" },
    { name: "Ottant'anni", color: "bg-red-600", desc: "Essenzialità" },
    { name: "Leggenda", color: "bg-rose-500", desc: "Oltre ogni limite" },
];

// Mappa semplice per la Timeline (retrocompatibilità)
export const ERA_COLORS = ERA_INFO.reduce((acc, era) => {
    acc[era.name] = era.color;
    return acc;
}, { "Default": "bg-slate-700" });