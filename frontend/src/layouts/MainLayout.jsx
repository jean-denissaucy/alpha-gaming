// layouts/MainLayout.jsx - Structure pour les pages publiques avec Header + Footer

import { Outlet } from 'react-router-dom';
import Header from '../components/Header.jsx';
import Footer from '../components/Footer.jsx';

function MainLayout() {
    return (
        <div className="min-h-screen bg-transparent text-slate-900">

            {/* Barre de navigation fixe en haut */}
            <Header />

            {/* Contenu principal de la page (injecté par les routes) */}
            <main className="relative min-h-[calc(100vh-140px)]">
                <div
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-x-6 top-6 bottom-6 rounded-[2.2rem] bg-linear-to-br from-cyan-500/10 via-slate-900/20 to-pink-500/10"
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