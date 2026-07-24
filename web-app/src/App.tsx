import React from "react";
import { BrowserRouter, HashRouter, Routes, Route } from "react-router-dom";
import { Header } from "./components/shell/Header";
import { Footer } from "./components/shell/Footer";
import { Sidebar } from "./components/shell/Sidebar";
import { WalletGate } from "./components/shell/WalletGate";
import HomePage from "./pages/HomePage";
import MarketplacePage from "./pages/MarketplacePage";
import JobsPage from "./pages/JobsPage";
import DashboardPage from "./pages/DashboardPage";
import TokenPage from "./pages/TokenPage";

// Use HashRouter so the static build works without server-side rewrites.
// (Vite preview + static hosts like GitHub Pages serve index.html for "/#..." paths for free.)
const Router: typeof BrowserRouter = HashRouter as unknown as typeof BrowserRouter;

const App: React.FC = () => {
  return (
    <Router>
      <div className="min-h-screen flex flex-col bg-surface">
        {/* Subtle terminal scanline overlay (purely decorative) */}
        <div className="scanline" aria-hidden="true" />

        <Header />

        <div className="flex flex-1">
          {/* Sidebar is shown on inner pages; hidden on Home (which has its own marketing nav) */}
          <Routes>
            <Route path="/" element={<></>} />
            <Route
              path="*"
              element={
                <Sidebar />
              }
            />
          </Routes>

          <main className="flex-1 min-w-0">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route
                path="/marketplace"
                element={
                  <WalletGate>
                    <MarketplacePage />
                  </WalletGate>
                }
              />
              <Route
                path="/jobs"
                element={
                  <WalletGate requireWallet>
                    <JobsPage />
                  </WalletGate>
                }
              />
              <Route
                path="/dashboard"
                element={
                  <WalletGate requireWallet>
                    <DashboardPage />
                  </WalletGate>
                }
              />
              <Route
                path="/token"
                element={
                  <WalletGate requireWallet>
                    <TokenPage />
                  </WalletGate>
                }
              />
              <Route path="*" element={<HomePage />} />
            </Routes>
          </main>
        </div>

        <Footer />
      </div>
    </Router>
  );
};

export default App;
