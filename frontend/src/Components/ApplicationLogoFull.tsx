import { type SVGAttributes } from 'react';

export default function ApplicationLogoFull(props: SVGAttributes<SVGElement>) {
    return (
        <svg
            viewBox="0 0 240 64"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            {...props}
        >
             {/* Symbol Group - Optimized for Inline */}
            <g>
                <path
                    fill="currentColor" // Inherits text color (White in Sidebar, Slate in Login)
                    opacity="0.9"
                    d="
                        M 12,12 
                        L 40,12 
                        L 46,22 
                        L 24,22 
                        L 24,30 
                        L 40,30 
                        L 44,40 
                        L 24,40 
                        L 24,52 
                        L 12,52 
                        Z
                    "
                />
                <circle cx="42" cy="48" r="6" fill="#6366f1" />
            </g>
            
            {/* Wordmark */}
            <text
                x="64"
                y="46"
                fontFamily="'Inter', system-ui, -apple-system, sans-serif"
                fontWeight="700"
                fontSize="38"
                letterSpacing="-0.5"
                fill="currentColor"
            >
                Factum
            </text>
        </svg>
    );
}
