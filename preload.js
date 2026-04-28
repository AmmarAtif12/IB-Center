// Preload script — runs as CommonJS in the renderer's sandboxed Node context.
// The React app uses localStorage directly so no IPC bridge is needed.
const { contextBridge } = require('electron');

// Expose a minimal version info object — useful for debugging.
contextBridge.exposeInMainWorld('electronAPI', {
  platform: process.platform,
});
