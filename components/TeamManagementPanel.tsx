import React from 'react';
import { Team, Driver, EngineSupplier } from '../types';
import { useI18n } from '../i18n';
import BanknotesIcon from './icons/BanknotesIcon';
import WrenchScrewdriverIcon from './icons/WrenchScrewdriverIcon';
import UsersIcon from './icons/UsersIcon';
import CpuChipIcon from './icons/CpuChipIcon';
import StatBar from './StatBar';
import ImageWithFallback from './ImageWithFallback';
import { getInitials } from '../utils';

interface TeamManagementPanelProps {
    team: Team;
    drivers: Driver[];
    engineSupplier: EngineSupplier;
    onUpgradeFacility: (facility: keyof Team['facilities']) => void;
}

const TeamManagementPanel: React.FC<TeamManagementPanelProps> = ({ team, drivers, engineSupplier, onUpgradeFacility }) => {
    const { t } = useI18n();

    return (
        <div className="space-y-8 animate-fade-in">
            {/* Finances */}
            <div className="bg-slate-500/10 p-6 rounded-lg">
                <h3 className="text-xl font-bold text-slate-200 mb-4 flex items-center gap-3"><BanknotesIcon className="w-6 h-6"/>{t('finances')}</h3>
                <div className="text-center">
                    <p className="text-sm uppercase text-slate-400">{t('budget')}</p>
                    <p className="text-5xl font-black text-green-400 tracking-tighter">${team.budget.toFixed(2)}M</p>
                </div>
            </div>

            {/* Facilities */}
            <div className="bg-slate-500/10 p-6 rounded-lg">
                <h3 className="text-xl font-bold text-slate-200 mb-4 flex items-center gap-3"><WrenchScrewdriverIcon className="w-6 h-6"/>{t('facilities')}</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {(Object.keys(team.facilities) as Array<keyof Team['facilities']>).map(key => {
                        const level = team.facilities[key];
                        const upgradeCost = (level + 1) * 2;
                        return (
                            <div key={key} className="bg-slate-900/50 p-4 rounded-lg">
                                <h4 className="font-bold text-slate-300">{t(`facility_${key}`)}</h4>
                                <p className="text-sm text-slate-400 mb-3">{t('level')} {level}</p>
                                <StatBar label={t('level')} value={level} max={20} />
                                <button 
                                    onClick={() => onUpgradeFacility(key)}
                                    disabled={team.budget < upgradeCost || level >= 20}
                                    className="w-full mt-4 px-4 py-2 bg-[#00e051] text-black font-bold text-sm rounded-md hover:bg-opacity-90 disabled:bg-slate-600 disabled:text-slate-400 disabled:cursor-not-allowed transition-colors"
                                >
                                    {level >= 20 ? t('max_level') : `${t('upgrade')} ($${upgradeCost}M)`}
                                </button>
                            </div>
                        )
                    })}
                </div>
            </div>

            {/* Personnel */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-slate-500/10 p-6 rounded-lg">
                    <h3 className="text-xl font-bold text-slate-200 mb-4 flex items-center gap-3"><UsersIcon className="w-6 h-6"/>{t('drivers')}</h3>
                    <div className="space-y-4">
                        {drivers.map(driver => (
                             <div key={driver.id} className="flex items-center gap-4">
                                <ImageWithFallback src={driver.photoUrl} alt={driver.name} primaryColor={team.primaryColor} accentColor={team.accentColor} initials={getInitials(driver.name)} type="driver" className="w-12 h-12 rounded-full object-cover"/>
                                <div>
                                    <p className="font-semibold text-slate-200">{driver.name}</p>
                                    <p className="text-sm text-slate-400">{t('salary')}: ${driver.salary}M / {t('yearly')}</p>
                                    <p className="text-sm text-slate-400">{t('contract')}: {t('until_end_of')} {driver.contractEndsYear}</p>
                                </div>
                             </div>
                        ))}
                    </div>
                </div>
                <div className="bg-slate-500/10 p-6 rounded-lg">
                    <h3 className="text-xl font-bold text-slate-200 mb-4 flex items-center gap-3"><CpuChipIcon className="w-6 h-6"/>{t('engineSupplier')}</h3>
                     <div>
                        <p className="font-semibold text-2xl text-slate-200">{engineSupplier.name}</p>
                        <p className="text-sm text-slate-400">{t('cost')}: ${engineSupplier.cost}M / {t('yearly')}</p>
                        <div className="mt-4">
                            <StatBar label={t('performance')} value={engineSupplier.performance} max={100} />
                        </div>
                     </div>
                </div>
            </div>
        </div>
    );
};

export default TeamManagementPanel;