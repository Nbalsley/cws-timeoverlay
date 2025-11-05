// --- DOM Elements ---
const toggle = document.getElementById('toggle');
const onLabel = document.getElementById('on-label');
const offLabel = document.getElementById('off-label');
const positionSelect = document.getElementById('position');
const fontSizeSlider = document.getElementById('font-size');
const fontSizeValue = document.getElementById('font-size-value');
const timeColorPicker = document.getElementById('time-color');
const dateColorPicker = document.getElementById('date-color');

// --- Settings Configuration ---
const SETTINGS_KEY = 'timestampSettings';
const DEFAULT_SETTINGS = {
    isVisible: true,
    position: 'top-right',
    fontSize: 16,
    timeColor: '#add8e6', // Default light blue
    dateColor: '#d3d3d3'  // Default light gray
};

// --- Functions ---

/**
 * A utility function that delays invoking a function until after `delay` milliseconds
 * have elapsed since the last time it was invoked.
 * @param {Function} func The function to debounce.
 * @param {number} delay The delay in milliseconds.
 * @returns {Function} The debounced function.
 */
function debounce(func, delay) {
    let timeoutId;
    return function(...args) {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => {
            func.apply(this, args);
        }, delay);
    };
}

/**
 * Updates the popup UI to reflect the current settings.
 * @param {object} settings - The settings object, which may be incomplete.
 */
function updateUI(settings) {
    // Ensure settings are complete by merging with defaults. This prevents errors
    // if settings from storage are missing properties.
    const completeSettings = { ...DEFAULT_SETTINGS, ...settings };

    // Update toggle and labels
    toggle.checked = completeSettings.isVisible;
    if (completeSettings.isVisible) {
        onLabel.classList.add('active');
        offLabel.classList.remove('active');
    } else {
        offLabel.classList.add('active');
        onLabel.classList.remove('active');
    }

    // Update controls with guaranteed valid values
    positionSelect.value = completeSettings.position;
    fontSizeSlider.value = completeSettings.fontSize;
    fontSizeValue.textContent = `${completeSettings.fontSize}px`;
    timeColorPicker.value = completeSettings.timeColor;
    dateColorPicker.value = completeSettings.dateColor;
}

/**
 * Reads all values from the UI controls and saves them to chrome storage.
 */
function saveSettings() {
    const newSettings = {
        isVisible: toggle.checked,
        position: positionSelect.value,
        fontSize: parseInt(fontSizeSlider.value, 10),
        timeColor: timeColorPicker.value,
        dateColor: dateColorPicker.value
    };
    chrome.storage.sync.set({ [SETTINGS_KEY]: newSettings });
}

// Create a debounced version of saveSettings for controls that fire events rapidly.
const debouncedSaveSettings = debounce(saveSettings, 200);

/**
 * Updates the local UI labels that don't update automatically (like the font size text).
 */
function updateAccessoryUI() {
    fontSizeValue.textContent = `${fontSizeSlider.value}px`;
    if (toggle.checked) {
        onLabel.classList.add('active');
        offLabel.classList.remove('active');
    } else {
        offLabel.classList.add('active');
        onLabel.classList.remove('active');
    }
}


// --- Event Listeners ---

// Load settings when the popup opens and initialize the UI
document.addEventListener('DOMContentLoaded', () => {
    chrome.storage.sync.get(SETTINGS_KEY, (data) => {
        // Pass the saved settings (or an empty object if none exist) to updateUI.
        // updateUI will handle merging with defaults, preventing errors.
        updateUI(data[SETTINGS_KEY] || {});
    });
});

// Listeners for single-action controls -> Save immediately
toggle.addEventListener('change', () => {
    updateAccessoryUI();
    saveSettings();
});
positionSelect.addEventListener('change', saveSettings);

// Listeners for continuous-action controls -> Update local UI immediately, save with a debounce
fontSizeSlider.addEventListener('input', () => {
    updateAccessoryUI();
    debouncedSaveSettings();
});
timeColorPicker.addEventListener('input', debouncedSaveSettings);
dateColorPicker.addEventListener('input', debouncedSaveSettings);