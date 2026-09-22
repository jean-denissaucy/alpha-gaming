// layouts/MainLayout.jsx - Structure pour les pages publiques avec Header + Footer

import { Outlet } from 'react-router-dom';
import Header from '../components/Header.jsx';
import Footer from '../components/Footer.jsx';

function MainLayout() {
    return (
        <div className="min-h-screen bg-transparent text-slate-100">

            {/* Lien d'évitement : permet aux utilisateurs de clavier et lecteurs d'écran de sauter
                directement au contenu principal sans parcourir toute la navigation (RGAA 12.7). */}
            <a
                href="#contenu-principal"
                className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[100] focus:rounded-xl focus:border focus:border-cyan-400 focus:bg-slate-950 focus:px-5 focus:py-3 focus:font-semibold focus:text-cyan-200"
            >
                Aller au contenu principal
            </a>

            {/* Barre de navigation fixe en haut */}
            <Header />

            {/* Contenu principal de la page (injecté par les routes) */}
            <main id="contenu-principal" className="relative min-h-[calc(100vh-140px)]">
                <div
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-x-6 top-6 bottom-6 rounded-[2.2rem] bg-linear-to-br from-cyan-500/14 via-slate-900/20 to-blue-500/12"
                />
                <div className="relative z-10">
                    <Outlet /> {/* ← La page enfant s'affiche ici */}
                </div>
            </main>

            {/* Pied de page */}
            <Footer />
        </div>
    );
}
export default MainLayout;