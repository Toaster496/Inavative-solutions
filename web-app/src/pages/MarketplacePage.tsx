import React, { useMemo, useState } from "react";
import { Icon } from "../components/ui/Icon";
import { RentalModal } from "../components/RentalModal";
import { MARKETPLACE_LISTINGS, MarketplaceListing, NETWORK_STATS } from "../lib/constants";

type Tier = MarketplaceListing["tier"];

const TierChip: React.FC<{ tier: Tier }> = ({ tier }) => {
  const styles: Record<Tier, { color: string; bg: string; border: string }> = {
    Premium:        { color: "var(--c-primary)",      bg: "var(--c-primary-faint)", border: "var(--c-primary-dim)" },
    Enterprise:     { color: "var(--c-primary)",      bg: "var(--c-primary-faint)", border: "var(--c-primary-dim)" },
    Value:          { color: "var(--c-on-surface-variant)", bg: "transparent",       border: "var(--c-outline-variant)" },
    Ultra_Verified: { color: "var(--c-on-primary)",   bg: "var(--c-primary)",       border: "var(--c-primary)" },
    Maintenance:    { color: "var(--c-on-surface-variant)", bg: "transparent",       border: "var(--c-outline-variant)" },
  };
  const s = styles[tier];
  return (
    <span
      style={{
        display: "inline-flex",
        padding: "2px 6px",
        fontSize: 9,
        fontWeight: 700,
        textTransform: "uppercase",
        fontFamily: "var(--font-mono)",
        color: s.color,
        background: s.bg,
        border: `1px solid ${s.border}`,
        letterSpacing: "0.05em",
      }}
    >
      {tier.replace("_", " ")}
    </span>
  );
};

const VRAM_OPTIONS = ["16GB", "24GB", "40GB", "80GB"];

