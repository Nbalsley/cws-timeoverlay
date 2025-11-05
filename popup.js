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
    timeColor: '#67e8f9', // Default cyan
    dateColor: '#d1d5db'  // Default gray
};

// --- Functions ---

/**
 * Updates the popup UI to reflect the current settings.
 * @param {object} settings - The settings object.
 */
function updateUI(settings) {
    // Update toggle and labels
    toggle.checked = settings.isVisible;
    if (settings.isVisible) {
        onLabel.classList.add('active');
        offLabel.classList.remove('active');
    } else {
        offLabel.classList.add('active');
        onLabel.classList.remove('active');
    }

    // Update controls
    positionSelect.value = settings.position;
    fontSizeSlider.value = settings.fontSize;
    fontSizeValue.textContent = `${settings.fontSize}px`;
    timeColorPicker.value = settings.timeColor;
    dateColorPicker.value = settings.dateColor;
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

/**
 * Handles any change on a control, updates dependent UI, and saves all settings.
 */
function handleSettingsChange() {
    // Update dependent UI elements that don't update automatically
    fontSizeValue.textContent = `${fontSizeSlider.value}px`;
    if (toggle.checked) {
        onLabel.classList.add('active');
        offLabel.classList.remove('active');
    } else {
        offLabel.classList.add('active');
        onLabel.classList.remove('active');
    }
    
    // Save the new state of all controls
    saveSettings();
}

// --- Event Listeners ---

// Load settings when the popup opens and initialize the UI
document.addEventListener('DOMContentLoaded', () => {
    chrome.storage.sync.get(SETTINGS_KEY, (data) => {
        const currentSettings = { ...DEFAULT_SETTINGS, ...data[SETTINGS_KEY] };
        updateUI(currentSettings);
    });
});

// Add a single, robust listener to all controls
toggle.addEventListener('change', handleSettingsChange);
positionSelect.addEventListener('change', handleSettingsChange);
fontSizeSlider.addEventListener('input', handleSettingsChange);
timeColorPicker.addEventListener('input', handleSettingsChange);
dateColorPicker.addEventListener('input', handleSettingsChange);