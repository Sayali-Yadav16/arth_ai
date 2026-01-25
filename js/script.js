// ===============================
// TAXBUDDY – MAIN JAVASCRIPT
// ===============================

document.addEventListener('DOMContentLoaded', function() {
  // Mobile Menu Toggle
  const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
  const navCenter = document.querySelector('.nav-center');
  
  if (mobileMenuBtn) {
    mobileMenuBtn.addEventListener('click', function() {
      navCenter.classList.toggle('show');
      this.classList.toggle('active');
    });
  }

  // Navbar Scroll Effect
  const navbar = document.querySelector('.navbar');
  let lastScroll = 0;
  
  window.addEventListener('scroll', function() {
    const currentScroll = window.pageYOffset;
    
    if (currentScroll > 100) {
      navbar.style.background = 'rgba(15, 23, 42, 0.98)';
      navbar.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.2)';
    } else {
      navbar.style.background = 'rgba(15, 23, 42, 0.95)';
      navbar.style.boxShadow = 'none';
    }
    
    if (currentScroll > lastScroll && currentScroll > 100) {
      navbar.style.transform = 'translateY(-100%)';
    } else {
      navbar.style.transform = 'translateY(0)';
    }
    
    lastScroll = currentScroll;
  });

  // Smooth Scroll for Anchor Links
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      e.preventDefault();
      
      const targetId = this.getAttribute('href');
      if (targetId === '#') return;
      
      const targetElement = document.querySelector(targetId);
      if (targetElement) {
        window.scrollTo({
          top: targetElement.offsetTop - 80,
          behavior: 'smooth'
        });
        
        // Close mobile menu if open
        if (navCenter.classList.contains('show')) {
          navCenter.classList.remove('show');
          mobileMenuBtn.classList.remove('active');
        }
      }
    });
  });

  // Feature Card Animation on Scroll
  const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
  };

  const observer = new IntersectionObserver(function(entries) {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.opacity = '1';
        entry.target.style.transform = 'translateY(0)';
      }
    });
  }, observerOptions);

  // Observe feature and resource cards
  document.querySelectorAll('.feature-card, .resource-card').forEach(card => {
    card.style.opacity = '0';
    card.style.transform = 'translateY(20px)';
    card.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    observer.observe(card);
  });

  // Update Dashboard Preview Data
  function updateDashboardPreview() {
    const taxValue = document.querySelector('.metric-value:nth-child(1)');
    const savingsValue = document.querySelector('.metric-value:nth-child(2)');
    
    if (taxValue && savingsValue) {
      // Simulate live data updates
      const baseTax = 42850;
      const baseSavings = 18200;
      
      const randomTax = baseTax + Math.floor(Math.random() * 2000) - 1000;
      const randomSavings = baseSavings + Math.floor(Math.random() * 1500) - 750;
      
      taxValue.textContent = `₹${randomTax.toLocaleString()}`;
      savingsValue.textContent = `₹${randomSavings.toLocaleString()}`;
    }
  }

  // Update dashboard every 5 seconds (demo purposes)
  setInterval(updateDashboardPreview, 5000);

  // Theme Toggle (Optional Future Feature)
  const themeToggle = document.createElement('button');
  themeToggle.className = 'theme-toggle';
  themeToggle.innerHTML = '🌙';
  themeToggle.style.position = 'fixed';
  themeToggle.style.bottom = '20px';
  themeToggle.style.right = '20px';
  themeToggle.style.zIndex = '1000';
  themeToggle.style.background = 'var(--bg-card)';
  themeToggle.style.border = '1px solid var(--border)';
  themeToggle.style.color = 'var(--text-primary)';
  themeToggle.style.width = '48px';
  themeToggle.style.height = '48px';
  themeToggle.style.borderRadius = '50%';
  themeToggle.style.display = 'flex';
  themeToggle.style.alignItems = 'center';
  themeToggle.style.justifyContent = 'center';
  themeToggle.style.cursor = 'pointer';
  themeToggle.style.fontSize = '20px';
  themeToggle.style.transition = 'all 0.3s ease';
  
  themeToggle.addEventListener('click', function() {
    const currentTheme = document.body.getAttribute('data-theme');
    if (currentTheme === 'light') {
      document.body.removeAttribute('data-theme');
      themeToggle.innerHTML = '🌙';
      themeToggle.style.background = 'var(--bg-card)';
    } else {
      document.body.setAttribute('data-theme', 'light');
      themeToggle.innerHTML = '☀️';
      themeToggle.style.background = '#f1f5f9';
    }
  });
  
  document.body.appendChild(themeToggle);

  // Form Validation (for future forms)
  const forms = document.querySelectorAll('form');
  forms.forEach(form => {
    form.addEventListener('submit', function(e) {
      e.preventDefault();
      
      const inputs = this.querySelectorAll('input[required]');
      let isValid = true;
      
      inputs.forEach(input => {
        if (!input.value.trim()) {
          isValid = false;
          input.style.borderColor = '#ef4444';
        } else {
          input.style.borderColor = '';
        }
      });
      
      if (isValid) {
        // Submit form (for demo, just show success)
        const submitBtn = this.querySelector('button[type="submit"]');
        const originalText = submitBtn.textContent;
        
        submitBtn.textContent = 'Processing...';
        submitBtn.disabled = true;
        
        setTimeout(() => {
          submitBtn.textContent = 'Success!';
          submitBtn.style.background = '#10b981';
          
          setTimeout(() => {
            submitBtn.textContent = originalText;
            submitBtn.disabled = false;
            submitBtn.style.background = '';
          }, 2000);
        }, 1500);
      }
    });
  });

  // Initialize tooltips
  const tooltipElements = document.querySelectorAll('[data-tooltip]');
  tooltipElements.forEach(el => {
    el.addEventListener('mouseenter', function() {
      const tooltip = document.createElement('div');
      tooltip.className = 'tooltip';
      tooltip.textContent = this.getAttribute('data-tooltip');
      tooltip.style.position = 'absolute';
      tooltip.style.background = 'var(--bg-card)';
      tooltip.style.color = 'var(--text-primary)';
      tooltip.style.padding = '8px 12px';
      tooltip.style.borderRadius = '6px';
      tooltip.style.fontSize = '12px';
      tooltip.style.whiteSpace = 'nowrap';
      tooltip.style.zIndex = '10000';
      tooltip.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
      
      const rect = this.getBoundingClientRect();
      tooltip.style.left = rect.left + 'px';
      tooltip.style.top = (rect.top - 40) + 'px';
      
      document.body.appendChild(tooltip);
      
      this._tooltip = tooltip;
    });
    
    el.addEventListener('mouseleave', function() {
      if (this._tooltip) {
        this._tooltip.remove();
        this._tooltip = null;
      }
    });
  });

  // Add CSS for mobile menu
  const style = document.createElement('style');
  style.textContent = `
    @media (max-width: 992px) {
      .nav-center.show {
        display: flex;
        flex-direction: column;
        position: absolute;
        top: 100%;
        left: 0;
        right: 0;
        background: var(--bg-dark);
        border-bottom: 1px solid var(--border);
        padding: 20px 5%;
        gap: 20px;
      }
      
      .mobile-menu-btn.active span:nth-child(1) {
        transform: rotate(45deg) translate(6px, 6px);
      }
      
      .mobile-menu-btn.active span:nth-child(2) {
        opacity: 0;
      }
      
      .mobile-menu-btn.active span:nth-child(3) {
        transform: rotate(-45deg) translate(6px, -6px);
      }
    }
    
    /* Light theme (optional) */
    [data-theme="light"] {
      --bg-dark: #f8fafc;
      --bg-card: #ffffff;
      --bg-card-hover: #f1f5f9;
      --text-primary: #1e293b;
      --text-secondary: #475569;
      --text-muted: #64748b;
      --border: #e2e8f0;
      --border-light: #cbd5e1;
    }
    
    [data-theme="light"] .navbar {
      background: rgba(248, 250, 252, 0.95);
    }
    
    [data-theme="light"] .footer {
      background: #f1f5f9;
    }
  `;
  document.head.appendChild(style);

  console.log('TaxBuddy initialized successfully!');
});

