/**
 * What's Up? Workflow Visualization
 * Interactive JavaScript for Apple Liquid Glass UI
 */

document.addEventListener('DOMContentLoaded', () => {
    // Initialize all components
    initNavigation();
    initScrollAnimations();
    initExpandables();
    initBackToTop();
    initParallax();
    initFlowAnimations();
    initHoverEffects();
    initModal();
    initProgressIndicator();
});

/**
 * Navigation System
 */
function initNavigation() {
    const nav = document.querySelector('.glass-nav');
    const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
    const mobileNav = document.querySelector('.mobile-nav');
    const navLinks = document.querySelectorAll('.nav-link, .mobile-nav-link');
    
    // Scroll effect for navigation
    let lastScroll = 0;
    
    window.addEventListener('scroll', () => {
        const currentScroll = window.pageYOffset;
        
        // Add/remove shadow based on scroll position
        if (currentScroll > 50) {
            nav.style.boxShadow = '0 4px 30px rgba(0, 0, 0, 0.3)';
        } else {
            nav.style.boxShadow = 'none';
        }
        
        lastScroll = currentScroll;
    });
    
    // Mobile menu toggle
    mobileMenuBtn.addEventListener('click', () => {
        mobileNav.classList.toggle('active');
        mobileMenuBtn.classList.toggle('active');
        
        // Animate hamburger to X
        const spans = mobileMenuBtn.querySelectorAll('span');
        if (mobileNav.classList.contains('active')) {
            spans[0].style.transform = 'rotate(45deg) translate(6px, 6px)';
            spans[1].style.opacity = '0';
            spans[2].style.transform = 'rotate(-45deg) translate(6px, -6px)';
        } else {
            spans[0].style.transform = 'none';
            spans[1].style.opacity = '1';
            spans[2].style.transform = 'none';
        }
    });
    
    // Close mobile nav on link click
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            mobileNav.classList.remove('active');
            mobileMenuBtn.classList.remove('active');
            const spans = mobileMenuBtn.querySelectorAll('span');
            spans[0].style.transform = 'none';
            spans[1].style.opacity = '1';
            spans[2].style.transform = 'none';
        });
    });
    
    // Active link highlighting
    const sections = document.querySelectorAll('section[id]');
    
    window.addEventListener('scroll', () => {
        let current = '';
        
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.clientHeight;
            
            if (pageYOffset >= sectionTop - 200) {
                current = section.getAttribute('id');
            }
        });
        
        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === `#${current}`) {
                link.classList.add('active');
                link.style.color = '#007aff';
                link.style.background = 'rgba(0, 122, 255, 0.1)';
            } else {
                link.style.color = '';
                link.style.background = '';
            }
        });
    });
}

/**
 * Scroll-triggered Animations (AOS-like)
 */
function initScrollAnimations() {
    const animatedElements = document.querySelectorAll('[data-aos]');
    
    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.1
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const delay = entry.target.dataset.aosDelay || 0;
                setTimeout(() => {
                    entry.target.classList.add('aos-animate');
                }, delay);
            }
        });
    }, observerOptions);
    
    animatedElements.forEach(el => observer.observe(el));
    
    // Stagger animations for grid items
    const grids = document.querySelectorAll('.overview-grid, .data-files-grid, .workflows-grid, .api-grid, .error-grid, .troubleshoot-grid');
    
    grids.forEach(grid => {
        const items = grid.querySelectorAll('.glass-card');
        items.forEach((item, index) => {
            if (!item.dataset.aosDelay) {
                item.dataset.aosDelay = index * 100;
            }
        });
    });
}

/**
 * Expandable Cards/Sections
 */
function initExpandables() {
    const expandables = document.querySelectorAll('.expandable');
    
    expandables.forEach(card => {
        const header = card.querySelector('.data-file-header, .script-section-header, .trouble-header');
        const expandBtn = card.querySelector('.expand-btn');
        
        if (header) {
            header.addEventListener('click', (e) => {
                // Don't toggle if clicking on expand button (it has its own handler)
                if (e.target.closest('.expand-btn')) return;
                toggleExpand(card);
            });
        }
        
        if (expandBtn) {
            expandBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                toggleExpand(card);
            });
        }
    });
    
    function toggleExpand(card) {
        const isExpanded = card.classList.contains('expanded');
        
        // Optional: Close other expandables in the same container
        // const container = card.parentElement;
        // const siblings = container.querySelectorAll('.expandable.expanded');
        // siblings.forEach(sib => sib.classList.remove('expanded'));
        
        card.classList.toggle('expanded');
        
        // Animate content
        const content = card.querySelector('.data-file-content, .script-section-content, .trouble-content');
        if (content) {
            if (!isExpanded) {
                content.style.maxHeight = content.scrollHeight + 'px';
                content.style.opacity = '1';
            } else {
                content.style.maxHeight = '0';
                content.style.opacity = '0';
            }
        }
    }
}

