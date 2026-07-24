import React, { useEffect, useRef, useState } from "react";
import { Terminal } from "@xterm/xterm";
import { FitAddon } from "@xterm/addon-fit";
import "@xterm/xterm/css/xterm.css";
import { Icon } from "../components/ui/Icon";

const DEMO_USER = "demo";
const DEMO_HOST = "localhost";
const DEMO_PORT = 2222;
const DEMO_PASSWORD = "••••••••";
const WS_URL = "ws://localhost:3001";

const SSH_INFO = {
  host: DEMO_HOST,
  port: DEMO_PORT,
  user: DEMO_USER,
  password: DEMO_PASSWORD,
  command: `ssh ${DEMO_USER}@${DEMO_HOST} -p ${DEMO_PORT}`,
};

const WELCOME_LINES_SIM = [
  "\x1b[32mWelcome to ComputeMarket Demo SSH Terminal\x1b[0m",
  "\x1b[33m[Simulated Mode] No real SSH connection available.\x1b[0m",
  "",
  `Connected to \x1b[36m${DEMO_HOST}\x1b[0m via port \x1b[36m${DEMO_PORT}\x1b[0m`,
  "Authenticated as \x1b[36m" + DEMO_USER + "\x1b[0m",
  "",
  "\x1b[32mLast login: " + new Date().toLocaleString() + " from 203.0.113.42\x1b[0m",
  "",
  "\x1b[36m  ╔══════════════════════════════════════════════════╗\x1b[0m",
  "\x1b[36m  ║  COMPUTEMARKET NODE: alpha-92                   ║\x1b[0m",
  "\x1b[36m  ║  GPU: NVIDIA RTX 4090 x1   VRAM: 24GB GDDR6X  ║\x1b[0m",
  "\x1b[36m  ║  CPU: AMD EPYC 9654 96C/192T  RAM: 64GB       ║\x1b[0m",
  "\x1b[36m  ║  UPTIME: 14d 8h 32m                           ║\x1b[0m",
  "\x1b[36m  ║  LOAD: 0.42 0.38 0.25                          ║\x1b[0m",
  "\x1b[36m  ╚══════════════════════════════════════════════════╝\x1b[0m",
  "",
  "Available commands: \x1b[33mhelp\x1b[0m, \x1b[33mnvidia-smi\x1b[0m, \x1b[33mdocker ps\x1b[0m, \x1b[33mhtop\x1b[0m, \x1b[33mjobs\x1b[0m, \x1b[33mssh\x1b[0m, \x1b[33mclear\x1b[0m, \x1b[33mexit\x1b[0m",
  "",
];

