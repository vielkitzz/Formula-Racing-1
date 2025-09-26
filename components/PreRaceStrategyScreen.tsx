
import React, { useState, useEffect } from 'react';
import { QualifyingResult, Driver, Team, Race, TyreCompound, WeatherCondition } from '../types';
import WeatherIcon from './icons/WeatherIcon';
import PlayIcon from './icons/PlayIcon';
import { generatePreRaceStrategies } from '../strategyEngine';
import { useI18n } from '../i18n';
import QualifyingGrid from './QualifyingGrid';

interface PreRaceStrategyScreenProps {
  qualifyingResults: QualifyingResult[];
  drivers: Driver[];
  teams: Team[];
  race: Race;
  weather: WeatherCondition;
  onStartRace: (strategies: { driverId: number; startingTyre: TyreCompound }[], startingWeather: WeatherCondition) => void;
  onBack: () => void;
}

const PreRaceStrategyScreen: React.FC<PreRaceStrategyScreenProps> = ({ qualifyingResults, drivers, teams, race, weather, onStartRace, onBack }) => {
    const { t } = useI18n();
    const [aiStrategies, setAiStrategies] = useState<{ driverId: number; startingTyre: TyreCompound }[]>([]);

    useEffect(() => {
        // Usa o novo mecanismo de estratégia para gerar pneus de largada mais realistas.
        const strategies = generatePreRaceStrategies(qualifyingResults, weather);
        setAiStrategies(strategies);
    }, [qualifyingResults, weather]);

    const weatherTextMap = {
        'Dry': t('weather_dry'),
        'LightRain': t('weather_lightRain'),
        'HeavyRain': t('weather_heavyRain')
    };

    return (
        <div className="bg-[#1e1e2b]/80 border border-slate-700 rounded-2xl backdrop-blur-sm shadow-lg p-6 animate-fade-in">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 border-b border-slate-700 pb-4">
                <div>
                    <h3 className="text-2xl font-bold text-slate-200">{t('preRace_title')}</h3>
                    <p className="text-slate-400">{t('preRace_gridFormation')}</p>
                </div>
                <div className="flex items-center gap-3 text-lg mt-2 sm:mt-0">
                    <span className="font-semibold text-slate-300">{t('preRace_forecast')}:</span>
                    <div className="flex items-center gap-2 px-3 py-1 bg-slate-900/50 rounded-full border border-slate-700">
                        <WeatherIcon weather={weather} className="w-6 h-6 text-blue-400" />
                        <span className="font-bold">{weatherTextMap[weather]}</span>
                    </div>
                </div>
            </div>

            <div className="mb-6 max-h-[60vh] overflow-y-auto pr-2">
               <QualifyingGrid 
                    qualifyingResults={qualifyingResults}
                    drivers={drivers}
                    teams={teams}
                    aiStrategies={aiStrategies}
               />
            </div>


            <div className="text-center mt-6 flex flex-col sm:flex-row-reverse justify-center items-center gap-4">
                <button
                    onClick={() => onStartRace(aiStrategies, weather)}
                    className="w-full sm:w-auto px-8 py-3 bg-[#00e051] text-black font-bold text-xl uppercase rounded-lg shadow-lg hover:bg-opacity-90 focus:outline-none focus:ring-4 focus:ring-[#00e051]/50 transform hover:scale-105 transition-transform duration-300 flex items-center justify-center gap-3"
                >
                    <PlayIcon className="w-8 h-8" />
                    <span>{t('startRace')}</span>
                </button>
                <button
                    onClick={onBack}
                    className="w-full sm:w-auto px-8 py-3 bg-slate-600/50 text-slate-200 font-bold uppercase rounded-lg shadow-md hover:bg-slate-500/50 transition-colors duration-300"
                >
                    <span>{t('back')}</span>
                </button>
            </div>
        </div>
    );
};

export default PreRaceStrategyScreen;
