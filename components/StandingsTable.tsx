import React from 'react';
import { DriverStanding, ConstructorStanding, Driver, Team } from '../types';
import TrophyIcon from './icons/TrophyIcon';
import { getCountryByCode, getCountryFlagUrl, getInitials } from '../utils';
import { useI18n } from '../i18n';
import ImageWithFallback from './ImageWithFallback';

interface StandingsTableProps {
  title: string;
  standings: (DriverStanding[] | ConstructorStanding[]);
  type: 'driver' | 'constructor';
  seasonOver: boolean;
  drivers: Driver[];
  teams: Team[];
  onRowClick: (id: number, type: 'driver' | 'constructor') => void;
}

const StandingsTable: React.FC<StandingsTableProps> = ({ title, standings, type, seasonOver, drivers, teams, onRowClick }) => {
  const { t } = useI18n();
  const isDriver = type === 'driver';

  return (
    <div className="bg-[#1e1e2b]/80 border border-slate-700 rounded-2xl backdrop-blur-sm shadow-lg p-6">
      <h3 className="text-xl font-bold mb-4 text-slate-200">{title}</h3>
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-slate-700">
              <th className="p-3 text-sm font-semibold uppercase text-slate-400">{t('pos')}</th>
              <th className="p-3 text-sm font-semibold uppercase text-slate-400">{isDriver ? t('driver') : t('team')}</th>
              <th className="p-3 text-sm font-semibold uppercase text-slate-400 text-right">{t('points')}</th>
            </tr>
          </thead>
          <tbody>
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
                  className={`border-b border-slate-800 last:border-0 transition-colors duration-200 cursor-pointer hover:bg-slate-500/20 ${isChampion ? 'bg-[#00e051]/10' : ''}`}
                  onClick={() => onRowClick(id, type)}
                >
                  <td className="p-3 font-bold w-12 text-center relative">
                    {pos}
                    {isChampion && <TrophyIcon className="absolute -left-2 top-1/2 -translate-y-1/2 w-5 h-5 text-[#00e051]" />}
                  </td>
                  <td className="p-3 flex items-center space-x-3" style={{ borderLeft: `4px solid ${teamPrimaryColor}` }}>
                    <ImageWithFallback
                      src={imageUrl}
                      alt={name}
                      primaryColor={teamPrimaryColor}
                      accentColor={teamAccentColor}
                      initials={getInitials(name)}
                      // FIX: Map 'constructor' type to 'team' for ImageWithFallback component prop compatibility.
                      type={type === 'constructor' ? 'team' : type}
                      className={`h-10 w-10 ${isDriver ? 'rounded-full object-cover' : 'object-contain'}`}
                    />
                    <div>
                      <div className="font-semibold flex items-center gap-2">
                         {nationalityCode && (
                          <img 
                            src={getCountryFlagUrl(nationalityCode)} 
                            alt={getCountryByCode(nationalityCode)?.name} 
                            title={getCountryByCode(nationalityCode)?.name}
                            className="w-5 h-auto rounded-sm"
                          />
                        )}
                        <span>{name}</span>
                      </div>
                      {teamName && <div className="text-xs text-slate-400">{teamName}</div>}
                    </div>
                  </td>
                  <td className="p-3 font-bold text-lg text-right">{standing.points}</td>
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