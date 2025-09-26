import { RegulationChangeProposal, Team, EngineSupplier } from './types';
import { translations } from './i18n/translations';

// Helper to create a proposal structure
const createProposal = (id: string, getEffect: RegulationChangeProposal['getEffect']): RegulationChangeProposal => ({
    id,
    titleKey: `proposal_${id}_title` as keyof typeof translations,
    descriptionKey: `proposal_${id}_desc` as keyof typeof translations,
    getEffect,
});

const allProposals: RegulationChangeProposal[] = [
    // 1. Aero Crackdown
    createProposal('aero_crackdown', () => {
        const reductionPercent = 0.05 + Math.random() * 0.05; // 5-10% reduction
        return ({ teams, engineSuppliers }) => ({
            teams: teams.map(t => ({
                ...t,
                aerodynamics: Math.max(50, Math.round(t.aerodynamics * (1 - reductionPercent))),
            })),
            engineSuppliers,
        });
    }),
    
    // 2. Engine Freeze/Convergence
    createProposal('engine_freeze', () => {
        return ({ teams, engineSuppliers }) => {
            const avgPerf = engineSuppliers.reduce((sum, es) => sum + es.performance, 0) / engineSuppliers.length;
            return {
                teams,
                engineSuppliers: engineSuppliers.map(es => ({
                    ...es,
                    // Converge towards average
                    performance: Math.max(50, Math.round(es.performance * 0.8 + avgPerf * 0.2)), 
                })),
            };
        };
    }),

    // 3. Cost Cap
    createProposal('cost_cap', () => {
        return ({ teams, engineSuppliers }) => {
            // Sort teams by a simple performance metric
            const sortedTeams = [...teams].sort((a, b) => (b.aerodynamics + b.gearbox) - (a.aerodynamics + a.gearbox));
            const topTeamIds = sortedTeams.slice(0, 3).map(t => t.id);
            const reduction = 3; // Reduce by 3 points
            return {
                teams: teams.map(t => {
                    if (topTeamIds.includes(t.id)) {
                        return {
                            ...t,
                            aerodynamics: Math.max(50, t.aerodynamics - reduction),
                            gearbox: Math.max(50, t.gearbox - reduction),
                            brakes: Math.max(50, t.brakes - reduction),
                        };
                    }
                    return t;
                }),
                engineSuppliers,
            };
        };
    }),

    // 4. Reliability Focus
    createProposal('reliability_focus', () => {
        const reliabilityBoost = 5;
        const performancePenalty = 2;
        return ({ teams, engineSuppliers }) => ({
            teams: teams.map(t => ({
                ...t,
                reliability: Math.min(100, t.reliability + reliabilityBoost),
                aerodynamics: Math.max(50, t.aerodynamics - performancePenalty),
                gearbox: Math.max(50, t.gearbox - performancePenalty),
            })),
            engineSuppliers,
        });
    }),
];

// Function to get a random subset of proposals
export const generateRegulationProposals = (count = 3): RegulationChangeProposal[] => {
    const shuffled = [...allProposals].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
};
