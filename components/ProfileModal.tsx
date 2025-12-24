
import React, { useState, useMemo, useEffect } from 'react';
import { Driver, Team, RaceResult, QualifyingResult, Country } from '../types';
import { useI18n } from '../i18n';
import { getCountryByCode, getInitials } from '../utils';
import CloseIcon from './icons/CloseIcon';
import UserIcon from './icons/UserIcon';
import StatBar from './StatBar';
import ImageWithFallback from './ImageWithFallback';
import CountryFlag from './CountryFlag';

interface ProfileModalProps {
    isOpen: boolean;
    onClose: () => void;
    profileId?: number;
    profileType?: 'driver' | 'constructor';
    drivers: Driver[];
    teams: Team[];
    onSelectProfile: (id: number, type: 'driver' | 'constructor') => void;
    allRaceResults: RaceResult[][];
    allQualifyingResults: QualifyingResult[][];
    customCountries?: Country[];
}

const StatBox = ({ label, value }: { label: string, value: string | number }) => (
    <div className="bg-slate-900/50 p-4 rounded-lg text-center transform transition-transform hover:scale-105">
        <p className="text-sm text-slate-400 uppercase font-semibold">{label}</p>
        <p className="text-3xl font-bold text-white tracking-tight">{value}</p>
    </div>
);

