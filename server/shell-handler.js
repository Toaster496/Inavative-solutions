function createShellHandler(onData) {
  let buffer = '';
  let cmdHistory = [];
  let cmdIdx = -1;
  let state = 'welcome';

  const MOTD = [
    '',
    '\x1b[32m  ╔══════════════════════════════════════════════════╗\x1b[0m',
    '\x1b[32m  ║     COMPUTEMARKET NODE — SSH GATEWAY v2.4       ║\x1b[0m',
    '\x1b[32m  ╠══════════════════════════════════════════════════╣\x1b[0m',
    '\x1b[32m  ║  GPU: NVIDIA RTX 4090 x1   VRAM: 24GB GDDR6X  ║\x1b[0m',
    '\x1b[32m  ║  CPU: AMD EPYC 9654 96C/192T  RAM: 64GB       ║\x1b[0m',
    '\x1b[32m  ║  UPTIME: 14d 8h 32m                           ║\x1b[0m',
    '\x1b[32m  ║  LOAD: 0.42 0.38 0.25                          ║\x1b[0m',
    '\x1b[32m  ╚══════════════════════════════════════════════════╝\x1b[0m',
    '',
    '\x1b[33mWelcome to ComputeMarket Demo SSH Shell\x1b[0m',
    '\x1b[33mType "help" for available commands or "exit" to disconnect.\x1b[0m',
    '',
  ];

  const PROMPT = '\x1b[32mdemo@compute\x1b[0m:\x1b[36m~\x1b[0m$ ';

  const OUTPUTS = {
    help: [
      '\x1b[32mAvailable commands:\x1b[0m',
      '  \x1b[33mnvidia-smi\x1b[0m     Show NVIDIA GPU status',
      '  \x1b[33mdocker ps\x1b[0m       List running containers',
      '  \x1b[33mhtop\x1b[0m            Process viewer (simulated)',
      '  \x1b[33mjobs\x1b[0m            List active compute jobs',
      '  \x1b[33mclear\x1b[0m           Clear terminal',
      '  \x1b[33mexit / logout\x1b[0m    Disconnect',
      '  \x1b[33mwhoami\x1b[0m          Show current user',
      '  \x1b[33mdate\x1b[0m            Show current date/time',
      '  \x1b[33muname -a\x1b[0m        Show system info',
      '  \x1b[33mls\x1b[0m              List workspace files',
      '  \x1b[33mdf -h\x1b[0m           Show disk usage',
      '  \x1b[33mfree -h\x1b[0m         Show memory usage',
    ],
    'nvidia-smi': [
      '\x1b[32mNVIDIA-SMI 535.129.03   Driver Version: 535.129.03   CUDA Version: 12.2\x1b[0m',
      '',
      '\x1b[36mGPU 0: NVIDIA RTX 4090\x1b[0m',
      '  Utilization:    \x1b[33m64%\x1b[0m',
      '  Memory Used:    \x1b[33m12045 / 24564 MiB\x1b[0m',
      '  Temp:           \x1b[32m42\x1b[0m\xc2\xb0C',
      '  Power:          \x1b[32m65W / 450W\x1b[0m',
      '  Processes:',
      '    PID 8294  python3 (llama-finetune)   12045 MiB',
    ],
    'docker ps': [
      '\x1b[32mCONTAINER ID   IMAGE                              STATUS          NAMES\x1b[0m',
      '\x1b[36m8f2c41e9d20c\x1b[0m   pytorch/pytorch:2.1.0-cuda12.1   \x1b[32mUp 2 hours\x1b[0m      \x1b[36mjob-8294-llama\x1b[0m',
      '\x1b[36ma7b19c2d1e0f\x1b[0m   nvidia/cuda:12.0-base            \x1b[32mUp 5 hours\x1b[0m      \x1b[36mjob-7741-docking\x1b[0m',
      '\x1b[36m3c8d772910ab\x1b[0m   stable-diffusion:webui            \x1b[32mUp 30 min\x1b[0m       \x1b[36mjob-8301-sd\x1b[0m',
      '\x1b[36mff108841ace0\x1b[0m   python:3.11-slim                  \x1b[32mUp 1 hour\x1b[0m       \x1b[36mjob-8210-whisper\x1b[0m',
    ],
    htop: [
      '\x1b[33m  CPU[\x1b[32m████████\x1b[33m░░░░░░░░░░░░]  42.3%\x1b[0m',
      '\x1b[36m  GPU[\x1b[32m████████████\x1b[36m░░░░░░░░]  64.2%\x1b[0m',
      '\x1b[32m  MEM[\x1b[33m████████\x1b[32m░░░░░░░░░░░░]  38.7%\x1b[0m',
      '',
      '  \x1b[37m  PID USER      CPU% MEM%   TIME+  COMMAND\x1b[0m',
      '  \x1b[33m 8294 demo      38.2 18.9  2:34.12 python3 (llama-finetune)\x1b[0m',
      '  \x1b[33m 7741 demo      24.5 38.7  5:12.08 python3 (molecular-dock)\x1b[0m',
      '  \x1b[33m 8301 demo      12.1 13.1  1:08.45 python3 (sd-batch)\x1b[0m',
      '  \x1b[33m 8210 demo       8.3  3.3  0:45.22 python3 (whisper)\x1b[0m',
    ],
    jobs: [
      '\x1b[32mActive compute jobs on this node:\x1b[0m',
      '',
      '  \x1b[36mJOB_8294_B\x1b[0m  Llama-3 Fine-tuning     \x1b[33m0.45 CPT/hr\x1b[0m  \x1b[32m[64%]\x1b[0m',
      '  \x1b[36mJOB_7741_A\x1b[0m  Molecular Docking       \x1b[33m1.20 CPT/hr\x1b[0m  \x1b[32m[12%]\x1b[0m',
      '  \x1b[36mJOB_8301_C\x1b[0m  Stable Diffusion Batch  \x1b[33m0.85 CPT/hr\x1b[0m  \x1b[32m[88%]\x1b[0m',
      '  \x1b[36mJOB_8210_A\x1b[0m  Whisper Transcription   \x1b[33m0.30 CPT/hr\x1b[0m  \x1b[32m[38%]\x1b[0m',
    ],
    whoami: ['\x1b[32mdemo\x1b[0m'],
    date: [`\x1b[32m${new Date().toUTCString()}\x1b[0m`],
    'uname -a': ['\x1b[32mLinux compute-alpha-92 6.5.0-14-generic #15-Ubuntu SMP PREEMPT_DYNAMIC x86_64 x86_64 x86_64 GNU/Linux\x1b[0m'],
    ls: [
      'workspace/',
      '\x1b[34mllama-finetune/\x1b[0m',
      '  config.yaml',
      '  dataset/',
      '    train.jsonl',
      '    val.jsonl',
      '\x1b[34msd-batch/\x1b[0m',
      '  prompts.txt',
      '  outputs/',
      '\x1b[34mmolecular-docking/\x1b[0m',
      '  protein.pdb',
      '  ligand.sdf',
      '\x1b[34mwhisper-transcribe/\x1b[0m',
      '  audio.mp3',
      '  transcript.txt',
    ],
    'df -h': [
      '\x1b[32mFilesystem      Size  Used Avail Use% Mounted on\x1b[0m',
      '/dev/nvme0n1p2   932G  284G  648G  31% /',
      '/dev/nvme1n1     3.5T  1.2T  2.3T  34% /data',
      'tmpfs            32G   2.1G   30G   7% /tmp',
    ],
    'free -h': [
      '\x1b[32m              total        used        free\x1b[0m',
      '\x1b[32mMem:           62Gi        24Gi        38Gi\x1b[0m',
      '\x1b[32mSwap:           8Gi       256Mi       7.8Gi\x1b[0m',
    ],
  };

  function showPrompt() {
    onData(PROMPT);
  }

  function writeln(line) {
    onData(line + '\r\n');
  }

  function processLine(input) {
    const trimmed = input.trim();

    if (!trimmed) {
      showPrompt();
      return 'continue';
    }

    cmdHistory.push(trimmed);
    cmdIdx = cmdHistory.length;

    const lower = trimmed.toLowerCase();

    if (lower === 'exit' || lower === 'logout') {
      writeln('\r\n\x1b[33m[ Logging out... ]\x1b[0m');
      writeln('\x1b[31mConnection to compute.market closed.\x1b[0m');
      return 'exit';
    }

    if (lower === 'clear') {
      // ANSI clear screen + cursor home
      onData('\x1b[2J\x1b[H');
      showPrompt();
      return 'continue';
    }

    const lines = OUTPUTS[lower];
    if (lines) {
      writeln('');
      lines.forEach(l => writeln(l));
      writeln('');
    } else {
      writeln(`\r\n\x1b[31mbash: ${trimmed.split(' ')[0]}: command not found\x1b[0m`);
      writeln(`\x1b[33mType 'help' for available commands.\x1b[0m\r\n`);
    }

    showPrompt();
    return 'continue';
  }

  // Send MOTD
  MOTD.forEach(l => writeln(l));
  showPrompt();

  return {
    feed(data) {
      for (let i = 0; i < data.length; i++) {
        const ch = data[i];
        const code = ch.charCodeAt ? ch.charCodeAt(0) : ch;

        if (code === 13 || code === 10) { // Enter
          writeln('');
          const result = processLine(buffer);
          buffer = '';
          if (result === 'exit') return 'exit';
        } else if (code === 127 || code === 8) { // Backspace
          if (buffer.length > 0) {
            buffer = buffer.slice(0, -1);
            onData('\b \b');
          }
        } else if (code === 27) { // Escape sequences (arrows, etc.)
          i++; // skip [
          const cmd = data[i + 1];
          if (cmd === 65 || cmd === 66) { // Up/Down arrows
            if (cmdHistory.length > 0) {
              if (cmd === 65) cmdIdx = Math.max(0, cmdIdx - 1);
              else if (cmd === 66) cmdIdx = Math.min(cmdHistory.length, cmdIdx + 1);
              const entry = cmdIdx < cmdHistory.length ? cmdHistory[cmdIdx] : '';
              buffer = entry;
              onData('\r\x1b[K' + PROMPT + ' ' + entry);
            }
            i++;
          } else {
            i++;
          }
        } else if (code === 9) { // Tab
          // ignore
        } else if (code === 3) { // Ctrl+C
          writeln('^C');
          buffer = '';
          showPrompt();
        } else if (ch.length === 1) {
          buffer += ch;
          onData(ch);
        }
      }
      return 'continue';
    },
    resize(cols, rows) {
      // no-op for simulated shell
    },
  };
}

module.exports = { createShellHandler };
