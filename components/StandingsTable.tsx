
import React from 'react';
import { DriverStanding, ConstructorStanding, Driver, Team, Country } from '../types';
import TrophyIcon from './icons/TrophyIcon';
import { getCountryByCode, getInitials } from '../utils';
import { useI18n } from '../i18n';
import ImageWithFallback from './ImageWithFallback';
import CountryFlag from './CountryFlag';

interface StandingsTableProps {
  title: string;
  standings: (DriverStanding[] | ConstructorStanding[]);
  type: 'driver' | 'constructor';
  seasonOver: boolean;
  drivers: Driver[];
  teams: Team[];
  customCountries?: Country[];
  onRowClick: (id: number, type: 'driver' | 'constructor') => void;
}

const StandingsTable: React.FC<StandingsTableProps> = ({ title, standings, type, seasonOver, drivers, teams, customCountries = [], onRowClick }) => {
  const { t } = useI18n();
  const isDriver = type === 'driver';

  return (
    <div className="flex flex-col h-full w-full">
      <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 p-4 border-b border-slate-700 bg-[#1e1e2b] sticky top-0 z-10">{title}</h3>
      <div className="flex-1 overflow-auto">
        <table className="w-full text-left border-collapse">
          <thead className="bg-[#15141f] sticky top-0 z-10 text-xs font-semibold uppercase text-slate-500">
            <tr>
              <th className="p-2 w-10 text-center">#</th>
              <th className="p-2">{isDriver ? t('driver') : t('team')}</th>
              <th className="p-2 text-right">{t('points')}</th>
            </tr>
          </thead>
          <tbody className="text-sm">
            {standings.map((standing, index) => {
              const pos = index + 1;
              let name: string = '';
              let teamName: string | undefined = undefined;
              let teamPrimaryColor: string = '#4B5563'; // gray-600 default
              let teamAccentColor: string = '#FFFFFF';
              let imageUrl: string | undefined = undefined;
              let nationalityCode: string | undefined = undefined;
              let item: Driver | Team | undefined;

              if (isDriver) {
                const driver = drivers.find(d => d.id === (standing as DriverStanding).driverId);
                const team = teams.find(t => t.id === driver?.teamId);
                item = driver;
                name = driver?.name || t('unknownDriver');
                teamName = team?.name;
                teamPrimaryColor = team?.primaryColor || '#4B5563';
                teamAccentColor = team?.accentColor || '#FFFFFF';
                imageUrl = driver?.photoUrl;
                nationalityCode = driver?.nationality;
              } else {
                const team = teams.find(t => t.id === (standing as ConstructorStanding).teamId);
                item = team;
                name = team?.name || t('unknownTeam');
                teamPrimaryColor = team?.primaryColor || '#4B5563';
                teamAccentColor = team?.accentColor || '#FFFFFF';
                imageUrl = team?.logoUrl;
              }
              
              const isChampion = seasonOver && index === 0;
              if (!item) return null;
              const id = item.id;

              return (
                <tr 
                  key={id} 
                  className={`border-b border-slate-800 last:border-0 transition-colors duration-200 cursor-pointer hover:bg-slate-700/30 ${isChampion ? 'bg-[#00e051]/5' : ''}`}
                  onClick={() => onRowClick(id, type)}
                >
                  <td className="p-2 text-center font-mono font-bold text-slate-400 relative">
                    {pos}
                    {isChampion && <TrophyIcon className="absolute -left-1 top-1/2 -translate-y-1/2 w-4 h-4 text-[#00e051]" />}
                  </td>
                  <td className="p-2">
                    <div className="flex items-center space-x-3">
                        <div className="w-1 h-8 rounded-full" style={{ backgroundColor: teamPrimaryColor }}></div>
                        <ImageWithFallback
                        src={imageUrl}
                        alt={name}
                        primaryColor={teamPrimaryColor}
                        accentColor={teamAccentColor}
                        initials={getInitials(name)}
                        type={type === 'constructor' ? 'team' : type}
                        className={`h-8 w-8 flex-shrink-0 ${isDriver ? 'rounded-full object-cover' : 'object-contain'}`}
                        />
                        <div className="min-w-0">
                        <div className="font-semibold text-slate-200 truncate flex items-center gap-2">
                            {nationalityCode && (
                            <CountryFlag 
                                countryCode={nationalityCode}
                                customCountries={customCountries}
                                alt={getCountryByCode(nationalityCode)?.name} 
                                title={getCountryByCode(nationalityCode)?.name}
                                className="w-4 h-auto rounded-sm"
                            />
                            )}
                            <span className="truncate">{name}</span>
                        </div>
                        {teamName && <div className="text-xs text-slate-500 truncate">{teamName}</div>}
                        </div>
                    </div>
                  </td>
                  <td className="p-2 font-mono font-bold text-slate-200 text-right pr-4">{standing.points}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default StandingsTable;
