import React from 'react';
import { LineChart, Line, BarChart, Bar, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

export interface GPUMetric {
  timestamp: number;
  utilization: number;
  memoryUsed: number;
  memoryTotal: number;
  temperature: number;
  powerUsage: number;
}

export interface NetworkMetric {
  timestamp: number;
  uploadSpeed: number;
  downloadSpeed: number;
}

export interface EarningsData {
  date: string;
  earnings: number;
  jobs: number;
}

export interface HostStats {
  uptime: number;
  totalJobs: number;
  completedJobs: number;
  totalEarnings: number;
  averageRating: number;
  gpuCount: number;
  cpuCores: number;
  ramGB: number;
}

// GPU Utilization Chart Component
export const GPUUtilizationChart: React.FC<{ data: GPUMetric[] }> = ({ data }) => (
  <ResponsiveContainer width="100%" height={300}>
    <AreaChart data={data}>
      <defs>
        <linearGradient id="colorUtil" x1="0" y1="0" x2="0" y2="1">
          <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8}/>
          <stop offset="95%" stopColor="#8884d8" stopOpacity={0}/>
        </linearGradient>
        <linearGradient id="colorMemory" x1="0" y1="0" x2="0" y2="1">
          <stop offset="5%" stopColor="#82ca9d" stopOpacity={0.8}/>
          <stop offset="95%" stopColor="#82ca9d" stopOpacity={0}/>
        </linearGradient>
      </defs>
      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
      <XAxis 
        dataKey="timestamp" 
        tickFormatter={(t) => new Date(t).toLocaleTimeString()}
        stroke="rgba(255,255,255,0.6)"
      />
      <YAxis stroke="rgba(255,255,255,0.6)" />
      <Tooltip 
        contentStyle={{ backgroundColor: 'rgba(0,0,0,0.8)', border: '1px solid rgba(255,255,255,0.1)' }}
        labelFormatter={(t) => new Date(t).toLocaleTimeString()}
      />
      <Legend />
      <Area 
        type="monotone" 
        dataKey="utilization" 
        stroke="#8884d8" 
        fillOpacity={1} 
        fill="url(#colorUtil)" 
        name="GPU Utilization %"
      />
      <Area 
        type="monotone" 
        dataKey="memoryUsed" 
        stroke="#82ca9d" 
        fillOpacity={1} 
        fill="url(#colorMemory)" 
        name="Memory Used (MB)"
      />
    </AreaChart>
  </ResponsiveContainer>
);

// Network I/O Chart Component
export const NetworkIOChart: React.FC<{ data: NetworkMetric[] }> = ({ data }) => (
  <ResponsiveContainer width="100%" height={200}>
    <LineChart data={data}>
      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
      <XAxis 
        dataKey="timestamp" 
        tickFormatter={(t) => new Date(t).toLocaleTimeString()}
        stroke="rgba(255,255,255,0.6)"
      />
      <YAxis stroke="rgba(255,255,255,0.6)" />
      <Tooltip 
        contentStyle={{ backgroundColor: 'rgba(0,0,0,0.8)', border: '1px solid rgba(255,255,255,0.1)' }}
        labelFormatter={(t) => new Date(t).toLocaleTimeString()}
      />
      <Legend />
      <Line type="monotone" dataKey="uploadSpeed" stroke="#38ef7d" name="Upload (MB/s)" strokeWidth={2} />
      <Line type="monotone" dataKey="downloadSpeed" stroke="#667eea" name="Download (MB/s)" strokeWidth={2} />
    </LineChart>
  </ResponsiveContainer>
);

// Earnings History Chart Component
export const EarningsChart: React.FC<{ data: EarningsData[] }> = ({ data }) => (
  <ResponsiveContainer width="100%" height={250}>
    <BarChart data={data}>
      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
      <XAxis dataKey="date" stroke="rgba(255,255,255,0.6)" />
      <YAxis stroke="rgba(255,255,255,0.6)" />
      <Tooltip 
        contentStyle={{ backgroundColor: 'rgba(0,0,0,0.8)', border: '1px solid rgba(255,255,255,0.1)' }}
      />
      <Legend />
      <Bar dataKey="earnings" fill="#38ef7d" name="Earnings (CPT)" />
      <Bar dataKey="jobs" fill="#667eea" name="Jobs Completed" />
    </BarChart>
  </ResponsiveContainer>
);

// Resource Distribution Pie Chart
export const ResourceDistributionChart: React.FC<{ gpuCount: number; cpuCores: number; ramGB: number }> = ({ 
  gpuCount, cpuCores, ramGB 
}) => {
  const data = [
    { name: 'GPUs', value: gpuCount, color: '#8884d8' },
    { name: 'CPU Cores', value: cpuCores, color: '#82ca9d' },
    { name: 'RAM (GB)', value: ramGB, color: '#ffc658' },
  ];

  return (
    <ResponsiveContainer width="100%" height={200}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          innerRadius={60}
          outerRadius={80}
          paddingAngle={5}
          dataKey="value"
          label={({ name, value }) => `${name}: ${value}`}
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color} />
          ))}
        </Pie>
        <Tooltip 
          contentStyle={{ backgroundColor: 'rgba(0,0,0,0.8)', border: '1px solid rgba(255,255,255,0.1)' }}
        />
      </PieChart>
    </ResponsiveContainer>
  );
};

export default {
  GPUUtilizationChart,
  NetworkIOChart,
  EarningsChart,
  ResourceDistributionChart,
};
