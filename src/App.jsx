import React, { useState, useEffect, useRef } from 'react';

const INITIAL_DELIVERIES = [
  {
    id: '#A8653K005',
    date: 'Feb 20, 2026',
    status: 'In Transit',
    statusColor: 'bg-orange-500',
    pickupAddress: '1527 Pond Reef Rd, Ketchikan, Alaska',
    deliveryAddress: '23475 Glacier View, Eagle River, Alaska',
    weight: '2.0 KG',
    size: 'Medium (30x20x20 cm)',
    type: 'Box',
    courier: 'DHL Express',
    timeline: [
      { label: 'Picked Up', time: 'Feb 1, 2026 at 04:30 PM', location: 'New York, USA', completed: true },
      { label: 'In Transit', time: 'Feb 2, 2026 at 11:30 AM', location: 'New York, USA', completed: true },
      { label: 'Out for Delivery', time: 'Pending', location: 'Alaska, USA', completed: false },
      { label: 'Delivered', time: 'Pending', location: 'Alaska, USA', completed: false }
    ]
  },
  {
    id: '#A4735R734',
    date: 'Feb 15, 2026',
    status: 'Delivered',
    statusColor: 'bg-emerald-500',
    pickupAddress: '128 Sultan Agung, Jakarta Selatan',
    deliveryAddress: 'Jl. Jenderal Sudirman No. 21, Jakarta',
    weight: '40.0 KG',
    size: 'Large (Semen Gresik)',
    type: 'Heavy Sack',
    courier: 'BahanBangunGo Logistik',
    timeline: [
      { label: 'Picked Up', time: 'Feb 14, 2026 at 08:00 AM', location: 'Semen Gresik Hub', completed: true },
      { label: 'In Transit', time: 'Feb 14, 2026 at 12:30 PM', location: 'Jakarta Transit', completed: true },
      { label: 'Out for Delivery', time: 'Feb 15, 2026 at 09:15 AM', location: 'Sudirman Area', completed: true },
      { label: 'Delivered', time: 'Feb 15, 2026 at 10:45 AM', location: 'Office Tower Jakarta', completed: true }
    ]
  },
  {
    id: '#A7642T875',
    date: 'Feb 12, 2026',
    status: 'Delivered',
    statusColor: 'bg-emerald-500',
    pickupAddress: 'Depo Bangunan Sejahtera, Jakarta',
    deliveryAddress: 'Jl. Merapi Indah No. 42, Sleman',
    weight: '1400.0 KG',
    size: 'Super Heavy (Pasir Cor)',
    type: 'Dump Truck Cargo',
    courier: 'BahanBangunGo Heavy Cargo',
    timeline: [
      { label: 'Picked Up', time: 'Feb 10, 2026 at 10:00 AM', location: 'Depo Merapi', completed: true },
      { label: 'In Transit', time: 'Feb 11, 2026 at 02:00 PM', location: 'Central Java Highway', completed: true },
      { label: 'Out for Delivery', time: 'Feb 12, 2026 at 07:30 AM', location: 'Sleman Area', completed: true },
      { label: 'Delivered', time: 'Feb 12, 2026 at 09:00 AM', location: 'Proyek Merapi Indah', completed: true }
    ]
  }
];