/**
 * Back to Top Button
 */
function initBackToTop() {
    const backToTop = document.querySelector('.back-to-top');
    
    window.addEventListener('scroll', () => {
        if (window.pageYOffset > 500) {
            backToTop.classList.add('visible');
        } else {
            backToTop.classList.remove('visible');
        }
    });
    
    backToTop.addEventListener('click', () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });
}

/**
 * Parallax Effects
 */
function initParallax() {
    const orbs = document.querySelectorAll('.gradient-orb');
    
    window.addEventListener('scroll', () => {
        const scrolled = window.pageYOffset;
        
        orbs.forEach((orb, index) => {
            const speed = 0.05 * (index + 1);
            orb.style.transform = `translateY(${scrolled * speed}px)`;
        });
    });
    
    // Mouse parallax for hero section
    const heroContent = document.querySelector('.hero-content');
    
    if (heroContent) {
        document.addEventListener('mousemove', (e) => {
            const mouseX = e.clientX / window.innerWidth - 0.5;
            const mouseY = e.clientY / window.innerHeight - 0.5;
            
            heroContent.style.transform = `translate(${mouseX * 10}px, ${mouseY * 10}px)`;
        });
    }
}

/**
 * Flow Line Animations
 */
function initFlowAnimations() {
    const connectorLines = document.querySelectorAll('.connector-line, .step-line');
    
    // Animate flow lines on scroll
    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.5
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate');
            }
        });
    }, observerOptions);
    
    connectorLines.forEach(line => observer.observe(line));
    
    // Execution steps hover animation
    const execSteps = document.querySelectorAll('.exec-step');
    
    execSteps.forEach(step => {
        step.addEventListener('mouseenter', () => {
            const stepNum = step.dataset.step;
            // Highlight connected steps
            execSteps.forEach(s => {
                if (parseInt(s.dataset.step) <= parseInt(stepNum)) {
                    s.style.opacity = '1';
                    s.style.transform = 'scale(1.05)';
                } else {
                    s.style.opacity = '0.5';
                }
            });
        });
        
        step.addEventListener('mouseleave', () => {
            execSteps.forEach(s => {
                s.style.opacity = '1';
                s.style.transform = '';
            });
        });
    });
    
    // Sunday timeline animation
    const sundaySteps = document.querySelectorAll('.sunday-step');
    
    sundaySteps.forEach((step, index) => {
        const stepObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    setTimeout(() => {
                        step.style.opacity = '1';
                        step.style.transform = 'translateX(0)';
                    }, index * 150);
                }
            });
        }, { threshold: 0.3 });
        
        step.style.opacity = '0';
        step.style.transform = 'translateX(-30px)';
        step.style.transition = 'all 0.5s ease';
        
        stepObserver.observe(step);
    });
}

/**
 * Hover Effects
 */
