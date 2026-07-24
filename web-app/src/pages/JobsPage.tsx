import React, { useEffect, useMemo, useState } from "react";
import { Icon } from "../components/ui/Icon";
import { useAppStore, type Job, type Rental } from "../store/appStore";
import {
  JOB_STATUS_LABELS,
  RESOURCE_TYPE_LABELS,
  MODEL_LIBRARY,
  calculateVRAM,
  shortAddr,
  formatCpt,
} from "../lib/constants";

type Tab = "create" | "browse" | "library" | "myjobs" | "posted" | "rentals";

export const JobsPage: React.FC = () => {
  const [tab, setTab] = useState<Tab>("browse");
  const { jobs, account, isHost, rentals } = useAppStore();

  const myJobs = useMemo(
    () => jobs.filter((j) => j.host?.toLowerCase() === account?.toLowerCase()),
    [jobs, account]
  );
  const openJobs = useMemo(
    () => jobs.filter((j) => j.status === 0 && j.client?.toLowerCase() !== account?.toLowerCase()),
    [jobs, account]
  );
  const myPostedJobs = useMemo(
    () => jobs.filter((j) => j.client?.toLowerCase() === account?.toLowerCase()),
    [jobs, account]
  );

  return (
    <div style={{ padding: 24 }}>
      {/* Page header */}
      <div style={{ marginBottom: 32, borderLeft: "2px solid var(--c-primary)", paddingLeft: 16 }}>
        <div className="flex items-center text-primary" style={{ gap: 8, marginBottom: 4 }}>
          <Icon name="memory" size={14} />
          <span className="label-sm" style={{ fontSize: 10, letterSpacing: "0.2em" }}>Compute_Jobs</span>
        </div>
        <h1
          className="font-mono"
          style={{ fontSize: 28, fontWeight: 700, textTransform: "uppercase", letterSpacing: "-0.01em", marginBottom: 4 }}
        >
          Job_Orchestrator
        </h1>
        <p className="font-mono" style={{ fontSize: 11, color: "var(--c-on-surface-variant)", textTransform: "uppercase", letterSpacing: "0.05em" }}>
          POST_NEW_TASK // ACCEPT_OPEN_WORK // MONITOR_EXECUTION
        </p>
      </div>

      {/* Tabs */}
      <div className="flex hairline-b" style={{ gap: 32, marginBottom: 24 }}>
        <TabButton active={tab === "browse"} onClick={() => setTab("browse")} label="Open Market" count={openJobs.length} icon="storage" />
        <TabButton active={tab === "create"} onClick={() => setTab("create")} label="Create Job" icon="add_circle" />
        <TabButton active={tab === "library"} onClick={() => setTab("library")} label="Model Library" icon="hub" />
        {myJobs.length > 0 && (
          <TabButton active={tab === "myjobs"} onClick={() => setTab("myjobs")} label="My Accepted" count={myJobs.length} icon="inventory" />
        )}
        {myPostedJobs.length > 0 && (
          <TabButton active={tab === "posted"} onClick={() => setTab("posted")} label="My Posted" count={myPostedJobs.length} icon="outbox" />
        )}
        {rentals.length > 0 && (
          <TabButton active={tab === "rentals"} onClick={() => setTab("rentals")} label="Active Rentals" count={rentals.length} icon="shopping_bag" />
        )}
      </div>

      {/* Content */}
      {tab === "browse" && <BrowseJobs />}
      {tab === "create" && <CreateJobForm onDone={() => setTab("posted")} />}
      {tab === "library" && <ModelLibrary />}
      {tab === "myjobs" && <MyJobsList />}
      {tab === "posted" && <PostedJobsList />}
      {tab === "rentals" && <RentalsList />}

      {/* Helper line */}
      <div className="hairline-t" style={{ marginTop: 40, paddingTop: 16 }}>
        <p className="font-mono" style={{ fontSize: 10, color: "var(--c-on-surface-variant)", textTransform: "uppercase" }}>
          &gt; HINT: {isHost
            ? "You are registered as a host. Accept open jobs to start earning CPT."
            : "Register as a host on the Dashboard page to accept jobs and earn CPT."}
        </p>
      </div>
    </div>
  );
};

