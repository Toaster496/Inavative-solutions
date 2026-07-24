import React, { useEffect, useState } from "react";
import { Icon } from "../components/ui/Icon";
import { useAppStore, type Rental } from "../store/appStore";
import {
  HARDWARE_LOGS,
  EXECUTING_JOBS,
  formatCpt,
  shortAddr,
} from "../lib/constants";

export const DashboardPage: React.FC = () => {
  const { isHost, hostInfo, submitHeartbeat, loading, rentals, terminateRental } = useAppStore();
  const [tab, setTab] = useState<"executing" | "queue" | "archive" | "rentals">("executing");
  const [, setTick] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), 1000);
    return () => clearInterval(id);
  }, []);

  const allRentals = rentals;

  return (
    <div style={{ padding: 24 }}>
      {/* Header */}
      <div style={{ marginBottom: 32, borderLeft: "2px solid var(--c-primary)", paddingLeft: 16 }}>
        <h1
          className="font-mono"
          style={{ fontSize: 24, fontWeight: 700, textTransform: "uppercase", marginBottom: 4, letterSpacing: "-0.01em" }}
        >
          OPERATOR_CONSOLE.v1
        </h1>
        <p
          className="label-sm"
          style={{ fontSize: 11, color: "var(--c-on-surface-variant)", textTransform: "uppercase", letterSpacing: "0.1em" }}
        >
          Hardware Node Management // Job Execution Monitoring // Earnings Tracker
        </p>
      </div>

      {/* Stats bento */}
      <div className="grid grid-cols-1 md:grid-cols-4" style={{ gap: 16, marginBottom: 40 }}>
        <StatCard
          label="Stake_Balance"
          value={isHost ? formatCpt(hostInfo?.stake) : "0.00"}
          unit="CPT"
          icon="lock"
        />
        <StatCard
          label="Total_Earnings"
          value={isHost ? formatCpt(hostInfo?.stake ? hostInfo.stake / 4n : 0n) : "0.00"}
          unit="CPT"
          icon="payments"
        />
        <StatCard
          label="Active_Tasks"
          value={isHost ? String(hostInfo?.completedJobs || 0n) : "0"}
          unit="UNIT"
          icon="bolt"
          color="var(--c-on-surface)"
        />
        <StatCard
          label="Reputation"
          value={isHost ? String(hostInfo?.reputation || 0n) : "—"}
          unit="SCORE"
          icon="grade"
          color="var(--c-on-surface)"
        />
      </div>

      {/* Hardware + Host config */}
      <div className="grid grid-cols-1 lg:grid-cols-3" style={{ gap: 24, marginBottom: 40 }}>
        <div className="lg:col-span-2 surface-low hairline" style={{ padding: 24 }}>
          <div className="flex justify-between items-center" style={{ marginBottom: 24 }}>
            <h2 className="label-sm text-primary" style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <Icon name="developer_board" size={14} /> HARDWARE_DETECTION_LOGS
            </h2>
            <span className="label-sm text-primary flex items-center" style={{ gap: 8, fontSize: 10 }}>
              <span className="status-dot live" /> LIVE_FEED
            </span>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {HARDWARE_LOGS.map((hw) => (
              <div
                key={hw.model}
                className="surface-lowest hairline flex items-center justify-between"
                style={{ padding: 16, borderColor: "rgba(64, 73, 68, 0.3)" }}
              >
                <div className="flex items-center" style={{ gap: 16 }}>
                  <Icon name={hw.icon} size={24} className="text-primary" />
                  <div>
                    <h4 className="label-sm" style={{ fontSize: 12, color: "var(--c-on-surface)" }}>{hw.model}</h4>
                    <p className="font-mono" style={{ fontSize: 10, color: "var(--c-on-surface-variant)" }}>{hw.spec}</p>
                  </div>
                </div>
                <div style={{ textAlign: "right", minWidth: 140 }}>
                  <p className="label-sm" style={{ fontSize: 10, color: "var(--c-on-surface-variant)", marginBottom: 6, textTransform: "uppercase" }}>
                    Load
                  </p>
                  <div className="progress" style={{ width: "100%" }}>
                    <div className="progress-fill" style={{ width: `${hw.loadPct}%` }} />
                  </div>
                  <p className="font-mono text-primary" style={{ fontSize: 10, marginTop: 4, textAlign: "right" }}>
                    {hw.loadPct}%
                  </p>
                </div>
              </div>
            ))}
          </div>

          {isHost && (
            <div className="hairline-t" style={{ marginTop: 24, paddingTop: 24, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 16 }}>
              <div>
                <p className="label-sm" style={{ fontSize: 10, color: "var(--c-on-surface-variant)" }}>LAST_HEARTBEAT</p>
                <p className="font-mono" style={{ fontSize: 12, color: "var(--c-on-surface)" }}>
                  {hostInfo?.lastHeartbeat ? new Date(Number(hostInfo.lastHeartbeat) * 1000).toLocaleString() : "—"}
                </p>
              </div>
              <button
                onClick={() => submitHeartbeat().catch(console.error)}
                className="btn btn-ghost"
                disabled={loading}
              >
                <Icon name="favorite" size={14} />
                {loading ? "Submitting…" : "Submit_Heartbeat"}
              </button>
            </div>
          )}
        </div>

        {/* Host config / registration */}
        <div className="surface-low hairline" style={{ padding: 24 }}>
          <h2 className="label-sm text-primary" style={{ marginBottom: 24, display: "flex", alignItems: "center", gap: 8 }}>
            <Icon name="tune" size={14} /> HOST_CONFIG
          </h2>
          {isHost ? <HostProfile /> : <RegisterHostForm />}
        </div>
      </div>

      {/* Executing jobs tabs */}
      <div className="flex items-center justify-between hairline-b" style={{ marginBottom: 24 }}>
        <div className="flex" style={{ gap: 32 }}>
          <DashTab active={tab === "executing"} onClick={() => setTab("executing")} label="Executing" count={EXECUTING_JOBS.length} />
          <DashTab active={tab === "queue"} onClick={() => setTab("queue")} label="Queue" count={0} />
          <DashTab active={tab === "archive"} onClick={() => setTab("archive")} label="Archive" count={Number(hostInfo?.completedJobs || 0n)} />
          <DashTab active={tab === "rentals"} onClick={() => setTab("rentals")} label="My Rentals" count={allRentals.length} />
        </div>
        <span className="label-sm" style={{ fontSize: 10, color: "var(--c-on-surface-variant)", textTransform: "uppercase", letterSpacing: "0.1em", opacity: 0.5 }}>
          Filter_Applied: None
        </span>
      </div>

      {/* Job cards */}
      {tab === "executing" && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))", gap: 16 }}>
          {EXECUTING_JOBS.map((job) => (
            <ExecutingJobCard key={job.id} job={job} />
          ))}
        </div>
      )}
      {tab === "queue" && (
        <div className="surface-low hairline" style={{ padding: 60, textAlign: "center" }}>
          <Icon name="hourglass_empty" size={32} className="text-outline" />
          <p className="label-sm" style={{ marginTop: 16, color: "var(--c-on-surface-variant)" }}>
            [INFO] No jobs in queue. New work will appear here when clients post matching tasks.
          </p>
        </div>
      )}
      {tab === "archive" && (
        <div className="surface-low hairline" style={{ padding: 60, textAlign: "center" }}>
          <Icon name="archive" size={32} className="text-outline" />
          <p className="label-sm" style={{ marginTop: 16, color: "var(--c-on-surface-variant)" }}>
            [INFO] {Number(hostInfo?.completedJobs || 0n)} job(s) completed historically. Connect an indexer to load full archive.
          </p>
        </div>
      )}
      {tab === "rentals" && (
        <RentalsDashboard rentals={allRentals} onTerminate={(id) => terminateRental(id).catch(console.error)} />
      )}
    </div>
  );
};

