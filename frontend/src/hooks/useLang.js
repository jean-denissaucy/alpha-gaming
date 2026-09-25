// hooks/useLang.js - Hook personnalisé pour accéder au contexte de langue

import { useContext } from 'react';
import { LangContext } from '../contexts/lang-context.js';

// Expose la langue courante, la fonction de changement et les traductions.
export function useLang() {
    const context = useContext(LangContext);

    // Sécurité : ce hook ne doit être utilisé que sous le LangProvider du projet.
    if (!context) {
        throw new Error('useLang doit être utilisé dans un LangProvider');
    }

    return context;
}

export default useLang;
