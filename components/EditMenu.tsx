import React, { useState, useMemo, useRef } from 'react';
import { Driver, Team, Race, EngineSupplier } from '../types';
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
import { useI18n } from '../i18n';
import ImageWithFallback from './ImageWithFallback';
import { getInitials } from '../utils';
import PromptModal from './PromptModal';

interface EditMenuProps {
    drivers: Driver[];
    teams: Team[];
    calendar: Race[];
    engineSuppliers: EngineSupplier[];
    setDrivers: React.Dispatch<React.SetStateAction<Driver[]>>;
    setTeams: React.Dispatch<React.SetStateAction<Team[]>>;
    setCalendar: React.Dispatch<React.SetStateAction<Race[]>>;
    setEngineSuppliers: React.Dispatch<React.SetStateAction<EngineSupplier[]>>;
    onBackToMenu: () => void;
    isOffSeason?: boolean;
}

type EditTab = 'drivers' | 'teams' | 'calendar' | 'engines';

const EditMenu: React.FC<EditMenuProps> = ({
    drivers,
    teams,
    calendar,
    engineSuppliers,
    setDrivers,
    setTeams,
    setCalendar,
    setEngineSuppliers,
    onBackToMenu,
    isOffSeason = false,
}) => {
    const { t } = useI18n();
    const [activeTab, setActiveTab] = useState<EditTab>('drivers');
    const [modalState, setModalState] = useState<{
        isOpen: boolean;
        title: string;
        message: string;
        onConfirm: () => void;
    } | null>(null);
    const importInputRef = useRef<HTMLInputElement>(null);

    const driverCountsByTeam = useMemo(() => {
        return teams.reduce((acc, team) => {
            acc[team.id] = drivers.filter(d => d.teamId === team.id).length;
            return acc;
        }, {} as Record<number, number>);
    }, [drivers, teams]);

    const isAnyTeamAvailable = useMemo(() => teams.some(t => (driverCountsByTeam[t.id] || 0) < 2), [teams, driverCountsByTeam]);
    
    const handleNumberInput = (value: string, min: number, max: number) => {
        const num = parseInt(value, 10);
        if (isNaN(num)) return min;
        if (num < min) return min;
        if (num > max) return max;
        return num;
    };

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
        
        let processedValue: string | number;

        if (field === 'potential') {
            const num = parseFloat(String(value));
            if (isNaN(num)) {
                processedValue = 0.0;
            } else {
                const clamped = Math.max(0.0, Math.min(10.0, num));
                processedValue = parseFloat(clamped.toFixed(1));
            }
        } else if (['startSkill', 'concentration', 'overtaking', 'experience', 'speed', 'rainSkill', 'setupSkill', 'physical'].includes(field as string)) {
            processedValue = handleNumberInput(String(value), 1, 10);
        } else if (['age', 'teamId'].includes(field as string)) {
            processedValue = handleNumberInput(String(value), 1, 100);
        } else {
            processedValue = value;
        }
        
        setDrivers(prev => prev.map(d =>
            d.id === id ? { ...d, [field]: processedValue } : d
        ));
    };

    const handleTeamChange = (id: number, field: keyof Team, value: string | number) => {
        const isNumericField = ['aerodynamics', 'gearbox', 'brakes', 'electricalSystem', 'steering', 'reliability'].includes(field as string);
        const processedValue = isNumericField ? handleNumberInput(String(value), 50, 100) : value;

        setTeams(prev => prev.map(t =>
            t.id === id ? { ...t, [field]: processedValue } : t
        ));
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
                // FIX: Corrected a typo where 'd' was used instead of 't' in the map function for setTeams.
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
            } else {
                (updatedRace as any)[field] = value;
            }
    
            if (field === 'laps') {
                const lapsNum = parseInt(String(value), 10);
                updatedRace.laps = isNaN(lapsNum) || lapsNum < 1 ? 1 : lapsNum;
            }
    
            return updatedRace;
        }));
    };
    
    const handleRaceCountryChange = (index: number, countryCode: string) => {
        const country = COUNTRIES.find(c => c.code === countryCode);
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
                    potential: parseFloat((Math.random() * 10).toFixed(1)),
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
        // FIX: Added missing `salary` and `contractEndsYear` properties to the new Driver object.
        const newDriver: Driver = { id: newId, name: t('newDriver'), teamId: availableTeam.id, age: 25, nationality: 'BR', photoUrl: '', startSkill: 5, concentration: 5, overtaking: 5, experience: 5, speed: 5, rainSkill: 5, setupSkill: 5, physical: 5, potential: 7.5, salary: 1, contractEndsYear: new Date().getFullYear() + 1 };
        setDrivers(prev => [...prev, newDriver]);
    };

    const handleRemoveDriver = (driver: Driver) => {
        setModalState({
            isOpen: true,
            title: t('confirm_delete_driver_title'),
            message: t('confirm_delete_message', { name: driver.name }),
            onConfirm: () => {
                setDrivers(prev => prev.filter(d => d.id !== driver.id));
                setModalState(null);
            },
        });
    };

    const handleAddTeam = () => {
        const newId = teams.length > 0 ? Math.max(...teams.map(t => t.id)) + 1 : 1;
        // FIX: Added missing `budget` and `facilities` properties to the new Team object.
        const newTeam: Team = { id: newId, name: t('newTeam'), aerodynamics: 70, gearbox: 70, brakes: 70, electricalSystem: 70, steering: 70, reliability: 70, engineSupplier: engineSuppliers[0]?.name || 'Custom', primaryColor: '#cccccc', accentColor: '#999999', logoUrl: '', budget: 100, facilities: { aero: 1, chassis: 1, powertrain: 1, reliability: 1 } };
        setTeams(prev => [...prev, newTeam]);
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
            },
        });
    };
    
    const handleAddRace = () => {
        const newRace: Race = { name: t('newRace'), country: 'Brasil', countryCode: 'BR', laps: 50, baseLapTime: "1:30.000", weatherChances: { Dry: 0.8, LightRain: 0.15, HeavyRain: 0.05 } };
        setCalendar(prev => [...prev, newRace]);
    };

    const handleRemoveRace = (race: Race, index: number) => {
        setModalState({
            isOpen: true,
            title: t('confirm_delete_race_title'),
            message: t('confirm_delete_message', { name: race.name }),
            onConfirm: () => {
                setCalendar(prev => prev.filter((_, i) => i !== index));
                setModalState(null);
            },
        });
    };
    
    const handleEngineSupplierChange = (originalName: string, field: keyof EngineSupplier, value: string | number) => {
        if (field === 'name' && typeof value === 'string' && value !== originalName && engineSuppliers.some(es => es.name === value)) { return; }
        let processedValue = value;
        if (field === 'performance') { processedValue = handleNumberInput(String(value), 50, 100); }
        setEngineSuppliers(prev => prev.map(es => es.name === originalName ? { ...es, [field]: processedValue } : es));
        if (field === 'name' && typeof value === 'string' && originalName !== value) {
            setTeams(prevTeams => prevTeams.map(team => team.engineSupplier === originalName ? { ...team, engineSupplier: value } : team));
        }
    };

    const handleAddEngineSupplier = () => {
        // FIX: Added missing `cost` property to the new EngineSupplier object.
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
    
    const handleExportDatabase = () => {
        try {
            const database = {
                drivers,
                teams,
                calendar,
                engineSuppliers,
            };
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
        const file = event.target.files?.[0];
        if (!file) return;

        if (!window.confirm(t('confirm_import_database'))) {
            if (event.target) event.target.value = '';
            return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const text = e.target?.result as string;
                const data = JSON.parse(text);

                if (!data || !Array.isArray(data.drivers) || !Array.isArray(data.teams) || !Array.isArray(data.calendar) || !Array.isArray(data.engineSuppliers)) {
                    throw new Error("Invalid file structure");
                }

                setDrivers(data.drivers);
                setTeams(data.teams);
                setCalendar(data.calendar);
                setEngineSuppliers(data.engineSuppliers);

                alert(t('import_success'));
            } catch (err) {
                alert(t('import_error'));
            } finally {
                if (event.target) event.target.value = '';
            }
        };
        reader.readAsText(file);
    };


    const TabButton: React.FC<{ tab: EditTab, label: string, icon: React.ReactNode }> = ({ tab, label, icon }) => (
        <button
            onClick={() => setActiveTab(tab)}
            className={`flex items-center justify-center gap-2 px-4 py-3 text-sm font-bold uppercase rounded-t-lg transition-all duration-300 border-b-2 ${activeTab === tab ? 'text-[#00e051] border-[#00e051]' : 'text-slate-400 border-transparent hover:text-slate-200'}`}
        >
            {icon}
            <span>{label}</span>
        </button>
    );
    
    const StatInput: React.FC<{ label: string; value: number; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void; min: number; max: number; }> = ({ label, value, onChange, min, max }) => (
        <div>
            <label className="text-xs text-slate-400 mb-1 block">{label}</label>
            <input type="number" min={min} max={max} value={value} onChange={onChange} className="w-full bg-[#15141f] p-2 rounded-md border border-slate-700 focus:outline-none focus:ring-2 focus:ring-[#00e051] focus:border-[#00e051] [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none" />
        </div>
    );

    const PotentialInput: React.FC<{ label: string; value: number; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void; }> = ({ label, value, onChange }) => (
         <div>
            <label className="text-xs text-slate-400 mb-1 block">{label}</label>
            <input type="number" min="0" max="10" step="0.1" value={value} onChange={onChange} className="w-full bg-[#15141f] p-2 rounded-md border border-slate-700 focus:outline-none focus:ring-2 focus:ring-[#00e051] focus:border-[#00e051]" />
        </div>
    );
    
    const ColorInput: React.FC<{ label: string; value: string; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void; }> = ({ label, value, onChange }) => (
        <div>
            <label className="text-xs text-slate-400 mb-1 block">{label}</label>
            <div className="flex items-center gap-2 bg-[#15141f] p-2 rounded-md border border-slate-700 focus-within:ring-2 focus-within:ring-[#00e051] focus-within:border-[#00e051]">
                <input type="color" value={value} onChange={onChange} className="w-6 h-6 p-0 border-none bg-transparent" />
                <input type="text" value={value} onChange={onChange} className="w-full bg-transparent outline-none font-mono" />
            </div>
        </div>
    );
    
    const ImageUploader: React.FC<{ id: string | number, currentImage: string | undefined, onUpload: (e: React.ChangeEvent<HTMLInputElement>) => void, onRemove: () => void, type: 'driver' | 'team' }> = ({ id, currentImage, onUpload, onRemove, type }) => (
         <div>
            <label className="text-xs text-slate-400 mb-1 block">{type === 'driver' ? t('edit_driverPhoto') : t('edit_teamLogo')}</label>
            <div className="flex items-center gap-2">
                <input id={`${type}-upload-${id}`} type="file" accept="image/png, image/jpeg, image/webp" className="hidden" onChange={onUpload} />
                <label htmlFor={`${type}-upload-${id}`} className="flex-grow cursor-pointer p-2 bg-slate-600 hover:bg-slate-500 rounded-md text-center text-sm flex items-center justify-center gap-2 transition-colors">
                    <CloudArrowUpIcon className="w-5 h-5" />
                    <span>{currentImage ? t('edit_changeImage') : t('edit_uploadImage')}</span>
                </label>
                {currentImage && (<button onClick={onRemove} className="p-2 bg-[#e00601] hover:bg-opacity-90 rounded-md" title={t('edit_removeImage')}><TrashIcon className="w-5 h-5"/></button>)}
            </div>
        </div>
    );

    const renderContent = () => {
        switch (activeTab) {
            case 'drivers':
                return (
                    <div className="space-y-4">
                        {drivers.map(driver => {
                            const team = teams.find(t => t.id === driver.teamId);
                            return (
                                <div key={driver.id} className="p-4 bg-slate-500/10 rounded-lg">
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="flex items-center gap-3">
                                            <ImageWithFallback src={driver.photoUrl} alt={driver.name} primaryColor={team?.primaryColor || '#334155'} accentColor={team?.accentColor || '#FFFFFF'} initials={getInitials(driver.name)} type="driver" className="w-12 h-12 rounded-full object-cover" />
                                            <input type="text" value={driver.name} onChange={(e) => handleDriverChange(driver.id, 'name', e.target.value)} className="bg-[#15141f] text-lg font-bold p-1 rounded-md border border-slate-700 focus:outline-none focus:ring-2 focus:ring-[#00e051] focus:border-[#00e051]" />
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <button onClick={() => handleRandomizeDriverStats(driver.id)} title={t('edit_randomizeTooltip')} className="p-2 text-slate-400 hover:text-[#00e051] transition-colors"><DiceIcon className="w-5 h-5"/></button>
                                            <button onClick={() => handleRemoveDriver(driver)} className="p-2 text-slate-400 hover:text-[#e00601] transition-colors"><TrashIcon className="w-5 h-5"/></button>
                                        </div>
                                    </div>
                                    <div className="space-y-4">
                                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                                            <ImageUploader id={driver.id} currentImage={driver.photoUrl} onUpload={(e) => handleImageUpload(driver.id, 'driver', e)} onRemove={() => handleDriverChange(driver.id, 'photoUrl', '')} type="driver" />
                                            <div className="self-end">
                                                <label className="text-xs text-slate-400 mb-1 block">{t('team')}</label>
                                                <select value={driver.teamId} onChange={(e) => handleDriverChange(driver.id, 'teamId', parseInt(e.target.value, 10))} className="w-full bg-[#15141f] p-2 rounded-md border border-slate-700 focus:outline-none focus:ring-2 focus:ring-[#00e051] focus:border-[#00e051]">
                                                    <option disabled>{t('edit_selectTeam')}</option>
                                                    {teams.map(team => {
                                                        const isFull = (driverCountsByTeam[team.id] || 0) >= 2;
                                                        const isCurrentTeam = team.id === driver.teamId;
                                                        return (<option key={team.id} value={team.id} disabled={isFull && !isCurrentTeam} className="bg-[#1e1e2b]">{team.name}{isFull && !isCurrentTeam ? ` (${t('edit_teamFull_short')})` : ''}</option>);
                                                    })}
                                                </select>
                                            </div>
                                            <CountrySelector value={driver.nationality} onChange={(e) => handleDriverChange(driver.id, 'nationality', e.target.value)} className="self-end" />
                                            <StatInput label={t('age')} min={16} max={50} value={driver.age} onChange={(e) => handleDriverChange(driver.id, 'age', e.target.value)} />
                                        </div>
                                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                            <StatInput label={t('skill_start')} min={1} max={10} value={driver.startSkill} onChange={(e) => handleDriverChange(driver.id, 'startSkill', e.target.value)} />
                                            <StatInput label={t('skill_concentration')} min={1} max={10} value={driver.concentration} onChange={(e) => handleDriverChange(driver.id, 'concentration', e.target.value)} />
                                            <StatInput label={t('skill_overtaking')} min={1} max={10} value={driver.overtaking} onChange={(e) => handleDriverChange(driver.id, 'overtaking', e.target.value)} />
                                            <StatInput label={t('skill_experience')} min={1} max={10} value={driver.experience} onChange={(e) => handleDriverChange(driver.id, 'experience', e.target.value)} />
                                            <StatInput label={t('skill_speed')} min={1} max={10} value={driver.speed} onChange={(e) => handleDriverChange(driver.id, 'speed', e.target.value)} />
                                            <StatInput label={t('skill_rain')} min={1} max={10} value={driver.rainSkill} onChange={(e) => handleDriverChange(driver.id, 'rainSkill', e.target.value)} />
                                            <StatInput label={t('skill_setup')} min={1} max={10} value={driver.setupSkill} onChange={(e) => handleDriverChange(driver.id, 'setupSkill', e.target.value)} />
                                            <StatInput label={t('skill_physical')} min={1} max={10} value={driver.physical} onChange={(e) => handleDriverChange(driver.id, 'physical', e.target.value)} />
                                        </div>
                                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                            <div className="col-span-2 sm:col-span-4">
                                                <PotentialInput label={t('skill_potential')} value={driver.potential} onChange={(e) => handleDriverChange(driver.id, 'potential', e.target.value)} />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )})}
                        <button onClick={handleAddDriver} disabled={!isAnyTeamAvailable} className="w-full mt-4 py-2 bg-[#00e051] text-black hover:bg-opacity-90 rounded-lg font-bold flex items-center justify-center gap-2 transition-colors disabled:bg-slate-500 disabled:text-slate-300 disabled:cursor-not-allowed">
                            <PlusIcon className="w-5 h-5" /><span>{t('edit_addDriver')}</span>
                        </button>
                    </div>
                );
            case 'teams':
                return (
                     <div className="space-y-4">
                        {teams.map(team => (
                            <div key={team.id} className="p-4 bg-slate-500/10 rounded-lg space-y-4">
                               <div className="flex justify-between items-center mb-2">
                                    <div className="font-bold flex items-center gap-3">
                                        <ImageWithFallback src={team.logoUrl} alt={team.name} primaryColor={team.primaryColor} accentColor={team.accentColor} initials={getInitials(team.name)} type="team" className="h-8 w-12 object-contain" />
                                        <input type="text" value={team.name} onChange={(e) => handleTeamChange(team.id, 'name', e.target.value)} className="bg-[#15141f] p-1 rounded-md border border-slate-700 focus:outline-none focus:ring-2 focus:ring-[#00e051] focus:border-[#00e051]" />
                                    </div>
                                    <button onClick={() => handleRemoveTeam(team)} className="p-2 text-slate-400 hover:text-[#e00601] transition-colors"><TrashIcon className="w-5 h-5"/></button>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <ImageUploader id={team.id} currentImage={team.logoUrl} onUpload={(e) => handleImageUpload(team.id, 'team', e)} onRemove={() => handleTeamChange(team.id, 'logoUrl', '')} type="team" />
                                    <div>
                                        <label className="text-xs text-slate-400 mb-1 block">{t('engine')}</label>
                                        <select value={team.engineSupplier} onChange={(e) => handleTeamChange(team.id, 'engineSupplier', e.target.value)} className="w-full bg-[#15141f] p-2 rounded-md border border-slate-700 focus:outline-none focus:ring-2 focus:ring-[#00e051] focus:border-[#00e051]">
                                            {engineSuppliers.map(supplier => (<option key={supplier.name} value={supplier.name} className="bg-[#1e1e2b]">{supplier.name}</option>))}
                                            <option value={team.name} className="bg-[#1e1e2b]">{t('edit_inHouse')}</option>
                                        </select>
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                    <StatInput label={t('stat_aero')} min={50} max={100} value={team.aerodynamics} onChange={(e) => handleTeamChange(team.id, 'aerodynamics', e.target.value)} />
                                    <StatInput label={t('stat_gearbox')} min={50} max={100} value={team.gearbox} onChange={(e) => handleTeamChange(team.id, 'gearbox', e.target.value)} />
                                    <StatInput label={t('stat_brakes')} min={50} max={100} value={team.brakes} onChange={(e) => handleTeamChange(team.id, 'brakes', e.target.value)} />
                                    <StatInput label={t('stat_electrical')} min={50} max={100} value={team.electricalSystem} onChange={(e) => handleTeamChange(team.id, 'electricalSystem', e.target.value)} />
                                    <StatInput label={t('stat_steering')} min={50} max={100} value={team.steering} onChange={(e) => handleTeamChange(team.id, 'steering', e.target.value)} />
                                    <StatInput label={t('stat_reliability')} min={50} max={100} value={team.reliability} onChange={(e) => handleTeamChange(team.id, 'reliability', e.target.value)} />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <ColorInput label={t('edit_primaryColor')} value={team.primaryColor} onChange={(e) => handleTeamChange(team.id, 'primaryColor', e.target.value)} />
                                    <ColorInput label={t('edit_accentColor')} value={team.accentColor} onChange={(e) => handleTeamChange(team.id, 'accentColor', e.target.value)} />
                                </div>
                            </div>
                        ))}
                        <button onClick={handleAddTeam} className="w-full mt-4 py-2 bg-[#00e051] text-black hover:bg-opacity-90 rounded-lg font-bold flex items-center justify-center gap-2 transition-colors">
                            <PlusIcon className="w-5 h-5" /><span>{t('edit_addTeam')}</span>
                        </button>
                    </div>
                );
            case 'calendar':
                return (
                     <div className="space-y-4">
                        {calendar.map((race, index) => {
                            const handleWeatherChanceChange = (type: 'Dry' | 'LightRain' | 'HeavyRain', value: string) => {
                                const newChances = { ...race.weatherChances };
                                const numValue = parseInt(value, 10);
                                newChances[type] = isNaN(numValue) ? 0 : Math.max(0, Math.min(100, numValue));
                                const total = newChances.Dry + newChances.LightRain + newChances.HeavyRain;
                                if (total === 0) { handleRaceChange(index, 'weatherChances', { Dry: 1, LightRain: 0, HeavyRain: 0 }); return; }
                                const normalized = { Dry: newChances.Dry / total, LightRain: newChances.LightRain / total, HeavyRain: newChances.HeavyRain / total };
                                handleRaceChange(index, 'weatherChances', normalized);
                            };
                            return (
                                <div key={index} className="p-4 bg-slate-500/10 rounded-lg">
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="flex-grow">
                                            <label className="text-xs text-slate-400 mb-1 block">{t('edit_gpName')}</label>
                                            <input type="text" value={race.name} onChange={(e) => handleRaceChange(index, 'name', e.target.value)} className="bg-[#15141f] text-lg font-bold p-1 rounded-md border border-slate-700 focus:outline-none focus:ring-2 focus:ring-[#00e051] focus:border-[#00e051] w-full" placeholder={t('edit_raceName')} />
                                        </div>
                                        <button onClick={() => handleRemoveRace(race, index)} className="ml-4 mt-6 p-2 text-slate-400 hover:text-[#e00601] transition-colors"><TrashIcon className="w-5 h-5"/></button>
                                    </div>
                                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                                        <div className="col-span-2">
                                            <label className="text-xs text-slate-400 mb-1 block">{t('country')}</label>
                                            <CountrySelector value={race.countryCode} onChange={(e) => handleRaceCountryChange(index, e.target.value)} />
                                        </div>
                                        <div>
                                            <label className="text-xs text-slate-400 mb-1 block">{t('laps')}</label>
                                            <input type="number" min="1" value={race.laps} onChange={(e) => handleRaceChange(index, 'laps', e.target.value)} className="w-full bg-[#15141f] p-2 rounded-md border border-slate-700 focus:outline-none focus:ring-2 focus:ring-[#00e051] focus:border-[#00e051] [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none" />
                                        </div>
                                        <div>
                                            <label className="text-xs text-slate-400 mb-1 block">{t('baseTime')}</label>
                                            <input type="text" value={race.baseLapTime} onChange={(e) => handleRaceChange(index, 'baseLapTime', e.target.value)} className="w-full bg-[#15141f] p-2 rounded-md border border-slate-700 focus:outline-none focus:ring-2 focus:ring-[#00e051] focus:border-[#00e051]" placeholder="1:30.252" />
                                        </div>
                                    </div>
                                    <div className="mt-4">
                                        <label className="text-xs text-slate-400 mb-2 block">{t('edit_weatherChances')}</label>
                                        <div className="grid grid-cols-3 gap-2 p-2 bg-[#15141f] rounded-md border border-slate-700">
                                            <div>
                                                <label className="text-xs text-center block text-slate-400">{t('weather_dry')}</label>
                                                <input type="number" min="0" max="100" value={Math.round(race.weatherChances.Dry * 100)} onChange={(e) => handleWeatherChanceChange('Dry', e.target.value)} className="w-full text-center bg-transparent [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none" />
                                            </div>
                                            <div>
                                                <label className="text-xs text-center block text-slate-400">{t('weather_lightRain')}</label>
                                                <input type="number" min="0" max="100" value={Math.round(race.weatherChances.LightRain * 100)} onChange={(e) => handleWeatherChanceChange('LightRain', e.target.value)} className="w-full text-center bg-transparent [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none" />
                                            </div>
                                            <div>
                                                <label className="text-xs text-center block text-slate-400">{t('weather_heavyRain')}</label>
                                                <input type="number" min="0" max="100" value={Math.round(race.weatherChances.HeavyRain * 100)} onChange={(e) => handleWeatherChanceChange('HeavyRain', e.target.value)} className="w-full text-center bg-transparent [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none" />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )})}
                        <button onClick={handleAddRace} className="w-full mt-4 py-2 bg-[#00e051] text-black hover:bg-opacity-90 rounded-lg font-bold flex items-center justify-center gap-2 transition-colors">
                            <PlusIcon className="w-5 h-5" /><span>{t('edit_addRace')}</span>
                        </button>
                    </div>
                );
            case 'engines':
                return (
                    <div className="space-y-4">
                        {engineSuppliers.map(supplier => (
                            <div key={supplier.name} className="p-4 bg-slate-500/10 rounded-lg grid grid-cols-1 sm:grid-cols-3 gap-4 items-end">
                                <div className="sm:col-span-2">
                                    <label className="text-xs text-slate-400 mb-1 block">{t('edit_supplierName')}</label>
                                    <input type="text" value={supplier.name} onChange={(e) => handleEngineSupplierChange(supplier.name, 'name', e.target.value)} className="w-full bg-[#15141f] p-2 rounded-md border border-slate-700 focus:outline-none focus:ring-2 focus:ring-[#00e051] focus:border-[#00e051]" />
                                </div>
                                <StatInput label={t('performance')} min={50} max={100} value={supplier.performance} onChange={(e) => handleEngineSupplierChange(supplier.name, 'performance', e.target.value)} />
                                <div className="sm:col-span-3 flex justify-end">
                                     <button onClick={() => handleRemoveEngineSupplier(supplier)} className="p-2 text-slate-400 hover:text-[#e00601] transition-colors"><TrashIcon className="w-5 h-5"/></button>
                                </div>
                            </div>
                        ))}
                        <button onClick={handleAddEngineSupplier} className="w-full mt-4 py-2 bg-[#00e051] text-black hover:bg-opacity-90 rounded-lg font-bold flex items-center justify-center gap-2 transition-colors">
                             <PlusIcon className="w-5 h-5" /><span>{t('edit_addEngine')}</span>
                        </button>
                    </div>
                );
        }
    };
    
    return (
        <div className="max-w-7xl mx-auto p-0 sm:p-4">
             <PromptModal
                isOpen={!!modalState?.isOpen}
                title={modalState?.title || ''}
                message={modalState?.message}
                defaultValue={null}
                onConfirm={() => modalState?.onConfirm()}
                onCancel={() => setModalState(null)}
            />
            <input type="file" ref={importInputRef} onChange={handleImportDatabase} accept=".json" style={{display: 'none'}} />
            <div className="bg-[#1e1e2b]/80 border border-slate-700 rounded-2xl backdrop-blur-sm shadow-lg">
                <div className="flex flex-wrap justify-between items-center p-4 border-b border-slate-700 gap-4">
                    <h2 className="text-2xl font-bold text-slate-200">{isOffSeason ? t('offSeasonEditor') : t('editor')}</h2>
                    <div className="flex items-center gap-2 flex-wrap">
                         <button onClick={() => importInputRef.current?.click()} className="px-3 py-2 text-sm bg-slate-600/50 text-slate-300 font-bold uppercase rounded-lg shadow-md hover:bg-slate-500/50 flex items-center justify-center gap-2 transition-colors">
                            <CloudArrowUpIcon className="w-5 h-5" />
                            <span>{t('edit_importDatabase')}</span>
                        </button>
                        <button onClick={handleExportDatabase} className="px-3 py-2 text-sm bg-slate-600/50 text-slate-300 font-bold uppercase rounded-lg shadow-md hover:bg-slate-500/50 flex items-center justify-center gap-2 transition-colors">
                            <CloudArrowUpIcon className="w-5 h-5 -scale-y-100" />
                            <span>{t('edit_exportDatabase')}</span>
                        </button>
                        {isOffSeason ? (
                            <button onClick={onBackToMenu} className="px-4 py-2 bg-[#e00601] text-white font-bold uppercase rounded-lg shadow-md hover:bg-opacity-90 flex items-center justify-center gap-2 transition-colors">
                                <CheckeredFlagIcon className="w-5 h-5" /><span>{t('startNextSeason')}</span>
                            </button>
                        ) : (
                             <button onClick={onBackToMenu} className="px-4 py-2 bg-slate-600/50 text-slate-300 font-bold uppercase rounded-lg shadow-md hover:bg-slate-500/50 flex items-center justify-center gap-2 transition-colors">
                                <HomeIcon className="w-5 h-5" /><span>{t('back')}</span>
                            </button>
                        )}
                    </div>
                </div>
                <div className="flex flex-wrap border-b border-slate-700 px-4">
                    <TabButton tab="drivers" label={t('drivers')} icon={<UserIcon className="w-5 h-5"/>} />
                    <TabButton tab="teams" label={t('teams')} icon={<UserGroupIcon className="w-5 h-5"/>} />
                    <TabButton tab="calendar" label={t('calendar')} icon={<CalendarIcon className="w-5 h-5"/>} />
                    <TabButton tab="engines" label={t('engines')} icon={<CogIcon className="w-5 h-5"/>} />
                </div>
                <div className="p-4 sm:p-6">
                    {renderContent()}
                </div>
            </div>
        </div>
    );
};

export default EditMenu;