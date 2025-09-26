

import React from 'react';
import { QualifyingResult, Driver, Team, TyreCompound } from '../types';
import ImageWithFallback from './ImageWithFallback';
import { getInitials } from '../utils';
import TyreCompoundIcon from './TyreCompoundIcon';
import { useI18n } from '../i18n';

interface DriverGridCardProps {
    result: QualifyingResult;
    driver: Driver;
    team: Team;
    strategy: { driverId: number; startingTyre: TyreCompound };
    animationDelay: string;
    isPolePosition: boolean;
}

const DriverGridCard: React.FC<DriverGridCardProps> = ({ result, driver, team, strategy, animationDelay, isPolePosition }) => {
    const { t } = useI18n();
    const isDNQ = result.status === 'DNQ';

    return (
        <div 
            className={`relative flex items-center p-2 rounded-lg bg-slate-500/10 border-l-4 transition-all duration-200 hover:bg-slate-500/25 hover:scale-105 animate-fade-in ${isDNQ ? 'opacity-60 bg-red-900/30' : ''} ${isPolePosition ? 'pole-position-card' : ''}`}
            style={{ borderColor: isPolePosition ? '#fde047' : team.primaryColor, animationDelay }}
        >
            <div className="w-12 text-center">
                <p className={`font-black text-2xl ${isPolePosition ? 'text-yellow-300' : 'text-slate-200'}`}>{result.position}</p>
            </div>
            <ImageWithFallback
                src={driver.photoUrl}
                alt={driver.name}
                primaryColor={team.primaryColor}
                accentColor={team.accentColor}
                initials={getInitials(driver.name)}
                type="driver"
                className="w-12 h-12 rounded-full object-cover mx-2"
            />
            <div className="flex-grow">
                <p className="font-bold text-slate-200">{driver.name}</p>
                <p className="text-xs text-slate-400 font-mono">{result.lapTime} {result.eliminatedIn && `(${result.eliminatedIn})`}</p>
                {isDNQ && <p className="text-xs text-red-400 font-bold">{t('dnq_107_rule')}</p>}
            </div>
            <div className="flex flex-col items-center gap-1 px-3">
                <span className="text-xs text-slate-500">{t('tyre')}</span>
                <TyreCompoundIcon compound={strategy.startingTyre} size={24} />
            </div>
        </div>
    );
};


interface QualifyingGridProps {
    qualifyingResults: QualifyingResult[];
    drivers: Driver[];
    teams: Team[];
    aiStrategies: { driverId: number; startingTyre: TyreCompound }[];
}

const QualifyingGrid: React.FC<QualifyingGridProps> = ({ qualifyingResults, drivers, teams, aiStrategies }) => {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {qualifyingResults.map((result, index) => {
                const driver = drivers.find(d => d.id === result.driverId);
                const team = teams.find(t => t.id === driver?.teamId);
                const strategy = aiStrategies.find(s => s.driverId === result.driverId);

                if (!driver || !team || !strategy) return null;

                return (
                    <DriverGridCard
                        key={result.driverId}
                        result={result}
                        driver={driver}
                        team={team}
                        strategy={strategy}
                        animationDelay={`${index * 30}ms`}
                        isPolePosition={result.position === 1}
                    />
                );
            })}
        </div>
    );
};

export default QualifyingGrid;