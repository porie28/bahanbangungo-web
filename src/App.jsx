import React, { useState, useEffect } from 'react';

const INITIAL_DELIVERIES = [
  {
    id: '#H314315796',
    item: 'Mac Mini M4 Pro',
    sender: '247 Bedford Ave, Brooklyn, NY 11211',
    receiver: '472 Jersey Ave, Jersey City, NJ 07302',
    progress: 40, // Persentase perjalanan kurir
    eta: '1:13 Hours',
    status: 'In Transit',
    type: 'Hardware',
    driver: {
      name: 'Michael Hudson',
      avatar: '👨‍✈️',
      phone: '+1 (555) 234-5678'
    }
  },
  {
    id: '#L814315788',
    item: 'I Phone 16',
    sender: 'Semen Gresik Depot, Jakarta Utara',
    receiver: 'Proyek Sudirman Tower, Jakarta Selatan',
    progress: 85,
    eta: '15 Mins',
    status: 'Out for Delivery',
    type: 'Gadget',
    driver: {
      name: 'Yanto Wijaya',
      avatar: '🛵',
      phone: '+62 812-3456-7890'
    }
  },
  {
    id: '#K814315212',
    item: '10 Sak Semen Padang',
    sender: 'TB. Sumber Agung, Jakarta Barat',
    receiver: 'Kavling Harmoni No. 12, Jakarta Pusat',
    progress: 100,
    eta: 'Delivered',
    status: 'Delivered',
    type: 'Material',
    driver: {
      name: 'Budi Santoso',
      avatar: '🚚',
      phone: '+62 857-9988-1122'
    }
  }
];

