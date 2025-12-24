
import React, { useState, useEffect, useMemo } from 'react';
import { SeasonSettings, Race, DriverStanding, ConstructorStanding, RaceResult, Driver, Team, QualifyingResult, RaceState, TyreCompound, WeatherCondition, NewsArticle, QualifyingData, SeasonHistory, EngineSupplier, Country } from '../types';
import StandingsTable from './StandingsTable';
import RaceResultModal from './RaceResultModal';
import LiveRaceView from './LiveRaceView';
import PreRaceStrategyScreen from './PreRaceStrategyScreen';
import StopwatchIcon from './icons/StopwatchIcon';
import HomeIcon from './icons/HomeIcon';
import CalendarIcon from './icons/CalendarIcon';
import SpeedControl from './SpeedControl';
import Podium from './Podium';
import FloppyDiskIcon from './icons/FloppyDiskIcon';
import ChartsView from './ChartsView';
import ChampionCelebration from './ChampionCelebration';
import { useI18n } from '../i18n';
import ProfileModal from './ProfileModal';
import QualifyingInProgressScreen from './QualifyingInProgressScreen';
import SpinnerIcon from './icons/SpinnerIcon';
import PlayIcon from './icons/PlayIcon';
import ForwardIcon from './icons/ForwardIcon';
import HistoryScreen from './HistoryScreen';
import TeamManagementPanel from './TeamManagementPanel';
import UserIcon from './icons/UserIcon';
import CountryFlag from './CountryFlag';


