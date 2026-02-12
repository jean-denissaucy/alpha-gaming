// components/Footer.jsx
// components/Footer.jsx - Pied de page de l'application

function Footer() {
    return (
        <footer className="border-t border-slate-200/70">
            <div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-3 px-6 py-8 text-sm text-slate-600 sm:flex-row sm:items-center">
                <p>Starter Kit MERM - © {new Date().getFullYear()}</p>
                <p>Auth JWT, routes protegees, React + Vite</p>
            </div>
        </footer>
    );
}

export default Footer;