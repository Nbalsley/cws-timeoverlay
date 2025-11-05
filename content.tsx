import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import { TimestampOverlay } from './App';

// FIX: Add a type declaration for the `chrome` global object.
declare const chrome: any;

const STORAGE_KEY = 'timestampClockVisible';

// Create a container div for our React app to live in on the page
const appContainer = document.createElement('div');
appContainer.id = 'timestamp-clock-react-root';
document.body.appendChild(appContainer);

// Use the new container as the root for our React app
const root = ReactDOM.createRoot(appContainer);

const ContentScriptApp = () => {
    const [isVisible, setIsVisible] = useState(true);

    useEffect(() => {
        // Get the initial visibility state from storage when the script loads
        chrome.storage.local.get([STORAGE_KEY], (result) => {
            // Default to showing the overlay if no value is set
            setIsVisible(result[STORAGE_KEY] ?? true);
        });

        // Create a listener function to handle changes in storage
        const storageChangeListener = (changes, namespace) => {
            if (namespace === 'local' && changes[STORAGE_KEY]) {
                setIsVisible(changes[STORAGE_KEY].newValue);
            }
        };

        // Add the listener for storage changes
        chrome.storage.onChanged.addListener(storageChangeListener);

        // Clean up the listener when the component unmounts
        return () => {
            chrome.storage.onChanged.removeListener(storageChangeListener);
        };
    }, []);

    // Only render the TimestampOverlay if it's supposed to be visible
    return isVisible ? <TimestampOverlay /> : null;
};

// Render the main content script component into the container on the page
root.render(
  <React.StrictMode>
    <ContentScriptApp />
  </React.StrictMode>
);