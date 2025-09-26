
import React from 'react';
import PauseIcon from './icons/PauseIcon';
import PlayIcon from './icons/PlayIcon';
import { useI18n } from '../i18n';

interface SpeedControlProps {
  currentSpeed: number;
  onSpeedChange: (speed: number) => void;
  isPaused: boolean;
  onPauseToggle: () => void;
}

const SPEEDS = [0.5, 1, 2, 4, 8];

const SpeedControl: React.FC<SpeedControlProps> = ({ currentSpeed, onSpeedChange, isPaused, onPauseToggle }) => {
  const { t } = useI18n();
  return (
    <div className="flex items-center gap-1 sm:gap-2 bg-black/30 p-1 rounded-full border border-slate-700">
      <button
        onClick={onPauseToggle}
        className={`p-1.5 rounded-full transition-colors duration-200 ${
          isPaused ? 'bg-[#00e051] text-black' : 'bg-slate-600 text-white hover:bg-slate-500'
        }`}
        aria-label={isPaused ? t('aria_resumeSimulation') : t('aria_pauseSimulation')}
      >
        {isPaused ? <PlayIcon className="w-5 h-5" /> : <PauseIcon className="w-5 h-5" />}
      </button>
      <div className="w-px h-5 bg-slate-600"></div>
      <span className="hidden sm:inline text-xs font-bold text-slate-400 px-2 uppercase">{t('speed')}</span>
      {SPEEDS.map(speed => (
        <button
          key={speed}
          onClick={() => onSpeedChange(speed)}
          disabled={isPaused}
          className={`px-2 py-1 text-xs font-bold rounded-full transition-colors duration-200 w-10 ${
            currentSpeed === speed && !isPaused
              ? 'bg-[#e00601] text-white'
              : 'text-slate-300'
          } ${
            isPaused ? 'opacity-50 cursor-not-allowed' : 'hover:bg-white/10'
          }`}
        >
          {speed}x
        </button>
      ))}
    </div>
  );
};

export default SpeedControl;