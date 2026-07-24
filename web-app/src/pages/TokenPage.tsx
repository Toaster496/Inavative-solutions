import React, { useState } from "react";
import { Icon } from "../components/ui/Icon";
import { useAppStore } from "../store/appStore";
import {
  CONTRACTS,
  NETWORK_STATS,
  formatCpt,
  shortAddr,
} from "../lib/constants";

export const TokenPage: React.FC = () => {
  const { account, coinBalance } = useAppStore();
  const [showFaucetModal, setShowFaucetModal] = useState(false);

  return (
    <div style={{ padding: 24, position: "relative" }}>
      {/* Page header */}
      <header style={{ marginBottom: 32 }} className="flex flex-col md:flex-row justify-between items-end" >
        <div style={{ gap: 16, marginBottom: 16 }}>
          <div className="flex items-center" style={{ gap: 8, marginBottom: 8 }}>
            <span className="font-mono text-primary">&gt;&gt;</span>
            <h1
              className="font-mono"
              style={{ fontSize: "clamp(32px, 5vw, 48px)", fontWeight: 700, textTransform: "uppercase", letterSpacing: "-0.02em", lineHeight: 1 }}
            >
              TOKEN_METRICS
            </h1>
          </div>
          <p
            style={{
              maxWidth: 580,
              fontSize: 14,
              color: "var(--c-on-surface-variant)",
              borderLeft: "2px solid var(--c-outline-variant)",
              paddingLeft: 16,
              lineHeight: 1.6,
            }}
          >
            Native utility token (CPT) powering decentralized GPU orchestration, staking governance, and performance
            rewards. Operating on the BSC network.
          </p>
        </div>
        <button
          onClick={() => setShowFaucetModal(true)}
          className="btn btn-primary"
          style={{ padding: "12px 20px" }}
        >
          <Icon name="water_drop" size={16} />
          GET_TEST_CPT
        </button>
      </header>

      {/* Metrics bento */}
      <section className="grid grid-cols-1 md:grid-cols-3" style={{ gap: 16, marginBottom: 32 }}>
        <BentoCard
          label="TOTAL_SUPPLY"
          value={NETWORK_STATS.totalSupply.toLocaleString()}
          sub="CPT MAINNET MAX CAP"
        />
        <BentoCard
          label="PROTOCOL_FEE_BURN"
          value={NETWORK_STATS.protocolFeePct.toFixed(2)}
          valueSuffix="%"
          progress={NETWORK_STATS.protocolFeePct}
        />
        <BentoCard
          label="STAKE_THRESHOLD"
          value={`${NETWORK_STATS.minHostStake} CPT`}
          sub="MIN_REQUIRED_PER_HOST"
          footer={
            <a
              href="#"
              onClick={(e) => e.preventDefault()}
              className="no-underline flex items-center font-mono text-primary"
              style={{ fontSize: 11, gap: 4, textTransform: "uppercase", letterSpacing: "0.1em" }}
            >
              REWARDS_CALC <Icon name="arrow_outward" size={12} />
            </a>
          }
        />
      </section>

      {/* Smart contract ops */}
      <section style={{ marginBottom: 32 }}>
        <div className="flex items-center justify-between hairline-b" style={{ paddingBottom: 16, marginBottom: 16, flexWrap: "wrap", gap: 16 }}>
          <div className="flex items-center" style={{ gap: 16 }}>
            <h2 className="font-mono" style={{ fontSize: 22, fontWeight: 700, textTransform: "uppercase" }}>
              CONTRACT_OPS
            </h2>
            <div
              className="font-mono"
              style={{
                padding: "2px 8px",
                border: "1px solid rgba(93, 202, 165, 0.4)",
                background: "var(--c-primary-faint)",
                fontSize: 11,
                color: "var(--c-primary)",
              }}
            >
              {shortAddr(CONTRACTS.marketplace, 6, 4)}
            </div>
          </div>
          <div className="flex items-center" style={{ gap: 8 }}>
            <span className="status-dot live" />
            <span className="label-sm text-primary" style={{ fontSize: 10 }}>READY_FOR_CALL</span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2" style={{ gap: 24 }}>
          {/* Write methods */}
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <h3 className="label-sm text-primary flex items-center" style={{ gap: 8 }}>
              <Icon name="edit" size={14} /> // WRITE_METHODS
            </h3>
            <div className="terminal-panel" style={{ padding: 16, display: "flex", flexDirection: "column", gap: 16, borderLeft: "2px solid var(--c-primary)" }}>
              <MethodBlock
                signature="registerHost(string nodeInfo, string[] gpuIds, uint256 gpuCount, uint256 cpuCores, uint256 ramGB)"
                inputs={[
                  { placeholder: "node_address: 0x…", type: "text" },
                  { placeholder: "cpt_amount: 100+", type: "number" },
                ]}
                cta="EXECUTE_CALL"
                primary
              />
              <div className="hairline-t" style={{ paddingTop: 16 }}>
                <MethodBlock
                  signature="createJob(string jobSpec, uint256 price, uint8 resourceType, uint256 gpuCount, uint256 contextLength)"
                  inputs={[{ placeholder: "ipfs_hash: Qm…", type: "text" }]}
                  cta="INIT_JOB"
                />
              </div>
            </div>
          </div>

          {/* Read state */}
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <h3 className="label-sm flex items-center" style={{ gap: 8, color: "var(--c-secondary, var(--c-on-surface-variant))" }}>
              <Icon name="visibility" size={14} /> // READ_STATE
            </h3>
            <div className="terminal-panel" style={{ padding: 16, background: "rgba(20, 24, 22, 0.8)" }}>
              <ReadRow label="balanceOf(caller)" value={`${formatCpt(coinBalance)} CPT`} />
              <ReadRow label="totalNodesActive()" value={NETWORK_STATS.totalNodesActive.toLocaleString()} />
              <ReadRow label="currentEpoch()" value={NETWORK_STATS.currentEpoch.toLocaleString()} />
              <ReadRow label="isHost(node_id)" value={account ? "TRUE" : "FALSE"} highlight={!!account} />

              {/* Data flow viz */}
              <div className="hairline" style={{ marginTop: 16, padding: 12, background: "var(--c-surface)", position: "relative", overflow: "hidden" }}>
                <div className="scanline" style={{ position: "absolute", top: 0, left: 0, height: "100%", width: "100%", animation: "scan 8s linear infinite" }} />
                <p className="label-sm text-primary" style={{ fontSize: 9, marginBottom: 12, opacity: 0.4, textTransform: "uppercase" }}>
                  DATA_FLOW_VISUALIZATION
                </p>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 16, padding: 16, position: "relative", zIndex: 1 }}>
                  <div className="flex items-center" style={{ gap: 16 }}>
                    <div className="hairline-primary flex items-center justify-center" style={{ width: 40, height: 40 }}>
                      <Icon name="person" size={16} className="text-primary" />
                    </div>
                    <div style={{ height: 1, width: 32, background: "var(--c-outline-variant)" }} />
                    <div className="hairline-primary font-mono text-primary" style={{ padding: "4px 12px", fontSize: 10 }}>
                      EVM_CORE
                    </div>
                    <div style={{ height: 1, width: 32, background: "var(--c-outline-variant)" }} />
                    <div className="hairline-primary flex items-center justify-center" style={{ width: 40, height: 40 }}>
                      <Icon name="terminal" size={16} className="text-primary" />
                    </div>
                  </div>
                  <div
                    className="font-mono"
                    style={{ fontSize: 9, color: "var(--c-on-surface-variant)", textAlign: "center", opacity: 0.5, textTransform: "uppercase", letterSpacing: "0.1em" }}
                  >
                    VERIFIED_PROOFS -&gt; SETTLEMENT_LAYER
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Network status */}
      <section className="terminal-panel" style={{ padding: 24, borderLeft: "4px solid var(--c-primary)", background: "rgba(20, 24, 22, 0.3)" }}>
        <div className="flex justify-between items-center" style={{ marginBottom: 24, flexWrap: "wrap", gap: 16 }}>
          <div>
            <h3 className="label-sm text-primary" style={{ textTransform: "uppercase" }}>NETWORK_HEALTH_STATUS</h3>
            <p className="font-mono" style={{ fontSize: 10, color: "var(--c-on-surface-variant)", textTransform: "uppercase" }}>
              REAL-TIME RESOURCE AGGREGATE
            </p>
          </div>
          <div className="hairline-primary" style={{ padding: "4px 12px", background: "rgba(93, 202, 165, 0.1)" }}>
            <span className="font-mono text-primary" style={{ fontSize: 10, fontWeight: 700, animation: "pulse 2s ease-in-out infinite" }}>
              LIVE_SYNC
            </span>
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          <NetworkBar label="VRAM_ALLOCATION" pct={NETWORK_STATS.vramAllocationPct} />
          <NetworkBar label="BW_CONSUMPTION" pct={NETWORK_STATS.bandwidthPct} />
        </div>
      </section>

      {/* Faucet modal */}
      {showFaucetModal && <FaucetModal onClose={() => setShowFaucetModal(false)} />}
    </div>
  );
};

