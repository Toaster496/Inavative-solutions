import React from "react";
import { Icon } from "../ui/Icon";

export const Footer: React.FC = () => {
  return (
    <footer className="w-full bg-surface-lowest hairline-t" style={{ padding: "24px 0" }}>
      <div className="container-page flex flex-col md:flex-row justify-between items-center" style={{ gap: 16 }}>
        <div className="flex flex-col md:flex-row items-center" style={{ gap: 16 }}>
          <span
            className="font-mono text-primary"
            style={{ fontSize: 13, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase" }}
          >
            ComputeMarket_
          </span>
          <span
            className="label-sm"
            style={{ fontSize: 10, color: "var(--c-on-surface-variant)", opacity: 0.7 }}
          >
            © 2024 DECENTRALIZED_GPU_NET_RUNNER
          </span>
        </div>

        <div className="flex items-center" style={{ gap: 24 }}>
          {["GitHub", "Explorer", "Status", "Terms"].map((l) => (
            <a
              key={l}
              href="#"
              onClick={(e) => e.preventDefault()}
              className="label-sm no-underline"
              style={{ fontSize: 10, color: "var(--c-on-surface-variant)", transition: "color 120ms ease" }}
              onMouseEnter={(e) => (e.currentTarget.style.color = "var(--c-primary)")}
              onMouseLeave={(e) => (e.currentTarget.style.color = "var(--c-on-surface-variant)")}
            >
              _{l}
            </a>
          ))}
        </div>

        <div className="flex items-center" style={{ gap: 12 }}>
          <Icon
            name="language"
            size={18}
            className="text-outline cursor-pointer hover:text-primary transition-colors"
          />
          <Icon
            name="terminal"
            size={18}
            className="text-outline cursor-pointer hover:text-primary transition-colors"
          />
        </div>
      </div>
    </footer>
  );
};

export default Footer;
