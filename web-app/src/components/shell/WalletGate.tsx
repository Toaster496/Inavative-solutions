import React from "react";
import { Icon } from "../ui/Icon";
import { useAppStore } from "../../store/appStore";

interface WalletGateProps {
  children: React.ReactNode;
  /** Optional: when true, the gate is enforced; otherwise children always render */
  requireWallet?: boolean;
}

/**
 * Wraps page content. If `requireWallet` is true and no wallet is connected,
 * renders a terminal-style "connect wallet" prompt instead of children.
 * Always surfaces store-level errors.
 */
export const WalletGate: React.FC<WalletGateProps> = ({ children, requireWallet = false }) => {
  const { account, error, connectWallet, loading } = useAppStore();

  if (error) {
    return (
      <div
        className="hairline"
        style={{
          background: "rgba(255, 180, 171, 0.06)",
          borderColor: "var(--c-error)",
          padding: 16,
          margin: "16px 0",
          display: "flex",
          gap: 12,
          alignItems: "flex-start",
        }}
      >
        <Icon name="error" size={20} className="text-error" />
        <div style={{ flex: 1 }}>
          <p className="label-sm text-error" style={{ marginBottom: 4 }}>
            SYSTEM_ERROR
          </p>
          <p className="font-mono" style={{ fontSize: 12, color: "var(--c-on-surface)", wordBreak: "break-word" }}>
            {error}
          </p>
        </div>
      </div>
    );
  }

  if (requireWallet && !account) {
    return (
      <div
        className="terminal-grid wallet-connect-bg"
        style={{
          minHeight: "60vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "80px 24px",
          textAlign: "center",
          position: "relative",
        }}
      >
        <div style={{ position: "relative", zIndex: 1, maxWidth: 520 }}>
          <div
            className="hairline-primary"
            style={{
              display: "inline-flex",
              padding: "6px 12px",
              marginBottom: 24,
              background: "var(--c-primary-faint)",
            }}
          >
            <span className="label-sm text-primary">[ STATUS: AUTH_REQUIRED ]</span>
          </div>

          <h2 className="headline-lg" style={{ fontSize: 36, marginBottom: 16 }}>
            Connect Wallet to Continue
          </h2>

          <p className="body-md" style={{ color: "var(--c-on-surface-variant)", marginBottom: 32, maxWidth: 440 }}>
            This area requires an authenticated session. Connect an EVM-compatible wallet on BSC Testnet to access your
            operator console, manage compute jobs, and interact with the protocol.
          </p>

          <div className="flex flex-col sm:flex-row justify-center" style={{ gap: 12 }}>
            <button onClick={connectWallet} className="btn btn-primary" disabled={loading} style={{ padding: "14px 28px" }}>
              <Icon name="link" size={16} />
              {loading ? "Connecting…" : "Connect MetaMask"}
            </button>
            <button onClick={() => useAppStore.getState().connectDemoWallet()} className="btn btn-ghost" style={{ padding: "14px 28px" }}>
              <Icon name="play_circle" size={16} />
              Continue as Demo
            </button>
          </div>

          <div
            className="hairline"
            style={{
              marginTop: 40,
              padding: 16,
              textAlign: "left",
              background: "var(--c-surface-container-lowest)",
            }}
          >
            <p className="label-sm text-primary" style={{ marginBottom: 8 }}>
              &gt; SESSION_LOG
            </p>
            <p className="font-mono" style={{ fontSize: 11, color: "var(--c-on-surface-variant)" }}>
              [INFO] No wallet detected. Connect MetaMask or continue with demo mode below.
            </p>
            <p className="font-mono" style={{ fontSize: 11, color: "var(--c-on-surface-variant)" }}>
              [INFO] Expected chain_id: 0x61 (BSC_TESTNET)
            </p>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

export default WalletGate;
