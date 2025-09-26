import React, { useState } from 'react';
import { RegulationChangeProposal } from '../types';
import { useI18n } from '../i18n';
import CheckeredFlagIcon from './icons/CheckeredFlagIcon';

interface RegulationChangesScreenProps {
    proposals: RegulationChangeProposal[];
    year: number;
    onConfirm: (selectedProposal: RegulationChangeProposal | null) => void;
}

const RegulationChangesScreen: React.FC<RegulationChangesScreenProps> = ({ proposals, year, onConfirm }) => {
    const { t } = useI18n();
    const [selectedId, setSelectedId] = useState<string | null>(null);

    const handleConfirm = () => {
        const selectedProposal = proposals.find(p => p.id === selectedId) || null;
        onConfirm(selectedProposal);
    };

    return (
        <div className="max-w-4xl mx-auto p-6 sm:p-8 bg-[#1e1e2b]/80 border border-slate-700 rounded-2xl backdrop-blur-sm shadow-lg animate-fade-in">
            <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-slate-200">{t('regulationChanges_title', { year })}</h2>
                <p className="text-slate-400 mt-2">{t('regulationChanges_description')}</p>
            </div>

            <div className="space-y-4">
                {/* No Change Option */}
                <div
                    onClick={() => setSelectedId(null)}
                    className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${selectedId === null ? 'border-[#00e051] bg-[#00e051]/10' : 'border-slate-700 bg-slate-500/10 hover:border-slate-500'}`}
                >
                    <h3 className="font-bold text-lg text-slate-200">{t('regulationChanges_noChange')}</h3>
                    <p className="text-sm text-slate-400">{t('regulationChanges_noChange_desc')}</p>
                </div>
                
                {/* Proposal Options */}
                {proposals.map(proposal => (
                    <div
                        key={proposal.id}
                        onClick={() => setSelectedId(proposal.id)}
                        className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${selectedId === proposal.id ? 'border-[#00e051] bg-[#00e051]/10' : 'border-slate-700 bg-slate-500/10 hover:border-slate-500'}`}
                    >
                        <h3 className="font-bold text-lg text-slate-200">{t(proposal.titleKey)}</h3>
                        <p className="text-sm text-slate-400">{t(proposal.descriptionKey)}</p>
                    </div>
                ))}
            </div>

            <div className="text-center mt-8">
                <button
                    onClick={handleConfirm}
                    className="w-full sm:w-auto px-8 py-3 bg-[#e00601] text-white font-bold text-lg uppercase rounded-lg shadow-lg hover:bg-opacity-90 focus:outline-none focus:ring-4 focus:ring-[#e00601]/50 transform hover:scale-105 transition-all duration-300 flex items-center justify-center gap-3"
                >
                    <CheckeredFlagIcon className="w-6 h-6" />
                    <span>{t('regulationChanges_confirm')}</span>
                </button>
            </div>
        </div>
    );
};

export default RegulationChangesScreen;