// -------------- Browse open jobs --------------
const BrowseJobs: React.FC = () => {
  const { jobs, account, acceptJob, loading } = useAppStore();
  const open = jobs.filter((j) => j.status === 0 && j.client?.toLowerCase() !== account?.toLowerCase());

  if (open.length === 0) {
    return (
      <div className="surface-low hairline" style={{ padding: 60, textAlign: "center" }}>
        <Icon name="search_off" size={32} className="text-outline" />
        <p className="label-sm" style={{ marginTop: 16, color: "var(--c-on-surface-variant)" }}>
          [INFO] No open jobs match your filters. Be the first to create one.
        </p>
      </div>
    );
  }

  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(360px, 1fr))", gap: 16 }}>
      {open.map((job) => (
        <JobCard
          key={job.id}
          job={job}
          actions={
            <button
              className="btn btn-primary btn-block"
              disabled={loading}
              onClick={() => acceptJob(job.id).catch(console.error)}
            >
              <Icon name="play_arrow" size={14} />
              Accept_Job
            </button>
          }
        />
      ))}
    </div>
  );
};

// -------------- Create job form --------------
const CreateJobForm: React.FC<{ onDone: () => void }> = ({ onDone }) => {
  const { createJob, loading } = useAppStore();
  const [jobSpec, setJobSpec] = useState("");
  const [price, setPrice] = useState("");
  const [resourceType, setResourceType] = useState(0);
  const [gpuCount, setGpuCount] = useState(1);
  const [contextLength, setContextLength] = useState(4096);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!jobSpec.trim()) {
      setError("Job specification is required");
      return;
    }
    if (!price || Number(price) <= 0) {
      setError("Price must be a positive number");
      return;
    }
    try {
      await createJob({
        jobSpec,
        price,
        resourceType,
        gpuCount,
        contextLength,
      });
      setJobSpec("");
      setPrice("");
      onDone();
    } catch (err: any) {
      setError(err.reason || err.message || "Failed to create job");
    }
  };

  return (
    <div className="grid lg:grid-cols-3" style={{ gap: 24 }}>
      <form onSubmit={onSubmit} className="lg:col-span-2 surface-low hairline" style={{ padding: 24 }}>
        <h2 className="label-sm text-primary" style={{ marginBottom: 16 }}>
          <Icon name="add_circle" size={14} /> // NEW_JOB_CONFIG
        </h2>

        {error && (
          <div className="hairline" style={{ borderColor: "var(--c-error)", background: "rgba(255, 180, 171, 0.06)", padding: 12, marginBottom: 16 }}>
            <p className="font-mono text-error" style={{ fontSize: 11, textTransform: "uppercase" }}>! {error}</p>
          </div>
        )}

        <div style={{ marginBottom: 20 }}>
          <label className="label-sm" style={{ display: "block", marginBottom: 8, color: "var(--c-on-surface-variant)" }}>
            Job_Spec (IPFS_HASH or Description)
          </label>
          <textarea
            value={jobSpec}
            onChange={(e) => setJobSpec(e.target.value)}
            className="textarea"
            rows={6}
            placeholder="Qm... / Describe the compute workload, image, entrypoint…"
            required
          />
        </div>

        <div className="grid md:grid-cols-2" style={{ gap: 16, marginBottom: 20 }}>
          <div>
            <label className="label-sm" style={{ display: "block", marginBottom: 8, color: "var(--c-on-surface-variant)" }}>
              Price (CPT)
            </label>
            <input
              type="number"
              step="0.01"
              min="0.01"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              className="input"
              placeholder="1.50"
              required
            />
            <p className="font-mono" style={{ fontSize: 10, color: "var(--c-on-surface-variant)", marginTop: 6, textTransform: "uppercase" }}>
              NOTE: 25% PROTOCOL_FEE WILL BE DEDUCTED FROM HOST PAYOUT
            </p>
          </div>

          <div>
            <label className="label-sm" style={{ display: "block", marginBottom: 8, color: "var(--c-on-surface-variant)" }}>
              Resource_Type
            </label>
            <select value={resourceType} onChange={(e) => setResourceType(Number(e.target.value))} className="select">
              {(Object.entries(RESOURCE_TYPE_LABELS) as [string, string][]).map(([k, v]) => (
                <option key={k} value={Number(k)}>{v}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="label-sm" style={{ display: "block", marginBottom: 8, color: "var(--c-on-surface-variant)" }}>
              GPU_Count
            </label>
            <input
              type="number"
              min="1"
              max="8"
              value={gpuCount}
              onChange={(e) => setGpuCount(Number(e.target.value))}
              className="input"
            />
          </div>

          <div>
            <label className="label-sm" style={{ display: "block", marginBottom: 8, color: "var(--c-on-surface-variant)" }}>
              Context_Length (tokens)
            </label>
            <input
              type="number"
              min="512"
              max="131072"
              step="512"
              value={contextLength}
              onChange={(e) => setContextLength(Number(e.target.value))}
              className="input"
            />
          </div>
        </div>

        <button type="submit" className="btn btn-primary btn-block" disabled={loading} style={{ padding: "12px 16px" }}>
          <Icon name="rocket_launch" size={14} />
          {loading ? "Submitting…" : "Deploy_Job"}
        </button>
      </form>

      {/* Side info */}
      <aside className="surface-lowest hairline" style={{ padding: 24, height: "fit-content" }}>
        <h3 className="label-sm text-primary" style={{ marginBottom: 16 }}>
          <Icon name="info" size={14} /> // PROTOCOL_RULES
        </h3>
        <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: 12 }}>
          {[
            { label: "Escrow", value: "Locked until job completion" },
            { label: "Protocol fee", value: "25% of total price" },
            { label: "Challenge window", value: "Configurable on-chain" },
            { label: "Min price", value: "0.01 CPT" },
            { label: "Settlement", value: "Automatic on completion" },
          ].map((row) => (
            <li key={row.label} className="hairline-b" style={{ paddingBottom: 12 }}>
              <div className="label-sm" style={{ fontSize: 10, color: "var(--c-outline)", textTransform: "uppercase" }}>
                {row.label}
              </div>
              <div className="font-mono" style={{ fontSize: 12, color: "var(--c-on-surface)", marginTop: 2 }}>
                {row.value}
              </div>
            </li>
          ))}
        </ul>
      </aside>
    </div>
  );
};