const StatCard: React.FC<{
  label: string;
  value: string;
  unit: string;
  icon: string;
  color?: string;
}> = ({ label, value, unit, icon, color = "var(--c-primary)" }) => (
  <div className="surface-low hairline" style={{ padding: 20, display: "flex", flexDirection: "column", gap: 4 }}>
    <div className="flex items-center justify-between">
      <span className="label-sm" style={{ fontSize: 10, color: "var(--c-on-surface-variant)", textTransform: "uppercase" }}>
        {label}
      </span>
      <Icon name={icon} size={14} className="text-outline" />
    </div>
    <div className="flex items-baseline" style={{ gap: 8 }}>
      <span className="font-mono tabular-nums" style={{ fontSize: 22, fontWeight: 700, color }}>
        {value}
      </span>
      <span className="label-sm" style={{ fontSize: 10, color: "var(--c-on-surface-variant)" }}>{unit}</span>
    </div>
  </div>
);

const HostProfile: React.FC = () => {
  const { hostInfo, account } = useAppStore();
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div className="surface-container" style={{ padding: 12 }}>
        <p className="label-sm" style={{ fontSize: 9, color: "var(--c-on-surface-variant)", textTransform: "uppercase" }}>NODE_ID</p>
        <p className="font-mono text-primary" style={{ fontSize: 13, marginTop: 4, wordBreak: "break-all" }}>
          {hostInfo?.nodeInfo || shortAddr(account, 8, 6)}
        </p>
      </div>
      <div className="grid grid-cols-2" style={{ gap: 8 }}>
        <SpecTile label="GPU_COUNT" value={String(hostInfo?.gpuCount || 0n)} />
        <SpecTile label="CPU_CORES" value={String(hostInfo?.cpuCores || 0n)} />
        <SpecTile label="RAM_GB" value={String(hostInfo?.ramGB || 0n)} />
        <SpecTile label="CPU_ONLY" value={hostInfo?.isCpuOnly ? "YES" : "NO"} />
      </div>
      <div className="surface-container" style={{ padding: 12 }}>
        <p className="label-sm" style={{ fontSize: 9, color: "var(--c-on-surface-variant)", textTransform: "uppercase" }}>UPTIME_START</p>
        <p className="font-mono" style={{ fontSize: 11, marginTop: 4 }}>
          {hostInfo?.uptimeStart ? new Date(Number(hostInfo.uptimeStart) * 1000).toLocaleString() : "—"}
        </p>
      </div>
      <div className="hairline-t" style={{ paddingTop: 16 }}>
        <p className="font-mono text-primary" style={{ fontSize: 10, textTransform: "uppercase" }}>
          &gt; STATUS: HOST_ACTIVE
        </p>
      </div>
    </div>
  );
};