const NewsPanel: React.FC<{ news: NewsArticle[], drivers: Driver[], teams: Team[] }> = ({ news, drivers, teams }) => {
    const { t } = useI18n();
    const [expandedArticleId, setExpandedArticleId] = useState<string | null>(null);

    useEffect(() => {
        if (news.length > 0) {
            setExpandedArticleId(news[news.length - 1].id);
        }
    }, [news]);

    const toggleArticle = (id: string) => {
        setExpandedArticleId(prevId => (prevId === id ? null : id));
    };
    
    const sortedNews = [...news].reverse();

    const entities = useMemo(() => {
        const allEntities = [
            ...drivers.map(d => {
                const team = teams.find(t => t.id === d.teamId);
                return { name: d.name, color: team?.primaryColor || '#FFFFFF', accent: team?.accentColor || '#FFFFFF' };
            }),
            ...teams.map(t => ({ name: t.name, color: t.primaryColor, accent: t.accentColor }))
        ];
        allEntities.sort((a, b) => b.name.length - a.name.length);
        return allEntities;
    }, [drivers, teams]);

    const renderHighlightedBody = (text: string) => {
        if (!text) return '';
        const regex = new RegExp(`(${entities.map(e => e.name.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')).join('|')})`, 'g');
        const parts = text.split(regex);

        return parts.map((part, index) => {
            const entity = entities.find(e => e.name === part);
            if (entity) {
                const hex = entity.color.replace('#', '');
                if (hex.length < 6) return <span key={index}>{part}</span>;
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
            return <React.Fragment key={index}>{part}</React.Fragment>;
        });
    };

    if (news.length === 0) {
        return (
            <div className="text-center py-10">
                <p className="text-slate-400">{t('news_noNews')}</p>
            </div>
        )
    }
    
    const TRUNCATE_LENGTH = 250;

    return (
        <div className="space-y-4">
            {sortedNews.map(article => {
                const isExpanded = expandedArticleId === article.id;
                const isLong = article.body.length > TRUNCATE_LENGTH;
                
                const bodyContent = isLong && !isExpanded
                    ? `${article.body.substring(0, TRUNCATE_LENGTH)}...`
                    : article.body;

                return (
                    <div key={article.id} className="bg-slate-500/10 rounded-lg overflow-hidden p-4 animate-fade-in">
                        <p className="text-xs text-slate-400 uppercase">{article.date}</p>
                        <h4 className="font-bold text-lg text-slate-200 mb-2">{article.headline}</h4>
                        <p className="text-slate-300 whitespace-pre-line">
                            {renderHighlightedBody(bodyContent)}
                        </p>
                        {isLong && (
                            <button
                                onClick={() => toggleArticle(article.id)}
                                className="text-sm font-bold mt-2 text-[#00e051] hover:text-green-300 transition-colors"
                            >
                                {isExpanded ? t('readLess') : t('readMore')}
                            </button>
                        )}
                    </div>
                );
            })}
        </div>
    );
};


interface SimulationScreenProps {
  settings: SeasonSettings;
  currentRaceIndex: number;
  calendar: Race[];
  drivers: Driver[];
  teams: Team[];
  engineSuppliers: EngineSupplier[];
  customCountries: Country[];
  setTeams: React.Dispatch<React.SetStateAction<Team[]>>;
  driverStandings: DriverStanding[];
  constructorStandings: ConstructorStanding[];
  lastRaceResults: RaceResult[] | null;
  allRaceResults: RaceResult[][];
  allQualifyingResults: QualifyingResult[][];
  qualifyingResults: QualifyingResult[] | null;
  qualifyingData: QualifyingData | null;
  news: NewsArticle[];
  history: SeasonHistory[];
  onSimulateQualifying: () => void;
  onSimulateWeekend: () => void;
  onSimulateSeason: () => void;
  onStopSeasonSim: () => void;
  isSeasonSimRunning: boolean;
  onStartRace: (strategies: { driverId: number; startingTyre: TyreCompound }[], startingWeather: WeatherCondition) => void;
  isLoading: boolean;
  error: string | null;
  onBackToMenu: () => void;
  onEndSeason: () => void;
  simulationStatus: 'idle' | 'qualifying' | 'pre-race' | 'race' | 'finished';
  raceState: RaceState | null;
  raceHistory: RaceState[];
  simulationSpeed: number;
  onSetSimulationSpeed: (speed: number) => void;
  isPaused: boolean;
  onPauseToggle: () => void;
  commentary: string;
  onSaveSimulation: () => void;
  determinedWeather: WeatherCondition | null;
}

const SimulationScreen: React.FC<SimulationScreenProps> = ({
  settings,
  currentRaceIndex,
  calendar,
  drivers,
  teams,
  engineSuppliers,
  customCountries,
  setTeams,
  driverStandings,
  constructorStandings,
  lastRaceResults,
  allRaceResults,
  allQualifyingResults,
  qualifyingResults,
  qualifyingData,
  news,
  history,
  onSimulateQualifying,
  onSimulateWeekend,
  onSimulateSeason,
  onStopSeasonSim,
  isSeasonSimRunning,
  onStartRace,
  isLoading,
  error,
  onBackToMenu,
  onEndSeason,
  simulationStatus,
  raceState,
  raceHistory,
  simulationSpeed,
  onSetSimulationSpeed,
  isPaused,
  onPauseToggle,
  commentary,
  onSaveSimulation,
  determinedWeather,
}) => {
  const { t } = useI18n();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeContentKey, setActiveContentKey] = useState(simulationStatus);
  const [isFading, setIsFading] = useState(false);
  const [podiumData, setPodiumData] = useState<RaceResult[] | null>(null);
  const [activeView, setActiveView] = useState<'standings' | 'myTeam' | 'news' | 'charts' | 'history'>('standings');
  const [championData, setChampionData] = useState<{ driverChampion: { driver: Driver, team: Team }, constructorChampion: Team } | null>(null);
  const [selectedProfile, setSelectedProfile] = useState<{ id: number; type: 'driver' | 'constructor' } | null>(null);

  const seasonOver = currentRaceIndex >= calendar.length;
  const currentRace = calendar[currentRaceIndex];
  const isOwnerMode = settings.mode === 'owner';
  const playerTeam = teams.find(t => t.id === settings.playerTeamId);

    const handleOpenProfile = (id: number, type: 'driver' | 'constructor') => {
        setSelectedProfile({ id, type });
    };

    const handleCloseProfile = () => {
        setSelectedProfile(null);
    };
    
    const handleUpgradeFacility = (facility: keyof Team['facilities']) => {
        if (!playerTeam) return;

        const level = playerTeam.facilities[facility];
        const cost = (level + 1) * 2; // Example cost formula

        if (playerTeam.budget >= cost) {
            if (window.confirm(t('confirm_upgrade_facility', { name: t(`facility_${facility}`), cost, level: level + 1 }))) {
                setTeams(prevTeams => prevTeams.map(t => {
                    if (t.id === playerTeam.id) {
                        return {
                            ...t,
                            budget: t.budget - cost,
                            facilities: {
                                ...t.facilities,
                                [facility]: t.facilities[facility] + 1
                            }
                        };
                    }
                    return t;
                }));
            }
        } else {
            alert(t('error_insufficient_funds'));
        }
    };


  useEffect(() => {
    if (lastRaceResults && simulationStatus === 'finished') {
      setIsModalOpen(true);
      const topThree = lastRaceResults
        .filter(r => r.position > 0 && r.position <= 3)
        .sort((a, b) => a.position - b.position);
      setPodiumData(topThree);
    }
  }, [lastRaceResults, simulationStatus]);

    useEffect(() => {
        if (seasonOver && simulationStatus === 'finished' && !isModalOpen && !podiumData && !championData && driverStandings.length > 0) {
            const driverChampId = driverStandings[0].driverId;
            const driver = drivers.find(d => d.id === driverChampId)!;
            const team = teams.find(t => t.id === driver.teamId)!;
            const constructorChamp = teams.find(t => t.id === constructorStandings[0].teamId)!;
            
            setChampionData({
                driverChampion: { driver, team },
                constructorChampion: constructorChamp,
            });
        }
    }, [seasonOver, simulationStatus, isModalOpen, podiumData, driverStandings, constructorStandings, drivers, teams, championData]);


  useEffect(() => {
    if (simulationStatus !== activeContentKey) {
        setIsFading(true);
        const timer = setTimeout(() => {
            setActiveContentKey(simulationStatus);
            setIsFading(false);
        }, 300);
        return () => clearTimeout(timer);
    }
  }, [simulationStatus, activeContentKey]);
  
  const handlePodiumContinue = () => {
    setPodiumData(null);
  };
  
  const handleBackFromStrategy = () => {
      onSetSimulationSpeed(1);
      setActiveContentKey(lastRaceResults ? 'finished' : 'idle');
  };

  const renderIdleContent = () => {
      if (podiumData || championData) return null; 
      return (
        <>
            <div className="flex border-b border-slate-700 mb-4">
                <button onClick={() => setActiveView('standings')} className={`px-4 py-2 font-bold uppercase text-sm ${activeView === 'standings' ? 'border-b-2 border-[#00e051] text-white' : 'text-slate-400'}`}>{t('standings')}</button>
                {isOwnerMode && <button onClick={() => setActiveView('myTeam')} className={`px-4 py-2 font-bold uppercase text-sm flex items-center gap-2 ${activeView === 'myTeam' ? 'border-b-2 border-[#00e051] text-white' : 'text-slate-400'}`}><UserIcon className="w-5 h-5" />{t('myTeam')}</button>}
                <button onClick={() => setActiveView('news')} className={`px-4 py-2 font-bold uppercase text-sm ${activeView === 'news' ? 'border-b-2 border-[#00e051] text-white' : 'text-slate-400'}`}>{t('news')}</button>
                <button onClick={() => setActiveView('charts')} className={`px-4 py-2 font-bold uppercase text-sm ${activeView === 'charts' ? 'border-b-2 border-[#00e051] text-white' : 'text-slate-400'}`}>{t('charts')}</button>
                {history.length > 0 && <button onClick={() => setActiveView('history')} className={`px-4 py-2 font-bold uppercase text-sm ${activeView === 'history' ? 'border-b-2 border-[#00e051] text-white' : 'text-slate-400'}`}>{t('history_title')}</button>}
            </div>
            {activeView === 'standings' ? (
                 <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <StandingsTable title={t('driversChampionship')} standings={driverStandings} type="driver" seasonOver={seasonOver} drivers={drivers} teams={teams} customCountries={customCountries} onRowClick={handleOpenProfile} />
                  <StandingsTable title={t('constructorsChampionship')} standings={constructorStandings} type="constructor" seasonOver={seasonOver} drivers={drivers} teams={teams} customCountries={customCountries} onRowClick={handleOpenProfile} />
                </div>
            ) : activeView === 'myTeam' && isOwnerMode && playerTeam ? (
                <TeamManagementPanel 
                    team={playerTeam}
                    drivers={drivers.filter(d => d.teamId === playerTeam.id)}
                    engineSupplier={engineSuppliers.find(e => e.name === playerTeam.engineSupplier)!}
                    onUpgradeFacility={handleUpgradeFacility}
                />
            ) : activeView === 'news' ? (
                <NewsPanel news={news} drivers={drivers} teams={teams} />
            ) : activeView === 'charts' ? (
                <ChartsView
                    raceHistory={raceHistory}
                    drivers={drivers}
                    teams={teams}
                    allRaceResults={allRaceResults}
                    allQualifyingResults={allQualifyingResults}
                    settings={settings}
                    calendar={calendar}
                    driverStandings={driverStandings}
                    customCountries={customCountries}
                />
            ) : activeView === 'history' ? (
                <HistoryScreen history={history} customCountries={customCountries} />
            ) : null}
        </>
      )
  };

  const renderContent = () => {
    if (simulationStatus === 'finished' && !isModalOpen && podiumData && podiumData.length > 0) {
      return (
        <Podium 
          results={podiumData}
          drivers={drivers}
          teams={teams}
          raceName={calendar[currentRaceIndex - 1]?.name || t('grandPrix')}
          onContinue={handlePodiumContinue}
        />
      );
    }
    
    if (seasonOver && championData) {
        return (
            <ChampionCelebration
                driverChampion={championData.driverChampion}
                constructorChampion={championData.constructorChampion}
                year={settings.startYear}
                onContinue={onEndSeason}
            />
        );
    }

    switch(activeContentKey) {
        case 'race':
            if (raceState) return <LiveRaceView race={currentRace} raceState={raceState} drivers={drivers} teams={teams} commentary={commentary} isPaused={isPaused} settings={settings} customCountries={customCountries} />;
            return null;
        case 'pre-race':
            return <PreRaceStrategyScreen
                qualifyingResults={qualifyingResults!}
                drivers={drivers}
                teams={teams}
                race={currentRace}
                onStartRace={onStartRace}
                weather={determinedWeather!}
                onBack={handleBackFromStrategy}
            />;
        case 'qualifying':
            return <QualifyingInProgressScreen
                qualifyingData={qualifyingData}
                drivers={drivers}
                teams={teams}
            />;
        case 'idle':
        case 'finished':
        default:
             return renderIdleContent();
    }
  }

  return (
    <div className="space-y-8">
      {lastRaceResults && qualifyingResults && simulationStatus === 'finished' && (
        <RaceResultModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          raceResults={lastRaceResults}
          qualifyingResults={qualifyingResults}
          race={calendar[currentRaceIndex - 1]}
          drivers={drivers}
          teams={teams}
          settings={settings}
          customCountries={customCountries}
        />
      )}
      
      <ProfileModal
          isOpen={!!selectedProfile}
          onClose={handleCloseProfile}
          profileId={selectedProfile?.id}
          profileType={selectedProfile?.type}
          drivers={drivers}
          teams={teams}
          onSelectProfile={handleOpenProfile}
          allRaceResults={allRaceResults}
          allQualifyingResults={allQualifyingResults}
          customCountries={customCountries}
      />

      <div className="p-6 bg-[#1e1e2b]/80 border border-slate-700 rounded-2xl backdrop-blur-sm shadow-lg flex flex-col sm:flex-row justify-between items-center gap-4">
        <div>
            <h2 className="text-2xl font-bold text-slate-200 uppercase flex items-center gap-3">
               {!seasonOver && <CalendarIcon className="w-6 h-6" />}
               <span>{seasonOver ? t('seasonFinished') : t('nextRace')}</span>
            </h2>
            <p className="text-xl font-semibold text-white">
                {seasonOver ? t('congratsChampions', { year: settings.startYear }) : currentRace?.name}
            </p>
           {currentRace && !seasonOver && (
             <div className="flex items-center gap-2 text-slate-400 mt-1">
               <CountryFlag countryCode={currentRace.countryCode} customCountries={customCountries} className="w-5 h-auto rounded-sm" />
               <span>{t('raceInfo', { round: currentRaceIndex + 1, total: calendar.length, country: currentRace.country })}</span>
             </div>
           )}
        </div>
        <div className="flex flex-col sm:flex-row items-center gap-4">
            {['qualifying', 'race'].includes(simulationStatus) && !isSeasonSimRunning && (
              <SpeedControl currentSpeed={simulationSpeed} onSpeedChange={onSetSimulationSpeed} isPaused={isPaused} onPauseToggle={onPauseToggle} />
            )}
            {['idle', 'finished'].includes(simulationStatus) && !podiumData && !championData && (
                <div className="flex flex-col sm:flex-row items-center gap-4 w-full">
                    <button onClick={onBackToMenu} className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 bg-slate-600/50 text-slate-200 font-bold uppercase rounded-lg shadow-md hover:bg-slate-500/50 transition-colors duration-300">
                        <HomeIcon className="w-5 h-5" /><span>{t('backToMenu')}</span>
                    </button>
                    {!seasonOver && (
                      <div className="w-full flex flex-col sm:flex-row gap-4">
                        <button onClick={onSaveSimulation} className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 bg-blue-600/80 text-white font-bold uppercase rounded-lg shadow-md hover:bg-blue-600 transition-colors duration-300">
                            <FloppyDiskIcon className="w-5 h-5" /><span>{t('save')}</span>
                        </button>
                        <div className="flex-grow grid grid-cols-1 sm:grid-cols-2 gap-2">
                            <button onClick={onSimulateQualifying} disabled={isLoading} className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-[#e00601] text-white font-bold uppercase rounded-lg shadow-md hover:bg-opacity-90 disabled:bg-slate-500/50 disabled:cursor-not-allowed transition-all duration-300">
                                <StopwatchIcon className="w-5 h-5" /><span>{t('simulateQualifying')}</span>
                            </button>
                             <div className="grid grid-cols-2 gap-2">
                                <button onClick={onSimulateWeekend} disabled={isLoading} className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-slate-700 text-white font-bold uppercase rounded-lg shadow-md hover:bg-slate-600 disabled:bg-slate-500/50 disabled:cursor-not-allowed transition-all duration-300">
                                    <PlayIcon className="w-5 h-5" /><span>{t('simulateRaceWeek')}</span>
                                </button>
                                <button onClick={onSimulateSeason} disabled={isLoading} className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-slate-700 text-white font-bold uppercase rounded-lg shadow-md hover:bg-slate-600 disabled:bg-slate-500/50 disabled:cursor-not-allowed transition-all duration-300">
                                    <ForwardIcon className="w-5 h-5" /><span>{t('simulateSeason')}</span>
                                </button>
                            </div>
                        </div>
                      </div>
                    )}
                </div>
            )}
        </div>
      </div>
       
       {isSeasonSimRunning && (
        <div className="p-4 bg-slate-900/80 border border-slate-700 text-slate-200 rounded-lg flex items-center justify-between animate-fade-in">
          <div className="flex items-center gap-3">
            <SpinnerIcon />
            <span className="font-bold">{t('simulatingSeason_progress', { round: currentRaceIndex + 1, total: calendar.length, raceName: currentRace?.name })}</span>
          </div>
          <button onClick={onStopSeasonSim} className="px-4 py-2 bg-red-600 text-white font-bold text-sm uppercase rounded-lg shadow-md hover:bg-red-500 transition-colors">{t('stop')}</button>
        </div>
       )}

       {error && (
        <div className="p-4 bg-[#e00601]/20 border border-[#e00601]/50 text-red-200 rounded-lg">
          <p><span className="font-bold">{t('error')}:</span> {error}</p>
        </div>
      )}
      
      <div className={`transition-all duration-300 ease-in-out ${isFading ? 'opacity-0 transform -translate-y-4' : 'opacity-100'}`}>
        {renderContent()}
      </div>

    </div>
  );
};

export default SimulationScreen;
