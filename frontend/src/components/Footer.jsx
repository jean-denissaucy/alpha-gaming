// components/Footer.jsx
// Pied de page global affiché sur toutes les pages principales du site.

function Footer() {
    return (
        <footer className="border-t border-cyan-400/20 bg-black/70">
            <div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-3 px-6 py-8 text-sm text-slate-300 sm:flex-row sm:items-center">
                <p className="font-semibold uppercase tracking-[0.12em] text-white">Alpha Gaming - © {new Date().getFullYear()}</p>
                <p>PlayStation, Xbox, Nintendo, PC et Esport en continu</p>
            </div>
        </footer>
    );
}

export default Footer;