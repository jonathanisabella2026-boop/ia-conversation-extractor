const { app, BrowserWindow, ipcMain, dialog, clipboard } = require('electron');
const path = require('path');
const fs = require('fs');

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1550,
    height: 980,
    minWidth: 1150,
    minHeight: 750,
    title: 'IA Extractor - DIGITAL SolutJon',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false
    },
    icon: path.join(__dirname, 'assets', 'icon.png'),
    show: false,
    backgroundColor: '#0b1120'
  });

  mainWindow.loadFile(path.join(__dirname, 'src', 'index.html'));

  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });

  // Uncomment for debugging:
  // mainWindow.webContents.openDevTools();
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});

// IPC Handlers
ipcMain.handle('clipboard-read', () => {
  return clipboard.readText();
});

ipcMain.handle('save-md', async (event, { content, defaultPath }) => {
  const { filePath, canceled } = await dialog.showSaveDialog(mainWindow, {
    defaultPath: defaultPath || 'extracto-conversacion.md',
    filters: [
      { name: 'Markdown', extensions: ['md'] },
      { name: 'Texto plano', extensions: ['txt'] },
      { name: 'Todos los archivos', extensions: ['*'] }
    ],
    properties: ['createDirectory', 'showOverwriteConfirmation']
  });

  if (canceled || !filePath) {
    return { success: false, canceled: true };
  }

  try {
    fs.writeFileSync(filePath, content, 'utf8');
    return { success: true, path: filePath };
  } catch (err) {
    return { success: false, error: err.message };
  }
});

// Auto-updater placeholder (optional)
// const { autoUpdater } = require('electron-updater');
// app.on('ready', () => autoUpdater.checkForUpdatesAndNotify());
