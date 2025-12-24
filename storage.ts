
import { SaveData, AppSkin, SeasonHistory, Country } from './types';

const STORAGE_KEY = 'formulaRacingSimSaves';
const SKINS_STORAGE_KEY = 'formulaRacingSkins';
const HISTORY_STORAGE_KEY = 'formulaRacingSimHistory';
const COUNTRIES_STORAGE_KEY = 'formulaRacingCustomCountries';

export const getSavedSimulations = (): SaveData[] => {
    try {
        const savedData = localStorage.getItem(STORAGE_KEY);
        if (savedData) {
            const simulations = JSON.parse(savedData) as SaveData[];
            // Sort by date, newest first
            return simulations.sort((a, b) => new Date(b.savedAt).getTime() - new Date(a.savedAt).getTime());
        }
    } catch (error) {
        console.error("Failed to load simulations:", error);
    }
    return [];
};

export const saveSimulation = (saveData: SaveData): void => {
    try {
        const existingSaves = getSavedSimulations();
        // Check for existing save with same ID and replace, or add new
        const index = existingSaves.findIndex(s => s.id === saveData.id);
        if (index > -1) {
            existingSaves[index] = saveData;
        } else {
            existingSaves.push(saveData);
        }
        localStorage.setItem(STORAGE_KEY, JSON.stringify(existingSaves));
    } catch (error) {
        console.error("Failed to save simulation:", error);
    }
};


export const deleteSimulation = (id: string): SaveData[] => {
    try {
        let existingSaves = getSavedSimulations();
        existingSaves = existingSaves.filter(s => s.id !== id);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(existingSaves));
        return existingSaves;
    } catch (error) {
        console.error("Failed to delete simulation:", error);
    }
    return getSavedSimulations();
};

export const getSavedSkins = (): AppSkin[] => {
    try {
        const savedData = localStorage.getItem(SKINS_STORAGE_KEY);
        if (savedData) {
            return JSON.parse(savedData) as AppSkin[];
        }
    } catch (error) {
        console.error("Failed to load skins:", error);
    }
    return [];
};

export const saveUserSkins = (skins: AppSkin[]): void => {
    try {
        const userSkins = skins.filter(s => s.isEditable);
        localStorage.setItem(SKINS_STORAGE_KEY, JSON.stringify(userSkins));
    } catch (error) {
        console.error("Failed to save skins:", error);
    }
};

export const getCustomCountries = (): Country[] => {
    try {
        const savedData = localStorage.getItem(COUNTRIES_STORAGE_KEY);
        if (savedData) {
            return JSON.parse(savedData) as Country[];
        }
    } catch (error) {
        console.error("Failed to load custom countries:", error);
    }
    return [];
};

export const saveCustomCountries = (countries: Country[]): void => {
    try {
        localStorage.setItem(COUNTRIES_STORAGE_KEY, JSON.stringify(countries));
    } catch (error) {
        console.error("Failed to save custom countries:", error);
    }
};

export const getSeasonHistory = (): SeasonHistory[] => {
    try {
        const savedData = localStorage.getItem(HISTORY_STORAGE_KEY);
        if (savedData) {
            const history = JSON.parse(savedData) as SeasonHistory[];
            // Sort by year, newest first
            return history.sort((a, b) => b.year - a.year);
        }
    } catch (error) {
        console.error("Failed to load season history:", error);
    }
    return [];
};

export const saveSeasonToHistory = (seasonData: SeasonHistory): void => {
    try {
        const existingHistory = getSeasonHistory();
        // Prevent duplicates by overwriting if the year already exists
        const index = existingHistory.findIndex(h => h.year === seasonData.year);
        if (index > -1) {
            existingHistory[index] = seasonData;
        } else {
            existingHistory.push(seasonData);
        }
        localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(existingHistory));
    } catch (error) {
        console.error("Failed to save season to history:", error);
    }
};
