const {
    contextBridge,
    ipcRenderer
} = require("electron");

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld(
    "api", {
        request: (channel, data) => {
            // whitelist channels
            let validChannels = ["clear", "toMain"];
            if (validChannels.includes(channel)) {
                ipcRenderer.send(channel, data);
            }
        },
        response: (channel, func) => {
            let validChannels = ["fromMain", "clear"];
            if (validChannels.includes(channel)) {
                // Deliberately strip event as it includes `sender` 
                ipcRenderer.on(channel, (event, ...args) => func(...args));
            }
        },
        removeListeners: () => {
            ipcRenderer.removeAllListeners()
        }
    }
);