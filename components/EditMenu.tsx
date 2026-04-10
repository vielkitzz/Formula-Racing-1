
import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Driver, Team, Race, EngineSupplier, Country } from '../types';
import { COUNTRIES } from '../constants';
import CountrySelector from './CountrySelector';
import TrashIcon from './icons/TrashIcon';
import HomeIcon from './icons/HomeIcon';
import UserIcon from './icons/UserIcon';
import UserGroupIcon from './icons/UserGroupIcon';
import CalendarIcon from './icons/CalendarIcon';
import PlusIcon from './icons/PlusIcon';
import CloudArrowUpIcon from './icons/CloudArrowUpIcon';
import DiceIcon from './icons/DiceIcon';
import CogIcon from './icons/CogIcon';
import CheckeredFlagIcon from './icons/CheckeredFlagIcon';
import FlagIcon from './icons/FlagIcon';
import CloseIcon from './icons/CloseIcon';
import { useI18n } from '../i18n';
import ImageWithFallback from './ImageWithFallback';
import { getInitials } from '../utils';
import PromptModal from './PromptModal';
import CountryFlag from './CountryFlag';

interface EditMenuProps {
    drivers: Driver[];
    teams: Team[];
    calendar: Race[];
    engineSuppliers: EngineSupplier[];
    customCountries: Country[];
    setDrivers: React.Dispatch<React.SetStateAction<Driver[]>>;
    setTeams: React.Dispatch<React.SetStateAction<Team[]>>;
    setCalendar: React.Dispatch<React.SetStateAction<Race[]>>;
    setEngineSuppliers: React.Dispatch<React.SetStateAction<EngineSupplier[]>>;
    setCustomCountries: (countries: Country[]) => void;
    onBackToMenu: () => void;
    isOffSeason?: boolean;
    hidePotential: boolean;
    setHidePotential: React.Dispatch<React.SetStateAction<boolean>>;
    onRandomizeAllPotentials: () => void;
}

type EditTab = 'drivers' | 'teams' | 'calendar' | 'engines' | 'countries';

// --- HELPER COMPONENTS ---

const EditableStatInput: React.FC<{
    label: string;
    value: number;
    onChange: (newValue: number) => void;
    min: number;
    max: number;
    step?: number;
    className?: string;
    isFloat?: boolean;
}> = ({ label, value, onChange, min, max, step = 1, className = '', isFloat = false }) => {
    const [displayValue, setDisplayValue] = useState(String(value));

    useEffect(() => {
        setDisplayValue(String(value));
    }, [value]);

    const handleBlur = () => {
        let num = isFloat ? parseFloat(displayValue) : parseInt(displayValue, 10);
        if (isNaN(num)) {
            num = min;
        }
        const clamped = Math.max(min, Math.min(max, num));
        const finalValue = isFloat ? parseFloat(clamped.toFixed(1)) : clamped;

        if (finalValue !== value) {
            onChange(finalValue);
        }
        setDisplayValue(String(finalValue));
    };

    const uniqueId = React.useId();

    return (
        <div className={className}>
            <label htmlFor={uniqueId} className="text-[10px] uppercase text-slate-500 mb-0.5 block font-bold">{label}</label>
            <input
                id={uniqueId}
                type="number" 
                min={min} 
                max={max} 
                step={step}
                value={displayValue} 
                onChange={(e) => setDisplayValue(e.target.value)} 
                onBlur={handleBlur}
                className="w-full bg-[#08080c] p-2 rounded text-sm border border-slate-700 focus:outline-none focus:border-[#00e051] text-center font-mono text-slate-200" 
            />
        </div>
    );
};

const ColorInput: React.FC<{ label: string; value: string; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void; }> = ({ label, value, onChange }) => (
    <div>
        <label className="text-[10px] uppercase text-slate-500 mb-0.5 block font-bold">{label}</label>
        <div className="flex items-center gap-2 bg-[#08080c] p-1.5 rounded text-xs border border-slate-700 focus-within:border-[#00e051]">
            <input type="color" value={value} onChange={onChange} className="w-6 h-6 p-0 border-none bg-transparent cursor-pointer" />
            <input type="text" value={value} onChange={onChange} className="w-full bg-transparent outline-none font-mono text-slate-200 uppercase" />
        </div>
    </div>
);

const ImageUploader: React.FC<{ id: string | number, currentImage: string | undefined, onUpload: (e: React.ChangeEvent<HTMLInputElement>) => void, onRemove: () => void, type: 'driver' | 'team' }> = ({ id, currentImage, onUpload, onRemove, type }) => {
    const { t } = useI18n();
    return (
         <div className="w-full">
            <label className="text-[10px] uppercase text-slate-500 mb-0.5 block font-bold">{type === 'driver' ? t('edit_driverPhoto') : t('edit_teamLogo')}</label>
            <div className="flex items-center gap-2">
                <input id={`${type}-upload-${id}`} type="file" accept="image/png, image/jpeg, image/webp" className="hidden" onChange={onUpload} />
                <label htmlFor={`${type}-upload-${id}`} className="flex-grow cursor-pointer p-2 bg-slate-800 hover:bg-slate-700 rounded text-center text-[10px] uppercase font-black flex items-center justify-center gap-2 transition-colors border border-slate-700 text-slate-300">
                    <CloudArrowUpIcon className="w-3.5 h-3.5" />
                    <span>{currentImage ? t('edit_changeImage') : t('edit_uploadImage')}</span>
                </label>
                {currentImage && (<button onClick={onRemove} className="p-2 bg-red-900/20 text-red-500 hover:bg-red-900/40 rounded border border-red-900/50" title={t('edit_removeImage')}><TrashIcon className="w-3.5 h-3.5"/></button>)}
            </div>
        </div>
    );
};

// --- MAIN COMPONENT ---

