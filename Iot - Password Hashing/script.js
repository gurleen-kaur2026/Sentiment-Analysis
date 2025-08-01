// SHA-256 hashing function using Web Crypto API
async function hashSHA256(text) {
    const encoder = new TextEncoder();
    const data = encoder.encode(text);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    return hashHex;
}

// DOM elements
const tabBtns = document.querySelectorAll('.tab-btn');
const tabPanes = document.querySelectorAll('.tab-pane');
const messageInput = document.getElementById('messageInput');
const hashBtn = document.getElementById('hashBtn');
const hashResult = document.getElementById('hashResult');
const hashOutput = document.getElementById('hashOutput');
const copyHashBtn = document.getElementById('copyHash');
const passwordInput = document.getElementById('passwordInput');
const togglePasswordBtn = document.getElementById('togglePassword');
const storePasswordBtn = document.getElementById('storePasswordBtn');
const storedHashSection = document.getElementById('storedHashSection');
const storedHash = document.getElementById('storedHash');
const copyStoredHashBtn = document.getElementById('copyStoredHash');
const verifyPasswordInput = document.getElementById('verifyPasswordInput');
const toggleVerifyPasswordBtn = document.getElementById('toggleVerifyPassword');
const verifyPasswordBtn = document.getElementById('verifyPasswordBtn');
const verificationResult = document.getElementById('verificationResult');
const verificationMessage = document.getElementById('verificationMessage');

// Global variables
let currentStoredHash = '';

// Tab switching functionality
tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        const targetTab = btn.getAttribute('data-tab');
        
        // Remove active class from all tabs and panes
        tabBtns.forEach(b => b.classList.remove('active'));
        tabPanes.forEach(p => p.classList.remove('active'));
        
        // Add active class to clicked tab and corresponding pane
        btn.classList.add('active');
        document.getElementById(targetTab).classList.add('active');
    });
});

// Password visibility toggle
function togglePasswordVisibility(inputElement, toggleBtn) {
    const type = inputElement.type === 'password' ? 'text' : 'password';
    inputElement.type = type;
    
    const icon = toggleBtn.querySelector('i');
    icon.className = type === 'password' ? 'fas fa-eye' : 'fas fa-eye-slash';
}

togglePasswordBtn.addEventListener('click', () => {
    togglePasswordVisibility(passwordInput, togglePasswordBtn);
});

toggleVerifyPasswordBtn.addEventListener('click', () => {
    togglePasswordVisibility(verifyPasswordInput, toggleVerifyPasswordBtn);
});

// Copy to clipboard functionality
async function copyToClipboard(text, button) {
    try {
        await navigator.clipboard.writeText(text);
        
        // Visual feedback
        const originalText = button.innerHTML;
        button.innerHTML = '<i class="fas fa-check"></i>';
        button.classList.add('copied');
        
        setTimeout(() => {
            button.innerHTML = originalText;
            button.classList.remove('copied');
        }, 2000);
    } catch (err) {
        console.error('Failed to copy: ', err);
        // Fallback for older browsers
        const textArea = document.createElement('textarea');
        textArea.value = text;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        
        // Visual feedback
        const originalText = button.innerHTML;
        button.innerHTML = '<i class="fas fa-check"></i>';
        button.classList.add('copied');
        
        setTimeout(() => {
            button.innerHTML = originalText;
            button.classList.remove('copied');
        }, 2000);
    }
}

// Hash message functionality
hashBtn.addEventListener('click', async () => {
    const message = messageInput.value.trim();
    
    if (!message) {
        alert('Please enter a message to hash.');
        return;
    }
    
    try {
        hashBtn.disabled = true;
        hashBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Generating...';
        
        const hash = await hashSHA256(message);
        hashOutput.textContent = hash;
        hashResult.classList.remove('hidden');
        
        // Scroll to result
        hashResult.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    } catch (error) {
        console.error('Error generating hash:', error);
        alert('Error generating hash. Please try again.');
    } finally {
        hashBtn.disabled = false;
        hashBtn.innerHTML = '<i class="fas fa-magic"></i> Generate Hash';
    }
});

// Copy hash functionality
copyHashBtn.addEventListener('click', () => {
    copyToClipboard(hashOutput.textContent, copyHashBtn);
});

// Store password functionality
storePasswordBtn.addEventListener('click', async () => {
    const password = passwordInput.value.trim();
    
    if (!password) {
        alert('Please enter a password.');
        return;
    }
    
    try {
        storePasswordBtn.disabled = true;
        storePasswordBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Storing...';
        
        const hash = await hashSHA256(password);
        currentStoredHash = hash;
        storedHash.textContent = hash;
        storedHashSection.classList.remove('hidden');
        
        // Clear password input
        passwordInput.value = '';
        
        // Scroll to stored hash
        storedHashSection.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    } catch (error) {
        console.error('Error storing password:', error);
        alert('Error storing password. Please try again.');
    } finally {
        storePasswordBtn.disabled = false;
        storePasswordBtn.innerHTML = '<i class="fas fa-save"></i> Store Password Hash';
    }
});

// Copy stored hash functionality
copyStoredHashBtn.addEventListener('click', () => {
    copyToClipboard(storedHash.textContent, copyStoredHashBtn);
});

// Verify password functionality
verifyPasswordBtn.addEventListener('click', async () => {
    const verifyPassword = verifyPasswordInput.value.trim();
    
    if (!verifyPassword) {
        alert('Please enter a password to verify.');
        return;
    }
    
    if (!currentStoredHash) {
        alert('Please store a password first.');
        return;
    }
    
    try {
        verifyPasswordBtn.disabled = true;
        verifyPasswordBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Verifying...';
        
        const verifyHash = await hashSHA256(verifyPassword);
        const isMatch = verifyHash === currentStoredHash;
        
        verificationMessage.textContent = isMatch ? 
            '✅ Password matched successfully!' : 
            '❌ Incorrect password.';
        verificationMessage.className = isMatch ? 'success' : 'error';
        verificationResult.classList.remove('hidden');
        
        // Clear verify password input
        verifyPasswordInput.value = '';
        
        // Scroll to verification result
        verificationResult.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    } catch (error) {
        console.error('Error verifying password:', error);
        alert('Error verifying password. Please try again.');
    } finally {
        verifyPasswordBtn.disabled = false;
        verifyPasswordBtn.innerHTML = '<i class="fas fa-check"></i> Verify Password';
    }
});

// Enter key functionality
messageInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        hashBtn.click();
    }
});

passwordInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        e.preventDefault();
        storePasswordBtn.click();
    }
});

verifyPasswordInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        e.preventDefault();
        verifyPasswordBtn.click();
    }
});

// Auto-resize textarea
messageInput.addEventListener('input', function() {
    this.style.height = 'auto';
    this.style.height = (this.scrollHeight) + 'px';
});

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    console.log('Secure Hash Generator loaded successfully!');
    
    // Add some helpful placeholder text
    messageInput.placeholder = 'Type your message here...\n\nExample: Hello, World!';
}); 