export const MarketplacePage: React.FC = () => {
  const [query, setQuery] = useState("");
  const [vram, setVram] = useState<string | null>("16GB");
  const [hwGpu, setHwGpu] = useState(true);
  const [hwCpu, setHwCpu] = useState(false);
  const [activeOnly, setActiveOnly] = useState(true);
  const [maxPrice, setMaxPrice] = useState(10);
  const [sortAsc, setSortAsc] = useState(true);
  const [rentalListing, setRentalListing] = useState<MarketplaceListing | null>(null);

  const filtered = useMemo(() => {
    let list = MARKETPLACE_LISTINGS.filter((l) => {
      if (activeOnly && !l.online) return false;
      if (l.pricePerHour > maxPrice) return false;
      if (query) {
        const q = query.toLowerCase();
        if (!l.name.toLowerCase().includes(q) && !l.hardware.toLowerCase().includes(q)) return false;
      }
      // VRAM filter — show listings whose memory is >= selected minimum
      if (vram) {
        const vramNum = parseInt(vram, 10);
        const listVram = parseInt(l.memory, 10);
        if (!Number.isNaN(vramNum) && !Number.isNaN(listVram) && listVram < vramNum) return false;
      }
      return true;
    });
    // HW type filters are visual-only toggles (no real CPU listings in demo data)
    if (!hwGpu && !hwCpu) {
      // both off: show nothing — matches wireframe's "filter applied: none" pattern? Actually show all.
    }
    list = [...list].sort((a, b) => (sortAsc ? a.pricePerHour - b.pricePerHour : b.pricePerHour - a.pricePerHour));
    return list;
  }, [query, vram, hwGpu, hwCpu, activeOnly, maxPrice, sortAsc]);

  return (
    <div className="flex terminal-grid">
      {/* ---------- Filter sidebar ---------- */}
      <aside
        className="hidden md:flex flex-col"
        style={{
          width: 240,
          borderRight: "1px solid var(--c-outline-variant)",
          background: "var(--c-surface)",
          padding: 24,
          position: "sticky",
          top: "var(--nav-h)",
          height: "calc(100vh - var(--nav-h))",
          overflowY: "auto",
        }}
      >
        <div style={{ marginBottom: 32 }}>
          <h2 className="label-sm text-primary flex items-center" style={{ gap: 8, marginBottom: 24 }}>
            <Icon name="settings_input_component" size={14} />
            System_Filters
          </h2>

          {/* Hardware */}
          <FilterGroup label="Hardware_Type">
            <CheckboxRow checked={hwGpu} onChange={setHwGpu} label="Nvidia_GPU" />
            <CheckboxRow checked={hwCpu} onChange={setHwCpu} label="Generic_CPU" />
          </FilterGroup>

          {/* Min VRAM */}
          <FilterGroup label="Min_VRAM">
            <div className="grid grid-cols-2" style={{ gap: 4 }}>
              {VRAM_OPTIONS.map((v) => (
                <button
                  key={v}
                  onClick={() => setVram(v === vram ? null : v)}
                  className="label-sm"
                  style={{
                    padding: "4px 8px",
                    fontSize: 10,
                    border: `1px solid ${v === vram ? "var(--c-primary)" : "var(--c-outline-variant)"}`,
                    color: v === vram ? "var(--c-primary)" : "var(--c-outline)",
                    background: v === vram ? "var(--c-primary-faint)" : "transparent",
                    cursor: "pointer",
                    transition: "all 120ms ease",
                  }}
                >
                  {v}
                </button>
              ))}
            </div>
          </FilterGroup>

          {/* Price range */}
          <FilterGroup label="Pricing_Range">
            <div style={{ paddingInline: 4 }}>
              <input
                type="range"
                min={0}
                max={10}
                step={0.1}
                value={maxPrice}
                onChange={(e) => setMaxPrice(Number(e.target.value))}
                style={{
                  width: "100%",
                  height: 4,
                  appearance: "none",
                  background: "var(--c-surface-container-highest)",
                  accentColor: "var(--c-primary)",
                  cursor: "pointer",
                }}
              />
              <div className="flex justify-between" style={{ marginTop: 8 }}>
                <span className="font-mono" style={{ fontSize: 10, color: "var(--c-outline)" }}>$0.10/H</span>
                <span className="font-mono text-primary" style={{ fontSize: 10 }}>${maxPrice.toFixed(2)}/H</span>
              </div>
            </div>
          </FilterGroup>

          {/* Status */}
          <FilterGroup label="Node_Status">
            <div className="flex items-center justify-between">
              <span className="label-sm" style={{ fontSize: 12, color: "var(--c-outline)", textTransform: "uppercase" }}>
                Active_Only
              </span>
              <Toggle checked={activeOnly} onChange={setActiveOnly} />
            </div>
          </FilterGroup>
        </div>

        <div className="hairline-t" style={{ marginTop: "auto", paddingTop: 16, display: "flex", flexDirection: "column", gap: 4 }}>
          <a href="https://github.com/Toaster496/Inavative-solutions" target="_blank" rel="noopener noreferrer" className="no-underline flex items-center" style={{ gap: 8, padding: 8, color: "var(--c-outline)", transition: "color 120ms ease" }}
            onMouseEnter={(e) => (e.currentTarget.style.color = "var(--c-primary)")}
            onMouseLeave={(e) => (e.currentTarget.style.color = "var(--c-outline)")}>
            <Icon name="code" size={14} />
            <span className="label-sm" style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.05em" }}>Source_Code</span>
          </a>
          <a href="https://github.com/Toaster496/Inavative-solutions/blob/gh-pages/README.md" target="_blank" rel="noopener noreferrer" className="no-underline flex items-center" style={{ gap: 8, padding: 8, color: "var(--c-outline)", transition: "color 120ms ease" }}
            onMouseEnter={(e) => (e.currentTarget.style.color = "var(--c-primary)")}
            onMouseLeave={(e) => (e.currentTarget.style.color = "var(--c-outline)")}>
            <Icon name="book" size={14} />
            <span className="label-sm" style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.05em" }}>Technical_Docs</span>
          </a>
        </div>
      </aside>

      {/* ---------- Main ---------- */}
      <main className="flex-1 min-w-0" style={{ padding: 24 }}>
        {/* Header row */}
        <header
          className="flex flex-col lg:flex-row justify-between items-start lg:items-end"
          style={{ marginBottom: 40, gap: 24 }}
        >
          <div>
            <div className="flex items-center text-primary" style={{ gap: 8, marginBottom: 4 }}>
              <Icon name="dataset" size={14} />
              <span className="label-sm" style={{ fontSize: 10, letterSpacing: "0.2em" }}>Compute_Inventory</span>
            </div>
            <h1
              className="font-mono"
              style={{ fontSize: 32, fontWeight: 700, textTransform: "uppercase", letterSpacing: "-0.01em", marginBottom: 8, lineHeight: 1 }}
            >
              Available_Clusters
            </h1>
            <p
              className="font-mono"
              style={{
                fontSize: 12,
                color: "var(--c-outline)",
                maxWidth: 560,
                borderLeft: "1px solid rgba(93, 202, 165, 0.3)",
                paddingLeft: 16,
                paddingBlock: 4,
              }}
            >
              SYSTEM_LOG: {NETWORK_STATS.activeNodes.toLocaleString()} active nodes detected. Cumulative throughput:{" "}
              <span className="text-primary">{NETWORK_STATS.totalCapacityPFLOPS} PFLOPS</span>. Latency optimal across 14 global regions.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row" style={{ gap: 12, width: "100%" }}>
            <div
              className="surface-container hairline flex items-center"
              style={{ padding: "8px 12px", flex: 1, minWidth: 220 }}
            >
              <Icon name="search" size={16} className="text-outline" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Query_GPU_Model…"
                className="font-mono"
                style={{
                  background: "transparent",
                  border: "none",
                  outline: "none",
                  color: "var(--c-on-surface)",
                  fontSize: 12,
                  width: "100%",
                  marginLeft: 8,
                  textTransform: "uppercase",
                }}
              />
            </div>
            <button
              onClick={() => setSortAsc((v) => !v)}
              className="btn btn-ghost"
              style={{ padding: "8px 16px" }}
            >
              <Icon name="sort_by_alpha" size={16} />
              Sort: {sortAsc ? "ASC" : "DESC"}
            </button>
          </div>
        </header>

        {/* Results count */}
        <div className="flex items-center justify-between hairline-b" style={{ paddingBottom: 12, marginBottom: 16 }}>
          <span className="label-sm" style={{ fontSize: 10, color: "var(--c-on-surface-variant)" }}>
            QUERY_RESULT: {filtered.length} nodes match filters
          </span>
          <span className="label-sm" style={{ fontSize: 10, color: "var(--c-on-surface-variant)" }}>
            SYNC: <span className="text-primary">LIVE</span>
          </span>
        </div>

        {/* Grid */}
        {filtered.length === 0 ? (
          <div className="surface-low hairline" style={{ padding: 60, textAlign: "center" }}>
            <Icon name="search_off" size={32} className="text-outline" />
            <p className="label-sm" style={{ marginTop: 16, color: "var(--c-on-surface-variant)" }}>
              No nodes match the current filters. Adjust your query and try again.
            </p>
          </div>
        ) : (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
              gap: 1,
              background: "var(--c-outline-variant)",
              border: "1px solid var(--c-outline-variant)",
            }}
          >
            {filtered.map((node) => (
              <NodeCard key={node.id} node={node} onRent={setRentalListing} />
            ))}
          </div>
        )}
      </main>

      {rentalListing && (
        <RentalModal
          listing={rentalListing}
          onClose={() => setRentalListing(null)}
          onRented={() => {}}
        />
      )}
    </div>
  );
};