// Utility Functions
const TaxBuddy = {
  formatCurrency: function(amount) {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  },
  
  calculateTax: function(income, deductions = 0) {
    // Simplified tax calculation logic
    let taxableIncome = income - deductions;
    let tax = 0;
    
    if (taxableIncome <= 300000) {
      tax = 0;
    } else if (taxableIncome <= 600000) {
      tax = (taxableIncome - 300000) * 0.05;
    } else if (taxableIncome <= 900000) {
      tax = 15000 + (taxableIncome - 600000) * 0.1;
    } else if (taxableIncome <= 1200000) {
      tax = 45000 + (taxableIncome - 900000) * 0.15;
    } else if (taxableIncome <= 1500000) {
      tax = 90000 + (taxableIncome - 1200000) * 0.2;
    } else {
      tax = 150000 + (taxableIncome - 1500000) * 0.3;
    }
    
    return Math.max(0, tax);
  },
  
  showNotification: function(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      padding: 16px 24px;
      background: ${type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : '#3b82f6'};
      color: white;
      border-radius: 8px;
      z-index: 10000;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      animation: slideIn 0.3s ease;
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
      notification.style.animation = 'slideOut 0.3s ease';
      setTimeout(() => notification.remove(), 300);
    }, 3000);
  }
};

// Add notification animation
const notificationStyle = document.createElement('style');
notificationStyle.textContent = `
  @keyframes slideIn {
    from {
      transform: translateX(100%);
      opacity: 0;
    }
    to {
      transform: translateX(0);
      opacity: 1;
    }
  }
  
  @keyframes slideOut {
    from {
      transform: translateX(0);
      opacity: 1;
    }
    to {
      transform: translateX(100%);
      opacity: 0;
    }
  }
`;
document.head.appendChild(notificationStyle);