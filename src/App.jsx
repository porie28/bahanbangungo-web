import React, { useState, useEffect, useRef } from 'react';

// ==========================================
// MOCK DATA PREMIUM (SIMULASI DATABASE)
// ==========================================
const INITIAL_PRODUCTS = [
  { id: 'p1', name: 'Semen Padang 50kg', category: 'Semen', price: 72000, stock: 150, unit: 'Sak', weight: 50, volume: 0.035, image: '🧱', description: 'Semen Portland tipe I berkualitas tinggi untuk konstruksi kokoh.' },
  { id: 'p2', name: 'Pasir Cor Merapi', category: 'Pasir', price: 320000, stock: 25, unit: 'm³', weight: 1400, volume: 1.0, image: '⏳', description: 'Pasir alami vulkanik bergradasi tajam untuk kekuatan beton maksimal.' },
  { id: 'p3', name: 'Besi Beton 10mm SNI', category: 'Besi', price: 89000, stock: 300, unit: 'Batang', weight: 12, volume: 0.005, image: '⛓️', description: 'Besi beton ulir standar SNI kekuatan tinggi anti karat.' },
  { id: 'p4', name: 'Cat Tembok Dulux Putih 20L', category: 'Cat', price: 650000, stock: 40, unit: 'Pail', weight: 25, volume: 0.02, image: '🎨', description: 'Cat dinding interior premium daya sebar luas dan mudah dibersihkan.' },
  { id: 'p5', name: 'Semen Gresik 40kg', category: 'Semen', price: 58000, stock: 80, unit: 'Sak', weight: 40, volume: 0.028, image: '🧱', description: 'Semen serbaguna ekonomis untuk plesteran dan pasangan bata.' },
];

const INITIAL_MERCHANTS = [
  { id: 'm1', name: 'TB. Maju Jaya Sentosa', lat: -6.210, lng: 106.820, stock: { p1: 100, p2: 10, p3: 200, p4: 15, p5: 50 }, rating: 4.8 },
  { id: 'm2', name: 'Depo Bangunan Sejahtera', lat: -6.225, lng: 106.840, stock: { p1: 50, p2: 15, p3: 50, p4: 25, p5: 10 }, rating: 4.6 },
  { id: 'm3', name: 'TB. Sumber Alam Murah', lat: -6.195, lng: 106.800, stock: { p1: 10, p2: 2, p3: 150, p4: 5, p5: 80 }, rating: 4.2 },
];

const VEHICLE_TYPES = [
  { id: 'motor', name: 'Sepeda Motor', maxWeight: 50, baseFare: 10000, perKm: 2500, icon: '🏍️' },
  { id: 'pickup', name: 'Mobil Pick-Up', maxWeight: 1500, baseFare: 75000, perKm: 5000, icon: '🛻' },
  { id: 'engkel', name: 'Truk Engkel CDE', maxWeight: 3000, baseFare: 150000, perKm: 8000, icon: '🚚' },
  { id: 'double', name: 'Truk Double CDD', maxWeight: 7000, baseFare: 250000, perKm: 12000, icon: '🚛' },
];