export default function App() {
  const [deliveries, setDeliveries] = useState(INITIAL_DELIVERIES);
  const [selectedId, setSelectedId] = useState('#A8653K005');
  const [activeDevice, setActiveDevice] = useState('home'); // Untuk layout responsive HP (create | home | tracking)
  const [toastMessage, setToastMessage] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Form State untuk "Create Shipment" (Layar 1)
  const [pickupAddress, setPickupAddress] = useState('1527 Pond Reef Rd, Ketchikan, Alaska');
  const [deliveryAddress, setDeliveryAddress] = useState('23475 Glacier View, Eagle River, Alaska');
  const [weight, setWeight] = useState('2.0 KG');
  const [size, setSize] = useState('Medium (30x20x20 cm)');
  const [packageType, setPackageType] = useState('Box');
  const [courier, setCourier] = useState('DHL Express');

  // Menemukan detail pesanan logistik aktif yang sedang dilacak
  const activeOrder = deliveries.find(d => d.id === selectedId) || deliveries[0];

  const triggerToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  // Membuat kiriman logistik baru secara instan
  const handleCreateShipment = (e) => {
    e.preventDefault();
    const newId = '#A' + Math.floor(100000 + Math.random() * 900000);
    const newShipment = {
      id: newId,
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      status: 'Picked Up',
      statusColor: 'bg-blue-500',
      pickupAddress,
      deliveryAddress,
      weight,
      size,
      type: packageType,
      courier,
      timeline: [
        { label: 'Picked Up', time: new Date().toLocaleString('en-US', { hour12: true }), location: 'Origin Depot', completed: true },
        { label: 'In Transit', time: 'Pending', location: 'On the way', completed: false },
        { label: 'Out for Delivery', time: 'Pending', location: 'Destination City', completed: false },
        { label: 'Delivered', time: 'Pending', location: 'Final Address', completed: false }
      ]
    };

    setDeliveries([newShipment, ...deliveries]);
    setSelectedId(newId);
    triggerToast(`Shipment ${newId} Created successfully!`);
    setActiveDevice('home'); // Berpindah otomatis ke layar dashboard home
  };

  // Simulasi Pergerakan Kurir Logistik
  const handleSimulateProgress = () => {
    setDeliveries(prevDeliveries => {
      return prevDeliveries.map(item => {
        if (item.id === selectedId) {
          const currentTimeline = [...item.timeline];
          // Temukan indeks tahap yang belum selesai pertama kali
          const nextStepIdx = currentTimeline.findIndex(t => !t.completed);
          
          if (nextStepIdx !== -1) {
            currentTimeline[nextStepIdx].completed = true;
            currentTimeline[nextStepIdx].time = new Date().toLocaleString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
            
            // Perbarui status utama barang
            let newStatus = item.status;
            let newColor = item.statusColor;
            if (nextStepIdx === 1) { newStatus = 'In Transit'; newColor = 'bg-orange-500'; }
            else if (nextStepIdx === 2) { newStatus = 'Out for Delivery'; newColor = 'bg-blue-600'; }
            else if (nextStepIdx === 3) { newStatus = 'Delivered'; newColor = 'bg-emerald-500'; }

            triggerToast(`Driver status updated for ${item.id}: ${currentTimeline[nextStepIdx].label}!`);

            return {
              ...item,
              status: newStatus,
              statusColor: newColor,
              timeline: currentTimeline
            };
          } else {
            triggerToast(`Shipment ${item.id} is already fully delivered!`);
          }
        }
        return item;
      });
    });
  };

  // Filter pengiriman berdasarkan isian bar pencarian
  const filteredDeliveries = deliveries.filter(d => 
    d.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
    d.courier.toLowerCase().includes(searchQuery.toLowerCase()) ||
    d.deliveryAddress.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#E1DEDC] font-sans text-[#111827] flex flex-col items-center justify-between p-4 md:p-8 antialiased selection:bg-[#FF5A36] selection:text-white">
      
      {/* HEADER UTAMA & WORKSPACE CONTROLLERS */}
      <header className="w-full max-w-7xl flex flex-col md:flex-row justify-between items-center gap-4 mb-6 text-center md:text-left">
        <div>
          <div className="flex items-center justify-center md:justify-start gap-2.5">
            <span className="text-2xl">📦</span>
            <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">
              BahanBangunGo <span className="text-[#FF5A36] font-normal">UI/UX Studio</span>
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-1 uppercase tracking-widest font-bold">100% High Fidelity Live Interface Mockup</p>
        </div>

        {/* CONTROLLER PANEL (ADMIN / LOGISTICS SIMULATOR) */}
        <div className="flex flex-wrap gap-2 justify-center bg-white/80 backdrop-blur-md p-2 rounded-2xl border border-white/60 shadow-sm">
          <button
            onClick={handleSimulateProgress}
            className="bg-slate-950 text-white hover:bg-[#FF5A36] text-[11px] font-bold px-4 py-2.5 rounded-xl transition-all duration-300 flex items-center gap-1.5 shadow-sm shadow-slate-950/10"
          >
            <span>⚡</span> Simulate Driver Progress
          </button>
          <button
            onClick={() => {
              setDeliveries(INITIAL_DELIVERIES);
              setSelectedId('#A8653K005');
              triggerToast('Database reset to initial mock data.');
            }}
            className="bg-white text-slate-700 hover:bg-slate-100 border border-slate-200 text-[11px] font-bold px-3 py-2.5 rounded-xl transition"
          >
            Reset Database
          </button>
        </div>
      </header>

      {/* WORKSPACE AREA: TRIPLE MOCKUP DEVICES */}
      <div className="w-full max-w-7xl flex-1 flex flex-col items-center justify-center">
        
        {/* TOAST ALERTS DI ATAS LAYAR */}
        {toastMessage && (
          <div className="fixed top-8 left-1/2 transform -translate-x-1/2 z-50 bg-slate-900 text-white text-xs font-bold px-5 py-3.5 rounded-2xl shadow-xl flex items-center gap-2 border border-slate-800 animate-bounce">
            <span className="w-2 h-2 rounded-full bg-[#FF5A36]"></span>
            <span>{toastMessage}</span>
          </div>
        )}

        {/* NAVIGATION TAB UNTUK DEVICE HP (HANYA MUNCUL DI MOBILE / LAYAR KECIL) */}
        <div className="flex lg:hidden bg-white/90 p-1.5 rounded-2xl mb-6 shadow-sm border border-slate-200 w-full max-w-md">
          {[
            { id: 'create', label: '1. Create Shipment', icon: '📝' },
            { id: 'home', label: '2. Home Hub', icon: '🏠' },
            { id: 'tracking', label: '3. Live Tracking', icon: '📍' }
          ].map(device => (
            <button
              key={device.id}
              onClick={() => setActiveDevice(device.id)}
              className={`flex-1 py-2.5 text-[10px] font-black rounded-xl transition-all ${
                activeDevice === device.id 
                  ? 'bg-slate-950 text-white shadow-md' 
                  : 'text-slate-500 hover:bg-slate-50'
              }`}
            >
              <span className="block text-sm mb-0.5">{device.icon}</span>
              {device.label.split('. ')[1]}
            </button>
          ))}
        </div>

        {/* CONTAINER UTAMA PERANGKAT (DEVICES LIST) */}
        <div className="grid grid-cols-1 md:grid-cols-1 lg:grid-cols-3 gap-8 justify-items-center w-full">

          {/* =======================================================
              DEVICE 1: CREATE SHIPMENT SCREEN
              ======================================================= */}
          <div className={`${activeDevice === 'create' ? 'flex' : 'hidden lg:flex'} flex-col items-center`}>
            <span className="hidden lg:block text-[11px] font-black text-slate-500 uppercase tracking-widest mb-3">Screen 1: Create Shipment</span>
            
            {/* DEVICE MOCKUP CASE */}
            <div className="w-[360px] h-[750px] bg-[#F4F3F2] rounded-[48px] p-3.5 shadow-[0_32px_64px_rgba(0,0,0,0.18)] border-[10px] border-white/95 relative flex flex-col justify-between overflow-hidden">
              
              {/* STATUS BAR */}
              <div className="w-full flex justify-between items-center px-6 pt-1 pb-3 text-xs font-semibold text-slate-800">
                <span>9:41</span>
                <div className="w-16 h-4 bg-slate-950 rounded-full absolute left-1/2 transform -translate-x-1/2 top-3"></div>
                <div className="flex items-center gap-1.5">
                  <span>📶</span>
                  <span>🔋</span>
                </div>
              </div>

              {/* SCREEN CONTENT AREA (SCROLLABLE) */}
              <div className="flex-1 overflow-y-auto px-4 pb-4 scrollbar-none">
                
                {/* Header Action Row */}
                <div className="flex justify-between items-center mb-6 mt-2">
                  <button onClick={() => setActiveDevice('home')} className="w-9 h-9 rounded-full bg-white border border-slate-100 flex items-center justify-center text-xs font-bold text-slate-700 shadow-sm hover:bg-slate-50 transition">
                    ‹
                  </button>
                  <h3 className="font-extrabold text-sm text-slate-900 tracking-tight">Create Shipment</h3>
                  <button className="w-9 h-9 rounded-full bg-white border border-slate-100 flex items-center justify-center text-slate-700 shadow-sm font-black">
                    •••
                  </button>
                </div>

                {/* ADDRESS BLOCK */}
                <div className="bg-white rounded-3xl p-4 shadow-sm border border-slate-100 mb-5">
                  <div className="relative pl-6 space-y-4 text-xs before:absolute before:left-2 before:top-2 before:bottom-2 before:w-[2px] before:bg-slate-100">
                    
                    {/* Pickup Field */}
                    <div className="relative">
                      <span className="absolute -left-6.5 top-0.5 w-3.5 h-3.5 rounded-full border-[3px] border-[#FF5A36] bg-white flex items-center justify-center"></span>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Pickup Address</label>
                      <input 
                        type="text" 
                        value={pickupAddress}
                        onChange={(e) => setPickupAddress(e.target.value)}
                        className="w-full text-[11px] font-bold text-slate-700 bg-slate-50/50 p-2.5 rounded-xl border border-slate-100 focus:outline-none focus:ring-1 focus:ring-[#FF5A36]"
                      />
                    </div>

                    {/* Delivery Field */}
                    <div className="relative">
                      <span className="absolute -left-6.5 top-0.5 w-3.5 h-3.5 rounded-full border-[3px] border-slate-800 bg-white flex items-center justify-center"></span>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Delivery Address</label>
                      <input 
                        type="text" 
                        value={deliveryAddress}
                        onChange={(e) => setDeliveryAddress(e.target.value)}
                        className="w-full text-[11px] font-bold text-slate-700 bg-slate-50/50 p-2.5 rounded-xl border border-slate-100 focus:outline-none focus:ring-1 focus:ring-[#FF5A36]"
                      />
                    </div>

                  </div>
                </div>

                {/* PACKAGE INFORMATION FORM */}
                <div className="mb-5">
                  <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-wider mb-2 px-1">Package Information</h4>
                  <div className="bg-white rounded-3xl p-4 shadow-sm border border-slate-100 space-y-3.5">
                    
                    {/* Weight Input */}
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Weight</label>
                      <select 
                        value={weight}
                        onChange={(e) => setWeight(e.target.value)}
                        className="w-full text-xs font-bold text-slate-700 bg-slate-50 border border-slate-100 rounded-xl p-3 focus:outline-none"
                      >
                        <option>2.0 KG</option>
                        <option>12.0 KG (Besi Beton)</option>
                        <option>40.0 KG (Semen Gresik)</option>
                        <option>1400.0 KG (Pasir Cor)</option>
                      </select>
                    </div>

                    {/* Size Input */}
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Size</label>
                      <select 
                        value={size}
                        onChange={(e) => setSize(e.target.value)}
                        className="w-full text-xs font-bold text-slate-700 bg-slate-50 border border-slate-100 rounded-xl p-3 focus:outline-none"
                      >
                        <option>Medium (30x20x20 cm)</option>
                        <option>Large (Semen Gresik)</option>
                        <option>Super Heavy (Pasir Cor)</option>
                      </select>
                    </div>

                    {/* Package Type Input */}
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Package Type</label>
                      <select 
                        value={packageType}
                        onChange={(e) => setPackageType(e.target.value)}
                        className="w-full text-xs font-bold text-slate-700 bg-slate-50 border border-slate-100 rounded-xl p-3 focus:outline-none"
                      >
                        <option>Box</option>
                        <option>Heavy Sack</option>
                        <option>Dump Truck Cargo</option>
                      </select>
                    </div>

                  </div>
                </div>

                {/* SELECT COURIER LIST */}
                <div className="mb-5">
                  <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-wider mb-2 px-1">Select Courier</h4>
                  <div className="space-y-2">
                    {[
                      { id: 'DHL Express', name: 'DHL Express', desc: 'Delivery within 6-7 Days', price: 'Rp 45.000', logo: '🇩🇭' },
                      { id: 'FedEx', name: 'FedEx Express', desc: 'Delivery within 4-5 Days', price: 'Rp 60.000', logo: '🇫🇪' },
                      { id: 'BahanBangunGo Logistik', name: 'BahanBangunGo Instant', desc: 'Kirim langsung hari ini', price: 'Rp 150.000', logo: '🚚' }
                    ].map(item => (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => setCourier(item.id)}
                        className={`w-full text-left bg-white rounded-2xl p-3.5 border flex items-center justify-between transition-all duration-300 ${
                          courier === item.id 
                            ? 'border-[#FF5A36] ring-1 ring-[#FF5A36]/40 shadow-md' 
                            : 'border-slate-100 shadow-sm hover:border-slate-300'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-xl p-2 bg-slate-50 rounded-xl border border-slate-100">{item.logo}</span>
                          <div>
                            <p className="text-xs font-black text-slate-800">{item.name}</p>
                            <p className="text-[9px] text-slate-400 font-bold mt-0.5">{item.desc}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className="text-xs font-black text-[#FF5A36]">{item.price}</span>
                          <span className={`block w-4 h-4 rounded-full border mt-1.5 ml-auto flex items-center justify-center ${
                            courier === item.id ? 'border-[#FF5A36] bg-[#FF5A36]' : 'border-slate-300'
                          }`}>
                            {courier === item.id && <span className="w-1.5 h-1.5 rounded-full bg-white"></span>}
                          </span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* SUBMIT BUTTON */}
                <button
                  onClick={handleCreateShipment}
                  className="w-full bg-slate-950 text-white hover:bg-[#FF5A36] py-3.5 rounded-2xl font-black text-xs transition duration-300 shadow-lg shadow-slate-950/10 flex items-center justify-center gap-2 mt-4"
                >
                  Create Shipment 🚀
                </button>

              </div>

              {/* HOME INDICATOR */}
              <div className="w-32 h-1 bg-slate-300 rounded-full mx-auto mt-2 mb-1"></div>

            </div>
          </div>

          {/* =======================================================
              DEVICE 2: HOME DASHBOARD HUB
              ======================================================= */}
          <div className={`${activeDevice === 'home' ? 'flex' : 'hidden lg:flex'} flex-col items-center`}>
            <span className="hidden lg:block text-[11px] font-black text-slate-500 uppercase tracking-widest mb-3">Screen 2: Home Dashboard</span>
            
            {/* DEVICE MOCKUP CASE */}
            <div className="w-[360px] h-[750px] bg-[#F4F3F2] rounded-[48px] p-3.5 shadow-[0_32px_64px_rgba(0,0,0,0.18)] border-[10px] border-white/95 relative flex flex-col justify-between overflow-hidden">
              
              {/* STATUS BAR */}
              <div className="w-full flex justify-between items-center px-6 pt-1 text-xs font-semibold text-slate-800">
                <span>9:41</span>
                <div className="w-16 h-4 bg-slate-950 rounded-full absolute left-1/2 transform -translate-x-1/2 top-3"></div>
                <div className="flex items-center gap-1.5">
                  <span>📶</span>
                  <span>🔋</span>
                </div>
              </div>

              {/* SCREEN CONTENT AREA (SCROLLABLE) */}
              <div className="flex-1 overflow-y-auto px-4 pb-4 scrollbar-none">
                
                {/* PROFILE HEADER CARD (MIMIC PIC 2) */}
                <div className="flex justify-between items-center mb-5 mt-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-slate-200 border border-slate-300/60 overflow-hidden flex items-center justify-center font-bold text-xs text-slate-800">
                      👤
                    </div>
                    <div>
                      <h4 className="font-black text-slate-900 text-xs leading-none">D. Stwaret</h4>
                      <p className="text-[9px] text-slate-400 font-bold mt-1.5">📍 4291 Ashford Drive</p>
                    </div>
                  </div>
                  <button className="w-9 h-9 rounded-full bg-white border border-slate-100 flex items-center justify-center text-slate-600 shadow-sm relative">
                    <span className="text-sm">🔔</span>
                    <span className="absolute top-2 right-2 w-1.5 h-1.5 rounded-full bg-[#FF5A36]"></span>
                  </button>
                </div>

                {/* SEARCH BAR (MIMIC PIC 2) */}
                <div className="bg-white rounded-2xl p-2 shadow-sm border border-slate-100 flex items-center justify-between gap-2 mb-5">
                  <div className="flex items-center gap-2.5 flex-1 px-2">
                    <span className="text-slate-400 text-sm">🔍</span>
                    <input 
                      type="text" 
                      placeholder="Search or scan your shipment..." 
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="text-xs bg-transparent border-0 w-full focus:outline-none font-bold text-slate-800 placeholder:text-slate-400"
                    />
                  </div>
                  <button className="w-8 h-8 rounded-xl bg-slate-50 flex items-center justify-center text-xs text-slate-500 border border-slate-100 font-bold">
                    [||]
                  </button>
                </div>

                {/* QUICK ACTIONS BUTTONS (MIMIC PIC 2) */}
                <div className="grid grid-cols-4 gap-2.5 mb-5">
                  {[
                    { label: 'Create', icon: '📦', action: () => setActiveDevice('create') },
                    { label: 'Calculate', icon: '🧮', action: () => triggerToast("Directing to cargo rate calculator...") },
                    { label: 'Receipts', icon: '📝', action: () => triggerToast("Loading invoice list...") },
                    { label: 'Live Track', icon: '🛣️', action: () => setActiveDevice('tracking') }
                  ].map((act, i) => (
                    <button 
                      key={i} 
                      onClick={act.action}
                      className="bg-white hover:bg-slate-50 border border-slate-100 rounded-2xl p-3.5 flex flex-col items-center justify-center text-center transition shadow-sm"
                    >
                      <span className="text-xl mb-1.5">{act.icon}</span>
                      <span className="text-[9px] font-black text-slate-500 tracking-tight">{act.label}</span>
                    </button>
                  ))}
                </div>

                {/* MINI ISOMETRIC MAP HIGHLIGHT (MIMIC PIC 2 CENTER) */}
                <div className="bg-white rounded-3xl p-3.5 shadow-sm border border-slate-100 mb-5 overflow-hidden">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <span className="text-[9px] font-black bg-rose-500/10 text-rose-500 px-2 py-0.5 rounded-md">Live Status</span>
                      <h4 className="font-extrabold text-[11px] text-slate-800 mt-1">Current Delivery: {activeOrder.id}</h4>
                    </div>
                    <span className="text-[10px] font-black text-[#FF5A36] bg-[#FF5A36]/10 px-2.5 py-0.5 rounded-full">{activeOrder.status}</span>
                  </div>

                  {/* MINI ISOMETRIC CITY SVG RENDER */}
                  <div className="w-full h-24 bg-slate-100 rounded-2xl relative overflow-hidden border border-slate-150">
                    <svg className="absolute inset-0 w-full h-full" viewBox="0 0 300 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M0 25L300 75M0 50L300 100M0 75L300 125" stroke="#CBD5E1" strokeWidth="0.8" />
                      <path d="M0 75L300 25M0 100L300 50M0 125L300 75" stroke="#CBD5E1" strokeWidth="0.8" />
                      
                      {/* Stylized Flat Grid Buildings */}
                      <rect x="20" y="30" width="15" height="20" rx="2" fill="#E2E8F0" />
                      <rect x="250" y="20" width="18" height="15" rx="2" fill="#E2E8F0" />
                      
                      {/* Rute Orange */}
                      <path d="M50 60 L 140 70 L 140 40 L 220 50" stroke="#FF5A36" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />
                      
                      {/* Orange Highlighted Building (Gedung Utama Terang di Tengah) */}
                      <g transform="translate(130, 25)">
                        <polygon points="10,0 20,5 10,10 0,5" fill="#FFA18D" />
                        <polygon points="0,5 10,10 10,25 0,20" fill="#E04F30" />
                        <polygon points="10,10 20,5 20,20 10,25" fill="#FF5A36" />
                        <circle cx="10" cy="5" r="2.5" fill="#FFFFFF" className="animate-ping" />
                      </g>
                    </svg>
                    <button 
                      onClick={() => setActiveDevice('tracking')}
                      className="absolute bottom-2 right-2 w-7 h-7 rounded-lg bg-slate-950 text-white flex items-center justify-center text-xs shadow hover:bg-[#FF5A36] transition"
                    >
                      ↗
                    </button>
                  </div>
                </div>

                {/* DELIVERY HISTORY LIST */}
                <div className="mb-2">
                  <div className="flex justify-between items-center mb-3">
                    <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-wider px-1">Delivery History</h4>
                    <button onClick={() => triggerToast("Opening full list of history...")} className="text-[10px] font-bold text-slate-400 hover:text-slate-800 transition">See all</button>
                  </div>

                  {/* CARDS LIST */}
                  <div className="space-y-2.5">
                    {filteredDeliveries.length === 0 ? (
                      <p className="text-[11px] text-slate-400 text-center py-4 italic">No shipments match your search.</p>
                    ) : (
                      filteredDeliveries.map(item => (
                        <button
                          key={item.id}
                          onClick={() => {
                            setSelectedId(item.id);
                            triggerToast(`Selected ${item.id} for tracking.`);
                          }}
                          className={`w-full text-left bg-white rounded-2xl p-3.5 border flex items-center justify-between transition-all ${
                            selectedId === item.id 
                              ? 'border-[#FF5A36] ring-1 ring-[#FF5A36]/20' 
                              : 'border-slate-100 hover:border-slate-300'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <span className="text-xl p-2 bg-[#F4F3F2] rounded-xl">📦</span>
                            <div>
                              <p className="text-xs font-black text-slate-800">{item.id}</p>
                              <p className="text-[9px] text-slate-400 font-bold mt-1">Transit on {item.date}</p>
                            </div>
                          </div>
                          
                          <span className={`text-[9px] font-black px-2.5 py-1 rounded-md ${
                            item.status === 'Delivered' 
                              ? 'bg-emerald-50 text-emerald-600' 
                              : 'bg-orange-50 text-[#FF5A36]'
                          }`}>
                            {item.status}
                          </span>
                        </button>
                      ))
                    )}
                  </div>
                </div>

              </div>

              {/* BOTTOM INTERACTIVE NAVIGATION BAR (MIMIC PIC 2 FOOTER) */}
              <div className="bg-white rounded-3xl p-2 border border-slate-100 shadow-sm flex justify-around items-center mb-2">
                {[
                  { label: 'Home', icon: '🏠', active: activeDevice === 'home', action: () => setActiveDevice('home') },
                  { label: 'Package', icon: '📦', active: activeDevice === 'create', action: () => setActiveDevice('create') },
                  { label: 'Chat', icon: '💬', active: false, action: () => triggerToast("Loading live chat help...") },
                  { label: 'Profile', icon: '👤', active: false, action: () => triggerToast("Redirecting to profile card...") }
                ].map((tab, i) => (
                  <button
                    key={i}
                    onClick={tab.action}
                    className={`flex flex-col items-center justify-center flex-1 py-1 transition-all ${
                      tab.active ? 'text-[#FF5A36]' : 'text-slate-400 hover:text-slate-800'
                    }`}
                  >
                    <span className="text-lg">{tab.icon}</span>
                    <span className="text-[8px] font-bold mt-0.5">{tab.label}</span>
                  </button>
                ))}
              </div>

              {/* HOME INDICATOR */}
              <div className="w-32 h-1 bg-slate-300 rounded-full mx-auto mt-1 mb-1"></div>

            </div>
          </div>

          {/* =======================================================
              DEVICE 3: DELIVERY TRACKING PREVIEW
              ======================================================= */}
          <div className={`${activeDevice === 'tracking' ? 'flex' : 'hidden lg:flex'} flex-col items-center`}>
            <span className="hidden lg:block text-[11px] font-black text-slate-500 uppercase tracking-widest mb-3">Screen 3: Delivery Tracking</span>
            
            {/* DEVICE MOCKUP CASE */}
            <div className="w-[360px] h-[750px] bg-[#F4F3F2] rounded-[48px] p-3.5 shadow-[0_32px_64px_rgba(0,0,0,0.18)] border-[10px] border-white/95 relative flex flex-col justify-between overflow-hidden">
              
              {/* STATUS BAR */}
              <div className="w-full flex justify-between items-center px-6 pt-1 text-xs font-semibold text-slate-800 z-10">
                <span>9:41</span>
                <div className="w-16 h-4 bg-slate-950 rounded-full absolute left-1/2 transform -translate-x-1/2 top-3"></div>
                <div className="flex items-center gap-1.5">
                  <span>📶</span>
                  <span>🔋</span>
                </div>
              </div>

              {/* MAIN CONTENT WORKSPACE (INTEGRATED MAP + BOTTOM CARD OVERLAY) */}
              <div className="flex-1 flex flex-col relative -mt-5">
                
                {/* BACK BUTTON AND MAP HEADER ACTIONS OVERLAY */}
                <div className="absolute top-8 left-4 right-4 z-10 flex justify-between items-center">
                  <button onClick={() => setActiveDevice('home')} className="w-9 h-9 rounded-full bg-white border border-slate-200/60 flex items-center justify-center text-xs font-bold text-slate-700 shadow-sm hover:bg-slate-50 transition">
                    ‹
                  </button>
                  <h3 className="font-extrabold text-sm text-slate-900 tracking-tight bg-white/70 backdrop-blur-md px-4 py-1.5 rounded-full shadow-sm border border-white/40">Delivery Tracking</h3>
                  <button className="w-9 h-9 rounded-full bg-white border border-slate-200/60 flex items-center justify-center text-slate-700 shadow-sm font-black">
                    •••
                  </button>
                </div>

                {/* INTERACTIVE FULL-WIDTH ISOMETRIC CITY MAP (MIMIC PIC 3) */}
                <div className="w-full h-80 bg-slate-200 relative overflow-hidden">
                  <svg className="absolute inset-0 w-full h-full scale-[1.1]" viewBox="0 0 360 320" fill="none" xmlns="http://www.w3.org/2000/svg">
                    {/* Grid-lines isometris kota */}
                    <path d="M0 50L360 200M0 100L360 250M0 150L360 300M0 200L360 350" stroke="#CBD5E1" strokeWidth="0.8" />
                    <path d="M0 200L360 50M0 250L360 100M0 300L360 150M0 350L360 200" stroke="#CBD5E1" strokeWidth="0.8" />
                    
                    {/* Grayscale Buildings (Simulasi gedung 3D di peta) */}
                    <rect x="40" y="80" width="30" height="40" rx="3" fill="#E2E8F0" />
                    <rect x="280" y="90" width="25" height="35" rx="3" fill="#E2E8F0" />
                    <rect x="310" y="160" width="20" height="30" rx="3" fill="#D1D5DB" />
                    <rect x="50" y="220" width="25" height="25" rx="3" fill="#E2E8F0" />
                    
                    {/* RUTE UTAMA ORANYE (DARI ASAL KE TUJUAN) */}
                    <path d="M70 180 L 160 220 L 160 140 L 250 170" stroke="#FF5A36" strokeWidth="5.5" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M70 180 L 160 220 L 160 140 L 250 170" stroke="#FFFFFF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />

                    {/* Gedung Oranye Glowing Terang (Tujuan Paket - Target Destinasi) */}
                    <g transform="translate(235, 125)">
                      <polygon points="15,0 30,7 15,14 0,7" fill="#FFA18D" />
                      <polygon points="0,7 15,14 15,35 0,28" fill="#E04F30" />
                      <polygon points="15,14 30,7 30,28 15,35" fill="#FF5A36" />
                      {/* Anchor pin */}
                      <circle cx="15" cy="7" r="4" fill="#FFFFFF" className="animate-pulse" />
                    </g>

                    {/* Pin Rumah/Home kecil di atas gedung target */}
                    <g transform="translate(242, 100)">
                      <rect width="16" height="16" rx="8" fill="#111827" />
                      <text x="8" y="12" fill="white" fontSize="9" textAnchor="middle" fontWeight="bold">🏠</text>
                    </g>

                    {/* Mobil Box Kurir Logistik Bergerak */}
                    <g transform="translate(145, 160)" className="animate-bounce">
                      <circle cx="15" cy="15" r="16" fill="white" filter="drop-shadow(0px 4px 6px rgba(0,0,0,0.15))" />
                      <text x="8" y="20" fontSize="13">🚚</text>
                    </g>
                  </svg>
                </div>

                {/* OVERLAY CARD DETAIL TRACKING (MIMIC PIC 3 BOTTOM CARDS) */}
                <div className="bg-white rounded-t-[40px] shadow-[0_-20px_40px_rgba(0,0,0,0.08)] border-t border-slate-100 flex-1 px-5 pt-5 pb-2 flex flex-col justify-between -mt-10 z-20">
                  
                  {/* Pull-up bar indicator */}
                  <div className="w-12 h-1 bg-slate-200 rounded-full mx-auto mb-4"></div>

                  {/* Active Order ID header block */}
                  <div className="text-center">
                    <span className="inline-flex items-center gap-1.5 text-[10px] font-black bg-[#FF5A36]/10 text-[#FF5A36] px-3 py-1.5 rounded-full mb-1">
                      <span>🚚</span> {activeOrder.status}
                    </span>
                    <h2 className="text-xl font-black text-slate-900 tracking-tight">{activeOrder.id}</h2>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">Transit on {activeOrder.date}</p>
                  </div>

                  {/* HIGH FIDELITY VERTICAL TIMELINE LOGISTICS STEPPER */}
                  <div className="my-4 overflow-y-auto max-h-[190px] pr-1 scrollbar-none">
                    <div className="relative pl-7 border-l-2 border-slate-100 space-y-4 ml-3">
                      
                      {activeOrder.timeline.map((step, idx) => (
                        <div key={idx} className="relative">
                          
                          {/* Circle indicators */}
                          <span className={`absolute -left-9.5 top-0.5 w-5 h-5 rounded-full border-[3px] flex items-center justify-center transition-all ${
                            step.completed 
                              ? 'border-slate-900 bg-slate-900' 
                              : 'border-slate-200 bg-white'
                          }`}>
                            {step.completed && (
                              <svg className="w-2.5 h-2.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="4" d="M5 13l4 4L19 7"></path>
                              </svg>
                            )}
                          </span>

                          <div className="flex justify-between items-start text-xs">
                            <div>
                              <p className={`font-black ${step.completed ? 'text-slate-900' : 'text-slate-400'}`}>
                                {step.label}
                              </p>
                              <p className="text-[9px] text-slate-400 font-medium mt-0.5">{step.time}</p>
                            </div>
                            <span className="text-[9px] text-slate-400 font-semibold">{step.location}</span>
                          </div>
                        </div>
                      ))}

                    </div>
                  </div>

                  {/* ACTION ROW FOOTER BUTTONS (MIMIC PIC 3 FOOTER) */}
                  <div className="flex gap-2 items-center mb-1">
                    <button 
                      onClick={() => triggerToast("Directing support agent call...")}
                      className="flex-1 bg-slate-950 text-white hover:bg-[#FF5A36] py-3 rounded-full font-black text-[11px] transition duration-300 shadow-md shadow-slate-950/10"
                    >
                      Contract Support
                    </button>
                    <button onClick={() => triggerToast("Starting live chat room...")} className="w-11 h-11 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-sm shadow-sm hover:bg-slate-200 transition">
                      💬
                    </button>
                    <button onClick={() => triggerToast("Opening direct driver call...")} className="w-11 h-11 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-sm shadow-sm hover:bg-slate-200 transition">
                      📞
                    </button>
                  </div>

                </div>

              </div>

              {/* HOME INDICATOR */}
              <div className="w-32 h-1 bg-slate-300 rounded-full mx-auto mt-1 mb-1"></div>

            </div>
          </div>

        </div>

      </div>

      {/* FOOTER */}
      <footer className="w-full max-w-7xl text-center text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-12 mb-2">
        <p>© 2026 BahanBangunGo Ltd. All rights reserved.</p>
        <p className="text-[#FF5A36] mt-1 normal-case font-medium">Rendered with extreme performance and premium precision.</p>
      </footer>

    </div>
  );
}