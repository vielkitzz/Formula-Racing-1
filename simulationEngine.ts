import { Driver, Team, Race, QualifyingResult, EngineSupplier, WeatherCondition } from './types';
import { formatTime, parseTimeToSeconds } from './utils';

/**
 * Simulates a single stage of qualifying (Q1, Q2, or Q3).
 * @param driversInStage - Array of drivers participating in this stage.
 * @param allTeams - Array of all teams.
 * @param race - The current race object.
 * @param weather - The weather condition for this session.
 * @param allEngineSuppliers - Array of all engine suppliers.
 * @returns An array of QualifyingResult for the stage, sorted by best lap time.
 */
const simulateQualifyingStage = (
    driversInStage: Driver[], 
    allTeams: Team[], 
    race: Race, 
    weather: WeatherCondition, 
    allEngineSuppliers: EngineSupplier[]
): QualifyingResult[] => {
    const resultsWithTimes = driversInStage.map(driver => {
        const team = allTeams.find(t => t.id === driver.teamId);
        if (!team) throw new Error(`Equipe não encontrada para o piloto ID: ${driver.id}`);

        const driverQualiSkill = (driver.speed * 0.7 + driver.setupSkill * 0.3) * 10;
        
        let enginePerf = 80; // Default average
        const supplier = allEngineSuppliers.find(e => e.name === team.engineSupplier);
        if (supplier) {
            enginePerf = supplier.performance;
        }
        const carPartsPerf = (team.aerodynamics + team.gearbox + team.brakes + team.electricalSystem + team.steering) / 5;
        const totalCarPerformance = (carPartsPerf * 0.6) + (enginePerf * 0.4); // Chassis more important than engine

        const performanceScore = (driverQualiSkill * 0.6) + (totalCarPerformance * 0.4);

        const scoreModifier = (performanceScore - 85) * 0.08; 
        const randomVariation = (Math.random() - 0.25) * 0.5; 
        
        const baseTimeInSeconds = parseTimeToSeconds(race.baseLapTime);
        const lapTimeInSeconds = baseTimeInSeconds - scoreModifier + randomVariation;

        return {
            driverId: driver.id,
            position: 0, // Placeholder, will be set after sorting
            lapTime: formatTime(lapTimeInSeconds),
            lapTimeInSeconds: lapTimeInSeconds,
        };
    });

    resultsWithTimes.sort((a, b) => a.lapTimeInSeconds - b.lapTimeInSeconds);

    return resultsWithTimes.map((result, index) => ({
        ...result,
        position: index + 1,
    }));
};

/**
 * Orchestrates the full multi-stage qualifying simulation.
 */
export const runFullQualifyingSimulation = (drivers: Driver[], teams: Team[], race: Race, weather: WeatherCondition, engineSuppliers: EngineSupplier[]) => {
    // --- Q1 ---
    const q1Results = simulateQualifyingStage(drivers, teams, race, weather, engineSuppliers);
    const q1FastestTime = q1Results[0].lapTimeInSeconds!;
    const time107 = q1FastestTime * 1.07;

    const q1Eliminated = q1Results.slice(15).map((res, index) => ({
        ...res,
        position: 16 + index,
        eliminatedIn: 'Q1' as const,
        status: res.lapTimeInSeconds! > time107 ? 'DNQ' as const : 'Qualified' as const,
    }));
    
    // --- Q2 ---
    const q2Drivers = q1Results.slice(0, 15).map(res => drivers.find(d => d.id === res.driverId)!);
    const q2Results = simulateQualifyingStage(q2Drivers, teams, race, weather, engineSuppliers);
    
    const q2Eliminated = q2Results.slice(10).map((res, index) => ({
        ...res,
        position: 11 + index,
        eliminatedIn: 'Q2' as const,
        status: 'Qualified' as const,
    }));

    // --- Q3 ---
    const q3Drivers = q2Results.slice(0, 10).map(res => drivers.find(d => d.id === res.driverId)!);
    const q3Results = simulateQualifyingStage(q3Drivers, teams, race, weather, engineSuppliers).map(res => ({
        ...res,
        status: 'Qualified' as const,
    }));

    // --- Compile Final Grid ---
    const finalGrid = [...q3Results, ...q2Eliminated, ...q1Eliminated];
    finalGrid.sort((a, b) => a.position - b.position);

    return {
        q1: q1Results,
        q2: q2Results,
        q3: q3Results,
        finalGrid,
    };
};