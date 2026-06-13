import '../index.css';
import styles from './Skills.module.css';

import { skillCategories } from '../data/portfolioData';

function Skills() {
  return (
    <div className={`page-container comic-panel ${styles.pageContainer}`}>
      
      <div className={styles.gridContainer}>
        {skillCategories.map((cat, index) => (
          <div 
            key={index} 
            className={`comic-panel ${styles.skillPanel}`} 
            style={{ '--cat-color': cat.color }}
          >
            
            {/* Comic Speech Bubble Tail */}
            <div className={styles.tailOuter}></div>
            <div className={styles.tailInner}></div>

            <h2 className={styles.categoryTitle}>
              {cat.title}
            </h2>
            
            <ul className={styles.skillList}>
              {cat.skills.map(skill => (
                <li key={skill} className={styles.skillItem}>
                  BANG! {skill}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Skills;
