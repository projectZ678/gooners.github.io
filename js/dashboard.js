// Dashboard specific functions

let currentUser = getCurrentUser();

// Modal functions
function openModal(modalId) {
    document.getElementById(modalId).style.display = 'flex';
}

function closeModal(modalId) {
    document.getElementById(modalId).style.display = 'none';
}

// Close modal when clicking outside
window.onclick = function(event) {
    if (event.target.classList.contains('modal')) {
        event.target.style.display = 'none';
    }
};

// Update profile picture
function updatePfp() {
    const url = document.getElementById('pfpUrl').value.trim();
    if (url) {
        // Update user data
        currentUser.customizations.pfp = url;
        saveUser(currentUser);
        
        // Update UI
        document.querySelectorAll('.user-avatar img, #dashboardPfp img, #pfpPreview').forEach(img => {
            img.src = url;
        });
        
        showNotification('Profile picture updated!');
        closeModal('pfpModal');
    } else {
        alert('Please enter a valid image URL');
    }
}

// Update banner
function updateBanner() {
    const url = document.getElementById('bannerUrl').value.trim();
    if (url) {
        // Update user data
        currentUser.customizations.banner = url;
        saveUser(currentUser);
        
        // Update UI
        document.getElementById('dashboardBanner').style.backgroundImage = `url(${url})`;
        document.getElementById('bannerPreview').style.backgroundImage = `url(${url})`;
        
        showNotification('Banner updated!');
        closeModal('bannerModal');
    } else {
        alert('Please enter a valid banner URL');
    }
}

// Update music
function updateMusic() {
    const url = document.getElementById('musicUrl').value.trim();
    if (url) {
        currentUser.customizations.music = url;
        saveUser(currentUser);
        showNotification('Music updated!');
        closeModal('musicModal');
    } else {
        alert('Please enter a valid music URL');
    }
}

// Test music
function testMusic() {
    const url = document.getElementById('musicUrl').value.trim();
    if (url) {
        const audio = document.getElementById('audioPlayer');
        audio.src = url;
        audio.volume = 0.3;
        audio.play();
        showNotification('Playing music preview...');
    }
}

// Copy profile link
function copyProfileLink() {
    const link = `${CONFIG.SITE_URL}/${currentUser.profileLink}`;
    navigator.clipboard.writeText(link)
        .then(() => showNotification('Profile link copied to clipboard!'))
        .catch(err => console.error('Failed to copy:', err));
}

// Share profile
function shareProfile() {
    const link = `${CONFIG.SITE_URL}/${currentUser.profileLink}`;
    if (navigator.share) {
        navigator.share({
            title: `Check out ${currentUser.username}'s profile!`,
            text: `Check out my profile on gooners.wtf`,
            url: link
        });
    } else {
        copyProfileLink();
    }
}

// Test profile link
function testProfileLink() {
    window.open(`profile.html?user=${currentUser.profileLink}`, '_blank');
}

// Preview profile
function previewProfile() {
    testProfileLink();
}

// Update bio (example function)
function updateBio() {
    const bio = prompt('Enter your bio:', currentUser.customizations.bio || '');
    if (bio !== null) {
        currentUser.customizations.bio = bio;
        saveUser(currentUser);
        showNotification('Bio updated!');
    }
}

// Keyboard shortcuts
document.addEventListener('keydown', function(e) {
    // Escape closes modals
    if (e.key === 'Escape') {
        document.querySelectorAll('.modal').forEach(modal => {
            modal.style.display = 'none';
        });
    }
    
    // Ctrl/Cmd + S saves profile
    if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        showNotification('Profile saved!');
    }
});