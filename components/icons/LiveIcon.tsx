import React from 'react';

const LiveIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    viewBox="0 0 100 40" 
    fill="currentColor"
    {...props}
  >
    <style>
      {`
        .live-circle {
          animation: pulse 1.5s infinite;
        }
        @keyframes pulse {
          0% { opacity: 1; }
          50% { opacity: 0.3; }
          100% { opacity: 1; }
        }
      `}
    </style>
    <circle className="live-circle" cx="20" cy="20" r="12" fill="#e00601" />
    {/* FIX: Replaced invalid textTransform attribute with React style prop for uppercasing text. */}
    <text x="40" y="28" fontFamily="'Exo 2', sans-serif" fontSize="24" fontWeight="bold" fill="#e00601" style={{ textTransform: 'uppercase' }}>
      Live
    </text>
  </svg>
);

export default LiveIcon;