const BentoCard: React.FC<{
  label: string;
  value: string;
  valueSuffix?: string;
  sub?: string;
  progress?: number;
  footer?: React.ReactNode;
}> = ({ label, value, valueSuffix, sub, progress, footer }) => (
  <div className="terminal-panel" style={{ padding: 24, display: "flex", flexDirection: "column", justifyContent: "space-between", minHeight: 176 }}>
    <span className="label-sm text-primary" style={{ opacity: 0.6 }}>{label}</span>
    <div>
      <div className="flex items-baseline" style={{ gap: 8 }}>
        <h2 className="font-mono tabular-nums text-primary" style={{ fontSize: 32, fontWeight: 700 }}>
          {value}
        </h2>
        {valueSuffix && <span className="font-mono text-primary" style={{ fontSize: 28, fontWeight: 700 }}>{valueSuffix}</span>}
      </div>
      {sub && (
        <p className="font-mono" style={{ fontSize: 10, color: "var(--c-on-surface-variant)", marginTop: 4, textTransform: "uppercase" }}>
          {sub}
        </p>
      )}
      {progress !== undefined && (
        <div className="progress progress-thick" style={{ marginTop: 16 }}>
          <div className="progress-fill" style={{ width: `${progress}%` }} />
        </div>
      )}
      {footer && <div style={{ marginTop: 12 }}>{footer}</div>}
    </div>
  </div>
);

