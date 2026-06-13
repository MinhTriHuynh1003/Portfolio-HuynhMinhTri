import { useRef, useState, useEffect } from 'react';
import '../index.css';
import styles from './Overview.module.css';

function Overview() {
  const contentRef = useRef(null);
  const [canScroll, setCanScroll] = useState(false);

  const checkScroll = () => {
    if (contentRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = contentRef.current;
      setCanScroll(scrollHeight > clientHeight && Math.ceil(scrollTop + clientHeight) < scrollHeight - 5);
    }
  };

  useEffect(() => {
    checkScroll();
    window.addEventListener('resize', checkScroll);
    return () => window.removeEventListener('resize', checkScroll);
  }, []);

  return (
    <div className={styles.container}>
      {/* Text Content */}
      <div className={styles.textContentWrapper}>
        <div className={styles.textContent} ref={contentRef} onScroll={checkScroll}>
          <h1 className={styles.heading}>HELLO WORLD!</h1>
          <h2 className={styles.subheading}>
            I'm Huỳnh Minh Trí, <span className={styles.highlightText}>Your Friendly Neighborhood Developer!</span>
          </h2>
          
          <div className={`speech-bubble ${styles.bubble}`}>
            <h3 className={styles.bubbleHeading}>ABOUT ME</h3>
            <p className={styles.bubbleText}>
              I am an energetic Software Engineer who believes that the best systems are built on resilient code and even stronger human connections. While my technical expertise lies in architecting scalable backends and cloud infrastructures, my true superpower is communication.
            </p>
            <p className={styles.bubbleText}>
              As a proud member of the LGBT+ community, I deeply value diverse perspectives and inclusive environments. I approach every technical challenge with a collaborative mindset, always striving to ensure that the tech we build is not only highly efficient but also empathetic and user-centric.
            </p>
          </div>

          <div className={`comic-panel ${styles.panel}`}>
            <h3 className={styles.panelHeading}>VIBE CHECK</h3>
            <p className={styles.panelText}>
              Outgoing, highly communicative, and always ready for a team brainstorm! I believe that writing exceptional code is just like creating a great comic book: it needs a well-structured plot, a vibrant cast of characters (my teammates), and the courage to show your true colors. 
            </p>
            <p className={styles.panelText}>
              Whether I am debugging complex microservices or presenting a new system architecture, I bring my authentic self to the table—fueled by coffee, creativity, and a genuine drive to connect. 🚀✨
            </p>
          </div>
        </div>

        {/* Scroll Down Indicator */}
        {canScroll && (
          <div className={styles.scrollIndicator}>
            <span>👇 SCROLL TO READ MORE</span>
          </div>
        )}
      </div>

      {/* 2 Big Stickers with Rainbow Sticker Background (Magazine Style) */}
      <div className={styles.imageContainer}>
        
        {/* Rainbow Sticker Image Background with Halftone */}
        <div className={`halftone-overlay ${styles.halftoneOverlay}`}>
          <img 
            src="/stickers/rainbow.svg" 
            alt="Rainbow Background" 
            className={styles.rainbowBg}
          />
        </div>

        {/* Sticker 1 (PNG with transparency) */}
        <div className={styles.sticker1}>
          <img 
            src="/avatars/taoanhdep_sticker_1.png" 
            alt="Sticker 1" 
          />
        </div>

        {/* Sticker 2 (PNG with transparency) */}
        <div className={styles.sticker2}>
          <img 
            src="/avatars/taoanhdep_sticker_95666.png" 
            alt="Sticker 2" 
          />
        </div>

      </div>
    </div>
  );
}

export default Overview;
