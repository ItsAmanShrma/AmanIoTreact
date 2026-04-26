import React, { useState, useEffect } from 'react';
import Typewriter from 'typewriter-effect';
import { 
  Thermometer, Droplets, CloudRain, ShieldAlert, 
  Activity, RefreshCcw, Database, School, User, Cpu 
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer 
} from 'recharts';

const App = () => {
  const [data, setData] = useState({ temp: '0', humidity: '0', distance: '0', rain: '0', lastSync: '' });
  const [history, setHistory] = useState([]);
  const [isSyncing, setIsSyncing] = useState(false);

  // --- CONFIGURATION ---
  const CHANNEL_ID = '3355792'; 
  const READ_KEY = '5GYLA84YHEPWVS8S'; 

  const fetchData = async () => {
    setIsSyncing(true);
    try {
      const res = await fetch(`https://api.thingspeak.com/channels/${CHANNEL_ID}/feeds.json?api_key=${READ_KEY}&results=20`);
      const json = await res.json();
      const latest = json.feeds[json.feeds.length - 1];

      const chartData = json.feeds.map(f => ({
        time: new Date(f.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        temp: parseFloat(f.field1) || 0,
        humidity: parseFloat(f.field2) || 0,
        distance: parseFloat(f.field3) || 0,
        rain: parseFloat(f.field4) || 0
      }));

      setHistory(chartData);
      setData({
        temp: latest.field1 || '0',
        humidity: latest.field2 || '0',
        distance: latest.field3 || '0',
        rain: latest.field4 || '0',
        lastSync: new Date(latest.created_at).toLocaleTimeString()
      });
    } catch (err) {
      console.error("Data Fetch Error:", err);
    } finally {
      setTimeout(() => setIsSyncing(false), 800);
    }
  };

  useEffect(() => {
    fetchData();
    const timer = setInterval(fetchData, 15000);
    return () => clearInterval(timer);
  }, []);

  const MiniChart = ({ dataKey, color, title }) => (
    <div className="bg-slate-900/40 border border-slate-800 p-4 rounded-2xl shadow-inner">
      <p className="text-[10px] text-slate-500 uppercase font-bold mb-3 tracking-widest">{title} History</p>
      <div className="h-24 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={history}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
            <XAxis dataKey="time" hide />
            <YAxis hide domain={['auto', 'auto']} />
            <Area type="monotone" dataKey={dataKey} stroke={color} fill={color} fillOpacity={0.05} strokeWidth={2} isAnimationActive={false} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#020617] text-slate-200 p-4 md:p-12 font-sans selection:bg-blue-500/30">
      <div className="max-w-7xl mx-auto">
        
        {/* --- HEADER --- */}
        <header className="mb-12 flex flex-col md:flex-row justify-between items-start md:items-center border-b border-blue-900/30 pb-10 gap-6">
          <div className="min-h-[80px]">
            <div className="flex items-center gap-2 mb-2 text-blue-400 font-mono text-[10px] uppercase tracking-[0.4em]">
              <Cpu size={14} /> <span>NodeMCU ESP2866</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-black tracking-tighter text-white uppercase text-wrap max-w-2xl">
              <Typewriter
                options={{
                  strings: ['Smart Home Analytics', 'Aman Sharma | 22154149024'],
                  autoStart: true, loop: true, deleteSpeed: 50, delay: 70,
                }}
              />
            </h1>
          </div>
          
          <div className="bg-blue-950/20 border border-blue-500/30 px-6 py-4 rounded-3xl flex items-center gap-4 shadow-[0_0_15px_rgba(59,130,246,0.1)]">
             <RefreshCcw size={20} className={isSyncing ? "animate-spin text-blue-400" : "text-emerald-400"} />
             <div>
               <p className="text-[10px] text-slate-500 uppercase font-black tracking-widest">Network Pulse</p>
               <p className="text-sm font-mono text-white">{data.lastSync || 'Connecting...'}</p>
             </div>
          </div>
        </header>

        {/* --- SENSOR CARDS --- */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          <div className="bg-slate-900/40 border border-orange-500/20 p-8 rounded-[2rem] shadow-[0_0_20px_-10px_rgba(249,115,22,0.3)]">
            <Thermometer className="text-orange-500 mb-4" size={32} />
            <h3 className="text-slate-500 text-xs font-bold uppercase tracking-widest">Temperature</h3>
            <p className="text-5xl font-black text-white">{data.temp}<span className="text-2xl text-orange-500/30">°C</span></p>
          </div>

          <div className="bg-slate-900/40 border border-cyan-500/20 p-8 rounded-[2rem] shadow-[0_0_20px_-10px_rgba(6,182,212,0.3)]">
            <Droplets className="text-cyan-400 mb-4" size={32} />
            <h3 className="text-slate-500 text-xs font-bold uppercase tracking-widest">Humidity</h3>
            <p className="text-5xl font-black text-white">{data.humidity}<span className="text-2xl text-cyan-500/30">%</span></p>
          </div>

          <div className={`p-8 rounded-[2rem] border-2 transition-all duration-500 ${parseInt(data.distance) > 0 && parseInt(data.distance) < 30 ? 'bg-red-950/20 border-red-500 shadow-[0_0_30px_-5px_rgba(239,68,68,0.4)] animate-pulse' : 'bg-slate-900/40 border-slate-800'}`}>
            <ShieldAlert className={parseInt(data.distance) > 0 && parseInt(data.distance) < 30 ? 'text-red-500 mb-4' : 'text-slate-500 mb-4'} size={32} />
            <h3 className="text-slate-500 text-xs font-bold uppercase tracking-widest">Proximity</h3>
            <p className="text-3xl font-black text-white">{parseInt(data.distance) > 0 && parseInt(data.distance) < 30 ? 'INTRUSION' : 'SECURE'}</p>
          </div>

          <div className={`p-8 rounded-[2rem] border-2 transition-all duration-500 ${data.rain === "1" ? 'bg-blue-900/20 border-blue-500 shadow-[0_0_30px_-5px_rgba(59,130,246,0.4)]' : 'bg-slate-900/40 border-slate-800'}`}>
            <CloudRain className={data.rain === "1" ? 'text-blue-400 mb-4 animate-bounce' : 'text-slate-500 mb-4'} size={32} />
            <h3 className="text-slate-500 text-xs font-bold uppercase tracking-widest">Rain Status</h3>
            <p className="text-3xl font-black text-white">{data.rain === "1" ? 'RAINING' : 'STABLE'}</p>
          </div>
        </div>

        {/* --- ANALYTICS GRID --- */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <MiniChart dataKey="temp" color="#f97316" title="Temperature" />
          <MiniChart dataKey="humidity" color="#22d3ee" title="Humidity" />
          <MiniChart dataKey="distance" color="#ef4444" title="Distance" />
          <MiniChart dataKey="rain" color="#3b82f6" title="Rain Logic" />
        </div>

        {/* --- MAIN GRAPH --- */}
        <div className="bg-slate-900/20 border border-blue-900/30 p-10 rounded-[3rem] shadow-2xl overflow-hidden mb-20">
          <div className="flex items-center gap-3 mb-10">
            <Activity className="text-blue-500" size={24} />
            <h2 className="text-xl font-black uppercase tracking-tighter">Aggregated Data Analysis</h2>
          </div>
          <div className="h-[400px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={history}>
                <defs>
                  <linearGradient id="colorMain" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                <XAxis dataKey="time" stroke="#475569" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="#475569" fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #3b82f6', borderRadius: '20px', color: '#fff' }} />
                <Area type="monotone" dataKey="temp" stroke="#3b82f6" fill="url(#colorMain)" strokeWidth={4} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* --- REFINED COMPACT FOOTER --- */}
        <footer className="mt-20 border-t border-slate-800 pt-10 pb-12">
          <div className="flex flex-col md:flex-row justify-between items-center gap-8">
            
            {/* Left: Identity */}
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center font-bold text-white text-lg shadow-lg">
                AS
              </div>
              <div className="flex flex-col">
                <h3 className="text-lg font-bold text-white tracking-tight leading-none mb-1">AMAN SHARMA</h3>
                <p className="text-[10px] font-mono font-bold text-blue-500 uppercase tracking-widest bg-blue-500/10 px-2 py-0.5 rounded border border-blue-500/20 self-start">
                   REG NO: 22154149024
                </p>
              </div>
            </div>

            {/* Right: Institution (More Compact Layout) */}
            <div className="flex flex-col md:items-end text-center md:text-right">
              <h4 className="text-lg font-bold text-white tracking-tight uppercase mb-1">
                Government Engineering College, <span className="text-blue-500">Gopalganj</span>
              </h4>
              <div className="flex items-center justify-center md:justify-end gap-2 text-emerald-500">
                <School size={16} />
                <p className="text-[10px] font-black uppercase tracking-[0.2em]">
                  BIHAR ENGINEERING UNIVERSITY, PATNA
                </p>
              </div>
            </div>
          </div>
        </footer>

      </div>
    </div>
  );
};

export default App;