/**
 * DDO Connect - Workflow Orchestrator
 * 
 * Manages the validation lifecycle:
 * Reads configuration -> Validates -> Checks DDO app availability ->
 * If available, registers the project -> If unavailable, locks the viewport
 * and displays the premium download dashboard.
 */

class DDOConnectWorkflow {
  constructor(config, utils, ddoConnect) {
    this.config = config;
    this.utils = utils;
    this.ddoConnect = ddoConnect;
  }

  /**
   * Starts the validation workflow.
   */
  async run() {
    if (typeof window === 'undefined') return;

    this.utils.log("Initializing workflow validation...", "info");

    // 1. Check if connect module is globally enabled
    if (this.config.ENABLE_DDO_CONNECT === false) {
      this.utils.log("DDO Connect validation skipped (ENABLE_DDO_CONNECT: false).", "warn");
      return;
    }

    // 2. Validate configuration parameters
    if (!this.config.PROJECT_ID || !this.config.PROJECT_NAME || !this.config.PROJECT_URL) {
      this.utils.log("Invalid configuration parameters inside config.js. Core fields missing.", "error");
      return;
    }

    // 3. Attempt connection to DDO App
    const isAppAvailable = await this.ddoConnect.pingDDOApp();

    if (isAppAvailable) {
      this.utils.log("Verification checks passed! Access granted.", "success");
      // DDO App decides how to open or load the project, we let the app run
      return;
    }

    // 4. Block UI and display download dashboard
    this.utils.log("DDO App is not active. Showing official Download screen.", "error");
    this.showBlockScreen();
  }

  /**
   * Locks user view and serves the black download panel.
   */
  showBlockScreen() {
    // Inject the CSS styling properties
    this.utils.injectStyles();

    // Create container overlay
    const overlay = document.createElement('div');
    overlay.className = 'ddo-blocker-overlay';
    
    overlay.innerHTML = `
      <div class="ddo-logo-container">
        ${this.utils.getHorseLogoSVG()}
      </div>
      <h1 class="ddo-title">Download DDO App</h1>
      <p class="ddo-description">
        This project is part of the DDO Platform. Install the DDO App to continue.
      </p>
      <button class="ddo-btn" id="ddo-download-btn">
        <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3"/>
        </svg>
        Download DDO App
      </button>
      <div class="ddo-footer-info">DDO-TECH PLATFORM &bull; ${this.config.PROJECT_NAME}</div>
    `;

    // Append to body element
    document.body.appendChild(overlay);

    // Fade overlay in smoothly
    setTimeout(() => {
      overlay.classList.add('active');
    }, 50);

    // Disable viewport scrolling
    document.body.style.overflow = 'hidden';
    document.body.style.height = '100vh';

    // Disable other page elements so they do not flash or load in background
    const children = Array.from(document.body.children);
    children.forEach((child) => {
      if (child !== overlay && child.tagName !== 'SCRIPT' && child.tagName !== 'STYLE') {
        child.style.setProperty('display', 'none', 'important');
      }
    });

    // Hook click handler
    document.getElementById('ddo-download-btn').addEventListener('click', () => {
      // 1. Try custom deep link scheme
      this.ddoConnect.launchCustomScheme();
      
      // 2. Fallback to download web page redirect after brief launch period
      setTimeout(() => {
        window.open('https://ddo-tech.com/app', '_blank');
      }, 1000);
    });
  }
}

// Universal module definition (UMD) support
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { DDOConnectWorkflow };
} else if (typeof window !== 'undefined') {
  window.DDOConnectWorkflow = DDOConnectWorkflow;
}
