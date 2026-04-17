import logoCompact from '../assets/branding/logo.svg';
import logoFull from '../assets/branding/banner.svg';

function BrandLogo({ variant = 'full', className = '' }) {
    const src = variant === 'compact' ? logoCompact : logoFull;
    const alt = variant === 'compact' ? 'Actu Gaming logo' : 'Actu Gaming banner';

    return <img src={src} alt={alt} className={className} />;
}

export default BrandLogo;