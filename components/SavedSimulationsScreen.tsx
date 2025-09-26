import React from 'react';
import { SaveData } from '../types';
import HomeIcon from './icons/HomeIcon';
import TrashIcon from './icons/TrashIcon';

interface SavedSimulationsScreenProps {
    simulations: SaveData[];
    onLoad: (id: string) => void;
    onDelete: (id: string) => void;
    onBackToMenu: () => void;
}

const SavedSimulationsScreen: React.FC<SavedSimulationsScreenProps> = ({ simulations, onLoad, onDelete, onBackToMenu }) => {
    return (
        <div className="max-w-4xl mx-auto p-6 sm:p-8 bg-[#1e1e2b]/80 border border-slate-700 rounded-2xl backdrop-blur-sm shadow-lg animate-fade-in">
            <div className="flex justify-between items-center mb-6 pb-4 border-b border-slate-700">
                <h2 className="text-3xl font-bold text-slate-200">Simulações Salvas</h2>
                <button 
                    onClick={onBackToMenu} 
                    className="px-4 py-2 bg-slate-600/50 text-slate-300 font-bold uppercase rounded-lg shadow-md hover:bg-slate-500/50 flex items-center justify-center gap-2 transition-colors"
                >
                    <HomeIcon className="w-5 h-5" />
                    <span>Voltar</span>
                </button>
            </div>

            {simulations.length === 0 ? (
                <p className="text-center text-slate-400 py-10">Nenhuma simulação salva encontrada.</p>
            ) : (
                <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
                    {simulations.map(sim => (
                        <div key={sim.id} className="bg-slate-500/10 p-4 rounded-lg flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 transition-all hover:bg-slate-500/20">
                            <div className="flex-grow">
                                <h3 className="text-xl font-bold text-white">{sim.name}</h3>
                                <p className="text-sm text-slate-400">
                                    Salvo em: {new Date(sim.savedAt).toLocaleString('pt-BR')}
                                </p>
                                <p className="text-sm text-slate-300 mt-1">
                                    Ano {sim.settings.startYear} - Próxima corrida: {sim.calendar[sim.currentRaceIndex]?.name || 'Temporada Concluída'}
                                </p>
                            </div>
                            <div className="flex items-center gap-2 self-end sm:self-center flex-shrink-0">
                                <button 
                                    onClick={() => onDelete(sim.id)} 
                                    className="p-3 bg-[#e00601]/20 hover:bg-[#e00601]/40 text-red-300 rounded-lg transition-colors"
                                    title="Excluir Simulação"
                                >
                                    <TrashIcon className="w-5 h-5"/>
                                </button>
                                <button 
                                    onClick={() => onLoad(sim.id)} 
                                    className="px-6 py-2 bg-[#00e051] text-black font-bold uppercase rounded-lg shadow-md hover:bg-opacity-90 transition-colors"
                                >
                                    Carregar
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default SavedSimulationsScreen;
