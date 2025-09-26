import React from 'react';

const FlagIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" {...props}>
    <path d="M7.667 12H2v8H0V0h12l.333 2H20l-3 6l3 6H8l-.333-2z" />
  </svg>
);

export default FlagIcon;
