import logoCompact from '../assets/branding/logo alpha-gaming .png';
import logoFull from '../assets/branding/bannier Alpha-Gaming.png';

function BrandLogo({ variant = 'full', className = '' }) {
    const src = variant === 'compact' ? logoCompact : logoFull;
    const alt = variant === 'compact' ? 'Alpha Gaming logo' : 'Alpha Gaming banner';

    return <img src={src} alt={alt} className={className} />;
}

export default BrandLogo;