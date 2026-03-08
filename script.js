// ===== DOM Elements =====
const header = document.getElementById('header');
const mobileToggle = document.getElementById('mobileToggle');
const mobileNav = document.getElementById('mobileNav');
const evaluateBtn = document.getElementById('evaluateBtn');
const demoError = document.getElementById('demoError');
const outputPlaceholder = document.getElementById('outputPlaceholder');
const outputResult = document.getElementById('outputResult');
const scoreNum = document.getElementById('scoreNum');
const scoreMax = document.getElementById('scoreMax');
const scoreRing = document.getElementById('scoreRing');
const feedbackText = document.getElementById('feedbackText');
const keyPoints = document.getElementById('keyPoints');
const fileInput = document.getElementById('studentAnswer');
const fileLabel = document.getElementById('fileLabel');

// ===== Header Scroll Effect =====
let lastScroll = 0;

window.addEventListener('scroll', () => {
    const currentScroll = window.pageYOffset;
    
    if (currentScroll > 50) {
        header.classList.add('scrolled');
    } else {
        header.classList.remove('scrolled');
    }
    
    lastScroll = currentScroll;
});

// ===== Mobile Menu Toggle =====
mobileToggle.addEventListener('click', () => {
    mobileToggle.classList.toggle('active');
    mobileNav.classList.toggle('active');
    document.body.style.overflow = mobileNav.classList.contains('active') ? 'hidden' : '';
});

// Close mobile menu on link click
document.querySelectorAll('.mobile-nav a').forEach(link => {
    link.addEventListener('click', () => {
        mobileToggle.classList.remove('active');
        mobileNav.classList.remove('active');
        document.body.style.overflow = '';
    });
});

// ===== Smooth Scroll =====
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        e.preventDefault();
        const targetId = this.getAttribute('href');
        if (targetId === '#') return;
        
        const target = document.querySelector(targetId);
        if (target) {
            const headerHeight = 100;
            const targetPosition = target.getBoundingClientRect().top + window.pageYOffset - headerHeight;
            
            window.scrollTo({
                top: targetPosition,
                behavior: 'smooth'
            });
        }
    });
});

// ===== File Upload Handler =====
fileInput.addEventListener('change', function() {
    if (this.files && this.files[0]) {
        const fileName = this.files[0].name;
        const truncatedName = fileName.length > 15 ? fileName.substring(0, 12) + '...' : fileName;
        fileLabel.innerHTML = `<i class="fas fa-check-circle"></i><span>${truncatedName}</span>`;
        fileLabel.classList.add('has-file');
    } else {
        fileLabel.innerHTML = `<i class="fas fa-cloud-upload-alt"></i><span>Upload Image</span>`;
        fileLabel.classList.remove('has-file');
    }
});

// ===== Backend API Configuration =====
const API_BASE_URL = 'http://localhost:5000';

// ===== Helper Function to Convert File to Base64 =====
function fileToBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result);
        reader.onerror = error => reject(error);
    });
}

// ===== Demo Evaluation with Real Backend =====
evaluateBtn.addEventListener('click', async () => {
    const question = document.getElementById('question').value.trim();
    const modelAnswer = document.getElementById('modelAnswer').value.trim();
    const maxMarks = document.getElementById('maxMarks').value;
    const hasFile = fileInput.files && fileInput.files[0];

    // Validation
    if (!question || !modelAnswer || !maxMarks || !hasFile) {
        demoError.classList.add('active');
        setTimeout(() => {
            demoError.classList.remove('active');
        }, 3000);
        return;
    }

    demoError.classList.remove('active');

    // Loading state
    evaluateBtn.innerHTML = '<i class="fas fa-spinner"></i><span>Analyzing with AI...</span>';
    evaluateBtn.classList.add('loading');
    evaluateBtn.disabled = true;

    try {
        // Convert image to base64
        const imageBase64 = await fileToBase64(fileInput.files[0]);

        // Prepare request data
        const requestData = {
            question: question,
            modelAnswer: modelAnswer,
            maxMarks: parseInt(maxMarks),
            image: imageBase64
        };

        // Call backend API
        const response = await fetch(`${API_BASE_URL}/evaluate`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(requestData)
        });

        const result = await response.json();

        if (result.success) {
            const data = result.data;
            const awarded = data.marks_awarded;
            const max = data.max_marks;
            const percentage = data.percentage || (awarded / max) * 100;

            // Update score display
            scoreNum.textContent = awarded;
            scoreMax.textContent = `/${max}`;

            // Animate score ring
            const circumference = 2 * Math.PI * 54;
            const dashArray = (percentage / 100) * circumference;
            scoreRing.style.strokeDasharray = `${dashArray}, ${circumference}`;

            // Update feedback
            feedbackText.textContent = data.feedback;

            // Update key points - combine strengths and improvements
            const keyPointsArray = [];
            if (data.strengths && data.strengths.length > 0) {
                keyPointsArray.push(...data.strengths.map(s => `✓ ${s}`));
            }
            if (data.improvements && data.improvements.length > 0) {
                keyPointsArray.push(...data.improvements.map(i => `→ ${i}`));
            }
            if (keyPointsArray.length === 0) {
                keyPointsArray.push('Evaluation complete');
            }
            keyPoints.innerHTML = keyPointsArray.map(point => `<li>${point}</li>`).join('');

            // Show result
            outputPlaceholder.style.display = 'none';
            outputResult.classList.add('active');

            // Animate score number
            animateScore(0, awarded, 1000);

        } else {
            // Show error
            throw new Error(result.error || 'Evaluation failed');
        }

    } catch (error) {
        console.error('Evaluation error:', error);
        
        // Show error message
        demoError.querySelector('span').textContent = error.message || 'Failed to connect to AI backend. Please try again.';
        demoError.classList.add('active');
        setTimeout(() => {
            demoError.classList.remove('active');
            demoError.querySelector('span').textContent = 'Please fill in all fields to continue';
        }, 5000);
    } finally {
        // Reset button
        evaluateBtn.innerHTML = '<i class="fas fa-magic"></i><span>Grade with AI</span>';
        evaluateBtn.classList.remove('loading');
        evaluateBtn.disabled = false;
    }
});

