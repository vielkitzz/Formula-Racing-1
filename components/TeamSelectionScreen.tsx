import React from 'react';
import { Team } from '../types';
import { useI18n } from '../i18n';
import ImageWithFallback from './ImageWithFallback';
import { getInitials } from '../utils';
import HomeIcon from './icons/HomeIcon';

interface TeamSelectionScreenProps {
    teams: Team[];
    onSelect: (teamId: number) => void;
    onBack: () => void;
}

const TeamSelectionScreen: React.FC<TeamSelectionScreenProps> = ({ teams, onSelect, onBack }) => {
    const { t } = useI18n();

    return (
        <div className="max-w-4xl mx-auto p-6 sm:p-8 bg-[#1e1e2b]/80 border border-slate-700 rounded-2xl backdrop-blur-sm shadow-lg animate-fade-in">
            <div className="flex justify-between items-center mb-6 pb-4 border-b border-slate-700">
                <h2 className="text-3xl font-bold text-slate-200">{t('selectYourTeam')}</h2>
                 <button onClick={onBack} className="px-4 py-2 bg-slate-600/50 text-slate-300 font-bold uppercase rounded-lg shadow-md hover:bg-slate-500/50 flex items-center justify-center gap-2 transition-colors">
                    <HomeIcon className="w-5 h-5" />
                    <span>{t('back')}</span>
                </button>
            </div>
            <p className="text-center text-slate-400 mb-8">{t('selectYourTeam_desc')}</p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[60vh] overflow-y-auto pr-2">
                {teams.map(team => (
                    <button 
                        key={team.id}
                        onClick={() => onSelect(team.id)}
                        className="group w-full p-4 bg-slate-500/10 rounded-lg flex items-center gap-4 text-left border-2 border-transparent hover:border-[#00e051] hover:bg-slate-500/20 transition-all duration-200"
                    >
                        <ImageWithFallback
                            src={team.logoUrl}
                            alt={team.name}
                            primaryColor={team.primaryColor}
                            accentColor={team.accentColor}
                            initials={getInitials(team.name)}
                            type="team"
                            className="w-16 h-16 object-contain flex-shrink-0"
                        />
                        <div className="flex-grow">
                            <h3 className="text-xl font-bold text-white group-hover:text-[#00e051] transition-colors">{team.name}</h3>
                            <p className="text-sm text-slate-400">
                                {t('budget')}: <span className="font-semibold text-slate-300">${team.budget}M</span>
                            </p>
                        </div>
                    </button>
                ))}
            </div>
        </div>
    );
};

export default TeamSelectionScreen;