// -------------- Model library --------------
const ModelLibrary: React.FC = () => {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))", gap: 16 }}>
      {MODEL_LIBRARY.map((model) => (
        <ModelCard key={model.id} model={model} />
      ))}
    </div>
  );
};

const ModelCard: React.FC<{ model: (typeof MODEL_LIBRARY)[number] }> = ({ model }) => {
  const [ctx, setCtx] = useState(4096);
  const [quant, setQuant] = useState(model.quantizations[0]);
  const vram = calculateVRAM(model.params, quant, ctx);

  return (
    <div className="surface-low hairline" style={{ padding: 20, transition: "border-color 120ms ease" }}
      onMouseEnter={(e) => (e.currentTarget.style.borderColor = "var(--c-primary)")}
      onMouseLeave={(e) => (e.currentTarget.style.borderColor = "var(--c-outline-variant)")}>
      <div className="flex justify-between items-start" style={{ marginBottom: 16 }}>
        <div>
          <h3 className="font-mono" style={{ fontSize: 16, fontWeight: 700, textTransform: "uppercase" }}>
            {model.name}
          </h3>
          <p style={{ fontSize: 12, color: "var(--c-on-surface-variant)" }}>{model.description}</p>
        </div>
        <span className="chip chip-primary">{model.params}B</span>
      </div>

      <div className="surface-container" style={{ padding: 14, marginBottom: 16 }}>
        <label className="label-sm" style={{ display: "block", marginBottom: 6, color: "var(--c-on-surface-variant)", fontSize: 10 }}>
          CONTEXT_LENGTH: {ctx.toLocaleString()} tokens
        </label>
        <input
          type="range"
          min={512}
          max={32768}
          step={512}
          value={ctx}
          onChange={(e) => setCtx(Number(e.target.value))}
          style={{ width: "100%", accentColor: "var(--c-primary)" }}
        />

        <label className="label-sm" style={{ display: "block", marginTop: 12, marginBottom: 6, color: "var(--c-on-surface-variant)", fontSize: 10 }}>
          QUANTIZATION
        </label>
        <select value={quant} onChange={(e) => setQuant(e.target.value)} className="select">
          {model.quantizations.map((q) => (
            <option key={q} value={q}>{q}</option>
          ))}
        </select>

        <div className="flex justify-between items-center hairline-t" style={{ marginTop: 14, paddingTop: 14 }}>
          <span className="label-sm" style={{ fontSize: 10, color: "var(--c-on-surface-variant)" }}>VRAM_REQUIRED:</span>
          <span
            className="font-mono tabular-nums"
            style={{
              fontSize: 20,
              fontWeight: 700,
              color: vram <= 24 ? "var(--c-primary)" : vram <= 48 ? "var(--c-warning)" : "var(--c-error)",
            }}
          >
            {vram} GB
          </span>
        </div>
      </div>

      <button className="btn btn-primary btn-block">
        <Icon name="rocket_launch" size={14} />
        Deploy_on_ComputeMarket
      </button>
    </div>
  );
};