// Animate score number
function animateScore(start, end, duration) {
    const startTime = performance.now();
    
    function update(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        // Easing function
        const easeOut = 1 - Math.pow(1 - progress, 3);
        const current = Math.floor(start + (end - start) * easeOut);
        
        scoreNum.textContent = current;
        
        if (progress < 1) {
            requestAnimationFrame(update);
        }
    }
    
    requestAnimationFrame(update);
}

// ===== Scroll Reveal Animation =====
const revealElements = document.querySelectorAll('.reveal, .reveal-left, .reveal-right, .reveal-scale');

const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');
        }
    });
}, {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
});

revealElements.forEach(element => {
    revealObserver.observe(element);
});

// ===== Animate Stats on Scroll =====
const statValues = document.querySelectorAll('.stat-value');
let statsAnimated = false;

const statsObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting && !statsAnimated) {
            statsAnimated = true;
            animateStats();
        }
    });
}, { threshold: 0.5 });

const heroStats = document.querySelector('.hero-stats');
if (heroStats) {
    statsObserver.observe(heroStats);
}

function animateStats() {
    statValues.forEach(stat => {
        const text = stat.textContent;
        const hasPlus = text.includes('+');
        const hasPercent = text.includes('%');
        const hasK = text.includes('K');
        
        let endValue = parseInt(text.replace(/\D/g, ''));
        
        if (hasK) {
            animateValue(stat, 0, endValue, 2000, 'K+');
        } else if (hasPercent) {
            animateValue(stat, 0, endValue, 2000, '%');
        } else if (hasPlus) {
            animateValue(stat, 0, endValue, 2000, '+');
        } else {
            animateValue(stat, 0, endValue, 2000, '');
        }
    });
}

function animateValue(element, start, end, duration, suffix) {
    const startTime = performance.now();
    
    function update(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        // Easing function
        const easeOut = 1 - Math.pow(1 - progress, 3);
        const current = Math.floor(start + (end - start) * easeOut);
        
        element.textContent = current + suffix;
        
        if (progress < 1) {
            requestAnimationFrame(update);
        }
    }
    
    requestAnimationFrame(update);
}

// ===== Button Ripple Effect =====
document.querySelectorAll('.btn').forEach(button => {
    button.addEventListener('click', function(e) {
        const rect = this.getBoundingClientRect();
        const ripple = document.createElement('span');
        ripple.className = 'ripple';
        ripple.style.width = ripple.style.height = Math.max(rect.width, rect.height) + 'px';
        ripple.style.left = (e.clientX - rect.left - rect.width / 2) + 'px';
        ripple.style.top = (e.clientY - rect.top - rect.height / 2) + 'px';
        this.appendChild(ripple);
        
        setTimeout(() => ripple.remove(), 600);
    });
});

// ===== Tilt Effect on Cards =====
document.querySelectorAll('.feature-card, .testimonial-card, .pricing-card:not(.featured)').forEach(card => {
    card.addEventListener('mousemove', function(e) {
        const rect = this.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        
        const rotateX = (y - centerY) / 30;
        const rotateY = (centerX - x) / 30;
        
        this.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-5px)`;
    });
    
    card.addEventListener('mouseleave', function() {
        this.style.transform = '';
    });
});

// ===== Magnetic Button Effect =====
document.querySelectorAll('.btn-primary, .btn-white').forEach(button => {
    button.addEventListener('mousemove', function(e) {
        const rect = this.getBoundingClientRect();
        const x = e.clientX - rect.left - rect.width / 2;
        const y = e.clientY - rect.top - rect.height / 2;
        
        this.style.transform = `translate(${x * 0.15}px, ${y * 0.15}px)`;
    });
    
    button.addEventListener('mouseleave', function() {
        this.style.transform = '';
    });
});

// ===== Active Navigation Link =====
const sections = document.querySelectorAll('section[id]');
const navLinks = document.querySelectorAll('.nav-desktop a');

window.addEventListener('scroll', () => {
    let current = '';
    
    sections.forEach(section => {
        const sectionTop = section.offsetTop - 150;
        const sectionHeight = section.offsetHeight;
        
        if (window.pageYOffset >= sectionTop && window.pageYOffset < sectionTop + sectionHeight) {
            current = section.getAttribute('id');
        }
    });
    
    navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === `#${current}`) {
            link.classList.add('active');
        }
    });
});

