
import { Driver, Team, Race, ScoringSystem, TyreCompound, EngineSupplier, AppSkin } from './types';

export const COUNTRIES = [
    { code: 'AF', name: 'Afeganistão' },
    { code: 'AL', name: 'Albânia' },
    { code: 'DZ', name: 'Argélia' },
    { code: 'AD', name: 'Andorra' },
    { code: 'AO', name: 'Angola' },
    { code: 'AR', name: 'Argentina' },
    { code: 'AU', name: 'Austrália' },
    { code: 'AT', name: 'Áustria' },
    { code: 'AZ', name: 'Azerbaijão' },
    { code: 'BH', name: 'Bahrein' },
    { code: 'BE', name: 'Bélgica' },
    { code: 'BR', name: 'Brasil' },
    { code: 'CA', name: 'Canadá' },
    { code: 'CL', name: 'Chile' },
    { code: 'CN', name: 'China' },
    { code: 'CO', name: 'Colômbia' },
    { code: 'HR', name: 'Croácia' },
    { code: 'CZ', name: 'República Tcheca' },
    { code: 'DK', name: 'Dinamarca' },
    { code: 'EG', name: 'Egito' },
    { code: 'EE', name: 'Estônia' },
    { code: 'FI', name: 'Finlândia' },
    { code: 'FR', name: 'França' },
    { code: 'DE', name: 'Alemanha' },
    { code: 'GR', name: 'Grécia' },
    { code: 'HU', name: 'Hungria' },
    { code: 'IN', name: 'Índia' },
    { code: 'ID', name: 'Indonésia' },
    { code: 'IE', name: 'Irlanda' },
    { code: 'IT', name: 'Itália' },
    { code: 'JP', name: 'Japão' },
    { code: 'LV', name: 'Letônia' },
    { code: 'LT', name: 'Lituânia' },
    { code: 'LU', name: 'Luxemburgo' },
    { code: 'MY', name: 'Malásia' },
    { code: 'MX', name: 'México' },
    { code: 'MC', name: 'Mônaco' },
    { code: 'MA', name: 'Marrocos' },
    { code: 'NL', name: 'Holanda' },
    { code: 'NZ', name: 'Nova Zelândia' },
    { code: 'NG', name: 'Nigéria' },
    { code: 'NO', name: 'Noruega' },
    { code: 'PL', name: 'Polônia' },
    { code: 'PT', name: 'Portugal' },
    { code: 'QA', name: 'Catar' },
    { code: 'RO', name: 'Romênia' },
    { code: 'RU', name: 'Rússia' },
    { code: 'SA', name: 'Arábia Saudita' },
    { code: 'RS', name: 'Sérvia' },
    { code: 'SG', name: 'Singapura' },
    { code: 'SK', name: 'Eslováquia' },
    { code: 'SI', name: 'Eslovênia' },
    { code: 'ZA', name: 'África do Sul' },
    { code: 'KR', name: 'Coreia do Sul' },
    { code: 'ES', name: 'Espanha' },
    { code: 'SE', name: 'Suécia' },
    { code: 'CH', name: 'Suíça' },
    { code: 'TH', name: 'Tailândia' },
    { code: 'TR', name: 'Turquia' },
    { code: 'UA', name: 'Ucrânia' },
    { code: 'AE', name: 'Emirados Árabes Unidos' },
    { code: 'GB', name: 'Reino Unido' },
    { code: 'US', name: 'Estados Unidos' },
    { code: 'UY', name: 'Uruguai' },
    { code: 'VE', name: 'Venezuela' },
];

export const ENGINE_SUPPLIERS: EngineSupplier[] = [
    { name: "Mercedes", performance: 98, cost: 20 },
    { name: "Ferrari", performance: 96, cost: 19 },
    { name: "Red Bull Powertrains", performance: 99, cost: 22 },
    { name: "Renault", performance: 92, cost: 15 },
];

export const TEAMS: Team[] = [
    { id: 1, name: "Mercedes-AMG Petronas", nationality: "DE", aerodynamics: 92, gearbox: 97, brakes: 96, electricalSystem: 98, steering: 95, reliability: 95, engineSupplier: "Mercedes", primaryColor: "#00D2BE", accentColor: "#FFFFFF", logoUrl: "https://www.formula1.com/content/dam/fom-website/teams/2024/mercedes-logo.png.transform/2col/image.png", budget: 350, facilities: { aero: 18, chassis: 17, powertrain: 19, reliability: 18 } },
    { id: 2, name: "Oracle Red Bull Racing", nationality: "AT", aerodynamics: 98, gearbox: 96, brakes: 97, electricalSystem: 94, steering: 96, reliability: 93, engineSupplier: "Red Bull Powertrains", primaryColor: "#060021", accentColor: "#FF0000", logoUrl: "https://www.formula1.com/content/dam/fom-website/teams/2024/red-bull-racing-logo.png.transform/2col/image.png", budget: 400, facilities: { aero: 20, chassis: 18, powertrain: 18, reliability: 16 } },
    { id: 3, name: "Scuderia Ferrari", nationality: "IT", aerodynamics: 95, gearbox: 94, brakes: 95, electricalSystem: 92, steering: 93, reliability: 88, engineSupplier: "Ferrari", primaryColor: "#DC0000", accentColor: "#FFEB00", logoUrl: "https://www.formula1.com/content/dam/fom-website/teams/2024/ferrari-logo.png.transform/2col/image.png", budget: 380, facilities: { aero: 19, chassis: 17, powertrain: 19, reliability: 14 } },
    { id: 4, name: "McLaren Formula 1 Team", nationality: "GB", aerodynamics: 90, gearbox: 92, brakes: 90, electricalSystem: 91, steering: 90, reliability: 91, engineSupplier: "Mercedes", primaryColor: "#FF8700", accentColor: "#4E4E4E", logoUrl: "https://www.formula1.com/content/dam/fom-website/teams/2024/mclaren-logo.png.transform/2col/image.png", budget: 250, facilities: { aero: 16, chassis: 15, powertrain: 15, reliability: 15 } },
    { id: 5, name: "Aston Martin F1 Team", nationality: "GB", aerodynamics: 88, gearbox: 93, brakes: 89, electricalSystem: 90, steering: 88, reliability: 94, engineSupplier: "Mercedes", primaryColor: "#006F62", accentColor: "#BDFF00", logoUrl: "https://www.formula1.com/content/dam/fom-website/teams/2024/aston-martin-logo.png.transform/2col/image.png", budget: 220, facilities: { aero: 15, chassis: 14, powertrain: 14, reliability: 17 } },
    { id: 6, name: "BWT Alpine F1 Team", nationality: "FR", aerodynamics: 85, gearbox: 86, brakes: 85, electricalSystem: 87, steering: 84, reliability: 85, engineSupplier: "Renault", primaryColor: "#0090FF", accentColor: "#FF87BC", logoUrl: "https://www.formula1.com/content/dam/fom-website/teams/2024/alpine-logo.png.transform/2col/image.png", budget: 200, facilities: { aero: 13, chassis: 12, powertrain: 14, reliability: 12 } },
    { id: 7, name: "Williams Racing", nationality: "GB", aerodynamics: 80, gearbox: 88, brakes: 82, electricalSystem: 85, steering: 83, reliability: 89, engineSupplier: "Mercedes", primaryColor: "#005AFF", accentColor: "#00A3E0", logoUrl: "https://www.formula1.com/content/dam/fom-website/teams/2024/williams-logo.png.transform/2col/image.png", budget: 150, facilities: { aero: 10, chassis: 11, powertrain: 10, reliability: 13 } },
    { id: 8, name: "Visa Cash App RB", nationality: "IT", aerodynamics: 82, gearbox: 89, brakes: 84, electricalSystem: 86, steering: 85, reliability: 90, engineSupplier: "Red Bull Powertrains", primaryColor: "#0000FF", accentColor: "#DCDCDC", logoUrl: "https://www.formula1.com/content/dam/fom-website/teams/2024/rb-logo.png.transform/2col/image.png", budget: 180, facilities: { aero: 12, chassis: 13, powertrain: 12, reliability: 14 } },
    { id: 9, name: "Stake F1 Team Kick Sauber", nationality: "CH", aerodynamics: 78, gearbox: 85, brakes: 80, electricalSystem: 83, steering: 81, reliability: 87, engineSupplier: "Ferrari", primaryColor: "#00FF00", accentColor: "#000000", logoUrl: "https://www.formula1.com/content/dam/fom-website/teams/2024/sauber-logo.png.transform/2col/image.png", budget: 160, facilities: { aero: 11, chassis: 10, powertrain: 11, reliability: 11 } },
    { id: 10, name: "Haas F1 Team", nationality: "US", aerodynamics: 76, gearbox: 84, brakes: 79, electricalSystem: 81, steering: 80, reliability: 84, engineSupplier: "Ferrari", primaryColor: "#787878", accentColor: "#B60000", logoUrl: "https://www.formula1.com/content/dam/fom-website/teams/2024/haas-f1-team-logo.png.transform/2col/image.png", budget: 140, facilities: { aero: 9, chassis: 9, powertrain: 9, reliability: 10 } },
];