// -------------- My accepted jobs --------------
const MyJobsList: React.FC = () => {
  const { jobs, account, completeJob, loading } = useAppStore();
  const [resultHash, setResultHash] = useState<Record<number, string>>({});
  const mine = jobs.filter((j) => j.host?.toLowerCase() === account?.toLowerCase());

  if (mine.length === 0) {
    return (
      <div className="surface-low hairline" style={{ padding: 60, textAlign: "center" }}>
        <Icon name="inbox" size={32} className="text-outline" />
        <p className="label-sm" style={{ marginTop: 16, color: "var(--c-on-surface-variant)" }}>
          [INFO] You have no accepted jobs. Browse the open market to claim one.
        </p>
      </div>
    );
  }

  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(360px, 1fr))", gap: 16 }}>
      {mine.map((job) => (
        <JobCard
          key={job.id}
          job={job}
          actions={
            job.status === 1 || job.status === 2 ? (
              <div>
                <input
                  type="text"
                  placeholder="result_hash or any string"
                  value={resultHash[job.id] || ""}
                  onChange={(e) => setResultHash({ ...resultHash, [job.id]: e.target.value })}
                  className="input"
                  style={{ marginBottom: 8 }}
                />
                <button
                  className="btn btn-primary btn-block"
                  disabled={loading}
                  onClick={() => completeJob(job.id, resultHash[job.id] || `job-${job.id}-result`).catch(console.error)}
                >
                  <Icon name="check_circle" size={14} />
                  Submit_Result
                </button>
              </div>
            ) : null
          }
        />
      ))}
    </div>
  );
};

// -------------- My posted jobs --------------
const PostedJobsList: React.FC = () => {
  const { jobs, account } = useAppStore();
  const mine = jobs.filter((j) => j.client?.toLowerCase() === account?.toLowerCase());

  if (mine.length === 0) {
    return (
      <div className="surface-low hairline" style={{ padding: 60, textAlign: "center" }}>
        <Icon name="outbox" size={32} className="text-outline" />
        <p className="label-sm" style={{ marginTop: 16, color: "var(--c-on-surface-variant)" }}>
          [INFO] You haven't posted any jobs yet. Switch to the Create_Job tab to deploy one.
        </p>
      </div>
    );
  }

  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(360px, 1fr))", gap: 16 }}>
      {mine.map((job) => (
        <JobCard key={job.id} job={job} actions={null} />
      ))}
    </div>
  );
};

