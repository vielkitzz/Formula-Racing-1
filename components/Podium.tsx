import React, { useState, useEffect } from 'react';
import { RaceResult, Driver, Team } from '../types';
import ArrowRightIcon from './icons/ArrowRightIcon';
import { useI18n } from '../i18n';
import ImageWithFallback from './ImageWithFallback';
import { getInitials } from '../utils';

interface PodiumProps {
    results: RaceResult[]; // Top 3 results
    drivers: Driver[];
    teams: Team[];
    raceName: string;
    onContinue: () => void;
}

const Podium: React.FC<PodiumProps> = ({ results, drivers, teams, raceName, onContinue }) => {
    const { t } = useI18n();
    const [animated, setAnimated] = useState([false, false, false]);
    const [confettiList, setConfettiList] = useState<number[]>([]);

    useEffect(() => {
        const timers = [
            setTimeout(() => setAnimated(prev => { const next = [...prev]; next[2] = true; return next; }), 300),
            setTimeout(() => setAnimated(prev => { const next = [...prev]; next[1] = true; return next; }), 800),
            setTimeout(() => setAnimated(prev => { const next = [...prev]; next[0] = true; return next; }), 1300),
        ];
        return () => timers.forEach(clearTimeout);
    }, []);

    useEffect(() => {
        const interval = setInterval(() => {
            setConfettiList(prev => {
                const next = [...prev, prev.length];
                return next.slice(-150); // manter até 150 confettis para performance
            });
        }, 200);
        return () => clearInterval(interval);
    }, []);

    const podiumOrder = [
        results.find(r => r.position === 2),
        results.find(r => r.position === 1),
        results.find(r => r.position === 3)
    ];

    const podiumHeights = ['h-32', 'h-48', 'h-24'];

    return (
        <div className="relative flex flex-col items-center justify-center p-6 bg-[#1e1e2b]/80 border border-slate-700 rounded-2xl backdrop-blur-sm shadow-lg overflow-hidden min-h-[500px]">
            {confettiList.map(i => {
                const angle = Math.random() * 2 * Math.PI;
                const distance = 50 + Math.random() * 300;
                const x = Math.cos(angle) * distance + 'px';
                const y = Math.sin(angle) * distance + 'px';
                const hue = Math.floor(Math.random() * 360);
                const size = 2 + Math.random() * 5 + 'px';
                const duration = 1 + Math.random() * 2 + 's';

                return (
                    <div
                        key={i}
                        className="confetti absolute top-1/2 left-1/2 rounded-full"
                        style={{
                            '--x': x,
                            '--y': y,
                            width: size,
                            height: size,
                            backgroundColor: `hsl(${hue}, 70%, 50%)`,
                            transform: 'translate(-50%, -50%)',
                            animation: `confetti-explosion ${duration} ease-out forwards`,
                        } as React.CSSProperties}
                    />
                );
            })}

            <div className="relative z-10 w-full flex flex-col items-center">
                <h2 className="text-3xl font-bold text-slate-200 mb-2">{t('podium')}</h2>
                <p className="text-lg text-slate-400 mb-8">{raceName}</p>
                
                <div className="flex items-end justify-center gap-2 w-full max-w-2xl mx-auto">
                    {podiumOrder.map((result, index) => {
                        if (!result) return <div key={index} className="flex-1"></div>;
                        
                        const driver = drivers.find(d => d.id === result.driverId);
                        const team = teams.find(t => t.id === driver?.teamId);
                        if (!driver || !team) return <div key={index} className="flex-1"></div>;

                        const isFirstPlace = result.position === 1;

                        return (
                            <div 
                                key={result.driverId} 
                                className={`flex-1 flex flex-col items-center ${animated[result.position - 1] ? 'animate-podium-pop-in' : 'opacity-0'}`}
                            >
                                <ImageWithFallback
                                    src={driver.photoUrl} 
                                    alt={driver.name} 
                                    primaryColor={team.primaryColor}
                                    accentColor={team.accentColor}
                                    initials={getInitials(driver.name)}
                                    type="driver"
                                    className={`w-24 h-24 sm:w-32 sm:h-32 rounded-full object-cover mb-2 border-4 ${isFirstPlace ? 'border-yellow-400' : 'border-slate-500'}`}
                                />
                                <h3 className="text-lg font-bold text-white text-center">{driver.name}</h3>
                                <p className="text-sm text-slate-400 text-center">{team.name}</p>
                                <div className={`w-full ${podiumHeights[index]} bg-slate-700/50 border-t-4 flex items-center justify-center rounded-t-lg mt-4`} style={{ borderColor: team.primaryColor }}>
                                    <span className="text-5xl font-black text-white" style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.5)' }}>
                                        {result.position}
                                    </span>
                                </div>
                            </div>
                        );
                    })}
                </div>

                <button
                    onClick={onContinue}
                    className="mt-12 w-full sm:w-auto px-8 py-3 bg-[#00e051] text-black font-bold text-lg uppercase rounded-lg shadow-lg hover:bg-opacity-90 focus:outline-none focus:ring-4 focus:ring-[#00e051]/50 transform hover:scale-105 transition-all duration-300 flex items-center justify-center gap-3"
                >
                    <span>{t('continue')}</span>
                    <ArrowRightIcon className="w-6 h-6" />
                </button>
            </div>

            <style>{`
                @keyframes confetti-explosion {
                    0% { opacity: 1; transform: translate(-50%, -50%) scale(0.2); }
                    80% { opacity: 1; transform: translate(calc(-50% + var(--x)), calc(-50% + var(--y))) scale(1); }
                    100% { opacity: 0; transform: translate(calc(-50% + var(--x)), calc(-50% + var(--y))) scale(0.5); }
                }
            `}</style>
        </div>
    );
};

export default Podium;