export const DRIVERS: Driver[] = [
    // Mercedes
    { id: 1, name: "Lewis Hamilton", teamId: 1, age: 39, nationality: 'GB', startSkill: 9, concentration: 10, overtaking: 10, experience: 10, speed: 9, rainSkill: 10, setupSkill: 9, physical: 9, potential: 9.8, salary: 45, contractEndsYear: 2025, photoUrl: "https://www.formula1.com/content/dam/fom-website/drivers/L/LEWHAM01_Lewis_Hamilton/lewham01.png.transform/1col/image.png" },
    { id: 2, name: "George Russell", teamId: 1, age: 26, nationality: 'GB', startSkill: 8, concentration: 8, overtaking: 8, experience: 6, speed: 9, rainSkill: 8, setupSkill: 8, physical: 9, potential: 9.2, salary: 18, contractEndsYear: 2026, photoUrl: "https://www.formula1.com/content/dam/fom-website/drivers/G/GEORUS01_George_Russell/georus01.png.transform/1col/image.png" },
    // Red Bull
    { id: 3, name: "Max Verstappen", teamId: 2, age: 26, nationality: 'NL', startSkill: 9, concentration: 10, overtaking: 10, experience: 8, speed: 10, rainSkill: 10, setupSkill: 8, physical: 10, potential: 9.9, salary: 55, contractEndsYear: 2028, photoUrl: "https://www.formula1.com/content/dam/fom-website/drivers/M/MAXVER01_Max_Verstappen/maxver01.png.transform/1col/image.png" },
    { id: 4, name: "Sergio Pérez", teamId: 2, age: 34, nationality: 'MX', startSkill: 8, concentration: 7, overtaking: 9, experience: 9, speed: 8, rainSkill: 8, setupSkill: 7, physical: 8, potential: 8.5, salary: 15, contractEndsYear: 2025, photoUrl: "https://www.formula1.com/content/dam/fom-website/drivers/S/SERPER01_Sergio_Perez/serper01.png.transform/1col/image.png" },
    // Ferrari
    { id: 5, name: "Charles Leclerc", teamId: 3, age: 26, nationality: 'MC', startSkill: 7, concentration: 8, overtaking: 9, experience: 7, speed: 10, rainSkill: 8, setupSkill: 8, physical: 9, potential: 9.6, salary: 35, contractEndsYear: 2027, photoUrl: "https://www.formula1.com/content/dam/fom-website/drivers/C/CHALEC01_Charles_Leclerc/chalec01.png.transform/1col/image.png" },
    { id: 6, name: "Carlos Sainz Jr.", teamId: 3, age: 29, nationality: 'ES', startSkill: 8, concentration: 9, overtaking: 8, experience: 8, speed: 8, rainSkill: 7, setupSkill: 9, physical: 9, potential: 9.0, salary: 20, contractEndsYear: 2024, photoUrl: "https://www.formula1.com/content/dam/fom-website/drivers/C/CARSAI01_Carlos_Sainz/carsai01.png.transform/1col/image.png" },
    // McLaren
    { id: 7, name: "Lando Norris", teamId: 4, age: 24, nationality: 'GB', startSkill: 8, concentration: 9, overtaking: 8, experience: 6, speed: 9, rainSkill: 9, setupSkill: 8, physical: 8, potential: 9.5, salary: 25, contractEndsYear: 2027, photoUrl: "https://www.formula1.com/content/dam/fom-website/drivers/L/LANNOR01_Lando_Norris/lannor01.png.transform/1col/image.png" },
    { id: 8, name: "Oscar Piastri", teamId: 4, age: 23, nationality: 'AU', startSkill: 9, concentration: 8, overtaking: 7, experience: 4, speed: 9, rainSkill: 7, setupSkill: 7, physical: 8, potential: 9.7, salary: 8, contractEndsYear: 2026, photoUrl: "https://www.formula1.com/content/dam/fom-website/drivers/O/OSCPIA01_Oscar_Piastri/oscpia01.png.transform/1col/image.png" },
    // Aston Martin
    { id: 9, name: "Fernando Alonso", teamId: 5, age: 42, nationality: 'ES', startSkill: 10, concentration: 10, overtaking: 10, experience: 10, speed: 8, rainSkill: 9, setupSkill: 10, physical: 9, potential: 9.7, salary: 24, contractEndsYear: 2026, photoUrl: "https://www.formula1.com/content/dam/fom-website/drivers/F/FERALO01_Fernando_Alonso/feralo01.png.transform/1col/image.png" },
    { id: 10, name: "Lance Stroll", teamId: 5, age: 25, nationality: 'CA', startSkill: 7, concentration: 6, overtaking: 7, experience: 7, speed: 7, rainSkill: 8, setupSkill: 6, physical: 7, potential: 8.2, salary: 5, contractEndsYear: 2025, photoUrl: "https://www.formula1.com/content/dam/fom-website/drivers/L/LANSTR01_Lance_Stroll/lanstr01.png.transform/1col/image.png" },
    // Alpine
    { id: 11, name: "Esteban Ocon", teamId: 6, age: 27, nationality: 'FR', startSkill: 7, concentration: 8, overtaking: 8, experience: 7, speed: 8, rainSkill: 7, setupSkill: 7, physical: 8, potential: 8.7, salary: 6, contractEndsYear: 2024, photoUrl: "https://www.formula1.com/content/dam/fom-website/drivers/E/ESTOCO01_Esteban_Ocon/estoco01.png.transform/1col/image.png" },
    { id: 12, name: "Pierre Gasly", teamId: 6, age: 28, nationality: 'FR', startSkill: 7, concentration: 7, overtaking: 8, experience: 8, speed: 8, rainSkill: 7, setupSkill: 8, physical: 8, potential: 8.8, salary: 6, contractEndsYear: 2025, photoUrl: "https://www.formula1.com/content/dam/fom-website/drivers/P/PIEGAS01_Pierre_Gasly/piegas01.png.transform/1col/image.png" },
    // Williams
    { id: 13, name: "Alexander Albon", teamId: 7, age: 28, nationality: 'TH', startSkill: 8, concentration: 8, overtaking: 7, experience: 7, speed: 9, rainSkill: 7, setupSkill: 9, physical: 8, potential: 8.9, salary: 7, contractEndsYear: 2026, photoUrl: "https://www.formula1.com/content/dam/fom-website/drivers/A/ALEALB01_Alexander_Albon/alealb01.png.transform/1col/image.png" },
    { id: 14, name: "Logan Sargeant", teamId: 7, age: 23, nationality: 'US', startSkill: 6, concentration: 5, overtaking: 6, experience: 4, speed: 7, rainSkill: 5, setupSkill: 6, physical: 7, potential: 7.9, salary: 1, contractEndsYear: 2024, photoUrl: "https://www.formula1.com/content/dam/fom-website/drivers/L/LOGSAR01_Logan_Sargeant/logsar01.png.transform/1col/image.png" },
    // Visa Cash App RB
    { id: 15, name: "Yuki Tsunoda", teamId: 8, age: 24, nationality: 'JP', startSkill: 7, concentration: 6, overtaking: 8, experience: 5, speed: 8, rainSkill: 7, setupSkill: 7, physical: 7, potential: 8.8, salary: 2, contractEndsYear: 2025, photoUrl: "https://www.formula1.com/content/dam/fom-website/drivers/Y/YUKTSU01_Yuki_Tsunoda/yuktsu01.png.transform/1col/image.png" },
    { id: 16, name: "Daniel Ricciardo", teamId: 8, age: 34, nationality: 'AU', startSkill: 8, concentration: 8, overtaking: 9, experience: 9, speed: 8, rainSkill: 8, setupSkill: 8, physical: 8, potential: 8.9, salary: 7, contractEndsYear: 2024, photoUrl: "https://www.formula1.com/content/dam/fom-website/drivers/D/DANRIC01_Daniel_Ricciardo/danric01.png.transform/1col/image.png" },
    // Stake F1 Team
    { id: 17, name: "Valtteri Bottas", teamId: 9, age: 34, nationality: 'FI', startSkill: 9, concentration: 8, overtaking: 7, experience: 9, speed: 8, rainSkill: 7, setupSkill: 8, physical: 8, potential: 8.8, salary: 10, contractEndsYear: 2024, photoUrl: "https://www.formula1.com/content/dam/fom-website/drivers/V/VALBOT01_Valtteri_Bottas/valbot01.png.transform/1col/image.png" },
    { id: 18, name: "Zhou Guanyu", teamId: 9, age: 25, nationality: 'CN', startSkill: 7, concentration: 7, overtaking: 7, experience: 5, speed: 7, rainSkill: 6, setupSkill: 7, physical: 7, potential: 8.3, salary: 2, contractEndsYear: 2024, photoUrl: "https://www.formula1.com/content/dam/fom-website/drivers/Z/ZHOYUA01_Guanyu_Zhou/zhoyua01.png.transform/1col/image.png" },
    // Haas
    { id: 19, name: "Kevin Magnussen", teamId: 10, age: 31, nationality: 'DK', startSkill: 8, concentration: 6, overtaking: 8, experience: 8, speed: 7, rainSkill: 6, setupSkill: 7, physical: 8, potential: 8.0, salary: 5, contractEndsYear: 2024, photoUrl: "https://www.formula1.com/content/dam/fom-website/drivers/K/KEVMAG01_Kevin_Magnussen/kevmag01.png.transform/1col/image.png" },
    { id: 20, name: "Nico Hülkenberg", teamId: 10, age: 36, nationality: 'DE', startSkill: 7, concentration: 8, overtaking: 7, experience: 9, speed: 8, rainSkill: 7, setupSkill: 8, physical: 8, potential: 8.4, salary: 3, contractEndsYear: 2024, photoUrl: "https://www.formula1.com/content/dam/fom-website/drivers/N/NICHUL01_Nico_Hulkenberg/nichul01.png.transform/1col/image.png" },
];