// -------------- Job card (shared) --------------
const JobCard: React.FC<{
  job: Job;
  actions: React.ReactNode;
}> = ({ job, actions }) => {
  const statusLabel = JOB_STATUS_LABELS[job.status as keyof typeof JOB_STATUS_LABELS] ?? "Unknown";
  const statusClass = `status-${statusLabel.toLowerCase()}`;

  return (
    <div
      className="surface-low hairline"
      style={{
        padding: 20,
        display: "flex",
        flexDirection: "column",
        transition: "border-color 120ms ease",
      }}
      onMouseEnter={(e) => (e.currentTarget.style.borderColor = "rgba(93, 202, 165, 0.5)")}
      onMouseLeave={(e) => (e.currentTarget.style.borderColor = "var(--c-outline-variant)")}
    >
      <div className="flex justify-between items-start" style={{ marginBottom: 12 }}>
        <div className="flex items-center" style={{ gap: 12 }}>
          <div
            className="surface-container hairline flex items-center justify-center"
            style={{ width: 32, height: 32 }}
          >
            <Icon name="memory" size={16} className="text-primary" />
          </div>
          <div>
            <p className="font-mono text-primary" style={{ fontSize: 13, fontWeight: 700 }}>
              JOB_{job.id.toString().padStart(4, "0")}
            </p>
            <p className="label-sm" style={{ fontSize: 10, color: "var(--c-on-surface-variant)", textTransform: "uppercase" }}>
              {RESOURCE_TYPE_LABELS[job.resourceType as keyof typeof RESOURCE_TYPE_LABELS] ?? "GPU"} · {Number(job.gpuCount)} unit(s)
            </p>
          </div>
        </div>
        <span className={`status-badge ${statusClass}`}>{statusLabel}</span>
      </div>

      <div className="surface-container" style={{ padding: 10, marginBottom: 16 }}>
        <p className="label-sm" style={{ fontSize: 9, color: "var(--c-on-surface-variant)", marginBottom: 4 }}>
          SPEC
        </p>
        <p className="font-mono break-all" style={{ fontSize: 11, color: "var(--c-on-surface)", lineHeight: 1.4, maxHeight: 80, overflow: "auto" }}>
          {job.jobSpec || "(empty)"}
        </p>
      </div>

      <div className="flex justify-between hairline-t" style={{ paddingTop: 12, marginBottom: 16, fontSize: 11 }}>
        <div>
          <span className="label-sm" style={{ fontSize: 9, color: "var(--c-on-surface-variant)" }}>PRICE</span>
          <p className="font-mono text-primary tabular-nums" style={{ fontWeight: 700 }}>
            {formatCpt(job.price)} CPT
          </p>
        </div>
        <div>
          <span className="label-sm" style={{ fontSize: 9, color: "var(--c-on-surface-variant)" }}>CLIENT</span>
          <p className="font-mono" style={{ fontSize: 11 }}>{shortAddr(job.client, 6, 4)}</p>
        </div>
        <div>
          <span className="label-sm" style={{ fontSize: 9, color: "var(--c-on-surface-variant)" }}>HOST</span>
          <p className="font-mono" style={{ fontSize: 11 }}>
            {job.host && Number(job.host) !== 0 ? shortAddr(job.host, 6, 4) : "—"}
          </p>
        </div>
      </div>

      {actions}
    </div>
  );
};

