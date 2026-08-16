const { app, BrowserWindow } = require('electron');
const path = require('path');
// Start the Express server from the bundled server folder
function createWindow(){
  const win = new BrowserWindow({ width: 1200, height: 800, webPreferences: { nodeIntegration: false, contextIsolation: true } });
  const devUrl = 'http://localhost:5173';
  if (process.env.NODE_ENV === 'development'){
    win.loadURL(devUrl);
  } else {
    // In production the frontend is served by the local server; open its URL
    win.loadURL('http://localhost:4000');
  }
}

function startEmbeddedServer(){
  try{
    // require the server and start it in this process
    const serverModule = require(path.join(__dirname, '..', 'server', 'index.js'));
    if (serverModule && typeof serverModule.startServer === 'function'){
      serverModule.startServer();
    }
  }catch(e){
    console.error('Failed to start embedded server:', e);
  }
}

app.whenReady().then(()=>{
  startEmbeddedServer();
  createWindow();
});

app.on('window-all-closed', ()=>{ if (process.platform !== 'darwin') app.quit(); });
