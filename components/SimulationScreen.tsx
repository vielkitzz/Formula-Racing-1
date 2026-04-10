
import React, { useState, useEffect, useMemo } from 'react';
import { SeasonSettings, Race, DriverStanding, ConstructorStanding, RaceResult, Driver, Team, QualifyingResult, RaceState, TyreCompound, WeatherCondition, NewsArticle, QualifyingData, SeasonHistory, EngineSupplier, Country } from '../types';
import StandingsTable from './StandingsTable';
import RaceResultModal from './RaceResultModal';
import LiveRaceView from './LiveRaceView';
import PreRaceStrategyScreen from './PreRaceStrategyScreen';
import StopwatchIcon from './icons/StopwatchIcon';
import HomeIcon from './icons/HomeIcon';
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
import ExclamationTriangleIcon from './icons/ExclamationTriangleIcon';


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
                return <span key={index} className="font-bold" style={{ color: entity.color }}>{part}</span>;
            }
            return <React.Fragment key={index}>{part}</React.Fragment>;
        });
    };

    if (news.length === 0) {
        return (
            <div className="text-center py-20 flex flex-col items-center justify-center animate-fade-in">
                <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mb-4">
                    <SpinnerIcon className="w-8 h-8 text-slate-600" />
                </div>
                <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">{t('news_noNews')}</p>
            </div>
        )
    }
    
    const TRUNCATE_LENGTH = 250;

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 overflow-y-auto h-full pr-2 content-start pb-10">
            {sortedNews.map(article => {
                const isExpanded = expandedArticleId === article.id;
                const isLong = article.body.length > TRUNCATE_LENGTH;
                const bodyContent = isLong && !isExpanded ? `${article.body.substring(0, TRUNCATE_LENGTH)}...` : article.body;

                return (
                    <div key={article.id} className="glass overflow-hidden p-6 animate-fade-in hover:bg-white/5 transition-all duration-300 rounded-xl group border-l-4 border-l-red-600">
                        <div className="flex justify-between items-start mb-4">
                            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest bg-white/5 px-2 py-1 rounded">{article.date}</span>
                        </div>
                        <h4 className="font-black text-xl text-white mb-4 leading-tight font-racing group-hover:text-red-500 transition-colors">{article.headline}</h4>
                        <p className="text-slate-400 text-sm leading-relaxed font-medium">
                            {renderHighlightedBody(bodyContent)}
                        </p>
                        {isLong && (
                            <button
                                onClick={() => toggleArticle(article.id)}
                                className="text-[10px] font-black mt-6 text-red-600 hover:text-red-400 transition-colors uppercase tracking-widest"
                            >
                                {isExpanded ? 'Read Less -' : 'Read More +'}
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
        const cost = (level + 1) * 2;

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
        <div className="flex flex-col h-full overflow-hidden animate-fade-in">
            {/* Nav Tabs */}
            <div className="flex gap-2 mb-6 border-b border-white/5 sticky top-0 z-10">
                <button onClick={() => setActiveView('standings')} className={`px-4 py-3 font-black uppercase text-[10px] tracking-widest border-b-2 transition-all ${activeView === 'standings' ? 'border-red-600 text-white bg-white/5' : 'border-transparent text-slate-500 hover:text-slate-300'}`}>{t('standings')}</button>
                {isOwnerMode && <button onClick={() => setActiveView('myTeam')} className={`px-4 py-3 font-black uppercase text-[10px] tracking-widest border-b-2 flex items-center gap-2 transition-all ${activeView === 'myTeam' ? 'border-red-600 text-white bg-white/5' : 'border-transparent text-slate-500 hover:text-slate-300'}`}><UserIcon className="w-3.5 h-3.5" />{t('myTeam')}</button>}
                <button onClick={() => setActiveView('news')} className={`px-4 py-3 font-black uppercase text-[10px] tracking-widest border-b-2 transition-all ${activeView === 'news' ? 'border-red-600 text-white bg-white/5' : 'border-transparent text-slate-500 hover:text-slate-300'}`}>{t('news')}</button>
                <button onClick={() => setActiveView('charts')} className={`px-4 py-3 font-black uppercase text-[10px] tracking-widest border-b-2 transition-all ${activeView === 'charts' ? 'border-red-600 text-white bg-white/5' : 'border-transparent text-slate-500 hover:text-slate-300'}`}>{t('charts')}</button>
                {history.length > 0 && <button onClick={() => setActiveView('history')} className={`px-4 py-3 font-black uppercase text-[10px] tracking-widest border-b-2 transition-all ${activeView === 'history' ? 'border-red-600 text-white bg-white/5' : 'border-transparent text-slate-500 hover:text-slate-300'}`}>{t('history_title')}</button>}
            </div>
            
            <div className="flex-1 overflow-auto min-h-0">
                {activeView === 'standings' ? (
                     <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-full">
                        <div className="glass rounded-xl overflow-hidden carbon-pattern h-full">
                            <StandingsTable title={t('driversChampionship')} standings={driverStandings} type="driver" seasonOver={seasonOver} drivers={drivers} teams={teams} customCountries={customCountries} onRowClick={handleOpenProfile} />
                        </div>
                        <div className="glass rounded-xl overflow-hidden carbon-pattern h-full">
                            <StandingsTable title={t('constructorsChampionship')} standings={constructorStandings} type="constructor" seasonOver={seasonOver} drivers={drivers} teams={teams} customCountries={customCountries} onRowClick={handleOpenProfile} />
                        </div>
                    </div>
                ) : activeView === 'myTeam' && isOwnerMode && playerTeam ? (
                    <div className="h-full overflow-y-auto pr-2">
                        <TeamManagementPanel 
                            team={playerTeam}
                            drivers={drivers.filter(d => d.teamId === playerTeam.id)}
                            engineSupplier={engineSuppliers.find(e => e.name === playerTeam.engineSupplier)!}
                            onUpgradeFacility={handleUpgradeFacility}
                        />
                    </div>
                ) : activeView === 'news' ? (
                    <NewsPanel news={news} drivers={drivers} teams={teams} />
                ) : activeView === 'charts' ? (
                    <div className="h-full overflow-y-auto pr-2">
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
                    </div>
                ) : activeView === 'history' ? (
                    <div className="h-full overflow-y-auto pr-2">
                        <HistoryScreen history={history} customCountries={customCountries} />
                    </div>
                ) : null}
            </div>
        </div>
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
    <div className="flex flex-col h-full gap-6">
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

      <div className="flex-shrink-0 glass p-6 rounded-2xl flex flex-col md:flex-row justify-between items-center gap-6 shadow-2xl carbon-pattern border-l-4 border-l-red-600">
        <div className="flex items-center gap-6">
            {!seasonOver && currentRace && (
                <div className="relative">
                    <CountryFlag countryCode={currentRace.countryCode} customCountries={customCountries} className="w-16 h-12 rounded-lg object-cover shadow-xl" />
                    <div className="absolute -bottom-2 -right-2 bg-red-600 text-white font-black text-[10px] px-2 py-0.5 rounded italic">R{currentRaceIndex + 1}</div>
                </div>
            )}
            <div>
                <h2 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mb-1 leading-none">
                   {seasonOver ? 'Championship Review' : 'Up Next'}
                </h2>
                <p className="text-2xl font-black text-white italic uppercase font-racing tracking-tight">
                    {seasonOver ? t('congratsChampions', { year: settings.startYear }) : currentRace?.name}
                </p>
                {!seasonOver && currentRace && (
                     <p className="text-[10px] font-black text-slate-400 mt-1 uppercase tracking-widest bg-white/5 inline-block px-2 py-0.5 rounded">
                        {currentRace.country} • {currentRace.laps} Laps • {currentRace.baseLapTime} Base
                     </p>
                )}
            </div>
        </div>
        <div className="flex items-center gap-4">
            {['qualifying', 'race'].includes(simulationStatus) && !isSeasonSimRunning && (
              <SpeedControl currentSpeed={simulationSpeed} onSpeedChange={onSetSimulationSpeed} isPaused={isPaused} onPauseToggle={onPauseToggle} />
            )}
            {['idle', 'finished'].includes(simulationStatus) && !podiumData && !championData && (
                <div className="flex items-center gap-3">
                    {!seasonOver && (
                      <>
                        <button onClick={onSaveSimulation} className="p-3 glass hover:bg-blue-600/20 text-blue-400 rounded-xl transition-all" title={t('save')}>
                            <FloppyDiskIcon className="w-5 h-5" />
                        </button>
                        
                        <div className="h-10 w-px bg-white/10 mx-2"></div>

                        <div className="flex bg-black/40 p-1.5 rounded-xl border border-white/5">
                            <button 
                                onClick={onSimulateQualifying} 
                                disabled={isLoading} 
                                className="flex items-center gap-2 px-6 py-2 bg-red-600 text-white font-black text-xs uppercase rounded-lg hover:bg-red-500 disabled:bg-slate-800 disabled:text-slate-600 transition-all font-racing"
                            >
                                <StopwatchIcon className="w-4 h-4" /><span>{t('simulateQualifying')}</span>
                            </button>
                            <div className="w-px h-6 bg-white/10 mx-1.5 self-center"></div>
                            <button onClick={onSimulateWeekend} disabled={isLoading} className="p-2 text-slate-400 hover:text-white transition-all" title={t('simulateRaceWeek')}>
                                <PlayIcon className="w-5 h-5" />
                            </button>
                            <button onClick={onSimulateSeason} disabled={isLoading} className="p-2 text-slate-400 hover:text-white transition-all" title={t('simulateSeason')}>
                                <ForwardIcon className="w-5 h-5" />
                            </button>
                        </div>
                      </>
                    )}
                    <button onClick={onBackToMenu} className="p-3 glass hover:bg-white/10 text-slate-400 hover:text-white rounded-xl transition-all" title={t('backToMenu')}>
                        <HomeIcon className="w-5 h-5" />
                    </button>
                </div>
            )}
        </div>
      </div>
       
       {isSeasonSimRunning && (
        <div className="p-4 glass border-l-4 border-l-[#00ff85] flex items-center justify-between animate-fade-in rounded-xl flex-shrink-0">
          <div className="flex items-center gap-4">
            <SpinnerIcon className="w-5 h-5 text-[#00ff85]" />
            <div>
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Season Simulation Active</p>
                <p className="text-sm font-black text-white italic uppercase font-racing">{currentRace?.name}</p>
            </div>
          </div>
          <button onClick={onStopSeasonSim} className="px-4 py-2 bg-red-600/10 text-red-500 font-black text-[10px] uppercase rounded-lg hover:bg-red-600 hover:text-white transition-all tracking-widest">{t('stop')}</button>
        </div>
       )}

       {error && (
        <div className="p-4 bg-red-950/40 border border-red-900 text-red-400 rounded-xl flex-shrink-0 animate-fade-in flex items-center gap-3">
          <ExclamationTriangleIcon className="w-5 h-5" />
          <p className="text-sm font-bold uppercase tracking-tight">{error}</p>
        </div>
      )}
      
      <div className={`flex-1 min-h-0 transition-all duration-300 ease-in-out ${isFading ? 'opacity-0 transform -translate-y-4' : 'opacity-100'}`}>
        {renderContent()}
      </div>

    </div>
  );
};

export default SimulationScreen;
