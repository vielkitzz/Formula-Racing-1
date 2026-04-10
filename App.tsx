
import React, { useState, useCallback, useEffect, useRef } from 'react';
import { AppState, SeasonSettings, RaceResult, DriverStanding, ConstructorStanding, Race, Team, Driver, QualifyingResult, RaceState, TyreCompound, LiveDriverState, EngineSupplier, SaveData, WeatherCondition, NewsArticle, AppSkin, QualifyingData, RegulationChangeProposal, SeasonHistory, IncidentType, Incident, Country } from './types';
import { DRIVERS, TEAMS, CALENDAR, SCORING_SYSTEMS, TYRE_COMPOUNDS, ENGINE_SUPPLIERS, DEFAULT_SKIN, DEFAULT_SKINS, PRIZE_MONEY } from './constants';
import MainMenu from './components/MainMenu';
import SettingsScreen from './components/SettingsScreen';
import SimulationScreen from './components/SimulationScreen';
import EditMenu from './components/EditMenu';
import { runFullQualifyingSimulation } from './simulationEngine';
import { formatTime, parseTimeToSeconds, getPeriodicCommentary, getDnfCommentary, getPitStopCommentary, getRaceStartCommentary, getRandomDnfReason, determineWeather, getNextWeatherState, getWeatherChangeCommentary, generateRaceNews, getSafetyCarDeployedCommentary, getSafetyCarInCommentary, getRedFlagCommentary, getGreenFlagCommentary, getIncidentCommentary, getIncidentClearedCommentary } from './utils';
import { shouldDriverPit, chooseNextTyre } from './strategyEngine';
import { useI18n } from './i18n';
import SettingsPanel from './components/SettingsPanel';
import Cog8ToothIcon from './components/icons/Cog8ToothIcon';
import { getSavedSkins, getCustomCountries, saveCustomCountries } from './storage';
import { getSavedSimulations, saveSimulation, getSeasonHistory, saveSeasonToHistory } from './storage';
import { generateRegulationProposals } from './regulationChanges';
import RegulationChangesScreen from './components/RegulationChangesScreen';
import TeamSelectionScreen from './components/TeamSelectionScreen';


