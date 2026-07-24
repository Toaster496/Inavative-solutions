import React from "react";
import { Link, useLocation } from "react-router-dom";
import { Icon } from "../ui/Icon";
import { useAppStore } from "../../store/appStore";
import { shortAddr, formatCpt } from "../../lib/constants";

interface NavItem {
  to: string;
  label: string;
}

const NAV: NavItem[] = [
  { to: "/",              label: "Home" },
  { to: "/marketplace",   label: "Marketplace" },
  { to: "/jobs",          label: "Jobs" },
  { to: "/dashboard",     label: "Host Dashboard" },
  { to: "/token",         label: "Token" },
];

export const Header: React.FC = () => {
  const location = useLocation();
  const { account, coinBalance, connectWallet, disconnectWallet, loading } = useAppStore();

  const isActive = (to: string) =>
    to === "/" ? location.pathname === "/" : location.pathname.startsWith(to);

  return (
    <header
      className="sticky top-0 z-50 hairline-b bg-surface-lowest/90 backdrop-blur-md"
      style={{ backdropFilter: "blur(8px)" }}
    >
      <nav
        className="container-page flex justify-between items-center"
        style={{ height: "var(--nav-h)", paddingTop: 0, paddingBottom: 0 }}
      >
        {/* Brand + primary nav */}
        <div className="flex items-center" style={{ gap: "var(--gutter-desktop)" }}>
          <Link to="/" className="no-underline flex items-center" style={{ gap: 8 }}>
            <span
              className="bg-primary"
              style={{ width: 8, height: 8, display: "inline-block" }}
            />
            <span
              className="font-mono"
              style={{
                fontSize: 18,
                fontWeight: 700,
                letterSpacing: "-0.02em",
                textTransform: "uppercase",
                color: "var(--c-on-surface)",
              }}
            >
              Compute<span className="text-primary">Market</span>
            </span>
          </Link>

          <div className="hidden md:flex items-center" style={{ gap: 24 }}>
            {NAV.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                className="label-sm no-underline"
                style={{
                  color: isActive(item.to) ? "var(--c-primary)" : "var(--c-outline)",
                  borderBottom: isActive(item.to) ? "1px solid var(--c-primary)" : "1px solid transparent",
                  paddingBottom: 4,
                  transition: "color 120ms ease",
                }}
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>

        {/* Right cluster */}
        <div className="flex items-center" style={{ gap: 16 }}>
          {/* Network pill */}
          <div
            className="hidden sm:flex items-center hairline"
            style={{ gap: 8, padding: "4px 10px" }}
          >
            <span className="status-dot live" />
            <span className="label-sm" style={{ fontSize: 10, color: "var(--c-on-surface)" }}>
              BSC_TESTNET
            </span>
          </div>

          {/* Balance + wallet */}
          {account && coinBalance !== null && (
            <div className="hidden md:flex flex-col items-end" style={{ lineHeight: 1.1 }}>
              <span className="label-sm" style={{ fontSize: 9, color: "var(--c-on-surface-variant)" }}>
                Balance
              </span>
              <span className="font-mono text-primary tabular-nums" style={{ fontSize: 13, fontWeight: 600 }}>
                {formatCpt(coinBalance)} CPT
              </span>
            </div>
          )}

          {account ? (
            <button onClick={disconnectWallet} className="btn btn-ghost btn-sm" title="Disconnect wallet">
              <Icon name="logout" size={14} />
              {shortAddr(account)}
            </button>
          ) : (
            <button onClick={connectWallet} className="btn btn-primary btn-sm" disabled={loading}>
              <Icon name="link" size={14} />
              {loading ? "Connecting…" : "Connect Wallet"}
            </button>
          )}

          <div className="hidden sm:flex items-center hairline-l" style={{ paddingLeft: 16, gap: 12 }}>
            <Icon name="settings" size={18} className="text-outline cursor-pointer hover:text-primary transition-colors" />
            <Icon
              name="notifications"
              size={18}
              className="text-outline cursor-pointer hover:text-primary transition-colors"
              style={{ position: "relative" }}
            />
          </div>
        </div>
      </nav>
    </header>
  );
};

export default Header;
