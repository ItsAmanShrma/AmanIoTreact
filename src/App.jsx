import React, { useState, useEffect } from 'react';
import { Thermometer, Droplets, CloudRain, ShieldAlert, Activity, RefreshCw } from 'lucide-react';

export default function App() {
  const [sensorData, setSensorData] = useState({
    temp: '--',
    humidity: '--',
    rain: '--',
    distance: '--',
    lastUpdate: ''
  });
  const [isSyncing, setIsSyncing] = useState(false);

  // REPLACE THESE WITH YOUR ACTUAL THINGSPEAK INFO
  const CHANNEL_ID = '3355792';
  const READ_KEY = '5GYLA84YHEPWVS8S';

  const fetchThingSpeakData = async () => {
    setIsSyncing(true);
    try {
      const url = `https://api.thingspeak.com/channels/${CHANNEL_ID}/feeds.json?api_key=${READ_KEY}&results=1`;
      const response = await fetch(url);
      const data = await response.json();
      const lastFeed = data.feeds[0];

      if (lastFeed) {
        setSensorData({
          temp: lastFeed.field1 || '0',
          humidity: lastFeed.field2 || '0',
          rain: parseInt(lastFeed.field3) || 1024,
          distance: parseInt(lastFeed.field4) || 100,
          lastUpdate: new Date(lastFeed.created_at).toLocaleTimeString()
        });
      }
    } catch (error) {
      console.error("Connection Error:", error);
    } finally {
      setTimeout(() => setIsSyncing(false), 1000);
    }
  };

  useEffect(() => {
    fetchThingSpeakData();
    const interval = setInterval(fetchThingSpeakData, 15000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 md:p-8 font-sans">
      {/* Header */}
      <header className="max-w-6xl mx-auto mb-10 flex justify-between items-center border-b border-slate-800 pb-6">
        <div>
          <h1 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-500">
            SMART HOME IoT
          </h1>
          <p className="text-slate-500 font-medium">Final Year Project Dashboard</p>
        </div>
        <div className="flex flex-col items-end">
          <div className="flex items-center gap-2 mb-1">
            <RefreshCw size={14} className={isSyncing ? "animate-spin text-blue-400" : "text-slate-600"} />
            <span className="text-xs text-slate-500 uppercase tracking-tighter">Live Status</span>
          </div>
          <p className="font-mono text-blue-400 text-sm">{sensorData.lastUpdate || 'Connecting...'}</p>
        </div>
      </header>

      <main className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* Temperature Card */}
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl shadow-2xl">
          <div className="bg-orange-500/10 w-12 h-12 rounded-2xl flex items-center justify-center mb-6">
            <Thermometer className="text-orange-500" size={24} />
          </div>
          <h3 className="text-slate-400 text-sm">Temperature</h3>
          <p className="text-5xl font-bold mt-2">{sensorData.temp}°<span className="text-2xl text-slate-600 font-light">C</span></p>
        </div>

        {/* Rain Detection Card */}
        <div className={`p-6 rounded-3xl border transition-all duration-500 ${sensorData.rain < 500 ? 'bg-blue-600/20 border-blue-500 animate-pulse' : 'bg-slate-900 border-slate-800'}`}>
          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-6 ${sensorData.rain < 500 ? 'bg-blue-500' : 'bg-slate-800'}`}>
            <CloudRain className={sensorData.rain < 500 ? "text-white" : "text-slate-400"} size={24} />
          </div>
          <h3 className="text-slate-400 text-sm">Rain Status</h3>
          <p className="text-2xl font-bold mt-2">{sensorData.rain < 500 ? "HEAVY RAIN" : "Dry Weather"}</p>
        </div>

        {/* Security Alert Card */}
        <div className={`p-6 rounded-3xl border transition-all duration-500 ${sensorData.distance < 30 ? 'bg-red-600/20 border-red-500' : 'bg-slate-900 border-slate-800'}`}>
          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-6 ${sensorData.distance < 30 ? 'bg-red-500' : 'bg-slate-800'}`}>
            <ShieldAlert className={sensorData.distance < 30 ? "text-white" : "text-slate-400"} size={24} />
          </div>
          <h3 className="text-slate-400 text-sm">Proximity Alert</h3>
          <p className="text-2xl font-bold mt-2">{sensorData.distance < 30 ? "INTRUDER" : "System Secure"}</p>
          <span className="text-xs text-slate-600">{sensorData.distance}cm range</span>
        </div>

        {/* Humidity Card */}
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl shadow-2xl">
          <div className="bg-cyan-500/10 w-12 h-12 rounded-2xl flex items-center justify-center mb-6">
            <Droplets className="text-cyan-400" size={24} />
          </div>
          <h3 className="text-slate-400 text-sm">Humidity</h3>
          <p className="text-5xl font-bold mt-2">{sensorData.humidity}<span className="text-2xl text-slate-600 font-light">%</span></p>
        </div>

      </main>

      <footer className="max-w-6xl mx-auto mt-16 flex justify-between items-center text-slate-700 text-[10px] uppercase tracking-[0.2em]">
        <p>Major Project</p>
        <p>Developed by AMAN SHARMA</p>
      </footer>
    </div>
  );
}