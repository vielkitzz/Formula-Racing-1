import React from 'react';

// FIX: Add title prop to the component's interface to allow for tooltips.
interface ExclamationTriangleIconProps extends React.SVGProps<SVGSVGElement> {
  title?: string;
}

const ExclamationTriangleIcon: React.FC<ExclamationTriangleIconProps> = ({ title, ...props }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" {...props}>
    {/* FIX: Render the title tag if the title prop is provided. */}
    {title && <title>{title}</title>}
    <path fillRule="evenodd" d="M9.401 3.003c1.155-2 4.043-2 5.197 0l7.5 13c1.155 2-.289 4.5-2.598 4.5H4.499c-2.31 0-3.753-2.5-2.598-4.5l7.5-13zM12 17a1 1 0 11-2 0 1 1 0 012 0zm-1-7a1 1 0 00-1 1v3a1 1 0 102 0v-3a1 1 0 00-1-1z" clipRule="evenodd" />
  </svg>
);

export default ExclamationTriangleIcon;