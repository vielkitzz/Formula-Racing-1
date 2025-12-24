
import React from 'react';
import { Country } from '../types';
import { getCountryFlagUrl } from '../utils';

interface CountryFlagProps {
    countryCode: string;
    customCountries?: Country[];
    className?: string;
    alt?: string;
    title?: string;
}

const CountryFlag: React.FC<CountryFlagProps> = ({ countryCode, customCountries = [], className = "w-5 h-auto rounded-sm", alt, title }) => {
    const customCountry = customCountries.find(c => c.code === countryCode);
    
    if (customCountry && customCountry.flagUrl) {
        return (
            <img 
                src={customCountry.flagUrl} 
                alt={alt || customCountry.name} 
                title={title || customCountry.name} 
                className={className} 
            />
        );
    }

    return (
        <img 
            src={getCountryFlagUrl(countryCode)} 
            alt={alt || countryCode} 
            title={title || countryCode} 
            className={className} 
        />
    );
};

export default CountryFlag;
