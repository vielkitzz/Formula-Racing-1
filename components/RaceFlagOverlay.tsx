import React, { useState, useEffect, useRef } from 'react';
import CheckeredFlagIcon from './icons/CheckeredFlagIcon';
import { useI18n } from '../i18n';

interface RaceFlagOverlayProps {
    flagStatus?: 'green' | 'yellow' | 'red' | 'checkered';
    isSafetyCarDeployed: boolean;
}

const RaceFlagOverlay: React.FC<RaceFlagOverlayProps> = ({ flagStatus, isSafetyCarDeployed }) => {
    const { t } = useI18n();
    const [isVisible, setIsVisible] = useState(false);
    const [isHiding, setIsHiding] = useState(false);
    const [currentFlag, setCurrentFlag] = useState<string | null>(null);
    const [currentText, setCurrentText] = useState('');
    const [showSCBoard, setShowSCBoard] = useState(false);
    const hideTimerRef = useRef<number | null>(null);
    const visibleTimerRef = useRef<number | null>(null);

    useEffect(() => {
        if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
        if (visibleTimerRef.current) clearTimeout(visibleTimerRef.current);

        // Only update if the flag has actually changed.
        if (flagStatus === currentFlag) return;
        
        setIsHiding(false);
        let nextText = '';
        let nextShowSCBoard = false;

        if (flagStatus === 'yellow') {
            if (isSafetyCarDeployed) {
                nextText = t('flag_sc_desc');
                nextShowSCBoard = true;
            } else {
                nextText = t('flag_yellow_desc');
            }
        } else if (flagStatus === 'red') {
            nextText = t('flag_red_desc');
        } else if (flagStatus === 'green') {
            nextText = t('flag_green_desc');
        } else if (flagStatus === 'checkered') {
             nextText = t('checkeredFlag');
        }

        setCurrentFlag(flagStatus || null);
        setCurrentText(nextText);
        setShowSCBoard(nextShowSCBoard);
        setIsVisible(true);

        // Green flags are temporary notifications, other flags persist until the state changes.
        if (flagStatus === 'green') {
            hideTimerRef.current = window.setTimeout(() => {
                setIsHiding(true);
                visibleTimerRef.current = window.setTimeout(() => {
                    setIsVisible(false);
                }, 500); // Animation duration
            }, 2500); // Green flag display duration
        }

        return () => {
            if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
            if (visibleTimerRef.current) clearTimeout(visibleTimerRef.current);
        };
        // We intentionally don't include `currentFlag` here to avoid an infinite loop.
        // We are comparing the new `flagStatus` prop to the component's internal `currentFlag` state to detect changes.
    }, [flagStatus, isSafetyCarDeployed, t]);


    if (!isVisible) {
        return null;
    }
    
    let content = null;
    const baseClasses = `absolute inset-x-0 top-0 z-30 p-4 flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-4 text-black font-black text-2xl sm:text-3xl uppercase tracking-widest flag-overlay ${isHiding ? 'hiding' : ''}`;
    
    const flagNameMap = {
        'yellow': t('yellowFlag'),
        'red': t('redFlag'),
        'green': t('greenFlag'),
        'checkered': t('checkeredFlag'),
    };

    if (currentFlag === 'yellow') {
        content = (
            <div className={`${baseClasses} yellow-flag-pulse`}>
                <div className="flex items-center gap-4">
                    {showSCBoard && <div className="p-2 bg-black text-white rounded-md text-xl sm:text-2xl">SC</div>}
                    <span>{flagNameMap[currentFlag]}</span>
                </div>
                <p className="text-sm sm:text-base font-semibold normal-case tracking-normal">{currentText}</p>
            </div>
        );
    } else if (currentFlag === 'red') {
        content = (
             <div className={`${baseClasses} bg-red-600 text-white`}>
                <div className="flex items-center gap-4">
                    <span>{flagNameMap[currentFlag]}</span>
                </div>
                <p className="text-sm sm:text-base font-semibold normal-case tracking-normal">{currentText}</p>
            </div>
        )
    } else if (currentFlag === 'green') {
        content = (
             <div className={`${baseClasses} bg-green-500 text-white`}>
                <div className="flex items-center gap-4">
                    <span>{flagNameMap[currentFlag]}</span>
                </div>
                <p className="text-sm sm:text-base font-semibold normal-case tracking-normal">{currentText}</p>
            </div>
        )
    } else if (currentFlag === 'checkered') {
        content = (
            <div 
                className={`${baseClasses}`}
                style={{
                    backgroundColor: '#1a1a1a',
                    backgroundImage: 'linear-gradient(45deg, #333 25%, transparent 25%), linear-gradient(-45deg, #333 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #333 75%), linear-gradient(-45deg, transparent 75%, #333 75%)',
                    backgroundSize: '20px 20px',
                    backgroundPosition: '0 0, 0 10px, 10px -10px, -10px 0px',
                    color: 'white',
                    textShadow: '2px 2px 4px black'
                }}
            >
                <CheckeredFlagIcon className="h-6 w-6 sm:h-8 sm:w-8" />
                <span>{flagNameMap[currentFlag]}</span>
            </div>
        );
    }

    return content;
};

export default RaceFlagOverlay;