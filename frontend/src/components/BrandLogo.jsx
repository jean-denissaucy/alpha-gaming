import logoCompact from '../assets/branding/logo-alpha-gaming.webp';
import logoFull from '../assets/branding/banner-alpha-gaming.webp';

function BrandLogo({ variant = 'full', className = '' }) {
    const alt = variant === 'compact' ? 'Alpha-Gaming logo' : 'Alpha-Gaming banner';

    if (variant === 'compact') {
        return (
            <img src={logoCompact} alt={alt} className={className} width={64} height={64} loading="eager" decoding="async" />
        );
    }

    return (
        <img src={logoFull} alt={alt} className={className} width={900} height={280} loading="eager" decoding="async" />
    );
}

export default BrandLogo;