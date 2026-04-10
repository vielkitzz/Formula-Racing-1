
import React from 'react';
import { useI18n } from '../i18n';
import PlayIcon from './icons/PlayIcon';
import PencilIcon from './icons/PencilIcon';
import FolderIcon from './icons/FolderIcon';
import ForwardIcon from './icons/ForwardIcon';
import UserIcon from './icons/UserIcon';

interface MainMenuProps {
  onStart: () => void;
  onEdit: () => void;
  onLoad: () => void;
  onContinue: () => void;
  onStartOwnerMode: () => void;
  hasSaves: boolean;
}

const MainMenu: React.FC<MainMenuProps> = ({ onStart, onEdit, onLoad, onContinue, onStartOwnerMode, hasSaves }) => {
  const { t } = useI18n();

  return (
    <div className="flex flex-col items-center justify-center h-full max-w-5xl mx-auto px-6 overflow-hidden py-4">
      <div className="text-center mb-8 animate-fade-in flex-shrink-0">
        <div className="inline-block px-3 py-0.5 mb-2 text-[9px] font-black uppercase tracking-[0.3em] bg-red-600 text-white rounded-sm">Season Simulator</div>
        <h1 className="text-5xl md:text-7xl font-black uppercase tracking-tighter text-white mb-2 italic font-racing leading-none">
            Formula<span className="text-red-600">Racing</span>
        </h1>
        <p className="text-slate-500 text-sm max-w-lg mx-auto font-medium leading-relaxed">
            {t('mainMenu_description')}
        </p>
      </div>
      
      <div className="w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4 content-center flex-1 min-h-0 max-h-[500px]">
        {hasSaves && (
            <button
                onClick={onContinue}
                className="group relative glass overflow-hidden rounded-xl transition-all duration-300 hover:scale-[1.02] border-l-4 border-l-[#00ff85] flex items-center p-4 gap-4 h-full"
            >
                <div className="p-3 bg-[#00ff85]/10 rounded-lg group-hover:bg-[#00ff85]/20 transition-colors">
                    <ForwardIcon className="w-6 h-6 text-[#00ff85]" />
                </div>
                <div className="text-left flex-grow">
                    <h3 className="text-lg font-black uppercase text-white font-racing tracking-tight">{t('mainMenu_continueTitle')}</h3>
                    <p className="text-slate-500 text-xs font-bold uppercase tracking-tighter">{t('mainMenu_continueDescription')}</p>
                </div>
            </button>
        )}

        <button
            onClick={onStartOwnerMode}
            className="group relative glass overflow-hidden rounded-xl transition-all duration-300 hover:scale-[1.02] border-l-4 border-l-red-600 flex items-center p-4 gap-4 h-full"
        >
            <div className="p-3 bg-red-600/10 rounded-lg group-hover:bg-red-600 transition-colors">
                <UserIcon className="w-6 h-6 text-red-500 group-hover:text-white" />
            </div>
            <div className="text-left flex-grow">
                <h3 className="text-lg font-black uppercase text-white font-racing tracking-tight">{t('teamOwner')}</h3>
                <p className="text-slate-500 text-xs font-bold uppercase tracking-tighter">{t('teamOwner_description').substring(0, 45)}...</p>
            </div>
        </button>

        <button
            onClick={onStart}
            className="group relative glass overflow-hidden rounded-xl transition-all duration-300 hover:scale-[1.02] border-l-4 border-l-white flex items-center p-4 gap-4 h-full"
        >
            <div className="p-3 bg-white/10 rounded-lg group-hover:bg-white transition-colors">
                <PlayIcon className="w-6 h-6 text-white group-hover:text-black" />
            </div>
            <div className="text-left flex-grow">
                <h3 className="text-lg font-black uppercase text-white font-racing tracking-tight">{t('mainMenu_startTitle')}</h3>
                <p className="text-slate-500 text-xs font-bold uppercase tracking-tighter">{t('mainMenu_startDescription')}</p>
            </div>
        </button>

        <button 
            onClick={onLoad} 
            className="group glass rounded-xl transition-all duration-300 hover:scale-[1.02] flex items-center p-4 gap-4 border-l-4 border-l-blue-600 h-full"
        >
            <div className="p-3 bg-blue-600/10 rounded-lg group-hover:bg-blue-600 transition-colors">
                <FolderIcon className="w-6 h-6 text-blue-500 group-hover:text-white" />
            </div>
            <div className="text-left flex-grow">
                <h4 className="text-lg font-black uppercase text-white font-racing tracking-tight">{t('mainMenu_loadTitle')}</h4>
                <p className="text-slate-500 text-xs font-bold uppercase tracking-tighter">Carregar arquivo .json do seu computador</p>
            </div>
        </button>

        <button 
            onClick={onEdit} 
            className="group glass rounded-xl transition-all duration-300 hover:scale-[1.02] flex items-center p-4 gap-4 border-l-4 border-l-purple-600 h-full"
        >
            <div className="p-3 bg-purple-600/10 rounded-lg group-hover:bg-purple-600 transition-colors">
                <PencilIcon className="w-6 h-6 text-purple-500 group-hover:text-white" />
            </div>
            <div className="text-left flex-grow">
                <h4 className="text-lg font-black uppercase text-white font-racing tracking-tight">{t('mainMenu_editTitle')}</h4>
                <p className="text-slate-500 text-xs font-bold uppercase tracking-tighter">{t('mainMenu_editDescription')}</p>
            </div>
        </button>
      </div>

      <div className="mt-8 text-[9px] font-black uppercase tracking-[0.4em] text-slate-700 animate-fade-in stagger-3">
        Engine V3.2 • 2024 Stable
      </div>
    </div>
  );
};

export default MainMenu;
