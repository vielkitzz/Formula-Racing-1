
// FIX: Import TranslationKey for type safety with i18n keys.
import { TranslationKey } from './i18n';

export enum AppState {
    MainMenu,
    Settings,
    Simulation,
    Edit,
    OffSeason,
    LoadGame,
    RegulationChanges,
    TeamOwnerSetup,
}

export interface Country {
    code: string;
    name: string;
    isCustom?: boolean;
    flagUrl?: string; // Base64 for custom countries
}

export interface Driver {
    id: number;
    name: string;
    teamId: number;
    // Novas habilidades (1-10)
    startSkill: number;
    concentration: number;
    overtaking: number;
    experience: number;
    speed: number;
    rainSkill: number;
    setupSkill: number;
    physical: number;
    // Potencial (0.0 - 10.0)
    potential: number;
    age: number;
    nationality: string; // Country code e.g., 'GB'
    photoUrl?: string;
    salary: number; // Yearly salary
    contractEndsYear: number;
}

export interface Team {
    id: number;
    name: string;
    aerodynamics: number; // 50-100
    gearbox: number; // 50-100
    brakes: number; // 50-100
    electricalSystem: number; // 50-100
    steering: number; // 50-100
    engineSupplier: string; // Name of supplier
    reliability: number; // Fiabilidade: 50-100
    primaryColor: string; // e.g., "#00D2BE" for Mercedes primary
    accentColor: string; // e.g., "#FFFFFF" for Mercedes accent
    logoUrl?: string;
    budget: number; // Team budget in millions
    facilities: {
        aero: number; // Level 1-20
        chassis: number; // Level 1-20
        powertrain: number; // Level 1-20
        reliability: number; // Level 1-20
    };
}

export type WeatherCondition = 'Dry' | 'LightRain' | 'HeavyRain';

export interface Race {
    name: string;
    country: string;
    countryCode: string;
    laps: number;
    baseLapTime: string; // format "1:30.252"
    weatherChances: {
        Dry: number; // 0.0 to 1.0
        LightRain: number;
        HeavyRain: number;
    };
}

export interface ScoringSystem {
    id: number;
    // FIX: Changed name from string to TranslationKey for type safety.
    name: TranslationKey;
    points: number[]; // e.g., [25, 18, 15, ...]
}

export interface SeasonSettings {
    startYear: number;
    scoringSystemId: number;
    mode: 'spectator' | 'owner';
    playerTeamId: number | null;
}

export interface QualifyingResult {
    driverId: number;
    position: number;
    lapTime: string; // e.g., "1:28.123"
    lapTimeInSeconds?: number;
    eliminatedIn?: 'Q1' | 'Q2';
    status?: 'Qualified' | 'DNQ'; // Did not qualify (107% rule)
}

export interface QualifyingData {
    q1: QualifyingResult[];
    q2: QualifyingResult[];
    q3: QualifyingResult[];
}


export interface RaceResult {
    driverId: number;
    position: number; // 0 para DNF
    fastestLap: boolean;
    points: number;
    pitStops: number;
    bestLapTime: string;
    dnfReason?: string;
}

export interface DriverStanding {
    driverId: number;
    points: number;
}

export interface ConstructorStanding {
    teamId: number;
    points: number;
}

// Types for Live Simulation Engine
export enum TyreCompound {
    Soft = 'Soft',
    Medium = 'Medium',
    Hard = 'Hard',
    Intermediate = 'Intermediate',
    Wet = 'Wet',
}

export interface Tyre {
    compound: TyreCompound;
    wear: number; // 0-100
    age: number; // laps
}

export enum IncidentType {
    FrontWingDamage = 'FrontWingDamage',
    ElectronicGlitch = 'ElectronicGlitch',
    LockUp = 'LockUp',
    GearboxSyncIssue = 'GearboxSyncIssue',
}

export interface Incident {
    type: IncidentType;
    lapsRemaining: number;
    performancePenalty: number; // in seconds per lap
}

export interface LiveDriverState {
    driverId: number;
    position: number;
    totalTime: number; // in seconds
    lastLapTime: number; // in seconds
    bestLapTime: number; // in seconds
    gapToLeader: string;
    gapToAhead: string;
    currentTyres: Tyre;
    pitStops: number;
    status: 'RACING' | 'PITTING' | 'DNF';
    dnfReason?: string;
    activeIncident: Incident | null;
}

export interface RaceState {
    currentLap: number;
    totalLaps: number;
    drivers: LiveDriverState[];
    currentWeather: WeatherCondition;
    flag?: 'green' | 'yellow' | 'red' | 'checkered';
    isSafetyCarDeployed?: boolean;
    safetyCarLapsRemaining?: number;
    scWasDeployedThisLap?: boolean; // Used to bunch up cars only once
}

export interface EngineSupplier {
    name: string;
    performance: number; // 50-100
    cost: number; // Yearly cost in millions
}

export interface NewsArticle {
    id: string;
    raceIndex: number;
    headline: string;
    body: string;
    date: string;
}

export interface AppSkin {
    id: string;
    name: string;
    isEditable?: boolean;
    colors: {
        bgMain: string;
        bgPanel: string;
        textPrimary: string;
        textSecondary: string;
        accentRed: string;
        accentGreen: string;
        borderColor: string;
    };
    logoSvg: string;
    fontFamily: string;
}

export interface SaveData {
    id: string;
    name: string;
    savedAt: string;
    settings: SeasonSettings;
    currentRaceIndex: number;
    allRaceResults: RaceResult[][];
    allQualifyingResults: QualifyingResult[][];
    driverStandings: DriverStanding[];
    constructorStandings: ConstructorStanding[];
    drivers: Driver[];
    teams: Team[];
    calendar: Race[];
    engineSuppliers: EngineSupplier[];
    news: NewsArticle[];
    skin: AppSkin;
    customCountries?: Country[];
}

export interface RegulationChangeProposal {
    id: string;
    titleKey: TranslationKey;
    descriptionKey: TranslationKey;
    getEffect: () => (current: { teams: Team[], engineSuppliers: EngineSupplier[] }) => { teams: Team[], engineSuppliers: EngineSupplier[] };
}

export interface SeasonHistory {
    year: number;
    settings: SeasonSettings;
    driverChampionId: number;
    constructorChampionId: number;
    drivers: Driver[];
    teams: Team[];
    calendar: Race[];
    allRaceResults: RaceResult[][];
    allQualifyingResults: QualifyingResult[][];
    driverStandings: DriverStanding[];
    constructorStandings: ConstructorStanding[];
}