function initHoverEffects() {
    // Glass card glow effect
    const glassCards = document.querySelectorAll('.glass-card, .glass-card-mini');
    
    glassCards.forEach(card => {
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            card.style.setProperty('--mouse-x', `${x}px`);
            card.style.setProperty('--mouse-y', `${y}px`);
            
            // Add subtle glow at mouse position
            card.style.background = `
                radial-gradient(
                    400px circle at ${x}px ${y}px,
                    rgba(255, 255, 255, 0.06),
                    transparent 40%
                ),
                rgba(255, 255, 255, 0.05)
            `;
        });
        
        card.addEventListener('mouseleave', () => {
            card.style.background = '';
        });
    });
    
    // Feature cards 3D tilt effect
    const featureCards = document.querySelectorAll('.feature-card, .stat-card, .tech-item');
    
    featureCards.forEach(card => {
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            const rotateX = (y - centerY) / 10;
            const rotateY = (centerX - x) / 10;
            
            card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-4px)`;
        });
        
        card.addEventListener('mouseleave', () => {
            card.style.transform = '';
        });
    });
    
    // Timeline step pulse effect
    const timelineSteps = document.querySelectorAll('.timeline-step');
    
    timelineSteps.forEach(step => {
        step.addEventListener('mouseenter', () => {
            step.style.boxShadow = '0 0 20px rgba(0, 122, 255, 0.3)';
        });
        
        step.addEventListener('mouseleave', () => {
            step.style.boxShadow = '';
        });
    });
    
    // API endpoint hover
    const endpoints = document.querySelectorAll('.endpoint');
    
    endpoints.forEach(endpoint => {
        endpoint.addEventListener('mouseenter', () => {
            const code = endpoint.querySelector('code');
            if (code) {
                code.style.color = '#5ac8fa';
                code.style.transform = 'scale(1.02)';
            }
        });
        
        endpoint.addEventListener('mouseleave', () => {
            const code = endpoint.querySelector('code');
            if (code) {
                code.style.color = '';
                code.style.transform = '';
            }
        });
    });
}

/**
 * Modal System
 */
function initModal() {
    const modalOverlay = document.getElementById('modal-overlay');
    const modalClose = document.querySelector('.modal-close');
    const modalBody = document.querySelector('.modal-body');
    
    // Close modal on button click
    modalClose.addEventListener('click', closeModal);
    
    // Close modal on overlay click
    modalOverlay.addEventListener('click', (e) => {
        if (e.target === modalOverlay) {
            closeModal();
        }
    });
    
    // Close modal on Escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modalOverlay.classList.contains('active')) {
            closeModal();
        }
    });
    
    function closeModal() {
        modalOverlay.classList.remove('active');
        document.body.style.overflow = '';
    }
    
    // Global function to open modal with content
    window.openModal = function(content) {
        modalBody.innerHTML = content;
        modalOverlay.classList.add('active');
        document.body.style.overflow = 'hidden';
    };
}

/**
 * Progress Indicator (Shows reading progress)
 */
function initProgressIndicator() {
    // Create progress bar
    const progressBar = document.createElement('div');
    progressBar.className = 'reading-progress';
    progressBar.style.cssText = `
        position: fixed;
        top: 70px;
        left: 0;
        width: 0%;
        height: 3px;
        background: linear-gradient(90deg, #007aff 0%, #af52de 50%, #ff2d55 100%);
        z-index: 1001;
        transition: width 0.1s ease;
        border-radius: 0 2px 2px 0;
    `;
    document.body.appendChild(progressBar);
    
    window.addEventListener('scroll', () => {
        const winScroll = document.body.scrollTop || document.documentElement.scrollTop;
        const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
        const scrolled = (winScroll / height) * 100;
        progressBar.style.width = scrolled + '%';
    });
}

/**
 * Animated Counter for Stats
 */
function animateCounters() {
    const counters = document.querySelectorAll('.stat-number');
    
    counters.forEach(counter => {
        const target = parseInt(counter.innerText);
        const duration = 2000;
        const step = target / (duration / 16);
        let current = 0;
        
        const updateCounter = () => {
            current += step;
            if (current < target) {
                counter.innerText = Math.ceil(current);
                requestAnimationFrame(updateCounter);
            } else {
                counter.innerText = target;
            }
        };
        
        // Only animate when in view
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    updateCounter();
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.5 });
        
        observer.observe(counter);
    });
}

/**
 * Smooth Scroll for Anchor Links
 */
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

/**
 * Dynamic Section Numbers Animation
 */
function initSectionNumbers() {
    const sectionNumbers = document.querySelectorAll('.section-number');
    
    sectionNumbers.forEach(num => {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    num.style.animation = 'fadeInUp 0.5s ease forwards';
                }
            });
        }, { threshold: 0.5 });
        
        observer.observe(num);
    });
}

/**
 * Code Block Copy Functionality
 */
function initCodeCopy() {
    const codeBlocks = document.querySelectorAll('.code-block, pre');
    
    codeBlocks.forEach(block => {
        const copyBtn = document.createElement('button');
        copyBtn.className = 'code-copy-btn';
        copyBtn.innerHTML = '📋';
        copyBtn.style.cssText = `
            position: absolute;
            top: 8px;
            right: 8px;
            background: rgba(255, 255, 255, 0.1);
            border: none;
            border-radius: 6px;
            padding: 6px 10px;
            cursor: pointer;
            opacity: 0;
            transition: opacity 0.2s ease;
            font-size: 0.9rem;
        `;
        
        block.style.position = 'relative';
        block.appendChild(copyBtn);
        
        block.addEventListener('mouseenter', () => {
            copyBtn.style.opacity = '1';
        });
        
        block.addEventListener('mouseleave', () => {
            copyBtn.style.opacity = '0';
        });
        
        copyBtn.addEventListener('click', async () => {
            const code = block.querySelector('code') || block;
            try {
                await navigator.clipboard.writeText(code.textContent);
                copyBtn.innerHTML = '✓';
                setTimeout(() => {
                    copyBtn.innerHTML = '📋';
                }, 2000);
            } catch (err) {
                console.error('Failed to copy:', err);
            }
        });
    });
}

/**
 * Keyboard Navigation Support
 */
function initKeyboardNav() {
    const sections = document.querySelectorAll('section[id]');
    let currentSection = 0;
    
    document.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowDown' && e.altKey) {
            e.preventDefault();
            currentSection = Math.min(currentSection + 1, sections.length - 1);
            sections[currentSection].scrollIntoView({ behavior: 'smooth' });
        } else if (e.key === 'ArrowUp' && e.altKey) {
            e.preventDefault();
            currentSection = Math.max(currentSection - 1, 0);
            sections[currentSection].scrollIntoView({ behavior: 'smooth' });
        }
    });
}

/**
 * Intersection Observer for Lazy Loading Effects
 */
function initLazyEffects() {
    // Add staggered entrance for grid items
    const grids = document.querySelectorAll('.overview-grid, .data-files-grid, .tech-stack');
    
    grids.forEach(grid => {
        const items = grid.children;
        
        const observer = new IntersectionObserver((entries) => {
            if (entries[0].isIntersecting) {
                Array.from(items).forEach((item, index) => {
                    setTimeout(() => {
                        item.style.opacity = '1';
                        item.style.transform = 'translateY(0)';
                    }, index * 100);
                });
                observer.unobserve(grid);
            }
        }, { threshold: 0.2 });
        
        // Set initial state
        Array.from(items).forEach(item => {
            item.style.opacity = '0';
            item.style.transform = 'translateY(20px)';
            item.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
        });
        
        observer.observe(grid);
    });
}

/**
 * Touch Support for Mobile
 */
function initTouchSupport() {
    // Add touch feedback for cards
    const touchElements = document.querySelectorAll('.glass-card, .glass-card-mini, .timeline-step');
    
    touchElements.forEach(el => {
        el.addEventListener('touchstart', () => {
            el.style.transform = 'scale(0.98)';
        });
        
        el.addEventListener('touchend', () => {
            el.style.transform = '';
        });
    });
}

/**
 * Performance Optimization: Throttle scroll events
 */
function throttle(func, limit) {
    let inThrottle;
    return function(...args) {
        if (!inThrottle) {
            func.apply(this, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

// Apply throttle to scroll handlers
window.addEventListener('scroll', throttle(() => {
    // Scroll-based animations happen here
}, 16)); // ~60fps

/**
 * Initialize remaining features after load
 */
window.addEventListener('load', () => {
    animateCounters();
    initSectionNumbers();
    initCodeCopy();
    initKeyboardNav();
    initLazyEffects();
    initTouchSupport();
    
    // Remove loading state
    document.body.classList.add('loaded');
    
    // Trigger initial animations
    setTimeout(() => {
        document.querySelectorAll('.hero-content > *').forEach((el, index) => {
            el.style.animation = `fadeInUp 0.6s ease ${index * 0.1}s forwards`;
            el.style.opacity = '0';
        });
    }, 100);
});

/**
 * CSS Animation Keyframes (added via JS for dynamic control)
 */
const styleSheet = document.createElement('style');
styleSheet.textContent = `
    @keyframes fadeInUp {
        from {
            opacity: 0;
            transform: translateY(30px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }
    
    @keyframes fadeInDown {
        from {
            opacity: 0;
            transform: translateY(-30px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }
    
    @keyframes scaleIn {
        from {
            opacity: 0;
            transform: scale(0.9);
        }
        to {
            opacity: 1;
            transform: scale(1);
        }
    }
    
    @keyframes slideInLeft {
        from {
            opacity: 0;
            transform: translateX(-30px);
        }
        to {
            opacity: 1;
            transform: translateX(0);
        }
    }
    
    @keyframes slideInRight {
        from {
            opacity: 0;
            transform: translateX(30px);
        }
        to {
            opacity: 1;
            transform: translateX(0);
        }
    }
    
    @keyframes glowPulse {
        0%, 100% {
            box-shadow: 0 0 20px rgba(103, 126, 234, 0.3);
        }
        50% {
            box-shadow: 0 0 40px rgba(103, 126, 234, 0.6);
        }
    }
    
    .nav-link.active {
        color: #007aff !important;
        background: rgba(0, 122, 255, 0.1) !important;
    }
    
    .connector-line.animate {
        animation: flowLine 1.5s ease infinite;
    }
    
    @keyframes flowLine {
        0% {
            opacity: 0.5;
            background-position: 0% 0%;
        }
        50% {
            opacity: 1;
            background-position: 100% 0%;
        }
        100% {
            opacity: 0.5;
            background-position: 0% 0%;
        }
    }
    
    .hero-content > * {
        opacity: 1;
    }
    
    body.loaded .hero-content > * {
        animation: fadeInUp 0.6s ease forwards;
    }
`;
document.head.appendChild(styleSheet);

// Console easter egg
console.log(`
%c🎬 What's Up? Workflow Visualization
%cAutonomous Philosophical Media Blog Engine

Built with Apple Liquid Glass UI
Documentation: February 15, 2026
`, 
'font-size: 20px; font-weight: bold; color: #007aff;',
'font-size: 12px; color: #888;'
);
