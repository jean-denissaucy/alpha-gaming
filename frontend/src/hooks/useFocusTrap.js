// hooks/useFocusTrap.js - Piégeage du focus dans une modale (RGAA 7.3 / bonnes pratiques WCAG).
// Quand une modale est ouverte :
//   1. le focus va automatiquement au premier élément interactif de la modale ;
//   2. la touche Tab reste enfermée dans la modale (on ne peut pas « sortir » dessus) ;
//   3. la touche Échap ferme la modale (via le callback onClose) ;
//   4. à la fermeture, le focus est restitué à l'élément qui a ouvert la modale.

import { useEffect, useRef } from 'react';

export default function useFocusTrap(isActive, onClose) {
    // Référence à poser sur le conteneur de la modale.
    const containerRef = useRef(null);
    const onCloseRef = useRef(onClose);

    useEffect(() => {
        onCloseRef.current = onClose;
    }, [onClose]);

    useEffect(() => {
        if (!isActive || !containerRef.current) return undefined;

        // Élément qui avait le focus à l'ouverture (pour le restituer à la fermeture).
        const previouslyFocused = document.activeElement;

        const getFocusables = () => Array.from(
            containerRef.current.querySelectorAll(
                'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
            )
        ).filter((element) => element.offsetParent !== null);

        // 1. Focus initial sur le premier élément interactif.
        const focusables = getFocusables();
        if (focusables.length > 0) {
            focusables[0].focus();
        } else {
            containerRef.current.focus();
        }

        const handleKeyDown = (event) => {
            // 3. Échap ferme la modale.
            if (event.key === 'Escape') {
                event.stopPropagation();
                if (onCloseRef.current) onCloseRef.current();
                return;
            }

            // 2. Tab enfermé dans la modale.
            if (event.key !== 'Tab') return;

            const elements = getFocusables();
            if (elements.length === 0) return;

            const firstElement = elements[0];
            const lastElement = elements[elements.length - 1];

            if (event.shiftKey && document.activeElement === firstElement) {
                // Maj+Tab sur le premier : on repart au dernier.
                event.preventDefault();
                lastElement.focus();
            } else if (!event.shiftKey && document.activeElement === lastElement) {
                // Tab sur le dernier : on repart au premier.
                event.preventDefault();
                firstElement.focus();
            }
        };

        document.addEventListener('keydown', handleKeyDown);

        return () => {
            document.removeEventListener('keydown', handleKeyDown);
            // 4. Restitution du focus à l'élément déclencheur.
            if (previouslyFocused && typeof previouslyFocused.focus === 'function') {
                previouslyFocused.focus();
            }
        };
    }, [isActive]);

    return containerRef;
}
