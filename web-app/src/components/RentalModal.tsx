import React, { useState, useMemo } from "react";
import { Icon } from "./ui/Icon";
import { useAppStore } from "../store/appStore";
import { formatCpt } from "../lib/constants";
import type { MarketplaceListing } from "../lib/constants";

const DURATION_OPTIONS = [1, 6, 12, 24, 48];

interface RentalModalProps {
  listing: MarketplaceListing;
  onClose: () => void;
  onRented: () => void;
}

export const RentalModal: React.FC<RentalModalProps> = ({ listing, onClose, onRented }) => {
  const { coinBalance, rentGpu, loading } = useAppStore();
  const [hours, setHours] = useState(6);
  const [customHours, setCustomHours] = useState("");
  const [mode, setMode] = useState<"preset" | "custom">("preset");
  const [error, setError] = useState<string | null>(null);

  const totalCost = useMemo(() => {
    const h = mode === "custom" ? (parseFloat(customHours) || 0) : hours;
    return listing.pricePerHour * h;
  }, [listing.pricePerHour, hours, mode, customHours]);

  const balanceNum = coinBalance ? Number(coinBalance) / 1e18 : 0;
  const insufficient = totalCost > balanceNum;

  const handleRent = async () => {
    setError(null);
    const h = mode === "custom" ? (parseFloat(customHours) || 0) : hours;
    if (h <= 0) {
      setError("Duration must be greater than 0 hours");
      return;
    }
    if (h > 720) {
      setError("Maximum rental duration is 720 hours (30 days)");
      return;
    }
    if (insufficient) {
      setError(`Insufficient balance. Need ${totalCost.toFixed(2)} CPT but have ${balanceNum.toFixed(2)} CPT`);
      return;
    }
    try {
      await rentGpu(listing, h);
      onRented();
      onClose();
    } catch (err: any) {
      setError(err.message || "Failed to rent GPU");
    }
  };

  return (
    <div
      style={{
        position: "fixed", inset: 0, zIndex: 9999,
        background: "rgba(0,0,0,0.7)",
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: 24,
      }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        className="surface-low hairline"
        style={{
          width: "100%", maxWidth: 520,
          padding: 0,
          display: "flex", flexDirection: "column",
        }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between hairline-b"
          style={{ padding: "16px 20px", background: "var(--c-surface)" }}
        >
          <div className="flex items-center" style={{ gap: 10 }}>
            <div
              className="flex items-center justify-center"
              style={{
                width: 32, height: 32,
                border: "1px solid rgba(93, 202, 165, 0.3)",
                color: "var(--c-primary)",
              }}
            >
              <Icon name={listing.icon} size={16} />
            </div>
            <div>
              <h3 className="label-sm" style={{ fontSize: 14, fontWeight: 700, textTransform: "uppercase" }}>
                {listing.name}
              </h3>
              <span className="font-mono" style={{ fontSize: 10, color: "var(--c-outline)" }}>
                {listing.hardware}
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="btn btn-ghost btn-sm"
            style={{ padding: "4px 8px" }}
          >
            <Icon name="close" size={16} />
          </button>
        </div>

        {/* Body */}
        <div style={{ padding: "16px 20px", display: "flex", flexDirection: "column", gap: 16 }}>
          {/* Specs quick view */}
          <div className="surface-container" style={{ padding: 12, display: "flex", gap: 16 }}>
            <SpecItem label="Memory" value={listing.memory} />
            <SpecItem label="Region" value={listing.region} />
            <SpecItem label="Rate" value={`$${listing.pricePerHour.toFixed(2)}/hr`} />
          </div>

          {/* Duration */}
          <div>
            <label className="label-sm" style={{ fontSize: 10, color: "var(--c-outline)", textTransform: "uppercase", marginBottom: 8, display: "block" }}>
              Rental_Duration
            </label>
            <div className="flex" style={{ gap: 6, flexWrap: "wrap" }}>
              {DURATION_OPTIONS.map((d) => (
                <button
                  key={d}
                  onClick={() => { setMode("preset"); setHours(d); }}
                  className="label-sm"
                  style={{
                    padding: "6px 14px",
                    fontSize: 11,
                    border: `1px solid ${mode === "preset" && hours === d ? "var(--c-primary)" : "var(--c-outline-variant)"}`,
                    color: mode === "preset" && hours === d ? "var(--c-primary)" : "var(--c-outline)",
                    background: mode === "preset" && hours === d ? "var(--c-primary-faint)" : "transparent",
                    cursor: "pointer",
                    fontFamily: "var(--font-mono)",
                    textTransform: "uppercase",
                  }}
                >
                  {d}h
                </button>
              ))}
              <button
                onClick={() => setMode("custom")}
                className="label-sm"
                style={{
                  padding: "6px 14px",
                  fontSize: 11,
                  border: `1px solid ${mode === "custom" ? "var(--c-primary)" : "var(--c-outline-variant)"}`,
                  color: mode === "custom" ? "var(--c-primary)" : "var(--c-outline)",
                  background: mode === "custom" ? "var(--c-primary-faint)" : "transparent",
                  cursor: "pointer",
                  fontFamily: "var(--font-mono)",
                  textTransform: "uppercase",
                }}
              >
                Custom
              </button>
            </div>
            {mode === "custom" && (
              <div style={{ marginTop: 8 }}>
                <input
                  type="number"
                  min={0.5}
                  max={720}
                  step={0.5}
                  value={customHours}
                  onChange={(e) => setCustomHours(e.target.value)}
                  className="input"
                  placeholder="Enter hours (max 720)"
                  style={{ width: "100%" }}
                />
              </div>
            )}
          </div>

          {/* Cost breakdown */}
          <div className="surface-lowest hairline" style={{ padding: 12 }}>
            <div className="flex justify-between" style={{ marginBottom: 8 }}>
              <span className="label-sm" style={{ fontSize: 10, color: "var(--c-outline)", textTransform: "uppercase" }}>
                Rate
              </span>
              <span className="font-mono" style={{ fontSize: 11, color: "var(--c-on-surface)" }}>
                ${listing.pricePerHour.toFixed(2)} / hour
              </span>
            </div>
            <div className="flex justify-between" style={{ marginBottom: 8 }}>
              <span className="label-sm" style={{ fontSize: 10, color: "var(--c-outline)", textTransform: "uppercase" }}>
                Duration
              </span>
              <span className="font-mono" style={{ fontSize: 11, color: "var(--c-on-surface)" }}>
                {mode === "custom" ? (parseFloat(customHours) || 0).toFixed(1) : hours}h
              </span>
            </div>
            <div className="flex justify-between hairline-t" style={{ paddingTop: 8 }}>
              <span className="label-sm" style={{ fontSize: 10, color: "var(--c-primary)", textTransform: "uppercase" }}>
                Total Cost
              </span>
              <span className="font-mono text-primary tabular-nums" style={{ fontSize: 16, fontWeight: 700 }}>
                {totalCost.toFixed(2)} CPT
              </span>
            </div>
          </div>

          {/* Balance */}
          <div className="flex justify-between">
            <span className="label-sm" style={{ fontSize: 10, color: "var(--c-outline)", textTransform: "uppercase" }}>
              Wallet Balance
            </span>
            <span className={`font-mono tabular-nums ${insufficient ? "text-error" : "text-primary"}`} style={{ fontSize: 12 }}>
              {formatCpt(coinBalance)} CPT
            </span>
          </div>

          {/* Error */}
          {error && (
            <div className="hairline" style={{ borderColor: "var(--c-error)", background: "rgba(255, 180, 171, 0.06)", padding: 10 }}>
              <p className="font-mono text-error" style={{ fontSize: 10, textTransform: "uppercase" }}>! {error}</p>
            </div>
          )}

          {/* Actions */}
          <div className="flex" style={{ gap: 8 }}>
            <button
              onClick={onClose}
              className="btn btn-ghost"
              style={{ flex: 1, padding: "10px 16px", fontSize: 11 }}
            >
              Cancel
            </button>
            <button
              onClick={handleRent}
              disabled={loading || insufficient}
              className="btn btn-primary"
              style={{ flex: 1, padding: "10px 16px", fontSize: 11 }}
            >
              <Icon name="rocket_launch" size={14} />
              {loading ? "Processing..." : "Confirm_Rent"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const SpecItem: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <div>
    <span className="label-sm" style={{ fontSize: 9, color: "var(--c-on-surface-variant)", textTransform: "uppercase", display: "block" }}>
      {label}
    </span>
    <span className="font-mono" style={{ fontSize: 11, color: "var(--c-on-surface)", marginTop: 2 }}>
      {value}
    </span>
  </div>
);

export default RentalModal;
