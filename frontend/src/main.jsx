// main.jsx - Point d'entrée de l'application React

// Import des dépendances React
import React from 'react';
import ReactDOM from 'react-dom/client';

// Import du routeur pour la navigation
import { BrowserRouter } from 'react-router-dom';

// Import du composant principal
import App from './App.jsx';

// Import du provider d'authentification
import { AuthProvider } from './contexts/AuthContext.jsx';

// Import du provider de langue (FR/EN)
import { LangProvider } from './contexts/LangContext.jsx';

// Import des styles globaux (Tailwind)
import './index.css';
import './admin.css';
import './esport.css';
import './news.css';

// Création et rendu de l'application dans le DOM
ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>

    {/* BrowserRouter gère la navigation dans l'application */}
    <BrowserRouter>

      {/* LangProvider fournit la langue (FR/EN) à toute l'app */}
      <LangProvider>

        {/* AuthProvider fournit le contexte d'authentification à toute l'app */}
        <AuthProvider>
          <App />
        </AuthProvider>
      </LangProvider>
    </BrowserRouter>
  </React.StrictMode>
);