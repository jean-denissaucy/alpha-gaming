// layouts/AuthLayout.jsx - Structure pour les pages d'authentification avec Header + Footer

import { Outlet } from 'react-router-dom';
import Header from '../components/Header.jsx';
import Footer from '../components/Footer.jsx';

function AuthLayout() {
    return (
        <div className="min-h-screen bg-transparent text-slate-100">
            {/* Lien d'évitement « Aller au contenu » (RGAA 12.7) */}
            <a
                href="#contenu-principal"
                className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[100] focus:rounded-xl focus:border focus:border-cyan-400 focus:bg-slate-950 focus:px-5 focus:py-3 focus:font-semibold focus:text-cyan-200"
            >
                Aller au contenu principal
            </a>

            {/* Barre de navigation */}
            <Header />

            {/* Contenu de la page d'authentification */}
            <main id="contenu-principal" className="relative min-h-[calc(100vh-140px)]">
                <div
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-x-6 top-6 bottom-6 rounded-[2.2rem] bg-linear-to-br from-cyan-500/16 via-slate-900/30 to-blue-500/14"
                />
                <div className="relative z-10">
                    <Outlet />
                </div>
            </main>

            {/* Pied de page */}
            <Footer />
        </div>
    );
}
export default AuthLayout;