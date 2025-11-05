// --- Configuration ---
const OVERLAY_ID = 'timestamp-clock-overlay';
const SETTINGS_KEY = 'timestampSettings';
const DEFAULT_SETTINGS = {
    isVisible: true,
    position: 'top-right',
    fontSize: 16,
    timeColor: '#add8e6', // Default light blue
    dateColor: '#d3d3d3'  // Default light gray
};

let timerId = null;
let currentSettings = DEFAULT_SETTINGS;

// --- Functions ---

function formatDateTime(date) {
    const timeOptions = {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true,
    };
    const dateOptions = {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
    };
    return {
        formattedTime: date.toLocaleTimeString('en-US', timeOptions),
        formattedDate: date.toLocaleDateString('en-US', dateOptions)
    };
}

function applyStyles(overlay, settings) {
    // Reset position styles
    Object.assign(overlay.style, {
        top: '', bottom: '', left: '', right: ''
    });

    // Apply position
    switch (settings.position) {
        case 'top-left':
            overlay.style.top = '1rem';
            overlay.style.left = '1rem';
            break;
        case 'bottom-right':
            overlay.style.bottom = '1rem';
            overlay.style.right = '1rem';
            break;
        case 'bottom-left':
            overlay.style.bottom = '1rem';
            overlay.style.left = '1rem';
            break;
        case 'top-right':
        default:
            overlay.style.top = '1rem';
            overlay.style.right = '1rem';
            break;
    }
    
    // Apply colors and font size
    const timeEl = overlay.querySelector(`#${OVERLAY_ID}-time`);
    const dateEl = overlay.querySelector(`#${OVERLAY_ID}-date`);
    
    if(timeEl && dateEl) {
        const baseFontSize = settings.fontSize;
        timeEl.style.fontSize = `${baseFontSize * 1.1}px`;
        dateEl.style.fontSize = `${baseFontSize}px`;

        timeEl.style.color = settings.timeColor;
        dateEl.style.color = settings.dateColor;
    }
}

function createOrUpdateOverlay(settings) {
    let overlay = document.getElementById(OVERLAY_ID);
    if (!overlay) {
        overlay = document.createElement('div');
        overlay.id = OVERLAY_ID;
        Object.assign(overlay.style, {
            position: 'fixed',
            zIndex: '2147483647',
            pointerEvents: 'none',
            backgroundColor: 'rgba(17, 24, 39, 0.8)',
            color: 'white',
            padding: '0.5rem 0.75rem',
            borderRadius: '0.5rem',
            boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.2), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
            fontFamily: 'sans-serif',
            textAlign: 'center',
            lineHeight: '1.4',
            transition: 'opacity 0.3s ease-in-out, top 0.3s, right 0.3s, bottom 0.3s, left 0.3s'
        });

        overlay.innerHTML = `
            <div id="${OVERLAY_ID}-time"></div>
            <div id="${OVERLAY_ID}-date"></div>
        `;
        document.body.appendChild(overlay);
    }
    
    applyStyles(overlay, settings);

    function updateContent() {
        const { formattedTime, formattedDate } = formatDateTime(new Date());
        const timeEl = overlay.querySelector(`#${OVERLAY_ID}-time`);
        const dateEl = overlay.querySelector(`#${OVERLAY_ID}-date`);
        if (timeEl) timeEl.textContent = formattedTime;
        if (dateEl) dateEl.textContent = formattedDate;
    }
    
    updateContent();

    if (timerId) clearInterval(timerId);
    timerId = setInterval(updateContent, 1000);

    return overlay;
}

function removeOverlay() {
    const overlay = document.getElementById(OVERLAY_ID);
    if (overlay) {
        overlay.style.opacity = '0';
        setTimeout(() => {
             if (overlay.parentNode) {
                overlay.parentNode.removeChild(overlay);
             }
        }, 300);
    }
    if (timerId) {
        clearInterval(timerId);
        timerId = null;
    }
}

function handleVisibilityAndSettings(settings) {
    currentSettings = settings;
    if (settings.isVisible) {
        createOrUpdateOverlay(settings);
    } else {
        removeOverlay();
    }
}

// --- Initial Load & Listeners ---

// Initial check when content script is injected
chrome.storage.sync.get(SETTINGS_KEY, (data) => {
    const settings = { ...DEFAULT_SETTINGS, ...data[SETTINGS_KEY] };
    handleVisibilityAndSettings(settings);
});

// Listen for changes from the popup
chrome.storage.onChanged.addListener((changes, namespace) => {
    if (namespace === 'sync' && changes[SETTINGS_KEY]) {
        const newSettings = { ...DEFAULT_SETTINGS, ...changes[SETTINGS_KEY].newValue };
        handleVisibilityAndSettings(newSettings);
    }
});