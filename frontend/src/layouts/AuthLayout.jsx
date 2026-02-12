// layouts/AuthLayout.jsx - Structure pour les pages d'authentification avec Header + Footer

import { Outlet } from 'react-router-dom';
import Header from '../components/Header.jsx';
import Footer from '../components/Footer.jsx';

function AuthLayout() {
    return (
        <div className="min-h-screen bg-stone-50 text-slate-900">
            {/* Barre de navigation */}
            <Header />

            {/* Contenu de la page d'authentification */}
            <main className="min-h-[calc(100vh-140px)]">
                <Outlet />
            </main>

            {/* Pied de page */}
            <Footer />
        </div>
    );
}
export default AuthLayout;