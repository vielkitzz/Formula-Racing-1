
// FIX: Import 'useMemo' from 'react' to resolve 'Cannot find name' errors.
import React, { useState, useMemo } from 'react';
import { RaceState, Driver, Team, RaceResult, SeasonSettings, Race, QualifyingResult, DriverStanding, Country } from '../types';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useI18n } from '../i18n';
import { SCORING_SYSTEMS } from '../constants';
import { getCountryByCode } from '../utils';
import CountryFlag from './CountryFlag';

type ChartType = 'positions' | 'lapTimes' | 'gap' | 'championshipPosition' | 'championshipPoints' | 'seasonOverview';

interface ChartsViewProps {
    raceHistory: RaceState[];
    drivers: Driver[];
    teams: Team[];
    allRaceResults: RaceResult[][];
    allQualifyingResults: QualifyingResult[][];
    settings: SeasonSettings;
    calendar: Race[];
    driverStandings: DriverStanding[];
    customCountries?: Country[];
}

const ChartsView: React.FC<ChartsViewProps> = ({ raceHistory, drivers, teams, allRaceResults, allQualifyingResults, settings, calendar, driverStandings, customCountries = [] }) => {
    const { t } = useI18n();
    const [activeChart, setActiveChart] = useState<ChartType>(allRaceResults.length > 0 ? 'seasonOverview' : 'positions');
    
    const positionData = useMemo(() => {
        if (raceHistory.length <= 1) return [];
        return raceHistory.map(state => {
            const lapData: { lap: number; [key: string]: number } = { lap: state.currentLap };
            state.drivers.forEach(driverState => {
                const driver = drivers.find(d => d.id === driverState.driverId);
                if (driver) {
                    lapData[driver.name] = driverState.position > 0 ? driverState.position : drivers.length + 1;
                }
            });
            return lapData;
        });
    }, [raceHistory, drivers]);

    const lapTimeData = useMemo(() => {
        if (raceHistory.length <= 1) return [];
        return raceHistory.slice(1).map(state => {
            const lapData: { lap: number; [key: string]: number | undefined } = { lap: state.currentLap };
            state.drivers.forEach(ds => {
                const driver = drivers.find(d => d.id === ds.driverId);
                if (driver) {
                    lapData[driver.name] = ds.status !== 'DNF' && ds.lastLapTime > 0 ? parseFloat(ds.lastLapTime.toFixed(3)) : undefined;
                }
            });
            return lapData;
        });
    }, [raceHistory, drivers]);

    const gapData = useMemo(() => {
        if (raceHistory.length <= 1) return [];
        return raceHistory.slice(1).map(state => {
            const lapData: { lap: number; [key:string]: number | undefined } = { lap: state.currentLap };
            const leader = state.drivers.find(d => d.position === 1);
            if (leader) {
                state.drivers.forEach(ds => {
                    const driver = drivers.find(d => d.id === ds.driverId);
                    if (driver) {
                        lapData[driver.name] = ds.status !== 'DNF' ? parseFloat((ds.totalTime - leader.totalTime).toFixed(3)) : undefined;
                    }
                });
            }
            return lapData;
        });
    }, [raceHistory, drivers]);

    const championshipPositionData = useMemo(() => {
        if (!allRaceResults || allRaceResults.length === 0 || !settings) return [];
        
        let historicalStandings: { race: number; [key: string]: number }[] = [];
        let currentStandings = drivers.map(d => ({ driverId: d.id, points: 0 }));

        allRaceResults.forEach((raceResult, index) => {
            raceResult.forEach(result => {
                const standing = currentStandings.find(s => s.driverId === result.driverId);
                if (standing) standing.points += result.points;
            });
            const sortedStandings = [...currentStandings].sort((a, b) => b.points - a.points);
            const raceData: { race: number; [key: string]: number } = { race: index + 1 };
            sortedStandings.forEach((standing, posIndex) => {
                const driver = drivers.find(d => d.id === standing.driverId);
                if (driver) raceData[driver.name] = posIndex + 1;
            });
            historicalStandings.push(raceData);
        });
        return historicalStandings;
    }, [allRaceResults, drivers, settings]);

    const championshipPointsData = useMemo(() => {
        if (!allRaceResults || allRaceResults.length === 0) return [];
        let historicalPoints: { race: number; [key: string]: number }[] = [];
        let currentPoints = drivers.reduce((acc, d) => ({...acc, [d.name]: 0}), {} as {[key: string]: number});
        
        // Add initial state (0 points before race 1)
        historicalPoints.push({ race: 0, ...currentPoints });

        allRaceResults.forEach((raceResult, index) => {
            raceResult.forEach(result => {
                const driver = drivers.find(d => d.id === result.driverId);
                if (driver) currentPoints[driver.name] += result.points;
            });
            historicalPoints.push({ race: index + 1, ...currentPoints });
        });
        return historicalPoints;
    }, [allRaceResults, drivers]);


    const TabButton: React.FC<{ chartType: ChartType; label: string }> = ({ chartType, label }) => (
        <button onClick={() => setActiveChart(chartType)} className={`px-4 py-2 font-bold uppercase text-sm ${activeChart === chartType ? 'border-b-2 border-[#00e051] text-white' : 'text-slate-400'}`}>{label}</button>
    );
    
    const SeasonOverview = () => {
        const scoringSystem = SCORING_SYSTEMS.find(s => s.id === settings.scoringSystemId);
        const pointsPositions = scoringSystem ? scoringSystem.points.length : 10;
        
        const getCellClass = (result: RaceResult | undefined) => {
            if (!result) return 'bg-slate-700/50';
            if (result.position === 0) return 'bg-purple-800 text-purple-200';
            const pos = result.position;
            if (pos === 1) return 'bg-yellow-400 text-black';
            if (pos === 2) return 'bg-slate-400 text-black';
            if (pos === 3) return 'bg-orange-500 text-black';
            if (pos <= pointsPositions) return 'bg-green-700 text-green-100';
            return 'bg-blue-900 text-blue-200';
        };

        const getResultText = (result: RaceResult | undefined) => {
            if (!result) return '-';
            if (result.dnfReason) return 'Ret';
            if (result.position === 0) return 'NC';
            return result.position;
        };
        
        const races = calendar.slice(0, allRaceResults.length);

        return (
            <div className="bg-slate-500/10 rounded-lg p-2 sm:p-4 overflow-x-auto">
                <table className="w-full border-collapse min-w-[800px]">
                    <thead>
                        <tr className="border-b-2 border-slate-600">
                            <th className="p-2 text-left text-sm font-semibold text-slate-400">Pos.</th>
                            <th className="p-2 text-left text-sm font-semibold text-slate-400 min-w-[150px]">Driver</th>
                            {races.map((race, index) => (
                                <th key={index} className="p-1 sm:p-2 text-center text-sm font-semibold text-slate-400" title={race.name}>
                                    <div className="flex justify-center">
                                        <CountryFlag countryCode={race.countryCode} customCountries={customCountries} className="w-6 mb-1 rounded-sm" />
                                    </div>
                                    {race.countryCode}
                                </th>
                            ))}
                            <th className="p-2 text-right text-sm font-semibold text-slate-400">Points</th>
                        </tr>
                    </thead>
                    <tbody>
                        {driverStandings.map((standing, index) => {
                            const driver = drivers.find(d => d.id === standing.driverId);
                            if (!driver) return null;
                            const country = getCountryByCode(driver.nationality);

                            return (
                            <tr key={driver.id} className="border-b border-slate-800 last:border-0">
                                <td className="p-2 font-bold text-center">{index + 1}</td>
                                <td className="p-2 font-semibold whitespace-nowrap">
                                    <div className="flex items-center gap-2">
                                        <CountryFlag 
                                            countryCode={driver.nationality}
                                            customCountries={customCountries}
                                            alt={country?.name} 
                                            title={country?.name}
                                            className="w-5 h-auto rounded-sm"
                                        />
                                        <span>{driver.name}</span>
                                    </div>
                                </td>
                                {races.map((_, raceIndex) => {
                                    const result = allRaceResults[raceIndex]?.find(r => r.driverId === driver.id);
                                    const quali = allQualifyingResults[raceIndex]?.find(q => q.driverId === driver.id);
                                    const isPole = quali?.position === 1;
                                    const hasFastestLap = result?.fastestLap;

                                    return (
                                        <td key={raceIndex} className={`p-1 sm:p-2 font-black text-center text-sm ${getCellClass(result)}`}>
                                            <div className="flex items-center justify-center gap-0.5">
                                                <span>{getResultText(result)}</span>
                                                <div className="flex flex-col text-[8px] leading-tight font-bold">
                                                    {isPole && <span className="text-purple-400" title="Pole Position">P</span>}
                                                    {hasFastestLap && <span className="text-pink-400" title="Fastest Lap">F</span>}
                                                </div>
                                            </div>
                                        </td>
                                    );
                                })}
                                <td className="p-2 font-bold text-right text-lg">{standing.points}</td>
                            </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        );
    };

    const renderChart = () => {
        let data, yAxisLabel, yAxisReversed, yDomain: [any, any] | undefined, tooltipFormatter, xAxisKey, xAxisLabel;

        switch (activeChart) {
            case 'seasonOverview':
                return <SeasonOverview />;
            case 'lapTimes':
                data = lapTimeData; yAxisLabel = t('lapTime_seconds'); yAxisReversed = false; yDomain = ['dataMin - 1', 'dataMax + 1']; tooltipFormatter = (value: number) => `${value.toFixed(3)}s`; xAxisKey = 'lap'; xAxisLabel = t('lap');
                break;
            case 'gap':
                data = gapData; yAxisLabel = t('gap_seconds'); yAxisReversed = false; yDomain = [0, 'dataMax + 5']; tooltipFormatter = (value: number) => `+${value.toFixed(3)}s`; xAxisKey = 'lap'; xAxisLabel = t('lap');
                break;
            case 'championshipPosition':
                data = championshipPositionData; yAxisLabel = t('championshipPosition'); yAxisReversed = true; yDomain = [1, drivers.length]; tooltipFormatter = (value: number) => `P${value}`; xAxisKey = 'race'; xAxisLabel = t('race');
                break;
            case 'championshipPoints':
                data = championshipPointsData; yAxisLabel = t('points'); yAxisReversed = false; yDomain = [0, 'dataMax + 10']; tooltipFormatter = (value: number) => `${value} ${t('points')}`; xAxisKey = 'race'; xAxisLabel = t('race');
                break;
            case 'positions':
            default:
                data = positionData; yAxisLabel = t('position'); yAxisReversed = true; yDomain = [1, drivers.length]; tooltipFormatter = (value: number) => value > drivers.length ? 'DNF' : `P${value}`; xAxisKey = 'lap'; xAxisLabel = t('lap');
                break;
        }

        if (!data || data.length === 0) {
            return (
                <div className="text-center py-10 flex flex-col items-center justify-center bg-slate-500/10 rounded-lg min-h-[400px]">
                    <p className="text-slate-400 text-lg">{t('charts_noData')}</p>
                    <p className="text-slate-500">{t('charts_noDataHint')}</p>
                </div>
            );
        }

        const CustomTooltip = ({ active, payload, label }: any) => {
            if (active && payload && payload.length) {
                return (
                    <div className="p-2 bg-[#15141f] border border-slate-700 rounded-md shadow-lg">
                        <p className="font-bold text-slate-200">{`${xAxisLabel}: ${label}`}</p>
                        <ul className="text-sm">
                            {payload.sort((a: any, b: any) => yAxisReversed ? a.value - b.value : b.value - a.value).map((p: any) => (
                                <li key={p.name} style={{ color: p.color }}>
                                    {`${p.name}: ${tooltipFormatter(p.value)}`}
                                </li>
                            ))}
                        </ul>
                    </div>
                );
            }
            return null;
        };

        return (
            <div className="bg-slate-500/10 rounded-lg p-4 h-[60vh] min-h-[500px]">
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={data} margin={{ top: 5, right: 20, left: 20, bottom: 20 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                        <XAxis dataKey={xAxisKey} stroke="#94a3b8" label={{ value: xAxisLabel, position: 'insideBottom', offset: -10, fill: '#94a3b8' }} />
                        <YAxis stroke="#94a3b8" reversed={yAxisReversed} domain={yDomain} tickCount={yAxisReversed ? Math.min(drivers.length, 20) : undefined} interval={0} allowDecimals={false} label={{ value: yAxisLabel, angle: -90, position: 'insideLeft', fill: '#94a3b8' }} />
                        <Tooltip content={<CustomTooltip />} />
                        <Legend wrapperStyle={{fontSize: '12px', bottom: 0 }} />
                        {drivers.map(driver => {
                            const team = teams.find(t => t.id === driver.teamId);
                            return (<Line key={driver.id} type="monotone" dataKey={driver.name} stroke={team?.primaryColor || '#ffffff'} strokeWidth={2} dot={false} activeDot={{ r: 4 }} connectNulls={true} />);
                        })}
                    </LineChart>
                </ResponsiveContainer>
            </div>
        );
    };

    return (
        <div>
            <div className="flex border-b border-slate-700 mb-4 overflow-x-auto">
                {allRaceResults.length > 0 && <TabButton chartType="seasonOverview" label={t('charts_seasonOverview')} />}
                <TabButton chartType="positions" label={t('charts_positions')} />
                <TabButton chartType="lapTimes" label={t('charts_lapTimes')} />
                <TabButton chartType="gap" label={t('charts_gapToLeader')} />
                {allRaceResults.length > 0 && <TabButton chartType="championshipPosition" label={t('charts_championshipPosition')} />}
                {allRaceResults.length > 0 && <TabButton chartType="championshipPoints" label={t('charts_championshipPoints')} />}
            </div>
            {renderChart()}
        </div>
    );
};

export default ChartsView;
