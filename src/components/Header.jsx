import { useState, useEffect } from 'react';
import '../index.css';

function Header() {
  const [isVisible, setIsVisible] = useState(true);
  let scrollTimeout = null;

  useEffect(() => {
    const handleScroll = () => {
      setIsVisible(true);
      
      if (scrollTimeout) {
        clearTimeout(scrollTimeout);
      }
      
      // Auto-hide after 2 seconds of no scrolling
      scrollTimeout = setTimeout(() => {
        setIsVisible(false);
      }, 2000);
    };

    const handleMouseMove = (e) => {
      // Show header if mouse is near the top
      if (e.clientY < 100) {
        setIsVisible(true);
        if (scrollTimeout) clearTimeout(scrollTimeout);
      }
    };

    window.addEventListener('scroll', handleScroll);
    window.addEventListener('mousemove', handleMouseMove);

    // Initial timeout
    scrollTimeout = setTimeout(() => setIsVisible(false), 3000);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('mousemove', handleMouseMove);
      if (scrollTimeout) clearTimeout(scrollTimeout);
    };
  }, []);

  const scrollToSection = (e, targetId) => {
    e.preventDefault();
    const element = document.getElementById(targetId);
    if (element) {
      // When using scroll-snap on HTML/Body, scrollIntoView works perfectly
      element.scrollIntoView({ behavior: 'smooth' });
      // Keep header visible for a moment after click
      setIsVisible(true);
    }
  };

  return (
    <header className={`header comic-panel ${!isVisible ? 'hidden' : ''}`}>
      <h2 style={{ margin: 0, color: 'var(--color-dark)', lineHeight: '1.2', paddingTop: '4px' }}>HUỲNH MINH TRÍ</h2>
      <nav className="nav-links horizontal">
        <a href="#overview" onClick={(e) => scrollToSection(e, 'overview')} className="comic-button header-btn">1. Overview</a>
        <a href="#drivers" onClick={(e) => scrollToSection(e, 'drivers')} className="comic-button header-btn">2. Origin Story</a>
        <a href="#tools" onClick={(e) => scrollToSection(e, 'tools')} className="comic-button header-btn">3. Tools</a>
        <a href="#projects" onClick={(e) => scrollToSection(e, 'projects')} className="comic-button header-btn">4. Projects</a>
        <a href="#contact" onClick={(e) => scrollToSection(e, 'contact')} className="comic-button header-btn">5. Contact</a>
      </nav>
    </header>
  );
}

export default Header;
