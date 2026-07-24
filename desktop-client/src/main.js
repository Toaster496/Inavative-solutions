const { app, BrowserWindow, Tray, Menu, ipcMain, dialog } = require('electron');
const path = require('path');
const { spawn } = require('child_process');
const { HostDaemon } = require('./hostDaemon');

let sshServerProcess = null;

function startSshServer() {
  const serverDir = path.join(__dirname, '..', '..', 'server');
  try {
    sshServerProcess = spawn(process.execPath, [path.join(serverDir, 'start.js')], {
      cwd: serverDir,
      stdio: 'pipe',
    });
    sshServerProcess.stdout.on('data', (data) => {
      console.log(`[SSH Server] ${data}`);
    });
    sshServerProcess.stderr.on('data', (data) => {
      console.error(`[SSH Server] ${data}`);
    });
    sshServerProcess.on('error', (err) => {
      console.error('[SSH Server] Failed to start:', err.message);
    });
    sshServerProcess.on('exit', (code) => {
      console.log(`[SSH Server] Exited with code ${code}`);
      sshServerProcess = null;
    });
    console.log('[SSH Server] Starting...');
  } catch (err) {
    console.error('[SSH Server] Error starting:', err.message);
  }
}

function stopSshServer() {
  if (sshServerProcess) {
    sshServerProcess.kill();
    sshServerProcess = null;
    console.log('[SSH Server] Stopped');
  }
}

let mainWindow;
let tray = null;
let hostDaemon = null;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 900,
    minHeight: 600,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js')
    },
    icon: path.join(__dirname, 'icon.png'),
    titleBarStyle: 'hiddenInset',
    show: true
  });

  mainWindow.loadFile('index.html');
  
  // Open DevTools in development
  if (process.env.NODE_ENV === 'development') {
    mainWindow.webContents.openDevTools();
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  // Handle minimize to tray
  mainWindow.on('minimize', (event) => {
    event.preventDefault();
    mainWindow.hide();
    if (process.platform !== 'darwin') {
      tray.displayBalloon({
        title: 'ComputeMarket Host',
        content: 'Running in background. Right-click tray icon to restore.'
      });
    }
  });

  mainWindow.on('restore', () => {
    mainWindow.show();
  });
}

function createTray() {
  const iconPath = path.join(__dirname, 'icon.png');
  tray = new Tray(iconPath || path.join(__dirname, 'tray-icon.png'));
  
  const contextMenu = Menu.buildFromTemplate([
    {
      label: 'Show Dashboard',
      click: () => {
        mainWindow.show();
        mainWindow.focus();
      }
    },
    {
      label: 'Start/Stop Hosting',
      click: async () => {
        if (hostDaemon && hostDaemon.isRunning()) {
          await hostDaemon.stop();
        } else {
          await hostDaemon.start();
        }
        updateTrayStatus();
      }
    },
    { type: 'separator' },
    {
      label: 'Quit',
      click: () => {
        app.quit();
      }
    }
  ]);
  
  tray.setToolTip('ComputeMarket Host');
  tray.setContextMenu(contextMenu);
  
  tray.on('double-click', () => {
    mainWindow.show();
    mainWindow.focus();
  });
}

function updateTrayStatus() {
  if (!tray) return;
  
  const isRunning = hostDaemon && hostDaemon.isRunning();
  tray.setToolTip(`ComputeMarket Host - ${isRunning ? 'Active' : 'Stopped'}`);
}

async function initializeHostDaemon() {
  try {
    // Load configuration from store
    const config = {
      walletPrivateKey: process.env.HOST_WALLET_PRIVATE_KEY || '',
      marketplaceAddress: process.env.MARKETPLACE_ADDRESS || '',
      coinAddress: process.env.COMPUTE_COIN_ADDRESS || '',
      rpcUrl: process.env.RPC_URL || 'https://data-seed-preload1-s1.bscnode.com/',
      gpuId: process.env.GPU_ID || '0',
      maxPricePerHour: process.env.MAX_PRICE_PER_HOUR || '10',
      autoAcceptJobs: process.env.AUTO_ACCEPT_JOBS === 'true' || false
    };
    
    hostDaemon = new HostDaemon(config);
    
    // IPC handlers for renderer communication
    ipcMain.handle('get-host-status', async () => {
      return {
        isRunning: hostDaemon.isRunning(),
        peerId: hostDaemon.getPeerId(),
        activeJob: hostDaemon.getActiveJob(),
        earnings: hostDaemon.getEarnings(),
        gpuInfo: hostDaemon.getGpuInfo()
      };
    });
    
    ipcMain.handle('start-hosting', async () => {
      await hostDaemon.start();
      updateTrayStatus();
      return { success: true };
    });
    
    ipcMain.handle('stop-hosting', async () => {
      await hostDaemon.stop();
      updateTrayStatus();
      return { success: true };
    });
    
    ipcMain.handle('update-config', async (event, newConfig) => {
      await hostDaemon.updateConfig(newConfig);
      return { success: true };
    });
    
    ipcMain.handle('get-logs', async () => {
      return hostDaemon.getLogs();
    });
    
    ipcMain.handle('withdraw-earnings', async () => {
      return await hostDaemon.withdrawEarnings();
    });
    
  } catch (error) {
    console.error('Failed to initialize host daemon:', error);
    dialog.showErrorBox('Initialization Error', error.message);
  }
}

app.whenReady().then(async () => {
  startSshServer();
  createTray();
  await initializeHostDaemon();
  createWindow();
});

app.on('window-all-closed', (event) => {
  event.preventDefault();
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// Cleanup on quit
app.on('will-quit', async () => {
  stopSshServer();
  if (hostDaemon) {
    await hostDaemon.stop();
  }
});
