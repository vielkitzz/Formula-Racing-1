import React from 'react';
import { RaceResult, Race, Driver, Team, QualifyingResult, SeasonSettings } from '../types';
import { getCountryFlagUrl, getInitials } from '../utils';
import CloseIcon from './icons/CloseIcon';
import StopwatchIcon from './icons/StopwatchIcon';
import { useI18n } from '../i18n';
import ImageWithFallback from './ImageWithFallback';
import { SCORING_SYSTEMS } from '../constants';

interface RaceResultModalProps {
  isOpen: boolean;
  onClose: () => void;
  raceResults: RaceResult[];
  qualifyingResults: QualifyingResult[];
  race: Race;
  drivers: Driver[];
  teams: Team[];
  settings: SeasonSettings;
}

const RaceResultModal: React.FC<RaceResultModalProps> = ({ isOpen, onClose, raceResults, qualifyingResults, race, drivers, teams, settings }) => {
  const { t } = useI18n();
  if (!isOpen) return null;

  const scoringSystem = SCORING_SYSTEMS.find(s => s.id === settings.scoringSystemId);
  const pointsPositions = scoringSystem ? scoringSystem.points.length : 10;
  
  const combinedResults = raceResults.map(raceResult => {
    const qualifying = qualifyingResults.find(q => q.driverId === raceResult.driverId);
    return {
      ...raceResult,
      gridPosition: qualifying?.position || 0,
      eliminatedIn: qualifying?.eliminatedIn,
    };
  }).sort((a, b) => {
    if (a.position === 0) return 1;
    if (b.position === 0) return -1;
    return a.position - b.position;
  });

  const PositionChange: React.FC<{ change: number }> = ({ change }) => {
    if (change > 0) return <span className="text-[#00e051] font-bold">▲{change}</span>;
    if (change < 0) return <span className="text-[#e00601] font-bold">▼{Math.abs(change)}</span>;
    return <span className="text-slate-500 font-bold">-</span>;
  };

  const ResultHeader = () => (
    <div className="grid grid-cols-12 gap-2 p-2 text-xs font-bold text-slate-400 uppercase border-b border-slate-700">
        <div className="col-span-1 text-center">{t('pos')}</div>
        <div className="col-span-1 text-center">{t('grid')}</div>
        <div className="col-span-1 text-center hidden sm:block">+/-</div>
        <div className="col-span-5 sm:col-span-4">{t('driver')}</div>
        <div className="col-span-2 text-right hidden md:block">{t('bestLap')}</div>
        <div className="col-span-1 text-center hidden sm:block">{t('pits')}</div>
        <div className="col-span-2 text-right">{t('points')}</div>
    </div>
  );
  
  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div 
        className="bg-[#1e1e2b] border border-slate-700 rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 bg-[#1e1e2b]/80 backdrop-blur-sm z-10 p-6 border-b border-slate-700 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-slate-200 flex items-center gap-3">
            <img src={getCountryFlagUrl(race.countryCode)} alt={race.country} className="w-8 h-auto rounded-sm" />
            <span>{t('resultsFor', { raceName: race.name })}</span>
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white">
            <CloseIcon className="w-6 h-6" />
          </button>
        </div>
        
        <div className="p-4 sm:p-6 flex-grow">
          <ResultHeader />
          <ul className="space-y-1 mt-1">
            {combinedResults.map((result) => {
              const driver = drivers.find(d => d.id === result.driverId);
              const team = teams.find(t => t.id === driver?.teamId);
              if (!driver || !team) return null;

              const isDNF = result.position === 0;
              const isInPoints = !isDNF && result.position > 0 && result.position <= pointsPositions;
              const positionChange = !isDNF && result.gridPosition ? result.gridPosition - result.position : 0;

              return (
                <li key={driver.id} className={`grid grid-cols-12 gap-2 items-center p-2 rounded-md ${isDNF ? 'bg-[#e00601]/20 opacity-80' : isInPoints ? 'bg-green-900/20' : 'bg-slate-500/10'}`}>
                  {/* Pos */}
                  <div className="col-span-1 text-center font-black text-lg">{isDNF ? 'DNF' : result.position}</div>
                  
                  {/* Grid */}
                  <div className="col-span-1 text-center text-slate-400 text-sm">({result.gridPosition || 'N/A'})</div>
                  
                  {/* +/- */}
                  <div className="col-span-1 text-center hidden sm:block">
                    <PositionChange change={positionChange} />
                  </div>

                  {/* Piloto */}
                  <div className="col-span-5 sm:col-span-4 flex items-center gap-3 border-l-4" style={{ borderColor: team.primaryColor }}>
                     <ImageWithFallback
                        src={driver.photoUrl}
                        alt={driver.name}
                        primaryColor={team.primaryColor}
                        accentColor={team.accentColor}
                        initials={getInitials(driver.name)}
                        type="driver"
                        className="w-10 h-10 rounded-full object-cover ml-2"
                     />
                     <div>
                        <p className="font-semibold text-sm sm:text-base">{driver.name}</p>
                        <p className="text-xs text-slate-400 hidden sm:block">{team.name} {result.eliminatedIn ? <span className="font-bold">({result.eliminatedIn})</span> : ''}</p>
                        {isDNF && result.dnfReason && (
                          <p className="text-xs text-red-400/90 font-semibold italic mt-1 sm:block">{result.dnfReason}</p>
                        )}
                     </div>
                  </div>
                  
                  {/* Best Lap */}
                  <div className="col-span-2 text-right font-mono text-sm hidden md:block">{result.bestLapTime}</div>
                  
                  {/* Pits */}
                  <div className="col-span-1 text-center font-bold hidden sm:block">{result.pitStops}</div>

                  {/* Pontos */}
                  <div className="col-span-2 text-right flex items-center justify-end gap-2">
                    {result.fastestLap && <StopwatchIcon title={t('fastestLap')} className="w-4 h-4 text-purple-400" />}
                    <span className="font-bold text-lg text-white w-10">{result.points > 0 ? `+${result.points}` : '0'}</span>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
        
        <div className="sticky bottom-0 bg-[#1e1e2b]/80 backdrop-blur-sm z-10 p-4 border-t border-slate-700 flex justify-end">
            <button
                onClick={onClose}
                className="px-6 py-2 bg-[#e00601] text-white font-bold uppercase rounded-lg shadow-md hover:bg-opacity-90 flex items-center justify-center gap-2 transition-colors"
            >
                <CloseIcon className="w-5 h-5" />
                <span>{t('close')}</span>
            </button>
        </div>
      </div>
    </div>
  );
};

export default RaceResultModal;