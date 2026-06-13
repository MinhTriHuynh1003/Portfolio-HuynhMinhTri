# Comic Portfolio Architecture Diagrams

Tài liệu này bao gồm các sơ đồ kiến trúc và luồng dữ liệu cho dự án Comic Portfolio, được thiết kế bằng Mermaid.js. Bạn có thể sử dụng các extension xem trước Mermaid (như Mermaid Preview trên VSCode) để xem hình ảnh trực quan.

## 1. Component Tree Diagram

Sơ đồ cây thể hiện cấu trúc lồng ghép của các thành phần giao diện (React Components).

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

## 2. Navigation Flow Diagram

Sơ đồ thể hiện cách người dùng điều hướng qua lại giữa các trang trong ứng dụng.

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

## 3. Data Flow Diagram

Sơ đồ thể hiện luồng dữ liệu truyền từ file dữ liệu tĩnh (portfolioData) đến các trang hiển thị.

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
