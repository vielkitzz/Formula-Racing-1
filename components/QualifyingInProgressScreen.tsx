import React from 'react';
import { QualifyingData, Driver, Team, QualifyingResult } from '../types';
import { useI18n } from '../i18n';
import SpinnerIcon from './icons/SpinnerIcon';
import FlagIcon from './icons/FlagIcon';
import ImageWithFallback from './ImageWithFallback';
import { getInitials } from '../utils';

interface QualifyingInProgressScreenProps {
    qualifyingData: QualifyingData | null;
    drivers: Driver[];
    teams: Team[];
}

const SessionColumn: React.FC<{
    title: string;
    results: QualifyingResult[] | undefined;
    drivers: Driver[];
    teams: Team[];
    totalInSession: number;
    eliminationCount: number;
    isLoading: boolean;
}> = ({ title, results, drivers, teams, totalInSession, eliminationCount, isLoading }) => {
    const { t } = useI18n();
    const advancesCount = totalInSession - eliminationCount;

    const getRowClass = (index: number) => {
        if (index < advancesCount) {
            return 'bg-green-900/20'; // Advances
        }
        if (eliminationCount > 0) {
            return 'bg-red-900/30 opacity-80'; // Eliminated
        }
        return 'bg-slate-800/20'; // Q3 - Final positions
    };

    return (
        <div className="bg-slate-500/10 p-4 rounded-lg flex flex-col">
            <h3 className="text-xl font-bold text-slate-200 mb-4 text-center">{title}</h3>
            {isLoading ? (
                <div className="flex-grow flex items-center justify-center text-slate-400">
                    <div className="text-center">
                        <SpinnerIcon className="w-8 h-8 mx-auto mb-2" />
                        <p>{t('setting_times')}</p>
                    </div>
                </div>
            ) : (
                <div className="space-y-1 overflow-y-auto">
                    {results?.map((res, index) => {
                        const driver = drivers.find(d => d.id === res.driverId);
                        const team = teams.find(t => t.id === driver?.teamId);
                        if (!driver || !team) return null;

                        return (
                            <div 
                                key={res.driverId} 
                                className={`flex items-center p-1.5 rounded-md text-sm ${getRowClass(index)} border-l-4`}
                                style={{ borderColor: team.primaryColor }}
                            >
                                <div className="w-8 text-center font-bold">{res.position}</div>
                                <div className="w-10 pl-1">
                                    <ImageWithFallback 
                                        src={driver.photoUrl} 
                                        alt={driver.name} 
                                        primaryColor={team.primaryColor} 
                                        accentColor={team.accentColor} 
                                        initials={getInitials(driver.name)} 
                                        type="driver" 
                                        className="w-7 h-7 rounded-full object-cover" 
                                    />
                                </div>
                                <div className="flex-grow font-semibold truncate" title={driver.name}>
                                    {driver.name}
                                </div>
                                <div className="font-mono">{res.lapTime}</div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

const QualifyingInProgressScreen: React.FC<QualifyingInProgressScreenProps> = ({ qualifyingData, drivers, teams }) => {
    const { t } = useI18n();

    return (
        <div className="bg-[#1e1e2b]/80 border border-slate-700 rounded-2xl backdrop-blur-sm shadow-lg p-6">
            <div className="flex items-center justify-center gap-3 mb-6 text-2xl font-black uppercase text-slate-200">
                <FlagIcon className="w-6 h-6"/>
                <h2>{t('qualifying_title')}</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 min-h-[400px]">
                <SessionColumn title={t('q1_title')} results={qualifyingData?.q1} drivers={drivers} teams={teams} totalInSession={20} eliminationCount={5} isLoading={!qualifyingData?.q1} />
                <SessionColumn title={t('q2_title')} results={qualifyingData?.q2} drivers={drivers} teams={teams} totalInSession={15} eliminationCount={5} isLoading={!qualifyingData?.q2} />
                <SessionColumn title={t('q3_title')} results={qualifyingData?.q3} drivers={drivers} teams={teams} totalInSession={10} eliminationCount={0} isLoading={!qualifyingData?.q3} />
            </div>
        </div>
    );
};

export default QualifyingInProgressScreen;