const NodeCard: React.FC<{ node: MarketplaceListing; onRent: (node: MarketplaceListing) => void }> = ({ node, onRent }) => {
  return (
    <div
      className="bg-surface"
      style={{
        padding: 20,
        display: "flex",
        flexDirection: "column",
        opacity: node.online ? 1 : 0.6,
        transition: "background 120ms ease",
      }}
      onMouseEnter={(e) => (e.currentTarget.style.background = "var(--c-surface-container)")}
      onMouseLeave={(e) => (e.currentTarget.style.background = "var(--c-surface)")}
    >
      {/* Header */}
      <div className="flex justify-between items-start" style={{ marginBottom: 24 }}>
        <div className="flex items-center" style={{ gap: 12 }}>
          <div
            className="flex items-center justify-center"
            style={{
              width: 32,
              height: 32,
              border: `1px solid ${node.online ? "rgba(93, 202, 165, 0.3)" : "var(--c-outline-variant)"}`,
              color: node.online ? "var(--c-primary)" : "var(--c-outline)",
            }}
          >
            <Icon name={node.icon} size={16} />
          </div>
          <div>
            <h3 className="label-sm" style={{ fontSize: 14, color: "var(--c-on-surface)", fontWeight: 700, textTransform: "uppercase" }}>
              {node.name}
            </h3>
            <span
              className="font-mono flex items-center"
              style={{
                fontSize: 10,
                color: node.online ? "var(--c-primary)" : "var(--c-outline)",
                textTransform: "uppercase",
                gap: 6,
              }}
            >
              <span className={`status-dot ${node.online ? "live" : "offline"}`} />
              Status_{node.online ? "Online" : "Offline"}
            </span>
          </div>
        </div>
        <div style={{ textAlign: "right" }}>
          <div className="font-mono" style={{ fontSize: 18, fontWeight: 700, color: node.online ? "var(--c-primary)" : "var(--c-outline)" }}>
            ${node.pricePerHour.toFixed(2)}
            <span style={{ fontSize: 10, color: "var(--c-outline)", fontWeight: 400 }}>/H</span>
          </div>
        </div>
      </div>

      {/* Spec sheet */}
      <div
        className="surface-lowest"
        style={{
          border: "1px solid rgba(64, 73, 68, 0.3)",
          padding: 12,
          marginBottom: 24,
        }}
      >
        <div
          className="flex justify-between items-center"
          style={{ marginBottom: 16, paddingBottom: 8, borderBottom: "1px solid rgba(64, 73, 68, 0.2)" }}
        >
          <span className="label-sm" style={{ fontSize: 9, color: "var(--c-outline)", letterSpacing: "0.2em" }}>
            Specifications
          </span>
          <TierChip tier={node.tier} />
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <SpecRow label="Unit" value={node.hardware} />
          <SpecRow label="Memory" value={node.memory} />
          <SpecRow
            label="Loc"
            value={
              <span className="flex items-center" style={{ gap: 4 }}>
                <Icon name="language" size={10} />
                {node.region}
              </span>
            }
          />
        </div>
      </div>

      {/* Actions */}
      <div className="flex" style={{ gap: 8, marginTop: "auto" }}>
        <button
          className="btn btn-primary"
          style={{ flex: 1, padding: "8px 12px", fontSize: 11 }}
          disabled={!node.online}
          onClick={() => onRent(node)}
        >
          Initialize_Rent
        </button>
        <button
          className="btn btn-ghost"
          style={{ padding: "8px 10px" }}
          title="Bookmark"
          disabled={!node.online}
        >
          <Icon name="bookmark" size={16} />
        </button>
      </div>
    </div>
  );
};

