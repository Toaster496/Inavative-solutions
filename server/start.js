const { startSshServer } = require('./ssh-server');
const { startWsServer } = require('./ws-server');

console.log('=== ComputeMarket Demo SSH Server ===');
console.log('Starting services...\n');

let sshReady = false;
let wsReady = false;

function checkAllReady() {
  if (sshReady && wsReady) {
    console.log('\n=== All services ready ===');
    console.log('  SSH server:  ssh demo@localhost -p 2222');
    console.log('  WebSocket:   ws://localhost:3001');
    console.log('');
    console.log('Press Ctrl+C to stop.\n');
  }
}

startSshServer(() => {
  sshReady = true;
  checkAllReady();
});

startWsServer(() => {
  wsReady = true;
  checkAllReady();
});

process.on('SIGINT', () => {
  console.log('\nShutting down...');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\nShutting down...');
  process.exit(0);
});
