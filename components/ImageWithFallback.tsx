import React, { useState, useEffect } from 'react';

interface ImageWithFallbackProps extends React.ImgHTMLAttributes<HTMLImageElement> {
    primaryColor: string;
    accentColor: string;
    initials: string;
    type: 'driver' | 'team';
}

const ImageWithFallback: React.FC<ImageWithFallbackProps> = ({ src, alt, primaryColor, accentColor, initials, type, className, ...props }) => {
    const [hasError, setHasError] = useState(!src);

    useEffect(() => {
        setHasError(!src);
    }, [src]);

    const isDark = (hex: string): boolean => {
        if (!hex || hex.length < 4) return false;
        const color = hex.substring(1); // remove #
        const r = parseInt(color.substring(0, 2), 16);
        const g = parseInt(color.substring(2, 4), 16);
        const b = parseInt(color.substring(4, 6), 16);
        // Using the luminance formula
        const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
        return luminance < 0.5;
    };

    const textColor = isDark(primaryColor) ? (accentColor === '#000000' ? '#FFFFFF' : accentColor) : '#1e1e2b';

    if (hasError) {
        return (
            <div
                className={`flex items-center justify-center font-black select-none ${className}`}
                style={{
                    backgroundColor: primaryColor,
                    color: textColor,
                    fontSize: type === 'driver' ? '1.2rem' : '1rem',
                    lineHeight: 1,
                }}
                title={alt}
            >
                <span>{initials}</span>
            </div>
        );
    }

    return (
        <img
            src={src}
            alt={alt}
            className={className}
            onError={() => setHasError(true)}
            {...props}
        />
    );
};

export default ImageWithFallback;