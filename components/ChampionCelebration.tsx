import React from 'react';
import { Driver, Team } from '../types';
import TrophyIcon from './icons/TrophyIcon';
import ArrowRightIcon from './icons/ArrowRightIcon';
import { useI18n } from '../i18n';
import ImageWithFallback from './ImageWithFallback';
import { getInitials } from '../utils';

interface ChampionCelebrationProps {
    driverChampion: { driver: Driver; team: Team };
    constructorChampion: Team;
    year: number;
    onContinue: () => void;
}

const ChampionCelebration: React.FC<ChampionCelebrationProps> = ({ driverChampion, constructorChampion, year, onContinue }) => {
    const { t } = useI18n();

    return (
        <div className="relative flex flex-col items-center justify-center p-6 bg-gradient-to-br from-[#1e1e2b] to-slate-900 border border-slate-700 rounded-2xl shadow-lg overflow-hidden min-h-[500px] animate-fade-in">
            {/* Confetti */}
            {[...Array(16)].map((_, i) => <div key={i} className="confetti"></div>)}

            <div className="relative z-10 w-full flex flex-col items-center text-center">
                <h1 className="text-4xl sm:text-5xl font-black text-yellow-300 uppercase tracking-widest" style={{ textShadow: '0 0 15px rgba(253, 224, 71, 0.7)' }}>
                    {t('championsYear', { year })}
                </h1>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-12 w-full max-w-5xl">
                    {/* Drivers' Champion */}
                    <div className="bg-slate-500/10 p-6 rounded-xl border border-slate-700 flex flex-col items-center animate-podium-pop-in" style={{ animationDelay: '0.2s' }}>
                        <h2 className="text-2xl font-bold text-slate-300 mb-4">{t('driversChampion')}</h2>
                        <TrophyIcon className="w-16 h-16 text-yellow-400 mb-4" />
                        <ImageWithFallback
                            src={driverChampion.driver.photoUrl}
                            alt={driverChampion.driver.name}
                            primaryColor={driverChampion.team.primaryColor}
                            accentColor={driverChampion.team.accentColor}
                            initials={getInitials(driverChampion.driver.name)}
                            type="driver"
                            className="w-40 h-40 rounded-full object-cover mb-4 border-4 border-yellow-400 shadow-lg"
                        />
                        <h3 className="text-3xl font-bold text-white">{driverChampion.driver.name}</h3>
                        <p className="text-lg text-slate-400">{driverChampion.team.name}</p>
                    </div>

                    {/* Constructors' Champion */}
                    <div className="bg-slate-500/10 p-6 rounded-xl border border-slate-700 flex flex-col items-center animate-podium-pop-in" style={{ animationDelay: '0.7s' }}>
                        <h2 className="text-2xl font-bold text-slate-300 mb-4">{t('constructorsChampion')}</h2>
                        <TrophyIcon className="w-16 h-16 text-yellow-400 mb-4" />
                        <ImageWithFallback
                            src={constructorChampion.logoUrl}
                            alt={constructorChampion.name}
                            primaryColor={constructorChampion.primaryColor}
                            accentColor={constructorChampion.accentColor}
                            initials={getInitials(constructorChampion.name)}
                            type="team"
                            className="w-40 h-40 object-contain mb-4 p-4"
                        />
                        <h3 className="text-3xl font-bold text-white" style={{color: constructorChampion.primaryColor}}>{constructorChampion.name}</h3>
                    </div>
                </div>

                <button
                    onClick={onContinue}
                    className="mt-12 w-full sm:w-auto px-8 py-3 bg-[#00e051] text-black font-bold text-lg uppercase rounded-lg shadow-lg hover:bg-opacity-90 focus:outline-none focus:ring-4 focus:ring-[#00e051]/50 transform hover:scale-105 transition-all duration-300 flex items-center justify-center gap-3 animate-podium-pop-in"
                    style={{ animationDelay: '1.2s' }}
                >
                    <span>{t('continue')}</span>
                    <ArrowRightIcon className="w-6 h-6" />
                </button>
            </div>
        </div>
    );
};

export default ChampionCelebration;