const EditMenu: React.FC<EditMenuProps> = ({
    drivers,
    teams,
    calendar,
    engineSuppliers,
    customCountries,
    setDrivers,
    setTeams,
    setCalendar,
    setEngineSuppliers,
    setCustomCountries,
    onBackToMenu,
    isOffSeason = false,
    hidePotential,
    setHidePotential,
    onRandomizeAllPotentials,
}) => {
    const { t } = useI18n();
    const [activeTab, setActiveTab] = useState<EditTab>('drivers');
    const [editingId, setEditingId] = useState<string | number | null>(null);
    const [modalState, setModalState] = useState<{
        isOpen: boolean;
        title: string;
        message: string;
        onConfirm: () => void;
    } | null>(null);
    const importInputRef = useRef<HTMLInputElement>(null);
    const newCountryInputRef = useRef<HTMLInputElement>(null);
    const [newCountryName, setNewCountryName] = useState('');

    const driverCountsByTeam = useMemo(() => {
        return teams.reduce((acc, team) => {
            acc[team.id] = drivers.filter(d => d.teamId === team.id).length;
            return acc;
        }, {} as Record<number, number>);
    }, [drivers, teams]);

    const isAnyTeamAvailable = useMemo(() => teams.some(t => (driverCountsByTeam[t.id] || 0) < 2), [teams, driverCountsByTeam]);
    
    // -- Handlers --

    const handleDriverChange = (id: number, field: keyof Driver, value: string | number) => {
        if (field === 'teamId') {
            const driver = drivers.find(d => d.id === id);
            if (driver && driver.teamId !== value) {
                const oldTeamDriverCount = driverCountsByTeam[driver.teamId];
                if (oldTeamDriverCount <= 1) {
                    alert(t('edit_error_lastDriver'));
                    return;
                }
            }
        }
        setDrivers(prev => prev.map(d => d.id === id ? { ...d, [field]: value } : d));
    };

    const handleTeamChange = (id: number, field: keyof Team, value: string | number) => {
        setTeams(prev => prev.map(t => t.id === id ? { ...t, [field]: value } : t));
    };

    const handleImageUpload = (id: number, type: 'driver' | 'team', e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || !file.type.startsWith('image/')) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            const dataUrl = event.target?.result as string;
            if (type === 'driver') {
                setDrivers(prev => prev.map(d => d.id === id ? { ...d, photoUrl: dataUrl } : d));
            } else {
                setTeams(prev => prev.map(t => t.id === id ? { ...t, logoUrl: dataUrl } : t));
            }
        };
        reader.readAsDataURL(file);
    };

    const handleRaceChange = (index: number, field: keyof Race, value: string | number | Race['weatherChances']) => {
        setCalendar(prev => prev.map((r, i) => {
            if (i !== index) return r;
            let updatedRace = { ...r };
            if (field === 'weatherChances') {
                updatedRace.weatherChances = value as Race['weatherChances'];
            } else if (field === 'laps') {
                const lapsNum = parseInt(String(value), 10);
                (updatedRace as any)[field] = isNaN(lapsNum) || lapsNum < 1 ? 1 : lapsNum;
            } else {
                (updatedRace as any)[field] = value;
            }
            return updatedRace;
        }));
    };
    
    const handleRaceCountryChange = (index: number, countryCode: string) => {
        const country = [...COUNTRIES, ...customCountries].find(c => c.code === countryCode);
        if (country) {
            setCalendar(prev => prev.map((r, i) =>
                i === index ? { ...r, country: country.name, countryCode: country.code } : r
            ));
        }
    };
    
    const handleRandomizeDriverStats = (id: number) => {
        setDrivers(prev => prev.map(d => {
            if (d.id === id) {
                return {
                    ...d,
                    startSkill: Math.floor(Math.random() * 10) + 1,
                    concentration: Math.floor(Math.random() * 10) + 1,
                    overtaking: Math.floor(Math.random() * 10) + 1,
                    experience: Math.floor(Math.random() * 10) + 1,
                    speed: Math.floor(Math.random() * 10) + 1,
                    rainSkill: Math.floor(Math.random() * 10) + 1,
                    setupSkill: Math.floor(Math.random() * 10) + 1,
                    physical: Math.floor(Math.random() * 10) + 1,
                    potential: !hidePotential ? parseFloat((1 + Math.random() * 9).toFixed(1)) : parseFloat((6.5 + (Math.random() - 0.5) * 7).toFixed(1)),
                };
            }
            return d;
        }));
    };

    const handleAddDriver = () => {
        const availableTeam = teams.find(t => (driverCountsByTeam[t.id] || 0) < 2);
        if (!availableTeam) {
            alert(t('edit_error_allTeamsFull'));
            return;
        }
        const newId = drivers.length > 0 ? Math.max(...drivers.map(d => d.id)) + 1 : 1;
        const newDriver: Driver = { id: newId, name: t('newDriver'), teamId: availableTeam.id, age: 25, nationality: 'BR', photoUrl: '', startSkill: 5, concentration: 5, overtaking: 5, experience: 5, speed: 5, rainSkill: 5, setupSkill: 5, physical: 5, potential: 7.5, salary: 1, contractEndsYear: new Date().getFullYear() + 1 };
        setDrivers(prev => [...prev, newDriver]);
        setEditingId(newId); // Open edit modal for new driver
    };

    const handleRemoveDriver = (driver: Driver) => {
        setModalState({
            isOpen: true,
            title: t('confirm_delete_driver_title'),
            message: t('confirm_delete_message', { name: driver.name }),
            onConfirm: () => {
                setDrivers(prev => prev.filter(d => d.id !== driver.id));
                setModalState(null);
                if (editingId === driver.id) setEditingId(null);
            },
        });
    };

    const handleAddTeam = () => {
        const newId = teams.length > 0 ? Math.max(...teams.map(t => t.id)) + 1 : 1;
        const newTeam: Team = { id: newId, name: t('newTeam'), nationality: 'GB', aerodynamics: 70, gearbox: 70, brakes: 70, electricalSystem: 70, steering: 70, reliability: 70, engineSupplier: engineSuppliers[0]?.name || 'Custom', primaryColor: '#cccccc', accentColor: '#999999', logoUrl: '', budget: 100, facilities: { aero: 1, chassis: 1, powertrain: 1, reliability: 1 } };
        setTeams(prev => [...prev, newTeam]);
        setEditingId(newId);
    };

    const handleRemoveTeam = (team: Team) => {
        setModalState({
            isOpen: true,
            title: t('confirm_delete_team_title'),
            message: t('confirm_delete_team_message', { name: team.name }),
            onConfirm: () => {
                setTeams(prev => prev.filter(t => t.id !== team.id));
                setDrivers(prev => prev.filter(d => d.teamId !== team.id));
                setModalState(null);
                if (editingId === team.id) setEditingId(null);
            },
        });
    };
    
    const handleAddRace = () => {
        const newRace: Race = { name: t('newRace'), country: 'Brasil', countryCode: 'BR', laps: 50, baseLapTime: "1:30.000", weatherChances: { Dry: 0.8, LightRain: 0.15, HeavyRain: 0.05 } };
        setCalendar(prev => [...prev, newRace]);
        setEditingId(calendar.length); // Index of new race
    };

    const handleRemoveRace = (race: Race, index: number) => {
        setModalState({
            isOpen: true,
            title: t('confirm_delete_race_title'),
            message: t('confirm_delete_message', { name: race.name }),
            onConfirm: () => {
                setCalendar(prev => prev.filter((_, i) => i !== index));
                setModalState(null);
                if (editingId === index) setEditingId(null);
            },
        });
    };
    
    const handleEngineSupplierChange = (originalName: string, field: keyof EngineSupplier, value: string | number) => {
        if (field === 'name' && typeof value === 'string' && value !== originalName && engineSuppliers.some(es => es.name === value)) { return; }
        setEngineSuppliers(prev => prev.map(es => es.name === originalName ? { ...es, [field]: value } : es));
        if (field === 'name' && typeof value === 'string' && originalName !== value) {
            setTeams(prevTeams => prevTeams.map(team => team.engineSupplier === originalName ? { ...team, engineSupplier: value } : team));
        }
    };

    const handleAddEngineSupplier = () => {
        const newEngine: EngineSupplier = { name: `${t('newEngine')} ${engineSuppliers.length + 1}`, performance: 75, cost: 10 };
        if (engineSuppliers.some(es => es.name === newEngine.name)) return;
        setEngineSuppliers(prev => [...prev, newEngine]);
    };

    const handleRemoveEngineSupplier = (supplier: EngineSupplier) => {
        setModalState({
            isOpen: true,
            title: t('confirm_delete_engine_title'),
            message: t('confirm_delete_message', { name: supplier.name }),
            onConfirm: () => {
                setEngineSuppliers(prev => prev.filter(es => es.name !== supplier.name));
                setTeams(prevTeams => prevTeams.map(team => {
                    if (team.engineSupplier === supplier.name) {
                        return { ...team, engineSupplier: team.name };
                    }
                    return team;
                }));
                setModalState(null);
            },
        });
    };

    const handleCreateCustomCountry = () => {
        if (!newCountryName.trim()) return;
        const newCountry: Country = {
            name: newCountryName,
            code: `CUST_${Date.now()}`,
            isCustom: true,
            flagUrl: undefined
        };
        if (newCountryInputRef.current?.files?.[0]) {
            const file = newCountryInputRef.current.files[0];
            const reader = new FileReader();
            reader.onload = (e) => {
                newCountry.flagUrl = e.target?.result as string;
                setCustomCountries([...customCountries, newCountry]);
                setNewCountryName('');
                if (newCountryInputRef.current) newCountryInputRef.current.value = '';
            };
            reader.readAsDataURL(file);
        } else {
            setCustomCountries([...customCountries, newCountry]);
            setNewCountryName('');
        }
    };

    const handleDeleteCustomCountry = (code: string) => {
        setModalState({
            isOpen: true,
            title: t('delete_country'),
            message: t('confirm_delete_country'),
            onConfirm: () => {
                setCustomCountries(customCountries.filter(c => c.code !== code));
                setModalState(null);
            }
        });
    };
    
    // DB Ops
    const handleExportDatabase = () => {
        try {
            const database = { drivers, teams, calendar, engineSuppliers, customCountries };
            const jsonString = JSON.stringify(database, null, 2);
            const blob = new Blob([jsonString], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `formula_racing_database_${new Date().toISOString().slice(0, 10)}.json`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
        } catch (e) {
            alert(t('export_error'));
        }
    };
    
    const handleImportDatabase = (event: React.ChangeEvent<HTMLInputElement>) => {
        const inputElement = event.target;
        const file = inputElement.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const text = e.target?.result as string;
                if (!text) return;
                const data = JSON.parse(text);
                if (data.drivers) setDrivers(data.drivers);
                if (data.teams) setTeams(data.teams);
                if (data.calendar) setCalendar(data.calendar);
                if (data.engineSuppliers) setEngineSuppliers(data.engineSuppliers);
                if (data.customCountries) setCustomCountries(data.customCountries);
                alert('Importação concluída com sucesso!');
            } catch (err) {
                alert(`Erro na importação: ${err}`);
            } finally {
                if (inputElement) inputElement.value = '';
            }
        };
        reader.readAsText(file);
    };

    const handleRandomizeAllClick = () => {
        setModalState({
            isOpen: true,
            title: t('confirm_randomize_potential_title'),
            message: t('confirm_randomize_potential_message'),
            onConfirm: () => {
                onRandomizeAllPotentials();
                setModalState(null);
            },
        });
    }

    // --- RENDER HELPERS ---

    const TabButton: React.FC<{ tab: EditTab, label: string, icon: React.ReactNode }> = ({ tab, label, icon }) => (
        <button
            onClick={() => { setActiveTab(tab); setEditingId(null); }}
            className={`flex items-center justify-center gap-2 px-6 py-4 text-sm font-bold uppercase transition-all duration-200 border-b-2 ${activeTab === tab ? 'text-[#00e051] border-[#00e051] bg-[#1e1e2b]' : 'text-slate-400 border-transparent hover:text-slate-200 hover:bg-[#1e1e2b]/50'}`}
        >
            {icon}
            <span>{label}</span>
        </button>
    );

    // --- MODAL RENDERING ---

    const renderEditModal = () => {
        if (editingId === null) return null;

        let content = null;
        let title = '';

        if (activeTab === 'drivers') {
            const driver = drivers.find(d => d.id === editingId);
            if (!driver) return null;
            const team = teams.find(t => t.id === driver.teamId);
            title = driver.name;

            content = (
                <div className="space-y-6">
                    <div className="flex flex-col sm:flex-row gap-6">
                        <div className="w-full sm:w-1/3 flex flex-col items-center gap-4">
                            <ImageWithFallback src={driver.photoUrl} alt={driver.name} primaryColor={team?.primaryColor || '#334155'} accentColor={team?.accentColor || '#FFFFFF'} initials={getInitials(driver.name)} type="driver" className="w-32 h-32 rounded-full object-cover ring-4 ring-slate-800" />
                            <ImageUploader id={driver.id} currentImage={driver.photoUrl} onUpload={(e) => handleImageUpload(driver.id, 'driver', e)} onRemove={() => handleDriverChange(driver.id, 'photoUrl', '')} type="driver" />
                        </div>
                        <div className="w-full sm:w-2/3 space-y-4">
                            <div>
                                <label className="text-[10px] uppercase text-slate-500 mb-1 block font-bold">{t('driver')}</label>
                                <input type="text" value={driver.name} onChange={(e) => handleDriverChange(driver.id, 'name', e.target.value)} className="w-full bg-[#08080c] p-3 rounded text-sm border border-slate-700 focus:outline-none focus:border-[#00e051] text-slate-200" />
                            </div>
                            <div>
                                <label className="text-[10px] uppercase text-slate-500 mb-1 block font-bold">{t('team')}</label>
                                <select value={driver.teamId} onChange={(e) => handleDriverChange(driver.id, 'teamId', parseInt(e.target.value, 10))} className="w-full bg-[#08080c] p-3 rounded text-sm border border-slate-700 focus:outline-none focus:border-[#00e051] text-slate-200">
                                    {teams.map(team => {
                                        const isFull = (driverCountsByTeam[team.id] || 0) >= 2;
                                        return (<option key={team.id} value={team.id} disabled={isFull && team.id !== driver.teamId}>{team.name}{isFull && team.id !== driver.teamId ? ` (${t('edit_teamFull_short')})` : ''}</option>);
                                    })}
                                </select>
                            </div>
                            <div className="flex gap-4">
                                <EditableStatInput className="w-20" label={t('age')} min={16} max={50} value={driver.age} onChange={(v) => handleDriverChange(driver.id, 'age', v)} />
                                <div className="flex-1">
                                    <label className="text-[10px] uppercase text-slate-500 mb-1 block font-bold">{t('nationality')}</label>
                                    <CountrySelector customCountries={customCountries} value={driver.nationality} onChange={(e) => handleDriverChange(driver.id, 'nationality', e.target.value)} className="w-full bg-[#08080c] p-3 rounded text-sm border border-slate-700 h-[46px] text-slate-200" />
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <div className="bg-[#08080c] p-4 rounded-lg border border-slate-700">
                        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4 border-b border-slate-700 pb-2">Skills</h4>
                        <div className="grid grid-cols-4 gap-4">
                            <EditableStatInput label="Speed" min={1} max={10} value={driver.speed} onChange={(v) => handleDriverChange(driver.id, 'speed', v)} />
                            <EditableStatInput label="Overtake" min={1} max={10} value={driver.overtaking} onChange={(v) => handleDriverChange(driver.id, 'overtaking', v)} />
                            <EditableStatInput label="Focus" min={1} max={10} value={driver.concentration} onChange={(v) => handleDriverChange(driver.id, 'concentration', v)} />
                            <EditableStatInput label="Start" min={1} max={10} value={driver.startSkill} onChange={(v) => handleDriverChange(driver.id, 'startSkill', v)} />
                            <EditableStatInput label="Rain" min={1} max={10} value={driver.rainSkill} onChange={(v) => handleDriverChange(driver.id, 'rainSkill', v)} />
                            <EditableStatInput label="Setup" min={1} max={10} value={driver.setupSkill} onChange={(v) => handleDriverChange(driver.id, 'setupSkill', v)} />
                            <EditableStatInput label="Exp" min={1} max={10} value={driver.experience} onChange={(v) => handleDriverChange(driver.id, 'experience', v)} />
                            <EditableStatInput label="Physical" min={1} max={10} value={driver.physical} onChange={(v) => handleDriverChange(driver.id, 'physical', v)} />
                        </div>
                    </div>

                    <div className="flex items-center justify-between bg-[#08080c] p-4 rounded-lg border border-slate-700">
                        <div className="flex items-center gap-4">
                            <button onClick={() => handleRandomizeDriverStats(driver.id)} className="px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded text-xs font-bold uppercase flex items-center gap-2 text-slate-300">
                                <DiceIcon className="w-4 h-4" /> {t('edit_randomizeTooltip')}
                            </button>
                            {!hidePotential && (
                                <div className="flex items-center gap-2 border-l border-slate-700 pl-4">
                                    <span className="text-[10px] text-yellow-500 font-black uppercase tracking-wider">{t('skill_potential')}:</span>
                                    <input 
                                        type="number" min="1" max="10" step="0.1" 
                                        value={driver.potential} 
                                        onChange={(e) => handleDriverChange(driver.id, 'potential', parseFloat(e.target.value))}
                                        className="w-16 bg-slate-800 p-2 rounded text-sm border border-slate-700 text-center font-mono text-white"
                                    />
                                </div>
                            )}
                        </div>
                        <button onClick={() => handleRemoveDriver(driver)} className="px-4 py-2 bg-red-900/20 hover:bg-red-900/40 text-red-500 rounded text-xs font-bold uppercase flex items-center gap-2">
                            <TrashIcon className="w-4 h-4" /> {t('delete')}
                        </button>
                    </div>
                </div>
            );
        } else if (activeTab === 'teams') {
            const team = teams.find(t => t.id === editingId);
            if (!team) return null;
            title = team.name;

            content = (
                <div className="space-y-6">
                    <div className="flex flex-col sm:flex-row gap-6">
                        <div className="w-full sm:w-1/3 flex flex-col items-center gap-4">
                            <ImageWithFallback src={team.logoUrl} alt={team.name} primaryColor={team.primaryColor} accentColor={team.accentColor} initials={getInitials(team.name)} type="team" className="w-32 h-24 object-contain" />
                            <ImageUploader id={team.id} currentImage={team.logoUrl} onUpload={(e) => handleImageUpload(team.id, 'team', e)} onRemove={() => handleTeamChange(team.id, 'logoUrl', '')} type="team" />
                        </div>
                        <div className="w-full sm:w-2/3 space-y-4">
                            <div>
                                <label className="text-[10px] uppercase text-slate-500 mb-1 block font-bold">{t('team')}</label>
                                <input type="text" value={team.name} onChange={(e) => handleTeamChange(team.id, 'name', e.target.value)} className="w-full bg-[#08080c] p-3 rounded text-sm border border-slate-700 focus:outline-none focus:border-[#00e051] text-slate-200" />
                            </div>
                            <div className="flex gap-4">
                                <div className="flex-1">
                                    <label className="text-[10px] uppercase text-slate-500 mb-1 block font-bold">{t('nationality')}</label>
                                    <CountrySelector customCountries={customCountries} value={team.nationality} onChange={(e) => handleTeamChange(team.id, 'nationality', e.target.value)} className="w-full bg-[#08080c] p-3 rounded text-sm border border-slate-700 text-slate-200" />
                                </div>
                                <div className="flex-1">
                                    <label className="text-[10px] uppercase text-slate-500 mb-1 block font-bold">{t('engine')}</label>
                                    <select value={team.engineSupplier} onChange={(e) => handleTeamChange(team.id, 'engineSupplier', e.target.value)} className="w-full bg-[#08080c] p-3 rounded text-sm border border-slate-700 focus:outline-none focus:border-[#00e051] text-slate-200">
                                        {engineSuppliers.map(supplier => (<option key={supplier.name} value={supplier.name}>{supplier.name}</option>))}
                                        <option value={team.name}>{t('edit_inHouse')}</option>
                                    </select>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <ColorInput label={t('edit_primaryColor')} value={team.primaryColor} onChange={(e) => handleTeamChange(team.id, 'primaryColor', e.target.value)} />
                                <ColorInput label={t('edit_accentColor')} value={team.accentColor} onChange={(e) => handleTeamChange(team.id, 'accentColor', e.target.value)} />
                            </div>
                        </div>
                    </div>

                    <div className="bg-[#08080c] p-4 rounded-lg border border-slate-700">
                        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4 border-b border-slate-700 pb-2">Performance (0-100)</h4>
                        <div className="grid grid-cols-3 sm:grid-cols-6 gap-4">
                            <EditableStatInput label="Aero" min={50} max={100} value={team.aerodynamics} onChange={(v) => handleTeamChange(team.id, 'aerodynamics', v)} />
                            <EditableStatInput label="Gearbox" min={50} max={100} value={team.gearbox} onChange={(v) => handleTeamChange(team.id, 'gearbox', v)} />
                            <EditableStatInput label="Brakes" min={50} max={100} value={team.brakes} onChange={(v) => handleTeamChange(team.id, 'brakes', v)} />
                            <EditableStatInput label="Electric" min={50} max={100} value={team.electricalSystem} onChange={(v) => handleTeamChange(team.id, 'electricalSystem', v)} />
                            <EditableStatInput label="Steering" min={50} max={100} value={team.steering} onChange={(v) => handleTeamChange(team.id, 'steering', v)} />
                            <EditableStatInput label="Reliability" min={50} max={100} value={team.reliability} onChange={(v) => handleTeamChange(team.id, 'reliability', v)} />
                        </div>
                    </div>
                    
                    <div className="flex justify-end">
                        <button onClick={() => handleRemoveTeam(team)} className="px-4 py-2 bg-red-900/20 hover:bg-red-900/40 text-red-500 rounded text-xs font-bold uppercase flex items-center gap-2">
                            <TrashIcon className="w-4 h-4" /> {t('delete')}
                        </button>
                    </div>
                </div>
            );
        } else if (activeTab === 'calendar') {
            const race = calendar[editingId as number];
            if (!race) return null;
            title = race.name;
            
            const handleWeatherChanceChange = (type: 'Dry' | 'LightRain' | 'HeavyRain', value: string) => {
                const newChances = { ...race.weatherChances };
                const numValue = parseInt(value, 10);
                const validNum = isNaN(numValue) ? 0 : Math.max(0, Math.min(100, numValue));
                const otherSum = (type === 'Dry' ? 0 : newChances.Dry*100) + (type === 'LightRain' ? 0 : newChances.LightRain*100) + (type === 'HeavyRain' ? 0 : newChances.HeavyRain*100);
                if (validNum + otherSum > 100) return;
                newChances[type] = validNum / 100;
                handleRaceChange(editingId as number, 'weatherChances', newChances);
            };

            content = (
                <div className="space-y-6">
                    <div>
                        <label className="text-[10px] uppercase text-slate-500 mb-1 block font-bold">{t('edit_gpName')}</label>
                        <input type="text" value={race.name} onChange={(e) => handleRaceChange(editingId as number, 'name', e.target.value)} className="w-full bg-[#08080c] p-3 rounded text-sm border border-slate-700 focus:outline-none focus:border-[#00e051] text-slate-200" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="text-[10px] uppercase text-slate-500 mb-1 block font-bold">{t('country')}</label>
                            <CountrySelector customCountries={customCountries} value={race.countryCode} onChange={(e) => handleRaceCountryChange(editingId as number, e.target.value)} className="w-full bg-[#08080c] p-3 rounded text-sm border border-slate-700 text-slate-200" />
                        </div>
                        <div>
                            <label className="text-[10px] uppercase text-slate-500 mb-1 block font-bold">{t('baseTime')}</label>
                            <input type="text" value={race.baseLapTime} onChange={(e) => handleRaceChange(editingId as number, 'baseLapTime', e.target.value)} className="w-full bg-[#08080c] p-3 rounded text-sm border border-slate-700 focus:outline-none focus:border-[#00e051] text-slate-200 font-mono" />
                        </div>
                    </div>
                    <div className="flex gap-6 items-start">
                        <div className="w-24">
                            <EditableStatInput label={t('laps')} min={1} max={200} value={race.laps} onChange={(v) => handleRaceChange(editingId as number, 'laps', v)} />
                        </div>
                        <div className="flex-1 bg-[#08080c] p-4 rounded-lg border border-slate-700">
                            <label className="text-[10px] uppercase text-slate-500 mb-3 block font-bold">{t('edit_weatherChances')}</label>
                            <div className="grid grid-cols-3 gap-4">
                                {['Dry', 'LightRain', 'HeavyRain'].map(type => (
                                    <div key={type} className="text-center">
                                        <label className="text-[9px] uppercase text-slate-400 block font-bold mb-1">{t(`weather_${type.toLowerCase()}` as any)}</label>
                                        <input type="number" min="0" max="100" value={Math.round(race.weatherChances[type as keyof typeof race.weatherChances] * 100)} onChange={(e) => handleWeatherChanceChange(type as any, e.target.value)} className="w-full bg-slate-800 p-2 rounded text-sm text-center font-mono text-white focus:outline-none focus:ring-1 focus:ring-slate-500" />
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                    <div className="flex justify-end">
                        <button onClick={() => handleRemoveRace(race, editingId as number)} className="px-4 py-2 bg-red-900/20 hover:bg-red-900/40 text-red-500 rounded text-xs font-bold uppercase flex items-center gap-2">
                            <TrashIcon className="w-4 h-4" /> {t('delete')}
                        </button>
                    </div>
                </div>
            );
        }

        return (
            <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setEditingId(null)}>
                <div className="bg-[#1e1e2b] w-full max-w-2xl rounded-2xl border border-slate-700 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]" onClick={e => e.stopPropagation()}>
                    <div className="p-6 border-b border-slate-700 flex justify-between items-center bg-[#1e1e2b]">
                        <h3 className="text-xl font-bold text-slate-200 uppercase tracking-wide">{title}</h3>
                        <button onClick={() => setEditingId(null)} className="text-slate-400 hover:text-white transition-colors">
                            <CloseIcon className="w-6 h-6" />
                        </button>
                    </div>
                    <div className="p-6 overflow-y-auto">
                        {content}
                    </div>
                    <div className="p-4 bg-[#161622] border-t border-slate-700 flex justify-end">
                        <button onClick={() => setEditingId(null)} className="px-6 py-2 bg-[#00e051] text-black font-bold uppercase rounded hover:bg-opacity-90 transition-colors">
                            {t('save')}
                        </button>
                    </div>
                </div>
            </div>
        );
    };

    // --- GRID RENDERING ---

    const renderGrid = () => {
        if (activeTab === 'drivers') {
            return (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 pb-20">
                    {drivers.map(driver => {
                        const team = teams.find(t => t.id === driver.teamId);
                        return (
                            <div key={driver.id} onClick={() => setEditingId(driver.id)} className="bg-slate-800 hover:bg-slate-700 transition-all cursor-pointer rounded-xl p-4 border border-slate-700 hover:border-slate-500 group flex items-center gap-4 relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-bl from-white/5 to-transparent rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-150"></div>
                                <ImageWithFallback src={driver.photoUrl} alt={driver.name} primaryColor={team?.primaryColor || '#334155'} accentColor={team?.accentColor || '#FFFFFF'} initials={getInitials(driver.name)} type="driver" className="w-12 h-12 rounded-full object-cover z-10 shadow-lg" />
                                <div className="z-10 min-w-0">
                                    <h4 className="font-bold text-slate-200 truncate">{driver.name}</h4>
                                    <p className="text-xs text-slate-400 truncate">{team?.name}</p>
                                </div>
                                <div className="ml-auto z-10">
                                    <CountryFlag countryCode={driver.nationality} customCountries={customCountries} className="w-6" />
                                </div>
                            </div>
                        );
                    })}
                </div>
            );
        } else if (activeTab === 'teams') {
            return (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 pb-20">
                    {teams.map(team => (
                        <div key={team.id} onClick={() => setEditingId(team.id)} className="bg-slate-800 hover:bg-slate-700 transition-all cursor-pointer rounded-xl p-4 border border-slate-700 hover:border-slate-500 group relative overflow-hidden">
                            <div className="flex items-center justify-between mb-3 relative z-10">
                                <ImageWithFallback src={team.logoUrl} alt={team.name} primaryColor={team.primaryColor} accentColor={team.accentColor} initials={getInitials(team.name)} type="team" className="h-8 w-auto object-contain" />
                                <CountryFlag countryCode={team.nationality} customCountries={customCountries} className="w-6" />
                            </div>
                            <h4 className="font-bold text-slate-200 truncate relative z-10">{team.name}</h4>
                            <div className="w-full h-1 mt-3 rounded-full overflow-hidden bg-slate-900 relative z-10">
                                <div className="h-full" style={{ width: `${team.aerodynamics}%`, backgroundColor: team.primaryColor }}></div>
                            </div>
                        </div>
                    ))}
                </div>
            );
        } else if (activeTab === 'calendar') {
            return (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pb-20">
                    {calendar.map((race, index) => (
                        <div key={index} onClick={() => setEditingId(index)} className="bg-slate-800 hover:bg-slate-700 transition-all cursor-pointer rounded-xl p-4 border border-slate-700 hover:border-slate-500 flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <span className="text-lg font-black text-slate-600 font-mono w-6">{index + 1}</span>
                                <div>
                                    <h4 className="font-bold text-slate-200 truncate">{race.name}</h4>
                                    <p className="text-xs text-slate-400">{race.laps} Laps • {race.baseLapTime}</p>
                                </div>
                            </div>
                            <CountryFlag countryCode={race.countryCode} customCountries={customCountries} className="w-8 rounded shadow-sm" />
                        </div>
                    ))}
                </div>
            );
        } else if (activeTab === 'engines') {
            return (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pb-20">
                    {engineSuppliers.map(supplier => (
                        <div key={supplier.name} className="bg-slate-800 p-4 rounded-xl border border-slate-700">
                            <div className="flex justify-between items-center mb-4">
                                <h4 className="font-bold text-slate-200">{supplier.name}</h4>
                                <button onClick={() => handleRemoveEngineSupplier(supplier)} className="text-slate-500 hover:text-red-500"><TrashIcon className="w-5 h-5"/></button>
                            </div>
                            <div className="space-y-4">
                                <div>
                                    <label className="text-[10px] uppercase text-slate-500 mb-1 block font-bold">{t('edit_supplierName')}</label>
                                    <input type="text" value={supplier.name} onChange={(e) => handleEngineSupplierChange(supplier.name, 'name', e.target.value)} className="w-full bg-[#08080c] p-2 rounded text-sm border border-slate-700 text-slate-200" />
                                </div>
                                <EditableStatInput label={t('performance')} min={50} max={100} value={supplier.performance} onChange={(v) => handleEngineSupplierChange(supplier.name, 'performance', v)} />
                            </div>
                        </div>
                    ))}
                </div>
            );
        } else if (activeTab === 'countries') {
            return (
                <div className="h-full flex flex-col pb-20">
                    <div className="bg-slate-800 p-4 rounded-xl border border-slate-700 mb-6 flex-shrink-0">
                        <h3 className="font-bold text-slate-300 text-sm mb-3 uppercase tracking-widest">{t('create_country')}</h3>
                        <div className="flex flex-col sm:flex-row gap-4 items-end">
                            <div className="flex-1 w-full">
                                <label className="text-[10px] uppercase text-slate-500 mb-1 block font-bold">{t('country_name')}</label>
                                <input 
                                    type="text" 
                                    value={newCountryName} 
                                    onChange={(e) => setNewCountryName(e.target.value)} 
                                    placeholder="Ex: Utopia"
                                    className="w-full bg-[#08080c] p-2 rounded text-sm border border-slate-700 text-slate-200" 
                                />
                            </div>
                            <div className="w-full sm:w-auto">
                                <div className="flex items-center gap-2">
                                    <input ref={newCountryInputRef} type="file" accept="image/*" className="hidden" id="new-country-flag" />
                                    <label htmlFor="new-country-flag" className="cursor-pointer px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded text-xs uppercase font-bold flex items-center justify-center gap-2 transition-colors border border-slate-600 text-slate-200 h-[38px]">
                                        <CloudArrowUpIcon className="w-4 h-4" />
                                        <span>{t('edit_uploadImage')}</span>
                                    </label>
                                </div>
                            </div>
                            <button 
                                onClick={handleCreateCustomCountry}
                                disabled={!newCountryName.trim()} 
                                className="w-full sm:w-auto px-6 py-2 bg-[#00e051] text-black hover:bg-opacity-90 rounded text-xs uppercase font-bold flex items-center justify-center gap-2 transition-colors disabled:bg-slate-700 disabled:text-slate-500 h-[38px]"
                            >
                                <PlusIcon className="w-4 h-4" /><span>{t('create_country_btn')}</span>
                            </button>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 overflow-y-auto">
                        {customCountries.length === 0 && <p className="col-span-full text-center text-slate-500 italic py-10">{t('no_custom_countries')}</p>}
                        {customCountries.map(country => (
                            <div key={country.code} className="bg-slate-800 p-3 rounded-lg border border-slate-700 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <CountryFlag countryCode={country.code} customCountries={customCountries} className="w-8 h-auto rounded border border-slate-600" />
                                    <span className="font-bold text-slate-200">{country.name}</span>
                                </div>
                                <button onClick={() => handleDeleteCustomCountry(country.code)} className="text-slate-500 hover:text-red-500 transition-colors">
                                    <TrashIcon className="w-4 h-4"/>
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            );
        }
        return null;
    };
    
    // --- MAIN RENDER ---

    return (
        <div className="h-full flex flex-col p-0 bg-[#08080c] relative">
             <PromptModal
                isOpen={!!modalState?.isOpen}
                title={modalState?.title || ''}
                message={modalState?.message}
                defaultValue={null}
                onConfirm={() => modalState?.onConfirm()}
                onCancel={() => setModalState(null)}
            />
            {renderEditModal()}
            <input type="file" ref={importInputRef} onChange={handleImportDatabase} accept=".json" style={{display: 'none'}} />
            
            {/* Header */}
            <div className="flex-shrink-0 flex flex-wrap justify-between items-center p-6 border-b border-slate-800 bg-[#15141f]">
                <h2 className="text-3xl font-black uppercase text-white tracking-widest">{isOffSeason ? t('offSeasonEditor') : t('editor')}</h2>
                <div className="flex items-center gap-3 flex-wrap">
                     <button onClick={() => importInputRef.current?.click()} className="px-4 py-2 text-xs bg-slate-800 text-slate-300 font-bold uppercase rounded hover:bg-slate-700 flex items-center justify-center gap-2 transition-colors border border-slate-700">
                        <CloudArrowUpIcon className="w-4 h-4" />
                        <span>{t('edit_importDatabase')}</span>
                    </button>
                    <button onClick={handleExportDatabase} className="px-4 py-2 text-xs bg-slate-800 text-slate-300 font-bold uppercase rounded hover:bg-slate-700 flex items-center justify-center gap-2 transition-colors border border-slate-700">
                        <CloudArrowUpIcon className="w-4 h-4 -scale-y-100" />
                        <span>{t('edit_exportDatabase')}</span>
                    </button>
                    {isOffSeason ? (
                        <button onClick={onBackToMenu} className="px-6 py-2 bg-[#e00601] text-white font-bold text-xs uppercase rounded hover:bg-opacity-90 flex items-center justify-center gap-2 transition-colors shadow-lg shadow-red-900/20">
                            <CheckeredFlagIcon className="w-4 h-4" /><span>{t('startNextSeason')}</span>
                        </button>
                    ) : (
                         <button onClick={onBackToMenu} className="px-6 py-2 bg-slate-700 text-white font-bold text-xs uppercase rounded hover:bg-slate-600 flex items-center justify-center gap-2 transition-colors border border-slate-600">
                            <HomeIcon className="w-4 h-4" /><span>{t('back')}</span>
                        </button>
                    )}
                </div>
            </div>

            {/* Toolbar / Tabs */}
            <div className="flex-shrink-0 bg-[#161622] border-b border-slate-800">
                <div className="flex overflow-x-auto scrollbar-hide px-4">
                    <TabButton tab="drivers" label={t('drivers')} icon={<UserIcon className="w-4 h-4"/>} />
                    <TabButton tab="teams" label={t('teams')} icon={<UserGroupIcon className="w-4 h-4"/>} />
                    <TabButton tab="calendar" label={t('calendar')} icon={<CalendarIcon className="w-4 h-4"/>} />
                    <TabButton tab="engines" label={t('engines')} icon={<CogIcon className="w-4 h-4"/>} />
                    <TabButton tab="countries" label={t('countries')} icon={<FlagIcon className="w-4 h-4"/>} />
                </div>
            </div>

            {/* Action Bar */}
            <div className="flex-shrink-0 p-4 border-b border-slate-800 flex justify-between items-center bg-[#08080c]">
                <div className="flex items-center gap-4">
                    {activeTab === 'drivers' && (
                        <>
                            <div className="flex items-center gap-3 pl-2 border-l-2 border-slate-800">
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input type="checkbox" className="sr-only peer" checked={hidePotential} onChange={(e) => setHidePotential(e.target.checked)} />
                                    <div className="w-9 h-5 bg-slate-800 rounded-full peer peer-focus:ring-2 peer-focus:ring-green-800 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-green-600"></div>
                                    <span className="ml-3 text-xs font-bold uppercase text-slate-400">{t('edit_hide_potential_label')}</span>
                                </label>
                            </div>
                            <button onClick={handleRandomizeAllClick} className="px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded text-xs font-bold uppercase flex items-center gap-2 text-slate-300 transition-colors">
                                <DiceIcon className="w-4 h-4" /> {t('edit_randomize_potentials_button')}
                            </button>
                        </>
                    )}
                </div>
                
                <div>
                    {activeTab === 'drivers' && (
                        <button onClick={handleAddDriver} disabled={!isAnyTeamAvailable} className="px-4 py-2 bg-[#00e051] text-black hover:bg-opacity-90 rounded text-xs font-black uppercase flex items-center gap-2 transition-colors disabled:bg-slate-800 disabled:text-slate-600 disabled:cursor-not-allowed">
                            <PlusIcon className="w-4 h-4" /><span>{t('edit_addDriver')}</span>
                        </button>
                    )}
                    {activeTab === 'teams' && (
                        <button onClick={handleAddTeam} className="px-4 py-2 bg-[#00e051] text-black hover:bg-opacity-90 rounded text-xs font-black uppercase flex items-center gap-2 transition-colors">
                            <PlusIcon className="w-4 h-4" /><span>{t('edit_addTeam')}</span>
                        </button>
                    )}
                    {activeTab === 'calendar' && (
                        <button onClick={handleAddRace} className="px-4 py-2 bg-[#00e051] text-black hover:bg-opacity-90 rounded text-xs font-black uppercase flex items-center gap-2 transition-colors">
                            <PlusIcon className="w-4 h-4" /><span>{t('edit_addRace')}</span>
                        </button>
                    )}
                    {activeTab === 'engines' && (
                        <button onClick={handleAddEngineSupplier} className="px-4 py-2 bg-[#00e051] text-black hover:bg-opacity-90 rounded text-xs font-black uppercase flex items-center gap-2 transition-colors">
                            <PlusIcon className="w-4 h-4" /><span>{t('edit_addEngine')}</span>
                        </button>
                    )}
                </div>
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-y-auto p-6 bg-[#08080c]">
                {renderGrid()}
            </div>
        </div>
    );
};

export default EditMenu;