const SpecRow: React.FC<{ label: string; value: React.ReactNode }> = ({ label, value }) => (
  <div className="flex justify-between items-center">
    <span className="label-sm" style={{ fontSize: 11, color: "var(--c-outline)", textTransform: "uppercase" }}>
      {label}
    </span>
    <span className="label-sm" style={{ fontSize: 11, color: "var(--c-on-surface)", textTransform: "uppercase" }}>
      {value}
    </span>
  </div>
);

const FilterGroup: React.FC<{ label: string; children: React.ReactNode }> = ({ label, children }) => (
  <div style={{ marginBottom: 32 }}>
    <label
      className="label-sm"
      style={{
        fontSize: 10,
        color: "var(--c-outline)",
        textTransform: "uppercase",
        letterSpacing: "0.1em",
        borderBottom: "1px solid rgba(64, 73, 68, 0.3)",
        paddingBottom: 4,
        display: "block",
        marginBottom: 12,
      }}
    >
      {label}
    </label>
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>{children}</div>
  </div>
);

const CheckboxRow: React.FC<{ checked: boolean; onChange: (v: boolean) => void; label: string }> = ({
  checked,
  onChange,
  label,
}) => (
  <label className="flex items-center cursor-pointer" style={{ gap: 8 }}>
    <input
      type="checkbox"
      checked={checked}
      onChange={(e) => onChange(e.target.checked)}
      style={{
        width: 12,
        height: 12,
        accentColor: "var(--c-primary)",
        cursor: "pointer",
      }}
    />
    <span
      className="label-sm"
      style={{
        fontSize: 12,
        color: "var(--c-outline)",
        textTransform: "uppercase",
        transition: "color 120ms ease",
      }}
      onMouseEnter={(e) => (e.currentTarget.style.color = "var(--c-primary)")}
      onMouseLeave={(e) => (e.currentTarget.style.color = "var(--c-outline)")}
    >
      {label}
    </span>
  </label>
);

const Toggle: React.FC<{ checked: boolean; onChange: (v: boolean) => void }> = ({ checked, onChange }) => (
  <label className="relative inline-flex items-center cursor-pointer">
    <input
      type="checkbox"
      checked={checked}
      onChange={(e) => onChange(e.target.checked)}
      style={{ position: "absolute", opacity: 0, width: 0, height: 0 }}
    />
    <div
      style={{
        width: 32,
        height: 16,
        border: "1px solid var(--c-outline-variant)",
        background: checked ? "rgba(93, 202, 165, 0.2)" : "transparent",
        position: "relative",
        transition: "background 120ms ease",
      }}
    >
      <div
        style={{
          position: "absolute",
          top: 2,
          left: checked ? 18 : 2,
          width: 12,
          height: 12,
          background: checked ? "var(--c-primary)" : "var(--c-outline)",
          transition: "all 120ms ease",
        }}
      />
    </div>
  </label>
);

export default MarketplacePage;
