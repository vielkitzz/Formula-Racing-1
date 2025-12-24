
import React, { useState, useEffect } from 'react';
import { Race, Driver, Team, RaceState, SeasonSettings, Country } from '../types';
import { getCountryFlagUrl, formatTime, getInitials } from '../utils';
import TyreCompoundIcon from './TyreCompoundIcon';
import LiveIcon from './icons/LiveIcon';
import MicrophoneIcon from './icons/MicrophoneIcon';
import PauseIcon from './icons/PauseIcon';
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
            return <span className="text-slate-400">{t('commentary_waiting')}</span>;
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
                const hex = entity.color.replace('#', '');
                const r = parseInt(hex.substring(0, 2), 16);
                const g = parseInt(hex.substring(2, 4), 16);
                const b = parseInt(hex.substring(4, 6), 16);
                const brightness = (r * 299 + g * 587 + b * 114) / 1000;
                
                const style: React.CSSProperties = {
                    color: entity.color,
                    fontWeight: 'bold',
                    textShadow: brightness < 70 ? `0 0 8px ${entity.accent === '#000000' ? '#FFFFFF' : entity.accent}` : 'none',
                };
                return <span key={index} style={style}>{part}</span>;
            }
            return part;
        });

        return (
            <>
                <span className="text-xs text-slate-500 mr-2">{lapInfo}</span>
                <span>{renderedText}</span>
            </>
        );
    };

    const sortedDrivers = [...raceState.drivers].sort((a, b) => {
        if (a.status === 'DNF' && b.status !== 'DNF') return 1;
        if (a.status !== 'DNF' && b.status === 'DNF') return -1;
        if (a.status === 'DNF' && b.status === 'DNF') return 0;
        return a.position - b.position;
    });

    const remainingLaps = raceState.totalLaps - raceState.currentLap;
    const remainingLapsText = remainingLaps === 1
        ? t('remaining_laps_singular')
        : t('remaining_laps_plural', { count: remainingLaps });

    const driverToTrackId = trackedDriverId ?? raceState.drivers.find(d => d.position === 1)?.driverId;
    const driverToTrackState = driverToTrackId ? raceState.drivers.find(d => d.driverId === driverToTrackId) : null;
    const driverToTrack = driverToTrackId ? drivers.find(d => d.id === driverToTrackId) : null;
    const teamOfTracked = driverToTrack ? teams.find(t => t.id === driverToTrack.teamId) : null;

    return (
        <div className="space-y-4 animate-fade-in">
            <RaceFlagOverlay flagStatus={raceState.flag} isSafetyCarDeployed={!!raceState.isSafetyCarDeployed} />
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                {/* Left Panel: Standings */}
                <div className="lg:col-span-2 bg-slate-500/10 p-2 rounded-lg max-h-[80vh] overflow-y-auto">
                    {/* Header */}
                    <div className="sticky top-0 bg-[#1e1e2b]/80 backdrop-blur-sm z-10 grid grid-cols-12 gap-2 p-2 text-xs font-bold text-slate-400 uppercase">
                        <div className="col-span-1 text-center">{t('pos')}</div>
                        <div className="col-span-4">{t('driver')}</div>
                        <div className="col-span-1 text-center hidden sm:block">{t('pits')}</div>
                        <div className="col-span-2 text-right hidden sm:block">{t('lastLap')}</div>
                        <div className="col-span-2 text-right hidden sm:block">{t('gapAhead')}</div>
                        <div className="col-span-2 text-right">{t('gapLeader')}</div>
                    </div>
                    {/* Body */}
                    <div className="space-y-1 mt-1">
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
                                    className={`grid grid-cols-12 gap-2 items-center p-1.5 rounded-md text-sm cursor-pointer transition-colors duration-200 ${
                                        isDNF ? 'bg-red-900/40 opacity-70' : 
                                        isTracked ? 'bg-slate-700/80' : 
                                        isInPoints ? 'bg-green-900/20 hover:bg-green-900/40' :
                                        'bg-slate-800/30 hover:bg-slate-700/50'
                                    }`}
                                >
                                    <div className="col-span-1 text-center font-bold text-lg">{isDNF ? 'DNF' : ds.position}</div>
                                    <div className="col-span-5 sm:col-span-4 flex items-center gap-2 border-l-4" style={{borderColor: team.primaryColor}}>
                                        <ImageWithFallback src={driver.photoUrl} alt={driver.name} primaryColor={team.primaryColor} accentColor={team.accentColor} initials={getInitials(driver.name)} type="driver" className="w-8 h-8 rounded-full object-cover ml-2"/>
                                        <span className="font-semibold text-slate-200 truncate">{driver.name}</span>
                                        {ds.activeIncident && (
                                            <ExclamationTriangleIcon 
                                                className="w-4 h-4 text-yellow-400 flex-shrink-0" 
                                                title={t(`incident_${ds.activeIncident.type}`)} 
                                            />
                                        )}
                                        <TyreCompoundIcon compound={ds.currentTyres.compound} />
                                        {isDNF && <span className="text-xs text-red-300 italic">({t('retired')})</span>}
                                    </div>
                                    <div className="col-span-1 text-center font-mono hidden sm:block">{ds.pitStops}</div>
                                    <div className="col-span-2 text-right font-mono hidden sm:block">
                                        {isDNF ? '-' : ds.status === 'PITTING' ? <span className="font-bold text-blue-400 animate-pulse">{t('inPit')}</span> : formatTime(ds.lastLapTime)}
                                    </div>
                                    <div className="col-span-2 text-right font-mono text-slate-400 hidden sm:block">{isDNF ? '-' : ds.gapToAhead}</div>
                                    <div className="col-span-4 sm:col-span-2 text-right font-mono text-slate-300">{isDNF ? '-' : ds.gapToLeader}</div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Right Panel: Race Info & Commentary */}
                <div className="lg:col-span-1 bg-slate-500/10 p-4 rounded-lg space-y-4 flex flex-col max-h-[80vh]">
                    <div className="border-b border-slate-700 pb-4 text-center">
                        <p className="text-lg font-bold text-slate-200">{race.name}</p>
                        <div className="flex items-baseline justify-center gap-2 mt-2">
                            <span className="text-5xl font-black text-white tracking-tighter">{raceState.currentLap}</span>
                            <span className="text-2xl font-bold text-slate-400">/ {raceState.totalLaps} {t('laps')}</span>
                        </div>
                        {remainingLaps > 0 && (
                            <p className="text-sm text-yellow-300 mt-1 font-semibold">
                                {remainingLapsText}
                            </p>
                        )}
                        <LiveIcon className="h-6 w-auto mx-auto mt-2"/>
                    </div>

                    {driverToTrack && driverToTrackState && teamOfTracked && (
                        <div className="bg-[#15141f]/50 p-3 rounded-md">
                            <h4 className="font-bold text-slate-300 mb-3 uppercase text-sm">{t('driverTracker')}</h4>
                            <div className="flex items-center gap-3 mb-4">
                                <ImageWithFallback src={driverToTrack.photoUrl} alt={driverToTrack.name} primaryColor={teamOfTracked.primaryColor} accentColor={teamOfTracked.accentColor} initials={getInitials(driverToTrack.name)} type="driver" className="w-16 h-16 rounded-full object-cover border-2" style={{borderColor: teamOfTracked.primaryColor}}/>
                                <div>
                                    <p className="font-bold text-lg text-white">{driverToTrack.name}</p>
                                    <p className="text-sm text-slate-400">{teamOfTracked.name}</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4 text-sm mb-4">
                                <div className="text-center">
                                    <p className="text-xs uppercase text-slate-400">{t('pos')}</p>
                                    <p className="text-2xl font-bold">{driverToTrackState.status === 'DNF' ? 'DNF' : driverToTrackState.position}</p>
                                </div>
                                <div className="text-center">
                                    <p className="text-xs uppercase text-slate-400">{t('pits')}</p>
                                    <p className="text-2xl font-bold">{driverToTrackState.pitStops}</p>
                                </div>
                            </div>
                            
                            <div className="bg-slate-900/50 p-2 rounded-lg mb-4">
                                <p className="text-xs uppercase text-slate-400 text-center mb-2">{t('tyreInfo')}</p>
                                <div className="flex items-center justify-around">
                                    <TyreCompoundIcon compound={driverToTrackState.currentTyres.compound} size={32}/>
                                    <div>
                                        <p className="text-xs text-slate-400">{t('tyreAge')}</p>
                                        <p className="font-bold">{driverToTrackState.currentTyres.age} <span className="text-xs text-slate-400">{t('laps')}</span></p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-slate-400">{t('tyreWear')}</p>
                                        <p className="font-bold">{driverToTrackState.currentTyres.wear.toFixed(1)}%</p>
                                    </div>
                                </div>
                            </div>

                             <div className="bg-slate-900/50 p-2 rounded-lg">
                                <p className="text-xs uppercase text-slate-400 text-center mb-2">{t('timings')}</p>
                                <div className="space-y-1 text-xs">
                                    <div className="flex justify-between"><span>{t('lastLap')}:</span> <span className="font-mono">{formatTime(driverToTrackState.lastLapTime)}</span></div>
                                    <div className="flex justify-between"><span>{t('bestLap')}:</span> <span className="font-mono">{formatTime(driverToTrackState.bestLapTime)}</span></div>
                                    <div className="flex justify-between"><span>{t('gapLeader')}:</span> <span className="font-mono">{driverToTrackState.gapToLeader}</span></div>
                                    <div className="flex justify-between"><span>{t('gapAhead')}:</span> <span className="font-mono">{driverToTrackState.gapToAhead}</span></div>
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="bg-[#15141f]/50 p-3 rounded-md flex-grow overflow-y-auto">
                        <div className="flex items-center gap-2 mb-2">
                           <MicrophoneIcon className={`w-5 h-5 transition-transform duration-150 ${pulse ? 'scale-125 text-white' : 'text-slate-400'}`} />
                            <h4 className="font-bold text-slate-300">{t('liveCommentary')}</h4>
                        </div>
                        <p className="text-sm text-slate-300 leading-relaxed">
                            {colorizeCommentary(commentary)}
                        </p>
                    </div>
                     {isPaused && (
                        <div className="flex items-center justify-center gap-2 p-3 bg-yellow-400/20 border border-yellow-400/50 rounded-md text-yellow-200 font-bold">
                            <PauseIcon className="w-5 h-5"/>
                            <span>{t('paused')}</span>
                        </div>
                    )}
                </div>

            </div>
        </div>
    );
};

export default LiveRaceView;
