/**
 * DDO Connect - Project Configuration
 * 
 * Simply modify this file to configure DDO Connect for any project.
 */
const DDO_CONFIG = {
  // Unique identifier for the project
  PROJECT_ID: "fun-game",

  // Human-readable project name
  PROJECT_NAME: "Fun Game",

  // Deploy URL of the project
  PROJECT_URL: "https://fun-game-inky.vercel.app",

  // Current project version
  PROJECT_VERSION: "1.0.0",

  // Set to false to disable verification block screens in development
  ENABLE_DDO_CONNECT: true
};

// Universal module definition (UMD) support
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { DDO_CONFIG };
} else if (typeof window !== 'undefined') {
  window.DDO_CONFIG = DDO_CONFIG;
}
