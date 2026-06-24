import '../index.css';
import styles from './CareerDrivers.module.css';

// CareerDrivers component with mobile responsiveness support
function CareerDrivers() {
  return (
    <div className={styles.container}>
      
      {/* The Comic Page (Container) */}
      <div className={styles.comicPage}>
        
        {/* Panel 1: Passion (Spans full height on the Left) */}
        <div className={`${styles.panelBase} ${styles.panelPassion}`}>
          {/* Image pushed to the bottom right */}
          <img 
            src="/avatars/z7928681969328_97c0fab93cf85b8b8745e904a041e490.jpg" 
            alt="Passion" 
            className={styles.imgPassion}
          />
          {/* Narrative Box */}
          <div className={styles.narrativeBoxPassion}>
            <h3 className={styles.headingPassion}>1. THE SPARK OF CREATION</h3>
            <p className={styles.text}>
              "Coding is boring? Hard pass. 💅 It’s the ultimate canvas where logic meets pure creativity. I absolutely live for being the 'invisible force', turning messy data into platforms that are serving flawless vibes. Nam mô a di đà phật! ✨"
            </p>
          </div>
        </div>

        {/* Panel 2: Skill (Top Right) */}
        <div className={`${styles.panelBase} ${styles.panelSkill}`}>
          {/* Background Image */}
          <img 
            src="/avatars/taoanhdep_sticker_24884.png" 
            alt="Skill" 
            className={styles.imgSkill}
          />
          {/* Narrative Box (Bottom Left) */}
          <div className={styles.narrativeBoxSkill}>
            <h3 className={styles.headingSkill}>2. SLAYING THE PUZZLE</h3>
            <p className={styles.text}>
              "To me, a complex backend is the biggest beefsteak waiting to be eaten 🍖. I thrive on untangling those deeply chaotic microservices. Turning a messy system into a sleek, high-performing architecture? It's giving flawless execution🔥"
            </p>
          </div>
        </div>

        {/* Panel 3: Growth (Bottom Right) */}
        <div className={`${styles.panelBase} ${styles.panelGrowth}`}>
          {/* Background Image */}
          <img 
            src="/avatars/taoanhdep_sticker_21590.png" 
            alt="Growth" 
            className={styles.imgGrowth}
          />
          {/* Narrative Box (Top Left) */}
          <div className={styles.narrativeBoxGrowth}>
            <h3 className={styles.headingGrowth}>3. UNSTOPPABLE GROWTH</h3>
            <p className={styles.text}>
              "Tech never sleeps, so my learning curve is giving vertical realness 📈. But coding isn't my solo era—it's a massive co-op slay. I bring my authentic, energetic vibe to the team because we only stan inclusive, welcoming tech. Let's GOOO! 🤝✨"
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}

export default CareerDrivers;
