/**
 * DDO Connect - Core SDK Communication Layer
 * 
 * Handles interaction with the DDO App desktop/mobile clients via
 * webview bridges, custom URL schemes, or local REST/WebSocket pings.
 * Ready for future extension (auth, analytics, push notifications).
 */

class DDOConnect {
  constructor(config, utils) {
    this.config = config;
    this.utils = utils;
    this.localPort = 23660; // Standard DDO Local Daemon Port
    this.localHost = '127.0.0.1';
  }

  /**
   * Checks if running inside the DDO App's built-in Webview.
   */
  isInsideDDOApp() {
    if (typeof window === 'undefined') return false;
    
    // 1. Direct user-agent check
    const ua = navigator.userAgent;
    if (ua.includes('DDOApp') || ua.includes('DDO-Client')) {
      return true;
    }

    // 2. Check for native script injection or bridge objects
    return (
      !!window.DDOBridge || 
      !!window.AndroidDDOBridge ||
      (window.webkit && window.webkit.messageHandlers && window.webkit.messageHandlers.DDOBridge)
    );
  }

  /**
   * Attempts to send project registration payload to DDO App.
   * Checks local REST daemon.
   */
  async pingDDOApp(timeoutMs = 1500) {
    if (!this.config.ENABLE_DDO_CONNECT) {
      this.utils.log("DDO Connect is disabled in config.", "warn");
      return true; // Bypass block when disabled
    }

    // If inside app container, communication is active via native bridge
    if (this.isInsideDDOApp()) {
      this.utils.log("Running inside native DDO App context.", "success");
      this.sendToNativeBridge({
        event: "project_active",
        data: this.getPayload()
      });
      return true;
    }

    // Otherwise, try to ping local DDO App running in background
    const pingUrl = `http://${this.localHost}:${this.localPort}/api/ping`;
    const registerUrl = `http://${this.localHost}:${this.localPort}/api/register`;

    try {
      this.utils.log(`Pinging local DDO App daemon at port ${this.localPort}...`, "info");
      
      const controller = new AbortController();
      const id = setTimeout(() => controller.abort(), timeoutMs);

      // Register project with local daemon
      const response = await fetch(registerUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(this.getPayload()),
        signal: controller.signal
      });

      clearTimeout(id);

      if (response.ok) {
        this.utils.log("Successfully connected and registered with local DDO App!", "success");
        return true;
      }
      
      throw new Error(`Server returned status ${response.status}`);
    } catch (err) {
      this.utils.log(`Local DDO App is not responding: ${err.message}`, "warn");
      return false;
    }
  }

  /**
   * Sends data to DDO native webview bridge.
   */
  sendToNativeBridge(payload) {
    try {
      if (window.DDOBridge && typeof window.DDOBridge.postMessage === 'function') {
        window.DDOBridge.postMessage(JSON.stringify(payload));
      } else if (window.AndroidDDOBridge && typeof window.AndroidDDOBridge.postMessage === 'function') {
        window.AndroidDDOBridge.postMessage(JSON.stringify(payload));
      } else if (window.webkit && window.webkit.messageHandlers && window.webkit.messageHandlers.DDOBridge) {
        window.webkit.messageHandlers.DDOBridge.postMessage(payload);
      } else {
        // Fallback standard CustomEvent for browser-based extensions
        const event = new CustomEvent('DDOConnectMessage', { detail: payload });
        window.dispatchEvent(event);
      }
    } catch (e) {
      this.utils.log("Failed to post message to native bridge: " + e.message, "error");
    }
  }

  /**
   * Generates project identification payload.
   */
  getPayload() {
    return {
      projectId: this.config.PROJECT_ID,
      projectName: this.config.PROJECT_NAME,
      projectUrl: this.config.PROJECT_URL,
      projectVersion: this.config.PROJECT_VERSION,
      currentUrl: typeof window !== 'undefined' ? window.location.href : '',
      timestamp: Date.now()
    };
  }

  /**
   * Launches DDO App using custom protocol scheme.
   */
  launchCustomScheme() {
    if (typeof window === 'undefined') return;
    
    const payload = encodeURIComponent(JSON.stringify(this.getPayload()));
    const schemeUrl = `ddo://open?payload=${payload}`;
    
    this.utils.log(`Attempting to launch DDO App via custom URL scheme: ${schemeUrl}`, "info");
    
    // standard iframe/location trigger
    window.location.href = schemeUrl;
  }

  // ==========================================
  // FUTURE-READY FEATURES (Extensibility Hooks)
  // ==========================================

  /**
   * FUTURE: Request user authentication from DDO App
   */
  async authenticateUser() {
    this.utils.log("FUTURE API: Requesting authentication from DDO...", "info");
    if (this.isInsideDDOApp()) {
      this.sendToNativeBridge({ event: "auth_request" });
    }
  }

  /**
   * FUTURE: Send push token for mobile apps
   */
  async sendPushToken(token) {
    this.utils.log("FUTURE API: Registering push token...", "info");
    if (this.isInsideDDOApp()) {
      this.sendToNativeBridge({ event: "push_token", token });
    }
  }

  /**
   * FUTURE: Record analytics event
   */
  trackEvent(eventName, eventData = {}) {
    this.utils.log(`FUTURE API: Track Event "${eventName}"`, "info", eventData);
    if (this.isInsideDDOApp()) {
      this.sendToNativeBridge({ event: "track_analytics", eventName, data: eventData });
    }
  }
}

// Universal module definition (UMD) support
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { DDOConnect };
} else if (typeof window !== 'undefined') {
  window.DDOConnect = DDOConnect;
}
