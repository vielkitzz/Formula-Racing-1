import React from "react";

const UsersIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" {...props}>
        <path d="M4.5 6.375a4.125 4.125 0 118.25 0 4.125 4.125 0 01-8.25 0zM14.25 8.625a4.125 4.125 0 118.25 0 4.125 4.125 0 01-8.25 0z" />
        <path d="M1.5 15.75a4.125 4.125 0 014.125-4.125h.75a4.125 4.125 0 014.125 4.125v.75a.75.75 0 01-.75.75h-7.5a.75.75 0 01-.75-.75v-.75z" />
        <path d="M12.75 15.75a4.125 4.125 0 014.125-4.125h.75a4.125 4.125 0 014.125 4.125v.75a.75.75 0 01-.75.75h-7.5a.75.75 0 01-.75-.75v-.75z" />
    </svg>
);

export default UsersIcon;