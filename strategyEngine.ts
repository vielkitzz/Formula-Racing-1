import { QualifyingResult, Race, TyreCompound, LiveDriverState, Driver, RaceState, WeatherCondition, IncidentType } from './types';
// FIX: Corrected typo in imported member name from TYRE_COMPOPOUNDS to TYRE_COMPOUNDS.
import { TYRE_COMPOUNDS } from './constants';

/**
 * Gera estratégias de pneus de largada para todos os pilotos com base na posição de qualificação e no clima.
 */
export const generatePreRaceStrategies = (qualifyingResults: QualifyingResult[], weather: WeatherCondition): { driverId: number; startingTyre: TyreCompound }[] => {
    if (weather === 'LightRain') {
        return qualifyingResults.map(q => ({ driverId: q.driverId, startingTyre: TyreCompound.Intermediate }));
    }
    if (weather === 'HeavyRain') {
        return qualifyingResults.map(q => ({ driverId: q.driverId, startingTyre: TyreCompound.Wet }));
    }

    // Lógica probabilística para clima seco
    return qualifyingResults.map(q => {
        const rand = Math.random();
        let tyre: TyreCompound;

        if (q.position <= 8) { // Pilotos da frente
            if (rand < 0.8) tyre = TyreCompound.Soft; // 80% de chance
            else tyre = TyreCompound.Medium; // 20% de chance
        } else if (q.position <= 16) { // Meio do grid
            if (rand < 0.2) tyre = TyreCompound.Soft; // 20% de chance
            else if (rand < 0.7) tyre = TyreCompound.Medium; // 50% de chance
            else tyre = TyreCompound.Hard; // 30% de chance
        } else { // Fundo do grid
            if (rand < 0.1) tyre = TyreCompound.Soft; // 10% de chance
            else if (rand < 0.5) tyre = TyreCompound.Medium; // 40% de chance
            else tyre = TyreCompound.Hard; // 50% de chance
        }
        return { driverId: q.driverId, startingTyre: tyre };
    });
};

/**
 * Determines if a driver should make a pit stop on the current lap, incorporating advanced strategic factors.
 */
export const shouldDriverPit = (driverState: LiveDriverState, driver: Driver, raceState: RaceState): boolean => {
    if (driverState.status !== 'RACING') return false;

    // FIX: Corrected typo in variable name from TYRE_COMPOPOUNDS to TYRE_COMPOUNDS.
    const currentTyreInfo = TYRE_COMPOUNDS[driverState.currentTyres.compound];
    const isDryTyre = !!currentTyreInfo.lifespan;
    const isRaining = raceState.currentWeather === 'LightRain' || raceState.currentWeather === 'HeavyRain';

    // Critical pit stop for damage
    if (driverState.activeIncident?.type === IncidentType.FrontWingDamage) {
        return Math.random() < 0.95; // 95% chance to pit immediately to fix the wing
    }

    // 1. Mandatory pit stop for weather change
    if (isRaining && isDryTyre) return true;
    if (!isRaining && !isDryTyre) return true;

    // No strategic pitting for wet/inter tyres, it's all about weather
    if (!isDryTyre) return false;

    // 2. Safety Car opportunity (cheap pit stop)
    if (raceState.isSafetyCarDeployed) {
        const tyreAgeRatio = driverState.currentTyres.age / (raceState.totalLaps * currentTyreInfo.lifespan!);
        // If tyres are reasonably used, pitting under SC is a huge advantage
        if (tyreAgeRatio > 0.4 && driverState.currentTyres.age > 5) {
            return Math.random() < 0.85; // 85% chance to take the cheap pitstop
        }
    }

    // 3. Tyre Wear Cliff
    const performanceCliffWear = 85; // % wear where performance drops significantly
    if (driverState.currentTyres.wear > performanceCliffWear) {
        const urgency = (driverState.currentTyres.wear - performanceCliffWear) / (100 - performanceCliffWear); // 0 to 1 scale
        // Chance increases from 50% to 100% as wear goes from cliff to 100%
        if (Math.random() < 0.5 + urgency * 0.5) return true;
    }

    // 4. Strategic Window & Track Position
    const idealLifespanLaps = raceState.totalLaps * currentTyreInfo.lifespan!;
    const pitWindowStart = idealLifespanLaps * 0.85; // Open window a bit earlier for strategy
    const pitWindowEnd = idealLifespanLaps * 1.15;

    // Only consider strategic pits if inside the window or overdue
    if (driverState.currentTyres.age >= pitWindowStart) {
        const racingDrivers = raceState.drivers.filter(d => d.status === 'RACING').sort((a,b) => a.position - b.position);
        const myIndex = racingDrivers.findIndex(d => d.driverId === driverState.driverId);
        
        // Find driver ahead and behind on track
        const driverAhead = myIndex > 0 ? racingDrivers[myIndex - 1] : null;
        const driverBehind = myIndex < racingDrivers.length - 1 ? racingDrivers[myIndex + 1] : null;

        // "Free" pit stop logic
        const pitStopTimeLoss = 24; // Average time loss in seconds for a pit stop
        if (driverBehind) {
            const gapToBehind = driverBehind.totalTime - driverState.totalTime;
            if (gapToBehind > pitStopTimeLoss) {
                return Math.random() < 0.9; // 90% chance to take a free pit stop
            }
        } else { // Driver is last on track
             return Math.random() < 0.9; // Nothing to lose, take the free stop
        }

        // Undercut logic
        if (driverAhead) {
            const gapToAhead = driverState.totalTime - driverAhead.totalTime;
            // If close behind a rival on a similar strategy, try to undercut by pitting early
            if (gapToAhead < 2.0 && driverAhead.pitStops === driverState.pitStops) {
                 // Higher chance if on softer tyres
                const multiplier = driverState.currentTyres.compound === TyreCompound.Soft ? 0.7 : 0.4;
                if (Math.random() < multiplier) return true;
            }
        }
        
        // Standard pit stop logic if no special condition is met
        if (driverState.currentTyres.age > pitWindowEnd) return Math.random() < 0.95; // Overdue, almost certainly pit
        return Math.random() < 0.4; // Base chance of pitting each lap inside the window
    }

    return false;
};

