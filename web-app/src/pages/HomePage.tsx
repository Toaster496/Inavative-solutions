import React from "react";
import { useNavigate } from "react-router-dom";
import { Icon } from "../components/ui/Icon";
import { useAppStore } from "../store/appStore";
import { NETWORK_STATS } from "../lib/constants";

export const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const { account, connectWallet, loading } = useAppStore();

  return (
    <div className="terminal-grid relative">
      {/* ---------- Hero ---------- */}
      <section
        className="container-page relative"
        style={{ paddingTop: 96, paddingBottom: 128 }}
      >
        <div className="grid lg:grid-cols-2" style={{ gap: 64, alignItems: "center" }}>
          {/* Left: copy */}
          <div style={{ position: "relative", zIndex: 1 }}>
            <div
              className="hairline-primary"
              style={{
                display: "inline-block",
                padding: "4px 12px",
                marginBottom: 24,
                background: "var(--c-primary-faint)",
              }}
            >
              <span className="label-sm text-primary">[ STATUS: LIVE ON BSC TESTNET ]</span>
            </div>

            <h1
              className="font-mono"
              style={{
                fontSize: "clamp(36px, 6vw, 60px)",
                lineHeight: 1.05,
                fontWeight: 700,
                letterSpacing: "-0.02em",
                textTransform: "uppercase",
                marginBottom: 24,
                color: "var(--c-on-surface)",
              }}
            >
              Decentralized GPU
              <br />
              <span className="text-primary">Compute Marketplace</span>
            </h1>

            <p
              className="body-md"
              style={{
                maxWidth: 520,
                marginBottom: 40,
                color: "var(--c-on-surface-variant)",
                lineHeight: 1.6,
              }}
            >
              The high-performance decentralized cloud. Rent enterprise-grade GPUs or monetize your idle hardware
              without middle-men, KYC, or complex setups. Pay-as-you-go compute, settled on-chain.
            </p>

            <div className="flex flex-wrap" style={{ gap: 16 }}>
              <button
                onClick={() => navigate("/marketplace")}
                className="btn btn-primary"
                style={{ padding: "14px 28px" }}
              >
                Start Renting
                <Icon name="rocket_launch" size={16} />
              </button>
              <button
                onClick={() => navigate(account ? "/dashboard" : "/jobs")}
                className="btn btn-ghost"
                style={{ padding: "14px 28px" }}
              >
                Become a Host
                <Icon name="dns" size={16} />
              </button>
            </div>

            {/* Stats strip */}
            <div
              className="hairline-t"
              style={{
                marginTop: 48,
                paddingTop: 32,
                display: "flex",
                gap: 32,
                alignItems: "center",
                flexWrap: "wrap",
              }}
            >
              <Stat value={`${NETWORK_STATS.activeNodes.toLocaleString()}+`} label="Nodes Active" />
              <Divider />
              <Stat value={`${NETWORK_STATS.totalCapacityPFLOPS} PFLOPS`} label="Total Capacity" />
              <Divider />
              <Stat
                value={`$${NETWORK_STATS.avgPriceRtx3090.toFixed(2)}`}
                label="Avg / Hr (RTX 3090)"
                color="var(--c-on-surface)"
              />
            </div>
          </div>

          {/* Right: terminal panel mock */}
          <div style={{ position: "relative" }}>
            <div
              className="absolute"
              style={{
                inset: -40,
                background: "rgba(93, 202, 165, 0.04)",
                filter: "blur(80px)",
                pointerEvents: "none",
              }}
            />
            <div className="surface-lowest hairline" style={{ padding: 4, position: "relative" }}>
              <div className="surface-low hairline" style={{ padding: 24 }}>
                {/* Header */}
                <div
                  className="flex justify-between items-center"
                  style={{
                    marginBottom: 24,
                    paddingBottom: 12,
                    borderBottom: "1px solid rgba(64, 73, 68, 0.3)",
                  }}
                >
                  <div className="flex" style={{ gap: 6 }}>
                    <div style={{ width: 8, height: 8, background: "rgba(255, 180, 171, 0.6)" }} />
                    <div style={{ width: 8, height: 8, background: "rgba(93, 202, 165, 0.6)" }} />
                    <div style={{ width: 8, height: 8, background: "var(--c-outline-variant)" }} />
                  </div>
                  <span className="font-mono" style={{ fontSize: 10, color: "var(--c-on-surface-variant)", textTransform: "uppercase" }}>
                    compute-shell v1.0.4-stable
                  </span>
                </div>

                {/* Node entries */}
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  <TerminalRow icon="memory" name="NVIDIA H100 PCIe" nodeId="0x4f...92a" price="$1.45/HR" sub="80GB VRAM" />
                  <TerminalRow icon="memory" name="NVIDIA RTX 4090" nodeId="0xbc...11e" price="$0.32/HR" sub="24GB VRAM" />

                  {/* Deploy progress */}
                  <div
                    className="surface-high"
                    style={{
                      padding: 16,
                      border: "1px solid rgba(93, 202, 165, 0.4)",
                      position: "relative",
                      overflow: "hidden",
                    }}
                  >
                    <div className="flex justify-between items-center" style={{ marginBottom: 8 }}>
                      <span className="label-sm text-primary">Deploying Docker Container…</span>
                      <span className="bg-primary animate-pulse" style={{ width: 8, height: 8, display: "inline-block" }} />
                    </div>
                    <div className="surface-lowest" style={{ height: 2, marginBottom: 8 }}>
                      <div className="bg-primary" style={{ height: "100%", width: "72%" }} />
                    </div>
                    <p className="font-mono" style={{ fontSize: 10, color: "var(--c-on-surface-variant)" }}>
                      &gt; PULLING IMAGE PYTORCH/PYTORCH:LATEST… OK
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ---------- Features bento ---------- */}
      <section className="container-page" style={{ paddingTop: 96, paddingBottom: 96 }}>
        <h2
          className="font-mono"
          style={{
            fontSize: 28,
            fontWeight: 700,
            letterSpacing: "0.05em",
            textTransform: "uppercase",
            marginBottom: 48,
            textAlign: "center",
            color: "var(--c-on-surface)",
          }}
        >
          Built for Performance &amp; Privacy
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4" style={{ gap: 16 }}>
          {/* No KYC — wide */}
          <div
            className="surface-low hairline"
            style={{
              gridColumn: "span 2",
              padding: 32,
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              transition: "border-color 120ms ease",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.borderColor = "var(--c-primary)")}
            onMouseLeave={(e) => (e.currentTarget.style.borderColor = "var(--c-outline-variant)")}
          >
            <Icon name="lock_person" size={32} className="text-primary" />
            <div>
              <h3 className="font-mono" style={{ fontSize: 18, fontWeight: 700, marginBottom: 8, textTransform: "uppercase" }}>
                No KYC Required
              </h3>
              <p style={{ fontSize: 14, color: "var(--c-on-surface-variant)", lineHeight: 1.6 }}>
                Maintain absolute anonymity. Connect your wallet and start computing instantly. No personal data,
                no passports, no delays. Permissionless by design.
              </p>
            </div>
          </div>

          {/* 25% Fee */}
          <div
            className="surface-low hairline"
            style={{
              padding: 32,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              textAlign: "center",
              transition: "border-color 120ms ease",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.borderColor = "var(--c-primary)")}
            onMouseLeave={(e) => (e.currentTarget.style.borderColor = "var(--c-outline-variant)")}
          >
            <div className="font-mono text-primary" style={{ fontSize: 48, fontWeight: 700, marginBottom: 8 }}>
              25%
            </div>
            <h3 className="font-mono" style={{ fontSize: 14, fontWeight: 700, marginBottom: 4, textTransform: "uppercase" }}>
              Protocol Fee
            </h3>
            <p className="font-mono" style={{ fontSize: 10, color: "var(--c-on-surface-variant)", textTransform: "uppercase" }}>
              The lowest commission in the industry
            </p>
          </div>

          {/* Secure Escrow */}
          <div
            className="surface-low hairline"
            style={{
              padding: 32,
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              transition: "border-color 120ms ease",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.borderColor = "var(--c-primary)")}
            onMouseLeave={(e) => (e.currentTarget.style.borderColor = "var(--c-outline-variant)")}
          >
            <Icon name="account_balance_wallet" size={32} className="text-primary" />
            <div>
              <h3 className="font-mono" style={{ fontSize: 14, fontWeight: 700, marginBottom: 8, textTransform: "uppercase" }}>
                Secure Escrow
              </h3>
              <p className="font-mono" style={{ fontSize: 10, color: "var(--c-on-surface-variant)", textTransform: "uppercase", lineHeight: 1.4 }}>
                Funds only released when compute time is verified by protocol
              </p>
            </div>
          </div>

          {/* Docker Isolation — full width */}
          <div
            className="surface-lowest hairline"
            style={{
              gridColumn: "span 4",
              padding: 40,
              display: "flex",
              flexDirection: "row",
              gap: 48,
              alignItems: "center",
              flexWrap: "wrap",
              transition: "border-color 120ms ease",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.borderColor = "rgba(93, 202, 165, 0.5)")}
            onMouseLeave={(e) => (e.currentTarget.style.borderColor = "var(--c-outline-variant)")}
          >
            <div style={{ flex: 1, minWidth: 280 }}>
              <div className="flex items-center" style={{ gap: 16, marginBottom: 16 }}>
                <Icon name="layers" size={36} className="text-primary" />
                <h3
                  className="font-mono"
                  style={{ fontSize: 24, fontWeight: 700, textTransform: "uppercase", letterSpacing: "-0.01em" }}
                >
                  Docker-Level Isolation
                </h3>
              </div>
              <p style={{ fontSize: 15, color: "var(--c-on-surface-variant)", marginBottom: 24, lineHeight: 1.6 }}>
                Every workload runs in an isolated, secure Docker container environment. Hosts can never see your
                data, and your applications are shielded from the underlying host system. GPU passthrough is configured
                via the NVIDIA Container Toolkit on the host daemon.
              </p>
              <ul style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, listStyle: "none" }}>
                {["Sandbox Environment", "Resource Capping", "Network Encryption", "Persistent Storage"].map((f) => (
                  <li key={f} className="flex items-center font-mono" style={{ gap: 8, fontSize: 11, color: "var(--c-on-surface-variant)", textTransform: "uppercase" }}>
                    <Icon name="check_box" size={14} className="text-primary" />
                    {f}
                  </li>
                ))}
              </ul>
            </div>

            {/* Terminal-style code block */}
            <div style={{ flex: 1, minWidth: 280, display: "flex", justifyContent: "center" }}>
              <div
                className="surface-container hairline"
                style={{
                  width: "100%",
                maxWidth: 380,
                height: 256,
                padding: 16,
                fontFamily: "var(--font-mono)",
                fontSize: 12,
                color: "var(--c-on-surface-variant)",
                position: "relative",
                overflow: "hidden",
                }}
              >
                <div className="text-primary" style={{ marginBottom: 8 }}>user@compute:~$ docker run -d --gpus all</div>
                <div style={{ paddingLeft: 16, marginLeft: 4, borderLeft: "1px solid rgba(64, 73, 68, 0.3)" }}>
                  <div>image: nvidia/cuda:12.0-base</div>
                  <div>environment:</div>
                  <div className="text-primary" style={{ paddingLeft: 16 }}>- API_KEY=0x71c…</div>
                  <div className="text-primary" style={{ paddingLeft: 16 }}>- WORKER_COUNT=4</div>
                  <div>ports:</div>
                  <div style={{ paddingLeft: 16 }}>- "8888:8888"</div>
                </div>
                <div className="text-primary animate-pulse" style={{ position: "absolute", bottom: 16, right: 16 }}>
                  <Icon name="terminal" size={18} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ---------- How it works ---------- */}
      <section className="surface-lowest hairline-t hairline-b" style={{ padding: "96px 0" }}>
        <div className="container-page">
          <div style={{ textAlign: "center", marginBottom: 64 }}>
            <h2
              className="font-mono"
              style={{ fontSize: 28, fontWeight: 700, marginBottom: 16, textTransform: "uppercase", letterSpacing: "0.05em" }}
            >
              Start Computing in Seconds
            </h2>
            <p
              className="font-mono"
              style={{ fontSize: 12, color: "var(--c-on-surface-variant)", textTransform: "uppercase", letterSpacing: "0.1em" }}
            >
              The simplest way to access decentralized GPU power
            </p>
          </div>

          <div className="grid md:grid-cols-3" style={{ gap: 32 }}>
            <StepCard
              step="01"
              title="Browse Marketplace"
              icon="storage"
              body="Filter by GPU model, VRAM, location, and price. Select the perfect instance for your AI training or 3D rendering job."
              onClick={() => navigate("/marketplace")}
            />
            <StepCard
              step="02"
              title="Deposit & Deploy"
              icon="rocket_launch"
              body="Connect your wallet and deposit enough CPT for your estimated duration. Upload your Docker config and launch with one click."
              onClick={() => navigate("/jobs")}
            />
            <StepCard
              step="03"
              title="Scale & Monitor"
              icon="monitoring"
              body="Access your instance via SSH or Web Terminal. Monitor real-time performance and scale up your cluster as needed."
              onClick={() => navigate("/dashboard")}
            />
          </div>
        </div>
      </section>

      {/* ---------- Architecture diagram ---------- */}
      <section className="container-page" style={{ paddingTop: 96, paddingBottom: 96 }}>
        <div className="surface-lowest hairline" style={{ padding: 4 }}>
          <div className="hairline" style={{ padding: "48px 32px", position: "relative", overflow: "hidden" }}>
            <div className="lg:flex" style={{ gap: 64, alignItems: "center" }}>
              <div style={{ flex: "0 0 33%", marginBottom: 24, position: "relative", zIndex: 1 }}>
                <h2
                  className="font-mono"
                  style={{ fontSize: 28, fontWeight: 700, marginBottom: 24, textTransform: "uppercase", letterSpacing: "-0.01em" }}
                >
                  Decentralized Mesh Architecture
                </h2>
                <p style={{ fontSize: 14, color: "var(--c-on-surface-variant)", marginBottom: 24, lineHeight: 1.6 }}>
                  Our network leverages the BSC blockchain for settlement and a decentralized discovery layer to
                  connect Renters with Hosts globally without central points of failure. The protocol is non-custodial,
                  transparent, and verifiable end-to-end.
                </p>
                <a
                  href="#"
                  onClick={(e) => e.preventDefault()}
                  className="no-underline flex items-center font-mono text-primary"
                  style={{ fontSize: 12, fontWeight: 700, gap: 8, textTransform: "uppercase", letterSpacing: "0.1em", transition: "gap 120ms ease" }}
                  onMouseEnter={(e) => (e.currentTarget.style.gap = "16px")}
                  onMouseLeave={(e) => (e.currentTarget.style.gap = "8px")}
                >
                  &gt; READ_WHITE_PAPER
                  <Icon name="arrow_forward" size={14} />
                </a>
              </div>

              {/* Diagram */}
              <div style={{ flex: "1 1 66%" }}>
                <div
                  className="surface-container hairline"
                  style={{
                    aspectRatio: "16 / 9",
                    position: "relative",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    overflow: "hidden",
                  }}
                >
                  {/* Grid backdrop */}
                  <svg height="100%" width="100%" style={{ position: "absolute", inset: 0, opacity: 0.1 }}>
                    <defs>
                      <pattern id="grid-inner" width="20" height="20" patternUnits="userSpaceOnUse">
                        <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#5dcaa5" strokeWidth="0.5" />
                      </pattern>
                    </defs>
                    <rect width="100%" height="100%" fill="url(#grid-inner)" />
                  </svg>

                  <div style={{ position: "relative", zIndex: 2, display: "flex", flexDirection: "column", alignItems: "center" }}>
                    <div
                      className="hairline-primary surface-lowest"
                      style={{
                        width: 80,
                        height: 80,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        marginBottom: 16,
                        position: "relative",
                      }}
                    >
                      <Icon name="hub" size={32} className="text-primary" />
                      <div
                        className="hairline-primary"
                        style={{
                          position: "absolute",
                          inset: -8,
                          opacity: 0.3,
                          animation: "pulse 3s ease-in-out infinite",
                        }}
                      />
                    </div>
                    <span
                      className="font-mono text-primary"
                      style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.3em", textTransform: "uppercase" }}
                    >
                      Protocol Layer
                    </span>
                  </div>

                  {/* Rotating ring */}
                  <div
                    className="spin-slow"
                    style={{
                      position: "absolute",
                      top: "50%",
                      left: "50%",
                      width: 320,
                      height: 320,
                      transform: "translate(-50%, -50%)",
                      border: "1px solid rgba(64, 73, 68, 0.3)",
                      borderRadius: "50%",
                      pointerEvents: "none",
                    }}
                  />

                  {/* Floating node chips */}
                  <div
                    className="hairline surface-lowest"
                    style={{
                      position: "absolute",
                      top: 24,
                      right: 32,
                      padding: "6px 12px",
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                    }}
                  >
                    <span className="status-dot live" />
                    <span className="font-mono" style={{ fontSize: 9, textTransform: "uppercase", letterSpacing: "0.1em" }}>
                      Node Alpha: Active
                    </span>
                  </div>
                  <div
                    className="hairline surface-lowest"
                    style={{
                      position: "absolute",
                      bottom: 24,
                      left: 32,
                      padding: "6px 12px",
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                    }}
                  >
                    <span className="status-dot warning" />
                    <span className="font-mono" style={{ fontSize: 9, textTransform: "uppercase", letterSpacing: "0.1em" }}>
                      Node Beta: Syncing
                    </span>
                  </div>

                  <div
                    className="font-mono"
                    style={{
                      position: "absolute",
                      bottom: 8,
                      left: 12,
                      fontSize: 8,
                      color: "rgba(155, 165, 160, 0.4)",
                      textTransform: "uppercase",
                    }}
                  >
                    [SYS_INFO] Visualization: Wireframe_Active
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ---------- CTA ---------- */}
      <section className="container-page" style={{ paddingTop: 96, paddingBottom: 96, textAlign: "center" }}>
        <h2
          className="font-mono"
          style={{ fontSize: "clamp(28px, 4vw, 40px)", fontWeight: 700, marginBottom: 32, textTransform: "uppercase", letterSpacing: "-0.02em" }}
        >
          Ready to power the future?
        </h2>
        <div className="flex flex-col sm:flex-row justify-center" style={{ gap: 16 }}>
          <button
            onClick={() => (account ? navigate("/jobs") : connectWallet())}
            className="btn btn-primary"
            style={{ padding: "16px 32px" }}
            disabled={loading}
          >
            {loading ? "Connecting…" : account ? "Launch Your First Container" : "Connect Wallet"}
          </button>
          <button
            onClick={() => navigate("/marketplace")}
            className="btn btn-ghost"
            style={{ padding: "16px 32px" }}
          >
            View Host Documentation
          </button>
        </div>
      </section>
    </div>
  );
};

