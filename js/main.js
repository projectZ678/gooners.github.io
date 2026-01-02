// Global configuration
const CONFIG = {
    SITE_URL: 'https://gooners.wtf',
    STORAGE_KEY: 'gooners_user',
    DEFAULT_PFP: 'assets/default-pfp.jpg',
    DEFAULT_BANNER: 'assets/default-banner.jpg'
};

// Initialize page
function initPage() {
    // Add glow effects
    addGlowEffects();
    
    // Handle click to enter if present
    const enterScreen = document.getElementById('enterScreen');
    const mainContent = document.getElementById('mainContent');
    
    if (enterScreen && mainContent) {
        enterScreen.addEventListener('click', () => {
            enterScreen.style.opacity = '0';
            setTimeout(() => {
                enterScreen.style.display = 'none';
                mainContent.style.opacity = '1';
                mainContent.style.transform = 'translateY(0)';
            }, 1200);
        });
    }
}

// Add glow effects to page
function addGlowEffects() {
    const glowContainer = document.createElement('div');
    glowContainer.innerHTML = `
        <div class="glow-effect glow-top-right"></div>
        <div class="glow-effect glow-bottom-left"></div>
    `;
    document.body.appendChild(glowContainer);
}

// User management functions
function getCurrentUser() {
    const userData = localStorage.getItem(CONFIG.STORAGE_KEY);
    return userData ? JSON.parse(userData) : null;
}

function saveUser(user) {
    localStorage.setItem(CONFIG.STORAGE_KEY, JSON.stringify(user));
}

function logout() {
    localStorage.removeItem(CONFIG.STORAGE_KEY);
    window.location.href = 'index.html';
}

// Validation functions
function validateUsername(username) {
    if (username.length < 3) {
        return { valid: false, error: 'Username must be at least 3 characters' };
    }
    if (!/^[a-zA-Z0-9_]+$/.test(username)) {
        return { valid: false, error: 'Only letters, numbers, and underscores allowed' };
    }
    return { valid: true };
}

function validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        return { valid: false, error: 'Please enter a valid email' };
    }
    return { valid: true };
}

function validatePassword(password) {
    if (password.length < 6) {
        return { valid: false, error: 'Password must be at least 6 characters' };
    }
    return { valid: true };
}

// URL parameter utilities
function getUrlParam(param) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(param);
}

function setUrlParam(param, value) {
    const url = new URL(window.location);
    url.searchParams.set(param, value);
    window.history.pushState({}, '', url);
}

// Notification system
function showNotification(message, type = 'success') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            ${message}
            <button class="notification-close">&times;</button>
        </div>
    `;
    
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${type === 'success' ? 'rgba(76, 217, 100, 0.9)' : 'rgba(255, 107, 107, 0.9)'};
        color: white;
        padding: 16px 24px;
        border-radius: 12px;
        backdrop-filter: blur(20px);
        border: 1px solid rgba(255, 255, 255, 0.2);
        z-index: 1000;
        animation: slideIn 0.3s ease;
    `;
    
    document.body.appendChild(notification);
    
    // Close button
    notification.querySelector('.notification-close').addEventListener('click', () => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    });
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        if (notification.parentNode) {
            notification.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => notification.remove(), 300);
        }
    }, 5000);
}

// Add notification styles
const notificationStyles = document.createElement('style');
notificationStyles.textContent = `
    @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    @keyframes slideOut {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
    }
    .notification-close {
        background: none;
        border: none;
        color: white;
        font-size: 20px;
        cursor: pointer;
        margin-left: 16px;
        opacity: 0.7;
        transition: opacity 0.3s;
    }
    .notification-close:hover {
        opacity: 1;
    }
`;
document.head.appendChild(notificationStyles);

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', initPage);