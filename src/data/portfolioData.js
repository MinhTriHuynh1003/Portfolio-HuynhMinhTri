export const projects = [
  {
    title: "Global Security Intelligence",
    role: "Full-Stack Software Engineer",
    tech: "React 19, Java 21, FastAPI, Azure",
    desc: "Processed 181,691+ events via bottom-up ETL computation, reducing query latency to <300ms. Created automated PowerShell deployment scripts.",
    color: "var(--color-success)",
    img: "/projects/Datamining.png",
    github: "https://github.com/MinhTriHuynh1003/Global-Security-Risk-Intelligence-Platform.git",
    web: "https://stgtdplatform-secondary.z7.web.core.windows.net/"
  },
  {
    title: "Deepfake Detection Platform",
    role: "Software Engineer (Backend)",
    tech: "Java Spring Boot, React, Azure",
    desc: "Deployed production-grade microservices for real-time identity verification. Handled 3,810+ images with 94.55% detection accuracy and 0 OOM crashes.",
    color: "var(--color-secondary)",
    img: "/projects/Deeplearning.png",
    github: "https://github.com/MinhTriHuynh1003/Deepfake-Detection-Face-Anti-Spoofing-Platform.git",
    web: "#"
  },
  {
    title: "Surface Defect Detection",
    role: "Computer Vision / AI Engineer",
    tech: "Python, OpenCV, Scikit-learn",
    desc: "Architected A/B Testing pipeline to detect defects with Latency < 1.5s/img. Optimized SVM model achieving 76.34% Accuracy and 55.3 FPS inference speed.",
    color: "var(--color-primary)",
    img: "/projects/ComputerVision.png",
    github: "https://github.com/NgocHuyen2309/Surface_Defect_Detection_System.git",
    web: "https://fabricfrontend2309.z7.web.core.windows.net/"
  },
  {
    title: "Hexashop E-Commerce",
    role: "Full-Stack & DevOps",
    tech: "Java 21, Spring Boot 3, ReactJS",
    desc: "Built a stateless authentication system (JWT). Deployed Azure Virtual Network architecture securing DB from public internet with 100% test pass rate.",
    color: "var(--pride-orange)",
    img: "/projects/E-Commerce.png",
    github: "https://github.com/MinhTriHuynh1003/E-Commerce-Website.git",
    web: "https://hexashopfrontend.z29.web.core.windows.net/"
  }
];

export const frontendTools = [
  { icon: 'devicon-html5-plain', bg: '#E34F26', top: '10%', left: '55%' },
  { icon: 'devicon-css3-plain', bg: '#1572B6', top: '28%', left: '68%' },
  { icon: 'devicon-javascript-plain', bg: '#F7DF1E', top: '46%', left: '78%' },
  { icon: 'devicon-react-original', bg: '#61DAFB', top: '64%', left: '68%' },
  { icon: 'devicon-tailwindcss-original', bg: '#06B6D4', top: '82%', left: '55%' },
];

export const backendTools = [
  { icon: 'devicon-java-plain', bg: '#007396', top: '10%', right: '55%' },
  { icon: 'devicon-spring-original', bg: '#6DB33F', top: '28%', right: '68%' },
  { icon: 'devicon-python-plain', bg: '#3776AB', top: '46%', right: '78%' },
  { icon: 'devicon-nodejs-plain', bg: '#339933', top: '64%', right: '68%' },
  { icon: 'devicon-postgresql-plain', bg: '#336791', top: '82%', right: '55%' },
];

export const skillCategories = [
  { title: "FRONTEND", color: "var(--color-primary)", skills: ["React 19", "Vite", "TailwindCSS", "Next.js"] },
  { title: "BACKEND", color: "var(--color-secondary)", skills: ["Java 21 LTS", "Spring Boot 3", "Python", "FastAPI"] },
  { title: "DEVOPS & CLOUD", color: "var(--color-success)", skills: ["Microsoft Azure", "Nginx", "Docker", "CI/CD"] },
  { title: "AI / ML", color: "var(--pride-purple)", skills: ["OpenCV", "Scikit-Learn", "XGBoost", "Data Mining"] }
];

export const contactData = [
  { platform: "Facebook", link: "https://www.facebook.com/tri.huynhminh.75033149/", icon: "devicon-facebook-plain", text: "Huỳnh Minh Trí" },
  { platform: "Github", link: "https://github.com/MinhTriHuynh1003", icon: "devicon-github-original", text: "MinhTriHuynh1003" },
  { platform: "Linkedin", link: "https://www.linkedin.com/in/trihuynhminh-d1003y2005/", icon: "devicon-linkedin-plain", text: "trihuynhminh" },
  { platform: "Phone", link: "tel:+84974934726", icon: "devicon-android-plain", text: "+84 974934726", color: "var(--color-success)" },
  { platform: "Email", link: "mailto:tri.minhhuynh.05@gmail.com", icon: "devicon-google-plain", text: "tri.minhhuynh.05@gmail.com", color: "var(--color-primary)" }
];
