import React from 'react';
import { TyreCompound } from '../types';

interface TyreCompoundIconProps {
  compound: TyreCompound;
  size?: number;
  className?: string;
}

const TyreCompoundIcon: React.FC<TyreCompoundIconProps> = ({ compound, size = 16, className = '' }) => {
    const compoundStyles: Record<TyreCompound, { color: string; letter: string }> = {
        [TyreCompound.Soft]: { color: '#ef4444', letter: 'S' },
        [TyreCompound.Medium]: { color: '#eab308', letter: 'M' },
        [TyreCompound.Hard]: { color: '#f3f4f6', letter: 'H' },
        [TyreCompound.Intermediate]: { color: '#22c55e', letter: 'I' },
        [TyreCompound.Wet]: { color: '#3b82f6', letter: 'W' },
    };
    
    const style = compoundStyles[compound];

    return (
        <div 
            className={`flex items-center justify-center rounded-full font-bold text-black ${className}`}
            style={{ 
                backgroundColor: style.color, 
                width: size, 
                height: size, 
                fontSize: size * 0.6,
                color: compound === TyreCompound.Hard || compound === TyreCompound.Medium ? '#000' : '#fff',
                boxShadow: `0 0 2px ${style.color}`
             }}
            title={compound}
        >
            {style.letter}
        </div>
    );
};

export default TyreCompoundIcon;
