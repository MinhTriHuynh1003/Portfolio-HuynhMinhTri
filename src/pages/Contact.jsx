import styles from './Contact.module.css';
import { contactData } from '../data/portfolioData';

function Contact() {
  return (
    <div className={styles.container}>
      <div className={`comic-panel ${styles.panel}`}>
        
        {/* Character Image as a Sticker on top right */}
        <img 
          src="/avatars/taoanhdep_sticker_47426.png" 
          alt="Contact Me" 
          className={styles.characterImg}
        />

        <h2 className={styles.heading}>LET'S CONNECT!</h2>
        <p className={styles.description}>
          Ready to build something amazing, or just want to chat about tech, comics, and coffee? Drop me a message through any of the channels below!
        </p>
        
        <div className={styles.contactList}>
          {contactData.map((item, index) => (
            <a 
              key={index} 
              href={item.link} 
              target="_blank" 
              rel="noopener noreferrer"
              className={`comic-button ${styles.contactItem}`}
            >
              <div className={styles.iconWrapper} style={item.color ? { backgroundColor: item.color } : {}}>
                <i className={`${item.icon} ${styles.icon}`}></i>
              </div>
              <div className={styles.platformInfo}>
                <span className={styles.platformName}>{item.platform}</span>
                <span className={styles.platformLink}>{item.text}</span>
              </div>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Contact;