const Stat: React.FC<{ value: string; label: string; color?: string }> = ({ value, label, color }) => (
  <div>
    <p className="font-mono tabular-nums" style={{ fontSize: 28, fontWeight: 700, color: color || "var(--c-primary)" }}>
      {value}
    </p>
    <p className="font-mono" style={{ fontSize: 10, color: "var(--c-on-surface-variant)", textTransform: "uppercase", letterSpacing: "0.1em" }}>
      {label}
    </p>
  </div>
);

const Divider: React.FC = () => (
  <div style={{ width: 1, height: 40, background: "var(--c-outline-variant)" }} />
);

const TerminalRow: React.FC<{
  icon: string;
  name: string;
  nodeId: string;
  price: string;
  sub: string;
}> = ({ icon, name, nodeId, price, sub }) => (
  <div
    className="surface-container hairline flex justify-between items-center"
    style={{ padding: 16, borderColor: "rgba(64, 73, 68, 0.5)" }}
  >
    <div className="flex items-center" style={{ gap: 12 }}>
      <Icon name={icon} size={20} className="text-primary" />
      <div>
        <p className="font-mono" style={{ fontSize: 13, color: "var(--c-on-surface)", textTransform: "uppercase" }}>
          {name}
        </p>
        <p className="font-mono" style={{ fontSize: 10, color: "var(--c-on-surface-variant)" }}>
          NODE_ID: {nodeId}
        </p>
      </div>
    </div>
    <div style={{ textAlign: "right" }}>
      <p className="font-mono text-primary" style={{ fontSize: 13 }}>{price}</p>
      <p className="font-mono" style={{ fontSize: 10, color: "var(--c-on-surface-variant)", textTransform: "uppercase" }}>
        {sub}
      </p>
    </div>
  </div>
);

const StepCard: React.FC<{
  step: string;
  title: string;
  icon: string;
  body: string;
  onClick?: () => void;
}> = ({ step, title, icon, body, onClick }) => (
  <button
    onClick={onClick}
    className="surface-low hairline"
    style={{
      padding: 32,
      textAlign: "left",
      cursor: onClick ? "pointer" : "default",
      transition: "border-color 120ms ease",
    }}
    onMouseEnter={(e) => (e.currentTarget.style.borderColor = "var(--c-primary)")}
    onMouseLeave={(e) => (e.currentTarget.style.borderColor = "var(--c-outline-variant)")}
  >
    <div className="font-mono text-primary" style={{ fontSize: 11, marginBottom: 16 }}>
      [ STEP_{step} ]
    </div>
    <Icon name={icon} size={28} className="text-primary" />
    <h3 className="font-mono" style={{ fontSize: 18, fontWeight: 700, margin: "12px 0", textTransform: "uppercase" }}>
      {title}
    </h3>
    <p style={{ fontSize: 13, color: "var(--c-on-surface-variant)", lineHeight: 1.6 }}>{body}</p>
  </button>
);

export default HomePage;
