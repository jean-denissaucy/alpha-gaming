// layouts/AuthLayout.jsx - Structure pour les pages d'authentification avec Header + Footer

import { Outlet } from 'react-router-dom';
import Header from '../components/Header.jsx';
import Footer from '../components/Footer.jsx';

function AuthLayout() {
    return (
        <div className="min-h-screen bg-transparent text-slate-900">
            {/* Barre de navigation */}
            <Header />

            {/* Contenu de la page d'authentification */}
            <main className="relative min-h-[calc(100vh-140px)]">
                <div
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-x-6 top-6 bottom-6 rounded-[2.2rem] bg-linear-to-br from-cyan-500/10 via-slate-900/20 to-pink-500/10"
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