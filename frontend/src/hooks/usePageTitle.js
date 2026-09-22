// hooks/usePageTitle.js - Titre de page dynamique (critère RGAA 8.6 :
// chaque page a un titre qui décrit son contenu ou sa fonction).

import { useEffect } from 'react';

// Met à jour le titre de l'onglet navigateur à chaque changement de page.
export default function usePageTitle(title) {
    useEffect(() => {
        document.title = title ? `${title} - Alpha Gaming` : 'Alpha Gaming';
    }, [title]);
}