const SpecTile: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <div className="surface-container" style={{ padding: 10 }}>
    <p className="label-sm" style={{ fontSize: 9, color: "var(--c-on-surface-variant)" }}>{label}</p>
    <p className="font-mono" style={{ fontSize: 14, color: "var(--c-on-surface)", fontWeight: 700, marginTop: 2 }}>{value}</p>
  </div>
);

const RegisterHostForm: React.FC = () => {
  const { registerHost, loading } = useAppStore();
  const [nodeInfo, setNodeInfo] = useState("");
  const [gpuCount, setGpuCount] = useState(1);
  const [cpuCores, setCpuCores] = useState(8);
  const [ramGB, setRamGB] = useState(16);
  const [cpuOnly, setCpuOnly] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!nodeInfo.trim()) {
      setError("Node ID is required (use a libp2p peer ID or hostname)");
      return;
    }
    try {
      await registerHost({
        nodeInfo,
        gpuCount: cpuOnly ? 0 : gpuCount,
        gpuIds: cpuOnly ? [] : Array.from({ length: gpuCount }, (_, i) => `GPU-${i}`),
        cpuCores,
        ramGB,
        cpuOnly,
      });
    } catch (err: any) {
      setError(err.reason || err.message || "Failed to register as host");
    }
  };

  return (
    <form onSubmit={onSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {error && (
        <div className="hairline" style={{ borderColor: "var(--c-error)", background: "rgba(255, 180, 171, 0.06)", padding: 10 }}>
          <p className="font-mono text-error" style={{ fontSize: 10, textTransform: "uppercase" }}>! {error}</p>
        </div>
      )}
      <div>
        <label className="label-sm" style={{ display: "block", marginBottom: 6, color: "var(--c-on-surface-variant)", fontSize: 10 }}>
          NODE_ID
        </label>
        <input
          type="text"
          value={nodeInfo}
          onChange={(e) => setNodeInfo(e.target.value)}
          className="input"
          placeholder="/ip4/.../tcp/.../p2p/..."
          required
        />
      </div>
      <div className="grid grid-cols-2" style={{ gap: 12 }}>
        <div>
          <label className="label-sm" style={{ display: "block", marginBottom: 6, color: "var(--c-on-surface-variant)", fontSize: 10 }}>
            GPU_COUNT
          </label>
          <input
            type="number"
            min={0}
            max={8}
            value={gpuCount}
            disabled={cpuOnly}
            onChange={(e) => setGpuCount(Number(e.target.value))}
            className="input"
          />
        </div>
        <div>
          <label className="label-sm" style={{ display: "block", marginBottom: 6, color: "var(--c-on-surface-variant)", fontSize: 10 }}>
            CPU_CORES
          </label>
          <input
            type="number"
            min={1}
            max={128}
            value={cpuCores}
            onChange={(e) => setCpuCores(Number(e.target.value))}
            className="input"
          />
        </div>
        <div>
          <label className="label-sm" style={{ display: "block", marginBottom: 6, color: "var(--c-on-surface-variant)", fontSize: 10 }}>
            RAM_GB
          </label>
          <input
            type="number"
            min={1}
            max={512}
            value={ramGB}
            onChange={(e) => setRamGB(Number(e.target.value))}
            className="input"
          />
        </div>
        <div>
          <label className="label-sm" style={{ display: "block", marginBottom: 6, color: "var(--c-on-surface-variant)", fontSize: 10 }}>
            CPU_ONLY
          </label>
          <button
            type="button"
            onClick={() => setCpuOnly((v) => !v)}
            className="input"
            style={{
              cursor: "pointer",
              color: cpuOnly ? "var(--c-primary)" : "var(--c-on-surface-variant)",
              borderColor: cpuOnly ? "var(--c-primary)" : "var(--c-outline-variant)",
              textAlign: "left",
            }}
          >
            {cpuOnly ? "ON" : "OFF"}
          </button>
        </div>
      </div>
      <p className="font-mono" style={{ fontSize: 10, color: "var(--c-on-surface-variant)", textTransform: "uppercase" }}>
        NOTE: MIN_STAKE OF 100 CPT WILL BE LOCKED AS ESCROW
      </p>
      <button type="submit" className="btn btn-primary btn-block" disabled={loading} style={{ padding: "12px 16px" }}>
        <Icon name="dns" size={14} />
        {loading ? "Registering…" : "Register_As_Host"}
      </button>
    </form>
  );
};

