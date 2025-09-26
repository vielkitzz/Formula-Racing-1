import React, { useState } from 'react';
import { SeasonHistory, Driver, Team, Race, RaceResult, QualifyingResult, SeasonSettings } from '../types';
import { useI18n } from '../i18n';
import TrophyIcon from './icons/TrophyIcon';
import ImageWithFallback from './ImageWithFallback';
import { getInitials, getCountryFlagUrl } from '../utils';
import RaceResultModal from './RaceResultModal';
import StandingsTable from './StandingsTable';

interface HistoryScreenProps {
    history: SeasonHistory[];
}

const HistoryScreen: React.FC<HistoryScreenProps> = ({ history }) => {
    const { t } = useI18n();
    const [selectedYear, setSelectedYear] = useState<number | null>(history.length > 0 ? history[0].year : null);
    const [modalData, setModalData] = useState<{ race: Race, results: RaceResult[], quali: QualifyingResult[] } | null>(null);
    const [activeTab, setActiveTab] = useState<'standings' | 'calendar'>('standings');

    const selectedSeason = history.find(h => h.year === selectedYear);

    const driverChampion = selectedSeason ? selectedSeason.drivers.find(d => d.id === selectedSeason.driverChampionId) : null;
    const driverChampionTeam = driverChampion ? selectedSeason.teams.find(t => t.id === driverChampion.teamId) : null;
    const constructorChampion = selectedSeason ? selectedSeason.teams.find(t => t.id === selectedSeason.constructorChampionId) : null;

    const handleViewResults = (raceIndex: number) => {
        if (!selectedSeason) return;
        setModalData({
            race: selectedSeason.calendar[raceIndex],
            results: selectedSeason.allRaceResults[raceIndex],
            quali: selectedSeason.allQualifyingResults[raceIndex],
        });
    };
    
    const handleYearChange = (year: number) => {
        setSelectedYear(year);
        setActiveTab('standings');
    }
    
    // FIX: Added missing `mode` and `playerTeamId` properties to the fallback settings object.
    const fallbackSettings: SeasonSettings = { startYear: selectedSeason?.year || 2024, scoringSystemId: 1, mode: 'spectator', playerTeamId: null };

    return (
        <>
            <RaceResultModal
                isOpen={!!modalData}
                onClose={() => setModalData(null)}
                race={modalData?.race!}
                raceResults={modalData?.results!}
                qualifyingResults={modalData?.quali!}
                drivers={selectedSeason?.drivers || []}
                teams={selectedSeason?.teams || []}
                settings={selectedSeason?.settings || fallbackSettings}
            />
             {history.length === 0 ? (
                    <p className="text-center text-slate-400 py-20">{t('history_noHistory')}</p>
                ) : (
                    <div>
                        <div className="mb-6">
                            <label htmlFor="season-select" className="block text-sm font-medium text-slate-400 mb-2">{t('history_selectSeason')}</label>
                            <select
                                id="season-select"
                                value={selectedYear || ''}
                                onChange={(e) => handleYearChange(parseInt(e.target.value, 10))}
                                className="w-full sm:w-auto px-4 py-2 bg-[#15141f] border border-slate-700 rounded-md focus:outline-none focus:ring-2 focus:ring-[#00e051] focus:border-[#00e051]"
                            >
                                {history.map(s => <option key={s.year} value={s.year} className="bg-[#1e1e2b]">{s.year}</option>)}
                            </select>
                        </div>
                        
                        {selectedSeason && driverChampion && constructorChampion && (
                            <div>
                                <h3 className="text-2xl font-bold text-slate-300 mb-4">{t('history_seasonSummary', { year: selectedSeason.year })}</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                                    <div className="bg-slate-500/10 p-6 rounded-xl border border-slate-700 flex flex-col items-center text-center">
                                        <TrophyIcon className="w-12 h-12 text-yellow-400 mb-2"/>
                                        <h4 className="text-xl font-bold text-slate-300 mb-4">{t('driversChampion')}</h4>
                                        <ImageWithFallback src={driverChampion.photoUrl} alt={driverChampion.name} primaryColor={driverChampionTeam?.primaryColor || '#FFFFFF'} accentColor={driverChampionTeam?.accentColor || '#FFFFFF'} initials={getInitials(driverChampion.name)} type="driver" className="w-24 h-24 rounded-full object-cover mb-2 border-2 border-yellow-400"/>
                                        <p className="font-bold text-lg text-white">{driverChampion.name}</p>
                                        <p className="text-sm text-slate-400">{driverChampionTeam?.name}</p>
                                    </div>
                                    <div className="bg-slate-500/10 p-6 rounded-xl border border-slate-700 flex flex-col items-center text-center">
                                        <TrophyIcon className="w-12 h-12 text-yellow-400 mb-2"/>
                                        <h4 className="text-xl font-bold text-slate-300 mb-4">{t('constructorsChampion')}</h4>
                                        <ImageWithFallback src={constructorChampion.logoUrl} alt={constructorChampion.name} primaryColor={constructorChampion.primaryColor} accentColor={constructorChampion.accentColor} initials={getInitials(constructorChampion.name)} type="team" className="w-24 h-24 object-contain mb-2 p-2"/>
                                        <p className="font-bold text-lg" style={{ color: constructorChampion.primaryColor }}>{constructorChampion.name}</p>
                                    </div>
                                </div>

                                <div className="flex border-b border-slate-700 mb-4">
                                    <button onClick={() => setActiveTab('standings')} className={`px-4 py-2 font-bold uppercase text-sm ${activeTab === 'standings' ? 'border-b-2 border-[#00e051] text-white' : 'text-slate-400'}`}>{t('standings')}</button>
                                    <button onClick={() => setActiveTab('calendar')} className={`px-4 py-2 font-bold uppercase text-sm ${activeTab === 'calendar' ? 'border-b-2 border-[#00e051] text-white' : 'text-slate-400'}`}>{t('history_raceCalendar')}</button>
                                </div>
                                {activeTab === 'standings' && (
                                     <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-fade-in">
                                        <StandingsTable title={t('driversChampionship')} standings={selectedSeason.driverStandings} type="driver" seasonOver={true} drivers={selectedSeason.drivers} teams={selectedSeason.teams} onRowClick={() => {}} />
                                        <StandingsTable title={t('constructorsChampionship')} standings={selectedSeason.constructorStandings} type="constructor" seasonOver={true} drivers={selectedSeason.drivers} teams={selectedSeason.teams} onRowClick={() => {}} />
                                    </div>
                                )}
                                {activeTab === 'calendar' && (
                                    <div className="space-y-3 animate-fade-in">
                                        {selectedSeason.calendar.map((race, index) => {
                                            const raceResults = selectedSeason.allRaceResults[index];
                                            const podium = [1, 2, 3]
                                                .map(pos => {
                                                    const result = raceResults.find(r => r.position === pos);
                                                    if (!result) return null;
                                                    const driver = selectedSeason.drivers.find(d => d.id === result.driverId);
                                                    if (!driver) return null;
                                                    const team = selectedSeason.teams.find(t => t.id === driver.teamId);
                                                    return { ...result, driver, team };
                                                })
                                                .filter(Boolean) as ({ driver: Driver, team: Team } & RaceResult)[];

                                            return (
                                                <div key={index} className="bg-slate-500/10 p-4 rounded-lg">
                                                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
                                                        <p className="font-semibold text-slate-200 flex items-center gap-2 mb-2 sm:mb-0">
                                                            <img src={getCountryFlagUrl(race.countryCode)} alt={race.country} className="w-6 h-auto rounded-sm" />
                                                            <span>{index + 1}. {race.name}</span>
                                                        </p>
                                                        <button onClick={() => handleViewResults(index)} className="px-4 py-1 bg-[#00e051] text-black font-bold text-sm rounded-md hover:bg-opacity-90 self-end sm:self-center">{t('history_viewResults')}</button>
                                                    </div>
                                                    {podium.length > 0 && (
                                                        <div className="mt-3 pt-3 border-t border-slate-700 flex flex-col sm:flex-row items-start sm:items-center gap-x-6 gap-y-2">
                                                            {podium.map(p => (
                                                                <div key={p.driver.id} className="flex items-center gap-2 text-sm">
                                                                    <span className={`font-black w-6 text-center ${p.position === 1 ? 'text-yellow-400' : 'text-slate-300'}`}>P{p.position}</span>
                                                                    <ImageWithFallback src={p.driver.photoUrl} alt={p.driver.name} primaryColor={p.team.primaryColor} accentColor={p.team.accentColor} initials={getInitials(p.driver.name)} type="driver" className="w-8 h-8 rounded-full object-cover" />
                                                                    <span className="text-slate-200 font-semibold">{p.driver.name}</span>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                )}
        </>
    );
};

export default HistoryScreen;