const COMMANDS: Record<string, string[]> = {
  help: [
    "\x1b[32mAvailable commands:\x1b[0m",
    "  \x1b[33mnvidia-smi\x1b[0m     Show NVIDIA GPU status",
    "  \x1b[33mdocker ps\x1b[0m       List running containers",
    "  \x1b[33mhtop\x1b[0m            Interactive process viewer (simulated)",
    "  \x1b[33mjobs\x1b[0m            List active compute jobs",
    "  \x1b[33mssh <host>\x1b[0m      SSH to another node (demo)",
    "  \x1b[33mclear\x1b[0m           Clear terminal",
    "  \x1b[33mexit\x1b[0m            Disconnect from session",
    "  \x1b[33mwhoami\x1b[0m          Show current user",
    "  \x1b[33mdate\x1b[0m            Show current date/time",
    "  \x1b[33muname -a\x1b[0m        Show system info",
    "  \x1b[33mcat /proc/cpuinfo\x1b[0m  Show CPU info",
    "  \x1b[33mls\x1b[0m              List files in workspace",
    "  \x1b[33mdf -h\x1b[0m           Show disk usage",
    "  \x1b[33mfree -h\x1b[0m         Show memory usage",
  ],
  "nvidia-smi": [
    "\x1b[32mNVIDIA-SMI 535.129.03   Driver Version: 535.129.03   CUDA Version: 12.2\x1b[0m",
    "",
    "┌──────────────────────────────────────────────────────────────────────┐",
    `│ \x1b[36mGPU Name            Persistence-M| Bus-Id        Disp.A | Volatile Uncorr. ECC │\x1b[0m`,
    "├──────────────────────────────────────────────────────────────────────┤",
    `│ \x1b[36m0  NVIDIA RTX 4090        Off  | 00000000:01:00.0  Off |                  OFF │\x1b[0m`,
    "│  N/A   42°C    P0     65W  / 450W |      0MiB  / 24564MiB |      0%      Default │",
    "│                                       \x1b[33m12045MiB\x1b[0m / \x1b[32m24564MiB\x1b[0m                        │",
    "└──────────────────────────────────────────────────────────────────────┘",
    "",
    "┌──────────────────────────────────────────────────────────────────────┐",
    "│ Processes:                                                          │",
    "│  GPU   GI   CI        PID   Type   Process name           GPU Memory │",
    "│   ID   ID                                                           │",
    "├──────────────────────────────────────────────────────────────────────┤",
    `│   0   N/A  N/A      \x1b[33m8294\x1b[0m      C   python3 (llama-finetune)    \x1b[33m12045MiB\x1b[0m │`,
    "└──────────────────────────────────────────────────────────────────────┘",
  ],
  "docker ps": [
    "\x1b[32mCONTAINER ID   IMAGE                              COMMAND                  CREATED        STATUS        PORTS                    NAMES\x1b[0m",
    "\x1b[36m8f2c41e9d20c\x1b[0m   pytorch/pytorch:2.1.0-cuda12.1   \x1b[33m\"python train.py --…\"\x1b[0m   2 hours ago    \x1b[32mUp 2 hours\x1b[0m    0.0.0.0:8888->8888/tcp   \x1b[36mjob-8294-llama\x1b[0m",
    "\x1b[36ma7b19c2d1e0f\x1b[0m   nvidia/cuda:12.0-base            \x1b[33m\"/bin/bash -c 'sour…\"\x1b[0m   5 hours ago    \x1b[32mUp 5 hours\x1b[0m    0.0.0.0:8889->8889/tcp   \x1b[36mjob-7741-docking\x1b[0m",
    "\x1b[36m3c8d772910ab\x1b[0m   stable-diffusion:webui            \x1b[33m\"/start.sh\"\x1b[0m             30 min ago     \x1b[32mUp 30 min\x1b[0m   0.0.0.0:7860->7860/tcp   \x1b[36mjob-8301-sd\x1b[0m",
    "\x1b[36mff108841ace0\x1b[0m   python:3.11-slim                  \x1b[33m\"python transcribe.…\"\x1b[0m   1 hour ago     \x1b[32mUp 1 hour\x1b[0m    0.0.0.0:8890->8890/tcp   \x1b[36mjob-8210-whisper\x1b[0m",
  ],
  htop: [
    "\x1b[33m  CPU[████████░░░░░░░░░░░░]  42.3%\x1b[0m",
    "\x1b[36m  GPU[████████████░░░░░░░░]  64.2%\x1b[0m",
    "\x1b[32m  MEM[████████░░░░░░░░░░░░]  38.7%\x1b[0m",
    "",
    "  \x1b[37m  PID USER      PRI  NI  VIRT     RES     SHR S CPU% MEM%   TIME+  COMMAND\x1b[0m",
    "  \x1b[33m 8294 demo       20   0 48.5G   12.1G   2.3G R 38.2 18.9  2:34.12 python3\x1b[0m \x1b[32m(llama-finetune)\x1b[0m",
    "  \x1b[33m 7741 demo       20   0 92.3G   24.8G   4.1G S 24.5 38.7  5:12.08 python3\x1b[0m \x1b[32m(molecular-dock)\x1b[0m",
    "  \x1b[33m 8301 demo       20   0 16.2G    8.4G   1.8G R 12.1 13.1  1:08.45 python3\x1b[0m \x1b[32m(sd-batch)\x1b[0m",
    "  \x1b[33m 8210 demo       20   0  4.8G    2.1G   0.8G S  8.3  3.3  0:45.22 python3\x1b[0m \x1b[32m(whisper)\x1b[0m",
    "  \x1b[33m 1234 root       20   0  1.2G  512.4M 128.2M S  2.1  0.8  8:22.14 dockerd\x1b[0m",
    "  \x1b[33m 5678 demo       20   0  256.8M  48.2M  12.1M S  0.0  0.1  0:02.34 sshd\x1b[0m",
  ],
  jobs: [
    "\x1b[32mActive jobs on this node:\x1b[0m",
    "",
    `  \x1b[36mJOB_8294_B\x1b[0m  Llama-3 Fine-tuning     \x1b[33m0.45 CPT/hr\x1b[0m  \x1b[32m[PROGRESS: 64%]\x1b[0m  GPU:4090`,
    `  \x1b[36mJOB_7741_A\x1b[0m  Molecular Docking       \x1b[33m1.20 CPT/hr\x1b[0m  \x1b[32m[PROGRESS: 12%]\x1b[0m  GPU:4090`,
    `  \x1b[36mJOB_8301_C\x1b[0m  Stable Diffusion Batch  \x1b[33m0.85 CPT/hr\x1b[0m  \x1b[32m[PROGRESS: 88%]\x1b[0m  GPU:4090`,
    `  \x1b[36mJOB_8210_A\x1b[0m  Whisper Transcription   \x1b[33m0.30 CPT/hr\x1b[0m  \x1b[32m[PROGRESS: 38%]\x1b[0m  CPU`,
    "",
    `  \x1b[37mTotal earnings this session: 1.82 CPT\x1b[0m`,
  ],
  whoami: ["\x1b[32mdemo\x1b[0m"],
  date: [`\x1b[32m${new Date().toLocaleString()}\x1b[0m UTC`],
  "uname -a": [
    "\x1b[32mLinux compute-alpha-92 6.5.0-14-generic #15-Ubuntu SMP PREEMPT_DYNAMIC x86_64 x86_64 x86_64 GNU/Linux\x1b[0m",
  ],
  "cat /proc/cpuinfo": [
    "processor\t: 0",
    "vendor_id\t: AuthenticAMD",
    "cpu family\t: 25",
    "model\t\t: 17",
    "model name\t: AMD EPYC 9654 96-Core Processor",
    "stepping\t: 1",
    "cpu MHz\t\t: 2395.624",
    "cache size\t: 1024 KB",
    "physical id\t: 0",
    "siblings\t: 192",
    "core id\t\t: 0",
    "cpu cores\t: 96",
    "apicid\t\t: 0",
    "initial apicid\t: 0",
    "fpu\t\t: yes",
    "fpu_exception\t: yes",
    "cpuid level\t: 16",
    "flags\t\t: fpu vme de pse tsc msr pae mce cx8 apic sep mtrr pge mca cmov pat pse36 clflush mmx fxsr sse sse2 ht syscall nx mmxext fxsr_opt pdpe1gb rdtscp lm constant_tsc art rep_good nopl nonstop_tsc cpuid extd_apicid tsc_known_freq pni pclmulqdq monitor ssse3 fma cx16 pcid sse4_1 sse4_2 x2apic movbe popcnt aes xsave avx f16c rdrand hypervisor lahf_lm cmp_legacy cr8_legacy abm sse4a misalignsse 3dnowprefetch osvw ibs skinit wdt topoext perfctr_core perfctr_nb bpext perfctr_llc mwaitx cpb cat_l3 cdp_l3 hw_pstate ssbd mba ibpb stibp vmmcall fsgsbase bmi1 avx2 smep bmi2 erms invpcid cqm rdt_a avx512f avx512dq rdseed adx smap avx512ifma clflushopt clwb avx512cd sha_ni avx512bw avx512vl xsaveopt xsavec xgetbv1 xsaves cqm_llc cqm_occup_llc cqm_mbm_total cqm_mbm_local avx512_bf16 clzero irperf xsaveerptr rdpru wbnoinvd cppc arat npt lbrv svm_lock nrip_save tsc_scale vmcb_clean flushbyasid decodeassists pausefilter pfthreshold avic v_vmsave_vmload vgif v_spec_ctrl vnmi avx512vbmi umip pku ospke avx512_vbmi2 gfni vaes vpclmulqdq avx512_vnni avx512_bitalg avx512_vpopcntdq rdpid overflow_recov succor smca fsrm debug_swap",
    "",
    "\x1b[33m... (192 processors shown, truncated)\x1b[0m",
  ],
  ls: [
    "workspace/",
    "├── llama-finetune/",
    "│   ├── config.yaml",
    "│   ├── dataset/",
    "│   │   ├── train.jsonl",
    "│   │   └── val.jsonl",
    "│   ├── model/",
    "│   │   ├── adapter_config.json",
    "│   │   └── adapter_model.safetensors",
    "│   └── output/",
    "│       └── checkpoint-1200/",
    "├── sd-batch/",
    "│   ├── prompts.txt",
    "│   └── outputs/",
    "│       ├── render_0001.png",
    "│       ├── render_0002.png",
    "│       └── ...",
    "├── molecular-docking/",
    "│   ├── protein.pdb",
    "│   ├── ligand.sdf",
    "│   └── results/",
    "└── whisper-transcribe/",
    "    ├── audio.mp3",
    "    └── transcript.txt",
  ],
  "df -h": [
    "\x1b[32mFilesystem      Size  Used Avail Use% Mounted on\x1b[0m",
    "/dev/nvme0n1p2   932G  284G  648G  31% /",
    "/dev/nvme1n1     3.5T  1.2T  2.3T  34% /data",
    "tmpfs            32G   2.1G   30G   7% /tmp",
    "overlay          932G  284G  648G  31% /var/lib/docker",
  ],
  "free -h": [
    "\x1b[32m              total        used        free      shared  buff/cache   available\x1b[0m",
    "\x1b[32mMem:           62Gi        24Gi        18Gi       1.2Gi        20Gi        36Gi\x1b[0m",
    "\x1b[32mSwap:           8Gi       256Mi       7.8Gi\x1b[0m",
  ],
};

