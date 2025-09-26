import React from 'react';

const SunIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" {...props}>
    <path d="M8 1a.75.75 0 0 1 .75.75v1.5a.75.75 0 0 1-1.5 0v-1.5A.75.75 0 0 1 8 1m2.5 7a2.5 2.5 0 1 1-5 0a2.5 2.5 0 0 1 5 0m2.45-3.89a.75.75 0 1 0-1.06-1.06l-1.062 1.06a.75.75 0 0 0 1.061 1.062zM15 8a.75.75 0 0 1-.75.75h-1.5a.75.75 0 0 1 0-1.5h1.5A.75.75 0 0 1 15 8m-3.11 4.95a.75.75 0 0 0 1.06-1.06l-1.06-1.062a.75.75 0 0 0-1.062 1.061zM8 12a.75.75 0 0 1 .75.75v1.5a.75.75 0 0 1-1.5 0v-1.5A.75.75 0 0 1 8 12m-2.828-.11a.75.75 0 0 0-1.061-1.062L3.05 11.89a.75.75 0 1 0 1.06 1.06zM4 8a.75.75 0 0 1-.75.75h-1.5a.75.75 0 0 1 0-1.5h1.5A.75.75 0 0 1 4 8m.11-2.828A.75.75 0 0 0 5.173 4.11L4.11 3.05a.75.75 0 1 0-1.06 1.06z" />
  </svg>
);

const LightRainIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" {...props}>
    <path d="M6 14h12a3 3 0 1 0 0-6c-.64 0-1.174-.461-1.436-1.045a5 5 0 0 0-9.128 0C7.174 7.539 6.64 8 6 8a3 3 0 0 0 0 6" clip-rule="evenodd"/><path stroke="currentColor" stroke-linecap="round" stroke-width="2" d="M12 19v-2m5 3v-3M7 21v-4"/>
  </svg>
);

const HeavyRainIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" {...props}>
    <path fillRule="evenodd" d="M6 12h12a3 3 0 1 0 0-6c-.64 0-1.174-.461-1.436-1.045a5 5 0 0 0-9.128 0C7.174 5.539 6.64 6 6 6a3 3 0 0 0 0 6"/><path fill="currentColor" fill-rule="evenodd" d="m10.235 14l-.462.786c-.787 1.338-1.18 2.007-.893 2.51c.288.504 1.065.504 2.62.504c.236 0 .354 0 .427.073c.073.073.073.191.073.427v1.864c0 .74 0 1.109.184 1.16c.185.05.372-.27.747-.907l1.296-2.203c.787-1.338 1.18-2.007.893-2.51c-.288-.504-1.065-.504-2.62-.504c-.236 0-.354 0-.427-.073C12 15.054 12 14.936 12 14.7V14z" clip-rule="evenodd"/>
  </svg>
);


interface WeatherIconProps extends React.SVGProps<SVGSVGElement> {
    weather: 'Dry' | 'LightRain' | 'HeavyRain';
}

const WeatherIcon: React.FC<WeatherIconProps> = ({ weather, ...props }) => {
    switch (weather) {
        case 'Dry':
            return <SunIcon {...props} />;
        case 'LightRain':
            return <LightRainIcon {...props} />;
        case 'HeavyRain':
            return <HeavyRainIcon {...props} />;
        default:
            return null;
    }
};

export default WeatherIcon;
