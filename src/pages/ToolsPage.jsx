import { useEffect, useState } from 'react';
import '../index.css';
import styles from './ToolsPage.module.css';

import { frontendTools, backendTools } from '../data/portfolioData';

// ToolsPage component with mobile responsiveness support
function ToolsPage() {
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    // Trigger entrance animation
    setTimeout(() => setLoaded(true), 100);
  }, []);

  return (
    <div className={`comic-panel ${styles.container}`} data-loaded={loaded}>
      
      {/* BACKGROUND LAYERS */}
      <div className={styles.burstRed}></div>
      <div className={styles.burstOrange}></div>

      {/* LEFT SIDE: FRONT-END */}
      <div className={styles.sidePanel}>
        <h3 className={styles.headingFront}>FRONT-END</h3>
        
        {/* Front-end Character */}
        <img 
          src="/avatars/tad_sticker.png" 
          alt="Front-end Sorcerer" 
          className={styles.characterFront}
        />

        {/* Front-end Orbs */}
        <div>
          {frontendTools.map((tool, index) => (
            <div 
              key={index} 
              className={`${styles.magicOrb} ${styles.frontendOrb}`}
              style={{ 
                top: tool.top, 
                left: tool.left,
                backgroundColor: tool.bg,
                color: tool.bg, /* Used for box-shadow fallback */
                animationDelay: `${index * 0.4}s`
              }}
            >
              <i className={tool.icon}></i>
            </div>
          ))}
        </div>
      </div>

      {/* THE VS LIGHTNING BOLT DIVIDER */}
      <div className={styles.lightningDivider} aria-hidden="true">
        <svg preserveAspectRatio="none" viewBox="0 0 150 1000" className={styles.lightningSvg}>
          <path 
            d="M 90 -20 L 40 500 L 80 500 L 30 1020 L 50 1020 L 100 500 L 60 500 L 110 -20 Z" 
            fill="#fff" 
            stroke="var(--color-dark)" 
            strokeWidth="6" 
            strokeLinejoin="round"
          />
        </svg>
      </div>

      {/* VS BADGE */}
      <div className={styles.vsBadge} aria-hidden="true">
        <span className={styles.vsText}>
          VS
        </span>
      </div>

      {/* RIGHT SIDE: BACK-END */}
      <div className={styles.sidePanel}>
        <h3 className={styles.headingBack}>BACK-END</h3>

        {/* Back-end Character */}
        <img 
          src="/avatars/taoanhdep_sticker_27960.png" 
          alt="Back-end Wizard" 
          className={styles.characterBack}
        />

        {/* Back-end Orbs */}
        <div>
          {backendTools.map((tool, index) => (
            <div 
              key={index} 
              className={`${styles.magicOrb} ${styles.backendOrb}`}
              style={{ 
                top: tool.top, 
                right: tool.right,
                backgroundColor: tool.bg,
                color: tool.bg, /* Used for box-shadow fallback */
                animationDelay: `${index * 0.5}s`
              }}
            >
              <i className={tool.icon}></i>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}

export default ToolsPage;
