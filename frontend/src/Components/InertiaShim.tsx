import type { FC, ReactNode } from 'react';

// This is a minimal shim to prevent compilation errors in components 
// that still import from Inertia but don't strictly need it for UI rendering.

export const Head: FC<{ title?: string; children?: ReactNode }> = ({ title, children }) => {
    if (title) {
        document.title = title;
    }
    return <>{children}</>;
};

export const router = {
    visit: (url: string) => {
        console.warn(`router.visit(${url}) called but Inertia is disabled. Use useNavigate instead.`);
        window.location.href = url;
    },
    post: (url: string) => {
        console.warn(`router.post(${url}) called but Inertia is disabled. Use api utility instead.`);
    },
    patch: (url: string) => {
        console.warn(`router.patch(${url}) called but Inertia is disabled.`);
    },
    delete: (url: string) => {
        console.warn(`router.delete(${url}) called but Inertia is disabled.`);
    },
    reload: () => {
        console.warn('router.reload() called but Inertia is disabled.');
        window.location.reload();
    }
};

export const usePage = () => {
    console.warn('usePage() called but Inertia is disabled. Use AuthContext or other React state.');
    return {
        props: {
            auth: {
                user: null
            },
            flash: {},
            errors: {}
        }
    };
};