export const CALENDAR: Race[] = [
    { name: "Grande Prêmio do Bahrein", country: "Bahrein", countryCode: "BH", laps: 57, baseLapTime: "1:32.000", weatherChances: { Dry: 0.95, LightRain: 0.05, HeavyRain: 0.0 } },
    { name: "Grande Prêmio da Arábia Saudita", country: "Arábia Saudita", countryCode: "SA", laps: 50, baseLapTime: "1:30.000", weatherChances: { Dry: 0.98, LightRain: 0.02, HeavyRain: 0.0 } },
    { name: "Grande Prêmio da Austrália", country: "Austrália", countryCode: "AU", laps: 58, baseLapTime: "1:20.000", weatherChances: { Dry: 0.8, LightRain: 0.15, HeavyRain: 0.05 } },
    { name: "Grande Prêmio do Japão", country: "Japão", countryCode: "JP", laps: 53, baseLapTime: "1:34.000", weatherChances: { Dry: 0.6, LightRain: 0.3, HeavyRain: 0.1 } },
    { name: "Grande Prêmio da China", country: "China", countryCode: "CN", laps: 56, baseLapTime: "1:36.000", weatherChances: { Dry: 0.7, LightRain: 0.25, HeavyRain: 0.05 } },
    { name: "Grande Prêmio de Miami", country: "EUA", countryCode: "US", laps: 57, baseLapTime: "1:29.000", weatherChances: { Dry: 0.85, LightRain: 0.1, HeavyRain: 0.05 } },
    { name: "Grande Prêmio de Mônaco", country: "Mônaco", countryCode: "MC", laps: 78, baseLapTime: "1:15.000", weatherChances: { Dry: 0.8, LightRain: 0.15, HeavyRain: 0.05 } },
    { name: "Grande Prêmio do Canadá", country: "Canadá", countryCode: "CA", laps: 70, baseLapTime: "1:16.000", weatherChances: { Dry: 0.6, LightRain: 0.3, HeavyRain: 0.1 } },
    { name: "Grande Prêmio da Espanha", country: "Espanha", countryCode: "ES", laps: 66, baseLapTime: "1:18.000", weatherChances: { Dry: 0.9, LightRain: 0.08, HeavyRain: 0.02 } },
    { name: "Grande Prêmio da Grã-Bretanha", country: "Reino Unido", countryCode: "GB", laps: 52, baseLapTime: "1:28.000", weatherChances: { Dry: 0.5, LightRain: 0.4, HeavyRain: 0.1 } },
    { name: "Grande Prêmio da Hungria", country: "Hungria", countryCode: "HU", laps: 70, baseLapTime: "1:21.000", weatherChances: { Dry: 0.8, LightRain: 0.15, HeavyRain: 0.05 } },
    { name: "Grande Prêmio da Bélgica", country: "Bélgica", countryCode: "BE", laps: 44, baseLapTime: "1:48.000", weatherChances: { Dry: 0.4, LightRain: 0.4, HeavyRain: 0.2 } },
    { name: "Grande Prêmio da Holanda", country: "Holanda", countryCode: "NL", laps: 72, baseLapTime: "1:14.000", weatherChances: { Dry: 0.7, LightRain: 0.2, HeavyRain: 0.1 } },
    { name: "Grande Prêmio da Itália", country: "Itália", countryCode: "IT", laps: 53, baseLapTime: "1:23.000", weatherChances: { Dry: 0.9, LightRain: 0.08, HeavyRain: 0.02 } },
    { name: "Grande Prêmio de Singapura", country: "Singapura", countryCode: "SG", laps: 62, baseLapTime: "1:41.000", weatherChances: { Dry: 0.3, LightRain: 0.4, HeavyRain: 0.3 } },
    { name: "Grande Prêmio dos Estados Unidos", country: "EUA", countryCode: "US", laps: 56, baseLapTime: "1:37.000", weatherChances: { Dry: 0.85, LightRain: 0.1, HeavyRain: 0.05 } },
    { name: "Grande Prêmio do México", country: "México", countryCode: "MX", laps: 71, baseLapTime: "1:20.000", weatherChances: { Dry: 0.9, LightRain: 0.1, HeavyRain: 0.0 } },
    { name: "Grande Prêmio do Brasil", country: "Brasil", countryCode: "BR", laps: 71, baseLapTime: "1:13.000", weatherChances: { Dry: 0.5, LightRain: 0.35, HeavyRain: 0.15 } },
    { name: "Grande Prêmio de Las Vegas", country: "EUA", countryCode: "US", laps: 50, baseLapTime: "1:35.000", weatherChances: { Dry: 0.99, LightRain: 0.01, HeavyRain: 0.0 } },
    { name: "Grande Prêmio do Catar", country: "Catar", countryCode: "QA", laps: 57, baseLapTime: "1:24.000", weatherChances: { Dry: 0.98, LightRain: 0.02, HeavyRain: 0.0 } },
    { name: "Grande Prêmio de Abu Dhabi", country: "Emirados Árabes Unidos", countryCode: "AE", laps: 58, baseLapTime: "1:27.000", weatherChances: { Dry: 1.0, LightRain: 0.0, HeavyRain: 0.0 } },
];

