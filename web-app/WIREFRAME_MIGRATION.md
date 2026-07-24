# ComputeMarket — Terminal Grid Redesign

This branch ports the ComputeMarket web app to the new "Terminal Grid" design
system exported by Stitch (see `wireframes/stitch_computemarket_platform_architecture/`).

## What changed

### Visual redesign
- **New design system** in `src/index.css` — dark green-tinted terminal palette
  (`#101412` surface, `#5dcaa5` primary), Atkinson Hyperlegible Next + JetBrains
  Mono typography, hairline borders, terminal-grid background, scanline overlay,
  Material Symbols iconography.
- **Component library** under `src/components/`:
  - `shell/Header.tsx` — sticky top nav with brand, route links, network pill,
    wallet connect / disconnect, balance display.
  - `shell/Sidebar.tsx` — left nav with node identity card and primary nav.
  - `shell/Footer.tsx` — terminal-style footer.
  - `shell/WalletGate.tsx` — friendly "AUTH_REQUIRED" prompt for protected
    routes.
  - `ui/Icon.tsx` — thin wrapper around Material Symbols Outlined.
- **Pages** under `src/pages/`:
  - `HomePage.tsx` — hero, features bento (No KYC, 25% fee, Secure Escrow,
    Docker Isolation), how-it-works steps, mesh architecture diagram, CTA.
  - `MarketplacePage.tsx` — sidebar filters (Hardware, VRAM, Price, Status)
    + node card grid with search and sort.
  - `JobsPage.tsx` — tabbed interface (Open Market / Create Job / Model
    Library / My Accepted / My Posted) with a shared JobCard component.
  - `DashboardPage.tsx` — operator console: stake/earnings/active/reputation
    stat bento, hardware logs, host registration form (or profile),
    executing-jobs grid with progress bars.
  - `TokenPage.tsx` — token metrics bento, contract ops (write/read methods),
    network health bars, faucet modal with instructions.

### Routing
- Migrated from a single-page tabbed layout to `react-router-dom` with
  `HashRouter` (so static deploys to GitHub Pages / Vercel preview work
  without server rewrites).
- Routes: `/`, `/marketplace`, `/jobs`, `/dashboard`, `/token`.

### Bug fixes in store (`src/store/appStore.ts`)
- **`createJob`** now calls the contract with the full signature
  `(jobSpec, priceWei, resourceType, gpuCount, contextLength)` — previously
  called with only 2 args, which would have reverted on-chain.
- **`registerHost`** now picks `registerHost` vs `registerCpuHost` based on a
  `cpuOnly` flag and passes the correct parameter shape
  `(nodeInfo, gpuIds[], gpuCount, cpuCores, ramGB)`.
- **`completeJob`** hashes arbitrary result strings to `bytes32` via
  `ethers.id()` before submitting on-chain.
- **`Host` interface** extended to match the contract's full Host struct
  (uptimeStart, totalUptime, lastHeartbeat, isCpuOnly, gpuCount, cpuCores, ramGB).
- Added `submitHeartbeat` action and `clearError` helper.

### Dependencies
Trimmed `package.json` to only the packages actually used:
react, react-dom, ethers, react-router-dom, zustand, recharts.
Removed libp2p / wagmi / viem / ipfs-http-client / axios / crypto-js — none
were imported by the app and they were causing install friction.

## Run it

```bash
cd web-app
npm install
npm run dev
```

Open http://localhost:3000

To create a production build:

```bash
npm run build
npm run preview
```

## Contract configuration

The app reads contract addresses from `web-app/.env`:

```
VITE_COMPUTE_COIN_ADDRESS=0x...
VITE_MARKETPLACE_ADDRESS=0x...
```

Both default to the zero address — update them with the addresses from your
BSC Testnet deployment before connecting a wallet.

## Next steps

1. **Deploy contracts** to BSC Testnet (see project root README) and paste the
   addresses into `web-app/.env`.
2. **Replace mock data** in `src/lib/constants.ts` with on-chain reads:
   - `MARKETPLACE_LISTINGS` → build from `getHostInfo` calls + heartbeats.
   - `HARDWARE_LOGS` and `EXECUTING_JOBS` on the Dashboard → reported by the
     desktop host daemon.
   - `NETWORK_STATS` on Home / Token → aggregate via an indexer / subgraph.
3. **Wire the faucet** — the Token page's "GET_TEST_CPT" button currently
   opens a modal with instructions. If you add a public `mint()` or `faucet()`
   function to ComputeCoin, swap the modal for a direct contract call.
4. **Mobile polish** — the design is responsive but the sidebar collapses on
   `<lg` breakpoints. Consider adding a slide-out drawer for mobile nav.
