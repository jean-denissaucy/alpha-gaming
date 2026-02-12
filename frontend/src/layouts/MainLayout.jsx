// layouts/MainLayout.jsx - Structure pour les pages publiques avec Header + Footer

import { Outlet } from 'react-router-dom';
import Header from '../components/Header.jsx';
import Footer from '../components/Footer.jsx';

function MainLayout() {
    return (
        <div className="min-h-screen bg-stone-50 text-slate-900">

            {/* Barre de navigation fixe en haut */}
            <Header />

            {/* Contenu principal de la page (injecté par les routes) */}
            <main className="min-h-[calc(100vh-140px)]">
                <Outlet /> {/* ← La page enfant s'affiche ici */}
            </main>

            {/* Pied de page */}
            <Footer />
        </div>
    );
}
export default MainLayout;