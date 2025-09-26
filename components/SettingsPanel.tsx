
import React, { useState } from 'react';
import { AppSkin } from '../types';
import { Language, useI18n } from '../i18n';
import CloseIcon from './icons/CloseIcon';
import SkinEditor from './SkinEditor';
import CogIcon from './icons/CogIcon';
import PaintBrushIcon from './icons/PaintBrushIcon';
import { DEFAULT_SKINS } from '../constants';

type SettingsTab = 'general' | 'appearance';

interface SettingsPanelProps {
    isOpen: boolean;
    onClose: () => void;
    language: Language;
    onLanguageChange: (lang: Language) => void;
    skin: AppSkin;
    onSkinChange: React.Dispatch<React.SetStateAction<AppSkin>>;
    userSkins: AppSkin[];
    setUserSkins: React.Dispatch<React.SetStateAction<AppSkin[]>>;
    availableSkins: AppSkin[];
}

const SettingsPanel: React.FC<SettingsPanelProps> = ({ isOpen, onClose, language, onLanguageChange, skin, onSkinChange, userSkins, setUserSkins, availableSkins }) => {
    const { t } = useI18n();
    const [activeTab, setActiveTab] = useState<SettingsTab>('general');

    if (!isOpen) return null;
    
    const TabButton: React.FC<{ tab: SettingsTab, label: string, icon: React.ReactNode }> = ({ tab, label, icon }) => (
        <button
            onClick={() => setActiveTab(tab)}
            className={`flex items-center justify-center gap-2 px-4 py-3 text-sm font-bold uppercase rounded-t-lg transition-all duration-300 border-b-2 ${activeTab === tab ? 'text-[#00e051] border-[#00e051]' : 'text-slate-400 border-transparent hover:text-slate-200'}`}
        >
            {icon}
            <span>{label}</span>
        </button>
    );

    return (
        <div 
            className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 p-4 backdrop-blur-sm"
            onClick={onClose}
        >
            <div 
                className="bg-[#1e1e2b] border border-slate-700 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto flex flex-col animate-fade-in"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="sticky top-0 bg-[#1e1e2b]/80 backdrop-blur-sm z-10 p-4 sm:p-6 border-b border-slate-700 flex justify-between items-center">
                    <h2 className="text-2xl font-bold text-slate-200">{t('settings_title')}</h2>
                    <button onClick={onClose} className="text-slate-400 hover:text-white">
                        <CloseIcon className="w-6 h-6" />
                    </button>
                </div>

                <div className="flex flex-wrap border-b border-slate-700 px-4">
                    <TabButton tab="general" label={t('settings_general')} icon={<CogIcon className="w-5 h-5"/>} />
                    <TabButton tab="appearance" label={t('settings_appearance')} icon={<PaintBrushIcon className="w-5 h-5"/>} />
                </div>
                
                <div className="p-4 sm:p-6 flex-grow">
                    {activeTab === 'general' && (
                        <div className="space-y-6">
                            <div>
                                <label className="block text-sm font-medium text-slate-400 mb-2">{t('settings_language')}</label>
                                <div className="flex gap-2">
                                    <button 
                                        onClick={() => onLanguageChange('pt-BR')} 
                                        className={`px-4 py-2 rounded-md font-bold text-sm transition-colors ${language === 'pt-BR' ? 'bg-[#00e051] text-black' : 'bg-slate-700 text-white hover:bg-slate-600'}`}
                                    >
                                        Português
                                    </button>
                                     <button 
                                        onClick={() => onLanguageChange('en-US')} 
                                        className={`px-4 py-2 rounded-md font-bold text-sm transition-colors ${language === 'en-US' ? 'bg-[#00e051] text-black' : 'bg-slate-700 text-white hover:bg-slate-600'}`}
                                    >
                                        English
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                    {activeTab === 'appearance' && (
                        <SkinEditor
                            skin={skin}
                            onSkinChange={onSkinChange}
                            userSkins={userSkins}
                            setUserSkins={setUserSkins}
                            availableSkins={availableSkins}
                        />
                    )}
                </div>
                
                <div className="sticky bottom-0 bg-[#1e1e2b]/80 backdrop-blur-sm z-10 p-4 border-t border-slate-700 flex justify-end">
                    <button
                        onClick={onClose}
                        className="px-6 py-2 bg-[#e00601] text-white font-bold uppercase rounded-lg shadow-md hover:bg-opacity-90 flex items-center justify-center gap-2 transition-colors"
                    >
                        <CloseIcon className="w-5 h-5" />
                        <span>{t('close')}</span>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default SettingsPanel;