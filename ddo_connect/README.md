# DDO Connect SDK

A modular, plug-and-play SDK to connect any DDO-Tech project with the DDO App ecosystem. 

When a user visits your project, DDO Connect automatically verifies connection with the native DDO App. If the app is active, it registers the project parameters; if the DDO App is unavailable, the SDK displays a premium black overlay to block the website and serves the official DDO App download portal.

---

## 🚀 How to Integrate

Integrating DDO Connect takes less than 2 minutes and requires zero complex code configurations.

### Step 1: Copy Folder
Copy the entire `ddo_connect` directory into your project repository.
- For **Vanilla HTML/JS or static sites**: Place it anywhere in your static assets folder (e.g., public root).
- For **Modern frameworks (Next.js, Vite, Nuxt)**: Place it inside your static directory (e.g. `public/ddo_connect`).

### Step 2: Configure config.js
Open [config.js](file:///c:/Users/kothi/OneDrive/Desktop/Maths%20game/ddo_connect/config.js) and modify **only** the following metadata variables:

```javascript
const DDO_CONFIG = {
  PROJECT_ID: "your-project-id",        // Unique lower-case slug (e.g., "weather", "maps")
  PROJECT_NAME: "Your Project Name",    // Display name (e.g., "DDO Maps")
  PROJECT_URL: "https://your-app.com",  // Live deployment address
  PROJECT_VERSION: "1.0.0",             // Current version
  ENABLE_DDO_CONNECT: true              // Set to false during local development/debugging
};
```

### Step 3: Load the Script
Load the auto-startup launcher script at the very top of your document (inside `<head>` or as the first element inside `<body>`).

#### In HTML/JS Projects:
```html
<!-- Include DDO Connect SDK Launcher -->
<script src="/ddo_connect/launcher.js"></script>
```

#### In Next.js (inside layout.js):
```javascript
import Script from 'next/script';

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <Script src="/ddo_connect/launcher.js" strategy="beforeInteractive" />
      </head>
      <body>
        {children}
      </body>
    </html>
  );
}
```

---

## 🛠️ Architecture and File Modules

The SDK is divided into clean, decoupled files:

- **`config.js`**: User-defined config settings. Keeps project data separate from business logic.
- **`utils.js`**: Platform, WebView, and OS detection helpers, CSS injection rules, and the premium SVG DDO Horse Logo asset.
- **`ddo_connect.js`**: Low-level communication layer. Pings local REST daemon ports, manages Webview postMessage API bridges, and executes custom scheme actions.
- **`workflow.js`**: High-level lifecycle orchestrator. Determines authorization flow and renders blocker cards.
- **`launcher.js`**: Entry loader. Dynamically discovers script base directory, fetches dependencies sequentially, and boots up on DOM ready.

---

## ⚡ Future-Proof Services
DDO Connect has been designed to support extension hooks out of the box. Future updates will seamlessly integrate:
- **Android App Links & iOS Universal Links**
- **Custom URI Scheme operations**
- **User Authentication / Account syncing**
- **Push Notification registrations**
- **Analytics event logging**