const MethodBlock: React.FC<{
  signature: string;
  inputs: { placeholder: string; type: string }[];
  cta: string;
  primary?: boolean;
}> = ({ signature, inputs, cta, primary }) => (
  <div>
    <p className="font-mono text-primary" style={{ fontSize: 12, marginBottom: 12 }}>{signature}</p>
    <div style={{ display: "grid", gap: 8 }}>
      {inputs.map((input, i) => (
        <input key={i} type={input.type} placeholder={input.placeholder} className="input" />
      ))}
      <button className={`btn ${primary ? "btn-primary" : "btn-ghost"}`} style={{ padding: "8px 12px" }}>
        {cta}
      </button>
    </div>
  </div>
);

const ReadRow: React.FC<{ label: string; value: string; highlight?: boolean }> = ({ label, value, highlight }) => (
  <div className="flex justify-between items-center hairline-b" style={{ padding: "6px 0", borderColor: "rgba(64, 73, 68, 0.5)" }}>
    <span className="font-mono" style={{ fontSize: 12, color: "var(--c-on-surface-variant)" }}>{label}</span>
    <span
      className="font-mono"
      style={{
        fontSize: 12,
        color: highlight ? "var(--c-primary)" : "var(--c-primary)",
        fontWeight: highlight ? 700 : 400,
      }}
    >
      {value}
    </span>
  </div>
);

