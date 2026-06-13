import { useEffect, useRef } from 'react';
import Header from './components/Header';
import Overview from './pages/Overview';
import CareerDrivers from './pages/CareerDrivers';
import ToolsPage from './pages/ToolsPage';
import Projects from './pages/Projects';
import Contact from './pages/Contact';
import './index.css';
import styles from './App.module.css';

function App() {
  const observerRefs = useRef([]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
          } else {
            // Optional: remove class when out of view to trigger animation every time
            // entry.target.classList.remove('is-visible');
          }
        });
      },
      {
        threshold: 0.3, // Trigger when 30% of the section is visible
      }
    );

    observerRefs.current.forEach((ref) => {
      if (ref) observer.observe(ref);
    });

    return () => {
      observerRefs.current.forEach((ref) => {
        if (ref) observer.unobserve(ref);
      });
    };
  }, []);

  const addToRefs = (el) => {
    if (el && !observerRefs.current.includes(el)) {
      observerRefs.current.push(el);
    }
  };

  return (
    <div className="app-container">
      <Header />
      <main className={`main-content ${styles.mainContent}`}>
        <div className="section-wrapper" ref={addToRefs}>
          <section id="overview" className={`reveal-content ${styles.sectionOverview}`}>
            <Overview />
          </section>
        </div>

        <div className="section-wrapper" ref={addToRefs}>
          <div className={`section-title-badge ${styles.badgeDefault}`}>CHAPTER 2: ORIGIN STORY</div>
          <section id="drivers" className={`reveal-content ${styles.sectionDrivers}`}>
            <CareerDrivers />
          </section>
        </div>

        <div className="section-wrapper" ref={addToRefs}>
          <div className={`section-title-badge ${styles.badgeCenter}`}>CHAPTER 3: MY ARSENAL</div>
          <section id="tools" className={`reveal-content ${styles.sectionTools}`}>
            <ToolsPage />
          </section>
        </div>

        <div className="section-wrapper" ref={addToRefs}>
          <div className={`section-title-badge ${styles.badgeTop}`}>CHAPTER 4: EPIC ADVENTURES</div>
          <section id="projects" className={`reveal-content ${styles.sectionProjects}`}>
            <Projects />
          </section>
        </div>

        <div className="section-wrapper" ref={addToRefs}>
          <div className={`section-title-badge ${styles.badgeDefault}`}>CHAPTER 5: CONTACT ME</div>
          <section id="contact" className={`reveal-content ${styles.sectionContact}`}>
            <Contact />
          </section>
        </div>
      </main>
    </div>
  );
}

export default App;
