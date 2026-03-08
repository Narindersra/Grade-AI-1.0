/* ===== GradeAI Auth JavaScript — Theme Matched ===== */

document.addEventListener('DOMContentLoaded', () => {
    initPasswordToggles();
    initPasswordStrength();
    initFormValidation();
    animateIllustrationBars();
    renderGoogleIcon();
});

/* --- Password Show/Hide Toggle --- */
function initPasswordToggles() {
    document.querySelectorAll('.password-toggle').forEach(btn => {
        btn.addEventListener('click', () => {
            const input = btn.closest('.form-input-wrapper').querySelector('.form-input');
            const icon = btn.querySelector('i');
            if (input.type === 'password') {
                input.type = 'text';
                icon.classList.replace('fa-eye', 'fa-eye-slash');
            } else {
                input.type = 'password';
                icon.classList.replace('fa-eye-slash', 'fa-eye');
            }
        });
    });
}

/* --- Password Strength Indicator --- */
function initPasswordStrength() {
    const passwordInput = document.getElementById('signup-password');
    if (!passwordInput) return;

    passwordInput.addEventListener('input', () => {
        const val = passwordInput.value;
        const strength = calculateStrength(val);
        updateStrengthUI(strength);
    });
}

function calculateStrength(password) {
    let score = 0;
    if (password.length === 0) return { score: 0, label: '' };
    if (password.length >= 6) score++;
    if (password.length >= 10) score++;
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score++;
    if (/\d/.test(password)) score++;
    if (/[^a-zA-Z0-9]/.test(password)) score++;

    if (score <= 1) return { score: 1, label: 'Weak' };
    if (score <= 2) return { score: 2, label: 'Fair' };
    if (score <= 3) return { score: 3, label: 'Good' };
    return { score: 4, label: 'Strong' };
}

function updateStrengthUI(strength) {
    const bars = document.querySelectorAll('.password-strength-bar');
    const label = document.querySelector('.password-strength-label');
    if (!bars.length || !label) return;

    const classes = ['weak', 'fair', 'good', 'strong'];
    const classMap = { 1: 'weak', 2: 'fair', 3: 'good', 4: 'strong' };

    bars.forEach((bar, idx) => {
        bar.classList.remove('active', ...classes);
        if (idx < strength.score) {
            bar.classList.add('active', classMap[strength.score]);
        }
    });

    label.textContent = strength.label;
    label.className = 'password-strength-label';
    if (strength.score > 0) {
        label.classList.add(classMap[strength.score]);
    }
}

/* --- Form Validation --- */
function initFormValidation() {
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            if (validateLoginForm()) {
                simulateLogin();
            }
        });
    }

    const signupForm = document.getElementById('signupForm');
    if (signupForm) {
        signupForm.addEventListener('submit', (e) => {
            e.preventDefault();
            if (validateSignupForm()) {
                simulateSignup();
            }
        });
    }

    // Real-time validation
    document.querySelectorAll('.form-input').forEach(input => {
        input.addEventListener('blur', () => validateField(input));
        input.addEventListener('input', () => {
            const error = input.closest('.form-group').querySelector('.form-error');
            if (error) error.classList.remove('visible');
            input.classList.remove('error');
        });
    });
}

function validateField(input) {
    const name = input.name;
    const val = input.value.trim();
    let isValid = true;
    let message = '';

    switch (name) {
        case 'fullname':
            if (!val) { isValid = false; message = 'Full name is required'; }
            else if (val.length < 2) { isValid = false; message = 'Name must be at least 2 characters'; }
            break;
        case 'email':
            if (!val) { isValid = false; message = 'Email address is required'; }
            else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val)) { isValid = false; message = 'Please enter a valid email address'; }
            break;
        case 'password':
            if (!val) { isValid = false; message = 'Password is required'; }
            else if (val.length < 6) { isValid = false; message = 'Password must be at least 6 characters'; }
            break;
        case 'confirm-password':
            const pw = document.getElementById('signup-password');
            if (!val) { isValid = false; message = 'Please confirm your password'; }
            else if (pw && val !== pw.value) { isValid = false; message = 'Passwords do not match'; }
            break;
    }

    showFieldState(input, isValid, message);
    return isValid;
}