// ===== Subtle Hover Effect on Hero Image =====
const heroImageWrapper = document.querySelector('.hero-image-wrapper');
if (heroImageWrapper) {
    heroImageWrapper.addEventListener('mousemove', (e) => {
        const rect = heroImageWrapper.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width - 0.5;
        const y = (e.clientY - rect.top) / rect.height - 0.5;
        
        const imageContainer = heroImageWrapper.querySelector('.hero-image-container');
        if (imageContainer) {
            imageContainer.style.transform = `perspective(1000px) rotateY(${x * 8}deg) rotateX(${-y * 8}deg) scale(1.02)`;
        }
        
        // Move glow with mouse
        const glow = heroImageWrapper.querySelector('.image-glow');
        if (glow) {
            glow.style.transform = `translate(${x * 30}px, ${y * 30}px) scale(1.1)`;
        }
    });
    
    heroImageWrapper.addEventListener('mouseleave', () => {
        const imageContainer = heroImageWrapper.querySelector('.hero-image-container');
        if (imageContainer) {
            imageContainer.style.transform = 'perspective(1000px) rotateY(0) rotateX(0) scale(1)';
        }
        
        const glow = heroImageWrapper.querySelector('.image-glow');
        if (glow) {
            glow.style.transform = 'translate(0, 0) scale(1)';
        }
    });
}

// ===== Form Input Focus Animation =====
const inputs = document.querySelectorAll('input, textarea');
inputs.forEach(input => {
    input.addEventListener('focus', () => {
        input.parentElement.classList.add('focused');
    });
    input.addEventListener('blur', () => {
        input.parentElement.classList.remove('focused');
    });
});

// ===== Typing Effect for Hero (optional enhancement) =====
function typeWriter(element, text, speed = 50) {
    let i = 0;
    element.textContent = '';
    
    function type() {
        if (i < text.length) {
            element.textContent += text.charAt(i);
            i++;
            setTimeout(type, speed);
        }
    }
    
    type();
}

// ===== Initialize on Page Load =====
document.addEventListener('DOMContentLoaded', () => {
    // Add loaded class to body for entrance animations
    document.body.classList.add('loaded');
    
    // Initialize any entrance animations
    setTimeout(() => {
        document.querySelectorAll('.hero .reveal, .hero-content > *').forEach(el => {
            el.classList.add('visible');
        });
    }, 100);
    
    console.log('GradeAI - Professional Light Theme Initialized');
});

// ===== Handle Window Resize =====
let resizeTimer;
window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
        if (window.innerWidth > 768 && mobileNav.classList.contains('active')) {
            mobileToggle.classList.remove('active');
            mobileNav.classList.remove('active');
            document.body.style.overflow = '';
        }
    }, 250);
});

// ===== Keyboard Navigation Support =====
document.addEventListener('keydown', (e) => {
    // Close mobile menu on Escape
    if (e.key === 'Escape' && mobileNav.classList.contains('active')) {
        mobileToggle.classList.remove('active');
        mobileNav.classList.remove('active');
        document.body.style.overflow = '';
    }
});

// ===== Intersection Observer for Animations =====
const animateOnScroll = (entries, observer) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('animated');
            
            // Add staggered animations for children
            const children = entry.target.querySelectorAll('.stagger-item');
            children.forEach((child, index) => {
                child.style.animationDelay = `${index * 0.1}s`;
                child.classList.add('animated');
            });
        }
    });
};

const animationObserver = new IntersectionObserver(animateOnScroll, {
    threshold: 0.2,
    rootMargin: '0px'
});

document.querySelectorAll('.animate-on-scroll').forEach(el => {
    animationObserver.observe(el);
});

// ===== Smooth Counter Animation =====
function countUp(element, target, duration = 2000) {
    let start = 0;
    const increment = target / (duration / 16);
    
    function updateCount() {
        start += increment;
        if (start < target) {
            element.textContent = Math.floor(start);
            requestAnimationFrame(updateCount);
        } else {
            element.textContent = target;
        }
    }
    
    updateCount();
}

// ===== Preload Critical Resources =====
window.addEventListener('load', () => {
    // Remove any loading screens
    const loader = document.querySelector('.page-loader');
    if (loader) {
        loader.classList.add('hidden');
        setTimeout(() => loader.remove(), 500);
    }
});