/**
 * Chooses the best tyre compound for the next stint during a pit stop.
 */
export const chooseNextTyre = (driverState: LiveDriverState, raceState: RaceState): TyreCompound => {
    const { currentLap, totalLaps, currentWeather } = raceState;
    const lapsRemaining = totalLaps - currentLap;

    // 1. Weather-based choice is mandatory
    if (currentWeather === 'HeavyRain') return TyreCompound.Wet;
    if (currentWeather === 'LightRain') return TyreCompound.Intermediate;

    // 2. Dry tyre strategy logic
    // FIX: Corrected typo in variable name from TYRE_COMPOPOUNDS to TYRE_COMPOUNDS.
    const softLifespanLaps = totalLaps * TYRE_COMPOUNDS.Soft.lifespan!;
    // FIX: Corrected typo in variable name from TYRE_COMPOPOUNDS to TYRE_COMPOUNDS.
    const mediumLifespanLaps = totalLaps * TYRE_COMPOUNDS.Medium.lifespan!;
    // FIX: Corrected typo in variable name from TYRE_COMPOPOUNDS to TYRE_COMPOUNDS.
    const hardLifespanLaps = totalLaps * TYRE_COMPOUNDS.Hard.lifespan!;
    
    // Heuristic to determine if this is the final stop
    const isFinalStop = (driverState.pitStops >= 1 && currentLap > totalLaps * 0.4) || currentLap > totalLaps * 0.65;
    
    if (isFinalStop) {
        // Pick the fastest compound that can make it to the end
        if (lapsRemaining < softLifespanLaps * 1.05) {
            return TyreCompound.Soft; // Aggressive push to the end
        }
        if (lapsRemaining < mediumLifespanLaps * 1.05) {
            return TyreCompound.Medium; // Balanced choice
        }
        return TyreCompound.Hard; // Only choice to make it to the end
    } else {
        // This is the first stop, likely part of a two-stop strategy
        const lapsAfterNextStop = totalLaps - (currentLap + Math.min(mediumLifespanLaps, softLifespanLaps));
        
        // If a soft + medium strategy is possible, go for it
        if (lapsAfterNextStop < mediumLifespanLaps) {
            return driverState.currentTyres.compound === TyreCompound.Soft ? TyreCompound.Medium : TyreCompound.Soft;
        }

        // If on softs, move to a harder compound
        if (driverState.currentTyres.compound === TyreCompound.Soft) {
            return TyreCompound.Medium;
        }
        // If on mediums, can go for another medium stint or hards if necessary
        if (lapsRemaining > hardLifespanLaps + 5) { // Needs two more stops
            return TyreCompound.Medium;
        } else { // Can likely finish on Hards from here
            return TyreCompound.Hard;
        }
    }
};