function showFieldState(input, isValid, message) {
    const group = input.closest('.form-group');
    const error = group.querySelector('.form-error');

    input.classList.remove('error', 'success');

    if (!isValid) {
        input.classList.add('error');
        if (error) {
            error.innerHTML = `<i class="fas fa-exclamation-circle"></i> ${message}`;
            error.classList.add('visible');
        }
    } else if (input.value.trim()) {
        input.classList.add('success');
        if (error) error.classList.remove('visible');
    }
}

function validateLoginForm() {
    const email = document.querySelector('#loginForm [name="email"]');
    const password = document.querySelector('#loginForm [name="password"]');
    const v1 = validateField(email);
    const v2 = validateField(password);
    return v1 && v2;
}

function validateSignupForm() {
    const fullname = document.querySelector('#signupForm [name="fullname"]');
    const email = document.querySelector('#signupForm [name="email"]');
    const password = document.querySelector('#signupForm [name="password"]');
    const confirm = document.querySelector('#signupForm [name="confirm-password"]');

    const v1 = validateField(fullname);
    const v2 = validateField(email);
    const v3 = validateField(password);
    const v4 = validateField(confirm);

    // Check terms checkbox
    const terms = document.querySelector('#signupForm [name="terms"]');
    if (terms && !terms.checked) {
        showNotification('Terms Required', 'Please accept the Terms of Service and Privacy Policy.', 'error');
        return false;
    }

    return v1 && v2 && v3 && v4;
}

/* --- Simulate Login/Signup --- */
function simulateLogin() {
    const btn = document.querySelector('#loginForm .auth-submit-btn');
    btn.classList.add('loading');
    btn.disabled = true;

    setTimeout(() => {
        btn.classList.remove('loading');
        btn.disabled = false;
        showNotification('Welcome back!', 'You have successfully signed in.', 'success');
        setTimeout(() => {
            window.location.href = '../index.html';
        }, 1500);
    }, 2000);
}

function simulateSignup() {
    const btn = document.querySelector('#signupForm .auth-submit-btn');
    btn.classList.add('loading');
    btn.disabled = true;

    setTimeout(() => {
        btn.classList.remove('loading');
        btn.disabled = false;
        showNotification('Account Created!', 'Welcome to GradeAI. Redirecting to sign in...', 'success');
        setTimeout(() => {
            window.location.href = 'login.html';
        }, 1500);
    }, 2000);
}

/* --- Notification System --- */
function showNotification(title, message, type = 'success') {
    const existing = document.querySelector('.auth-notification');
    if (existing) existing.remove();

    const notification = document.createElement('div');
    notification.className = `auth-notification ${type === 'error' ? 'error' : ''}`;
    notification.innerHTML = `
        <div class="auth-notification-icon ${type}">
            <i class="fas ${type === 'success' ? 'fa-check-circle' : 'fa-exclamation-triangle'}"></i>
        </div>
        <div class="auth-notification-text">
            <h5>${title}</h5>
            <p>${message}</p>
        </div>
    `;
    document.body.appendChild(notification);

    requestAnimationFrame(() => {
        notification.classList.add('show');
    });

    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => notification.remove(), 500);
    }, 4000);
}

/* --- Animate Illustration Bars --- */
function animateIllustrationBars() {
    const bars = document.querySelectorAll('.auth-illus-bar-fill');
    if (!bars.length) return;
    setTimeout(() => {
        bars.forEach(bar => {
            bar.style.width = bar.dataset.width || '0%';
        });
    }, 600);
}

/* --- Google SVG Icon --- */
function renderGoogleIcon() {
    document.querySelectorAll('.google-icon').forEach(c => {
        c.innerHTML = `<svg width="20" height="20" viewBox="0 0 48 48"><path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/><path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/><path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/><path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/></svg>`;
    });
}
