// components/AccessibilityWidget.jsx - Bouton flottant « Accessibilité » (RGAA).
// Permet à l'utilisateur d'activer des options d'accessibilité sur tout le site :
//   - texte agrandi
//   - contraste renforcé
//   - réduction des animations (vidéo de fond, particules)
//   - soulignement des liens
// Les préférences sont enregistrées dans le navigateur (localStorage) et réappliquées à chaque visite.
// Par défaut, « réduire les animations » est actif si l'utilisateur a activé « mouvement réduit » dans son OS.

import { useEffect, useState } from 'react';
import { Accessibility, X } from 'lucide-react';
import useFocusTrap from '../hooks/useFocusTrap.js';

const PREFS_KEY = 'a11y-preferences';

// Correspondance préférence -> classe CSS posée sur <html> (styles définis dans index.css).
const PREF_CLASSES = {
    bigText: 'a11y-big-text',
    contrast: 'a11y-contrast',
    noMotion: 'a11y-no-motion',
    underlineLinks: 'a11y-underline-links'
};

const DEFAULT_PREFS = {
    bigText: false,
    contrast: false,
    noMotion: false,
    underlineLinks: false
};

// Respecte le réglage système « réduire les animations » (RGAA 13.8 / WCAG 2.3.3).
function systemPrefersReducedMotion() {
    return window.matchMedia ? window.matchMedia('(prefers-reduced-motion: reduce)').matches : false;
}

function loadPreferences() {
    const defaults = { ...DEFAULT_PREFS, noMotion: systemPrefersReducedMotion() };
    try {
        const raw = localStorage.getItem(PREFS_KEY);
        return raw ? { ...defaults, ...JSON.parse(raw) } : defaults;
    } catch {
        return defaults;
    }
}

function AccessibilityWidget() {
    const [open, setOpen] = useState(false);
    const [prefs, setPrefs] = useState(loadPreferences);

    // Focus piégé dans le panneau : Échap ferme, Tab reste dedans, focus restitué au bouton (RGAA 7.3).
    const panelRef = useFocusTrap(open, () => setOpen(false));

    // Applique les classes sur <html> et persiste les préférences à chaque changement.
    useEffect(() => {
        const root = document.documentElement;
        Object.entries(PREF_CLASSES).forEach(([key, className]) => {
            root.classList.toggle(className, Boolean(prefs[key]));
        });
        try {
            localStorage.setItem(PREFS_KEY, JSON.stringify(prefs));
        } catch {
            // localStorage indisponible (navigation privée stricte) : on ignore, les options restent actives pour la session.
        }
    }, [prefs]);

    const togglePreference = (key) => setPrefs((current) => ({ ...current, [key]: !current[key] }));

    const OPTIONS = [
        { key: 'bigText', label: 'Agrandir le texte', description: 'Augmente la taille de tout le site' },
        { key: 'contrast', label: 'Contraste renforcé', description: 'Éclaircit les textes gris sur fond sombre' },
        { key: 'noMotion', label: 'Réduire les animations', description: 'Stoppe la vidéo de fond et les particules' },
        { key: 'underlineLinks', label: 'Souligner les liens', description: 'Rend tous les liens cliquables identifiables' }
    ];

    return (
        <>
            {/* Bouton d'ouverture — fixé en bas à droite, visible sur toutes les pages */}
            <button
                type="button"
                onClick={() => setOpen((isOpen) => !isOpen)}
                aria-expanded={open}
                aria-haspopup="dialog"
                className="fixed bottom-4 right-4 z-[90] inline-flex items-center gap-2 rounded-full border border-cyan-400/40 bg-slate-950/90 px-4 py-3 text-sm font-bold text-cyan-200 shadow-[0_10px_30px_-10px_rgba(0,167,255,0.6)] backdrop-blur transition hover:border-cyan-300 hover:text-white"
            >
                <Accessibility className="h-5 w-5" />
                <span className="hidden sm:inline">Accessibilité</span>
                <span className="sr-only sm:hidden">Options d'accessibilité</span>
            </button>

            {/* Panneau d'options */}
            {open && (
                <div
                    ref={panelRef}
                    role="dialog"
                    aria-label="Options d'accessibilité"
                    tabIndex={-1}
                    className="fixed bottom-20 right-4 z-[90] w-[min(22rem,calc(100vw-2rem))] rounded-2xl border border-cyan-400/25 bg-slate-950/95 p-5 shadow-[0_24px_60px_-20px_rgba(0,0,0,0.8)] backdrop-blur"
                >
                    <div className="flex items-start justify-between gap-3">
                        <h2 className="text-base font-semibold text-white">Options d'accessibilité</h2>
                        <button
                            type="button"
                            onClick={() => setOpen(false)}
                            aria-label="Fermer les options d'accessibilité"
                            className="rounded-lg p-1 text-slate-400 transition hover:bg-white/10 hover:text-white"
                        >
                            <X className="h-4 w-4" />
                        </button>
                    </div>

                    <div className="mt-4 space-y-3">
                        {OPTIONS.map((option) => (
                            <div key={option.key} className="flex items-start gap-3 rounded-xl border border-slate-700/60 bg-slate-900/60 p-3">
                                <input
                                    id={`a11y-${option.key}`}
                                    type="checkbox"
                                    checked={prefs[option.key]}
                                    onChange={() => togglePreference(option.key)}
                                    className="mt-0.5 h-4 w-4 shrink-0 cursor-pointer accent-cyan-400"
                                />
                                <label htmlFor={`a11y-${option.key}`} className="cursor-pointer">
                                    <span className="block text-sm font-semibold text-white">{option.label}</span>
                                    <span className="mt-0.5 block text-xs text-slate-400">{option.description}</span>
                                </label>
                            </div>
                        ))}
                    </div>

                    <p className="mt-4 text-xs text-slate-500">
                        Vos préférences sont enregistrées sur cet appareil et réappliquées à chaque visite.
                    </p>
                </div>
            )}
        </>
    );
}

export default AccessibilityWidget;
