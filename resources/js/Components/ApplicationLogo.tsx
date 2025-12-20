import { SVGAttributes } from 'react';

export default function ApplicationLogo(props: SVGAttributes<SVGElement>) {
    return (
        <svg
            viewBox="0 0 64 64"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            {...props}
        >
            {/* Hexagonal Base Stucture - Represents Security & Foundation */}
            {/* Split "F" Concept: 
                - Left vertical bar (Foundation)
                - Top horizontal bar (Structure)
                - Middle horizontal bar (Execution/Fact) 
            */}
            
            <path
                stroke="currentColor" 
                strokeWidth="0"
                fill="currentColor"
                d="
                    M 18,12 
                    L 46,12 
                    L 52,22 
                    L 30,22 
                    L 30,30 
                    L 46,30 
                    L 50,40 
                    L 30,40 
                    L 30,52 
                    L 18,52 
                    Z
                "
            />
            
            {/* Dynamic "Fact" Point / Checkmark Accent */}
            <circle cx="48" cy="48" r="6" fill="#6366f1" />
        </svg>
    );
}
