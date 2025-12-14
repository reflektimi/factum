import { Transition } from '@headlessui/react';
import { InertiaLinkProps, Link } from '@inertiajs/react';
import {
    createContext,
    Dispatch,
    PropsWithChildren,
    SetStateAction,
    useContext,
    useState,
    useRef,
    useEffect,
    MutableRefObject,
} from 'react';
import { createPortal } from 'react-dom';

const DropDownContext = createContext<{
    open: boolean;
    setOpen: Dispatch<SetStateAction<boolean>>;
    toggleOpen: () => void;
    triggerRef: MutableRefObject<HTMLDivElement | null>;
}>({
    open: false,
    setOpen: () => {},
    toggleOpen: () => {},
    triggerRef: { current: null },
});

const Dropdown = ({ children }: PropsWithChildren) => {
    const [open, setOpen] = useState(false);
    const triggerRef = useRef<HTMLDivElement | null>(null);

    const toggleOpen = () => {
        setOpen((previousState) => !previousState);
    };

    return (
        <DropDownContext.Provider value={{ open, setOpen, toggleOpen, triggerRef }}>
            <div className="relative">{children}</div>
        </DropDownContext.Provider>
    );
};

const Trigger = ({ children }: PropsWithChildren) => {
    const { open, setOpen, toggleOpen, triggerRef } = useContext(DropDownContext);

    return (
        <>
            <div ref={triggerRef} onClick={toggleOpen}>{children}</div>

            {open && (
                <div
                    className="fixed inset-0 z-40"
                    onClick={() => setOpen(false)}
                ></div>
            )}
        </>
    );
};

const Content = ({
    align = 'right',
    width = '48',
    contentClasses = 'py-1 bg-white',
    children,
}: PropsWithChildren<{
    align?: 'left' | 'right';
    width?: '48' | '80';
    contentClasses?: string;
}>) => {
    const { open, setOpen, triggerRef } = useContext(DropDownContext);
    const [coords, setCoords] = useState({ top: 0, left: 0 });

    useEffect(() => {
        if (open && triggerRef.current) {
            const rect = triggerRef.current.getBoundingClientRect();
            let left = rect.left;
            let top = rect.bottom + window.scrollY; // Use absolute document coordinates? No, fixed uses viewport.

            // If using fixed position:
            top = rect.bottom;
            
            // Width adjustments
            const w = width === '48' ? 192 : width === '80' ? 320 : 192;

            if (align === 'right') {
                left = rect.right - w;
            }

            setCoords({ top, left });
        }
    }, [open, align, width]);

    let widthClasses = '';
    if (width === '48') {
        widthClasses = 'w-48';
    } else if (width === '80') {
        widthClasses = 'w-80';
    }

    if (!open) return null;

    return createPortal(
        <div
            className="fixed inset-0 z-50 overflow-hidden" // Wrapper to prevent body scroll interactions if needed, but we rely on Trigger's overlay
            style={{ pointerEvents: 'none' }} // Let clicks pass through to Trigger's overlay
        >
             {/* Re-implement overlay here? No, Trigger has it. */}
             
            <Transition
                show={open}
                appear={true}
                enter="transition ease-out duration-200"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="transition ease-in duration-75"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
            >
                <div
                    className={`fixed z-50 mt-2 rounded-md shadow-lg ${widthClasses}`}
                    style={{ 
                        top: coords.top, 
                        left: coords.left,
                        pointerEvents: 'auto' 
                    }}
                    onClick={() => setOpen(false)}
                >
                    <div
                        className={
                            `rounded-md ring-1 ring-black ring-opacity-5 ` +
                            contentClasses
                        }
                    >
                        {children}
                    </div>
                </div>
            </Transition>
        </div>,
        document.body
    );
};

const DropdownLink = ({
    className = '',
    children,
    ...props
}: InertiaLinkProps) => {
    return (
        <Link
            {...props}
            className={
                'block w-full px-4 py-2 text-start text-sm leading-5 text-gray-700 transition duration-150 ease-in-out hover:bg-gray-100 focus:bg-gray-100 focus:outline-none ' +
                className
            }
        >
            {children}
        </Link>
    );
};

Dropdown.Trigger = Trigger;
Dropdown.Content = Content;
Dropdown.Link = DropdownLink;

export default Dropdown;
