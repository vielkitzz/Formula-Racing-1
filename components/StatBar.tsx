
import React from 'react';

interface StatBarProps {
    label: string;
    value: number;
    max: number;
    color?: string;
}

const StatBar: React.FC<StatBarProps> = ({ label, value, max, color = 'var(--accent-green)' }) => {
    const percentage = (value / max) * 100;
    
    return (
        <div>
            <div className="flex justify-between items-center mb-1 text-sm">
                <span className="font-semibold text-slate-300">{label}</span>
                <span className="font-mono text-slate-200">{value.toFixed(1)}</span>
            </div>
            <div className="w-full bg-slate-700 rounded-full h-2.5">
                <div 
                    className="h-2.5 rounded-full transition-all duration-500" 
                    style={{ 
                        width: `${percentage}%`,
                        backgroundColor: color,
                        boxShadow: `0 0 8px ${color}`
                    }}
                ></div>
            </div>
        </div>
    );
};

export default StatBar;
