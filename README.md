# 🦸‍♂️ Huỳnh Minh Trí - Comic Portfolio

Welcome to my personal portfolio! This project is a uniquely designed, interactive web application built with **React** and **Vite**. It breaks away from traditional portfolio formats by adopting a vibrant, comic-book-inspired aesthetic complete with dynamic layouts, scroll-triggered animations, and floating sticker effects.

## 🌟 Features

- **Comic-Book Aesthetics:** Features halftone patterns, speech bubbles, bold "Bangers" typography, and heavy drop shadows to simulate a real comic book.
- **Scroll-Snapping Navigation:** Smooth, chapter-by-chapter scrolling experience utilizing CSS `scroll-snap` (optimized for desktop).
- **Fully Responsive (Mobile-First Layout):** Ensures a flawless viewing experience across all devices, with intelligent stacking, scrollable text boxes, and adaptive viewport sizing on mobile (down to 320px).
- **Intersection Observer Animations:** Elements dynamically animate and reveal themselves as you scroll through the chapters.
- **Data-Driven Architecture:** All project portfolios, tool stacks, and contact information are cleanly abstracted into a central `portfolioData.js` file for easy updates.
- **Visitor Analytics:** Integrated with **Vercel Analytics** to track page views and audience insights invisibly.

---

## 🛠️ Tech Stack

- **Framework:** React 19 + Vite
- **Styling:** Vanilla CSS (CSS Modules for component scoping)
- **Icons:** Devicon
- **Tracking:** @vercel/analytics
- **Deployment:** Vercel

---

## 🏗️ Architecture & Diagrams

Below are the architectural diagrams outlining the structure and flow of the application.

### 1. Component Tree Diagram

This diagram visualizes the nested structure of our React components, from the root `App` container down to individual chapters.

```mermaid
graph TD
    A[App.jsx<br/>Root Container] --> B[Header.jsx<br/>Sticky Navigation]
    A --> C[main.main-content<br/>Scroll Container]
    
    C --> D[Overview.jsx<br/>Chapter 1]
    C --> E[CareerDrivers.jsx<br/>Chapter 2]
    C --> F[ToolsPage.jsx<br/>Chapter 3]
    C --> G[Projects.jsx<br/>Chapter 4]
    C --> H[Contact.jsx<br/>Chapter 5]

    G --> I[portfolioData.js<br/>Data Source]
    F --> I
    H --> I
    
    style A fill:#D9453F,stroke:#333,stroke-width:2px,color:#fff
    style B fill:#048ABF,stroke:#333,stroke-width:2px,color:#fff
    style C fill:#f9f9f9,stroke:#333,stroke-width:2px,color:#000
    style D fill:#F4ECD8,stroke:#333,stroke-width:2px,color:#000
    style E fill:#F4ECD8,stroke:#333,stroke-width:2px,color:#000
    style F fill:#F4ECD8,stroke:#333,stroke-width:2px,color:#000
    style G fill:#F4ECD8,stroke:#333,stroke-width:2px,color:#000
    style H fill:#F4ECD8,stroke:#333,stroke-width:2px,color:#000
    style I fill:#597332,stroke:#333,stroke-width:2px,color:#fff
```

### 2. Navigation Flow Diagram

Illustrates how users navigate between chapters, showing the interaction between manual scrolling, button clicks, and the Intersection Observer API triggering CSS animations.

```mermaid
stateDiagram-v2
    [*] --> App_Mount
    App_Mount --> IntersectionObserver_Init
    
    state "User Navigation" as Nav {
        Header_Click --> Smooth_Scroll_To_Section
        Mouse_Wheel_Scroll --> Snap_To_Next_Section
    }
    
    state "Scroll Observer" as Obs {
        Section_In_View --> Add_IsVisible_Class
        Add_IsVisible_Class --> Trigger_CSS_Animation
    }
    
    Nav --> Obs
```

### 3. Data Flow Diagram

Shows how static content is decoupled from presentation logic, mapping the flow from `portfolioData.js` to the respective pages.

```mermaid
graph LR
    subgraph Data Layer
        D1[(projects array)]
        D2[(frontendTools array)]
        D3[(backendTools array)]
        D4[(contactData array)]
    end

    subgraph Presentation Layer
        P1[Projects.jsx]
        P2[ToolsPage.jsx]
        P3[Contact.jsx]
    end

    D1 -->|import| P1
    D2 -->|import| P2
    D3 -->|import| P2
    D4 -->|import| P3
```

---

## 🚀 Getting Started

To run this project locally on your machine:

1. **Clone the repository**
   ```bash
   git clone https://github.com/MinhTriHuynh1003/comic-portfolio.git
   ```

2. **Navigate into the directory**
   ```bash
   cd comic-portfolio
   ```

3. **Install dependencies**
   ```bash
   npm install
   ```

4. **Start the development server**
   ```bash
   npm run dev
   ```
   *The server will typically start on `http://localhost:5173`.*

## 📬 Contact & Links
- **GitHub:** [MinhTriHuynh1003](https://github.com/MinhTriHuynh1003)
- Feel free to reach out via the channels listed in the Contact section of the portfolio!

## 📝 License
Created by Huỳnh Minh Trí. All rights reserved.
