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
    <div className="flex flex-col items-center justify-center p-4">
      <div className="text-center mb-12 animate-fade-in">
        <h1 className="text-5xl md:text-7xl font-black uppercase tracking-wider text-slate-100 mb-4">
            Formula Racing 1
        </h1>
        <p className="text-slate-400 text-lg max-w-2xl mx-auto">
            {t('mainMenu_description')}
        </p>
      </div>
      
      <div className="w-full max-w-4xl space-y-8">
        {hasSaves && (
            <div className="animate-fade-in" style={{ animationDelay: '150ms' }}>
                 <button
                    onClick={onContinue}
                    className="group w-full p-6 bg-gradient-to-br from-[#00e051]/80 to-[#00a031]/80 border border-[#00e051] rounded-2xl backdrop-blur-sm shadow-lg hover:border-green-300 transition-all duration-300 transform hover:-translate-y-1"
                >
                    <div className="flex flex-col md:flex-row items-center text-center md:text-left gap-6">
                        <div className="p-3 bg-white/20 rounded-full">
                            <ForwardIcon className="w-8 h-8 text-white" />
                        </div>
                        <div>
                            <h3 className="text-2xl font-bold uppercase text-white mb-1">{t('mainMenu_continueTitle')}</h3>
                            <p className="text-green-100">
                            {t('mainMenu_continueDescription')}
                            </p>
                        </div>
                    </div>
                </button>
            </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full">
             <div className="animate-fade-in" style={{ animationDelay: '300ms' }}>
                <button
                    onClick={onStartOwnerMode}
                    className="group h-full w-full p-8 bg-[#1e1e2b]/80 border border-slate-700 rounded-2xl backdrop-blur-sm shadow-lg hover:border-[#e00601] transition-all duration-300 transform hover:-translate-y-1"
                >
                    <div className="flex flex-col items-center text-center">
                        <div className="p-4 bg-slate-600 group-hover:bg-[#e00601] transition-colors rounded-full mb-4">
                            <UserIcon className="w-10 h-10 text-white" />
                        </div>
                        <h3 className="text-2xl font-bold uppercase text-slate-200 mb-2">{t('teamOwner')}</h3>
                        <p className="text-slate-400">
                        {t('teamOwner_description')}
                        </p>
                    </div>
                </button>
            </div>
             <div className="animate-fade-in" style={{ animationDelay: '450ms' }}>
                <button
                    onClick={onStart}
                    className="group h-full w-full p-8 bg-[#1e1e2b]/80 border border-slate-700 rounded-2xl backdrop-blur-sm shadow-lg hover:border-[#00e051] transition-all duration-300 transform hover:-translate-y-1"
                >
                    <div className="flex flex-col items-center text-center">
                        <div className="p-4 bg-slate-600 group-hover:bg-[#00e051] transition-colors rounded-full mb-4">
                            <PlayIcon className="w-10 h-10 text-white" />
                        </div>
                        <h3 className="text-2xl font-bold uppercase text-slate-200 mb-2">{t('mainMenu_startTitle')}</h3>
                        <p className="text-slate-400">
                        {t('mainMenu_startDescription')}
                        </p>
                    </div>
                </button>
            </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full">
            <div className="animate-fade-in" style={{ animationDelay: '600ms' }}>
                <button
                    onClick={onLoad}
                    className="group h-full w-full p-6 bg-[#1e1e2b]/80 border border-slate-700 rounded-2xl backdrop-blur-sm shadow-lg hover:border-[#3b82f6] transition-all duration-300 transform hover:-translate-y-1"
                >
                    <div className="flex flex-col items-center text-center">
                        <div className="p-3 bg-slate-600 group-hover:bg-[#3b82f6] transition-colors rounded-full mb-3">
                            <FolderIcon className="w-8 h-8 text-white" />
                        </div>
                        <h3 className="text-xl font-bold uppercase text-slate-200 mb-1">{t('mainMenu_loadTitle')}</h3>
                        <p className="text-sm text-slate-400">
                        {t('mainMenu_loadDescription')}
                        </p>
                    </div>
                </button>
            </div>
            <div className="animate-fade-in" style={{ animationDelay: '750ms' }}>
                <button
                    onClick={onEdit}
                    className="group h-full w-full p-6 bg-[#1e1e2b]/80 border border-slate-700 rounded-2xl backdrop-blur-sm shadow-lg hover:border-[#a855f7] transition-all duration-300 transform hover:-translate-y-1"
                >
                    <div className="flex flex-col items-center text-center">
                        <div className="p-3 bg-slate-600 group-hover:bg-[#a855f7] transition-colors rounded-full mb-3">
                            <PencilIcon className="w-8 h-8 text-white" />
                        </div>
                        <h3 className="text-xl font-bold uppercase text-slate-200 mb-1">{t('mainMenu_editTitle')}</h3>
                        <p className="text-sm text-slate-400">
                        {t('mainMenu_editDescription')}
                        </p>
                    </div>
                </button>
            </div>
        </div>
      </div>
    </div>
  );
};

export default MainMenu;