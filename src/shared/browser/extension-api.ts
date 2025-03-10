/**
 * Extension API Utility
 * 
 * Provides access to browser extension APIs in a cross-browser compatible way.
 * Supports Chrome, Firefox, and other browsers implementing the WebExtension API.
 */

// Get the appropriate browser extension API object based on environment
export const getExtensionApi = () => {
  // Use chrome as the default if available
  if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.id) {
    return chrome;
  }
  
  // Use browser as a fallback (Firefox)
  if (typeof browser !== 'undefined') {
    return browser;
  }
  
  // Fallback to a mock object for testing or unsupported environments
  console.warn('Browser extension API not found! Using mock implementation.');
  return {
    storage: {
      local: {
        get: async (key: string) => {
          console.warn(`Mock storage.local.get called for key: ${key}`);
          return {};
        },
        set: async (data: Record<string, any>) => {
          console.warn(`Mock storage.local.set called with:`, data);
          return {};
        }
      }
    },
    runtime: {
      id: 'mock-extension-id',
      sendMessage: async (message: any) => {
        console.warn('Mock runtime.sendMessage called with:', message);
      },
      onMessage: {
        addListener: (callback: (message: any) => void) => {
          console.warn('Mock onMessage.addListener called');
        }
      }
    }
  };
};

// Define global browser type for TypeScript
declare global {
  interface Window {
    browser?: any;
  }
  
  var browser: any;
}

// Export the direct browser object for immediate use
export const browserApi = getExtensionApi(); 