export const SCORING_SYSTEMS: ScoringSystem[] = [
    { id: 1, name: "scoringSystem_current", points: [25, 18, 15, 12, 10, 8, 6, 4, 2, 1] },
    { id: 2, name: "scoringSystem_classic", points: [10, 8, 6, 5, 4, 3, 2, 1] },
    { id: 3, name: "scoringSystem_old", points: [10, 6, 4, 3, 2, 1] },
];

export const PRIZE_MONEY = [10, 8, 6, 5, 4, 3, 2, 1, 0.5, 0.25];

export const TYRE_COMPOUNDS: Record<TyreCompound, { performance: number; degradation: number; ideal: 'Dry' | 'LightRain' | 'HeavyRain'; penalty: number; lifespan?: number; }> = {
    [TyreCompound.Soft]: { performance: 0.985, degradation: 0.045, ideal: 'Dry', penalty: 15, lifespan: 0.30 },
    [TyreCompound.Medium]: { performance: 1.0, degradation: 0.03, ideal: 'Dry', penalty: 15, lifespan: 0.50 },
    [TyreCompound.Hard]: { performance: 1.015, degradation: 0.02, ideal: 'Dry', penalty: 15, lifespan: 0.70 },
    [TyreCompound.Intermediate]: { performance: 1.05, degradation: 0.035, ideal: 'LightRain', penalty: 5 },
    [TyreCompound.Wet]: { performance: 1.10, degradation: 0.04, ideal: 'HeavyRain', penalty: 8 },
};

