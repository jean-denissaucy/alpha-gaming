// components/Footer.jsx
// Pied de page global affiché sur toutes les pages principales du site.

import { useLang } from '../hooks/useLang.js';

function Footer() {
    // Tagline traduite selon la langue choisie (FR/EN).
    const { t } = useLang();

    return (
        <footer className="border-t border-cyan-400/20 bg-black/70">
            <div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-3 px-6 py-8 text-sm text-slate-300 sm:flex-row sm:items-center">
                <p className="font-semibold uppercase tracking-[0.12em] text-white">Alpha Gaming - © {new Date().getFullYear()}</p>
                <p>{t.footer.tagline}</p>
            </div>
        </footer>
    );
}

export default Footer;