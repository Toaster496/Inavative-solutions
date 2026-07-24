const { Server } = require('ssh2');
const { createShellHandler } = require('./shell-handler');
const crypto = require('crypto');

const PORT = 2222;
const HOST = '127.0.0.1';
const DEMO_USER = 'demo';

function generateHostKey() {
  const { publicKey, privateKey } = crypto.generateKeyPairSync('rsa', {
    modulusLength: 2048,
    publicKeyEncoding: { type: 'spki', format: 'pem' },
    privateKeyEncoding: { type: 'pkcs8', format: 'pem' },
  });
  return privateKey;
}

function startSshServer(onReady) {
  const hostKey = generateHostKey();

  const server = new Server({
    hostKeys: [hostKey],
  }, (client) => {
    console.log('[SSH] Connection from', client._conn ? 'remote' : 'unknown');

    client.on('authentication', (ctx) => {
      const username = ctx.username;
      if (username !== DEMO_USER) {
        console.log('[SSH] Auth failed: unknown user', username);
        ctx.reject();
        return;
      }
      // Accept any auth method for demo
      if (ctx.method === 'password' || ctx.method === 'keyboard-interactive' || ctx.method === 'publickey') {
        ctx.accept();
        console.log('[SSH] Auth success:', username);
      } else {
        ctx.reject();
      }
    });

    client.on('ready', () => {
      console.log('[SSH] Client ready');

      client.on('session', (accept, reject) => {
        const session = accept();

        session.on('pty', (accept, reject, info) => {
          accept();
        });

        session.on('shell', (accept, reject) => {
          const stream = accept();
          let ended = false;

          const shell = createShellHandler((data) => {
            if (!ended) stream.write(data);
          });

          stream.on('data', (data) => {
            if (ended) return;
            const result = shell.feed(data.toString());
            if (result === 'exit') {
              ended = true;
              stream.exit(0);
              stream.end();
            }
          });

          stream.stderr.on('data', () => {});

          stream.on('close', () => {
            ended = true;
            console.log('[SSH] Session closed');
          });
        });
      });
    });

    client.on('close', () => {
      console.log('[SSH] Connection closed');
    });

    client.on('error', (err) => {
      console.error('[SSH] Client error:', err.message);
    });
  });

  server.listen(PORT, HOST, () => {
    console.log(`[SSH] Server listening on ${HOST}:${PORT}`);
    if (onReady) onReady();
  });

  return server;
}

module.exports = { startSshServer };
