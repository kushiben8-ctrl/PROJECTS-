// script.js - Complete Interactive Functionality
// Smooth Scrolling Navigation
document.addEventListener('DOMContentLoaded', function() {
    // Mobile Navigation Toggle
    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('.nav-menu');
    
    hamburger.addEventListener('click', () => {
        hamburger.classList.toggle('active');
        navMenu.classList.toggle('active');
    });
    
    // Close mobile menu when clicking on a link
    document.querySelectorAll('.nav-link').forEach(n => n.addEventListener('click', () => {
        hamburger.classList.remove('active');
        navMenu.classList.remove('active');
    }));
    
    // Smooth Scrolling
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
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
    
    // Navbar Background on Scroll
    window.addEventListener('scroll', () => {
        const navbar = document.querySelector('.navbar');
        if (window.scrollY > 100) {
            navbar.style.background = 'rgba(255, 255, 255, 0.98)';
        } else {
            navbar.style.background = 'rgba(255, 255, 255, 0.95)';
        }
    });
    
    // Active Navigation Highlight
    window.addEventListener('scroll', () => {
        let current = '';
        const sections = document.querySelectorAll('section');
        const navLinks = document.querySelectorAll('.nav-link');
        
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.clientHeight;
            if (scrollY >= (sectionTop - 200)) {
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
    
    // Contact Form Validation
    const form = document.getElementById('contact-form');
    const inputs = form.querySelectorAll('input[required], textarea[required]');
    
    inputs.forEach(input => {
        input.addEventListener('input', () => clearError(input));
    });
    
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Validate all fields
        let isValid = true;
        
        // Name validation
        const name = document.getElementById('name');
        if (!name.value.trim() || name.value.length < 2) {
            showError(name, 'Name must be at least 2 characters');
            isValid = false;
        }
        
        // Email validation
        const email = document.getElementById('email');
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email.value)) {
            showError(email, 'Please enter a valid email address');
            isValid = false;
        }
        
        // Subject validation
        const subject = document.getElementById('subject');
        if (!subject.value.trim() || subject.value.length < 3) {
            showError(subject, 'Subject must be at least 3 characters');
            isValid = false;
        }
        
        // Message validation
        const message = document.getElementById('message');
        if (!message.value.trim() || message.value.length < 10) {
            showError(message, 'Message must be at least 10 characters');
            isValid = false;
        }
        
        if (isValid) {
            // Simulate form submission
            form.style.display = 'none';
            document.getElementById('contact-success').style.display = 'block';
            
            // Reset form after 5 seconds
            setTimeout(() => {
                form.reset();
                form.style.display = 'block';
                document.getElementById('contact-success').style.display = 'none';
            }, 5000);
        }
    });
    
    function showError(input, message) {
        clearError(input);
        const errorElement = document.getElementById(input.id + '-error');
        errorElement.textContent = message;
        input.style.borderColor = '#e74c3c';
    }
    
    function clearError(input) {
        const errorElement = document.getElementById(input.id + '-error');
        errorElement.textContent = '';
        input.style.borderColor = '#e9ecef';
    }
    
    // Image Hover Effects
    const images = document.querySelectorAll('.project-image img, #profile-img');
    images.forEach(img => {
        img.addEventListener('mouseenter', () => {
            img.style.transform = 'scale(1.05)';
        });
        img.addEventListener('mouseleave', () => {
            img.style.transform = 'scale(1)';
        });
    });
    
    // Project Cards Hover Animation
    const projectCards = document.querySelectorAll('.project-card');
    projectCards.forEach(card => {
        card.addEventListener('mouseenter', () => {
            card.style.transform = 'translateY(-15px)';
        });
        card.addEventListener('mouseleave', () => {
            card.style.transform = 'translateY(0)';
        });
    });
});

// Intersection Observer for Scroll Animations
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

// Observe all sections and cards for animation
document.querySelectorAll('section, .skill-card, .project-card').forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(30px)';
    el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    observer.observe(el);
});
