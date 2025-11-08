// Wait for DOM to load
document.addEventListener('DOMContentLoaded', function() {
    // Mobile menu toggle
const mobileMenuToggle = document.getElementById('mobileMenuToggle');
const sidebar = document.querySelector('.sidebar');

mobileMenuToggle.addEventListener('click', function() {
    sidebar.classList.toggle('active');
    const icon = this.querySelector('i');
    icon.classList.toggle('fa-bars');
    icon.classList.toggle('fa-times');
});

// Close mobile menu when clicking outside
document.addEventListener('click', function(e) {
    if (!sidebar.contains(e.target) && !mobileMenuToggle.contains(e.target)) {
        sidebar.classList.remove('active');
        const icon = mobileMenuToggle.querySelector('i');
        icon.classList.add('fa-bars');
        icon.classList.remove('fa-times');
    }
});

// Smooth scrolling for navigation links
    const navLinks = document.querySelectorAll('.nav-item');
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Remove active class from all nav items
            navLinks.forEach(item => item.classList.remove('active'));
            // Add active class to clicked item
            this.classList.add('active');
            
            // Add click animation
            this.style.transform = 'scale(0.95)';
            setTimeout(() => {
                this.style.transform = '';
            }, 150);
            
            // Close mobile menu after clicking
            sidebar.classList.remove('active');
            const icon = mobileMenuToggle.querySelector('i');
            icon.classList.add('fa-bars');
            icon.classList.remove('fa-times');
        });
    });

    // Button click animations and interactions
    const buttons = document.querySelectorAll('.btn');
    buttons.forEach(button => {
        button.addEventListener('click', function(e) {
            // Create ripple effect
            const ripple = document.createElement('span');
            const rect = this.getBoundingClientRect();
            const size = Math.max(rect.width, rect.height);
            const x = e.clientX - rect.left - size / 2;
            const y = e.clientY - rect.top - size / 2;
            
            ripple.style.width = ripple.style.height = size + 'px';
            ripple.style.left = x + 'px';
            ripple.style.top = y + 'px';
            ripple.classList.add('ripple');
            
            this.appendChild(ripple);
            
            setTimeout(() => {
                ripple.remove();
            }, 600);
            
            // Button click animation
            this.style.transform = 'scale(0.95)';
            setTimeout(() => {
                this.style.transform = '';
            }, 150);
        });
    });

    // Feature cards hover enhancement
    const featureCards = document.querySelectorAll('.feature-card');
    featureCards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-8px) scale(1.02)';
        });
        
        card.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0) scale(1)';
        });
    });

    // Testimonial cards hover enhancement
    const testimonialCards = document.querySelectorAll('.testimonial-card');
    testimonialCards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-8px) scale(1.02)';
        });
        
        card.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0) scale(1)';
        });
    });

    // Hero graphic floating animation
    const heroGraphic = document.querySelector('.graphic-box');
    if (heroGraphic) {
        let floatAnimation = setInterval(() => {
            heroGraphic.style.transform = 'translateY(-10px)';
            setTimeout(() => {
                heroGraphic.style.transform = 'translateY(0)';
            }, 2000);
        }, 4000);
        
        // Stop animation on hover
        heroGraphic.addEventListener('mouseenter', () => {
            clearInterval(floatAnimation);
            heroGraphic.style.transform = 'scale(1.05)';
        });
        
        heroGraphic.addEventListener('mouseleave', () => {
            heroGraphic.style.transform = 'scale(1)';
            floatAnimation = setInterval(() => {
                heroGraphic.style.transform = 'translateY(-10px)';
                setTimeout(() => {
                    heroGraphic.style.transform = 'translateY(0)';
                }, 2000);
            }, 4000);
        });
    }

    // Scroll animations
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);

    // Observe elements for scroll animations
    const animatedElements = document.querySelectorAll('.feature-card, .testimonial-card, .section-header');
    animatedElements.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(el);
    });

    // Form submission simulation for buttons
    const ctaButtons = document.querySelectorAll('.btn-primary, .btn-cta');
    ctaButtons.forEach(button => {
        button.addEventListener('click', function() {
            // Simulate loading state
            const originalText = this.textContent;
            this.textContent = 'Loading...';
            this.disabled = true;
            
            setTimeout(() => {
                this.textContent = originalText;
                this.disabled = false;
                
                // Show success message (you can customize this)
                console.log('Action completed successfully!');
            }, 1500);
        });
    });

    // Responsive menu toggle (for mobile)
    const sidebar = document.querySelector('.sidebar');
    const mainContent = document.querySelector('.main-content');
    
    function handleResize() {
        if (window.innerWidth <= 768) {
            sidebar.classList.add('mobile');
            mainContent.classList.add('mobile');
        } else {
            sidebar.classList.remove('mobile');
            mainContent.classList.remove('mobile');
        }
    }
    
    window.addEventListener('resize', handleResize);
    handleResize(); // Initial check

    // Login button functionality
    const loginBtn = document.querySelector('.login-btn');
    if (loginBtn) {
        loginBtn.addEventListener('click', function() {
            // Add shake animation on click
            this.style.animation = 'shake 0.5s ease-in-out';
            setTimeout(() => {
                this.style.animation = '';
            }, 500);
        });
    }

    // Smooth scroll to top functionality (for footer links)
    const footerLinks = document.querySelectorAll('.footer-link');
    footerLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            if (this.getAttribute('href') === '#') {
                e.preventDefault();
                window.scrollTo({
                    top: 0,
                    behavior: 'smooth'
                });
            }
        });
    });

    // Add CSS for ripple effect and animations
    const style = document.createElement('style');
    style.textContent = `
        .ripple {
            position: absolute;
            border-radius: 50%;
            background: rgba(255, 255, 255, 0.6);
            transform: scale(0);
            animation: ripple-animation 0.6s linear;
            pointer-events: none;
        }
        
        @keyframes ripple-animation {
            to {
                transform: scale(4);
                opacity: 0;
            }
        }
        
        @keyframes shake {
            0%, 100% { transform: translateX(0); }
            25% { transform: translateX(-5px); }
            75% { transform: translateX(5px); }
        }
        
        .btn {
            position: relative;
            overflow: hidden;
        }
        
        .graphic-box {
            transition: transform 0.3s ease;
        }
        
        .feature-card,
        .testimonial-card {
            transition: all 0.3s ease;
        }
    `;
    document.head.appendChild(style);

    console.log('🚀 SkillSet landing page loaded successfully!');
});