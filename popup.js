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
 * Saves the current state of the UI controls to chrome storage.
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

// --- Event Listeners ---

// Load settings when the popup opens and initialize the UI
document.addEventListener('DOMContentLoaded', () => {
    chrome.storage.sync.get(SETTINGS_KEY, (data) => {
        const currentSettings = { ...DEFAULT_SETTINGS, ...data[SETTINGS_KEY] };
        updateUI(currentSettings);
    });
});

// Add listeners to all controls to save settings on change
toggle.addEventListener('change', saveSettings);
positionSelect.addEventListener('change', saveSettings);
fontSizeSlider.addEventListener('input', () => {
    fontSizeValue.textContent = `${fontSizeSlider.value}px`;
    saveSettings();
});
timeColorPicker.addEventListener('input', saveSettings);
dateColorPicker.addEventListener('input', saveSettings);

// Also update labels when toggle is changed
toggle.addEventListener('change', () => {
    updateUI({ isVisible: toggle.checked });
});