// -------------- Rentals list --------------
const RentalsList: React.FC = () => {
  const { rentals, terminateRental, loading } = useAppStore();
  const [, setTick] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), 1000);
    return () => clearInterval(id);
  }, []);

  if (rentals.length === 0) {
    return (
      <div className="surface-low hairline" style={{ padding: 60, textAlign: "center" }}>
        <Icon name="shopping_bag" size={32} className="text-outline" />
        <p className="label-sm" style={{ marginTop: 16, color: "var(--c-on-surface-variant)" }}>
          [INFO] No active rentals. Browse the Marketplace to rent GPU compute.
        </p>
      </div>
    );
  }

  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(360px, 1fr))", gap: 16 }}>
      {rentals.map((rental) => (
        <RentalCard key={rental.id} rental={rental} onTerminate={() => terminateRental(rental.id).catch(console.error)} loading={loading} />
      ))}
    </div>
  );
};

const RentalCard: React.FC<{ rental: Rental; onTerminate: () => void; loading: boolean }> = ({ rental, onTerminate, loading }) => {
  const now = Date.now();
  const elapsed = rental.status === 'terminated' && rental.endedAt
    ? (rental.endedAt - rental.startedAt) / 1000
    : (now - rental.startedAt) / 1000;
  const accrued = rental.status === 'terminated' && rental.endedAt
    ? rental.pricePerHour * ((rental.endedAt - rental.startedAt) / 3600000)
    : rental.pricePerHour * ((now - rental.startedAt) / 3600000);
  const elapsedStr = formatDuration(elapsed);
  const isActive = rental.status === 'active';

  return (
    <div
      className="surface-low hairline"
      style={{
        padding: 20,
        display: "flex",
        flexDirection: "column",
        opacity: isActive ? 1 : 0.6,
        transition: "border-color 120ms ease",
      }}
      onMouseEnter={(e) => { if (isActive) e.currentTarget.style.borderColor = "rgba(93, 202, 165, 0.5)"; }}
      onMouseLeave={(e) => { e.currentTarget.style.borderColor = "var(--c-outline-variant)"; }}
    >
      {/* Header */}
      <div className="flex justify-between items-start" style={{ marginBottom: 16 }}>
        <div className="flex items-center" style={{ gap: 12 }}>
          <div
            className="surface-container hairline flex items-center justify-center"
            style={{ width: 32, height: 32 }}
          >
            <Icon name="developer_board" size={16} className="text-primary" />
          </div>
          <div>
            <p className="font-mono text-primary" style={{ fontSize: 13, fontWeight: 700 }}>
              {rental.listingName}
            </p>
            <p className="label-sm" style={{ fontSize: 10, color: "var(--c-on-surface-variant)", textTransform: "uppercase" }}>
              {rental.hardware}
            </p>
          </div>
        </div>
        <span
          className={`font-mono ${isActive ? "text-primary" : "text-outline"}`}
          style={{ fontSize: 9, padding: "2px 8px", border: `1px solid ${isActive ? "var(--c-primary)" : "var(--c-outline-variant)"}` }}
        >
          {isActive ? "RUNNING" : "TERMINATED"}
        </span>
      </div>

      {/* Specs */}
      <div className="surface-container" style={{ padding: 10, marginBottom: 16 }}>
        <div className="grid grid-cols-2" style={{ gap: 8 }}>
          <div>
            <span className="label-sm" style={{ fontSize: 9, color: "var(--c-on-surface-variant)", textTransform: "uppercase" }}>Memory</span>
            <p className="font-mono" style={{ fontSize: 11, color: "var(--c-on-surface)", marginTop: 2 }}>{rental.memory}</p>
          </div>
          <div>
            <span className="label-sm" style={{ fontSize: 9, color: "var(--c-on-surface-variant)", textTransform: "uppercase" }}>Region</span>
            <p className="font-mono" style={{ fontSize: 11, color: "var(--c-on-surface)", marginTop: 2 }}>{rental.region}</p>
          </div>
          <div>
            <span className="label-sm" style={{ fontSize: 9, color: "var(--c-on-surface-variant)", textTransform: "uppercase" }}>Rate</span>
            <p className="font-mono text-primary" style={{ fontSize: 11, marginTop: 2 }}>${rental.pricePerHour.toFixed(2)}/hr</p>
          </div>
          <div>
            <span className="label-sm" style={{ fontSize: 9, color: "var(--c-on-surface-variant)", textTransform: "uppercase" }}>Duration</span>
            <p className="font-mono" style={{ fontSize: 11, color: "var(--c-on-surface)", marginTop: 2 }}>{rental.hours}h</p>
          </div>
        </div>
      </div>

      {/* Live stats */}
      <div className="surface-lowest hairline" style={{ padding: 12, marginBottom: 16 }}>
        <div className="flex justify-between" style={{ marginBottom: 6 }}>
          <span className="label-sm" style={{ fontSize: 9, color: "var(--c-on-surface-variant)", textTransform: "uppercase" }}>Elapsed</span>
          <span className="font-mono tabular-nums" style={{ fontSize: 12, color: "var(--c-on-surface)" }}>{elapsedStr}</span>
        </div>
        <div className="flex justify-between">
          <span className="label-sm" style={{ fontSize: 9, color: "var(--c-on-surface-variant)", textTransform: "uppercase" }}>Accrued Cost</span>
          <span className="font-mono tabular-nums text-primary" style={{ fontSize: 14, fontWeight: 700 }}>{accrued.toFixed(4)} CPT</span>
        </div>
        <div className="flex justify-between hairline-t" style={{ marginTop: 6, paddingTop: 6 }}>
          <span className="label-sm" style={{ fontSize: 9, color: "var(--c-on-surface-variant)", textTransform: "uppercase" }}>Total Paid</span>
          <span className="font-mono tabular-nums" style={{ fontSize: 11, color: "var(--c-on-surface)" }}>{rental.totalCost.toFixed(2)} CPT</span>
        </div>
      </div>

      {/* SSH info */}
      <div
        className="surface-lowest hairline"
        style={{ padding: 8, marginBottom: 16, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}
      >
        <code className="font-mono" style={{ fontSize: 9, color: "var(--c-primary)", wordBreak: "break-all" }}>
          ssh demo@localhost -p 2222
        </code>
        <button
          className="btn btn-ghost btn-sm"
          style={{ padding: "2px 6px", fontSize: 8 }}
          onClick={() => navigator.clipboard.writeText("ssh demo@localhost -p 2222")}
          title="Copy SSH command"
        >
          <Icon name="content_copy" size={10} />
        </button>
      </div>

      {/* Actions */}
      {isActive && (
        <button
          onClick={onTerminate}
          disabled={loading}
          className="btn btn-block"
          style={{
            padding: "8px 12px", fontSize: 11,
            border: "1px solid var(--c-error)",
            color: "var(--c-error)",
            background: "transparent",
            cursor: "pointer",
            fontFamily: "var(--font-mono)",
            textTransform: "uppercase",
          }}
        >
          <Icon name="stop" size={14} />
          {loading ? "Terminating..." : "Terminate_Rental"}
        </button>
      )}
    </div>
  );
};

function formatDuration(totalSeconds: number): string {
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = Math.floor(totalSeconds % 60);
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

// -------------- Tab button --------------
const TabButton: React.FC<{
  active: boolean;
  onClick: () => void;
  label: string;
  count?: number;
  icon: string;
}> = ({ active, onClick, label, count, icon }) => (
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
      letterSpacing: "0.05em",
      textTransform: "uppercase",
      cursor: "pointer",
      display: "inline-flex",
      alignItems: "center",
      gap: 8,
      transition: "color 120ms ease",
    }}
  >
    <Icon name={icon} size={14} />
    {label}
    {count !== undefined && (
      <span
        className="font-mono"
        style={{
          fontSize: 10,
          padding: "1px 6px",
          border: `1px solid ${active ? "var(--c-primary)" : "var(--c-outline-variant)"}`,
          color: active ? "var(--c-primary)" : "var(--c-on-surface-variant)",
        }}
      >
        {count}
      </span>
    )}
  </button>
);

export default JobsPage;