const ProfileModal: React.FC<ProfileModalProps> = ({ isOpen, onClose, profileId, profileType, drivers, teams, onSelectProfile, allRaceResults, allQualifyingResults, customCountries = [] }) => {
    const { t } = useI18n();
    const [activeTab, setActiveTab] = useState<'details' | 'stats'>('details');

    useEffect(() => {
        if (isOpen) {
            setActiveTab('details');
        }
    }, [isOpen, profileId, profileType]);

    if (!isOpen || !profileId || !profileType) return null;

    const profileData = profileType === 'driver' 
        ? drivers.find(d => d.id === profileId) 
        : teams.find(t => t.id === profileId);

    if (!profileData) return null;
    
    const handleClose = () => {
        setActiveTab('details');
        onClose();
    };

    const TabButton: React.FC<{ tab: 'details' | 'stats', label: string }> = ({ tab, label }) => (
        <button
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 font-bold uppercase text-sm rounded-t-lg transition-colors border-b-2 ${
                activeTab === tab ? 'text-[#00e051] border-[#00e051]' : 'text-slate-400 border-transparent hover:text-slate-200'
            }`}
        >
            {label}
        </button>
    );

    const renderDriverStats = (driver: Driver) => {
        const allDriverResults = allRaceResults.flat().filter(r => r.driverId === driver.id);
        const allDriverQualis = allQualifyingResults.flat().filter(q => q.driverId === driver.id);

        if (allDriverResults.length === 0) {
            return <p className="text-center text-slate-400 py-10">{t('stats_noData')}</p>;
        }

        const finishedRaces = allDriverResults.filter(r => r.position > 0);

        const stats = {
            races: allDriverResults.length,
            wins: allDriverResults.filter(r => r.position === 1).length,
            podiums: allDriverResults.filter(r => r.position > 0 && r.position <= 3).length,
            poles: allDriverQualis.filter(q => q.position === 1).length,
            points: allDriverResults.reduce((sum, r) => sum + r.points, 0),
            dnfs: allDriverResults.filter(r => r.position === 0).length,
            bestFinish: finishedRaces.length ? Math.min(...finishedRaces.map(r => r.position)) : 'N/A',
            avgFinish: finishedRaces.length ? (finishedRaces.reduce((sum, r) => sum + r.position, 0) / finishedRaces.length).toFixed(1) : 'N/A',
            bestGrid: allDriverQualis.length ? Math.min(...allDriverQualis.map(q => q.position)) : 'N/A',
            avgGrid: allDriverQualis.length ? (allDriverQualis.reduce((sum, q) => sum + q.position, 0) / allDriverQualis.length).toFixed(1) : 'N/A',
        };

        return (
             <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 animate-fade-in">
                <StatBox label={t('stats_races')} value={stats.races} />
                <StatBox label={t('stats_wins')} value={stats.wins} />
                <StatBox label={t('stats_podiums')} value={stats.podiums} />
                <StatBox label={t('stats_poles')} value={stats.poles} />
                <StatBox label={t('stats_points')} value={stats.points} />
                <StatBox label={t('stats_dnfs')} value={stats.dnfs} />
                <StatBox label={t('stats_bestFinish')} value={stats.bestFinish} />
                <StatBox label={t('stats_avgFinish')} value={stats.avgFinish} />
                <StatBox label={t('stats_bestGrid')} value={stats.bestGrid} />
                <StatBox label={t('stats_avgGrid')} value={stats.avgGrid} />
            </div>
        )
    };
    
    const renderTeamStats = (team: Team) => {
        const driverIds = drivers.filter(d => d.teamId === team.id).map(d => d.id);
        const allTeamResults = allRaceResults.flat().filter(r => driverIds.includes(r.driverId));
        const allTeamQualis = allQualifyingResults.flat().filter(q => driverIds.includes(q.driverId));

        if (allTeamResults.length === 0) {
            return <p className="text-center text-slate-400 py-10">{t('stats_noData')}</p>;
        }
        
        const finishedRaces = allTeamResults.filter(r => r.position > 0);

        const stats = {
            races: allTeamResults.length,
            wins: allTeamResults.filter(r => r.position === 1).length,
            podiums: allTeamResults.filter(r => r.position > 0 && r.position <= 3).length,
            poles: allTeamQualis.filter(q => q.position === 1).length,
            points: allTeamResults.reduce((sum, r) => sum + r.points, 0),
            dnfs: allTeamResults.filter(r => r.position === 0).length,
        };

        return (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 animate-fade-in">
                <StatBox label={t('stats_races')} value={stats.races} />
                <StatBox label={t('stats_wins')} value={stats.wins} />
                <StatBox label={t('stats_podiums')} value={stats.podiums} />
                <StatBox label={t('stats_poles')} value={stats.poles} />
                <StatBox label={t('stats_points')} value={stats.points} />
                <StatBox label={t('stats_dnfs')} value={stats.dnfs} />
            </div>
        )
    };


    const renderDriverProfile = (driver: Driver) => {
        const team = teams.find(t => t.id === driver.teamId);
        const country = getCountryByCode(driver.nationality);
        // Fallback for custom country name if not found in standard list
        const customCountry = customCountries.find(c => c.code === driver.nationality);
        
        return (
            <div className="animate-fade-in">
                <div className="flex flex-col sm:flex-row items-center gap-6 mb-6">
                    <ImageWithFallback 
                        src={driver.photoUrl} 
                        alt={driver.name} 
                        primaryColor={team?.primaryColor || '#334155'}
                        accentColor={team?.accentColor || '#FFFFFF'}
                        initials={getInitials(driver.name)}
                        type="driver"
                        className="w-32 h-32 rounded-full object-cover border-4" 
                        style={{ borderColor: team?.primaryColor || 'var(--border-color)' }}
                    />
                    <div className="flex-grow text-center sm:text-left">
                         <h2 className="text-3xl font-bold text-slate-200">{driver.name}</h2>
                         <div className="flex items-center justify-center sm:justify-start gap-4 text-slate-400 mt-2">
                             <span className="flex items-center gap-2">
                                <CountryFlag countryCode={driver.nationality} customCountries={customCountries} className="w-5 h-auto rounded-sm" />
                                {customCountry?.name || country?.name || driver.nationality}
                             </span>
                             <span>•</span>
                             <span>{t('age')}: {driver.age}</span>
                         </div>
                         {team && (
                            <button onClick={() => onSelectProfile(team.id, 'constructor')} className="flex items-center gap-2 mt-2 bg-slate-500/20 hover:bg-slate-500/40 p-2 rounded-lg transition-colors mx-auto sm:mx-0">
                                <ImageWithFallback
                                    src={team.logoUrl}
                                    alt={team.name}
                                    primaryColor={team.primaryColor}
                                    accentColor={team.accentColor}
                                    initials={getInitials(team.name)}
                                    type="team"
                                    className="w-8 h-8 object-contain"
                                />
                                <span className="font-semibold text-slate-300">{team.name}</span>
                            </button>
                         )}
                    </div>
                </div>

                <div>
                    <h3 className="text-xl font-bold text-slate-300 mb-4 border-b border-slate-700 pb-2">{t('profile_skills')}</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                        <StatBar label={t('skill_speed')} value={driver.speed} max={10} />
                        <StatBar label={t('skill_overtaking')} value={driver.overtaking} max={10} />
                        <StatBar label={t('skill_concentration')} value={driver.concentration} max={10} />
                        <StatBar label={t('skill_start')} value={driver.startSkill} max={10} />
                        <StatBar label={t('skill_rain')} value={driver.rainSkill} max={10} />
                        <StatBar label={t('skill_setup')} value={driver.setupSkill} max={10} />
                        <StatBar label={t('skill_experience')} value={driver.experience} max={10} />
                        <StatBar label={t('skill_physical')} value={driver.physical} max={10} />
                        <StatBar label={t('skill_potential')} value={driver.potential} max={10} color='var(--accent-red)'/>
                    </div>
                </div>
            </div>
        );
    };

    const renderTeamProfile = (team: Team) => {
        const teamDrivers = drivers.filter(d => d.teamId === team.id);
        return (
            <div className="animate-fade-in">
                <div className="flex flex-col sm:flex-row items-center gap-6 mb-6">
                     <ImageWithFallback 
                        src={team.logoUrl} 
                        alt={team.name} 
                        primaryColor={team.primaryColor}
                        accentColor={team.accentColor}
                        initials={getInitials(team.name)}
                        type="team"
                        className="w-32 h-32 object-contain"
                    />
                    <div className="flex-grow text-center sm:text-left">
                         <h2 className="text-3xl font-bold" style={{color: team.primaryColor, textShadow: `0 0 8px ${team.accentColor}`}}>{team.name}</h2>
                         <p className="text-slate-400 mt-2">{t('profile_engineSupplier')}: <span className="font-semibold text-slate-300">{team.engineSupplier}</span></p>
                    </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div>
                        <h3 className="text-xl font-bold text-slate-300 mb-4 border-b border-slate-700 pb-2">{t('profile_carStats')}</h3>
                         <div className="space-y-4">
                            <StatBar label={t('stat_aero')} value={team.aerodynamics} max={100} />
                            <StatBar label={t('stat_gearbox')} value={team.gearbox} max={100} />
                            <StatBar label={t('stat_brakes')} value={team.brakes} max={100} />
                            <StatBar label={t('stat_electrical')} value={team.electricalSystem} max={100} />
                            <StatBar label={t('stat_steering')} value={team.steering} max={100} />
                            <StatBar label={t('stat_reliability')} value={team.reliability} max={100} color='var(--accent-red)' />
                         </div>
                    </div>
                    <div>
                        <h3 className="text-xl font-bold text-slate-300 mb-4 border-b border-slate-700 pb-2">{t('profile_teamDrivers')}</h3>
                        <div className="space-y-3">
                            {teamDrivers.map(driver => (
                                <button 
                                    key={driver.id}
                                    onClick={() => onSelectProfile(driver.id, 'driver')}
                                    className="w-full flex items-center gap-4 p-2 bg-slate-500/10 hover:bg-slate-500/20 rounded-lg transition-colors"
                                >
                                    <ImageWithFallback
                                        src={driver.photoUrl} 
                                        alt={driver.name} 
                                        primaryColor={team.primaryColor}
                                        accentColor={team.accentColor}
                                        initials={getInitials(driver.name)}
                                        type="driver"
                                        className="w-12 h-12 rounded-full object-cover"
                                    />
                                    <div>
                                        <p className="font-bold text-slate-200 text-left">{driver.name}</p>
                                        <p className="text-sm text-slate-400 text-left">{t('age')}: {driver.age}</p>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div 
            className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 p-4 backdrop-blur-sm animate-fade-in"
            onClick={handleClose}
        >
            <div 
                className="bg-[#1e1e2b] border border-slate-700 rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto flex flex-col"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="sticky top-0 bg-[#1e1e2b]/80 backdrop-blur-sm z-10 p-4 border-b border-slate-700 flex justify-between items-center">
                    <h2 className="text-xl font-bold text-slate-300 flex items-center gap-3">
                        {profileType === 'driver' ? <UserIcon className="w-6 h-6"/> : <UserIcon className="w-6 h-6"/>}
                        <span>{profileType === 'driver' ? t('profile_driverTitle') : t('profile_teamTitle')}</span>
                    </h2>
                    <button onClick={handleClose} className="text-slate-400 hover:text-white">
                        <CloseIcon className="w-6 h-6" />
                    </button>
                </div>

                <div className="border-b border-slate-700 px-4">
                    <TabButton tab="details" label={t('profile_details')} />
                    <TabButton tab="stats" label={t('profile_stats')} />
                </div>

                <div className="p-6">
                    {activeTab === 'details' && (
                        profileType === 'driver' ? renderDriverProfile(profileData as Driver) : renderTeamProfile(profileData as Team)
                    )}
                    {activeTab === 'stats' && (
                        profileType === 'driver' ? renderDriverStats(profileData as Driver) : renderTeamStats(profileData as Team)
                    )}
                </div>
            </div>
        </div>
    );
};

export default ProfileModal;