const TerminalPage: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const terminalRef = useRef<Terminal | null>(null);
  const fitAddonRef = useRef<FitAddon | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const [connected, setConnected] = useState(false);
  const [mode, setMode] = useState<"ws" | "sim">("sim");
  const simBufferRef = useRef<string>("");

  useEffect(() => {
    if (!containerRef.current) return;

    const term = new Terminal({
      cursorBlink: true,
      cursorStyle: "block",
      fontSize: 13,
      fontFamily: '"JetBrains Mono", "Cascadia Code", "Fira Code", monospace',
      theme: {
        background: "#0b0f0d",
        foreground: "#e1e3e0",
        cursor: "#5dcaa5",
        selectionBackground: "rgba(93, 202, 165, 0.3)",
        black: "#101412",
        red: "#ffb4ab",
        green: "#5dcaa5",
        yellow: "#fbbf24",
        blue: "#a8c8ff",
        magenta: "#c5a8ff",
        cyan: "#5dcab5",
        white: "#e1e3e0",
        brightBlack: "#404944",
        brightRed: "#ffb4ab",
        brightGreen: "#5dcaa5",
        brightYellow: "#fbbf24",
        brightBlue: "#a8c8ff",
        brightMagenta: "#c5a8ff",
        brightCyan: "#5dcab5",
        brightWhite: "#e1e3e0",
      },
      allowTransparency: true,
    });

    const fitAddon = new FitAddon();
    term.loadAddon(fitAddon);
    fitAddonRef.current = fitAddon;

    term.open(containerRef.current);
    fitAddon.fit();
    terminalRef.current = term;

    const resizeObserver = new ResizeObserver(() => {
      try { fitAddon.fit(); } catch {}
    });
    resizeObserver.observe(containerRef.current);

    // Try WebSocket connection for real shell
    let useSim = true;
    try {
      const ws = new WebSocket(WS_URL);
      wsRef.current = ws;

      ws.onopen = () => {
        useSim = false;
        setMode("ws");
        setConnected(true);
      };

      ws.onmessage = (event) => {
        term.write(event.data);
      };

      ws.onerror = () => {
        useSim = true;
        startSimMode(term);
      };

      ws.onclose = () => {
        if (!useSim) {
          term.writeln("\r\n\x1b[33m[WebSocket connection closed]\x1b[0m");
          startSimMode(term);
        }
      };

      // In WS mode, forward all key input
      term.onKey((e) => {
        if (!useSim && ws.readyState === WebSocket.OPEN) {
          ws.send(e.key);
        } else if (useSim) {
          handleSimKey(e.domEvent, e.key, term);
        }
      });
    } catch (e) {
      startSimMode(term);
    }

    // Fallback timer to switch to sim if WS doesn't connect
    const fallbackTimer = setTimeout(() => {
      if (useSim && mode === "sim" && !connected) {
        startSimMode(term);
      }
    }, 3000);

    function startSimMode(t: Terminal) {
      if (!useSim) return;
      useSim = true;
      setMode("sim");
      let lineIdx = 0;
      const typeLine = () => {
        if (lineIdx < WELCOME_LINES_SIM.length) {
          const line = WELCOME_LINES_SIM[lineIdx];
          t.writeln(line);
          lineIdx++;
          setTimeout(typeLine, Math.random() * 60 + 20);
        } else {
          setConnected(true);
          t.write(PROMPT + " ");
        }
      };
      typeLine();

      // Re-bind keys for sim mode
      t.onKey((e) => {
        handleSimKey(e.domEvent, e.key, t);
      });
    }

    function handleSimKey(domEvent: KeyboardEvent, key: string, t: Terminal) {
      const buf = simBufferRef;

      if (domEvent.key === "Enter") {
        const input = buf.current.trim();
        t.write("\r\n");
        handleCommand(input, t);
        buf.current = "";
      } else if (domEvent.key === "Backspace") {
        if (buf.current.length > 0) {
          buf.current = buf.current.slice(0, -1);
          t.write("\b \b");
        }
      } else if (domEvent.key === "ArrowUp") {
        if (cmdHistory.length > 0) {
          const newIdx = Math.max(0, cmdHistoryIdx - 1);
          cmdHistoryIdx = newIdx;
          const cmd = cmdHistory[newIdx];
          t.write("\r\x1b[K" + PROMPT + " " + cmd);
          buf.current = cmd;
        }
      } else if (domEvent.key === "ArrowDown") {
        if (cmdHistoryIdx < cmdHistory.length - 1) {
          const newIdx = cmdHistoryIdx + 1;
          cmdHistoryIdx = newIdx;
          const cmd = cmdHistory[newIdx];
          t.write("\r\x1b[K" + PROMPT + " " + cmd);
          buf.current = cmd;
        } else {
          cmdHistoryIdx = cmdHistory.length;
          t.write("\r\x1b[K" + PROMPT + " ");
          buf.current = "";
        }
      } else if (domEvent.key === "Tab") {
        domEvent.preventDefault();
      } else if (domEvent.key === "c" && (domEvent.ctrlKey || domEvent.metaKey)) {
        t.write("^C\r\n" + PROMPT + " ");
        buf.current = "";
      } else if (domEvent.key.length === 1) {
        buf.current += key;
        t.write(key);
      }
    }

    return () => {
      clearTimeout(fallbackTimer);
      resizeObserver.disconnect();
      if (wsRef.current) {
        wsRef.current.close();
      }
      term.dispose();
    };
  }, []);

  return (
    <div
      style={{
        padding: 24,
        height: "100%",
        display: "flex",
        flexDirection: "column",
        gap: 16,
      }}
    >
      <div className="flex items-center justify-between" style={{ marginBottom: 8 }}>
        <div>
          <div className="flex items-center" style={{ gap: 8, marginBottom: 4 }}>
            <Icon name="terminal" size={14} className="text-primary" />
            <span className="label-sm text-primary">SSH_TERMINAL</span>
          </div>
          <h1 className="font-mono" style={{ fontSize: 24, fontWeight: 700, textTransform: "uppercase" }}>
            Remote_Shell
          </h1>
        </div>
        <div className="flex items-center" style={{ gap: 8 }}>
          <span className={`status-dot ${connected ? "live" : "offline"}`} />
          <span className="label-sm" style={{ fontSize: 10, color: connected ? "var(--c-primary)" : "var(--c-on-surface-variant)" }}>
            {connected ? (mode === "ws" ? "REAL_SSH" : "SIMULATED") : "CONNECTING..."}
          </span>
        </div>
      </div>

      <div className="grid lg:grid-cols-4" style={{ gap: 16, flex: 1, minHeight: 0 }}>
        <div
          className="lg:col-span-3 hairline"
          style={{
            background: "#0b0f0d",
            overflow: "hidden",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <div
            className="flex items-center justify-between"
            style={{
              padding: "6px 12px",
              background: "#181c1a",
              borderBottom: "1px solid var(--c-outline-variant)",
            }}
          >
            <div className="flex items-center" style={{ gap: 8 }}>
              <div style={{ width: 8, height: 8, borderRadius: "50%", background: connected ? "#5dcaa5" : "#fbbf24" }} />
              <span className="font-mono" style={{ fontSize: 10, color: "var(--c-on-surface-variant)" }}>
                {DEMO_USER}@{DEMO_HOST}:~ — SSH session
              </span>
            </div>
            <span className="label-sm" style={{ fontSize: 9, color: "var(--c-outline)" }}>
              PORT {DEMO_PORT}
            </span>
          </div>
          <div ref={containerRef} style={{ flex: 1, padding: 8 }} />
        </div>

        <SSHInfoPanel />
      </div>
    </div>
  );
};

const PROMPT = "\x1b[32mdemo@compute\x1b[0m:\x1b[36m~\x1b[0m$";
const cmdHistory: string[] = [];
let cmdHistoryIdx = -1;

function handleCommand(input: string, term: Terminal) {
  const trimmed = input.trim();
  if (!trimmed) {
    term.write(PROMPT + " ");
    return;
  }

  cmdHistory.push(trimmed);
  cmdHistoryIdx = cmdHistory.length;

  const lower = trimmed.toLowerCase();

  if (lower === "clear") {
    term.clear();
    term.write(PROMPT + " ");
    return;
  }

  if (lower === "exit" || lower === "logout") {
    term.writeln("\r\n\x1b[33m[ Logging out of demo session... ]\x1b[0m");
    setTimeout(() => {
      term.writeln("\x1b[31mConnection to " + DEMO_HOST + " closed.\x1b[0m");
    }, 500);
    setTimeout(() => {
      term.write(PROMPT + " ");
    }, 1000);
    return;
  }

  if (lower.startsWith("ssh ")) {
    const target = trimmed.slice(4).trim();
    term.writeln(`\r\n\x1b[33m[ Connecting to ${target}... ]\x1b[0m`);
    setTimeout(() => {
      term.writeln(`\x1b[32m[ Connected to ${target} ]\x1b[0m`);
      term.writeln(`\x1b[33m[ Demo: SSH to remote nodes is simulated ]\x1b[0m`);
      term.write(PROMPT + " ");
    }, 800);
    return;
  }

  const lines = COMMANDS[lower];
  if (lines) {
    term.writeln("\r\n" + lines.join("\r\n") + "\r\n");
  } else {
    term.writeln(
      `\r\n\x1b[31mbash: ${trimmed.split(" ")[0]}: command not found\x1b[0m\r\n` +
        `\x1b[33mType 'help' for available commands.\x1b[0m\r\n`
    );
  }
  term.write(PROMPT + " ");
}

const SSHInfoPanel: React.FC = () => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(SSH_INFO.command).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div className="surface-low hairline" style={{ padding: 20, display: "flex", flexDirection: "column", gap: 16 }}>
      <div className="flex items-center" style={{ gap: 8 }}>
        <Icon name="dns" size={14} className="text-primary" />
        <span className="label-sm text-primary">SSH_CONNECTION_INFO</span>
      </div>

      <div className="surface-container" style={{ padding: 12 }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <InfoRow label="Host" value={SSH_INFO.host} />
          <InfoRow label="Port" value={String(SSH_INFO.port)} />
          <InfoRow label="User" value={SSH_INFO.user} />
          <InfoRow label="Password" value={SSH_INFO.password} />
          <InfoRow label="Auth" value="Password / Key (demo)" />
        </div>
      </div>

      <div
        className="surface-lowest hairline"
        style={{ padding: 12, position: "relative" }}
      >
        <div className="flex items-center justify-between" style={{ marginBottom: 8 }}>
          <span className="label-sm" style={{ fontSize: 9, color: "var(--c-on-surface-variant)", textTransform: "uppercase" }}>
            Quick Connect
          </span>
          <button
            onClick={handleCopy}
            className="btn btn-ghost btn-sm"
            style={{ padding: "4px 8px", fontSize: 9 }}
            title="Copy command"
          >
            <Icon name={copied ? "check" : "content_copy"} size={12} />
            {copied ? "Copied!" : "Copy"}
          </button>
        </div>
        <code
          className="font-mono"
          style={{
            fontSize: 11,
            color: "var(--c-primary)",
            wordBreak: "break-all",
            lineHeight: 1.6,
            display: "block",
          }}
        >
          {SSH_INFO.command}
        </code>
      </div>

      <div className="hairline-t" style={{ paddingTop: 12 }}>
        <div className="flex items-center" style={{ gap: 4, marginBottom: 8 }}>
          <Icon name="info" size={12} className="text-outline" />
          <span className="label-sm" style={{ fontSize: 9, color: "var(--c-on-surface-variant)" }}>
            DEMO_CREDENTIALS
          </span>
        </div>
        <p className="font-mono" style={{ fontSize: 10, color: "var(--c-on-surface-variant)", lineHeight: 1.5 }}>
          For demo, any password works. SSH keys can be added via the Dashboard.
          The external SSH gateway runs on port {SSH_INFO.port} and auto-authenticates demo users.
          <br /><br />
          <span className="text-warning">
            Note: External SSH connections work when the server is running (node server/start.js).
          </span>
        </p>
      </div>
    </div>
  );
};

const InfoRow: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <div className="flex justify-between items-center">
    <span className="label-sm" style={{ fontSize: 10, color: "var(--c-outline)", textTransform: "uppercase" }}>
      {label}
    </span>
    <span className="font-mono text-primary" style={{ fontSize: 12 }}>
      {value}
    </span>
  </div>
);

export default TerminalPage;
