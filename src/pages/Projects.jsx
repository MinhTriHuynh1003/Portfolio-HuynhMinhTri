import { useRef, useState, useEffect } from 'react';
import '../index.css';
import styles from './Projects.module.css';

import { projects } from '../data/portfolioData';

// ProjectCard component with mobile responsiveness support
function ProjectCard({ proj, index }) {
  const contentRef = useRef(null);
  const [canScroll, setCanScroll] = useState(false);

  const checkScroll = () => {
    if (contentRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = contentRef.current;
      // If scrollable content is taller than the visible area, and we haven't reached the bottom
      setCanScroll(scrollHeight > clientHeight && Math.ceil(scrollTop + clientHeight) < scrollHeight - 5);
    }
  };

  useEffect(() => {
    // Check initially and on resize
    checkScroll();
    window.addEventListener('resize', checkScroll);
    return () => window.removeEventListener('resize', checkScroll);
  }, []);

  return (
    <div 
      className={`comic-panel ${styles.projectCard}`} 
      style={{ '--card-color': proj.color }}
    >
      {/* Issue Number Badge */}
      <div className={styles.issueBadge}>
        ISSUE #{index + 1}
      </div>

      {/* Thumbnail Image */}
      <div className={styles.imageContainer}>
        <img src={proj.img} alt={proj.title} className={styles.projectImage} />
      </div>

      {/* Content Body */}
      <div className={styles.contentBody} ref={contentRef} onScroll={checkScroll}>
        <h2 className={styles.projectTitle}>
          {proj.title}
        </h2>
        
        <div className={styles.roleBox}>
          <p className={styles.roleText}>ROLE: {proj.role}</p>
          <p className={styles.techText}>Tech: {proj.tech}</p>
        </div>

        <p className={styles.descText}>
          {proj.desc}
        </p>

        {/* Action Buttons */}
        <div className={styles.actionButtons}>
          <a 
            href={proj.github} 
            target="_blank" 
            rel="noopener noreferrer" 
            className={`${styles.btn} ${styles.btnGithub}`}
            aria-label={`View ${proj.title} source code on GitHub`}
          >
            <i className={`devicon-github-original ${styles.btnIcon}`} aria-hidden="true"></i> 
            <span className={styles.btnText}>GITHUB</span>
          </a>
          
          {proj.web !== "#" && (
            <a 
              href={proj.web} 
              target="_blank" 
              rel="noopener noreferrer" 
              className={`${styles.btn} ${styles.btnDemo}`}
              aria-label={`View live demo of ${proj.title}`}
            >
              <i className={`devicon-chrome-plain ${styles.btnIcon}`} aria-hidden="true"></i> 
              <span className={styles.btnText}>DEMO</span>
            </a>
          )}
        </div>
      </div>

      {/* Scroll Down Indicator */}
      {canScroll && (
        <div className={styles.scrollIndicator}>
          <span> SCROLL DOWN FOR LINKS</span>
        </div>
      )}
    </div>
  );
}

function Projects() {
  return (
    <div className={`page-container comic-panel ${styles.pageContainer}`}>
      <div className={styles.horizontalScrollContainer}>
        {projects.map((proj, index) => (
          <ProjectCard key={index} proj={proj} index={index} />
        ))}
      </div>
    </div>
  );
}

export default Projects;
