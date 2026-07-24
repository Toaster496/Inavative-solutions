const { WebSocketServer } = require('ws');
const { createShellHandler } = require('./shell-handler');

const WS_PORT = 3001;

function startWsServer(onReady) {
  const wss = new WebSocketServer({ port: WS_PORT });

  wss.on('listening', () => {
    console.log(`[WS] WebSocket server listening on port ${WS_PORT}`);
    if (onReady) onReady();
  });

  wss.on('connection', (ws) => {
    console.log('[WS] Client connected');

    const shell = createShellHandler((data) => {
      try {
        ws.send(data);
      } catch (e) {
        // ignore
      }
    });

    ws.on('message', (data) => {
      const str = data.toString();
      const result = shell.feed(str);
      if (result === 'exit') {
        try {
          ws.send('\r\n\x1b[31mConnection closed.\x1b[0m\r\n');
          ws.close();
        } catch (e) {}
      }
    });

    ws.on('close', () => {
      console.log('[WS] Client disconnected');
    });

    ws.on('error', (err) => {
      console.error('[WS] Error:', err.message);
    });
  });

  return wss;
}

module.exports = { startWsServer };