export const DEFAULT_SKINS: AppSkin[] = [
    {
        id: 'default-dark',
        name: 'Default Dark',
        isEditable: false,
        colors: {
            bgMain: '#15141f',
            bgPanel: '#1e1e2b',
            textPrimary: '#e2e8f0',
            textSecondary: '#94a3b8',
            accentRed: '#e00601',
            accentGreen: '#00e051',
            borderColor: '#334155',
        },
        logoSvg: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwNyIgaGVpZ2h0PSIzNzYiIHZpZXdCb3g9IjAgMCAyMDA3IDM3NiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTEzIDIzN0MxMyAyMjAuNDMxIDI2LjQzMTUgMjA3IDQzIDIwN0gxNjcwQzE2ODYuNTcgMjA3IDE3MDAgMjIwLjQzMSAxNzAwIDIzN1YzNDZDMTcwMCAzNjIuNTY5IDE2ODYuNTcgMzc2IDE2NzAgMzc2SDQzQzI2LjQzMTUgMzc2IDEzIDM2Mi41NjkgMTMgMzQ2VjIzN1oiIGZpbGw9IiNFMDA2MDEiLz4KPHBhdGggZD0iTTYwLjA5IDMzN1YyNDYuMTU5SDEzNi4xOTNDMTQ1LjU5NSAyNDYuMTU5IDE1Mi44NzkgMjQ4LjUzMSAxNTguMDQ2IDI1My4yNzRDMTYzLjI5NyAyNTguMDE3IDE2NS45MjMgMjY1LjIxNyAxNjUuOTIzIDI3NC44NzNDMTY1LjkyMyAyODMuMDg4IDE2NC4wMTcgMjg5LjUyNiAxNjAuMjA1IDI5NC4xODRDMTU2LjM5NCAyOTguODQzIDE1MC45NzMgMzAxLjc2NSAxNDMuOTQzIDMwMi45NTFMMTY0LjkwNiAzMzdIMTQxLjc4M0wxMjIuMzQ1IDMwMy41ODZIODAuNDE4VjMzN0g2MC4wOVpNMTMzLjc3OSAyNjIuNjc2SDgwLjQxOFYyODYuOTQyTDEzMy43NzkgMjg3LjA2OUMxMzcuNTA2IDI4Ny4wNjkgMTQwLjM0MyAyODYuMTM4IDE0Mi4yOTEgMjg0LjI3NEMxNDQuMzI0IDI4Mi40MTEgMTQ1LjM0MSAyNzkuMjc3IDE0NS4zNDEgMjc0Ljg3M0MxNDUuMzQxIDI3MC4zODMgMTQ0LjMyNCAyNjcuMjUgMTQyLjI5MSAyNjUuNDcxQzE0MC4zNDMgMjYzLjYwNyAxMzcuNTA2IDI2Mi42NzYgMTMzLjc3OSAyNjIuNjc2Wk0zNzEuNzYgMzM3TDQxMi42NyAyNDYuMTU5SDQ0NC4wNTFMNDg0Ljk2MSAzMzdINDYyLjg1NEw0NTQuMjE1IDMxNy44MTVINDAyLjUwNkwzOTMuODY2IDMzN0gzNzEuNzZaTTQwOS44NzUgMzAxLjI5OUg0NDYuODQ2TDQyOS4xODYgMjYyLjA0SDQyNy41MzVMNDA5Ljg3NSAzMDEuMjk5Wk03MzcuNjEzIDMzNy42MzVDNzIwLjg0MiAzMzcuNjM1IDcwOC4wMSAzMzMuNzgxIDY5OS4xMTcgMzI2LjA3NEM2OTAuMjIzIDMxOC4yODEgNjg1Ljc3NyAzMDYuNzYyIDY4NS43NzcgMjkxLjUxNkM2ODUuNzc3IDI3Ni4zNTUgNjkwLjIyMyAyNjQuODc4IDY5OS4xMTcgMjU3LjA4NkM3MDguMDEgMjQ5LjI5MyA3MjAuODQyIDI0NS40MzkgNzM3LjYxMyAyNDUuNTI0TDc4My4zNTEgMjQ1Ljc3OFYyNjIuMDRINzM5LjAxQzcyNy45OTkgMjYyLjA0IDcxOS44MjYgMjY0LjM3IDcxNC40OSAyNjkuMDI4QzcwOS4xNTQgMjczLjY4NyA3MDYuNDg2IDI4MS4xODMgNzA2LjQ4NiAyOTEuNTE2QzcwNi40ODYgMzAxLjg0OSA3MDkuMTU0IDMwOS4zODggNzE0LjQ5IDMxNC4xMzFDNzE5LjgyNiAzMTguNzg5IDcyNy45OTkgMzIxLjExOSA3MzkuMDEgMzIxLjExOUg3ODQuNjIxVjMzNy42MzVINzM3LjYxM1pNOTk1LjUxMSAzMzdWMjQ2LjE1OUgxMDE1Ljg0VjMzN0g5OTUuNTExWk0xMjMxLjggMzM3VjI0Ni4xNTlIMTI1Mi4zOEwxMzE2LjY3IDMxMS40NjNWMjQ2LjE1OUgxMzM3VjMzN0gxMzE2LjQxTDEyNTIuMTMgMjcxLjU2OVYzMzdIMTIzMS44Wk0xNTk3LjE3IDMzNy42MzVDMTU4MS42NyAzMzcuNjM1IDE1NjkuNTUgMzMzLjc4MSAxNTYwLjgzIDMyNi4wNzRDMTU1Mi4xOSAzMTguMjgxIDE1NDcuODcgMzA2Ljc2MiAxNTQ3Ljg3IDI5MS41MTZDMTU0Ny44NyAyNzYuMzU1IDE1NTIuMjcgMjY0LjkyIDE1NjEuMDggMjU3LjIxM0MxNTY5Ljk4IDI0OS40MiAxNTgyLjg1IDI0NS41MjQgMTU5OS43MSAyNDUuNTI0SDE2NDcuOTlWMjYyLjA0SDE2MDEuMUMxNTkwLjAxIDI2Mi4wNCAxNTgxLjc5IDI2NC4zNyAxNTc2LjQ2IDI2OS4wMjhDMTU3MS4yMSAyNzMuNjg3IDE1NjguNTggMjgxLjE4MyAxNTY4LjU4IDI5MS41MTZDMTU2OC41OCAzMDEuODQ5IDE1NzEuMTIgMzA5LjM4OCAxNTc2LjIgMzE0LjEzMUMxNTgxLjM3IDMxOC43ODkgMTU4OC45NSAzMjEuMTE5IDE1OTguOTQgMzIxLjExOUgxNjMyLjYxVjMwMi4xODhIMTYwOC44NVYyODUuNjcySDE2NTIuOTRWMzM3LjYzNUgxNTk3LjE3WiIgZmlsbD0id2hpdGUiLz4KPHBhdGggZD0iTTE3MS43MzIgMzYuNzQ0NkMxNjcuODE2IDM2Ljc0NDYgMTY0LjIxNCAzNy4xMzYyIDE2MC45MjQgMzcuOTE5NEMxNTcuNjM1IDM4LjcwMjYgMTU0LjczNyAzOS42NDI0IDE1Mi4yMzEgNDAuNzM4OUMxNDkuODgxIDQxLjY3ODcgMTQ3LjUzMiA0My4yNDUxIDE0NS4xODIgNDUuNDM4QzE0Mi44MzMgNDcuNjMwOSAxNDAuOTUzIDQ5LjU4ODggMTM5LjU0MyA1MS4zMTE4QzEzOC4xMzQgNTMuMDM0OSAxMzYuNDExIDU1LjYxOTQgMTM0LjM3NCA1OS4wNjU0QzEzMi40OTUgNjIuNTExNCAxMzEuMDA3IDY1LjMzMDggMTI5LjkxIDY3LjUyMzdDMTI4Ljk3IDY5LjcxNjcgMTI3LjQ4MiA3My4wMDYgMTI1LjQ0NiA3Ny4zOTE5QzEyNC4zNSA3OS44OTggMTIzLjQ4OCA4MS44NTYgMTIyLjg2MiA4My4yNjU3QzExOS44ODYgODkuNjg3OCAxMTYuNzUzIDk2LjQyMzIgMTEzLjQ2MyAxMDMuNDcyTDEzMS41NTUgODguMTk5OEgyMDAuODY3TDE4My43MTUgMTE4Ljk3OUgxMDYuMThMODMuODU5MSAxNjUuNUgwLjIxNTEyNUwzNS45MjgzIDg5LjEzOTZDNDAuNDcwOCA3Ni45MjE5IDQ1LjcxODEgNjYuMTE0IDUxLjY3MDMgNTYuNzE1OEM1Ny43NzkxIDQ3LjE2MSA2My42NTMgMzkuMzI5MSA2OS4yOTE5IDMzLjIyMDNDNzUuMDg3NSAyNi45NTQ4IDgxLjk3OTUgMjEuNzA3NSA4OS45NjggMTcuNDc4M0M5OC4xMTMxIDEzLjI0OTEgMTA1LjA4MyAxMC4xMTY0IDExMC44NzkgOC4wODAxMkMxMTYuNjc1IDUuODg3MjEgMTI0LjE5MyA0LjI0MjUyIDEzMy40MzUgMy4xNDYwNkMxNDIuODMzIDIuMDQ5NjEgMTUwLjAzOCAxLjQyMzA2IDE1NS4wNSAxLjI2NjQyQzE2MC4yMiAxLjEwOTc4IDE2Ny41ODEgMS4wMzE0NyAxNzcuMTM2IDEuMDMxNDdIMjU1LjE0MUwyMzcuMjg1IDM2Ljc0NDZIMTcxLjczMlpNNDEyLjM3MiAxLjAzMTQ3QzQxOC45NTEgMS4wMzE0NyA0MjQuOTAzIDEuODkyOTcgNDMwLjIyOSAzLjYxNTk4QzQzNS43MTEgNS4xODIzNSA0NDAuMDk3IDcuMzc1MjYgNDQzLjM4NiAxMC4xOTQ3QzQ0Ni44MzIgMTIuODU3NSA0NDkuNzMgMTUuOTkwMyA0NTIuMDggMTkuNTkyOUM0NTQuNDI5IDIzLjAzODkgNDU1Ljk5NSAyNi43MTk5IDQ1Ni43NzkgMzAuNjM1OEM0NTcuNzE4IDM0LjU1MTcgNDU4LjExIDM4LjM4OTMgNDU3Ljk1MyA0Mi4xNDg2QzQ1Ny45NTMgNDUuOTA3OSA0NTcuNDg0IDQ5LjQzMjIgNDU2LjU0NCA1Mi43MjE2QzQ1NS4yOTEgNTcuMTA3NCA0NTMuMDE5IDY0LjIzNDQgNDQ5LjczIDc0LjEwMjVDNDQ2LjQ0MSA4My45NzA2IDQ0My40NjUgOTIuNjYzOSA0NDAuODAyIDEwMC4xODJMNDM2LjgwNyAxMTEuNjk1QzQzMy42NzUgMTE5LjY4NCA0MjkuMjg5IDEyNi44MTEgNDIzLjY1IDEzMy4wNzZDNDE4LjAxMSAxMzkuMzQyIDQxMS45MDIgMTQ0LjM1NCA0MDUuMzIzIDE0OC4xMTNDMzk4LjkwMSAxNTEuNzE2IDM5Mi4wODggMTU0Ljg0OSAzODQuODgyIDE1Ny41MTJDMzc3LjY3NyAxNjAuMTc0IDM3MC43ODUgMTYxLjk3NiAzNjQuMjA2IDE2Mi45MTVDMzU3LjYyOCAxNjMuODU1IDM1MS42NzUgMTY0LjU2IDM0Ni4zNSAxNjUuMDNDMzQxLjAyNCAxNjUuNSAzMzYuNzk1IDE2NS43MzUgMzMzLjY2MiAxNjUuNzM1TDMyOC45NjMgMTY1LjVIMjc4LjY4M0MyNzAuMDY4IDE2NS41IDI2Mi4yMzYgMTY0Ljc5NSAyNTUuMTg3IDE2My4zODVDMjQ4LjI5NSAxNjEuODE5IDI0Mi42NTYgMTU5Ljg2MSAyMzguMjcgMTU3LjUxMkMyMzQuMDQxIDE1NS4wMDUgMjMwLjQzOSAxNTIuMTg2IDIyNy40NjMgMTQ5LjA1M0MyMjQuNDg2IDE0NS45MiAyMjIuMjk0IDE0Mi42MzEgMjIwLjg4NCAxMzkuMTg1QzIxOS42MzEgMTM1LjU4MiAyMTguNzY5IDEzMi4wNTggMjE4LjI5OSAxMjguNjEyQzIxNy42NzMgMTI1LjAwOSAyMTcuNTE2IDEyMS42NDIgMjE3LjgyOSAxMTguNTA5QzIxOC4xNDMgMTE1LjM3NiAyMTguNTM0IDExMi42MzUgMjE5LjAwNCAxMTAuMjg2QzIxOS4zMTcgMTA3Ljc3OSAyMTkuNzg3IDEwNS43NDMgMjIwLjQxNCAxMDQuMTc3TDIyMS4xMTkgMTAyLjA2MkwyMzkuOTE1IDU4LjEyNTVDMjQzLjUxOCA0OS41MTA1IDI0Ny45ODIgNDEuODM1MyAyNTMuMzA4IDM1LjFDMjU4Ljc5IDI4LjIwNzkgMjY0LjM1IDIyLjgwNCAyNjkuOTg5IDE4Ljg4ODFDMjc1Ljc4NSAxNC45NzIxIDI4MS43MzcgMTEuNjgyOCAyODcuODQ2IDkuMDE5OTVDMjkzLjk1NSA2LjIwMDQ5IDI5OS42NzIgNC4zMjA4NCAzMDQuOTk4IDMuMzgxMDFDMzEwLjMyMyAyLjQ0MTIgMzE1LjEwMSAxLjczNjMzIDMxOS4zMyAxLjI2NjQyQzMyMy41NTkgMC43OTY1MTQgMzI2LjkyNyAwLjYzOTg3OSAzMjkuNDMzIDAuNzk2NTE0TDMzMy4xOTIgMS4wMzE0N0g0MTIuMzcyWk0zNjcuMjYxIDg3LjQ5NDlDMzY5LjQ1NCA4Mi4wMTI2IDM3MS4xNzcgNzcuNDcwMiAzNzIuNDMgNzMuODY3NUMzNzMuODQgNzAuMjY0OSAzNzUuMDkzIDY2LjM0OSAzNzYuMTg5IDYyLjExOThDMzc3LjQ0MiA1Ny43MzQgMzc3Ljk5IDU0LjIwOTYgMzc3LjgzNCA1MS41NDY4QzM3Ny44MzQgNDguODg0IDM3Ny4zNjQgNDYuMzc3OCAzNzYuNDI0IDQ0LjAyODJDMzc1LjQ4NCA0MS41MjIxIDM3My42ODMgMzkuNzIwNyAzNzEuMDIgMzguNjI0M0MzNjguNTE0IDM3LjM3MTIgMzY1LjIyNSAzNi43NDQ2IDM2MS4xNTIgMzYuNzQ0NkMzNDkuMDkxIDM2Ljc0NDYgMzM5LjYxNCAzOS44Nzc0IDMzMi43MjIgNDYuMTQyOEMzMjUuODMgNTIuNDA4MyAzMTguNjI1IDYzLjUyOTUgMzExLjEwNyA3OS41MDY1QzMxMC45NSA3OS45NzY0IDMxMC43MTUgODAuNjAyOSAzMTAuNDAyIDgxLjM4NjFDMzEwLjA4OCA4Mi4wMTI2IDMwOS40NjIgODMuNTAwNyAzMDguNTIyIDg1Ljg1MDJDMzA3LjU4MiA4OC4wNDMyIDMwNi43MjEgOTAuMzE0NCAzMDUuOTM4IDkyLjY2MzlDMzA1LjMxMSA5NC44NTY5IDMwNC42MDYgOTcuNDQxNCAzMDMuODIzIDEwMC40MTdDMzAzLjE5NiAxMDMuMzk0IDMwMi43MjYgMTA2LjIxMyAzMDIuNDEzIDEwOC44NzZDMzAyLjEgMTExLjM4MiAzMDIuMSAxMTMuOTY3IDMwMi40MTMgMTE2LjYyOUMzMDIuNzI2IDExOS4yOTIgMzAzLjM1MyAxMjEuNTYzIDMwNC4yOTMgMTIzLjQ0M0MzMDUuMzg5IDEyNS4zMjMgMzA3LjAzNCAxMjYuODg5IDMwOS4yMjcgMTI4LjE0MkMzMTEuNTc2IDEyOS4yMzkgMzE0LjMxOCAxMjkuNzg3IDMxNy40NSAxMjkuNzg3QzMyMy40MDMgMTI5Ljc4NyAzMjguODA2IDEyOC45MjUgMzMzLjY2MiAxMjcuMjAyQzMzOC41MTggMTI1LjMyMyAzNDIuNTkxIDEyMy4xMyAzNDUuODggMTIwLjYyNEMzNDkuMTY5IDExOC4xMTcgMzUyLjIyNCAxMTQuODI4IDM1NS4wNDMgMTEwLjc1NUMzNTguMDE5IDEwNi42ODMgMzYwLjI5IDEwMy4wMDIgMzYxLjg1NyA5OS43MTI2QzM2My41OCA5Ni4yNjY2IDM2NS4zODEgOTIuMTk0IDM2Ny4yNjEgODcuNDk0OVpNNjA0LjU4NyAxLjAzMTQ3QzYwNC43NDQgMS4wMzE0NyA2MDQuODIyIDEuMDMxNDcgNjA0LjgyMiAxLjAzMTQ3QzYxMS4yNDQgMS4wMzE0NyA2MTYuNzI3IDEuMTg4MTEgNjIxLjI2OSAxLjUwMTM4QzYyNS45NjggMS42NTgwMiA2MzIuNzA0IDIuNzU0NDggNjQxLjQ3NSA0Ljc5MDc1QzY1MC4yNDcgNi44MjcwMyA2NTcuMTM5IDkuNzI0ODEgNjYyLjE1MSAxMy40ODQxQzY2Ny4zMiAxNy4wODY3IDY3MS40NzEgMjIuODA0IDY3NC42MDQgMzAuNjM1OEM2NzcuNzM3IDM4LjQ2NzYgNjc4LjA1IDQ3Ljc4NzUgNjc1LjU0NCA1OC41OTU1QzY3NC4xMzQgNjQuNzA0MyA2NzIuMTc2IDcwLjM0MzIgNjY5LjY3IDc1LjUxMjJDNjY3LjE2NCA4MC41MjQ2IDY2NC4zNDQgODQuNTk3MSA2NjEuMjEyIDg3LjcyOTlDNjU4LjIzNSA5MC43MDYgNjU1LjEwMyA5My4zNjg4IDY1MS44MTMgOTUuNzE4NEM2NDguNTI0IDk3LjkxMTMgNjQ1LjMxMyA5OS41NTU5IDY0Mi4xOCAxMDAuNjUyQzYzOS4yMDQgMTAxLjU5MiA2MzYuNDYzIDEwMi4zNzUgNjMzLjk1NyAxMDMuMDAyQzYzMS40NTEgMTAzLjYyOSA2MjkuNDkzIDEwMy45NDIgNjI4LjA4MyAxMDMuOTQyTDYyNS45NjggMTA0LjE3N0w2NDYuNjQ0IDE2NS41SDU3NS4yMThMNTYyLjc2NSAxMDcuNzAxSDU0MC40NDVMNTEzLjE5IDE2NS41SDQyOS41NDZMNTA3LjU1MSAxLjAzMTQ3SDYwNC41ODdaTTYwMS4wNjMgNTguMTI1NUM2MDMuMDk5IDU0LjA1MyA2MDQuMjc0IDUwLjYwNyA2MDQuNTg3IDQ3Ljc4NzVDNjA0LjkwMSA0NC44MTE0IDYwNC4zNTIgNDIuNjk2OCA2MDIuOTQzIDQxLjQ0MzdDNjAxLjY5IDQwLjAzNCA2MDAuMjAyIDM5LjA5NDIgNTk4LjQ3OSAzOC42MjQzQzU5Ni45MTIgMzguMTU0NCA1OTQuOTU0IDM3LjkxOTQgNTkyLjYwNSAzNy45MTk0SDU3My41NzNMNTQ3LjcyOCA5Mi42NjM5TDU2Mi43NjUgNzUuMjc3M0M1ODIuOTcyIDc1LjI3NzMgNTk1LjczNyA2OS41NiA2MDEuMDYzIDU4LjEyNTVaTTEwMDUuMjQgMS4wMzE0N0MxMDEyLjI4IDEuMDMxNDcgMTAxOC43OCAyLjc1NDQ3IDEwMjQuNzQgNi4yMDA0OEMxMDMwLjg1IDkuNjQ2NDkgMTAzNS41NCAxNC4xMTA2IDEwMzguODMgMTkuNTkyOUMxMDQyLjEyIDI1LjA3NTIgMTA0NC4xNiAzMS4xODQgMTA0NC45NCAzNy45MTk0QzEwNDUuNzMgNDQuNjU0OCAxMDQ0LjQ3IDUxLjMxMTkgMTA0MS4xOCA1Ny44OTA2TDk5MC4xOTggMTY1LjVIOTA2LjU1NEw5NjQuMzUzIDQyLjg1MzVIOTIzLjAwMUM5MjIuODQ0IDQ4LjAyMjUgOTIxLjU5MSA1My4wMzQ5IDkxOS4yNDIgNTcuODkwNkw4NjguMjU3IDE2NS41SDc4NC42MTNMODQyLjQxMSA0Mi44NTM1SDgwNC4zNDlMNzQ2LjMxNSAxNjUuNUg2NjIuNjcxTDc0MC4yMDYgMS4wMzE0N0g4MjQuMzJMODE3LjAzNiAxNi4zMDM1TDgzNC44OTMgMS4wMzE0N0g4ODMuMjk0Qzg5Mi42OTIgMS4wMzE0NyA5MDAuOTE1IDMuODUwOTMgOTA3Ljk2NCA5LjQ4OTg1QzkxNS4wMTMgMTUuMTI4OCA5MTkuNjMzIDIyLjI1NTcgOTIxLjgyNiAzMC44NzA4TDk1Ny4wNyAxLjAzMTQ3SDEwMDUuMjRaTTEyMjAuOTYgMS4wMzE0N0gxMzA0LjYxQzEyNzYuNzMgNjAuMDgzNSAxMjU3LjM4IDEwMC44ODcgMTI0Ni41NyAxMjMuNDQzQzEyNDQuNjkgMTI3LjIwMiAxMjQzLjIgMTMwLjE3OCAxMjQyLjExIDEzMi4zNzFDMTI0MS4wMSAxMzQuNDA4IDEyMzkuMzcgMTM3LjA3IDEyMzcuMTcgMTQwLjM2QzEyMzUuMTQgMTQzLjQ5MyAxMjMzLjEgMTQ1LjkyIDEyMzEuMDcgMTQ3LjY0M0MxMjI5LjE5IDE0OS4yMSAxMjI2LjYgMTUxLjE2OCAxMjIzLjMxIDE1My41MTdDMTIyMC4xOCAxNTUuODY3IDEyMTYuNzMgMTU3LjY2OCAxMjEyLjk3IDE1OC45MjFDMTIwOS4yMSAxNjAuMTc0IDEyMDQuNjcgMTYxLjUwNiAxMTk5LjM1IDE2Mi45MTVDMTE5NC4wMiAxNjQuMzI1IDExODguMDcgMTY1LjM0MyAxMTgxLjQ5IDE2NS45N0MxMTc1LjA3IDE2Ni43NTMgMTE2Ny42MyAxNjcuMzggMTE1OS4xNyAxNjcuODVDMTE1MC44NyAxNjguMzE5IDExNDEuNjMgMTY4LjU1NCAxMTMxLjQ0IDE2OC41NTRDMTExNy42NiAxNjguNTU0IDExMDUuNDQgMTY3LjUzNiAxMDk0Ljc5IDE2NS41QzEwODQuMTQgMTYzLjMwNyAxMDc1LjQ1IDE2MC40ODggMTA2OC43MSAxNTcuMDQyQzEwNjEuOTggMTUzLjQzOSAxMDU2LjM0IDE0OS4yMSAxMDUxLjc5IDE0NC4zNTRDMTA0Ny40MSAxMzkuNDk4IDEwNDQuMjggMTM0LjQwOCAxMDQyLjQgMTI5LjA4MkMxMDQwLjY3IDEyMy43NTYgMTAzOS44MSAxMTguMTk2IDEwMzkuODEgMTEyLjRDMTAzOS44MSAxMDYuNjA1IDEwNDAuNDQgMTAxLjEyMiAxMDQxLjY5IDk1Ljk1MzNDMTA0My4xIDkwLjYyNzcgMTA0NS4wNiA4NS41MzcgMTA0Ny41NyA4MC42ODEyQzEwNTMuMzYgNjguNjIwMiAxMDU5LjM5IDU2LjAxMSAxMDY1LjY2IDQyLjg1MzVDMTA3MS45MiAyOS41MzkzIDEwNzYuNzggMTkuMjAxMyAxMDgwLjIyIDExLjgzOTRMMTA4NS4xNiAxLjAzMTQ3SDExNjguOEMxMTUyLjk4IDM0Ljg2NSAxMTQxIDYwLjI0MDEgMTEzMi44NSA3Ny4xNTY5QzExMTUuNzggMTEyLjI0NCAxMTE3LjQzIDEyOS43ODcgMTEzNy43OSAxMjkuNzg3QzExNDIuNDkgMTI5Ljc4NyAxMTQ2LjMzIDEyOS4zOTUgMTE0OS4zIDEyOC42MTJDMTE1Mi4yOCAxMjcuODI5IDExNTUuMzMgMTI1Ljk0OSAxMTU4LjQ2IDEyMi45NzNDMTE2MS43NSAxMTkuODQgMTE2NC44OSAxMTUuNjkgMTE2Ny44NiAxMTAuNTIxQzExNzEgMTA1LjM1MiAxMTc0LjgzIDk4LjE0NjIgMTE3OS4zOCA4OC45MDQ3TDEyMjAuOTYgMS4wMzE0N1pNMTM4OS43OSAxMzIuMzcxSDE0MjUuNUwxNDA5LjA2IDE2NS41SDEzMzAuODJDMTMyMi4wNSAxNjUuNSAxMzE0LjM3IDE2NC40ODIgMTMwNy43OSAxNjIuNDQ2QzEzMDEuMjEgMTYwLjQwOSAxMjk1Ljk3IDE1Ny43NDYgMTI5Mi4wNSAxNTQuNDU3QzEyODguMjkgMTUxLjAxMSAxMjg1LjMxIDE0Ni45MzkgMTI4My4xMiAxNDIuMjM5QzEyODAuOTMgMTM3LjU0IDEyNzkuNTIgMTMyLjc2MyAxMjc4Ljg5IDEyNy45MDdDMTI3OC40MiAxMjIuODk1IDEyNzguNDIgMTE3LjY0NyAxMjc4Ljg5IDExMi4xNjVDMTI3OS41MiAxMDYuNjgzIDEyODAuMzggMTAxLjY3MSAxMjgxLjQ4IDk3LjEyODFDMTI4Mi43MyA5Mi40MjkgMTI4NC4yMiA4Ny44MDgyIDEyODUuOTQgODMuMjY1N0MxMjg4Ljc2IDc2LjIxNzEgMTI5My4zOCA2NS44NzkxIDEyOTkuOCA1Mi4yNTE3QzEzMDYuMjIgMzguNDY3NiAxMzEyLjAyIDI2LjQ4NDkgMTMxNy4xOSAxNi4zMDM1TDEzMjQuOTQgMS4wMzE0N0gxNDA4LjgyQzEzOTcuMzkgMjUuMzEwMiAxMzgzLjc2IDU0LjEzMTMgMTM2Ny45NCA4Ny40OTQ5QzEzNjQuNjUgOTQuMjMwMyAxMzYyLjU0IDEwMC4zMzkgMTM2MS42IDEwNS44MjFDMTM2MC42NiAxMTEuMTQ3IDEzNjAuNzMgMTE1LjM3NiAxMzYxLjgzIDExOC41MDlDMTM2Mi45MyAxMjEuNDg1IDEzNjQuNDkgMTI0LjA3IDEzNjYuNTMgMTI2LjI2M0MxMzY4LjU3IDEyOC4yOTkgMTM3MC45MiAxMjkuNzA5IDEzNzMuNTggMTMwLjQ5MkMxMzc2LjQgMTMxLjI3NSAxMzc4Ljk4IDEzMS45MDEgMTM4MS4zMyAxMzIuMzcxQzEzODMuNjggMTMyLjY4NSAxMzg1LjcyIDEzMi43NjMgMTM4Ny40NCAxMzIuNjA2TDEzODkuNzkgMTMyLjM3MVpNMTYwNy45NyAxLjAzMTQ3SDE3MTEuNTlMMTYzMy41OCAxNjUuNUgxNTQ5LjdMMTU2OS4yIDEyNC44NTNIMTUyNy42MkwxNTQyLjE4IDk3LjU5OEgxNTgyLjEzTDE2MTEuMDMgMzYuNzQ0NkgxNTk2LjY5QzE1ODQuOTUgMzYuNzQ0NiAxNTc1Ljk0IDM5LjAxNTkgMTU2OS42NyA0My41NTgzQzE1NjIgNDkuMTk3MyAxNTUyLjY4IDYyLjY2OCAxNTQxLjcxIDgzLjk3MDZDMTUzNi4yMyA5NC40NjUzIDE1MjMuMDcgMTIxLjY0MiAxNTAyLjI0IDE2NS41SDE0MTguNkMxNDI2LjkgMTQ4LjExMyAxNDMzLjc5IDEzNC4wMTYgMTQzOS4yNyAxMjMuMjA4QzE0NDQuNiAxMTIuNCAxNDUwLjcxIDEwMC44ODcgMTQ1Ny42IDg4LjY2OTdDMTQ2NC40OSA3Ni4yOTU0IDE0NzAuNjggNjYuNTgzOSAxNDc2LjE2IDU5LjUzNTNDMTQ4MS42NCA1Mi40ODY2IDE0ODcuOTkgNDUuMjAzIDE0OTUuMTkgMzcuNjg0NUMxNTAyLjU2IDMwLjE2NTkgMTUwOS44NCAyNC41MjcgMTUxNy4wNCAyMC43Njc3QzE1MjQuMjUgMTYuODUxOCAxNTMyLjU1IDEzLjI0OTEgMTU0MS45NSA5Ljk1OTc1QzE1NTEuMzUgNi41MTM3NSAxNTYxLjM3IDQuMTY0MjEgMTU3Mi4wMiAyLjkxMTExQzE1ODIuNjggMS42NTgwMSAxNTk0LjY2IDEuMDMxNDcgMTYwNy45NyAxLjAzMTQ3WiIgZmlsbD0id2hpdGUiLz4KPHBhdGggZD0iTTE4MDIuNDYgNjIuMjQ5QzE4MjYuODQgNTguNzEwNSAxODQ4Ljg2IDUxLjQzNjggMTg2OC41MiA0MC40MjhDMTg4OC41NyAyOS40MTkyIDE5MDQuNDkgMTYuNDQ0NSAxOTE2LjI5IDEuNTAzOTVIMjAwNi41MkwxOTI2LjMxIDM3NkgxNzk4LjkyTDE4NTcuMzEgMTAxLjc2M0gxNzkzLjYyTDE4MDIuNDYgNjIuMjQ5WiIgZmlsbD0id2hpdGUiLz4KPC9zdmc+Cg==",
    fontFamily: "'Exo 2', sans-serif",
  }
];

export const DEFAULT_SKIN = DEFAULT_SKINS[0];
