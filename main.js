const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const isDev = !app.isPackaged;
const { spawn } = require('child_process');

let fastapiProcess = null;
let jsonrpcProcess = null;

function createWindow() {
  const win = new BrowserWindow({
    width: 900,
    height: 700,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
    },
  });

  win.loadURL(isDev ? 'http://localhost:3000' : `file://${path.join(__dirname, 'out/index.html')}`);
}

// IPC Handler (for IPC mode)
ipcMain.handle('run-python', async (event, args) => {
  return new Promise((resolve, reject) => {
    const exePath = isDev 
      ? path.join(__dirname, 'backend/script.py')
      : path.join(process.resourcesPath,'backend', 'script.exe');

    const proc = spawn(isDev ? 'python' : exePath, 
      isDev ? [exePath, JSON.stringify(args)] : [JSON.stringify(args)]);

    let output = '';
    proc.stdout.on('data', d => output += d.toString());
    proc.stderr.on('data', d => console.error(d.toString()));
    proc.on('close', code => code === 0 ? resolve(output.trim()) : reject('Python error'));
  });
});

// In production: ALWAYS start both FastAPI and JSON-RPC backends
app.whenReady().then(() => {
  if (!isDev) {
    // Start FastAPI
    const fastapiPath = path.join(process.resourcesPath, 'backend', 'fastapi_server.exe');
    fastapiProcess = spawn(fastapiPath);
    console.log('FastAPI backend started');

    // Start JSON-RPC
    const jsonrpcPath = path.join(process.resourcesPath, 'backend', 'jsonrpc_server.exe');
    jsonrpcProcess = spawn(jsonrpcPath);
    console.log('JSON-RPC backend started');
  }

  createWindow();
});

// Kill backends on close
app.on('window-all-closed', () => {
  if (fastapiProcess) fastapiProcess.kill();
  if (jsonrpcProcess) jsonrpcProcess.kill();
  if (process.platform !== 'darwin') app.quit();
});