const App: React.FC = () => {
    const [appState, setAppState] = useState<AppState>(AppState.MainMenu);
    const [settings, setSettings] = useState<SeasonSettings | null>(null);
    const [currentRaceIndex, setCurrentRaceIndex] = useState<number>(0);
    const [allRaceResults, setAllRaceResults] = useState<RaceResult[][]>([]);
    const [allQualifyingResults, setAllQualifyingResults] = useState<QualifyingResult[][]>([]);
    const [qualifyingResults, setQualifyingResults] = useState<QualifyingResult[] | null>(null);
    const [qualifyingData, setQualifyingData] = useState<QualifyingData | null>(null);
    const [driverStandings, setDriverStandings] = useState<DriverStanding[]>([]);
    const [constructorStandings, setConstructorStandings] = useState<ConstructorStanding[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [simulationStatus, setSimulationStatus] = useState<'idle' | 'qualifying' | 'pre-race' | 'race' | 'finished'>('idle');
    const [raceState, setRaceState] = useState<RaceState | null>(null);
    const [raceHistory, setRaceHistory] = useState<RaceState[]>([]);
    const [simulationSpeed, setSimulationSpeed] = useState<number>(1);
    const [isPaused, setIsPaused] = useState<boolean>(false);
    const [commentary, setCommentary] = useState<string>('');
    const [determinedWeather, setDeterminedWeather] = useState<WeatherCondition | null>(null);
    const [news, setNews] = useState<NewsArticle[]>([]);
    const [simulationMode, setSimulationMode] = useState<'single' | 'weekend' | 'season'>('single');
    const [isSeasonSimRunning, setIsSeasonSimRunning] = useState(false);
    const [regulationProposals, setRegulationProposals] = useState<RegulationChangeProposal[]>([]);
    
    const simulationIntervalRef = useRef<number | null>(null);
    const loadFileInputRef = useRef<HTMLInputElement>(null);
    const lastCommentaryLapRef = useRef<number>(0);

    // Editable data
    const [drivers, setDrivers] = useState<Driver[]>(DRIVERS);
    const [teams, setTeams] = useState<Team[]>(TEAMS);
    const [calendar, setCalendar] = useState<Race[]>(CALENDAR);
    const [engineSuppliers, setEngineSuppliers] = useState<EngineSupplier[]>(ENGINE_SUPPLIERS);
    const [customCountries, setCustomCountries] = useState<Country[]>([]);
    const [skin, setSkin] = useState<AppSkin>(DEFAULT_SKIN);
    const [userSkins, setUserSkins] = useState<AppSkin[]>(getSavedSkins());
    
    // Global Settings
    const { t, language, setLanguage } = useI18n();
    const [isSettingsPanelOpen, setIsSettingsPanelOpen] = useState(false);
    const [hidePotential, setHidePotential] = useState(false);
    
    // Save/Load & History
    const [hasSaves, setHasSaves] = useState<boolean>(false);
    const [seasonHistory, setSeasonHistory] = useState<SeasonHistory[]>([]);

    useEffect(() => {
        const localSaves = getSavedSimulations();
        setHasSaves(localSaves.length > 0);
        setSeasonHistory(getSeasonHistory());
        setCustomCountries(getCustomCountries());
    }, []);

    useEffect(() => {
        if (!skin) return;
        const root = document.documentElement;
        Object.entries(skin.colors).forEach(([key, value]) => {
            const varName = `--${key.replace(/([A-Z])/g, '-$1').toLowerCase()}`; 
            root.style.setProperty(varName, String(value));
        });
        root.style.setProperty('--main-font', skin.fontFamily);
    }, [skin]);

    const handleCustomCountriesChange = (newCountries: Country[]) => {
        setCustomCountries(newCountries);
        saveCustomCountries(newCountries);
    };

    const randomizeAllDriverPotentials = () => {
        setDrivers(prevDrivers =>
            prevDrivers.map(driver => ({
                ...driver,
                potential: parseFloat(
                    (Math.min(10.0, Math.max(1.0, 6.5 + (Math.random() - 0.5) * 7))).toFixed(1)
                )
            }))
        );
    };

    const startNewSeason = (newSettings: SeasonSettings) => {
        const proposals = generateRegulationProposals();
        setRegulationProposals(proposals);

        setSettings(newSettings);
        setCurrentRaceIndex(0);
        setAllRaceResults([]);
        setAllQualifyingResults([]);
        setQualifyingResults(null);
        setQualifyingData(null);
        setDriverStandings(drivers.map(d => ({ driverId: d.id, points: 0 })));
        setConstructorStandings(teams.map(t => ({ teamId: t.id, points: 0 })));
        setError(null);
        setSimulationStatus('idle');
        setRaceState(null);
        setRaceHistory([]);
        setCommentary('');
        setIsPaused(false);
        setDeterminedWeather(null);
        setNews([]);
        lastCommentaryLapRef.current = 0;
        
        setAppState(AppState.RegulationChanges);
    };

    const handleConfirmRegulations = (selectedProposal: RegulationChangeProposal | null) => {
        if (selectedProposal) {
            const effect = selectedProposal.getEffect();
            const { teams: newTeams, engineSuppliers: newEngineSuppliers } = effect({ teams, engineSuppliers });
            setTeams(newTeams);
            setEngineSuppliers(newEngineSuppliers);
        }
        setAppState(AppState.Simulation);
    };

    const handleStartNextSeason = useCallback(() => {
        if (!settings) return;
        const nextYearSettings: SeasonSettings = { ...settings, startYear: settings.startYear + 1 };
        startNewSeason(nextYearSettings);
    }, [settings, drivers, teams, calendar, engineSuppliers]);

    const progressDrivers = useCallback((currentDrivers: Driver[], finalDriverStandings: DriverStanding[], totalRaces: number): Driver[] => {
        const PEAK_AGE_START = 28;
        const PEAK_AGE_END = 32;
    
        return currentDrivers.map(driver => {
            const newAge = driver.age + 1;
            const standing = finalDriverStandings.find(s => s.driverId === driver.id);
            const totalPoints = standing ? standing.points : 0;
            const avgPoints = totalRaces > 0 ? totalPoints / totalRaces : 0;
            const performanceFactor = Math.max(-1, Math.min(1.5, (avgPoints - 8) / 10));
    
            let newDriver = { ...driver, age: newAge, contractEndsYear: driver.contractEndsYear - 1 };
    
            let currentPotential = driver.potential;
            if (newAge > 33) {
                currentPotential -= (0.05 + (Math.random() * 0.05));
            } else if (newAge < 25 && performanceFactor > 0.8) {
                currentPotential += (0.05 + (Math.random() * 0.05));
            }
            newDriver.potential = parseFloat(Math.max(1, Math.min(10, currentPotential)).toFixed(1));
    
            const attributesToUpdate: (keyof Driver)[] = ['startSkill', 'concentration', 'overtaking', 'experience', 'speed', 'rainSkill', 'setupSkill', 'physical'];
    
            attributesToUpdate.forEach(attr => {
                let currentVal = newDriver[attr] as number;
                
                if (newAge < PEAK_AGE_START) {
                    const gapToPotential = newDriver.potential - currentVal;
                    if (gapToPotential > 0) {
                        const ageFactor = 1 - (newAge / (PEAK_AGE_START + 5));
                        let improvement = gapToPotential * (0.1 + (performanceFactor * 0.1)) * ageFactor;
                        improvement = Math.max(0, improvement);
                        currentVal += improvement;
                    }
                } else if (newAge > PEAK_AGE_END) {
                    const ageFactor = (newAge - PEAK_AGE_END) * 0.05;
                    let decline = (0.2 + ageFactor) * (1 - (performanceFactor * 0.5));
                    decline = Math.max(0.05, decline);
                    currentVal -= decline;
                } else {
                     let change = performanceFactor * 0.2;
                     currentVal += change;
                }
                (newDriver as any)[attr] = parseFloat(Math.max(1, Math.min(10, currentVal)).toFixed(2));
            });
            return newDriver;
        });
    }, []);

    const handleEndSeason = useCallback(() => {
        const seasonData: SeasonHistory = {
            year: settings!.startYear,
            settings: settings!,
            driverChampionId: driverStandings[0].driverId,
            constructorChampionId: constructorStandings[0].teamId,
            drivers,
            teams,
            calendar,
            allRaceResults,
            allQualifyingResults,
            driverStandings,
            constructorStandings,
        };
        saveSeasonToHistory(seasonData);
        setSeasonHistory(prev => [seasonData, ...prev].sort((a,b) => b.year - a.year));
        
        if (settings?.mode === 'owner') {
            let updatedTeams = teams.map(team => {
                const teamDrivers = drivers.filter(d => d.teamId === team.id);
                const driverSalaries = teamDrivers.reduce((sum, d) => sum + d.salary, 0);
                const engine = engineSuppliers.find(e => e.name === team.engineSupplier);
                const engineCost = engine ? engine.cost : 0;
                const totalCost = driverSalaries + engineCost;
                return { ...team, budget: team.budget - totalCost };
            });

            updatedTeams = updatedTeams.map(team => {
                const { aero, chassis, powertrain, reliability } = team.facilities;
                const devPoints = (aero + chassis + powertrain + reliability) / 4;
                const improvementFactor = 0.05 + (devPoints / 20) * 0.1;
                
                const newAero = Math.min(100, team.aerodynamics + (100 - team.aerodynamics) * improvementFactor * (aero/20));
                const newChassisParts = (team.gearbox + team.brakes + team.steering) / 3;
                const newChassis = Math.min(100, newChassisParts + (100 - newChassisParts) * improvementFactor * (chassis/20));
                const newReliability = Math.min(100, team.reliability + (100 - team.reliability) * improvementFactor * (reliability/20));

                return {
                    ...team,
                    aerodynamics: parseFloat(newAero.toFixed(1)),
                    gearbox: parseFloat(newChassis.toFixed(1)),
                    brakes: parseFloat(newChassis.toFixed(1)),
                    steering: parseFloat(newChassis.toFixed(1)),
                    reliability: parseFloat(newReliability.toFixed(1)),
                };
            });
            setTeams(updatedTeams);
        }

        const progressedDrivers = progressDrivers(drivers, driverStandings, calendar.length);
        setDrivers(progressedDrivers);
        setAppState(AppState.OffSeason);
    }, [drivers, teams, calendar, settings, driverStandings, constructorStandings, allRaceResults, allQualifyingResults, progressDrivers, engineSuppliers]);

    // NEW: File-based saving
    const handleSaveSimulation = useCallback(() => {
        if (!settings) {
            alert(t('saveError_noSettings'));
            return;
        }

        try {
            const raceName = calendar[currentRaceIndex] ? calendar[currentRaceIndex].name : t('seasonFinale');
            const safeRaceName = raceName.replace(/[^a-z0-9_-\s]/gi, '_').trim();
            const fileName = `FR1_Season_${settings.startYear}_Race_${currentRaceIndex + 1}.json`;
            
            const saveData: SaveData = {
                id: `${settings.startYear}-${currentRaceIndex}-${new Date().getTime()}`,
                name: fileName,
                savedAt: new Date().toISOString(),
                settings,
                currentRaceIndex,
                allRaceResults,
                allQualifyingResults,
                driverStandings,
                constructorStandings,
                drivers,
                teams,
                calendar,
                engineSuppliers,
                news,
                skin,
                customCountries,
            };
            
            // Export as file
            const jsonString = JSON.stringify(saveData, null, 2);
            const blob = new Blob([jsonString], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = fileName;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);

            // Also update "Continue" state
            saveSimulation(saveData);
            setHasSaves(true);

        } catch (error) {
            console.error("Failed to save simulation:", error);
            alert(t('unknownError'));
        }
    }, [settings, currentRaceIndex, allRaceResults, allQualifyingResults, driverStandings, constructorStandings, drivers, teams, calendar, engineSuppliers, news, skin, customCountries, t]);
    
    const loadStateFromSave = (saveData: SaveData) => {
        if (!saveData.settings || !saveData.drivers || !saveData.calendar || !saveData.teams) {
            throw new Error(t('loadError_invalidFile'));
        }

        setSettings(saveData.settings);
        setCurrentRaceIndex(saveData.currentRaceIndex);
        setAllRaceResults(saveData.allRaceResults || []);
        setAllQualifyingResults(saveData.allQualifyingResults || []);
        setDriverStandings(saveData.driverStandings || []);
        setConstructorStandings(saveData.constructorStandings || []);
        setDrivers(saveData.drivers);
        setTeams(saveData.teams);
        setCalendar(saveData.calendar);
        setEngineSuppliers(saveData.engineSuppliers || ENGINE_SUPPLIERS);
        setNews(saveData.news || []);
        setSkin(saveData.skin || DEFAULT_SKIN);
        setCustomCountries(saveData.customCountries || []);
        
        setError(null);
        setSimulationStatus('idle');
        setQualifyingResults(null);
        setQualifyingData(null);
        setRaceState(null);
        setRaceHistory([]);
        setCommentary('');
        setIsPaused(false);
        lastCommentaryLapRef.current = 0;
        setDeterminedWeather(null);
        
        setAppState(AppState.Simulation);
    };

    const handleFileImport = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const text = e.target?.result as string;
                const saveData = JSON.parse(text);
                loadStateFromSave(saveData);
            } catch (err) {
                alert(t('unknownError'));
            } finally {
                if (event.target) event.target.value = '';
            }
        };
        reader.readAsText(file);
    };

    const handleContinue = () => {
        const latestSaves = getSavedSimulations();
        if (latestSaves[0]) {
            loadStateFromSave(latestSaves[0]);
        }
    };
    
    const handleSimulateQualifying = useCallback(async () => {
        if (!settings || isLoading || currentRaceIndex >= calendar.length) return;
    
        setIsLoading(true);
        setError(null);
        setQualifyingData(null);
        setQualifyingResults(null);
        setSimulationStatus('qualifying');
    
        try {
            const currentRaceInfo = calendar[currentRaceIndex];
            const weatherForSession = determineWeather(currentRaceInfo.weatherChances);
            setDeterminedWeather(weatherForSession);
    
            const allQualiData = runFullQualifyingSimulation(drivers, teams, currentRaceInfo, weatherForSession, engineSuppliers);
            const delay = simulationMode === 'single' ? 3000 : 50;

            await new Promise(resolve => setTimeout(resolve, 100));
            setQualifyingData({ q1: allQualiData.q1, q2: [], q3: [] });
            await new Promise(resolve => setTimeout(resolve, delay));
            setQualifyingData(prev => ({ ...prev!, q2: allQualiData.q2 }));
            await new Promise(resolve => setTimeout(resolve, delay));
            setQualifyingData(prev => ({ ...prev!, q3: allQualiData.q3 }));
            await new Promise(resolve => setTimeout(resolve, delay));
    
            setQualifyingResults(allQualiData.finalGrid);
            setAllQualifyingResults(prev => [...prev, allQualiData.finalGrid]);
            setSimulationStatus('pre-race');
        } catch (err) {
            console.error("Qualifying simulation failed:", err);
            setError(t('unknownError'));
            setSimulationStatus('idle');
            setIsSeasonSimRunning(false);
            setSimulationMode('single');
        } finally {
            setIsLoading(false);
        }
    }, [settings, isLoading, currentRaceIndex, drivers, teams, calendar, engineSuppliers, t, simulationMode]);

    const handleStartRace = useCallback((strategies: { driverId: number; startingTyre: TyreCompound; }[], startingWeather: WeatherCondition) => {
        if (!qualifyingResults || !calendar[currentRaceIndex]) return;
        
        const initialDriversState: LiveDriverState[] = qualifyingResults.map((q, index) => {
            const strategy = strategies.find(s => s.driverId === q.driverId);
            const startingTyre = strategy ? strategy.startingTyre : TyreCompound.Medium;

            return {
                driverId: q.driverId,
                position: index + 1,
                totalTime: index * 0.2,
                lastLapTime: 0,
                bestLapTime: 999,
                gapToLeader: index === 0 ? '0.000' : `+${(index * 0.2).toFixed(3)}`,
                gapToAhead: index === 0 ? '0.000' : `+0.200`,
                currentTyres: { compound: startingTyre, wear: 0, age: 0 },
                pitStops: 0,
                status: 'RACING',
                activeIncident: null,
            };
        });

        const initialRaceState: RaceState = {
            currentLap: 0,
            totalLaps: calendar[currentRaceIndex].laps,
            drivers: initialDriversState,
            currentWeather: startingWeather,
            isSafetyCarDeployed: false,
            safetyCarLapsRemaining: 0,
        };

        setRaceState(initialRaceState);
        setRaceHistory([initialRaceState]);
        setCommentary(`[${t('lap')} 0] ${getRaceStartCommentary(language)}`);
        setSimulationStatus('race');
        setIsPaused(false);
        setQualifyingData(null);
    }, [qualifyingResults, currentRaceIndex, calendar, t, language]);

    const processRaceFinish = useCallback((finalState: RaceState) => {
        if (!settings) return;
        const scoringSystem = SCORING_SYSTEMS.find(s => s.id === settings.scoringSystemId)?.points;
        if (!scoringSystem) return;

        const raceFinishers = finalState.drivers.filter(d => d.status !== 'DNF').sort((a, b) => a.totalTime - b.totalTime);
        const dnfDrivers = finalState.drivers.filter(d => d.status === 'DNF');
        
        let raceResultsWithPoints: RaceResult[] = [];
        const fastestLapTime = Math.min(...raceFinishers.map(d => d.bestLapTime));
        const finalResults = [...raceFinishers, ...dnfDrivers];

        finalResults.forEach((driverState, index) => {
            let position = driverState.status === 'DNF' ? 0 : index + 1;
            let points = 0;
            if (position > 0 && position <= scoringSystem.length) {
                points = scoringSystem[position - 1];
            }
            const hasFastestLap = driverState.bestLapTime === fastestLapTime && position > 0;
            
            raceResultsWithPoints.push({
                driverId: driverState.driverId,
                position: position,
                fastestLap: hasFastestLap,
                points: points,
                pitStops: driverState.pitStops,
                bestLapTime: formatTime(driverState.bestLapTime),
                dnfReason: driverState.dnfReason,
            });
        });
        
        setAllRaceResults(prev => [...prev, raceResultsWithPoints]);
        
        if (settings.mode === 'owner') {
            setTeams(currentTeams => {
                const updatedTeams = [...currentTeams];
                raceResultsWithPoints.forEach(result => {
                    const driver = drivers.find(d => d.id === result.driverId);
                    if (driver) {
                        const team = updatedTeams.find(t => t.id === driver.teamId);
                        if (team && result.position > 0) {
                            team.budget += PRIZE_MONEY[result.position - 1] || 0;
                        }
                    }
                });
                return updatedTeams;
            });
        }

        const newDriverStandings = [...driverStandings];
        raceResultsWithPoints.forEach(result => {
            const standing = newDriverStandings.find(s => s.driverId === result.driverId);
            if (standing) standing.points += result.points;
        });
        newDriverStandings.sort((a, b) => b.points - a.points);
        setDriverStandings(newDriverStandings);

        const newConstructorStandings = [...constructorStandings];
        raceResultsWithPoints.forEach(result => {
            const driver = drivers.find(d => d.id === result.driverId);
            if (driver) {
                const standing = newConstructorStandings.find(s => s.teamId === driver.teamId);
                if (standing) standing.points += result.points;
            }
        });
        newConstructorStandings.sort((a, b) => b.points - a.points);
        setConstructorStandings(newConstructorStandings);

        const articles = generateRaceNews(raceResultsWithPoints, drivers, teams, calendar[currentRaceIndex], currentRaceIndex, settings.startYear, newDriverStandings, language);
        setNews(prev => [...prev, ...articles]);
        
        setCurrentRaceIndex(prev => prev + 1);
        setSimulationStatus('finished');
        setDeterminedWeather(null);
    }, [settings, drivers, teams, calendar, currentRaceIndex, driverStandings, constructorStandings, t, language]);

    const handlePauseToggle = useCallback(() => {
        setIsPaused(prev => !prev);
    }, []);

    useEffect(() => {
        if (simulationStatus !== 'race' || !raceState || isPaused) {
            if(simulationIntervalRef.current) clearInterval(simulationIntervalRef.current);
            return;
        }
        
        const intervalDelay = simulationMode === 'single' ? (1000 / simulationSpeed) : 10;

        simulationIntervalRef.current = window.setInterval(() => {
            setRaceState(prevState => {
                if (!prevState || prevState.currentLap >= prevState.totalLaps) {
                    if(simulationIntervalRef.current) clearInterval(simulationIntervalRef.current);
                    if(prevState) {
                        const finalState = {...prevState, flag: 'checkered' as const};
                        setRaceHistory(prev => [...prev, finalState]);
                        processRaceFinish(finalState);
                    }
                    return null;
                }

                const currentRace = calendar[currentRaceIndex];
                const newLap = prevState.currentLap + 1;
                let nextFlag = prevState.flag;
                let nextSC_Deployed = prevState.isSafetyCarDeployed ?? false;
                let nextSC_Laps = prevState.safetyCarLapsRemaining ?? 0;
                let nextSC_WasDeployedThisLap = false;
                let newComment: string | null = null;

                const newWeather = getNextWeatherState(prevState.currentWeather, currentRace.weatherChances);
                if (newWeather !== prevState.currentWeather) {
                    newComment = getWeatherChangeCommentary(newWeather, language);
                }

                if (nextSC_Deployed) {
                    nextSC_Laps = nextSC_Laps - 1;
                    if (nextSC_Laps === 1) newComment = getSafetyCarInCommentary(language);
                    if (nextSC_Laps <= 0) {
                        nextSC_Deployed = false;
                        nextFlag = 'green';
                        newComment = getGreenFlagCommentary(language);
                    }
                } else if (prevState.flag === 'yellow' || prevState.flag === 'red') {
                    nextFlag = 'green';
                    newComment = getGreenFlagCommentary(language);
                }
                
                const intermediateDriverStates = prevState.drivers.map(ds => {
                    const driver = drivers.find(d => d.id === ds.driverId)!;
                    const team = teams.find(t => t.id === driver.teamId)!;
                    if (ds.status === 'DNF') return ds;
                    if (ds.status === 'RACING' && shouldDriverPit(ds, driver, { ...prevState, currentWeather: newWeather })) {
                        const nextTyre = chooseNextTyre(ds, { ...prevState, currentWeather: newWeather });
                        return { ...ds, status: 'PITTING' as 'PITTING', totalTime: ds.totalTime + 22, pitStops: ds.pitStops + 1, currentTyres: { compound: nextTyre, wear: 0, age: 0 } };
                    }
                    const baseTime = parseTimeToSeconds(currentRace.baseLapTime);
                    let lapTime = baseTime + (Math.random() - 0.5) * 2;
                    const newTotalTime = ds.totalTime + lapTime;
                    const tyreInfo = TYRE_COMPOUNDS[ds.currentTyres.compound];
                    const newWear = ds.currentTyres.wear + tyreInfo.degradation * 100 / currentRace.laps;
                    const dnfChance = (100 - team.reliability) * 0.0001;
                    if (Math.random() < dnfChance) {
                        return {...ds, status: 'DNF' as 'DNF', lastLapTime: 0, dnfReason: getRandomDnfReason(language) };
                    }
                    return { ...ds, totalTime: newTotalTime, lastLapTime: lapTime, bestLapTime: Math.min(ds.bestLapTime, lapTime), currentTyres: { ...ds.currentTyres, wear: newWear, age: ds.currentTyres.age + 1 }, status: 'RACING' as 'RACING' };
                });
                
                let racingDrivers = intermediateDriverStates.filter(d => d.status !== 'DNF').sort((a, b) => a.totalTime - b.totalTime);
                const dnfDrivers = intermediateDriverStates.filter(d => d.status === 'DNF');
                const finalDriverStates = [...racingDrivers.map((ds, idx, arr) => ({
                    ...ds, position: idx + 1,
                    gapToLeader: idx > 0 ? `+${(ds.totalTime - arr[0].totalTime).toFixed(3)}` : '0.000',
                    gapToAhead: idx > 0 ? `+${(ds.totalTime - arr[idx - 1].totalTime).toFixed(3)}` : '0.000',
                })), ...dnfDrivers.map(ds => ({ ...ds, position: 0, gapToLeader: '', gapToAhead: '' }))];
                
                const nextState: RaceState = {
                    currentLap: newLap,
                    totalLaps: prevState.totalLaps,
                    drivers: finalDriverStates,
                    currentWeather: newWeather,
                    flag: nextFlag,
                    isSafetyCarDeployed: nextSC_Deployed,
                    safetyCarLapsRemaining: nextSC_Laps,
                };
                setRaceHistory(prev => [...prev, nextState]);
                if(newComment) setCommentary(`[${t('lap')} ${newLap}] ${newComment}`);
                return nextState;
            });
        }, intervalDelay);

        return () => { if (simulationIntervalRef.current) clearInterval(simulationIntervalRef.current); };
    }, [isPaused, simulationStatus, raceState, calendar, currentRaceIndex, drivers, teams, processRaceFinish, simulationSpeed, engineSuppliers, t, language, simulationMode]);

    useEffect(() => {
        if (simulationStatus === 'pre-race' && ['weekend', 'season'].includes(simulationMode)) {
            const strategies = qualifyingResults!.map(q => ({ driverId: q.driverId, startingTyre: TyreCompound.Medium }));
            handleStartRace(strategies, determinedWeather!);
        }
    }, [simulationStatus, simulationMode, qualifyingResults, determinedWeather, handleStartRace]);
    
    useEffect(() => {
        const seasonOver = currentRaceIndex >= calendar.length;
        if (simulationStatus === 'finished' && simulationMode === 'season' && isSeasonSimRunning && !seasonOver) {
             const timer = setTimeout(() => { handleSimulateQualifying(); }, 1000);
             return () => clearTimeout(timer);
        }
        if (seasonOver || (simulationStatus === 'finished' && !isSeasonSimRunning)) {
            setSimulationMode('single');
            setIsSeasonSimRunning(false);
        }
    }, [simulationStatus, simulationMode, isSeasonSimRunning, currentRaceIndex, calendar.length, handleSimulateQualifying]);
    
    const handleSimulateWeekend = () => { setSimulationMode('weekend'); handleSimulateQualifying(); };
    const handleSimulateSeason = () => { setIsSeasonSimRunning(true); setSimulationMode('season'); handleSimulateQualifying(); };
    const handleStopSeasonSim = () => { setIsSeasonSimRunning(false); setSimulationMode('single'); };

    const goToMainMenu = () => {
        if (simulationIntervalRef.current) clearInterval(simulationIntervalRef.current);
        setIsSeasonSimRunning(false);
        setSimulationMode('single');
        setAppState(AppState.MainMenu);
    };

    const handleLogoClick = () => {
        if (appState === AppState.MainMenu) return;
        if (appState === AppState.Simulation && (simulationStatus !== 'idle' || currentRaceIndex > 0)) {
            if (window.confirm(t('confirm_backToMenu_unsaved'))) goToMainMenu();
        } else {
            goToMainMenu();
        }
    };

    const renderContent = () => {
        switch (appState) {
            case AppState.Settings:
                return <SettingsScreen settings={settings} onStartSeason={startNewSeason} onBackToMenu={() => setAppState(AppState.MainMenu)} />;
            case AppState.Edit:
                return <EditMenu drivers={drivers} teams={teams} calendar={calendar} engineSuppliers={engineSuppliers} customCountries={customCountries} setDrivers={setDrivers} setTeams={setTeams} setCalendar={setCalendar} setEngineSuppliers={setEngineSuppliers} setCustomCountries={handleCustomCountriesChange} onBackToMenu={() => setAppState(AppState.MainMenu)} hidePotential={hidePotential} setHidePotential={setHidePotential} onRandomizeAllPotentials={randomizeAllDriverPotentials} />;
            case AppState.TeamOwnerSetup:
                return <TeamSelectionScreen teams={teams} onSelect={(id) => { setSettings({ startYear: new Date().getFullYear(), scoringSystemId: 1, mode: 'owner', playerTeamId: id }); setAppState(AppState.Settings); }} onBack={goToMainMenu} />;
            case AppState.RegulationChanges:
                return <RegulationChangesScreen proposals={regulationProposals} year={settings!.startYear} onConfirm={handleConfirmRegulations} />;
            case AppState.OffSeason:
                 return <EditMenu drivers={drivers} teams={teams} calendar={calendar} engineSuppliers={engineSuppliers} customCountries={customCountries} setDrivers={setDrivers} setTeams={setTeams} setCalendar={setCalendar} setEngineSuppliers={setEngineSuppliers} setCustomCountries={handleCustomCountriesChange} onBackToMenu={handleStartNextSeason} isOffSeason={true} hidePotential={hidePotential} setHidePotential={setHidePotential} onRandomizeAllPotentials={randomizeAllDriverPotentials} />;
            case AppState.Simulation:
                return (
                    <SimulationScreen
                        settings={settings!}
                        currentRaceIndex={currentRaceIndex}
                        calendar={calendar}
                        drivers={drivers}
                        teams={teams}
                        engineSuppliers={engineSuppliers}
                        customCountries={customCountries}
                        setTeams={setTeams}
                        driverStandings={driverStandings}
                        constructorStandings={constructorStandings}
                        lastRaceResults={allRaceResults[allRaceResults.length - 1] || null}
                        allRaceResults={allRaceResults}
                        allQualifyingResults={allQualifyingResults}
                        qualifyingResults={qualifyingResults}
                        qualifyingData={qualifyingData}
                        news={news}
                        history={seasonHistory}
                        onSimulateQualifying={handleSimulateQualifying}
                        onSimulateWeekend={handleSimulateWeekend}
                        onSimulateSeason={handleSimulateSeason}
                        onStopSeasonSim={handleStopSeasonSim}
                        isSeasonSimRunning={isSeasonSimRunning}
                        onStartRace={handleStartRace}
                        isLoading={isLoading}
                        error={error}
                        onBackToMenu={goToMainMenu}
                        onEndSeason={handleEndSeason}
                        simulationStatus={simulationStatus}
                        raceState={raceState}
                        raceHistory={raceHistory}
                        simulationSpeed={simulationSpeed}
                        onSetSimulationSpeed={setSimulationSpeed}
                        isPaused={isPaused}
                        onPauseToggle={handlePauseToggle}
                        commentary={commentary}
                        onSaveSimulation={handleSaveSimulation}
                        determinedWeather={determinedWeather}
                    />
                );
            case AppState.MainMenu:
            default:
                return <MainMenu
                    onStart={() => { setSettings({ startYear: new Date().getFullYear(), scoringSystemId: 1, mode: 'spectator', playerTeamId: null }); setAppState(AppState.Settings); }}
                    onEdit={() => setAppState(AppState.Edit)}
                    onLoad={() => loadFileInputRef.current?.click()}
                    onContinue={handleContinue}
                    onStartOwnerMode={() => setAppState(AppState.TeamOwnerSetup)}
                    hasSaves={hasSaves}
                />;
        }
    };

    return (
        <div className="flex flex-col h-full w-full overflow-hidden">
            <input type="file" accept=".json" className="hidden" ref={loadFileInputRef} onChange={handleFileImport} />
            {isSettingsPanelOpen && <SettingsPanel isOpen={isSettingsPanelOpen} onClose={() => setIsSettingsPanelOpen(false)} language={language} onLanguageChange={setLanguage} skin={skin} onSkinChange={setSkin} userSkins={userSkins} setUserSkins={setUserSkins} availableSkins={[...DEFAULT_SKINS, ...userSkins]} />}
            <header className="flex-shrink-0 flex justify-between items-center p-4 sm:px-8 border-b border-white/5 bg-[#15141f]">
                <button onClick={handleLogoClick} className="transition-transform duration-200 hover:scale-105"><img src={skin.logoSvg} alt="Formula Racing 1" className="h-8" /></button>
                <button onClick={() => setIsSettingsPanelOpen(true)} className="p-2 text-slate-400 hover:text-white transition-colors rounded-full hover:bg-white/5"><Cog8ToothIcon className="w-6 h-6"/></button>
            </header>
            <main className="flex-1 overflow-auto p-4 sm:p-6 w-full max-w-[1600px] mx-auto">{renderContent()}</main>
        </div>
    );
};

export default App;