const ExecutingJobCard: React.FC<{ job: (typeof EXECUTING_JOBS)[number] }> = ({ job }) => (
  <div
    className="surface-low hairline"
    style={{ padding: 20, position: "relative", transition: "border-color 120ms ease" }}
    onMouseEnter={(e) => (e.currentTarget.style.borderColor = "rgba(93, 202, 165, 0.5)")}
    onMouseLeave={(e) => (e.currentTarget.style.borderColor = "var(--c-outline-variant)")}
  >
    <div style={{ position: "absolute", top: 0, right: 0, padding: 12 }}>
      <span className="chip chip-primary" style={{ fontSize: 9 }}>S:3</span>
    </div>
    <div className="flex items-center" style={{ gap: 12, marginBottom: 16 }}>
      <div className="surface-container hairline flex items-center justify-center" style={{ width: 32, height: 32 }}>
        <Icon name={job.icon} size={16} className="text-on-surface-variant" />
      </div>
      <div>
        <p className="font-mono text-primary" style={{ fontSize: 12, fontWeight: 700 }}>{job.id}</p>
        <p className="label-sm" style={{ fontSize: 10, color: "var(--c-on-surface-variant)", textTransform: "uppercase" }}>
          {job.label}
        </p>
      </div>
    </div>
    <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 16 }}>
      <div className="flex justify-between">
        <span className="label-sm" style={{ fontSize: 10, color: "var(--c-on-surface-variant)", textTransform: "uppercase" }}>Rate:</span>
        <span className="font-mono text-primary" style={{ fontSize: 11 }}>{job.rateCptPerHour.toFixed(2)} CPT/hr</span>
      </div>
      <div className="flex justify-between">
        <span className="label-sm" style={{ fontSize: 10, color: "var(--c-on-surface-variant)", textTransform: "uppercase" }}>Progress:</span>
        <span className="font-mono" style={{ fontSize: 11, color: "var(--c-on-surface)" }}>{job.progressPct}%</span>
      </div>
      <div className="progress">
        <div className="progress-fill" style={{ width: `${job.progressPct}%` }} />
      </div>
    </div>
    <div className="surface-lowest hairline" style={{ padding: 8 }}>
      <span className="label-sm" style={{ fontSize: 9, color: "var(--c-on-surface-variant)", display: "block", textTransform: "uppercase", opacity: 0.6 }}>
        RESULT_HASH:
      </span>
      <code className="font-mono break-all" style={{ fontSize: 9, color: "rgba(93, 202, 165, 0.7)", lineHeight: 1 }}>
        {job.resultHash}
      </code>
    </div>
  </div>
);

