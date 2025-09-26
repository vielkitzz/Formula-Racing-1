import React from 'react';

interface StopwatchIconProps extends React.SVGProps<SVGSVGElement> {
  title?: string;
}

const StopwatchIcon: React.FC<StopwatchIconProps> = ({ title, ...props }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" {...props}>
    {title && <title>{title}</title>}
    <path fillRule="evenodd" d="M14.5 8a6.5 6.5 0 1 1-13 0a6.5 6.5 0 0 1 13 0ZM16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0ZM8.75 3.75a.75.75 0 0 0-1.5 0v4.56l.22.22l2.254 2.254a.75.75 0 1 0 1.06-1.06L8.75 7.689V3.75Z" clipRule="evenodd" />
  </svg>
);

export default StopwatchIcon;