export default function App() {
  // --- STATE UTAMA (MENYATUKAN SEMUA AKTOR) ---
  const [role, setRole] = useState('customer'); // customer | admin | merchant | driver
  const [products, setProducts] = useState(INITIAL_PRODUCTS);
  const [merchants, setMerchants] = useState(INITIAL_MERCHANTS);
  const [orders, setOrders] = useState([]);
  const [activeTab, setActiveTab] = useState('browse'); // browse | cart | orders | map

  // --- STATE KONSUMEN ---
  const [cart, setCart] = useState([]);
  const [customerLat, setCustomerLat] = useState(-6.214);
  const [customerLng, setCustomerLng] = useState(106.825);
  const [shippingAddress, setShippingAddress] = useState('Jl. Jenderal Sudirman No. 21, Jakarta Selatan');
  const [addressDetails, setAddressDetails] = useState('');
  const [selectedAddons, setSelectedAddons] = useState({
    helper: false, // Jasa Bongkar
    tol: false,    // Biaya Tol
    terpal: false  // Terpal pelindung hujan
  });
  const [helperCount, setHelperCount] = useState(1);
  const [deliveryDate, setDeliveryDate] = useState('');
  const [deliveryTime, setDeliveryTime] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('transfer');

  // --- STATE CHAT ---
  const [chats, setChats] = useState([
    { sender: 'admin', receiver: 'customer', text: 'Halo! Ada yang bisa kami bantu mengenai pengiriman pasir Anda?', timestamp: '10:30' },
    { sender: 'customer', text: 'Apakah truk double bisa masuk ke gang rumah saya lebar 3 meter?', timestamp: '10:32' }
  ]);
  const [newMsg, setNewMsg] = useState('');

  // --- SIGNATURE & POD DRIVER ---
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [signatureSaved, setSignatureSaved] = useState(false);
  const [podPhoto, setPodPhoto] = useState(null);

  // ==========================================
  // KALKULASI PARSING & ATURAN LOGISTIK
  // ==========================================
  const cartTotalWeight = cart.reduce((acc, item) => acc + (item.weight * item.quantity), 0);
  const cartTotalVolume = cart.reduce((acc, item) => acc + (item.volume * item.quantity), 0);
  const cartTotalPrice = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);

  // Rekomendasi kendaraan minimum berdasarkan berat barang
  const recommendedVehicle = VEHICLE_TYPES.find(v => cartTotalWeight <= v.maxWeight) || VEHICLE_TYPES[3];

  // Hitung Jarak Terdekat Menggunakan Formula Haversine Sederhana
  const getDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // Radius bumi dalam KM
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return parseFloat((R * c).toFixed(2));
  };

  // Mencari Toko Terdekat & Memiliki Stok Cukup (Proximity Match)
  const getProximityRecommendations = () => {
    return merchants.map(m => {
      let distance = getDistance(customerLat, customerLng, m.lat, m.lng);
      
      // Hitung persentase kecocokan stok barang di keranjang
      let matchingItemsCount = 0;
      cart.forEach(item => {
        const availableStock = m.stock[item.id] || 0;
        if (availableStock >= item.quantity) {
          matchingItemsCount++;
        }
      });
      const stockMatchPercent = cart.length > 0 ? Math.round((matchingItemsCount / cart.length) * 100) : 100;

      return {
        ...m,
        distance,
        stockMatchPercent,
        deliveryCost: Math.round(recommendedVehicle.baseFare + (distance * recommendedVehicle.perKm))
      };
    }).sort((a, b) => b.stockMatchPercent - a.stockMatchPercent || a.distance - b.distance);
  };

  // Total Biaya Pengiriman & Tambahan
  const selectedMerchantRecommendation = getProximityRecommendations()[0] || null;
  const rawDeliveryCost = selectedMerchantRecommendation ? selectedMerchantRecommendation.deliveryCost : 0;
  
  const addonCost = 
    (selectedAddons.helper ? helperCount * 50000 : 0) +
    (selectedAddons.tol ? 30000 : 0) +
    (selectedAddons.terpal ? 25000 : 0);

  const grandTotal = cartTotalPrice + rawDeliveryCost + addonCost;

  // ==========================================
  // HANDLERS & SIMULASI ALUR KONSUMEN
  // ==========================================
  const addToCart = (product) => {
    const existing = cart.find(item => item.id === product.id);
    if (existing) {
      if (existing.quantity < product.stock) {
        setCart(cart.map(item => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item));
      }
    } else {
      setCart([...cart, { ...product, quantity: 1 }]);
    }
  };

  const removeFromCart = (id) => {
    setCart(cart.filter(item => item.id !== id));
  };

  const updateCartQty = (id, newQty) => {
    const prod = products.find(p => p.id === id);
    if (newQty <= 0) {
      removeFromCart(id);
    } else if (newQty <= prod.stock) {
      setCart(cart.map(item => item.id === id ? { ...item, quantity: newQty } : item));
    }
  };

  const handleCheckout = () => {
    if (cart.length === 0) return;
    
    const recommendations = getProximityRecommendations();
    const primaryMerchant = recommendations[0];

    // Cek apakah perlu Split Order
    const isSplitNeeded = primaryMerchant.stockMatchPercent < 100;

    const newOrder = {
      id: 'BBG-' + Math.floor(100000 + Math.random() * 900000),
      date: new Date().toLocaleDateString('id-ID'),
      scheduledFor: deliveryDate ? `${deliveryDate} Pukul ${deliveryTime || '09:00'}` : 'Segera Kirim (Instant)',
      items: [...cart],
      totalWeight: cartTotalWeight,
      totalVolume: cartTotalVolume,
      subtotal: cartTotalPrice,
      deliveryCost: rawDeliveryCost,
      addonCost,
      grandTotal,
      address: shippingAddress,
      addressDetails,
      paymentMethod,
      merchant: primaryMerchant,
      isSplitNeeded,
      status: 'Menunggu Konfirmasi Admin', // Menunggu Konfirmasi Admin -> Disiapkan Toko -> Dalam Perjalanan -> Selesai
      driverName: null,
      proofOfDelivery: null,
      signature: null,
    };

    setOrders([newOrder, ...orders]);
    setCart([]);
    setActiveTab('orders');
    setRole('admin'); // Auto Switch ke Admin untuk kemudahan demo loop!
  };

  const handleDispatchOrder = (orderId, targetMerchantId) => {
    const selectedMerchant = merchants.find(m => m.id === targetMerchantId);
    setOrders(orders.map(order => {
      if (order.id === orderId) {
        return {
          ...order,
          merchant: selectedMerchant,
          status: 'Disiapkan oleh Toko',
          driverName: 'Pak Budi (Armada ' + recommendedVehicle.name + ')'
        };
      }
      return order;
    }));
  };

  const handleMerchantReady = (orderId) => {
    setOrders(orders.map(order => {
      if (order.id === orderId) {
        return { ...order, status: 'Dalam Perjalanan' };
      }
      return order;
    }));
  };

  // ==========================================
  // HANDLERS DRIVER (PROOF OF DELIVERY)
  // ==========================================
  const startDrawing = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    ctx.strokeStyle = '#000000';
    
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX || e.touches[0].clientX) - rect.left;
    const y = (e.clientY || e.touches[0].clientY) - rect.top;
    
    ctx.beginPath();
    ctx.moveTo(x, y);
    setIsDrawing(true);
  };

  const draw = (e) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX || e.touches[0].clientX) - rect.left;
    const y = (e.clientY || e.touches[0].clientY) - rect.top;
    
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearSignature = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      setSignatureSaved(false);
    }
  };

  const saveSignature = () => {
    setSignatureSaved(true);
  };

  const handleCompleteDelivery = (orderId) => {
    setOrders(orders.map(order => {
      if (order.id === orderId) {
        return {
          ...order,
          status: 'Selesai',
          proofOfDelivery: podPhoto || 'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?auto=format&fit=crop&w=600&q=80',
          signature: signatureSaved ? 'SIGNED_VALID' : 'UNSIGNED'
        };
      }
      return order;
    }));
    setPodPhoto(null);
    setSignatureSaved(false);
  };

  const simulatePodPhotoUpload = () => {
    setPodPhoto('https://images.unsplash.com/photo-1590069261209-f8e9b8642343?auto=format&fit=crop&w=600&q=80');
  };

  const handleSendChat = () => {
    if (!newMsg.trim()) return;
    const timeNow = new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
    setChats([...chats, { sender: role, text: newMsg, timestamp: timeNow }]);
    setNewMsg('');

    setTimeout(() => {
      setChats(prev => [...prev, {
        sender: 'admin',
        text: 'Baik Kak, pesan Anda telah diterima oleh Tim CS. Kami sedang mengonfirmasi rincian pesanan logistik Anda.',
        timestamp: timeNow
      }]);
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-[#F2F2F5] text-slate-800 font-sans flex flex-col antialiased">
      
      {/* HEADER TOP-BAR */}
      <header className="bg-white border-b border-slate-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-3 flex flex-wrap justify-between items-center gap-4">
          <div className="flex items-center gap-3">
            <span className="text-3xl bg-[#FF5A36]/10 p-2 rounded-2xl">🏗️</span>
            <div>
              <h1 className="font-extrabold text-2xl tracking-tight bg-gradient-to-r from-[#FF5A36] to-orange-400 bg-clip-text text-transparent">
                BahanBangunGo
              </h1>
              <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-widest">Smart Logistics Market</p>
            </div>
          </div>

          {/* SIMULATOR SWITCHER ROLE (PILLED STYLE) */}
          <div className="bg-slate-100 p-1 rounded-2xl flex items-center gap-1 shadow-inner border border-slate-200">
            {[
              { id: 'customer', label: 'Konsumen', icon: '👤' },
              { id: 'admin', label: 'Admin Hub', icon: '🛡️' },
              { id: 'merchant', label: 'Toko/Mitra', icon: '🏪' },
              { id: 'driver', label: 'Kurir/Driver', icon: '🚛' }
            ].map(r => (
              <button
                key={r.id}
                onClick={() => { setRole(r.id); setActiveTab(r.id === 'customer' ? 'browse' : 'orders'); }}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all duration-200 ${
                  role === r.id 
                    ? 'bg-white text-[#FF5A36] shadow-sm transform scale-102 border border-slate-200/50' 
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                <span>{r.icon}</span>
                <span className="hidden sm:inline">{r.label}</span>
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* BODY UTAMA BERDASARKAN PERSONA */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* SISI KIRI: KONTEN UTAMA SESUAI PERAN */}
        <div className="lg:col-span-8 flex flex-col gap-5">
          
          {/* =======================================================
              1. KONSUMEN / CUSTOMER VIEW
              ======================================================= */}
          {role === 'customer' && (
            <>
              {/* Navigasi Customer (Elegant Card Style) */}
              <div className="bg-white p-2 rounded-2xl flex gap-1.5 border border-slate-200/60 shadow-sm">
                <button 
                  onClick={() => setActiveTab('browse')}
                  className={`flex-1 py-2.5 text-xs font-bold rounded-xl transition-all ${activeTab === 'browse' ? 'bg-[#FF5A36] text-white shadow-md shadow-[#FF5A36]/20' : 'text-slate-600 hover:bg-slate-50'}`}
                >
                  🛍️ Jelajah Material
                </button>
                <button 
                  onClick={() => setActiveTab('cart')}
                  className={`flex-1 py-2.5 text-xs font-bold rounded-xl relative transition-all ${activeTab === 'cart' ? 'bg-[#FF5A36] text-white shadow-md shadow-[#FF5A36]/20' : 'text-slate-600 hover:bg-slate-50'}`}
                >
                  🛒 Keranjang Belanja
                  {cart.length > 0 && (
                    <span className="absolute top-1.5 right-2 bg-rose-500 text-white text-[9px] w-4.5 h-4.5 rounded-full flex items-center justify-center font-bold">
                      {cart.reduce((sum, i) => sum + i.quantity, 0)}
                    </span>
                  )}
                </button>
                <button 
                  onClick={() => setActiveTab('orders')}
                  className={`flex-1 py-2.5 text-xs font-bold rounded-xl transition-all ${activeTab === 'orders' ? 'bg-[#FF5A36] text-white shadow-md shadow-[#FF5A36]/20' : 'text-slate-600 hover:bg-slate-50'}`}
                >
                  📦 Lacak Pesanan
                </button>
              </div>

              {/* VIEW: BROWSE CATALOG (PREMIUM NEUMORPHIC STYLE) */}
              {activeTab === 'browse' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  {products.map(prod => (
                    <div key={prod.id} className="bg-white rounded-[28px] p-5 flex flex-col justify-between shadow-[0_8px_30px_rgb(0,0,0,0.02)] border border-slate-100 hover:shadow-[0_8px_30px_rgb(0,0,0,0.06)] transition duration-300">
                      <div>
                        <div className="flex gap-4 items-start">
                          <span className="text-4xl p-4 bg-slate-50 rounded-2xl flex items-center justify-center border border-slate-100">{prod.image}</span>
                          <div className="flex-1">
                            <h3 className="font-bold text-slate-800 text-lg leading-tight">{prod.name}</h3>
                            <span className="inline-block bg-[#FF5A36]/10 text-[#FF5A36] text-[10px] px-2.5 py-1 rounded-lg font-bold mt-2">
                              {prod.category}
                            </span>
                          </div>
                        </div>
                        <p className="text-xs text-slate-400 mt-3.5 leading-relaxed">{prod.description}</p>
                        
                        <div className="grid grid-cols-2 gap-3 mt-4 text-[11px] text-slate-500 bg-slate-50 p-3 rounded-2xl">
                          <p>⚖️ Berat: <span className="font-bold text-slate-700">{prod.weight} Kg/{prod.unit}</span></p>
                          <p>📐 Volume: <span className="font-bold text-slate-700">{prod.volume} m³</span></p>
                        </div>
                      </div>
                      
                      <div className="border-t border-slate-100 mt-5 pt-4 flex justify-between items-center">
                        <div>
                          <p className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Harga Satuan</p>
                          <p className="font-extrabold text-slate-900 text-lg">Rp {prod.price.toLocaleString('id-ID')}</p>
                        </div>
                        <button
                          onClick={() => addToCart(prod)}
                          className="bg-slate-900 text-white hover:bg-[#FF5A36] font-bold px-4 py-2.5 rounded-xl text-xs transition duration-300 shadow-md shadow-slate-900/10 flex items-center gap-1.5"
                        >
                          <span>+</span> Keranjang
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* VIEW: CART & CHECKOUT LOGISTICS FORM */}
              {activeTab === 'cart' && (
                <div className="flex flex-col gap-5">
                  {cart.length === 0 ? (
                    <div className="bg-white rounded-[28px] p-12 text-center border border-slate-150 shadow-sm">
                      <span className="text-6xl block mb-3 animate-bounce">🛒</span>
                      <h3 className="font-bold text-slate-700 text-lg">Keranjang Belanja Kosong</h3>
                      <p className="text-slate-400 text-xs mt-1.5 max-w-sm mx-auto">Silakan cari kebutuhan bahan bangunan Anda di halaman Jelajah.</p>
                      <button onClick={() => setActiveTab('browse')} className="mt-5 bg-[#FF5A36] text-white font-bold px-5 py-3 rounded-xl text-xs shadow-md shadow-[#FF5A36]/10">
                        Belanja Sekarang
                      </button>
                    </div>
                  ) : (
                    <>
                      {/* List Item Keranjang */}
                      <div className="bg-white rounded-[28px] shadow-sm p-5 border border-slate-100">
                        <h3 className="font-extrabold text-slate-800 text-base mb-4 flex items-center gap-2">
                          <span>📦</span> Detail Material Proyek
                        </h3>
                        <div className="divide-y divide-slate-100">
                          {cart.map(item => (
                            <div key={item.id} className="py-3.5 flex justify-between items-center gap-3">
                              <div className="flex items-center gap-3">
                                <span className="text-3xl p-3 bg-slate-50 rounded-xl border border-slate-100">{item.image}</span>
                                <div>
                                  <h4 className="font-bold text-slate-800 text-sm">{item.name}</h4>
                                  <p className="text-[11px] text-slate-400">Rp {item.price.toLocaleString('id-ID')} / {item.unit}</p>
                                </div>
                              </div>
                              <div className="flex items-center gap-4">
                                <div className="flex items-center bg-slate-50 border border-slate-100 rounded-xl p-1">
                                  <button onClick={() => updateCartQty(item.id, item.quantity - 1)} className="px-2.5 py-1 font-bold text-slate-500 hover:bg-white hover:shadow-sm rounded-lg transition">-</button>
                                  <span className="px-3.5 text-xs font-bold text-slate-800">{item.quantity}</span>
                                  <button onClick={() => updateCartQty(item.id, item.quantity + 1)} className="px-2.5 py-1 font-bold text-slate-500 hover:bg-white hover:shadow-sm rounded-lg transition">+</button>
                                </div>
                                <button onClick={() => removeFromCart(item.id)} className="text-slate-300 hover:text-rose-500 transition">🗑️</button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Kalkulator Geolocation & Titik Drop-off */}
                      <div className="bg-white rounded-[28px] shadow-sm p-5 border border-slate-100">
                        <h3 className="font-extrabold text-slate-800 text-base mb-4 flex items-center gap-2">
                          <span>📍</span> Koordinat Pengiriman Proyek
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                          <div>
                            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Alamat Lengkap</label>
                            <input 
                              type="text" 
                              value={shippingAddress} 
                              onChange={(e) => setShippingAddress(e.target.value)}
                              className="w-full text-xs font-semibold bg-slate-50 border border-slate-200 rounded-xl px-4 py-3.5 focus:outline-none focus:ring-2 focus:ring-[#FF5A36] focus:bg-white transition"
                            />
                            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 mt-4">Detail Lokasi / Patokan</label>
                            <textarea 
                              placeholder="Contoh: Depan mushola Al-Ikhlas, masuk gang sempit max pick-up"
                              value={addressDetails} 
                              onChange={(e) => setAddressDetails(e.target.value)}
                              className="w-full text-xs font-semibold bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#FF5A36] focus:bg-white transition h-20 resize-none"
                            />
                          </div>

                          {/* PETA PREMIUM ISOMETRIS/3D STYLIZED */}
                          <div className="bg-slate-50 rounded-[24px] p-4 border border-slate-200 flex flex-col justify-between">
                            <div>
                              <p className="text-xs font-bold text-slate-700 flex justify-between">
                                <span>Rute & Pemetaan Logistik</span>
                                <span className="text-[#FF5A36]">Jarak: {selectedMerchantRecommendation ? selectedMerchantRecommendation.distance : 0} KM</span>
                              </p>
                              <p className="text-[10px] text-slate-400">Peta rute logistik berbasis 3D Stylized vector.</p>
                            </div>

                            {/* ISOMETRIC STYLE MAP SIMULATION (Vector SVG) */}
                            <div className="my-3 bg-slate-200 rounded-2xl relative border border-slate-300 aspect-video overflow-hidden">
                              <svg className="absolute inset-0 w-full h-full" viewBox="0 0 400 220" fill="none" xmlns="http://www.w3.org/2000/svg">
                                {/* Grid Isometrik / Pattern */}
                                <path d="M0 50L400 150M0 100L400 200M0 150L400 250" stroke="#CBD5E1" strokeWidth="1" />
                                <path d="M0 150L400 50M0 200L400 100M0 250L400 150" stroke="#CBD5E1" strokeWidth="1" />
                                
                                {/* Bangunan Non-Aktif (Gleaming Grey) */}
                                <rect x="40" y="80" width="30" height="40" rx="4" fill="#94A3B8" opacity="0.6" />
                                <rect x="320" y="60" width="40" height="30" rx="4" fill="#94A3B8" opacity="0.6" />
                                
                                {/* Jalan Rute (Garis Oranye Tebal) */}
                                <path d="M80 120 L 160 160 L 260 100 L 320 140" stroke="#FF5A36" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
                                <path d="M80 120 L 160 160 L 260 100 L 320 140" stroke="#FFA18D" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />

                                {/* Bangunan Toko (Start - Blue Pin) */}
                                <g transform="translate(60, 90)">
                                  <rect width="40" height="30" rx="6" fill="#0284C7" />
                                  <text x="20" y="18" fill="white" fontSize="10" fontWeight="bold" textAnchor="middle">🏪</text>
                                </g>

                                {/* Bangunan Proyek (Tujuan - Orange Highlighted) */}
                                <g transform="translate(300, 110)">
                                  {/* Shadow Glow */}
                                  <rect width="46" height="36" rx="8" fill="#FF5A36" className="animate-pulse" opacity="0.4" x="-3" y="-3" />
                                  <rect width="40" height="30" rx="6" fill="#FF5A36" />
                                  <text x="20" y="18" fill="white" fontSize="10" fontWeight="bold" textAnchor="middle">🏗️</text>
                                </g>

                                {/* Icon Driver Bergerak */}
                                <g transform="translate(200, 120)">
                                  <circle cx="10" cy="10" r="14" fill="white" filter="drop-shadow(0px 2px 4px rgba(0,0,0,0.1))" />
                                  <text x="4" y="14" fontSize="11">🚛</text>
                                </g>
                              </svg>
                            </div>

                            <div className="flex gap-2 justify-end">
                              <button onClick={() => { setCustomerLat(-6.205); setCustomerLng(106.815); }} className="text-[10px] bg-slate-200 hover:bg-slate-300 font-bold px-3 py-1.5 rounded-lg transition text-slate-600">📍 Set Utara</button>
                              <button onClick={() => { setCustomerLat(-6.230); setCustomerLng(106.850); }} className="text-[10px] bg-slate-200 hover:bg-slate-300 font-bold px-3 py-1.5 rounded-lg transition text-slate-600">📍 Set Selatan</button>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Penjadwalan & Pembayaran */}
                      <div className="bg-white rounded-[28px] shadow-sm p-5 border border-slate-100 grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <h3 className="font-extrabold text-slate-800 text-sm mb-3.5 flex items-center gap-2">
                            <span>📅</span> Penjadwalan Proyek (Opsional)
                          </h3>
                          <div className="grid grid-cols-2 gap-3">
                            <input 
                              type="date" 
                              value={deliveryDate}
                              onChange={(e) => setDeliveryDate(e.target.value)}
                              className="text-xs font-semibold bg-slate-50 border border-slate-200 rounded-xl p-3 focus:outline-none focus:ring-1 focus:ring-[#FF5A36]"
                            />
                            <input 
                              type="time" 
                              value={deliveryTime}
                              onChange={(e) => setDeliveryTime(e.target.value)}
                              className="text-xs font-semibold bg-slate-50 border border-slate-200 rounded-xl p-3 focus:outline-none focus:ring-1 focus:ring-[#FF5A36]"
                            />
                          </div>
                        </div>

                        <div>
                          <h3 className="font-extrabold text-slate-800 text-sm mb-3.5 flex items-center gap-2">
                            <span>💳</span> Metode Pembayaran (Escrow)
                          </h3>
                          <div className="grid grid-cols-2 gap-2">
                            {[
                              { id: 'transfer', name: 'Transfer VA', icon: '🏦' },
                              { id: 'qris', name: 'QRIS Instant', icon: '📱' },
                              { id: 'cod', name: 'COD Proyek', icon: '💵' },
                              { id: 'tempo', name: 'Tempo B2B', icon: '🗓️' }
                            ].map(pay => (
                              <button
                                key={pay.id}
                                onClick={() => setPaymentMethod(pay.id)}
                                className={`p-2.5 rounded-xl border text-[11px] font-bold flex items-center gap-2 justify-center transition-all ${
                                  paymentMethod === pay.id ? 'border-[#FF5A36] bg-[#FF5A36]/5 text-[#FF5A36]' : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                                }`}
                              >
                                <span>{pay.icon}</span>
                                <span>{pay.name}</span>
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              )}

              {/* VIEW: ORDER STATUS TRACKING (DELIVERY TIMELINE STYLE) */}
              {activeTab === 'orders' && (
                <div className="flex flex-col gap-4">
                  <h3 className="font-extrabold text-slate-800 text-lg flex items-center gap-2">
                    <span>📦</span> Riwayat & Pelacakan Logistik Anda
                  </h3>
                  {orders.length === 0 ? (
                    <div className="bg-white rounded-[28px] p-12 text-center border border-slate-100 shadow-sm">
                      <p className="text-slate-400 text-xs">Belum ada transaksi aktif saat ini.</p>
                    </div>
                  ) : (
                    orders.map(order => (
                      <div key={order.id} className="bg-white rounded-[28px] border border-slate-100 shadow-sm p-6 flex flex-col gap-5">
                        <div className="flex flex-wrap justify-between items-center gap-2 border-b border-slate-100 pb-4">
                          <div>
                            <span className="text-xs font-black bg-slate-100 text-slate-700 px-3 py-1.5 rounded-full">{order.id}</span>
                            <p className="text-[11px] text-slate-400 mt-2">Dipesan pada: {order.date}</p>
                          </div>
                          <span className="text-xs font-bold px-3 py-1.5 rounded-full bg-[#FF5A36]/10 text-[#FF5A36]">
                            {order.status}
                          </span>
                        </div>

                        {/* HIGH FIDELITY DELIVERY TRACKING TIMELINE (MIMIC SCREEN 3 OF IMAGE) */}
                        <div className="bg-slate-50 rounded-2xl p-5 border border-slate-100">
                          <div className="flex items-center gap-2 mb-4">
                            <span className="text-xs bg-[#FF5A36] text-white px-2 py-0.5 rounded-md font-bold">In Transit</span>
                            <span className="text-xs text-slate-400 font-bold">{order.id}</span>
                          </div>

                          {/* Stepper Logistik Vertikal */}
                          <div className="relative pl-6 border-l-2 border-slate-200 space-y-6">
                            
                            {/* Step 1: Delivered */}
                            <div className="relative">
                              <span className={`absolute -left-8.5 top-0 w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${
                                order.status === 'Selesai' ? 'bg-emerald-500 text-white' : 'bg-slate-200 text-slate-400'
                              }`}>✓</span>
                              <div className="flex justify-between items-start text-xs">
                                <div>
                                  <p className="font-extrabold text-slate-800">Delivered</p>
                                  <p className="text-[10px] text-slate-400 mt-0.5">Barang diturunkan & diterima di lokasi.</p>
                                </div>
                                <span className="text-[10px] text-slate-400 font-medium">Selesai</span>
                              </div>
                            </div>

                            {/* Step 2: In Transit */}
                            <div className="relative">
                              <span className={`absolute -left-8.5 top-0 w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${
                                order.status === 'Dalam Perjalanan' || order.status === 'Selesai' ? 'bg-[#FF5A36] text-white' : 'bg-slate-200 text-slate-400'
                              }`}>🚚</span>
                              <div className="flex justify-between items-start text-xs">
                                <div>
                                  <p className="font-extrabold text-slate-800">Dalam Perjalanan (In Transit)</p>
                                  <p className="text-[10px] text-slate-400 mt-0.5">{order.driverName || 'Menunggu Driver pickup.'}</p>
                                </div>
                                <span className="text-[10px] text-slate-400 font-medium">On-progress</span>
                              </div>
                            </div>

                            {/* Step 3: Picked Up / Prepared */}
                            <div className="relative">
                              <span className={`absolute -left-8.5 top-0 w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${
                                order.status !== 'Menunggu Konfirmasi Admin' ? 'bg-[#FF5A36] text-white' : 'bg-slate-200 text-slate-400'
                              }`}>🏪</span>
                              <div className="flex justify-between items-start text-xs">
                                <div>
                                  <p className="font-extrabold text-slate-800">Disiapkan oleh Toko</p>
                                  <p className="text-[10px] text-slate-400 mt-0.5">Mitra {order.merchant.name} sedang memuat barang.</p>
                                </div>
                                <span className="text-[10px] text-slate-400 font-medium">Ready</span>
                              </div>
                            </div>

                          </div>
                        </div>

                        {/* Detail Alamat & Mitra Toko */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                          <div>
                            <p className="text-slate-400 font-bold uppercase tracking-widest text-[9px]">Toko Penyuplai Utama</p>
                            <p className="font-extrabold text-slate-800 mt-1">🏪 {order.merchant.name}</p>
                            <p className="text-slate-500 font-medium">{order.merchant.distance} KM dari lokasi Anda</p>
                          </div>
                          <div>
                            <p className="text-slate-400 font-bold uppercase tracking-widest text-[9px]">Alamat Drop-Off Proyek</p>
                            <p className="font-extrabold text-slate-800 mt-1">📍 {order.address}</p>
                            {order.addressDetails && <p className="text-slate-500 italic mt-0.5">"{order.addressDetails}"</p>}
                          </div>
                        </div>

                        {/* List Barang */}
                        <div className="bg-slate-50 rounded-xl p-4 text-xs">
                          <p className="font-bold text-slate-700 mb-2">Item Material:</p>
                          <ul className="space-y-1">
                            {order.items.map(item => (
                              <li key={item.id} className="flex justify-between font-medium">
                                <span>{item.name} x{item.quantity}</span>
                                <span>Rp {(item.price * item.quantity).toLocaleString('id-ID')}</span>
                              </li>
                            ))}
                          </ul>
                        </div>

                        {/* Aksi Konfirmasi Penerimaan */}
                        {order.status === 'Dalam Perjalanan' && (
                          <div className="border-t border-slate-100 pt-3 flex justify-end">
                            <button
                              onClick={() => {
                                setOrders(orders.map(o => o.id === order.id ? { ...o, status: 'Selesai' } : o));
                              }}
                              className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-4 py-2.5 rounded-xl text-xs transition shadow-md shadow-emerald-600/10"
                            >
                              Konfirmasi Barang Diterima ✔️
                            </button>
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>
              )}
            </>
          )}

          {/* =======================================================
              2. ADMIN PLATFORM VIEW (HUB & DISPATCHER)
              ======================================================= */}
          {role === 'admin' && (
            <div className="flex flex-col gap-5">
              <div className="flex justify-between items-center border-b border-slate-200 pb-3">
                <h2 className="text-lg font-extrabold text-slate-800 flex items-center gap-2">
                  <span>🛡️</span> Dashboard Admin Broker & Dispatcher
                </h2>
                <span className="bg-rose-500 text-white text-[10px] font-bold px-2.5 py-1 rounded-full animate-pulse flex items-center gap-1">
                  🚨 SIRENE: {orders.filter(o => o.status === 'Menunggu Konfirmasi Admin').length} Antrean
                </span>
              </div>

              {orders.length === 0 ? (
                <div className="bg-white rounded-[28px] p-12 text-center border border-slate-150 shadow-sm">
                  <p className="text-slate-400 text-xs">Belum ada pesanan masuk dari konsumen.</p>
                </div>
              ) : (
                orders.map(order => (
                  <div key={order.id} className="bg-white rounded-[28px] border border-slate-100 shadow-sm p-5 flex flex-col gap-4">
                    <div className="flex justify-between items-start bg-slate-900 text-white p-4 rounded-2xl">
                      <div>
                        <span className="text-[10px] text-[#FF5A36] font-bold">INCOMING ORDER: {order.id}</span>
                        <p className="text-xs font-semibold text-slate-300 mt-1">Waktu Kirim: {order.scheduledFor}</p>
                      </div>
                      <span className="text-[10px] font-bold bg-[#FF5A36] text-white px-2.5 py-1 rounded-lg">
                        {order.status}
                      </span>
                    </div>

                    {/* Informasi Fisik Pengapalan */}
                    <div className="grid grid-cols-3 gap-3 bg-slate-50 p-4 rounded-2xl text-xs text-center border border-slate-100">
                      <div>
                        <p className="text-slate-400 font-bold uppercase tracking-widest text-[9px]">⚖️ Berat Muatan</p>
                        <p className="font-extrabold text-slate-800 mt-1">{order.totalWeight} Kg</p>
                      </div>
                      <div>
                        <p className="text-slate-400 font-bold uppercase tracking-widest text-[9px]">📐 Volume Muatan</p>
                        <p className="font-extrabold text-slate-800 mt-1">{order.totalVolume.toFixed(3)} m³</p>
                      </div>
                      <div>
                        <p className="text-slate-400 font-bold uppercase tracking-widest text-[9px]">🚚 Rekomendasi Armada</p>
                        <p className="font-extrabold text-[#FF5A36] mt-1">{recommendedVehicle.name}</p>
                      </div>
                    </div>

                    {/* Deteksi Status Overloading */}
                    {order.totalWeight > recommendedVehicle.maxWeight && (
                      <div className="bg-rose-50 border border-rose-100 rounded-xl p-3 text-xs text-rose-700 font-semibold flex items-center gap-2">
                        ⚠️ WARNING ODOL: Berat barang melebihi kapasitas standar kendaraan yang direkomendasikan!
                      </div>
                    )}

                    {/* Deteksi Split Order Requirement */}
                    {order.isSplitNeeded && (
                      <div className="bg-amber-50 border border-amber-100 rounded-xl p-3 text-xs text-amber-800 flex flex-col gap-1.5">
                        <span className="font-bold">⚠️ SISTEM REKOMENDASI PECAH PESANAN (SPLIT ORDER):</span>
                        <span>Stok tidak mencukupi 100% di satu toko terdekat. Admin disarankan membagi pesanan ini ke toko lain.</span>
                      </div>
                    )}

                    {/* SMART PROXIMITY MATCH TABLE */}
                    <div>
                      <h4 className="font-bold text-slate-800 text-xs mb-2">💡 Algoritma Rekomendasi Penyedia Terdekat:</h4>
                      <div className="overflow-x-auto">
                        <table className="w-full text-xs text-left border border-slate-100 rounded-xl overflow-hidden">
                          <thead className="bg-slate-100 text-slate-600 font-bold">
                            <tr>
                              <th className="p-3">Nama Toko</th>
                              <th className="p-3">Jarak</th>
                              <th className="p-3">Kecocokan Stok</th>
                              <th className="p-3">Estimasi Ongkir</th>
                              <th className="p-3 text-right">Aksi Dispatch</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100">
                            {getProximityRecommendations().map(rec => (
                              <tr key={rec.id} className="hover:bg-slate-50 transition">
                                <td className="p-3 font-bold text-slate-800">🏪 {rec.name}</td>
                                <td className="p-3 font-semibold text-slate-600">{rec.distance} KM</td>
                                <td className="p-3">
                                  <span className={`font-bold ${rec.stockMatchPercent === 100 ? 'text-emerald-600' : 'text-amber-600'}`}>
                                    {rec.stockMatchPercent}% Cocok
                                  </span>
                                </td>
                                <td className="p-3 font-bold text-slate-800">Rp {rec.deliveryCost.toLocaleString('id-ID')}</td>
                                <td className="p-3 text-right">
                                  {order.status === 'Menunggu Konfirmasi Admin' ? (
                                    <button
                                      onClick={() => handleDispatchOrder(order.id, rec.id)}
                                      className="bg-[#FF5A36] hover:bg-slate-950 text-white font-bold px-3 py-1.5 rounded-lg transition"
                                    >
                                      Kirim ➡️
                                    </button>
                                  ) : (
                                    <span className="text-slate-400 italic">Diserahkan</span>
                                  )}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* =======================================================
              3. TOKO / MERCHANT VIEW
              ======================================================= */}
          {role === 'merchant' && (
            <div className="flex flex-col gap-5">
              <div className="flex justify-between items-center border-b border-slate-200 pb-3">
                <h2 className="text-lg font-extrabold text-slate-800 flex items-center gap-2">
                  <span>🏪</span> Panel Manajemen Mitra Toko
                </h2>
                <div className="flex gap-2">
                  <button 
                    onClick={() => setActiveTab('orders')} 
                    className={`text-xs font-bold px-3 py-1.5 rounded-xl transition ${activeTab === 'orders' ? 'bg-slate-950 text-white' : 'bg-slate-100 text-slate-600'}`}
                  >
                    Antrean Masuk
                  </button>
                  <button 
                    onClick={() => setActiveTab('inventory')} 
                    className={`text-xs font-bold px-3 py-1.5 rounded-xl transition ${activeTab === 'inventory' ? 'bg-slate-950 text-white' : 'bg-slate-100 text-slate-600'}`}
                  >
                    Atur Inventaris & Stok
                  </button>
                </div>
              </div>

              {activeTab === 'orders' && (
                <div className="flex flex-col gap-4">
                  {orders.filter(o => o.status === 'Disiapkan oleh Toko' && o.merchant.id === 'm1').length === 0 ? (
                    <div className="bg-white rounded-[28px] p-12 text-center border border-slate-150 shadow-sm">
                      <p className="text-slate-400 text-xs">Tidak ada pesanan aktif yang ditugaskan ke toko Anda saat ini.</p>
                    </div>
                  ) : (
                    orders.filter(o => o.status === 'Disiapkan oleh Toko' && o.merchant.id === 'm1').map(order => (
                      <div key={order.id} className="bg-white border border-slate-100 shadow-sm rounded-2xl p-5 flex flex-col gap-4">
                        <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                          <span className="font-bold text-slate-800 text-sm">ORDER ID: {order.id}</span>
                          <span className="bg-blue-100 text-blue-800 text-xs font-bold px-2.5 py-1 rounded-full">Siapkan Barang</span>
                        </div>
                        
                        {/* List Pengemasan */}
                        <div className="text-xs text-slate-700 bg-slate-50 p-4 rounded-xl border border-slate-100">
                          <p className="font-bold text-slate-800 mb-2">📋 Daftar Material yang Harus Dikemas:</p>
                          <ul className="space-y-1">
                            {order.items.map(item => (
                              <li key={item.id} className="flex justify-between items-center py-1">
                                <span className="font-medium">📦 {item.name}</span>
                                <span className="font-extrabold bg-white px-2 py-0.5 rounded border border-slate-200 text-slate-900">{item.quantity} {item.unit}</span>
                              </li>
                            ))}
                          </ul>
                        </div>

                        {/* Assign Courier & Dispatch */}
                        <div className="flex justify-between items-center pt-2">
                          <div className="text-xs text-slate-500">
                            <p>Penyiapan Logistik: <b>Armada {recommendedVehicle.name}</b></p>
                            <p className="text-[10px] text-slate-400 mt-0.5">Driver: {order.driverName}</p>
                          </div>
                          <button
                            onClick={() => handleMerchantReady(order.id)}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-4 py-2.5 rounded-xl text-xs transition"
                          >
                            Siap Kirim & Panggil Driver! 🚀
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}

              {activeTab === 'inventory' && (
                <div className="bg-white rounded-[28px] border border-slate-100 shadow-sm p-5">
                  <h3 className="font-bold text-slate-800 text-sm mb-4">Atur Ketersediaan & Stok Produk Mitra:</h3>
                  <div className="space-y-3">
                    {products.map(p => (
                      <div key={p.id} className="flex items-center justify-between border-b border-slate-100 pb-3 last:border-0 last:pb-0">
                        <div className="flex items-center gap-2">
                          <span className="text-2xl">{p.image}</span>
                          <div>
                            <p className="font-bold text-slate-800 text-xs">{p.name}</p>
                            <p className="text-[10px] text-slate-400">Rp {p.price.toLocaleString('id-ID')}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-xs text-slate-500">Stok Toko:</span>
                          <input 
                            type="number" 
                            value={p.stock}
                            onChange={(e) => {
                              const newStock = parseInt(e.target.value) || 0;
                              setProducts(products.map(prod => prod.id === p.id ? { ...prod, stock: newStock } : prod));
                            }}
                            className="w-16 text-center text-xs border border-slate-200 rounded p-1 font-bold focus:ring-1 focus:ring-[#FF5A36]"
                          />
                          {p.stock <= 30 && (
                            <span className="bg-rose-100 text-rose-800 text-[9px] font-bold px-1.5 py-0.5 rounded animate-pulse">Low Stock</span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* =======================================================
              4. DRIVER / KURIR VIEW
              ======================================================= */}
          {role === 'driver' && (
            <div className="flex flex-col gap-5">
              <div className="flex justify-between items-center border-b border-slate-200 pb-3">
                <h2 className="text-lg font-extrabold text-slate-800 flex items-center gap-2">
                  <span>🚛</span> Aplikasi Pengantaran Driver
                </h2>
                <span className="bg-emerald-600 text-white text-xs font-bold px-2.5 py-1 rounded-full">Driver Online</span>
              </div>

              {orders.filter(o => o.status === 'Dalam Perjalanan').length === 0 ? (
                <div className="bg-white rounded-[28px] p-12 text-center border border-slate-150 shadow-sm">
                  <p className="text-slate-400 text-xs">Belum ada tugas penjemputan barang saat ini. Tetap bersiap di armada Anda!</p>
                </div>
              ) : (
                orders.filter(o => o.status === 'Dalam Perjalanan').map(order => (
                  <div key={order.id} className="bg-white border border-slate-100 shadow-sm rounded-2xl p-5 flex flex-col gap-4">
                    <div className="bg-slate-900 text-white p-4 rounded-xl flex justify-between items-center">
                      <div>
                        <p className="text-xs font-bold text-[#FF5A36]">ORDER ANTAR: {order.id}</p>
                        <p className="text-[10px] text-slate-300">Hub: {order.merchant.name}</p>
                      </div>
                      <span className="text-xs bg-[#FF5A36] text-white px-2 py-0.5 rounded font-bold">AKTIF</span>
                    </div>

                    {/* Navigasi Alamat Pickup & Drop-off */}
                    <div className="relative pl-6 space-y-4 text-xs before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-dashed before:bg-slate-300">
                      <div className="relative">
                        <span className="absolute -left-5 bg-blue-100 text-blue-800 w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-extrabold">A</span>
                        <p className="font-semibold text-slate-400 uppercase tracking-wider text-[9px]">Titik Penjemputan (Pick-Up)</p>
                        <p className="font-bold text-slate-800 mt-0.5">🏪 {order.merchant.name}</p>
                      </div>
                      <div className="relative">
                        <span className="absolute -left-5 bg-amber-100 text-amber-800 w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-extrabold">B</span>
                        <p className="font-semibold text-slate-400 uppercase tracking-wider text-[9px]">Titik Pengiriman Proyek (Drop-Off)</p>
                        <p className="font-bold text-slate-800 mt-0.5">📍 {order.address}</p>
                        {order.addressDetails && <p className="text-slate-500 italic mt-0.5">"{order.addressDetails}"</p>}
                      </div>
                    </div>

                    {/* FOTO PROOF OF DELIVERY & TTD DIGITAL */}
                    <div className="border-t border-slate-100 pt-4 flex flex-col gap-4">
                      <h4 className="font-bold text-slate-800 text-sm flex items-center gap-1.5">
                        <span>📸</span> Bukti Penerimaan Pengiriman (PoD):
                      </h4>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Unggah Foto Material */}
                        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 flex flex-col items-center justify-center text-center relative overflow-hidden aspect-video">
                          {podPhoto ? (
                            <>
                              <img src={podPhoto} alt="POD Material" className="absolute inset-0 w-full h-full object-cover" />
                              <button 
                                onClick={() => setPodPhoto(null)} 
                                className="absolute top-2 right-2 bg-rose-500 text-white rounded-full p-1.5 text-xs font-bold hover:bg-rose-600 shadow"
                              >
                                Hapus 🗑️
                              </button>
                            </>
                          ) : (
                            <div className="flex flex-col items-center">
                              <span className="text-3xl block mb-1">🏗️</span>
                              <p className="text-xs font-bold text-slate-700">Foto Material Turun dari Truk</p>
                              <button 
                                onClick={simulatePodPhotoUpload}
                                className="mt-3 bg-slate-900 text-white hover:bg-[#FF5A36] text-xs font-bold px-3 py-1.5 rounded-lg transition"
                              >
                                Ambil Foto Simulasi 📷
                              </button>
                            </div>
                          )}
                        </div>

                        {/* Canvas Tanda Tangan Digital */}
                        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 flex flex-col justify-between">
                          <div>
                            <p className="text-xs font-bold text-slate-700">Tanda Tangan Digital Konsumen</p>
                          </div>

                          <div className="my-2 bg-white border border-slate-200 rounded-xl relative overflow-hidden aspect-video">
                            <canvas
                              ref={canvasRef}
                              onMouseDown={startDrawing}
                              onMouseMove={draw}
                              onMouseUp={stopDrawing}
                              onMouseLeave={stopDrawing}
                              onTouchStart={startDrawing}
                              onTouchMove={draw}
                              onTouchEnd={stopDrawing}
                              className="w-full h-full cursor-crosshair block"
                            />
                            {signatureSaved && (
                              <div className="absolute inset-0 bg-emerald-500/10 flex items-center justify-center pointer-events-none">
                                <span className="bg-emerald-600 text-white text-[10px] font-bold px-2 py-1 rounded-full shadow">TTD Terkunci ✔️</span>
                              </div>
                            )}
                          </div>

                          <div className="flex gap-2 justify-end">
                            <button onClick={clearSignature} className="text-[10px] font-bold text-rose-500 hover:underline">Hapus TTD</button>
                            <button onClick={saveSignature} className="text-[10px] font-bold text-emerald-600 hover:underline">Kunci TTD</button>
                          </div>
                        </div>
                      </div>

                      {/* Selesaikan Tugas */}
                      <button
                        onClick={() => handleCompleteDelivery(order.id)}
                        disabled={!podPhoto || !signatureSaved}
                        className={`w-full py-3 rounded-2xl font-bold text-sm transition text-center flex items-center justify-center gap-2 ${
                          podPhoto && signatureSaved 
                            ? 'bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer shadow-md' 
                            : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                        }`}
                      >
                        <span>✔️</span> Selesaikan Pengantaran
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

        </div>

        {/* SISI KANAN: CHAT REAL-TIME SIMULATOR & RINGKASAN */}
        <div className="lg:col-span-4 flex flex-col gap-5">
          
          {/* USER PROFILE INFO HEADER CARD (MIMIC SCREEN 2 HEADER) */}
          <div className="bg-white rounded-[28px] border border-slate-150 p-4 flex items-center justify-between shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-full bg-[#FF5A36] text-white flex items-center justify-center text-lg font-bold">
                DS
              </div>
              <div>
                <h4 className="font-extrabold text-sm text-slate-900">D. Stwaret</h4>
                <p className="text-[10px] text-slate-400 font-medium">📍 4291 Ashford Drive, JKT</p>
              </div>
            </div>
            <button className="w-9 h-9 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center text-sm shadow-sm">
              🔔
            </button>
          </div>

          {/* BOX 1: REAL-TIME CHAT SIMULATOR */}
          <div className="bg-white border border-slate-150 rounded-[28px] shadow-sm flex flex-col h-[340px] overflow-hidden">
            <div className="bg-slate-900 text-white p-4 flex justify-between items-center">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                <div>
                  <h3 className="font-extrabold text-xs">CS Hub & Konsolidator</h3>
                  <p className="text-[9px] text-slate-400 font-medium">Aktif berkoordinasi langsung</p>
                </div>
              </div>
              <span className="text-[10px] font-bold bg-slate-800 text-slate-300 px-2 py-0.5 rounded-md">Live Chat</span>
            </div>

            {/* Area Pesan Chat */}
            <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-slate-50 text-xs">
              {chats.map((chat, idx) => (
                <div key={idx} className={`flex flex-col ${chat.sender === role ? 'items-end' : 'items-start'}`}>
                  <span className="text-[9px] text-slate-400 font-bold px-1 capitalize">{chat.sender}</span>
                  <div className={`p-3 rounded-2xl max-w-[80%] mt-0.5 shadow-sm ${
                    chat.sender === role 
                      ? 'bg-[#FF5A36] text-white rounded-tr-none font-bold' 
                      : 'bg-white text-slate-800 rounded-tl-none border border-slate-100'
                  }`}>
                    {chat.text}
                  </div>
                  <span className="text-[8px] text-slate-400 mt-1 px-1">{chat.timestamp}</span>
                </div>
              ))}
            </div>

            {/* Input Chat */}
            <div className="p-3 border-t border-slate-100 bg-white flex gap-2 items-center">
              <input 
                type="text" 
                placeholder={`Tulis balasan sebagai ${role}...`}
                value={newMsg}
                onChange={(e) => setNewMsg(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSendChat()}
                className="flex-1 text-xs bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-1 focus:ring-[#FF5A36]"
              />
              <button 
                onClick={handleSendChat}
                className="bg-slate-900 text-white hover:bg-[#FF5A36] font-bold px-4 py-3 rounded-xl text-xs transition"
              >
                Kirim
              </button>
            </div>
          </div>

          {/* BOX 2: INFORMASI RINGKASAN BELANJA & KALKULATOR INSTANT */}
          {role === 'customer' && cart.length > 0 && (
            <div className="bg-white border border-slate-150 rounded-[28px] shadow-sm p-5 flex flex-col gap-4">
              <h3 className="font-extrabold text-slate-800 text-sm border-b border-slate-100 pb-2">
                🏷️ Ringkasan Belanja Proyek
              </h3>
              
              <div className="text-xs text-slate-600 space-y-2">
                <div className="flex justify-between">
                  <span>Subtotal Material</span>
                  <span className="font-bold text-slate-900">Rp {cartTotalPrice.toLocaleString('id-ID')}</span>
                </div>
                <div className="flex justify-between">
                  <span>Ongkos Kirim ({recommendedVehicle.name})</span>
                  <span className="font-bold text-slate-900">Rp {rawDeliveryCost.toLocaleString('id-ID')}</span>
                </div>
                
                {/* OPSI ADD-ONS */}
                <div className="border-t border-slate-100 my-2 pt-3">
                  <p className="font-extrabold text-slate-700 text-xs mb-2">Kustom Layanan Pengiriman:</p>
                  
                  <div className="space-y-2 text-slate-600">
                    <label className="flex items-center gap-2 cursor-pointer font-semibold">
                      <input 
                        type="checkbox" 
                        checked={selectedAddons.helper}
                        onChange={(e) => setSelectedAddons({ ...selectedAddons, helper: e.target.checked })}
                        className="rounded text-[#FF5A36] focus:ring-[#FF5A36] w-4 h-4"
                      />
                      <span>Jasa Kuli Bongkar (+Rp50rb)</span>
                    </label>
                    {selectedAddons.helper && (
                      <div className="flex items-center gap-2 pl-6">
                        <span className="text-[10px] text-slate-400">Jumlah helper:</span>
                        <input 
                          type="number" 
                          min="1" 
                          max="10"
                          value={helperCount}
                          onChange={(e) => setHelperCount(parseInt(e.target.value) || 1)}
                          className="w-12 text-center border rounded p-1 text-[10px]"
                        />
                      </div>
                    )}

                    <label className="flex items-center gap-2 cursor-pointer font-semibold">
                      <input 
                        type="checkbox" 
                        checked={selectedAddons.tol}
                        onChange={(e) => setSelectedAddons({ ...selectedAddons, tol: e.target.checked })}
                        className="rounded text-[#FF5A36] focus:ring-[#FF5A36] w-4 h-4"
                      />
                      <span>Lewat Jalan Tol Flat (+Rp30rb)</span>
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer font-semibold">
                      <input 
                        type="checkbox" 
                        checked={selectedAddons.terpal}
                        onChange={(e) => setSelectedAddons({ ...selectedAddons, terpal: e.target.checked })}
                        className="rounded text-[#FF5A36] focus:ring-[#FF5A36] w-4 h-4"
                      />
                      <span>Gunakan Penutup Terpal Hujan (+Rp25rb)</span>
                    </label>
                  </div>
                </div>
              </div>

              {/* Total Final */}
              <div className="border-t border-slate-100 pt-4 flex justify-between items-center">
                <div>
                  <p className="text-[9px] text-slate-400 uppercase tracking-widest font-bold">Total Pembayaran</p>
                  <p className="font-black text-slate-950 text-lg">Rp {grandTotal.toLocaleString('id-ID')}</p>
                </div>
                <button
                  onClick={handleCheckout}
                  className="bg-[#FF5A36] hover:bg-slate-900 text-white font-bold px-4 py-3 rounded-xl text-xs transition shadow-md shadow-[#FF5A36]/10"
                >
                  Bayar & Teruskan 🚀
                </button>
              </div>
            </div>
          )}

          {/* BOX 3: MATRIKS ODOL & PARAMETER ARMADA */}
          <div className="bg-white border border-slate-150 rounded-[28px] shadow-sm p-5 text-xs">
            <h3 className="font-extrabold text-slate-800 text-sm mb-3 border-b border-slate-100 pb-2 flex items-center gap-1.5">
              <span>⚖️</span> Kapasitas Angkut Armada (Anti-ODOL)
            </h3>
            <ul className="space-y-2 text-slate-500 font-semibold">
              {VEHICLE_TYPES.map(v => (
                <li key={v.id} className="flex justify-between items-center">
                  <span>{v.icon} {v.name}</span>
                  <span className="font-bold text-slate-800">Maks {v.maxWeight >= 1000 ? (v.maxWeight / 1000) + ' Ton' : v.maxWeight + ' Kg'}</span>
                </li>
              ))}
            </ul>
          </div>

        </div>

      </main>

      {/* FOOTER */}
      <footer className="bg-slate-950 text-white border-t border-slate-900 py-8 mt-12">
        <div className="max-w-7xl mx-auto px-4 text-center text-xs text-slate-500 space-y-1.5">
          <p className="font-bold">© 2026 BahanBangunGo - Logistik Bahan Bangunan Terintegrasi.</p>
          <p>Didesain secara khusus untuk portofolio premium di GitHub & Hosting Vercel.</p>
        </div>
      </footer>

    </div>
  );
}