const RentalsDashboard: React.FC<{ rentals: Rental[]; onTerminate: (id: string) => void }> = ({ rentals, onTerminate }) => {
  if (rentals.length === 0) {
    return (
      <div className="surface-low hairline" style={{ padding: 60, textAlign: "center" }}>
        <Icon name="shopping_bag" size={32} className="text-outline" />
        <p className="label-sm" style={{ marginTop: 16, color: "var(--c-on-surface-variant)" }}>
          [INFO] No rentals yet. Browse the Marketplace to rent GPU compute.
        </p>
      </div>
    );
  }

  const totalAccrued = rentals.reduce((sum, r) => {
    const end = r.endedAt || Date.now();
    return sum + r.pricePerHour * ((end - r.startedAt) / 3600000);
  }, 0);

  return (
    <div>
      <div className="grid grid-cols-2 md:grid-cols-4" style={{ gap: 12, marginBottom: 24 }}>
        <div className="surface-container hairline" style={{ padding: 12 }}>
          <span className="label-sm" style={{ fontSize: 9, color: "var(--c-on-surface-variant)", textTransform: "uppercase" }}>Total Rentals</span>
          <p className="font-mono text-primary" style={{ fontSize: 22, fontWeight: 700 }}>{rentals.length}</p>
        </div>
        <div className="surface-container hairline" style={{ padding: 12 }}>
          <span className="label-sm" style={{ fontSize: 9, color: "var(--c-on-surface-variant)", textTransform: "uppercase" }}>Active</span>
          <p className="font-mono text-primary" style={{ fontSize: 22, fontWeight: 700 }}>{rentals.filter(r => r.status === 'active').length}</p>
        </div>
        <div className="surface-container hairline" style={{ padding: 12 }}>
          <span className="label-sm" style={{ fontSize: 9, color: "var(--c-on-surface-variant)", textTransform: "uppercase" }}>Total Accrued</span>
          <p className="font-mono text-primary tabular-nums" style={{ fontSize: 20, fontWeight: 700 }}>{totalAccrued.toFixed(2)} CPT</p>
        </div>
        <div className="surface-container hairline" style={{ padding: 12 }}>
          <span className="label-sm" style={{ fontSize: 9, color: "var(--c-on-surface-variant)", textTransform: "uppercase" }}>Total Spent</span>
          <p className="font-mono text-primary tabular-nums" style={{ fontSize: 20, fontWeight: 700 }}>{rentals.reduce((s, r) => s + r.totalCost, 0).toFixed(2)} CPT</p>
        </div>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))", gap: 16 }}>
        {rentals.map((rental) => (
          <RentalDashboardCard key={rental.id} rental={rental} onTerminate={onTerminate} />
        ))}
      </div>
    </div>
  );
};

