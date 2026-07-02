/**
 * DDO Connect - Utilities
 * 
 * Contains platform detection, logging utilities, dynamic DOM injection,
 * and SVG assets (DDO Horse Logo).
 */

const DDO_UTILS = {
  // Namespace logger
  log: (message, type = 'info', data = null) => {
    const prefix = '%c[DDO Connect]';
    const styles = {
      info: 'color: #3b82f6; font-weight: bold;',
      success: 'color: #10b981; font-weight: bold;',
      warn: 'color: #f59e0b; font-weight: bold;',
      error: 'color: #ef4444; font-weight: bold;'
    };
    
    if (data) {
      console.log(`${prefix} ${message}`, styles[type], data);
    } else {
      console.log(`${prefix} ${message}`, styles[type]);
    }
  },

  // Environment and Platform detection
  platform: {
    isBrowser: typeof window !== 'undefined',
    isMobile: () => /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent),
    isIOS: () => /iPhone|iPad|iPod/i.test(navigator.userAgent),
    isAndroid: () => /Android/i.test(navigator.userAgent),
    isWebView: () => {
      if (typeof window === 'undefined') return false;
      const ua = navigator.userAgent || navigator.vendor || window.opera;
      // Common WebView markers
      return (
        (ua.indexOf('FBAN') > -1) || // Facebook iOS
        (ua.indexOf('FBAV') > -1) || // Facebook Android
        (ua.indexOf('Instagram') > -1) || // Instagram
        (ua.indexOf('WebView') > -1) || // Generic Android WebView
        (ua.indexOf('wv') > -1) || // Generic Android WebView
        (ua.indexOf('MicroMessenger') > -1) || // WeChat
        // iOS WebView detection
        (navigator.standalone) || 
        (/iPhone|iPad|iPod/i.test(ua) && !/Safari/i.test(ua) && !/CriOS/i.test(ua) && !/FxiOS/i.test(ua))
      );
    }
  },

  // DDO SVG Horse Logo
  getHorseLogoSVG: () => `
    <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" width="96" height="96" style="color: #ffffff;">
      <!-- Elegant Minimalist Geometric Horse Head profile -->
      <path d="M22 82 L34 46 C37 38, 43 28, 52 24 L76 12 C82 9, 87 15, 84 21 L72 38 C69 43, 64 47, 58 48 L46 50 L42 82 Z" fill="currentColor" />
      <path d="M52 20 L64 6 L70 15 Z" fill="currentColor" />
      <circle cx="58" cy="30" r="3" fill="#000000" />
      <path d="M30 82 L42 82 M22 82 L26 86 L38 86" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
    </svg>
  `,

  // Inject CSS styles into document head
  injectStyles: () => {
    if (typeof document === 'undefined') return;
    
    const styleId = 'ddo-connect-styles';
    if (document.getElementById(styleId)) return;

    const style = document.createElement('style');
    style.id = styleId;
    style.textContent = `
      .ddo-blocker-overlay {
        position: fixed !important;
        top: 0 !important;
        left: 0 !important;
        width: 100vw !important;
        height: 100vh !important;
        background-color: #000000 !important;
        color: #ffffff !important;
        display: flex !important;
        flex-direction: column !important;
        justify-content: center !important;
        align-items: center !important;
        z-index: 9999999 !important;
        font-family: 'Outfit', 'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif !important;
        text-align: center !important;
        padding: 2rem !important;
        box-sizing: border-box !important;
        opacity: 0;
        transition: opacity 0.5s ease;
      }
      .ddo-blocker-overlay.active {
        opacity: 1;
      }
      .ddo-logo-container {
        margin-bottom: 2rem;
        background: linear-gradient(135deg, #1e1e1e, #111111);
        border: 1px solid rgba(255, 255, 255, 0.1);
        border-radius: 24px;
        padding: 1.5rem;
        box-shadow: 0 12px 40px rgba(0, 0, 0, 0.8), 0 0 1px 1px rgba(255, 255, 255, 0.15) inset;
        animation: ddo-logo-float 4s ease-in-out infinite alternate;
      }
      .ddo-title {
        font-size: 2.25rem !important;
        font-weight: 800 !important;
        margin-bottom: 0.75rem !important;
        letter-spacing: -0.5px !important;
        background: linear-gradient(45deg, #ffffff, #a3a3a3);
        -webkit-background-clip: text !important;
        -webkit-text-fill-color: transparent !important;
      }
      .ddo-description {
        font-size: 1.1rem !important;
        color: #a3a3a3 !important;
        max-width: 360px !important;
        margin-bottom: 2.5rem !important;
        line-height: 1.6 !important;
      }
      .ddo-btn {
        background-color: #ffffff !important;
        color: #000000 !important;
        border: none !important;
        border-radius: 14px !important;
        padding: 1rem 2.25rem !important;
        font-size: 1.1rem !important;
        font-weight: 700 !important;
        cursor: pointer !important;
        transition: transform 0.2s ease, box-shadow 0.2s ease !important;
        box-shadow: 0 8px 30px rgba(255, 255, 255, 0.15) !important;
        font-family: inherit !important;
        display: flex !important;
        align-items: center !important;
        gap: 0.75rem !important;
      }
      .ddo-btn:hover {
        transform: translateY(-2px) !important;
        box-shadow: 0 12px 35px rgba(255, 255, 255, 0.25) !important;
      }
      .ddo-btn:active {
        transform: translateY(0) !important;
      }
      .ddo-footer-info {
        position: absolute !important;
        bottom: 2rem !important;
        font-size: 0.8rem !important;
        color: #525252 !important;
        letter-spacing: 0.5px !important;
        text-transform: uppercase !important;
      }
      @keyframes ddo-logo-float {
        0% { transform: translateY(0); }
        100% { transform: translateY(-8px); }
      }
    `;
    document.head.appendChild(style);
  }
};

// Universal module definition (UMD) support
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { DDO_UTILS };
} else if (typeof window !== 'undefined') {
  window.DDO_UTILS = DDO_UTILS;
}