export default function App() {
  const [deliveries, setDeliveries] = useState(INITIAL_DELIVERIES);
  const [selectedId, setSelectedId] = useState('#H314315796');
  const [activeDeviceScreen, setActiveDeviceScreen] = useState('home'); // onboarding | home | tracking
  const [showNewDeliveryModal, setShowNewDeliveryModal] = useState(false);
  const [toast, setToast] = useState(null);

  // Form State untuk menambah kiriman baru secara interaktif
  const [newItem, setNewItem] = useState('');
  const [newSender, setNewSender] = useState('');
  const [newReceiver, setNewReceiver] = useState('');

  const activeOrder = deliveries.find(d => d.id === selectedId) || deliveries[0];

  const triggerToast = (message) => {
    setToast(message);
    setTimeout(() => setToast(null), 3000);
  };

  const handleSimulateProgress = () => {
    setDeliveries(prev => prev.map(item => {
      if (item.id === selectedId) {
        if (item.progress >= 100) {
          triggerToast(`Paket ${item.item} sudah sampai di tujuan!`);
          return item;
        }
        const nextProgress = Math.min(item.progress + 20, 100);
        let nextStatus = item.status;
        if (nextProgress === 100) nextStatus = 'Delivered';
        else if (nextProgress > 80) nextStatus = 'Out for Delivery';
        else nextStatus = 'In Transit';

        triggerToast(`Kurir bergerak! Progress ${item.item} sekarang ${nextProgress}%`);
        return { ...item, progress: nextProgress, status: nextStatus, eta: nextProgress === 100 ? 'Delivered' : item.eta };
      }
      return item;
    }));
  };

  // Tambah Pengiriman Baru dari Modal
  const handleAddDelivery = (e) => {
    e.preventDefault();
    if (!newItem || !newSender || !newReceiver) {
      triggerToast('Harap isi semua kolom rincian!');
      return;
    }

    const newId = '#D' + Math.floor(100000 + Math.random() * 900000);
    const newRecord = {
      id: newId,
      item: newItem,
      sender: newSender,
      receiver: newReceiver,
      progress: 10,
      eta: '2:30 Hours',
      status: 'In Transit',
      type: 'Material',
      driver: {
        name: 'Aris Nugroho',
        avatar: '🚛',
        phone: '+62 899-7766-5544'
      }
    };

    setDeliveries([newRecord, ...deliveries]);
    setSelectedId(newId);
    setShowNewDeliveryModal(false);
    setNewItem('');
    setNewSender('');
    setNewReceiver('');
    triggerToast(`Pengiriman ${newId} berhasil dibuat!`);
  };

  return (
    <div className="min-h-screen bg-[#E1DEDC] font-sans text-slate-800 flex flex-col justify-between p-4 md:p-8 antialiased selection:bg-[#FF5A36] selection:text-white">
      
      {}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
        
        body {
          font-family: 'Plus Jakarta Sans', sans-serif !important;
          background-color: #E1DEDC;
        }

        /* Desain Claymorphism & Efek Bayangan Lembut ala Dribbble */
        .device-container {
          background-color: #F4F3F1;
          border-radius: 44px;
          border: 12px solid #FFFFFF;
          box-shadow: 0 24px 48px -12px rgba(0,0,0,0.16), inset 0 2px 4px rgba(255,255,255,0.8);
          width: 360px;
          height: 760px;
          position: relative;
          overflow: hidden;
          display: flex;
          flex-col: column;
        }

        .notch-bar {
          width: 140px;
          height: 24px;
          background-color: #111827;
          border-bottom-left-radius: 18px;
          border-bottom-right-radius: 18px;
          position: absolute;
          left: 50%;
          transform: translateX(-50%);
          top: 0;
          z-index: 50;
        }

        .premium-orange {
          color: #FF5A36;
        }

        .bg-premium-orange {
          background-color: #FF5A36;
        }

        .bg-premium-gold {
          background-color: #E8A84D;
        }

        /* Glassmorphism Frosted Panel */
        .glass-panel {
          background: rgba(255, 255, 255, 0.85);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          border: 1px solid rgba(255, 255, 255, 0.5);
        }

        /* Sembunyikan scrollbar bawaan agar tetap minimalis */
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>

      {}
      <header className="w-full max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4 mb-6 text-center md:text-left z-10">
        <div>
          <div className="flex items-center justify-center md:justify-start gap-2">
            <span className="text-3xl">🚚</span>
            <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">
              BahanBangunGo <span className="text-[#FF5A36] font-normal">Premium Mockup</span>
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-1 uppercase tracking-widest font-bold">100% High Fidelity Live Interface Mockup</p>
        </div>

        {/* Kontrol Panel Simulator Driver */}
        <div className="flex flex-wrap gap-2 justify-center bg-white/90 backdrop-blur-md p-2 rounded-2xl border border-white/60 shadow-md">
          <button
            onClick={handleSimulateProgress}
            className="bg-slate-950 text-white hover:bg-[#FF5A36] text-[11px] font-bold px-4 py-2.5 rounded-xl transition-all duration-300 flex items-center gap-1.5 shadow"
          >
            <span>⚡</span> Simulate Driver Progress
          </button>
          <button
            onClick={() => {
              setDeliveries(INITIAL_DELIVERIES);
              setSelectedId('#H314315796');
              triggerToast('Database disetel kembali ke awal.');
            }}
            className="bg-white text-slate-700 hover:bg-slate-100 border border-slate-200 text-[11px] font-bold px-3 py-2.5 rounded-xl transition"
          >
            Reset Database
          </button>
        </div>
      </header>

      {/* TOAST ALERTS */}
      {toast && (
        <div className="fixed top-24 left-1/2 transform -translate-x-1/2 z-50 bg-slate-900 text-white text-xs font-bold px-5 py-3.5 rounded-2xl shadow-xl flex items-center gap-2 border border-slate-800 animate-bounce">
          <span className="w-2 h-2 rounded-full bg-[#FF5A36]"></span>
          <span>{toast}</span>
        </div>
      )}

      {}
      <div className="flex lg:hidden bg-white/90 p-1.5 rounded-2xl mb-6 shadow-sm border border-slate-200 w-full max-w-sm mx-auto z-10">
        {[
          { id: 'onboarding', label: '1. Onboarding', icon: '✨' },
          { id: 'home', label: '2. Home Hub', icon: '🏠' },
          { id: 'tracking', label: '3. Tracking', icon: '📍' }
        ].map(device => (
          <button
            key={device.id}
            onClick={() => setActiveDeviceScreen(device.id)}
            className={`flex-1 py-2 text-[10px] font-bold rounded-xl transition-all ${
              activeDeviceScreen === device.id 
                ? 'bg-[#FF5A36] text-white shadow-md' 
                : 'text-slate-500 hover:bg-slate-50'
            }`}
          >
            <span className="block text-sm mb-0.5">{device.icon}</span>
            {device.label.split('. ')[1]}
          </button>
        ))}
      </div>

      {}
      <div className="w-full max-w-7xl mx-auto flex-1 flex items-center justify-center">
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 justify-items-center w-full">

          {/* ==========================================
              LAYAR 1: ONBOARDING SCREEN (PERSIS GAMBAR KIRI)
              ========================================== */}
          <div className={`${activeDeviceScreen === 'onboarding' ? 'flex' : 'hidden lg:flex'} flex-col items-center`}>
            <span className="hidden lg:block text-[11px] font-black text-slate-500 uppercase tracking-widest mb-3">Screen 1: Onboarding</span>
            
            <div className="device-container flex flex-col justify-between">
              <div className="notch-bar"></div>

              {/* Konten Atas: Ilustrasi Truck Premium */}
              <div className="w-full flex-1 relative flex flex-col justify-end items-center overflow-hidden">
                
                {/* Background Sky / City Silhouette */}
                <div className="absolute inset-0 bg-gradient-to-b from-blue-100 to-white z-0"></div>

                {/* Render SVG Ilustrasi Truk Mewah & Kurir (Match 100%) */}
                <svg className="w-full h-80 z-10" viewBox="0 0 360 320" fill="none" xmlns="http://www.w3.org/2000/svg">
                  {/* Sky Clouds */}
                  <path d="M40 80 Q60 60 80 80 T120 80" stroke="#FFFFFF" strokeWidth="4" strokeLinecap="round" />
                  <path d="M220 100 Q240 80 260 100 T300 100" stroke="#FFFFFF" strokeWidth="4" strokeLinecap="round" />
                  
                  {/* Container Stack Background */}
                  <rect x="20" y="110" width="100" height="90" rx="4" fill="#8B4513" opacity="0.1" />
                  <rect x="30" y="130" width="80" height="70" rx="3" fill="#D2B48C" opacity="0.2" />

                  {/* High Tech Logistics Truck Body */}
                  <g transform="translate(40, 110)">
                    {/* Cargo Container */}
                    <rect x="20" y="20" width="160" height="90" rx="8" fill="#ECEFF1" />
                    <rect x="25" y="25" width="150" height="80" rx="4" fill="#CFD8DC" />
                    {/* Stripes on Container */}
                    <line x1="50" y1="25" x2="50" y2="105" stroke="#FFFFFF" strokeWidth="3" />
                    <line x1="90" y1="25" x2="90" y2="105" stroke="#FFFFFF" strokeWidth="3" />
                    <line x1="130" y1="25" x2="130" y2="105" stroke="#FFFFFF" strokeWidth="3" />

                    {/* Truck Cabin Cabin */}
                    <path d="M180 40 H230 Q240 40 245 50 L255 75 Q260 85 260 95 V110 H180 Z" fill="#37474F" />
                    {/* Cabin Window */}
                    <path d="M200 48 H225 L235 70 H200 Z" fill="#90A4AE" />
                    {/* Bumper */}
                    <rect x="240" y="102" width="22" height="8" rx="2" fill="#ECEFF1" />
                    {/* Yellow Headlight */}
                    <circle cx="254" cy="94" r="5" fill="#FFEB3B" />
                  </g>

                  {/* Wheels */}
                  <circle cx="95" cy="220" r="16" fill="#212121" />
                  <circle cx="95" cy="220" r="7" fill="#CFD8DC" />
                  <circle cx="215" cy="220" r="16" fill="#212121" />
                  <circle cx="215" cy="220" r="7" fill="#CFD8DC" />
                  <circle cx="265" cy="220" r="16" fill="#212121" />
                  <circle cx="265" cy="220" r="7" fill="#CFD8DC" />

                  {/* Character Courier 3D Stylized (Friendly Mascot) */}
                  <g transform="translate(240, 140)">
                    {/* Body */}
                    <rect x="15" y="40" width="20" height="40" rx="8" fill="#E8A84D" />
                    {/* Head */}
                    <circle cx="25" cy="25" r="15" fill="#FFCC80" />
                    {/* Cap / Topi Oranye */}
                    <path d="M10 20 Q25 5 40 20 H10" fill="#E8A84D" />
                    <path d="M25 10 H45 V15 H25 Z" fill="#E8A84D" />
                    {/* Mascot Eyes */}
                    <circle cx="20" cy="24" r="2" fill="#212121" />
                    <circle cx="30" cy="24" r="2" fill="#212121" />
                    {/* Smile */}
                    <path d="M22 29 Q25 32 28 29" stroke="#212121" strokeWidth="2" strokeLinecap="round" />
                    {/* Holding Package */}
                    <rect x="5" y="45" width="22" height="18" rx="3" fill="#D7CCC8" stroke="#A1887F" strokeWidth="1" />
                    <line x1="5" y1="54" x2="27" y2="54" stroke="#A1887F" strokeWidth="1" />
                  </g>
                </svg>

                {/* Fade White Overlay */}
                <div className="absolute bottom-0 left-0 right-0 h-28 bg-gradient-to-t from-white to-transparent z-20"></div>
              </div>

              {/* Konten Bawah: Teks & Button Onboarding */}
              <div className="bg-white px-6 pb-10 pt-4 text-center rounded-t-[40px] shadow-[0_-12px_24px_rgba(0,0,0,0.03)] z-30">
                <h2 className="text-2xl font-extrabold text-slate-900 leading-tight mb-2">
                  Receive The World at Your Doorstep
                </h2>
                <p className="text-xs text-slate-400 font-medium leading-relaxed max-w-[260px] mx-auto mb-8">
                  The world's best experiences now arrive easily at your doorstep.
                </p>

                {/* Tombol Get Start Melengkung Indah */}
                <button
                  onClick={() => setActiveDeviceScreen('home')}
                  className="w-full bg-premium-gold hover:bg-[#FF5A36] text-white py-4 rounded-[20px] font-bold text-sm tracking-wide transition-all duration-300 shadow-lg shadow-amber-500/20 active:scale-95"
                >
                  Get Start
                </button>
              </div>

              {/* Home Bar Indicator */}
              <div className="w-32 h-1 bg-slate-200 rounded-full mx-auto mb-2"></div>
            </div>
          </div>

          {/* ==========================================
              LAYAR 2: HOME DASHBOARD HUB (PERSIS GAMBAR TENGAH)
              ========================================== */}
          <div className={`${activeDeviceScreen === 'home' ? 'flex' : 'hidden lg:flex'} flex-col items-center`}>
            <span className="hidden lg:block text-[11px] font-black text-slate-500 uppercase tracking-widest mb-3">Screen 2: Home Hub</span>
            
            <div className="device-container flex flex-col justify-between">
              <div className="notch-bar"></div>

              {/* Area Konten Scrollable */}
              <div className="flex-1 overflow-y-auto px-5 pt-10 pb-20 no-scrollbar">
                
                {/* Header: Location & Bell */}
                <div className="flex justify-between items-center mb-6">
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Location</p>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span className="text-sm">📍</span>
                      <span className="font-extrabold text-xs text-slate-800">New York ,USA</span>
                    </div>
                  </div>
                  {/* Notification Icon */}
                  <button className="w-9 h-9 rounded-full bg-white flex items-center justify-center text-slate-700 shadow-sm relative border border-slate-100">
                    <span>🔔</span>
                    <span className="absolute top-2.5 right-2.5 w-2 h-2 rounded-full bg-red-500 border border-white"></span>
                  </button>
                </div>

                {/* Search Bar Minimalis */}
                <div className="bg-white rounded-2xl p-2.5 shadow-sm border border-slate-100 flex items-center justify-between gap-2 mb-6">
                  <div className="flex items-center gap-2.5 flex-1 px-1">
                    <span className="text-slate-400 text-sm">🔍</span>
                    <input 
                      type="text" 
                      placeholder="Search" 
                      className="text-xs bg-transparent border-0 w-full focus:outline-none font-semibold text-slate-800 placeholder:text-slate-400"
                    />
                  </div>
                  {/* Scan QR Icon */}
                  <button className="w-7 h-7 rounded-lg bg-premium-gold/10 text-premium-gold flex items-center justify-center text-xs font-bold">
                    [O]
                  </button>
                </div>

                {}
                <div className="grid grid-cols-2 gap-4 mb-6">
                  {/* New Delivery Card */}
                  <button 
                    onClick={() => setShowNewDeliveryModal(true)}
                    className="bg-[#FFEEDB] border border-orange-100 hover:scale-105 transition-all rounded-[24px] p-4 text-left flex flex-col justify-between h-28 relative overflow-hidden"
                  >
                    <div>
                      <p className="font-extrabold text-xs text-slate-800 leading-snug">New<br />Delivery</p>
                    </div>
                    {/* Mini delivery truck inside card */}
                    <div className="absolute right-2 bottom-2 text-3xl">🚚</div>
                  </button>

                  {/* Track Package Card */}
                  <button 
                    onClick={() => setActiveDeviceScreen('tracking')}
                    className="bg-white border border-slate-100 hover:scale-105 transition-all rounded-[24px] p-4 text-left flex flex-col justify-between h-28 relative overflow-hidden shadow-sm"
                  >
                    <div>
                      <p className="font-extrabold text-xs text-slate-800 leading-snug">Track<br />Package</p>
                    </div>
                    {/* Mini parcel package inside card */}
                    <div className="absolute right-2 bottom-2 text-3xl">📦</div>
                  </button>
                </div>

                {/* Title: Current Shipment */}
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-extrabold text-sm text-slate-800">Current Shipment</h3>
                  <button className="text-[10px] font-bold text-slate-400 hover:text-slate-800">See all</button>
                </div>

                {}
                <div className="space-y-4">
                  {deliveries.map(item => (
                    <div 
                      key={item.id}
                      onClick={() => {
                        setSelectedId(item.id);
                        triggerToast(`Detail ${item.item} diaktifkan.`);
                      }}
                      className={`bg-white rounded-[24px] p-4 border transition-all cursor-pointer shadow-sm ${
                        selectedId === item.id 
                          ? 'border-premium-gold ring-2 ring-premium-gold/20' 
                          : 'border-slate-100 hover:border-slate-200'
                      }`}
                    >
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-lg shadow-inner">
                          📦
                        </div>
                        <div>
                          <h4 className="font-extrabold text-xs text-slate-800 leading-none">{item.item}</h4>
                          <p className="text-[9px] text-slate-400 font-bold mt-1.5">ID: {item.id}</p>
                        </div>
                      </div>

                      {/* Line Stepper Progress Horizontal */}
                      <div className="relative py-2">
                        <div className="h-1 bg-slate-100 rounded-full w-full absolute top-1/2 transform -translate-y-1/2"></div>
                        {/* Orange Active Progress Bar */}
                        <div 
                          className="h-1 bg-premium-gold rounded-full absolute top-1/2 transform -translate-y-1/2 transition-all duration-500"
                          style={{ width: `${item.progress}%` }}
                        ></div>
                        
                        {/* Progress Stepper Milestones */}
                        <div className="flex justify-between relative z-10">
                          <span className={`w-2.5 h-2.5 rounded-full border-2 ${item.progress >= 0 ? 'bg-premium-gold border-white' : 'bg-slate-200 border-white'}`}></span>
                          <span className={`w-2.5 h-2.5 rounded-full border-2 ${item.progress >= 50 ? 'bg-premium-gold border-white' : 'bg-slate-200 border-white'}`}></span>
                          <span className={`w-2.5 h-2.5 rounded-full border-2 ${item.progress >= 100 ? 'bg-premium-gold border-white' : 'bg-slate-200 border-white'}`}></span>
                        </div>

                        {/* Animated sliding delivery truck icon */}
                        <div 
                          className="absolute -top-1 transition-all duration-500 transform -translate-x-1/2 text-xs"
                          style={{ left: `${item.progress}%` }}
                        >
                          🛵
                        </div>
                      </div>

                      {/* Card Footer Info */}
                      <div className="flex justify-between items-center mt-3 pt-2.5 border-t border-slate-50 text-[10px] text-slate-500 font-bold">
                        <div>
                          <span className="block text-[8px] text-slate-400 font-medium">Location</span>
                          <span className="text-slate-700">Jersey City</span>
                        </div>
                        <div className="text-right">
                          <span className="block text-[8px] text-slate-400 font-medium">Delivery Time</span>
                          <span className="text-premium-gold">{item.eta}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

              </div>

              {/* Floating Menu Bottom Nav Bar (Kapsul Melayang) */}
              <div className="absolute bottom-4 left-4 right-4 z-40 bg-white/90 backdrop-blur-md rounded-[24px] p-2 border border-slate-150/60 shadow-lg flex justify-around items-center">
                {[
                  { label: 'Home', icon: '🏠', active: true },
                  { label: 'Map', icon: '🧭', active: false },
                  { label: 'Cart', icon: '🛒', active: false },
                  { label: 'Profile', icon: '👤', active: false }
                ].map((tab, i) => (
                  <button
                    key={i}
                    onClick={() => {
                      if (tab.label === 'Map') setActiveDeviceScreen('tracking');
                      triggerToast(`Membuka menu ${tab.label}`);
                    }}
                    className={`flex items-center gap-1.5 py-2 px-4 rounded-xl transition-all duration-300 ${
                      tab.active 
                        ? 'bg-[#111827] text-white shadow-md' 
                        : 'text-slate-400 hover:text-slate-800'
                    }`}
                  >
                    <span className="text-sm">{tab.icon}</span>
                    {tab.active && <span className="text-[10px] font-bold">{tab.label}</span>}
                  </button>
                ))}
              </div>

              {/* Home Bar Indicator */}
              <div className="w-32 h-1 bg-slate-200 rounded-full mx-auto mb-2 z-50"></div>
            </div>
          </div>

          {/* ==========================================
              LAYAR 3: LIVE TRACKING SCREEN (PERSIS GAMBAR KANAN)
              ========================================== */}
          <div className={`${activeDeviceScreen === 'tracking' ? 'flex' : 'hidden lg:flex'} flex-col items-center`}>
            <span className="hidden lg:block text-[11px] font-black text-slate-500 uppercase tracking-widest mb-3">Screen 3: Delivery Tracking</span>
            
            <div className="device-container flex flex-col justify-between">
              <div className="notch-bar"></div>

              {}
              <div className="absolute inset-0 w-full h-[380px] bg-slate-900 z-0 overflow-hidden">
                <svg className="absolute inset-0 w-full h-full scale-[1.15]" viewBox="0 0 360 380" fill="none" xmlns="http://www.w3.org/2000/svg">
                  {/* Grid Lines Map (Futuristic Hologram) */}
                  <path d="M0 60L360 210M0 110L360 260M0 160L360 310M0 210L360 360" stroke="#334155" strokeWidth="1" strokeOpacity="0.4" />
                  <path d="M0 210L360 60M0 260L360 110M0 310L360 160M0 360L360 210" stroke="#334155" strokeWidth="1" strokeOpacity="0.4" />
                  
                  {/* Cyberpunk Tech Roads */}
                  <path d="M50 120 L 180 180 L 180 300" stroke="#1E293B" strokeWidth="8" strokeLinecap="round" />
                  <path d="M120 80 L 220 220 L 320 180" stroke="#1E293B" strokeWidth="8" strokeLinecap="round" />

                  {/* GLOWING ORANGE ROUTE */}
                  <path d="M80 150 L 180 220 L 260 180" stroke="#FF5A36" strokeWidth="4.5" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M80 150 L 180 220 L 260 180" stroke="#FFFFFF" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" />

                  {/* 3D Glassmorphism Buildings */}
                  <g transform="translate(165, 195)">
                    <polygon points="15,0 30,8 15,16 0,8" fill="#FF8A65" />
                    <polygon points="0,8 15,16 15,40 0,32" fill="#E64A19" />
                    <polygon points="15,16 30,8 30,32 15,40" fill="#FF5A36" />
                    {/* Glowing Light Ring */}
                    <circle cx="15" cy="8" r="6" fill="#FFFFFF" className="animate-ping" opacity="0.4" />
                  </g>

                  {/* Home Destination Pin */}
                  <g transform="translate(173, 160)">
                    <rect width="18" height="18" rx="9" fill="#111827" />
                    <text x="9" y="13" fill="white" fontSize="9" textAnchor="middle">🏠</text>
                  </g>

                  {/* Glowing Truck Pin */}
                  <g transform="translate(100, 140)" className="animate-bounce">
                    <circle cx="15" cy="15" r="16" fill="white" filter="drop-shadow(0px 8px 12px rgba(0,0,0,0.3))" />
                    <text x="7" y="21" fontSize="15">🚚</text>
                  </g>
                </svg>

                {/* Back Button and Map Options Header */}
                <div className="absolute top-10 left-4 right-4 z-20 flex justify-between items-center">
                  <button 
                    onClick={() => setActiveDeviceScreen('home')} 
                    className="w-9 h-9 rounded-full bg-white flex items-center justify-center text-xs font-bold text-slate-700 shadow shadow-slate-900/10 hover:bg-slate-50 transition"
                  >
                    ‹
                  </button>
                  <h3 className="font-extrabold text-xs text-slate-900 tracking-tight bg-white/90 backdrop-blur-md px-4 py-1.5 rounded-full shadow border border-white/40">Delivery Tracking</h3>
                  <button className="w-9 h-9 rounded-full bg-white flex items-center justify-center text-slate-700 shadow font-black">
                    •••
                  </button>
                </div>
              </div>

              {}
              <div className="glass-panel rounded-t-[36px] shadow-[0_-12px_36px_rgba(0,0,0,0.12)] flex-1 px-5 pt-4 pb-2 flex flex-col justify-between mt-[320px] z-20">
                
                {/* Pull Indicator Bar */}
                <div className="w-10 h-1 bg-slate-300 rounded-full mx-auto mb-4"></div>

                {/* Tracking ID Header */}
                <div className="text-center">
                  <span className="inline-flex items-center gap-1.5 text-[10px] font-extrabold bg-[#FF5A36]/10 text-[#FF5A36] px-3 py-1 rounded-full mb-1">
                    <span>⚡</span> {activeOrder.status}
                  </span>
                  <h2 className="text-lg font-extrabold text-slate-900 tracking-tight">{activeOrder.id}</h2>
                  <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">Transit on Feb 20, 2026</p>
                </div>

                {/* Rute Alamat dengan Garis Putus-Putus */}
                <div className="bg-white/60 p-4 rounded-2xl border border-white/50 my-4 text-xs">
                  <div className="relative pl-6 space-y-4">
                    {/* Orange Dotted Line */}
                    <div className="absolute left-2 top-2 bottom-2 w-0.5 border-l-2 border-dashed border-[#FF5A36]"></div>

                    {/* Sender Info */}
                    <div className="relative">
                      <span className="absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full bg-premium-gold ring-4 ring-amber-100"></span>
                      <p className="text-[9px] text-slate-400 font-bold uppercase">Sender</p>
                      <p className="font-bold text-slate-700 mt-0.5 leading-tight truncate">{activeOrder.sender}</p>
                    </div>

                    {/* Receiver Info */}
                    <div className="relative">
                      <span className="absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full bg-[#FF5A36] ring-4 ring-orange-100"></span>
                      <p className="text-[9px] text-slate-400 font-bold uppercase">Receiver</p>
                      <p className="font-bold text-slate-700 mt-0.5 leading-tight truncate">{activeOrder.receiver}</p>
                    </div>
                  </div>
                </div>

                {}
                <div className="bg-white rounded-2xl p-3 border border-slate-100 flex items-center justify-between shadow-sm mb-2">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-xl shadow-inner">
                      {activeOrder.driver.avatar}
                    </div>
                    <div>
                      <h4 className="font-extrabold text-xs text-slate-800 leading-none">{activeOrder.driver.name}</h4>
                      <p className="text-[9px] text-slate-400 font-bold mt-1.5">Driver Logistik Aktif</p>
                    </div>
                  </div>
                  {/* Call Action Button */}
                  <button 
                    onClick={() => triggerToast(`Menghubungi driver: ${activeOrder.driver.phone}`)}
                    className="w-9 h-9 rounded-full bg-slate-900 text-white hover:bg-[#FF5A36] flex items-center justify-center text-sm shadow transition-all duration-300"
                  >
                    📞
                  </button>
                </div>

              </div>

              {/* Home Bar Indicator */}
              <div className="w-32 h-1 bg-slate-200 rounded-full mx-auto mb-2"></div>
            </div>
          </div>

        </div>

      </div>

      {}
      {showNewDeliveryModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[32px] w-full max-w-sm p-6 shadow-2xl border border-slate-100 transform transition-all animate-in fade-in zoom-in-95">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-base font-extrabold text-slate-900">Buat Kiriman Baru</h3>
              <button 
                onClick={() => setShowNewDeliveryModal(false)}
                className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddDelivery} className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Nama Barang / Material</label>
                <input 
                  type="text" 
                  value={newItem}
                  onChange={(e) => setNewItem(e.target.value)}
                  placeholder="Contoh: Mac Mini M4 Pro, 10 Sak Semen"
                  className="w-full text-xs border border-slate-200 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-[#FF5A36]"
                  required
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Alamat Penjemputan (Pickup)</label>
                <input 
                  type="text" 
                  value={newSender}
                  onChange={(e) => setNewSender(e.target.value)}
                  placeholder="Nama toko / depot asal"
                  className="w-full text-xs border border-slate-200 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-[#FF5A36]"
                  required
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Alamat Pengiriman (Drop-off)</label>
                <input 
                  type="text" 
                  value={newReceiver}
                  onChange={(e) => setNewReceiver(e.target.value)}
                  placeholder="Lokasi proyek / alamat rumah"
                  className="w-full text-xs border border-slate-200 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-[#FF5A36]"
                  required
                />
              </div>

              <button
                type="submit"
                className="w-full bg-[#FF5A36] text-white py-3.5 rounded-xl font-bold text-xs shadow-lg shadow-orange-500/10 hover:bg-slate-900 transition-all duration-300"
              >
                Kirim Sekarang 🚀
              </button>
            </form>
          </div>
        </div>
      )}

      {/* FOOTER */}
      <footer className="w-full max-w-7xl mx-auto text-center text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-12 mb-2">
        <p>© 2026 BahanBangunGo Ltd. All rights reserved.</p>
        <p className="text-[#FF5A36] mt-1 normal-case font-medium">Rendered with extreme performance and premium precision.</p>
      </footer>

    </div>
  );
}