const NetworkBar: React.FC<{ label: string; pct: number }> = ({ label, pct }) => (
  <div>
    <div className="flex justify-between font-mono" style={{ fontSize: 12, marginBottom: 8 }}>
      <span style={{ color: "var(--c-on-surface-variant)" }}>{label}</span>
      <span className="text-primary tabular-nums">{pct.toFixed(1)}%</span>
    </div>
    <div className="progress progress-thick" style={{ height: 6 }}>
      <div className="progress-fill" style={{ width: `${pct}%` }} />
    </div>
  </div>
);

const FaucetModal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const { account } = useAppStore();
  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0, 0, 0, 0.7)",
        zIndex: 200,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 16,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="terminal-panel bg-surface"
        style={{ maxWidth: 480, width: "100%", padding: 24, position: "relative" }}
      >
        <button
          onClick={onClose}
          className="btn btn-ghost btn-sm"
          style={{ position: "absolute", top: 16, right: 16, padding: 6 }}
          aria-label="Close"
        >
          <Icon name="close" size={14} />
        </button>

        <div className="flex items-center" style={{ gap: 12, marginBottom: 16 }}>
          <Icon name="water_drop" size={24} className="text-primary" />
          <h2 className="font-mono" style={{ fontSize: 20, fontWeight: 700, textTransform: "uppercase" }}>
            Test_CPT_Faucet
          </h2>
        </div>

        <p style={{ fontSize: 13, color: "var(--c-on-surface-variant)", marginBottom: 16, lineHeight: 1.6 }}>
          The ComputeCoin contract does not have a public mint function. To obtain test CPT for development on BSC
          Testnet, you have two options:
        </p>

        <div className="surface-container" style={{ padding: 16, marginBottom: 12 }}>
          <p className="label-sm text-primary" style={{ marginBottom: 8, fontSize: 11 }}>
            <Icon name="terminal" size={12} /> OPTION_A — DEPLOYER_TRANSFER
          </p>
          <p className="font-mono" style={{ fontSize: 11, color: "var(--c-on-surface-variant)", lineHeight: 1.5 }}>
            If you deployed the contracts, your deployer wallet holds the full 1B CPT supply. Use the contract's{" "}
            <span className="text-primary">transfer()</span> function on BSCScan to send CPT to your test address.
          </p>
        </div>

        <div className="surface-container" style={{ padding: 16, marginBottom: 16 }}>
          <p className="label-sm text-primary" style={{ marginBottom: 8, fontSize: 11 }}>
            <Icon name="group" size={12} /> OPTION_B — REQUEST_FROM_TEAM
          </p>
          <p className="font-mono" style={{ fontSize: 11, color: "var(--c-on-surface-variant)", lineHeight: 1.5 }}>
            Open an issue on the project's GitHub repository with your testnet address and a brief description of what
            you're testing. The team will dispatch test CPT within 24 hours.
          </p>
        </div>

        {account && (
          <div className="hairline" style={{ padding: 12, marginBottom: 16 }}>
            <p className="label-sm" style={{ fontSize: 9, color: "var(--c-on-surface-variant)", textTransform: "uppercase" }}>
              YOUR_ADDRESS
            </p>
            <p className="font-mono text-primary break-all" style={{ fontSize: 11, marginTop: 4 }}>{account}</p>
          </div>
        )}

        <a
          href={`https://testnet.bscscan.com/address/${CONTRACTS.computeCoin}#writeContract`}
          target="_blank"
          rel="noopener noreferrer"
          className="btn btn-primary btn-block no-underline"
          style={{ padding: "10px 16px" }}
        >
          <Icon name="open_in_new" size={14} />
          OPEN_ON_BSCSCAN
        </a>
      </div>
    </div>
  );
};

export default TokenPage;
