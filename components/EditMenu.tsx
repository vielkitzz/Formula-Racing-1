
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

const ChevronDownIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" {...props}>
        <path fillRule="evenodd" d="M12.53 16.28a.75.75 0 01-1.06 0l-7.5-7.5a.75.75 0 011.06-1.06L12 14.69l6.97-6.97a.75.75 0 111.06 1.06l-7.5 7.5z" clipRule="evenodd" />
    </svg>
);

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
        // Sync with parent state only if not currently focused
        if (document.activeElement !== document.getElementById(label)) {
            setDisplayValue(String(value));
        }
    }, [value, label]);

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

    return (
        <div className={className}>
            <label htmlFor={label} className="text-xs text-slate-400 mb-1 block">{label}</label>
            <input
                id={label} 
                type="number" 
                min={min} 
                max={max} 
                step={step}
                value={displayValue} 
                onChange={(e) => setDisplayValue(e.target.value)} 
                onBlur={handleBlur}
                className="w-full bg-[#15141f] p-2 rounded-md border border-slate-700 focus:outline-none focus:ring-2 focus:ring-[#00e051] focus:border-[#00e051] [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none" 
            />
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
    const [expandedId, setExpandedId] = useState<string | null>(null);
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
        
        setDrivers(prev => prev.map(d =>
            d.id === id ? { ...d, [field]: value } : d
        ));
    };

    const handleTeamChange = (id: number, field: keyof Team, value: string | number) => {
        setTeams(prev => prev.map(t =>
            t.id === id ? { ...t, [field]: value } : t
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
            code: `CUST_${Date.now()}`, // Unique ID
            isCustom: true,
            flagUrl: undefined
        };
        
        // Handle optional flag upload
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
    
    if (!file) {
        console.log("Nenhum arquivo selecionado");
        return;
    }

    // Verificar se é um arquivo JSON
    if (!file.name.toLowerCase().endsWith('.json')) {
        alert('Erro: Arquivo deve ter extensão .json');
        if (inputElement) inputElement.value = '';
        return;
    }

    // Remover window.confirm pois não é suportado no ambiente Claude.ai
    // Processar diretamente o arquivo
    const reader = new FileReader();
    
    reader.onload = (e) => {
        try {
        const text = e.target?.result as string;
        
        if (!text || text.trim() === '') {
            throw new Error("Arquivo está vazio ou não pôde ser lido.");
        }

        console.log("Tentando fazer parse do JSON...", text.substring(0, 100));
        
        let data;
        try {
            data = JSON.parse(text);
        } catch (parseError) {
            console.error("Erro de parse:", parseError);
            throw new Error(`Erro ao analisar JSON: ${parseError instanceof Error ? parseError.message : 'Formato inválido'}`);
        }

        if (typeof data !== 'object' || data === null) {
            throw new Error("Estrutura de arquivo inválida: Não é um objeto JSON válido.");
        }

        console.log("Dados importados:", data);

        // Validação e importação dos dados
        let updated = false;
        const warnings: string[] = [];

        // Validar e importar drivers
        if (data.drivers) {
            if (!Array.isArray(data.drivers)) {
            warnings.push("Campo 'drivers' deve ser um array");
            } else {
            // Validação rigorosa dos drivers
            const validDrivers = data.drivers.filter((driver: any) => {
                const isValid = driver && 
                            typeof driver.id === 'number' && 
                            typeof driver.name === 'string' && 
                            typeof driver.teamId === 'number' &&
                            typeof driver.age === 'number' &&
                            typeof driver.nationality === 'string';
                
                if (!isValid) {
                console.warn("Piloto inválido encontrado:", driver);
                }
                return isValid;
            });
            
            if (validDrivers.length > 0) {
                // Garantir que todos os campos obrigatórios existem
                const completeDrivers = validDrivers.map((driver: any) => ({
                ...driver,
                // Garantir campos obrigatórios com valores padrão
                startSkill: driver.startSkill || 5,
                concentration: driver.concentration || 5,
                overtaking: driver.overtaking || 5,
                experience: driver.experience || 5,
                speed: driver.speed || 5,
                rainSkill: driver.rainSkill || 5,
                setupSkill: driver.setupSkill || 5,
                physical: driver.physical || 5,
                potential: driver.potential || 7.5,
                salary: driver.salary || 1,
                contractEndsYear: driver.contractEndsYear || new Date().getFullYear() + 1,
                photoUrl: driver.photoUrl || ''
                }));
                
                setDrivers(completeDrivers);
                updated = true;
                console.log(`${validDrivers.length} pilotos importados com sucesso`);
            } else {
                warnings.push("Nenhum piloto válido encontrado nos dados");
            }
            }
        }

        // Validar e importar teams
        if (data.teams) {
            if (!Array.isArray(data.teams)) {
            warnings.push("Campo 'teams' deve ser um array");
            } else {
            const validTeams = data.teams.filter((team: any) => {
                const isValid = team && 
                            typeof team.id === 'number' && 
                            typeof team.name === 'string';
                
                if (!isValid) {
                console.warn("Equipe inválida encontrada:", team);
                }
                return isValid;
            });
            
            if (validTeams.length > 0) {
                // Garantir campos obrigatórios
                const completeTeams = validTeams.map((team: any) => ({
                ...team,
                aerodynamics: team.aerodynamics || 70,
                gearbox: team.gearbox || 70,
                brakes: team.brakes || 70,
                electricalSystem: team.electricalSystem || 70,
                steering: team.steering || 70,
                reliability: team.reliability || 70,
                engineSupplier: team.engineSupplier || 'Custom',
                primaryColor: team.primaryColor || '#cccccc',
                accentColor: team.accentColor || '#999999',
                logoUrl: team.logoUrl || '',
                budget: team.budget || 100,
                facilities: team.facilities || { aero: 1, chassis: 1, powertrain: 1, reliability: 1 }
                }));
                
                setTeams(completeTeams);
                updated = true;
                console.log(`${validTeams.length} equipes importadas com sucesso`);
            } else {
                warnings.push("Nenhuma equipe válida encontrada nos dados");
            }
            }
        }

        // Validar e importar calendar
        if (data.calendar) {
            if (!Array.isArray(data.calendar)) {
            warnings.push("Campo 'calendar' deve ser um array");
            } else {
            const validRaces = data.calendar.filter((race: any) => {
                const isValid = race && 
                            typeof race.name === 'string' && 
                            typeof race.country === 'string';
                
                if (!isValid) {
                console.warn("Corrida inválida encontrada:", race);
                }
                return isValid;
            });
            
            if (validRaces.length > 0) {
                // Garantir campos obrigatórios
                const completeRaces = validRaces.map((race: any) => ({
                ...race,
                laps: race.laps || 50,
                baseLapTime: race.baseLapTime || "1:30.000",
                countryCode: race.countryCode || 'BR',
                weatherChances: race.weatherChances || { Dry: 0.8, LightRain: 0.15, HeavyRain: 0.05 }
                }));
                
                setCalendar(completeRaces);
                updated = true;
                console.log(`${validRaces.length} corridas importadas com sucesso`);
            } else {
                warnings.push("Nenhuma corrida válida encontrada nos dados");
            }
            }
        }

        // Validar e importar engineSuppliers
        if (data.engineSuppliers) {
            if (!Array.isArray(data.engineSuppliers)) {
            warnings.push("Campo 'engineSuppliers' deve ser um array");
            } else {
            const validEngines = data.engineSuppliers.filter((engine: any) => {
                const isValid = engine && 
                            typeof engine.name === 'string' && 
                            typeof engine.performance === 'number';
                
                if (!isValid) {
                console.warn("Fornecedor de motor inválido encontrado:", engine);
                }
                return isValid;
            });
            
            if (validEngines.length > 0) {
                // Garantir campos obrigatórios
                const completeEngines = validEngines.map((engine: any) => ({
                ...engine,
                cost: engine.cost || 10
                }));
                
                setEngineSuppliers(completeEngines);
                updated = true;
                console.log(`${validEngines.length} fornecedores de motor importados com sucesso`);
            } else {
                warnings.push("Nenhum fornecedor de motor válido encontrado nos dados");
            }
            }
        }

        if (data.customCountries) {
            if(Array.isArray(data.customCountries)) {
                setCustomCountries(data.customCountries);
            }
        }

        // Verificar se algum dado foi importado
        if (!updated) {
            throw new Error("Nenhum dado válido foi encontrado no arquivo. Verifique a estrutura do JSON.");
        }

        // Mostrar resultado
        let successMessage = "Importação concluída com sucesso!";
        
        if (warnings.length > 0) {
            successMessage += "\n\nAvisos encontrados:\n• " + warnings.join("\n• ");
            console.warn("Avisos durante importação:", warnings);
        }

        alert(successMessage);
        console.log("Importação concluída com sucesso!");

        } catch (err) {
        console.error("Falha na importação:", err);
        const errorMessage = err instanceof Error ? err.message : String(err);
        alert(`Erro na importação: ${errorMessage}`);
        } finally {
        if (inputElement) inputElement.value = '';
        }
    };

    reader.onerror = (error) => {
        console.error("Erro do FileReader:", error);
        alert('Erro ao ler o arquivo. Tente novamente.');
        if (inputElement) inputElement.value = '';
    };

    // Iniciar leitura do arquivo
    try {
        reader.readAsText(file, 'utf-8');
        console.log("Iniciando leitura do arquivo:", file.name);
    } catch (error) {
        console.error("Erro ao iniciar leitura:", error);
        alert('Erro ao processar o arquivo');
        if (inputElement) inputElement.value = '';
    }
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

    const TabButton: React.FC<{ tab: EditTab, label: string, icon: React.ReactNode }> = ({ tab, label, icon }) => (
        <button
            onClick={() => setActiveTab(tab)}
            className={`flex items-center justify-center gap-2 px-4 py-3 text-sm font-bold uppercase rounded-t-lg transition-all duration-300 border-b-2 ${activeTab === tab ? 'text-[#00e051] border-[#00e051]' : 'text-slate-400 border-transparent hover:text-slate-200'}`}
        >
            {icon}
            <span>{label}</span>
        </button>
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
                    <div className="space-y-2">
                        <div className="p-4 bg-slate-900/50 rounded-lg flex flex-col sm:flex-row items-center justify-between gap-4">
                            <div className="flex items-center gap-3">
                                <label htmlFor="hide-potential-toggle" className="font-bold text-slate-300">{t('edit_hide_potential_label')}</label>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input type="checkbox" id="hide-potential-toggle" className="sr-only peer" checked={hidePotential} onChange={(e) => setHidePotential(e.target.checked)} />
                                    <div className="w-11 h-6 bg-slate-700 rounded-full peer peer-focus:ring-2 peer-focus:ring-green-800 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
                                </label>
                            </div>
                            <button onClick={handleRandomizeAllClick} className="w-full sm:w-auto px-4 py-2 bg-slate-600 hover:bg-slate-500 rounded-lg font-bold text-sm flex items-center justify-center gap-2 transition-colors">
                                <DiceIcon className="w-5 h-5" />
                                <span>{t('edit_randomize_potentials_button')}</span>
                            </button>
                        </div>
                        {drivers.map(driver => {
                            const id = `driver-${driver.id}`;
                            const isExpanded = expandedId === id;
                            const team = teams.find(t => t.id === driver.teamId);
                            return (
                                <div key={id} className="bg-slate-500/10 rounded-lg overflow-hidden transition-all duration-300">
                                    <button onClick={() => setExpandedId(isExpanded ? null : id)} className="w-full flex items-center p-3 text-left hover:bg-slate-500/10">
                                        <ImageWithFallback src={driver.photoUrl} alt={driver.name} primaryColor={team?.primaryColor || '#334155'} accentColor={team?.accentColor || '#FFFFFF'} initials={getInitials(driver.name)} type="driver" className="w-10 h-10 rounded-full object-cover" />
                                        <div className="ml-3 flex-grow">
                                            <p className="font-bold text-slate-200">{driver.name}</p>
                                            <p className="text-xs text-slate-400">{team?.name || t('unknownTeam')}</p>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <button onClick={(e) => { e.stopPropagation(); handleRandomizeDriverStats(driver.id); }} title={t('edit_randomizeTooltip')} className="p-2 text-slate-400 hover:text-[#00e051] transition-colors rounded-full"><DiceIcon className="w-5 h-5"/></button>
                                            <button onClick={(e) => { e.stopPropagation(); handleRemoveDriver(driver); }} className="p-2 text-slate-400 hover:text-[#e00601] transition-colors rounded-full"><TrashIcon className="w-5 h-5"/></button>
                                            <ChevronDownIcon className={`w-6 h-6 text-slate-400 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`} />
                                        </div>
                                    </button>
                                    {isExpanded && (
                                        <div className="p-4 border-t border-slate-700 space-y-4 animate-fade-in">
                                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                                                <div className="sm:col-span-2">
                                                    <label className="text-xs text-slate-400 mb-1 block">{t('driver')}</label>
                                                    <input type="text" value={driver.name} onChange={(e) => handleDriverChange(driver.id, 'name', e.target.value)} className="w-full bg-[#15141f] p-2 rounded-md border border-slate-700 focus:outline-none focus:ring-2 focus:ring-[#00e051] focus:border-[#00e051]" />
                                                </div>
                                                <ImageUploader id={driver.id} currentImage={driver.photoUrl} onUpload={(e) => handleImageUpload(driver.id, 'driver', e)} onRemove={() => handleDriverChange(driver.id, 'photoUrl', '')} type="driver" />
                                                <EditableStatInput label={t('age')} min={16} max={50} value={driver.age} onChange={(v) => handleDriverChange(driver.id, 'age', v)} />
                                                <div className="sm:col-span-2">
                                                    <label className="text-xs text-slate-400 mb-1 block">{t('team')}</label>
                                                    <select value={driver.teamId} onChange={(e) => handleDriverChange(driver.id, 'teamId', parseInt(e.target.value, 10))} className="w-full bg-[#15141f] p-2.5 rounded-md border border-slate-700 focus:outline-none focus:ring-2 focus:ring-[#00e051] focus:border-[#00e051]">
                                                        {teams.map(team => {
                                                            const isFull = (driverCountsByTeam[team.id] || 0) >= 2;
                                                            return (<option key={team.id} value={team.id} disabled={isFull && team.id !== driver.teamId} className="bg-[#1e1e2b]">{team.name}{isFull && team.id !== driver.teamId ? ` (${t('edit_teamFull_short')})` : ''}</option>);
                                                        })}
                                                    </select>
                                                </div>
                                                <CountrySelector customCountries={customCountries} value={driver.nationality} onChange={(e) => handleDriverChange(driver.id, 'nationality', e.target.value)} className="self-end" />
                                            </div>
                                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                                <EditableStatInput label={t('skill_speed')} min={1} max={10} value={driver.speed} onChange={(v) => handleDriverChange(driver.id, 'speed', v)} />
                                                <EditableStatInput label={t('skill_overtaking')} min={1} max={10} value={driver.overtaking} onChange={(v) => handleDriverChange(driver.id, 'overtaking', v)} />
                                                <EditableStatInput label={t('skill_concentration')} min={1} max={10} value={driver.concentration} onChange={(v) => handleDriverChange(driver.id, 'concentration', v)} />
                                                <EditableStatInput label={t('skill_start')} min={1} max={10} value={driver.startSkill} onChange={(v) => handleDriverChange(driver.id, 'startSkill', v)} />
                                                <EditableStatInput label={t('skill_rain')} min={1} max={10} value={driver.rainSkill} onChange={(v) => handleDriverChange(driver.id, 'rainSkill', v)} />
                                                <EditableStatInput label={t('skill_setup')} min={1} max={10} value={driver.setupSkill} onChange={(v) => handleDriverChange(driver.id, 'setupSkill', v)} />
                                                <EditableStatInput label={t('skill_experience')} min={1} max={10} value={driver.experience} onChange={(v) => handleDriverChange(driver.id, 'experience', v)} />
                                                <EditableStatInput label={t('skill_physical')} min={1} max={10} value={driver.physical} onChange={(v) => handleDriverChange(driver.id, 'physical', v)} />
                                            </div>
                                            {!hidePotential && (
                                                <EditableStatInput label={t('skill_potential')} min={1} max={10} step={0.1} isFloat={true} value={driver.potential} onChange={(v) => handleDriverChange(driver.id, 'potential', v)} />
                                            )}
                                        </div>
                                    )}
                                </div>
                            )})}
                        <button onClick={handleAddDriver} disabled={!isAnyTeamAvailable} className="w-full mt-4 py-2 bg-[#00e051] text-black hover:bg-opacity-90 rounded-lg font-bold flex items-center justify-center gap-2 transition-colors disabled:bg-slate-500 disabled:text-slate-300 disabled:cursor-not-allowed">
                            <PlusIcon className="w-5 h-5" /><span>{t('edit_addDriver')}</span>
                        </button>
                    </div>
                );
            case 'teams':
                 return (
                    <div className="space-y-2">
                        {teams.map(team => {
                            const id = `team-${team.id}`;
                            const isExpanded = expandedId === id;
                            return (
                                <div key={id} className="bg-slate-500/10 rounded-lg overflow-hidden transition-all duration-300">
                                    <button onClick={() => setExpandedId(isExpanded ? null : id)} className="w-full flex items-center p-3 text-left hover:bg-slate-500/10">
                                        <ImageWithFallback src={team.logoUrl} alt={team.name} primaryColor={team.primaryColor} accentColor={team.accentColor} initials={getInitials(team.name)} type="team" className="h-10 w-12 object-contain" />
                                        <p className="ml-3 flex-grow font-bold text-slate-200">{team.name}</p>
                                        <button onClick={(e) => { e.stopPropagation(); handleRemoveTeam(team); }} className="p-2 text-slate-400 hover:text-[#e00601] transition-colors rounded-full"><TrashIcon className="w-5 h-5"/></button>
                                        <ChevronDownIcon className={`w-6 h-6 text-slate-400 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`} />
                                    </button>
                                    {isExpanded && (
                                        <div className="p-4 border-t border-slate-700 space-y-4 animate-fade-in">
                                             <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                <div>
                                                    <label className="text-xs text-slate-400 mb-1 block">{t('team')}</label>
                                                    <input type="text" value={team.name} onChange={(e) => handleTeamChange(team.id, 'name', e.target.value)} className="w-full bg-[#15141f] p-2 rounded-md border border-slate-700 focus:outline-none focus:ring-2 focus:ring-[#00e051] focus:border-[#00e051]" />
                                                </div>
                                                <ImageUploader id={team.id} currentImage={team.logoUrl} onUpload={(e) => handleImageUpload(team.id, 'team', e)} onRemove={() => handleTeamChange(team.id, 'logoUrl', '')} type="team" />
                                                <div>
                                                    <label className="text-xs text-slate-400 mb-1 block">{t('engine')}</label>
                                                    <select value={team.engineSupplier} onChange={(e) => handleTeamChange(team.id, 'engineSupplier', e.target.value)} className="w-full bg-[#15141f] p-2.5 rounded-md border border-slate-700 focus:outline-none focus:ring-2 focus:ring-[#00e051] focus:border-[#00e051]">
                                                        {engineSuppliers.map(supplier => (<option key={supplier.name} value={supplier.name} className="bg-[#1e1e2b]">{supplier.name}</option>))}
                                                        <option value={team.name} className="bg-[#1e1e2b]">{t('edit_inHouse')}</option>
                                                    </select>
                                                </div>
                                             </div>
                                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                                <EditableStatInput label={t('stat_aero')} min={50} max={100} value={team.aerodynamics} onChange={(v) => handleTeamChange(team.id, 'aerodynamics', v)} />
                                                <EditableStatInput label={t('stat_gearbox')} min={50} max={100} value={team.gearbox} onChange={(v) => handleTeamChange(team.id, 'gearbox', v)} />
                                                <EditableStatInput label={t('stat_brakes')} min={50} max={100} value={team.brakes} onChange={(v) => handleTeamChange(team.id, 'brakes', v)} />
                                                <EditableStatInput label={t('stat_electrical')} min={50} max={100} value={team.electricalSystem} onChange={(v) => handleTeamChange(team.id, 'electricalSystem', v)} />
                                                <EditableStatInput label={t('stat_steering')} min={50} max={100} value={team.steering} onChange={(v) => handleTeamChange(team.id, 'steering', v)} />
                                                <EditableStatInput label={t('stat_reliability')} min={50} max={100} value={team.reliability} onChange={(v) => handleTeamChange(team.id, 'reliability', v)} />
                                            </div>
                                            <div className="grid grid-cols-2 gap-4">
                                                <ColorInput label={t('edit_primaryColor')} value={team.primaryColor} onChange={(e) => handleTeamChange(team.id, 'primaryColor', e.target.value)} />
                                                <ColorInput label={t('edit_accentColor')} value={team.accentColor} onChange={(e) => handleTeamChange(team.id, 'accentColor', e.target.value)} />
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )})}
                        <button onClick={handleAddTeam} className="w-full mt-4 py-2 bg-[#00e051] text-black hover:bg-opacity-90 rounded-lg font-bold flex items-center justify-center gap-2 transition-colors">
                            <PlusIcon className="w-5 h-5" /><span>{t('edit_addTeam')}</span>
                        </button>
                    </div>
                );
            case 'calendar':
                return (
                     <div className="space-y-2">
                        {calendar.map((race, index) => {
                             const id = `race-${index}`;
                             const isExpanded = expandedId === id;
                            const handleWeatherChanceChange = (type: 'Dry' | 'LightRain' | 'HeavyRain', value: string) => {
                                const newChances = { ...race.weatherChances };
                                const numValue = parseInt(value, 10);
                                const validNum = isNaN(numValue) ? 0 : Math.max(0, Math.min(100, numValue));
                                
                                const otherSum = (type === 'Dry' ? 0 : newChances.Dry*100) + (type === 'LightRain' ? 0 : newChances.LightRain*100) + (type === 'HeavyRain' ? 0 : newChances.HeavyRain*100);
                                if (validNum + otherSum > 100) return; // Prevent going over 100

                                newChances[type] = validNum / 100;

                                handleRaceChange(index, 'weatherChances', newChances);
                            };
                            return (
                                <div key={index} className="bg-slate-500/10 rounded-lg overflow-hidden transition-all duration-300">
                                    <button onClick={() => setExpandedId(isExpanded ? null : id)} className="w-full flex items-center p-3 text-left hover:bg-slate-500/10">
                                        <p className="flex-grow font-bold text-slate-200">{race.name}</p>
                                        <button onClick={(e) => { e.stopPropagation(); handleRemoveRace(race, index); }} className="p-2 text-slate-400 hover:text-[#e00601] transition-colors rounded-full"><TrashIcon className="w-5 h-5"/></button>
                                        <ChevronDownIcon className={`w-6 h-6 text-slate-400 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`} />
                                    </button>
                                    {isExpanded && (
                                        <div className="p-4 border-t border-slate-700 space-y-4 animate-fade-in">
                                            <div>
                                                <label className="text-xs text-slate-400 mb-1 block">{t('edit_gpName')}</label>
                                                <input type="text" value={race.name} onChange={(e) => handleRaceChange(index, 'name', e.target.value)} className="w-full bg-[#15141f] p-2 rounded-md border border-slate-700 focus:outline-none focus:ring-2 focus:ring-[#00e051] focus:border-[#00e051]" />
                                            </div>
                                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                                                <div className="col-span-2">
                                                    <label className="text-xs text-slate-400 mb-1 block">{t('country')}</label>
                                                    <CountrySelector customCountries={customCountries} value={race.countryCode} onChange={(e) => handleRaceCountryChange(index, e.target.value)} />
                                                </div>
                                                <EditableStatInput label={t('laps')} min={1} max={200} value={race.laps} onChange={(v) => handleRaceChange(index, 'laps', v)} />
                                                <div>
                                                    <label className="text-xs text-slate-400 mb-1 block">{t('baseTime')}</label>
                                                    <input type="text" value={race.baseLapTime} onChange={(e) => handleRaceChange(index, 'baseLapTime', e.target.value)} className="w-full bg-[#15141f] p-2 rounded-md border border-slate-700 focus:outline-none focus:ring-2 focus:ring-[#00e051] focus:border-[#00e051]" placeholder="1:30.252" />
                                                </div>
                                            </div>
                                            <div>
                                                <label className="text-xs text-slate-400 mb-2 block">{t('edit_weatherChances')}</label>
                                                <div className="grid grid-cols-3 gap-2 p-2 bg-[#15141f] rounded-md border border-slate-700">
                                                     {['Dry', 'LightRain', 'HeavyRain'].map(type => (
                                                        <div key={type}>
                                                            <label className="text-xs text-center block text-slate-400">{t(`weather_${type.toLowerCase()}` as any)}</label>
                                                            <input type="number" min="0" max="100" value={Math.round(race.weatherChances[type as keyof typeof race.weatherChances] * 100)} onChange={(e) => handleWeatherChanceChange(type as any, e.target.value)} className="w-full text-center bg-transparent [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none" />
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    )}
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
                                <EditableStatInput label={t('performance')} min={50} max={100} value={supplier.performance} onChange={(v) => handleEngineSupplierChange(supplier.name, 'performance', v)} />
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
            case 'countries':
                return (
                    <div className="space-y-4">
                        {/* Form to add new country */}
                        <div className="p-4 bg-slate-500/10 rounded-lg space-y-4 border border-slate-600">
                            <h3 className="font-bold text-slate-200">{t('create_country')}</h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="text-xs text-slate-400 mb-1 block">{t('country_name')}</label>
                                    <input 
                                        type="text" 
                                        value={newCountryName} 
                                        onChange={(e) => setNewCountryName(e.target.value)} 
                                        placeholder={t('country_name')}
                                        className="w-full bg-[#15141f] p-2 rounded-md border border-slate-700 focus:outline-none focus:ring-2 focus:ring-[#00e051] focus:border-[#00e051]" 
                                    />
                                </div>
                                <div>
                                    <label className="text-xs text-slate-400 mb-1 block">{t('country_flag')}</label>
                                    <div className="flex items-center gap-2">
                                        <input ref={newCountryInputRef} type="file" accept="image/*" className="hidden" id="new-country-flag" />
                                        <label htmlFor="new-country-flag" className="flex-grow cursor-pointer p-2 bg-slate-600 hover:bg-slate-500 rounded-md text-center text-sm flex items-center justify-center gap-2 transition-colors">
                                            <CloudArrowUpIcon className="w-5 h-5" />
                                            <span>{t('edit_uploadImage')}</span>
                                        </label>
                                    </div>
                                </div>
                            </div>
                            <button 
                                onClick={handleCreateCustomCountry}
                                disabled={!newCountryName.trim()} 
                                className="w-full py-2 bg-[#00e051] text-black hover:bg-opacity-90 rounded-lg font-bold flex items-center justify-center gap-2 transition-colors disabled:bg-slate-600 disabled:text-slate-400 disabled:cursor-not-allowed"
                            >
                                <PlusIcon className="w-5 h-5" /><span>{t('create_country_btn')}</span>
                            </button>
                        </div>

                        {/* List of custom countries */}
                        <div className="space-y-2">
                            {customCountries.length === 0 && <p className="text-slate-400 text-center py-4">{t('no_custom_countries')}</p>}
                            {customCountries.map(country => (
                                <div key={country.code} className="flex items-center justify-between p-3 bg-slate-500/10 rounded-lg">
                                    <div className="flex items-center gap-3">
                                        <CountryFlag countryCode={country.code} customCountries={customCountries} className="w-8 h-auto rounded-sm border border-slate-600" />
                                        <span className="font-bold text-slate-200">{country.name}</span>
                                    </div>
                                    <button onClick={() => handleDeleteCustomCountry(country.code)} className="p-2 text-slate-400 hover:text-[#e00601] transition-colors rounded-full">
                                        <TrashIcon className="w-5 h-5"/>
                                    </button>
                                </div>
                            ))}
                        </div>
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
                    <TabButton tab="countries" label={t('countries')} icon={<FlagIcon className="w-5 h-5"/>} />
                </div>
                <div className="p-4 sm:p-6">
                    {renderContent()}
                </div>
            </div>
        </div>
    );
};

export default EditMenu;
