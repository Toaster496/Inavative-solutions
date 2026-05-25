import React, { useState } from 'react';
import { useAppStore } from './store/appStore';
import { JOB_STATUS_LABELS } from './lib/constants';

const App: React.FC = () => {
  const { 
    account, 
    coinBalance, 
    isHost, 
    hostInfo, 
    jobs, 
    loading, 
    error,
    connectWallet, 
    disconnectWallet,
    createJob,
    acceptJob,
    completeJob,
    registerHost
  } = useAppStore();

  const [activeTab, setActiveTab] = useState<'market' | 'create' | 'host'>('market');
  const [jobSpec, setJobSpec] = useState('');
  const [jobPrice, setJobPrice] = useState('');
  const [nodeInfo, setNodeInfo] = useState('');
  const [resultHash, setResultHash] = useState('');

  const handleCreateJob = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createJob(jobSpec, jobPrice);
      setJobSpec('');
      setJobPrice('');
      setActiveTab('market');
    } catch (err) {
      console.error(err);
    }
  };

  const handleRegisterHost = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await registerHost(nodeInfo);
      setNodeInfo('');
    } catch (err) {
      console.error(err);
    }
  };

  const handleAcceptJob = async (jobId: number) => {
    try {
      await acceptJob(jobId);
    } catch (err) {
      console.error(err);
    }
  };

  const handleCompleteJob = async (jobId: number) => {
    try {
      const hash = resultHash || `0x${Math.random().toString(16).substr(2, 64)}`;
      await completeJob(jobId, hash);
      setResultHash('');
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="app">
      {/* Header */}
      <header style={{
        padding: '20px 40px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderBottom: '1px solid rgba(255,255,255,0.1)'
      }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 'bold' }}>🖥️ ComputeMarket</h1>
          <p style={{ fontSize: '14px', opacity: 0.7 }}>Decentralized GPU Cloud Marketplace</p>
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          {account && (
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '14px', opacity: 0.7 }}>Balance</div>
              <div style={{ fontWeight: 'bold', color: '#38ef7d' }}>
                {coinBalance ? `${(Number(coinBalance) / 1e18).toFixed(2)} CPT` : '0.00 CPT'}
              </div>
            </div>
          )}
          
          {account ? (
            <button onClick={disconnectWallet} className="btn-secondary">
              {account.slice(0, 6)}...{account.slice(-4)}
            </button>
          ) : (
            <button onClick={connectWallet} className="btn-primary" disabled={loading}>
              {loading ? 'Connecting...' : 'Connect Wallet'}
            </button>
          )}
        </div>
      </header>

      {/* Error Display */}
      {error && (
        <div style={{
          background: 'rgba(239, 68, 68, 0.2)',
          border: '1px solid #ef4444',
          padding: '16px',
          margin: '20px 40px',
          borderRadius: '8px'
        }}>
          {error}
        </div>
      )}

      {!account ? (
        /* Welcome Screen */
        <div style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '80px 20px'
        }}>
          <h2 style={{ fontSize: '48px', marginBottom: '20px' }}>
            Rent or Sell GPU Power
          </h2>
          <p style={{ fontSize: '18px', opacity: 0.8, maxWidth: '600px', textAlign: 'center', marginBottom: '40px' }}>
            Decentralized marketplace for GPU compute. Rent GPUs for AI/ML workloads or earn crypto by sharing your idle GPU resources.
          </p>
          <button onClick={connectWallet} className="btn-primary" style={{ padding: '16px 48px', fontSize: '18px' }}>
            Get Started
          </button>
          
          <div style={{ display: 'flex', gap: '40px', marginTop: '60px' }}>
            <div className="card" style={{ textAlign: 'center', maxWidth: '300px' }}>
              <h3 style={{ marginBottom: '12px' }}>🚀 For Clients</h3>
              <p style={{ opacity: 0.7 }}>Access affordable GPU power for LLM inference, training, and rendering tasks</p>
            </div>
            <div className="card" style={{ textAlign: 'center', maxWidth: '300px' }}>
              <h3 style={{ marginBottom: '12px' }}>💰 For Hosts</h3>
              <p style={{ opacity: 0.7 }}>Earn CPT tokens by sharing your idle GPU resources with the network</p>
            </div>
            <div className="card" style={{ textAlign: 'center', maxWidth: '300px' }}>
              <h3 style={{ marginBottom: '12px' }}>🔒 Secure</h3>
              <p style={{ opacity: 0.7 }}>Smart contract escrow with 25% protocol fee ensures fair transactions</p>
            </div>
          </div>
        </div>
      ) : (
        /* Main Interface */
        <>
          {/* Tabs */}
          <div style={{
            padding: '20px 40px',
            display: 'flex',
            gap: '12px',
            borderBottom: '1px solid rgba(255,255,255,0.1)'
          }}>
            <button
              onClick={() => setActiveTab('market')}
              className={activeTab === 'market' ? 'btn-primary' : 'btn-secondary'}
            >
              📊 Job Market
            </button>
            <button
              onClick={() => setActiveTab('create')}
              className={activeTab === 'create' ? 'btn-primary' : 'btn-secondary'}
            >
              ➕ Create Job
            </button>
            <button
              onClick={() => setActiveTab('host')}
              className={activeTab === 'host' ? 'btn-primary' : 'btn-secondary'}
            >
              🖥️ Host Dashboard
            </button>
          </div>

          {/* Content */}
          <main style={{ padding: '40px', maxWidth: '1400px', margin: '0 auto', width: '100%' }}>
            {activeTab === 'market' && (
              <div>
                <h2 style={{ marginBottom: '24px' }}>Available Jobs</h2>
                {jobs.length === 0 ? (
                  <div className="card" style={{ textAlign: 'center', padding: '60px' }}>
                    <p style={{ opacity: 0.7 }}>No jobs available yet. Be the first to create one!</p>
                  </div>
                ) : (
                  <div style={{ display: 'grid', gap: '16px' }}>
                    {jobs.map((job) => (
                      <div key={job.id} className="card">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                          <div style={{ flex: 1 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                              <span style={{ fontWeight: 'bold', fontSize: '18px' }}>Job #{job.id}</span>
                              <span className={`status-badge status-${JOB_STATUS_LABELS[job.status].toLowerCase()}`}>
                                {JOB_STATUS_LABELS[job.status]}
                              </span>
                            </div>
                            <p style={{ opacity: 0.8, marginBottom: '12px', fontFamily: 'monospace', wordBreak: 'break-all' }}>
                              {job.jobSpec}
                            </p>
                            <div style={{ display: 'flex', gap: '24px', fontSize: '14px', opacity: 0.7 }}>
                              <span>💰 {(Number(job.price) / 1e18).toFixed(2)} CPT</span>
                              <span>👤 Client: {job.client.slice(0, 6)}...{job.client.slice(-4)}</span>
                              {job.host !== '0x0000000000000000000000000000000000000000' && (
                                <span>🔧 Host: {job.host.slice(0, 6)}...{job.host.slice(-4)}</span>
                              )}
                            </div>
                          </div>
                          
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            {job.status === 0 && !isHost && (
                              <button 
                                onClick={() => handleAcceptJob(job.id)}
                                className="btn-success"
                              >
                                Accept Job
                              </button>
                            )}
                            {job.status === 1 && job.host.toLowerCase() === account?.toLowerCase() && (
                              <button 
                                onClick={() => handleCompleteJob(job.id)}
                                className="btn-success"
                              >
                                Complete & Submit
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'create' && (
              <div style={{ maxWidth: '600px', margin: '0 auto' }}>
                <h2 style={{ marginBottom: '24px' }}>Create New Job</h2>
                <form onSubmit={handleCreateJob} className="card">
                  <div style={{ marginBottom: '20px' }}>
                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>
                      Job Specification (IPFS Hash or Description)
                    </label>
                    <textarea
                      value={jobSpec}
                      onChange={(e) => setJobSpec(e.target.value)}
                      className="input-dark"
                      rows={6}
                      placeholder="Describe your compute task or provide IPFS hash of job specification..."
                      required
                    />
                  </div>
                  
                  <div style={{ marginBottom: '24px' }}>
                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>
                      Price (CPT)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="0.01"
                      value={jobPrice}
                      onChange={(e) => setJobPrice(e.target.value)}
                      className="input-dark"
                      placeholder="0.00"
                      required
                    />
                    <p style={{ fontSize: '12px', opacity: 0.6, marginTop: '8px' }}>
                      Note: 25% protocol fee will be deducted
                    </p>
                  </div>
                  
                  <button type="submit" className="btn-primary" style={{ width: '100%' }} disabled={loading}>
                    {loading ? 'Creating Job...' : 'Create Job'}
                  </button>
                </form>
              </div>
            )}

            {activeTab === 'host' && (
              <div>
                <h2 style={{ marginBottom: '24px' }}>Host Dashboard</h2>
                
                {!isHost ? (
                  <div style={{ maxWidth: '600px', margin: '0 auto' }}>
                    <div className="card" style={{ textAlign: 'center', padding: '60px' }}>
                      <h3 style={{ marginBottom: '16px' }}>Become a Host</h3>
                      <p style={{ opacity: 0.7, marginBottom: '24px' }}>
                        Register as a host to accept compute jobs. Requires staking 100 CPT tokens.
                      </p>
                      <form onSubmit={handleRegisterHost}>
                        <div style={{ marginBottom: '20px' }}>
                          <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>
                            Node Info (libp2p Peer ID)
                          </label>
                          <input
                            type="text"
                            value={nodeInfo}
                            onChange={(e) => setNodeInfo(e.target.value)}
                            className="input-dark"
                            placeholder="/ip4/.../tcp/.../p2p/..."
                            required
                          />
                        </div>
                        <button type="submit" className="btn-primary" style={{ width: '100%' }} disabled={loading}>
                          {loading ? 'Registering...' : 'Register as Host (100 CPT)'}
                        </button>
                      </form>
                    </div>
                  </div>
                ) : (
                  <div style={{ display: 'grid', gap: '24px' }}>
                    <div className="card">
                      <h3 style={{ marginBottom: '16px' }}>Host Status</h3>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px' }}>
                        <div>
                          <div style={{ fontSize: '14px', opacity: 0.7 }}>Reputation</div>
                          <div style={{ fontSize: '24px', fontWeight: 'bold' }}>{Number(hostInfo?.reputation || 0)}</div>
                        </div>
                        <div>
                          <div style={{ fontSize: '14px', opacity: 0.7 }}>Completed Jobs</div>
                          <div style={{ fontSize: '24px', fontWeight: 'bold' }}>{Number(hostInfo?.completedJobs || 0)}</div>
                        </div>
                        <div>
                          <div style={{ fontSize: '14px', opacity: 0.7 }}>Staked</div>
                          <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#38ef7d' }}>
                            {(Number(hostInfo?.stake || 0) / 1e18).toFixed(2)} CPT
                          </div>
                        </div>
                      </div>
                      <div style={{ marginTop: '16px', padding: '12px', background: 'rgba(0,0,0,0.2)', borderRadius: '8px' }}>
                        <div style={{ fontSize: '12px', opacity: 0.7 }}>Node Info</div>
                        <div style={{ fontFamily: 'monospace', fontSize: '14px' }}>{hostInfo?.nodeInfo}</div>
                      </div>
                    </div>
                    
                    <div>
                      <h3 style={{ marginBottom: '16px' }}>Your Jobs</h3>
                      {jobs.filter(j => j.host?.toLowerCase() === account?.toLowerCase()).length === 0 ? (
                        <div className="card" style={{ textAlign: 'center', padding: '40px' }}>
                          <p style={{ opacity: 0.7 }}>No jobs yet. Browse the market to accept jobs!</p>
                        </div>
                      ) : (
                        <div style={{ display: 'grid', gap: '16px' }}>
                          {jobs.filter(j => j.host?.toLowerCase() === account?.toLowerCase()).map((job) => (
                            <div key={job.id} className="card">
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div>
                                  <span style={{ fontWeight: 'bold' }}>Job #{job.id}</span>
                                  <span className={`status-badge status-${JOB_STATUS_LABELS[job.status].toLowerCase()}`} style={{ marginLeft: '12px' }}>
                                    {JOB_STATUS_LABELS[job.status]}
                                  </span>
                                </div>
                                <span style={{ color: '#38ef7d', fontWeight: 'bold' }}>
                                  {(Number(job.price) / 1e18).toFixed(2)} CPT
                                </span>
                              </div>
                              {job.status === 1 && (
                                <button 
                                  onClick={() => handleCompleteJob(job.id)}
                                  className="btn-success"
                                  style={{ marginTop: '12px' }}
                                >
                                  Mark Complete
                                </button>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}
          </main>
        </>
      )}

      {/* Footer */}
      <footer style={{
        padding: '20px 40px',
        borderTop: '1px solid rgba(255,255,255,0.1)',
        textAlign: 'center',
        opacity: 0.6,
        fontSize: '14px'
      }}>
        <p>ComputeMarket - Powered by BSC Testnet • 25% Protocol Fee • Permissionless & Anonymous</p>
      </footer>
    </div>
  );
};

export default App;
