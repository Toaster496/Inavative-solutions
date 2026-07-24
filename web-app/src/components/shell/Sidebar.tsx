import React from "react";
import { Link, useLocation } from "react-router-dom";
import { Icon } from "../ui/Icon";
import { useAppStore } from "../../store/appStore";
import { shortAddr, formatCpt } from "../../lib/constants";

interface SidebarItem {
  to: string;
  label: string;
  icon: string;
}

const NAV: SidebarItem[] = [
  { to: "/",            label: "HOME",         icon: "home" },
  { to: "/marketplace", label: "MARKETPLACE",  icon: "storage" },
  { to: "/jobs",        label: "JOBS",         icon: "memory" },
  { to: "/dashboard",   label: "HOST_DASH",    icon: "monitoring" },
  { to: "/token",       label: "TOKEN",        icon: "token" },
  { to: "/terminal",    label: "TERMINAL",     icon: "terminal" },
];

export const Sidebar: React.FC = () => {
  const location = useLocation();
  const { account, coinBalance, isHost } = useAppStore();

  return (
    <aside
      className="hidden lg:flex flex-col hairline-r bg-surface-lowest"
      style={{
        width: 240,
        position: "sticky",
        top: "var(--nav-h)",
        height: "calc(100vh - var(--nav-h))",
        padding: 16,
        overflowY: "auto",
      }}
    >
      {/* Node identity card */}
      <div className="hairline bg-surface" style={{ padding: 12, marginBottom: 24 }}>
        <div className="flex items-center" style={{ gap: 10, marginBottom: 10 }}>
          <div
            className="flex items-center justify-center"
            style={{ width: 32, height: 32, background: "rgba(93, 202, 165, 0.1)" }}
          >
            <Icon name="dns" size={18} className="text-primary" />
          </div>
          <div style={{ lineHeight: 1.2 }}>
            <p className="label-sm" style={{ fontSize: 11, color: "var(--c-on-surface)" }}>
              NODE:{isHost ? "ACTIVE_HOST" : "GUEST"}
            </p>
            <p className="font-mono text-primary" style={{ fontSize: 10 }}>
              {account ? shortAddr(account, 4, 4) : "0x0…NOT_CONNECTED"}
            </p>
          </div>
        </div>
        {account && coinBalance !== null && (
          <div
            className="hairline-t"
            style={{ paddingTop: 8, marginTop: 8, display: "flex", justifyContent: "space-between" }}
          >
            <span className="label-sm" style={{ fontSize: 9, color: "var(--c-on-surface-variant)" }}>
              BAL
            </span>
            <span className="font-mono text-primary tabular-nums" style={{ fontSize: 10 }}>
              {formatCpt(coinBalance)} CPT
            </span>
          </div>
        )}
      </div>

      {/* Nav */}
      <nav className="flex flex-col" style={{ gap: 2, flexGrow: 1 }}>
        {NAV.map((item) => {
          const active =
            item.to === "/"
              ? location.pathname === "/"
              : location.pathname.startsWith(item.to);
          return (
            <Link
              key={item.to}
              to={item.to}
              className="no-underline flex items-center"
              style={{
                gap: 12,
                padding: "10px 14px",
                background: active ? "var(--c-surface-variant)" : "transparent",
                color: active ? "var(--c-primary)" : "var(--c-on-surface-variant)",
                borderRight: active ? "2px solid var(--c-primary)" : "2px solid transparent",
                fontWeight: active ? 700 : 500,
                transition: "all 120ms ease",
              }}
            >
              <Icon name={item.icon} size={18} />
              <span className="label-sm" style={{ fontSize: 11 }}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </nav>

      {/* Footer links */}
      <div className="hairline-t" style={{ marginTop: 16, paddingTop: 16, display: "flex", flexDirection: "column", gap: 4 }}>
        <a
          href="https://github.com/Toaster496/Inavative-solutions"
          target="_blank"
          rel="noopener noreferrer"
          className="no-underline flex items-center label-sm"
          style={{ gap: 12, padding: "6px 14px", fontSize: 10, color: "var(--c-on-surface-variant)" }}
        >
          <Icon name="code" size={14} /> SOURCE_CODE
        </a>
        <a
          href="https://github.com/Toaster496/Inavative-solutions/blob/gh-pages/README.md"
          target="_blank"
          rel="noopener noreferrer"
          className="no-underline flex items-center label-sm"
          style={{ gap: 12, padding: "6px 14px", fontSize: 10, color: "var(--c-on-surface-variant)" }}
        >
          <Icon name="description" size={14} /> TECHNICAL_DOCS
        </a>
        <div
          className="font-mono"
          style={{
            marginTop: 12,
            padding: 8,
            background: "var(--c-surface-variant)",
            fontSize: 10,
            color: "rgba(93, 202, 165, 0.6)",
            textAlign: "center",
          }}
        >
          v2.4.0-STABLE
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
