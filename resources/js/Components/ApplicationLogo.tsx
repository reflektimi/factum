import { SVGAttributes } from 'react';

export default function ApplicationLogo(props: SVGAttributes<SVGElement>) {
    return (
        <svg
            viewBox="0 0 100 100"
            xmlns="http://www.w3.org/2000/svg"
            {...props}
        >
            <defs>
                <linearGradient id="newLogoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#4338ca" />
                    <stop offset="100%" stopColor="#6366f1" />
                </linearGradient>
            </defs>
            <circle cx="50" cy="50" r="45" fill="url(#newLogoGradient)" />
            <path 
                d="M30 60 L45 45 L55 55 L70 30" 
                stroke="white" 
                strokeWidth="8" 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                fill="none"
            />
            <path 
                d="M70 30 L70 45 M70 30 L55 30" 
                stroke="white" 
                strokeWidth="8" 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                fill="none" 
            />
        </svg>
    );
}
