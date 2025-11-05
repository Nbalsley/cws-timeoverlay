import React, { useState, useEffect } from 'react';

// FIX: Add a type declaration for the `chrome` global object.
declare const chrome: any;

// --- Component for the Content Script Overlay ---
export const TimestampOverlay: React.FC = () => {
    const [currentDateTime, setCurrentDateTime] = useState(new Date());

    useEffect(() => {
        const timerId = setInterval(() => {
            setCurrentDateTime(new Date());
        }, 1000);
        return () => clearInterval(timerId);
    }, []);

    const timeOptions: Intl.DateTimeFormatOptions = {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true,
    };

    const dateOptions: Intl.DateTimeFormatOptions = {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
    };

    const formattedTime = currentDateTime.toLocaleTimeString('en-US', timeOptions);
    const formattedDate = currentDateTime.toLocaleDateString('en-US', dateOptions);

    return (
         <div 
            style={{
                position: 'fixed',
                top: '1rem',
                right: '1rem',
                zIndex: 2147483647, // Use a very high z-index to ensure it's on top
                pointerEvents: 'none', // Allow clicks to pass through to the page below
            }}
            className="bg-gray-900 bg-opacity-80 text-white p-2 rounded-lg shadow-2xl font-sans text-center"
        >
            <div className="text-xl text-cyan-300">{formattedTime}</div>
            <div className="text-xl text-gray-300">{formattedDate}</div>
        </div>
    );
};

// --- Component for the Popup, becomes the default export 'App' ---
const STORAGE_KEY = 'timestampClockVisible';

const App: React.FC = () => {
    const [isVisible, setIsVisible] = useState(true);
    const [isLoading, setIsLoading] = useState(true);

    // On mount, get the initial state from chrome.storage
    useEffect(() => {
        if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
            chrome.storage.local.get([STORAGE_KEY], (result) => {
                // Default to true if the value isn't set yet
                setIsVisible(result[STORAGE_KEY] ?? true);
                setIsLoading(false);
            });
        } else {
             // Fallback for environments where chrome APIs are not available
             console.warn("Chrome storage API not found.");
             setIsLoading(false);
        }
    }, []);

    const handleToggle = (newVisibleState: boolean) => {
        setIsVisible(newVisibleState);
        if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
            chrome.storage.local.set({ [STORAGE_KEY]: newVisibleState });
        }
    };

    // Render a blank popup while loading the state from storage to prevent flickering
    if (isLoading) {
        return <div className="w-48 h-[76px] bg-gray-800" />;
    }
    
    return (
        <main className="w-48 h-auto bg-gray-800 text-white font-sans p-4 flex flex-col items-center">
            <h1 className="text-base font-bold mb-3 text-center">Timestamp Overlay</h1>
            <div className="flex items-center justify-center gap-2">
                 <span className={`text-sm font-medium ${!isVisible ? 'text-white' : 'text-gray-500'}`}>
                    Off
                </span>
                <label htmlFor="toggle" className="relative inline-flex items-center cursor-pointer">
                    <input
                        type="checkbox"
                        id="toggle"
                        className="sr-only peer"
                        checked={isVisible}
                        onChange={() => handleToggle(!isVisible)}
                        aria-label="Toggle clock visibility"
                    />
                    <div className="w-11 h-6 bg-gray-600 rounded-full peer peer-focus:ring-2 peer-focus:ring-cyan-800 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-cyan-600"></div>
                </label>
                 <span className={`text-sm font-medium ${isVisible ? 'text-white' : 'text-gray-500'}`}>
                    On
                </span>
            </div>
        </main>
    );
};

export default App;