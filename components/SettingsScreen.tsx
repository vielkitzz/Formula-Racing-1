import React, { useState } from 'react';
import { SeasonSettings } from '../types';
import { SCORING_SYSTEMS } from '../constants';
import CheckeredFlagIcon from './icons/CheckeredFlagIcon';
import HomeIcon from './icons/HomeIcon';
import { useI18n } from '../i18n';

interface SettingsScreenProps {
  settings: SeasonSettings | null;
  onStartSeason: (settings: SeasonSettings) => void;
  onBackToMenu: () => void;
}

const SettingsScreen: React.FC<SettingsScreenProps> = ({ settings, onStartSeason, onBackToMenu }) => {
  const { t } = useI18n();
  const [startYear, setStartYear] = useState<number>(settings?.startYear || new Date().getFullYear());
  const [scoringSystemId, setScoringSystemId] = useState<number>(settings?.scoringSystemId || SCORING_SYSTEMS[0].id);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onStartSeason({ 
        ...settings!,
        startYear, 
        scoringSystemId 
    });
  };

  return (
    <div className="max-w-2xl mx-auto p-6 sm:p-8 bg-[#1e1e2b]/80 border border-slate-700 rounded-2xl backdrop-blur-sm shadow-lg">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold text-slate-200">{t('settings_title')}</h2>
        <button onClick={onBackToMenu} className="px-4 py-2 bg-slate-600/50 text-slate-300 font-bold uppercase rounded-lg shadow-md hover:bg-slate-500/50 flex items-center justify-center gap-2 transition-colors">
            <HomeIcon className="w-5 h-5" />
            <span>{t('back')}</span>
        </button>
      </div>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="startYear" className="block text-sm font-medium text-slate-400 mb-2">
            {t('settings_startYear')}
          </label>
          <input
            type="number"
            id="startYear"
            value={startYear}
            onChange={(e) => setStartYear(parseInt(e.target.value, 10))}
            className="w-full px-4 py-2 bg-[#15141f] border border-slate-700 rounded-md focus:outline-none focus:ring-2 focus:ring-[#00e051] focus:border-[#00e051]"
          />
        </div>
        <div>
          <label htmlFor="scoringSystem" className="block text-sm font-medium text-slate-400 mb-2">
            {t('settings_scoringSystem')}
          </label>
          <select
            id="scoringSystem"
            value={scoringSystemId}
            onChange={(e) => setScoringSystemId(parseInt(e.target.value, 10))}
            className="w-full px-4 py-2 bg-[#15141f] border border-slate-700 rounded-md focus:outline-none focus:ring-2 focus:ring-[#00e051] focus:border-[#00e051]"
          >
            {SCORING_SYSTEMS.map((system) => (
              <option key={system.id} value={system.id} className="bg-[#1e1e2b]">
                {t(system.name)}
              </option>
            ))}
          </select>
        </div>
        <div className="pt-4">
          <button
            type="submit"
            className="w-full px-8 py-3 bg-[#e00601] text-white font-bold text-lg uppercase rounded-lg shadow-lg hover:bg-opacity-90 focus:outline-none focus:ring-4 focus:ring-[#e00601]/50 transform hover:scale-105 transition-all duration-300 flex items-center justify-center gap-3"
          >
            <CheckeredFlagIcon className="w-6 h-6" />
            <span>{t('settings_startSeason')}</span>
          </button>
        </div>
      </form>
    </div>
  );
};

export default SettingsScreen;