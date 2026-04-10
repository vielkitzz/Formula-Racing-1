
import React, { useState, useEffect } from 'react';
import { Race, Driver, Team, RaceState, SeasonSettings, Country } from '../types';
import { formatTime, getInitials } from '../utils';
import TyreCompoundIcon from './TyreCompoundIcon';
import LiveIcon from './icons/LiveIcon';
import MicrophoneIcon from './icons/MicrophoneIcon';
import RaceFlagOverlay from './RaceFlagOverlay';
import { useI18n } from '../i18n';
import ImageWithFallback from './ImageWithFallback';
import { SCORING_SYSTEMS } from '../constants';
import ExclamationTriangleIcon from './icons/ExclamationTriangleIcon';

interface LiveRaceViewProps {
    race: Race;
    raceState: RaceState;
    drivers: Driver[];
    teams: Team[];
    commentary: string;
    isPaused: boolean;
    settings: SeasonSettings;
    customCountries?: Country[];
}

const LiveRaceView: React.FC<LiveRaceViewProps> = ({ race, raceState, drivers, teams, commentary, isPaused, settings, customCountries = [] }) => {
    const { t } = useI18n();
    const [pulse, setPulse] = useState(false);
    const [trackedDriverId, setTrackedDriverId] = useState<number | null>(null);

    const scoringSystem = SCORING_SYSTEMS.find(s => s.id === settings.scoringSystemId);
    const pointsPositions = scoringSystem ? scoringSystem.points.length : 10;

    useEffect(() => {
        if (commentary) {
            setPulse(true);
            const timer = setTimeout(() => setPulse(false), 750);
            return () => clearTimeout(timer);
        }
    }, [commentary]);
    
    const colorizeCommentary = (comment: string): React.ReactNode => {
        if (!comment) {
            return <span className="text-slate-500 uppercase text-[10px] font-bold tracking-widest">{t('commentary_waiting')}</span>;
        }

        const lapInfoMatch = comment.match(/^(\[.*?\])/);
        const lapInfo = lapInfoMatch ? lapInfoMatch[1] : '';
        const commentText = comment.replace(lapInfo, '').trim();

        const entities = [
            ...drivers.map(d => {
                const team = teams.find(t => t.id === d.teamId);
                return { name: d.name, color: team?.primaryColor || '#FFFFFF', accent: team?.accentColor || '#FFFFFF' };
            }),
            ...teams.map(t => ({ name: t.name, color: t.primaryColor, accent: t.accentColor }))
        ];

        entities.sort((a, b) => b.name.length - a.name.length);
        const regex = new RegExp(`(${entities.map(e => e.name.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')).join('|')})`, 'g');
        const parts = commentText.split(regex);

        const renderedText = parts.map((part, index) => {
            const entity = entities.find(e => e.name === part);
            if (entity) {
                return <span key={index} className="font-black" style={{ color: entity.color }}>{part}</span>;
            }
            return part;
        });

        return (
            <div className="flex flex-col gap-1">
                <span className="text-[10px] text-slate-500 font-mono-racing font-bold">{lapInfo}</span>
                <span className="text-sm font-medium leading-relaxed text-slate-200">{renderedText}</span>
            </div>
        );
    };

    const sortedDrivers = [...raceState.drivers].sort((a, b) => {
        if (a.status === 'DNF' && b.status !== 'DNF') return 1;
        if (a.status !== 'DNF' && b.status === 'DNF') return -1;
        if (a.status === 'DNF' && b.status === 'DNF') return 0;
        return a.position - b.position;
    });

    const remainingLaps = raceState.totalLaps - raceState.currentLap;
    const driverToTrackId = trackedDriverId ?? raceState.drivers.find(d => d.position === 1)?.driverId;
    const driverToTrackState = driverToTrackId ? raceState.drivers.find(d => d.driverId === driverToTrackId) : null;
    const driverToTrack = driverToTrackId ? drivers.find(d => d.id === driverToTrackId) : null;
    const teamOfTracked = driverToTrack ? teams.find(t => t.id === driverToTrack.teamId) : null;

    return (
        <div className="h-full flex flex-col lg:flex-row gap-4 animate-fade-in relative overflow-hidden font-racing">
            <RaceFlagOverlay flagStatus={raceState.flag} isSafetyCarDeployed={!!raceState.isSafetyCarDeployed} />
            
            {/* STANDINGS LIST */}
            <div className="flex-1 flex flex-col glass rounded-xl overflow-hidden shadow-2xl carbon-pattern">
                <div className="bg-black/60 p-3 text-[10px] font-black text-slate-500 uppercase grid grid-cols-12 gap-2 border-b border-white/5 tracking-wider">
                    <div className="col-span-1 text-center">POS</div>
                    <div className="col-span-5 sm:col-span-4">DRIVER</div>
                    <div className="col-span-1 text-center hidden sm:block">PIT</div>
                    <div className="col-span-2 text-right hidden sm:block">LAST</div>
                    <div className="col-span-2 text-right hidden sm:block">GAP</div>
                    <div className="col-span-3 sm:col-span-2 text-right">LDR</div>
                </div>
                <div className="flex-1 overflow-y-auto p-1.5 space-y-1">
                    {sortedDrivers.map(ds => {
                        const driver = drivers.find(d => d.id === ds.driverId)!;
                        const team = teams.find(t => t.id === driver.teamId)!;
                        const isDNF = ds.status === 'DNF';
                        const isTracked = ds.driverId === driverToTrackId;
                        const isInPoints = !isDNF && ds.position > 0 && ds.position <= pointsPositions;

                        return (
                            <div 
                                key={driver.id} 
                                onClick={() => setTrackedDriverId(ds.driverId)}
                                className={`grid grid-cols-12 gap-2 items-center p-2.5 rounded-lg text-xs cursor-pointer transition-all duration-300 border ${
                                    isDNF ? 'bg-red-950/20 border-red-900/30 opacity-40 grayscale' : 
                                    isTracked ? 'bg-white/10 border-white/20 shadow-lg scale-[1.01]' : 
                                    isInPoints ? 'bg-white/5 border-white/5 hover:bg-white/10' :
                                    'bg-black/20 border-transparent hover:bg-white/5'
                                }`}
                            >
                                <div className={`col-span-1 text-center font-black text-sm italic ${isDNF ? 'text-red-500' : isTracked ? 'text-white' : 'text-slate-400'}`}>
                                    {isDNF ? 'DNF' : ds.position}
                                </div>
                                <div className="col-span-5 sm:col-span-4 flex items-center gap-2 border-l-[3px] pl-2" style={{borderColor: team.primaryColor}}>
                                    <ImageWithFallback
                                        src={driver.photoUrl}
                                        alt={driver.name}
                                        primaryColor={team.primaryColor}
                                        accentColor={team.accentColor}
                                        initials={getInitials(driver.name)}
                                        type="driver"
                                        className="w-8 h-8 rounded-full object-cover flex-shrink-0"
                                    />
                                    <div className="flex flex-col min-w-0 ml-1">
                                        <span className={`font-black uppercase truncate tracking-tight text-[11px] ${isTracked ? 'text-white' : 'text-slate-200'}`}>{driver.name}</span>
                                        <div className="flex items-center gap-2 mt-0.5">
                                            <TyreCompoundIcon compound={ds.currentTyres.compound} size={11} />
                                            {ds.activeIncident && <ExclamationTriangleIcon className="w-3 h-3 text-yellow-400 animate-pulse" />}
                                        </div>
                                    </div>
                                </div>
                                <div className="col-span-1 text-center font-mono-racing font-bold text-slate-500 hidden sm:block">{ds.pitStops}</div>
                                <div className="col-span-2 text-right font-mono-racing text-[10px] hidden sm:block">
                                    {isDNF ? '---' : ds.status === 'PITTING' ? <span className="text-[#00ff85] animate-pulse">BOX</span> : formatTime(ds.lastLapTime)}
                                </div>
                                <div className="col-span-2 text-right font-mono-racing text-[10px] text-slate-500 hidden sm:block">{isDNF ? '---' : ds.gapToAhead}</div>
                                <div className="col-span-3 sm:col-span-2 text-right font-mono-racing font-black text-slate-200">{isDNF ? '---' : ds.gapToLeader}</div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* BROADCAST PANEL */}
            <div className="lg:w-[380px] flex flex-col gap-4 flex-shrink-0 h-full overflow-hidden">
                {/* RACE OVERVIEW */}
                <div className="glass p-6 rounded-xl relative overflow-hidden flex-shrink-0 group">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <LiveIcon className="h-12 w-auto" />
                    </div>
                    <div className="flex items-center justify-between mb-4">
                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">{race.name}</p>
                        {isPaused && <span className="text-[10px] bg-yellow-500 text-black px-2 py-0.5 rounded font-black uppercase">Paused</span>}
                    </div>
                    <div className="flex items-end gap-3 mb-4">
                        <span className="text-7xl font-black text-white tracking-tighter leading-none">{raceState.currentLap}</span>
                        <div className="flex flex-col">
                            <span className="text-xl font-bold text-slate-500 mb-1 leading-none">/ {raceState.totalLaps}</span>
                            <span className="text-[10px] font-black text-red-600 uppercase tracking-widest">Lap</span>
                        </div>
                    </div>
                    {remainingLaps > 0 && (
                        <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                            <div className="h-full bg-red-600 transition-all duration-1000 ease-linear" style={{ width: `${(raceState.currentLap / raceState.totalLaps) * 100}%` }}></div>
                        </div>
                    )}
                </div>

                {/* TRACKED DRIVER DATA */}
                {driverToTrack && driverToTrackState && teamOfTracked && (
                    <div className="glass rounded-xl overflow-hidden flex-shrink-0 shadow-2xl">
                        <div className="px-4 py-3 bg-white/5 border-b border-white/5 flex items-center justify-between">
                            <h4 className="font-black text-[10px] uppercase tracking-widest text-slate-400">Telemetry Feed</h4>
                            <div className="h-1.5 w-1.5 rounded-full bg-[#00ff85] shadow-[0_0_10px_#00ff85] animate-pulse"></div>
                        </div>
                        <div className="p-5">
                            <div className="flex items-center gap-5 mb-6">
                                <ImageWithFallback 
                                    src={driverToTrack.photoUrl} 
                                    alt={driverToTrack.name} 
                                    primaryColor={teamOfTracked.primaryColor} 
                                    accentColor={teamOfTracked.accentColor} 
                                    initials={getInitials(driverToTrack.name)} 
                                    type="driver" 
                                    className="w-16 h-16 rounded-lg object-cover bg-slate-800 border-b-4" 
                                    style={{borderBottomColor: teamOfTracked.primaryColor}}
                                />
                                <div className="flex flex-col min-w-0">
                                    <p className="font-black text-2xl text-white leading-tight uppercase italic">{driverToTrack.name}</p>
                                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">{teamOfTracked.name}</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-3 gap-3 mb-6">
                                <div className="bg-black/30 p-3 rounded-lg border border-white/5 text-center">
                                    <p className="text-[9px] font-black uppercase text-slate-500 mb-1 tracking-widest">Position</p>
                                    <p className="text-2xl font-black text-white italic">{driverToTrackState.status === 'DNF' ? 'RET' : `P${driverToTrackState.position}`}</p>
                                </div>
                                <div className="bg-black/30 p-3 rounded-lg border border-white/5 text-center">
                                    <p className="text-[9px] font-black uppercase text-slate-500 mb-1 tracking-widest">Tyre</p>
                                    <div className="flex justify-center"><TyreCompoundIcon compound={driverToTrackState.currentTyres.compound} size={24}/></div>
                                </div>
                                <div className="bg-black/30 p-3 rounded-lg border border-white/5 text-center">
                                    <p className="text-[9px] font-black uppercase text-slate-500 mb-1 tracking-widest">Wear</p>
                                    <p className={`text-2xl font-black italic ${driverToTrackState.currentTyres.wear > 75 ? 'text-red-500' : 'text-white'}`}>{driverToTrackState.currentTyres.wear.toFixed(0)}%</p>
                                </div>
                            </div>

                             <div className="space-y-2 p-4 bg-black/40 rounded-lg font-mono-racing text-[11px] border border-white/5">
                                <div className="flex justify-between">
                                    <span className="text-slate-500 font-bold uppercase tracking-tighter">Last Lap</span>
                                    <span className="text-white font-black">{formatTime(driverToTrackState.lastLapTime)}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-slate-500 font-bold uppercase tracking-tighter">Best Lap</span>
                                    <span className="text-[#00ff85] font-black">{formatTime(driverToTrackState.bestLapTime)}</span>
                                </div>
                                <div className="flex justify-between pt-2 border-t border-white/5">
                                    <span className="text-slate-500 font-bold uppercase tracking-tighter">Interval</span>
                                    <span className="text-slate-200 font-black">{driverToTrackState.gapToLeader}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* COMMENTARY FEED */}
                <div className="flex-1 glass rounded-xl overflow-hidden flex flex-col min-h-0 shadow-2xl">
                    <div className="px-4 py-3 bg-black/60 border-b border-white/5 flex items-center gap-2">
                       <MicrophoneIcon className={`w-3.5 h-3.5 transition-all duration-300 ${pulse ? 'scale-125 text-red-500' : 'text-slate-500'}`} />
                        <h4 className="font-black text-[10px] uppercase tracking-[0.25em] text-slate-300">Live Commentary</h4>
                    </div>
                    <div className="flex-1 overflow-y-auto p-5 flex flex-col justify-end">
                        <div className="animate-fade-in border-l-2 border-red-600 pl-4 py-1">
                            {colorizeCommentary(commentary)}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LiveRaceView;
