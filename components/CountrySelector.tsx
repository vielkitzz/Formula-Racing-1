
import React from 'react';
import { COUNTRIES } from '../constants';
import { Country } from '../types';
import { useI18n } from '../i18n';

interface CountrySelectorProps {
    value: string;
    onChange: (event: React.ChangeEvent<HTMLSelectElement>) => void;
    className?: string;
    customCountries?: Country[];
}

const CountrySelector: React.FC<CountrySelectorProps> = ({ value, onChange, className, customCountries = [] }) => {
    const { t } = useI18n();
    
    const allCountries = [...customCountries, ...COUNTRIES];
    // Sort alphabetically
    allCountries.sort((a, b) => a.name.localeCompare(b.name));

    return (
        <select
            value={value}
            onChange={onChange}
            className={`w-full bg-[#15141f] p-2 rounded-md border border-slate-700 focus:outline-none focus:ring-2 focus:ring-[#00e051] focus:border-[#00e051] ${className}`}
        >
            <option value="" disabled>{t('selectCountry')}</option>
            {allCountries.map(country => (
                <option key={country.code} value={country.code} className="bg-[#1e1e2b]">
                    {country.name}
                </option>
            ))}
        </select>
    );
};

export default CountrySelector;