const RentalDashboardCard: React.FC<{ rental: Rental; onTerminate: (id: string) => void }> = ({ rental, onTerminate }) => {
  const now = Date.now();
  const elapsed = rental.status === 'terminated' && rental.endedAt
    ? (rental.endedAt - rental.startedAt) / 1000
    : (now - rental.startedAt) / 1000;
  const accrued = rental.status === 'terminated' && rental.endedAt
    ? rental.pricePerHour * ((rental.endedAt - rental.startedAt) / 3600000)
    : rental.pricePerHour * ((now - rental.startedAt) / 3600000);
  const elapsedStr = formatDuration2(elapsed);
  const isActive = rental.status === 'active';

  return (
    <div className="surface-low hairline" style={{ padding: 16 }}>
      <div className="flex justify-between items-start" style={{ marginBottom: 12 }}>
        <div>
          <p className="font-mono text-primary" style={{ fontSize: 12, fontWeight: 700 }}>{rental.listingName}</p>
          <p className="label-sm" style={{ fontSize: 9, color: "var(--c-on-surface-variant)", textTransform: "uppercase" }}>{rental.hardware}</p>
        </div>
        <span className={`status-dot ${isActive ? "live" : "offline"}`} />
      </div>
      <div className="grid grid-cols-2" style={{ gap: 8, marginBottom: 12 }}>
        <div>
          <span className="label-sm" style={{ fontSize: 8, color: "var(--c-on-surface-variant)", textTransform: "uppercase" }}>Elapsed</span>
          <p className="font-mono tabular-nums" style={{ fontSize: 11, color: "var(--c-on-surface)" }}>{elapsedStr}</p>
        </div>
        <div>
          <span className="label-sm" style={{ fontSize: 8, color: "var(--c-on-surface-variant)", textTransform: "uppercase" }}>Rate</span>
          <p className="font-mono" style={{ fontSize: 11, color: "var(--c-on-surface)" }}>${rental.pricePerHour.toFixed(2)}/hr</p>
        </div>
        <div>
          <span className="label-sm" style={{ fontSize: 8, color: "var(--c-on-surface-variant)", textTransform: "uppercase" }}>Paid</span>
          <p className="font-mono" style={{ fontSize: 11, color: "var(--c-on-surface)" }}>{rental.totalCost.toFixed(2)} CPT</p>
        </div>
        <div>
          <span className="label-sm" style={{ fontSize: 8, color: "var(--c-on-surface-variant)", textTransform: "uppercase" }}>Accrued</span>
          <p className="font-mono text-primary tabular-nums" style={{ fontSize: 12, fontWeight: 700 }}>{accrued.toFixed(4)} CPT</p>
        </div>
      </div>
      {isActive && (
        <button
          onClick={() => onTerminate(rental.id)}
          className="btn btn-block"
          style={{
            padding: "6px 12px", fontSize: 10,
            border: "1px solid var(--c-error)", color: "var(--c-error)",
            background: "transparent", cursor: "pointer",
            fontFamily: "var(--font-mono)", textTransform: "uppercase",
          }}
        >
          <Icon name="stop" size={12} />
          Terminate
        </button>
      )}
      {!isActive && (
        <span className="label-sm" style={{ fontSize: 9, color: "var(--c-on-surface-variant)", textTransform: "uppercase" }}>
          Terminated
        </span>
      )}
    </div>
  );
};

function formatDuration2(totalSeconds: number): string {
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = Math.floor(totalSeconds % 60);
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

const DashTab: React.FC<{ active: boolean; onClick: () => void; label: string; count: number }> = ({
  active,
  onClick,
  label,
  count,
}) => (
  <button
    onClick={onClick}
    className="font-mono"
    style={{
      padding: "8px 0",
      paddingBottom: 12,
      background: "transparent",
      border: "none",
      borderBottom: active ? "2px solid var(--c-primary)" : "2px solid transparent",
      color: active ? "var(--c-primary)" : "var(--c-on-surface-variant)",
      fontWeight: 700,
      fontSize: 12,
      textTransform: "uppercase",
      letterSpacing: "0.05em",
      cursor: "pointer",
      display: "inline-flex",
      alignItems: "center",
      gap: 8,
    }}
  >
    {label} ({count})
  </button>
);

export default DashboardPage;
