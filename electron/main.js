const { app, BrowserWindow, Menu, ipcMain } = require('electron');
const path = require('path');
const url = require('url');

let mainWindow;

const createWindow = () => {

  
  mainWindow = new BrowserWindow({ width: 312, height: 493, show: false, resizable: false, webPreferences: {nodeIntegration: true, preload: path.join(__dirname, "/preload.js"), websecurity: false} });

  mainWindow.loadURL(
    !app.isPackaged
      ? process.env.ELECTRON_START_URL
      : url.format({
          pathname: path.join(__dirname, '../build/index.html'),
          protocol: 'file:',
          slashes: true,
        })
  );

  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  ipcMain.on("toMain", (event, args) => {
    // Do something with file contents

    // Send result back to renderer process
    mainWindow.webContents.send("fromMain", "hi");
  });

  var menu = Menu.buildFromTemplate([
    {label: "Edit", submenu: [{label: "Clear", click: ()=>mainWindow.webContents.send("clear", "dkodoqk")}]},
    {label: "View", submenu: [{role: "reload"},]},
    {label: "Window", submenu: [{role: "minimize"}, {role: "close"}]},
    ])

  Menu.setApplicationMenu(menu)

};

app.on('ready', createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow();
  }
});

