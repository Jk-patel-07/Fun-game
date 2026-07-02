/**
 * DDO Connect - Auto-Startup Launcher
 * 
 * Automatically initializes and runs the DDO Connect workflow when loaded.
 * Supports dynamic client-side loading of scripts to allow single-line HTML integration:
 * <script src="/ddo_connect/launcher.js"></script>
 */

(async () => {
  if (typeof window === 'undefined') return;

  // Helper to load external script files dynamically
  const loadScript = (src) => {
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = src;
      script.async = false; // Maintain execution order
      script.onload = () => resolve();
      script.onerror = () => reject(new Error(`Failed to load script: ${src}`));
      document.head.appendChild(script);
    });
  };

  // Determine base path of the launcher script
  const getBasePath = () => {
    const currentScript = document.currentScript;
    if (currentScript && currentScript.src) {
      return currentScript.src.substring(0, currentScript.src.lastIndexOf('/') + 1);
    }
    return '/ddo_connect/'; // Default fallback
  };

  const basePath = getBasePath();

  try {
    // 1. Dynamic Dependency loading (if loaded directly in browser script tag)
    if (!window.DDO_CONFIG) {
      await loadScript(`${basePath}config.js`);
    }
    if (!window.DDO_UTILS) {
      await loadScript(`${basePath}utils.js`);
    }
    if (!window.DDOConnect) {
      await loadScript(`${basePath}ddo_connect.js`);
    }
    if (!window.DDOConnectWorkflow) {
      await loadScript(`${basePath}workflow.js`);
    }

    // 2. Initialize and Boot SDK components
    const config = window.DDO_CONFIG;
    const utils = window.DDO_UTILS;
    const ddoConnect = new window.DDOConnect(config, utils);
    const workflow = new window.DDOConnectWorkflow(config, utils, ddoConnect);

    // 3. Launch verification orchestrator
    // Run after DOM has loaded to ensure body element is ready for overlay injection
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => workflow.run());
    } else {
      workflow.run();
    }

  } catch (error) {
    console.error('[DDO Connect] Launcher initialization failed:', error.message);
  }
})();
