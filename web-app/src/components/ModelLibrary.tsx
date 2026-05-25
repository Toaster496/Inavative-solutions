import React, { useState } from 'react';
import { MODEL_LIBRARY, calculateVRAM, RESOURCE_TYPE } from '../lib/constants';

interface ModelCardProps {
  model: typeof MODEL_LIBRARY[0];
  onDeploy: (modelId: string) => void;
}

const ModelCard: React.FC<ModelCardProps> = ({ model, onDeploy }) => {
  const [contextLength, setContextLength] = useState(4096);
  const [quantization, setQuantization] = useState(model.quantizations[0]);
  
  const vramRequired = calculateVRAM(model.params, quantization, contextLength);
  
  return (
    <div className="card" style={{ padding: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '16px' }}>
        <div>
          <h3 style={{ fontSize: '18px', fontWeight: 'bold' }}>{model.name}</h3>
          <p style={{ opacity: 0.7, fontSize: '14px' }}>{model.description}</p>
        </div>
        <span style={{ 
          background: 'rgba(102, 126, 234, 0.2)', 
          color: '#667eea', 
          padding: '4px 12px', 
          borderRadius: '12px',
          fontSize: '12px'
        }}>
          {model.params}B Params
        </span>
      </div>
      
      {/* VRAM Calculator */}
      <div style={{ 
        background: 'rgba(0,0,0,0.2)', 
        padding: '16px', 
        borderRadius: '8px',
        marginBottom: '16px'
      }}>
        <div style={{ marginBottom: '12px' }}>
          <label style={{ fontSize: '12px', opacity: 0.7, display: 'block', marginBottom: '4px' }}>
            Context Length: {contextLength} tokens
          </label>
          <input
            type="range"
            min="512"
            max="32768"
            step="512"
            value={contextLength}
            onChange={(e) => setContextLength(Number(e.target.value))}
            style={{ width: '100%' }}
          />
        </div>
        
        <div style={{ marginBottom: '12px' }}>
          <label style={{ fontSize: '12px', opacity: 0.7, display: 'block', marginBottom: '4px' }}>
            Quantization
          </label>
          <select
            value={quantization}
            onChange={(e) => setQuantization(e.target.value)}
            className="input-dark"
            style={{ width: '100%', padding: '8px' }}
          >
            {model.quantizations.map(q => (
              <option key={q} value={q}>{q}</option>
            ))}
          </select>
        </div>
        
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          paddingTop: '12px',
          borderTop: '1px solid rgba(255,255,255,0.1)'
        }}>
          <span style={{ fontSize: '12px', opacity: 0.7 }}>VRAM Required:</span>
          <span style={{ 
            fontSize: '20px', 
            fontWeight: 'bold', 
            color: vramRequired <= 24 ? '#38ef7d' : vramRequired <= 48 ? '#fbbf24' : '#ef4444'
          }}>
            {vramRequired} GB
          </span>
        </div>
      </div>
      
      <button 
        onClick={() => onDeploy(model.id)}
        className="btn-primary"
        style={{ width: '100%' }}
      >
        🚀 Deploy on ComputeMarket
      </button>
    </div>
  );
};

const ModelLibrary: React.FC = () => {
  const [selectedModel, setSelectedModel] = useState<string | null>(null);
  
  const handleDeploy = (modelId: string) => {
    setSelectedModel(modelId);
    // In a real implementation, this would navigate to job creation with pre-filled specs
    console.log('Deploying model:', modelId);
  };
  
  return (
    <div>
      <div style={{ marginBottom: '32px' }}>
        <h2 style={{ fontSize: '28px', fontWeight: 'bold', marginBottom: '8px' }}>
          🧠 LLM Model Library
        </h2>
        <p style={{ opacity: 0.7 }}>
          Browse popular open-weight models and deploy them instantly on ComputeMarket
        </p>
      </div>
      
      {/* VRAM Calculator Info */}
      <div className="card" style={{ 
        padding: '20px', 
        marginBottom: '32px',
        background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.1), rgba(56, 239, 125, 0.05))'
      }}>
        <h3 style={{ marginBottom: '12px' }}>📊 VRAM Calculator</h3>
        <p style={{ opacity: 0.8, marginBottom: '12px' }}>
          Calculate the VRAM needed for LLM inference using the formula:
        </p>
        <code style={{ 
          display: 'block', 
          background: 'rgba(0,0,0,0.3)', 
          padding: '12px', 
          borderRadius: '6px',
          fontFamily: 'monospace',
          fontSize: '14px'
        }}>
          VRAM_GB = (Params_B × bytes_per_param × context_length/1024) + 20% overhead
        </code>
        <p style={{ opacity: 0.7, fontSize: '12px', marginTop: '12px' }}>
          Bytes per param: Q4_K_M=0.5, Q5_K_M=0.625, Q8_0=1.0, F16=2.0, F32=4.0
        </p>
      </div>
      
      {/* Model Grid */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', 
        gap: '24px' 
      }}>
        {MODEL_LIBRARY.map(model => (
          <ModelCard key={model.id} model={model} onDeploy={handleDeploy} />
        ))}
      </div>
      
      {/* Deployment Modal */}
      {selectedModel && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.8)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div className="card" style={{ maxWidth: '500px', width: '90%', padding: '32px' }}>
            <h3 style={{ marginBottom: '16px' }}>Deploy Model</h3>
            <p style={{ opacity: 0.7, marginBottom: '24px' }}>
              Creating a job for {selectedModel}. This will redirect you to the job creation page with pre-filled specifications.
            </p>
            <div style={{ display: 'flex', gap: '12px' }}>
              <button 
                onClick={() => setSelectedModel(null)}
                className="btn-secondary"
                style={{ flex: 1 }}
              >
                Cancel
              </button>
              <button 
                onClick={() => {
                  // Navigate to create job tab
                  const createTab = document.querySelector('button[data-tab="create"]');
                  if (createTab) (createTab as HTMLElement).click();
                  setSelectedModel(null);
                }}
                className="btn-primary"
                style={{ flex: 1 }}
              >
                Continue to Job Creation
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ModelLibrary;
