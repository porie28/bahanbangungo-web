import React, { useState, useEffect, useRef } from 'react';

const INITIAL_PRODUCTS = [
  { id: 'p1', name: 'Semen Gresik SNI 40kg', category: 'Semen', price: 58000, stock: 450, unit: 'Sak', weight: 40, volume: 0.028, image: '🧱' },
  { id: 'p2', name: 'Pasir Cor Gunung Merapi', category: 'Pasir', price: 340000, stock: 45, unit: 'm³', weight: 1400, volume: 1.0, image: '⏳' },
  { id: 'p3', name: 'Besi Beton Ulir 12mm', category: 'Besi', price: 112000, stock: 600, unit: 'Batang', weight: 10.5, volume: 0.004, image: '⛓️' },
  { id: 'p4', name: 'Cat Tembok Jotun Shield 20L', category: 'Cat', price: 820000, stock: 85, unit: 'Pail', weight: 24, volume: 0.02, image: '🎨' },
  { id: 'p5', name: 'Batu Kali Pondasi Belah', category: 'Pasir', price: 290000, stock: 30, unit: 'm³', weight: 1600, volume: 1.0, image: '🪨' },
];

const INITIAL_MERCHANTS = [
  { id: 'm1', name: 'TB. Maju Jaya Sentosa - Cengkareng', lat: -6.210, lng: 106.820, stock: { p1: 300, p2: 20, p3: 400, p4: 50, p5: 15 }, rating: 4.8 },
  { id: 'm2', name: 'Depo Bangunan Sejahtera - Tangerang', lat: -6.225, lng: 106.840, stock: { p1: 150, p2: 25, p3: 200, p4: 35, p5: 15 }, rating: 4.6 },
];

const FLEET_TYPES = [
  { id: 'pickup', name: 'Mobil Pick-Up (L300)', maxWeight: 1500, baseFare: 75000, perKm: 5000, icon: '🛻' },
  { id: 'engkel', name: 'Truk Engkel CDE', maxWeight: 3000, baseFare: 150000, perKm: 8000, icon: '🚚' },
  { id: 'double', name: 'Truk Double CDD', maxWeight: 7000, baseFare: 250000, perKm: 12000, icon: '🚛' },
];

const SLIDER_PHOTOS = [
  { id: 1, title: 'KEMUDAHAN TRANSAKSI ESCROW B2B PROYEK', desc: 'Jaminan keamanan dana 100% dengan pencairan bertahap setelah penandatanganan Bukti Digital PoD.', bgGradient: 'linear-gradient(135deg, #004d34 0%, #00805a 100%)' },
  { id: 2, title: 'ARMADA TANGGUH BEBAS ODOL JALAN RAYA', desc: 'Sistem pintar kami secara otomatis mengonversi berat dan dimensi guna merekomendasikan truk yang aman.', bgGradient: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)' }
];

export default function App() {
  const [role, setRole] = useState('customer'); // customer | admin | merchant | driver
  const [activeTab, setActiveTab] = useState('dashboard'); // dashboard | browse | cart | orders | chat
  
  // Database State
  const [products, setProducts] = useState(INITIAL_PRODUCTS);
  const [merchants, setMerchants] = useState(INITIAL_MERCHANTS);
  const [orders, setOrders] = useState([
    {
      id: 'BBG-998122',
      date: '23 Juni 2026',
      scheduledFor: 'Segera Kirim (Instant)',
      items: [{ id: 'p1', name: 'Semen Gresik SNI 40kg', price: 58000, quantity: 20, unit: 'Sak', weight: 40, volume: 0.028 }],
      totalWeight: 800,
      totalVolume: 0.56,
      subtotal: 1160000,
      deliveryCost: 195000,
      addonCost: 50000,
      grandTotal: 1405000,
      address: 'Proyek Cluster Harmoni, Tangerang',
      status: 'Dalam Perjalanan',
      driverName: 'Pak Rudi (Armada Truk Engkel CDE)',
      merchantId: 'm1',
      proofOfDelivery: null,
      signature: null,
      history: [
        { status: 'Pesanan Dibuat', time: '10:00 AM', desc: 'Sistem mengunci pembayaran escrow.' },
        { status: 'Dikonfirmasi', time: '10:15 AM', desc: 'Toko memvalidasi ketersediaan semen.' },
        { status: 'Picked Up', time: '11:00 AM', desc: 'Material dimuat ke armada CDE.' }
      ]
    }
  ]);

  // Admin Backend Specific States
  const [selectedAdminOrder, setSelectedAdminOrder] = useState(null);
  const [adminSelectedMerchant, setAdminSelectedMerchant] = useState('m1');
  const [adminSelectedDriver, setAdminSelectedDriver] = useState('Pak Rudi (Armada Truk Engkel CDE)');
  const [systemSafetyMargin, setSystemSafetyMargin] = useState(10); // Toleransi ODOL dalam %

  // Customer Shopping States
  const [cart, setCart] = useState([]);
  const [customerLat, setCustomerLat] = useState(-6.214);
  const [customerLng, setCustomerLng] = useState(106.825);
  const [shippingAddress, setShippingAddress] = useState('Proyek Konstruksi Jl. Jend. Sudirman Kav 21, Jakarta');
  const [selectedAddons, setSelectedAddons] = useState({ helper: false, tol: false, terpal: false });
  const [helperCount, setHelperCount] = useState(1);

  // Chat & Notifications States
  const [chats, setChats] = useState([
    { id: 1, sender: 'admin', text: 'Halo! Selamat datang di Portal BahanBangunGo. Ada yang bisa dibantu?', timestamp: '15:30' }
  ]);
  const [newMsg, setNewMsg] = useState('');
  const [notifications, setNotifications] = useState([
    { id: 1, text: 'Sistem Siap: Selamat datang di web-app BahanBangunGo Cargo!' }
  ]);
  const [toastMessage, setToastMessage] = useState(null);

  // Carousel State
  const [currentSlide, setCurrentSlide] = useState(0);

  // Signature Canvas States
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [signatureSaved, setSignatureSaved] = useState(false);
  const [podPhoto, setPodPhoto] = useState(null);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % SLIDER_PHOTOS.length);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  // Reset tab aktif jika berganti ke peran yang tidak memiliki akses tab belanja
  useEffect(() => {
    if (role === 'admin' && (activeTab === 'browse' || activeTab === 'cart')) {
      setActiveTab('dashboard');
      triggerToast('Akses Tab Belanja Ditutup untuk Peran Admin');
    } else if (role === 'driver' && (activeTab === 'browse' || activeTab === 'cart')) {
      setActiveTab('orders');
    } else if (role === 'merchant' && (activeTab === 'browse' || activeTab === 'cart')) {
      setActiveTab('orders');
    }
  }, [role]);

  const triggerToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const addNotification = (text) => {
    setNotifications(prev => [{ id: Date.now(), text }, ...prev]);
  };

  const cartTotalWeight = cart.reduce((acc, item) => acc + (item.weight * item.quantity), 0);
  const cartTotalVolume = cart.reduce((acc, item) => acc + (item.volume * item.quantity), 0);
  const cartTotalPrice = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);

  // Rekomendasi armada logistik yang cocok berdasarkan berat muatan
  const recommendedFleet = FLEET_TYPES.find(f => cartTotalWeight <= f.maxWeight) || FLEET_TYPES[2];

  const getDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // Jari-jari bumi dalam km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return parseFloat((R * c).toFixed(1));
  };

  const activeDistance = getDistance(customerLat, customerLng, merchants[0].lat, merchants[0].lng);
  const rawDeliveryCost = Math.round(recommendedFleet.baseFare + (activeDistance * recommendedFleet.perKm));
  const addonCost = (selectedAddons.helper ? helperCount * 75000 : 0) + (selectedAddons.tol ? 35000 : 0) + (selectedAddons.terpal ? 20000 : 0);
  const grandTotal = cartTotalPrice + rawDeliveryCost + addonCost;

  const addToCart = (product) => {
    const existing = cart.find(item => item.id === product.id);
    if (existing) {
      if (existing.quantity < product.stock) {
        setCart(cart.map(item => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item));
        triggerToast(`${product.name} kuantitas ditambah.`);
      } else {
        triggerToast('Stok merchant tidak mencukupi.');
      }
    } else {
      setCart([...cart, { ...product, quantity: 1 }]);
      triggerToast(`${product.name} dimasukkan ke keranjang.`);
    }
  };

  const updateCartQty = (id, newQty) => {
    if (newQty <= 0) {
      setCart(cart.filter(item => item.id !== id));
    } else {
      setCart(cart.map(item => item.id === id ? { ...item, quantity: newQty } : item));
    }
  };

  const handleCheckout = () => {
    if (cart.length === 0) return;
    const orderId = 'BBG-' + Math.floor(100000 + Math.random() * 900000);
    const newOrder = {
      id: orderId,
      date: '24 Juni 2026',
      scheduledFor: 'Segera Kirim (Instant)',
      items: [...cart],
      totalWeight: cartTotalWeight,
      totalVolume: cartTotalVolume,
      subtotal: cartTotalPrice,
      deliveryCost: rawDeliveryCost,
      addonCost,
      grandTotal,
      address: shippingAddress,
      status: 'Menunggu Konfirmasi Admin',
      driverName: null,
      merchantId: 'm1',
      proofOfDelivery: null,
      signature: null,
      history: [
        { status: 'Pesanan Dibuat', time: 'Just Now', desc: 'Transaksi berhasil dikunci dalam sistem escrow.' }
      ]
    };

    setOrders([newOrder, ...orders]);
    setCart([]);
    addNotification(`Pesanan Baru Terbuat! ID: ${orderId}. Menunggu konfirmasi admin.`);
    triggerToast('Pesanan berhasil dibuat! Dana Anda aman dalam Escrow.');
    setActiveTab('orders');
  };

  const handleAdminApproveAndDispatch = (orderId) => {
    setOrders(orders.map(o => {
      if (o.id === orderId) {
        const history = [...o.history, { status: 'Dikonfirmasi', time: 'Just Now', desc: `Admin (Broker) mengesahkan order, meneruskan penyiapan fisik ke Toko (ID: ${adminSelectedMerchant}) dengan Driver: ${adminSelectedDriver}.` }];
        return { 
          ...o, 
          status: 'Disiapkan oleh Toko', 
          merchantId: adminSelectedMerchant,
          driverName: adminSelectedDriver,
          history 
        };
      }
      return o;
    }));
    addNotification(`Pesanan ${orderId} telah diperiksa Admin & diteruskan ke mitra toko.`);
    triggerToast('Alokasi logistik & penugasan kurir sukses!');
    setSelectedAdminOrder(null);
  };

  const handleMerchantReady = (orderId) => {
    setOrders(orders.map(o => {
      if (o.id === orderId) {
        const history = [...o.history, { status: 'Picked Up', time: 'Just Now', desc: 'Barang selesai dikemas & diserahkan kepada Driver.' }];
        return { ...o, status: 'Dalam Perjalanan', history };
      }
      return o;
    }));
    addNotification(`Pesanan ${orderId} selesai dikemas. Driver dalam perjalanan.`);
    triggerToast('Status diperbarui: Dalam Perjalanan!');
  };

  const startDrawing = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    ctx.strokeStyle = '#00805a';
    const rect = canvas.getBoundingClientRect();
    const clientX = e.clientX || (e.touches && e.touches[0].clientX);
    const clientY = e.clientY || (e.touches && e.touches[0].clientY);
    ctx.beginPath();
    ctx.moveTo(clientX - rect.left, clientY - rect.top);
    setIsDrawing(true);
  };

  const draw = (e) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const rect = canvas.getBoundingClientRect();
    const clientX = e.clientX || (e.touches && e.touches[0].clientX);
    const clientY = e.clientY || (e.touches && e.touches[0].clientY);
    ctx.lineTo(clientX - rect.left, clientY - rect.top);
    ctx.stroke();
  };

  const saveSignature = () => {
    setSignatureSaved(true);
    triggerToast('Tanda tangan berhasil dikunci!');
  };

  const clearSignature = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      setSignatureSaved(false);
    }
  };

  const handleDriverDeliver = (orderId) => {
    setOrders(orders.map(o => {
      if (o.id === orderId) {
        const history = [...o.history, { status: 'Selesai', time: 'Just Now', desc: 'Barang diterima & diverifikasi lewat PoD Digital.' }];
        return {
          ...o,
          status: 'Selesai',
          proofOfDelivery: podPhoto || 'https://images.unsplash.com/photo-1590069261209-f8e9b8642343?auto=format&fit=crop&w=600&q=80',
          signature: 'SIGNED_OK',
          history
        };
      }
      return o;
    }));
    setPodPhoto(null);
    setSignatureSaved(false);
    addNotification(`Pesanan ${orderId} telah selesai dikirim! Dana Escrow dicairkan.`);
    triggerToast('Pesanan berhasil diselesaikan!');
  };

  const handleSendChat = () => {
    if (!newMsg.trim()) return;
    const timeNow = new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
    const userMsg = { id: Date.now(), sender: role, text: newMsg, timestamp: timeNow };
    setChats(prev => [...prev, userMsg]);
    setNewMsg('');

    // Simulated Auto-Reply
    setTimeout(() => {
      setChats(prev => [...prev, {
        id: Date.now() + 1,
        sender: 'admin',
        text: 'Terima kasih atas pesannya. CS kami sedang mengonfirmasi data logistik Anda.',
        timestamp: timeNow
      }]);
    }, 1500);
  };

  return (
    <div className="bbg-dashboard-wrapper">
      
      {/* ==========================================
          EMBEDDED STYLE ENGINE (PREVENTS BROKEN RENDER ON DEPLOY)
          ========================================== */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Poppins:wght@600;700;800&family=Open+Sans:wght@400;600&display=swap');
        
        .bbg-dashboard-wrapper {
          font-family: 'Inter', sans-serif;
          background-color: #f8fafc;
          color: #1e293b;
          min-height: 100vh;
          display: flex;
          overflow-x: hidden;
        }

        h1, h2, h3, h4, h5 {
          font-family: 'Poppins', sans-serif;
        }

        p, span, label, input, select, button, td, th {
          font-family: 'Inter', sans-serif;
        }

        /* Responsive Sidebar */
        .bbg-sidebar {
          width: 280px;
          background-color: #0f172a;
          color: #f8fafc;
          display: flex;
          flex-direction: column;
          padding: 24px;
          border-right: 1px solid #1e293b;
          min-height: 100vh;
          position: sticky;
          top: 0;
          z-index: 50;
        }

        .bbg-brand-logo {
          font-size: 20px;
          font-weight: 800;
          color: #ffffff;
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 32px;
        }

        .bbg-brand-logo span {
          color: #F2C335;
        }

        .bbg-menu-list {
          display: flex;
          flex-direction: column;
          gap: 8px;
          flex-grow: 1;
        }

        .bbg-menu-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px 16px;
          border-radius: 12px;
          color: #94a3b8;
          font-weight: 600;
          font-size: 14px;
          background: none;
          border: none;
          text-align: left;
          cursor: pointer;
          transition: all 0.2s ease;
          width: 100%;
        }

        .bbg-menu-item:hover, .bbg-menu-item.active {
          color: #ffffff;
          background-color: #1e293b;
        }

        .bbg-menu-item.active {
          background-color: #00805a;
          box-shadow: 0 4px 12px rgba(0, 128, 90, 0.3);
        }

        /* Top Bar Header */
        .bbg-main-area {
          flex-grow: 1;
          display: flex;
          flex-direction: column;
          min-width: 0;
        }

        .bbg-topbar {
          background-color: #ffffff;
          border-bottom: 1px solid #e2e8f0;
          padding: 16px 40px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          position: sticky;
          top: 0;
          z-index: 40;
        }

        .bbg-role-dropdown {
          background-color: #f1f5f9;
          border: 1px solid #cbd5e1;
          font-weight: 700;
          padding: 8px 16px;
          border-radius: 10px;
          outline: none;
          cursor: pointer;
          color: #1e293b;
          font-size: 13px;
        }

        /* Layout Grid and Cards */
        .bbg-content {
          padding: 40px;
          flex-grow: 1;
        }

        .bbg-stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
          gap: 24px;
          margin-bottom: 32px;
        }

        .bbg-stat-card {
          background-color: #ffffff;
          border-radius: 20px;
          padding: 24px;
          box-shadow: 0 4px 20px rgba(0,0,0,0.03);
          border: 1px solid #e2e8f0;
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .bbg-stat-value {
          font-size: 26px;
          font-weight: 800;
          color: #0f172a;
        }

        .bbg-interactive-card {
          background-color: #ffffff;
          border-radius: 24px;
          padding: 32px;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.03);
          border: 1px solid #e2e8f0;
          margin-bottom: 32px;
        }

        /* Interactive Forms & Controls */
        .bbg-form-control {
          background-color: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 12px;
          padding: 12px 16px;
          font-size: 13px;
          font-weight: 500;
          color: #1e293b;
          width: 100%;
          outline: none;
          box-sizing: border-box;
          transition: all 0.2s ease;
        }

        .bbg-form-control:focus {
          border-color: #00805a;
          background-color: #ffffff;
        }

        .bbg-btn-primary {
          background-color: #00805a;
          color: #ffffff;
          font-weight: 700;
          font-size: 13px;
          padding: 12px 24px;
          border-radius: 12px;
          border: none;
          cursor: pointer;
          transition: all 0.2s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
        }

        .bbg-btn-primary:hover {
          background-color: #006647;
        }

        /* Banner Carousel Slider */
        .bbg-promo-banner {
          border-radius: 24px;
          padding: 40px;
          color: #ffffff;
          position: relative;
          overflow: hidden;
          margin-bottom: 32px;
          box-shadow: 0 10px 30px rgba(0, 128, 90, 0.15);
          transition: all 0.5s ease;
        }

        /* Toast Popup Alerts */
        .bbg-toast {
          position: fixed;
          top: 32px;
          left: 50%;
          transform: translateX(-50%);
          background-color: #0f172a;
          color: #ffffff;
          font-size: 12px;
          font-weight: 700;
          padding: 12px 24px;
          border-radius: 40px;
          box-shadow: 0 10px 25px rgba(0,0,0,0.15);
          display: flex;
          align-items: center;
          gap: 10px;
          z-index: 100;
          border: 1px solid #1e293b;
        }

        /* Timeline and Interactive Map */
        .bbg-map-mock {
          background-color: #0f172a;
          border-radius: 20px;
          height: 200px;
          position: relative;
          overflow: hidden;
          margin-bottom: 20px;
        }

        .bbg-map-dot {
          position: absolute;
          width: 12px;
          height: 12px;
          border-radius: 50%;
          background-color: #FF5A36;
          box-shadow: 0 0 12px #FF5A36;
        }

        /* Custom Modal Drawer for Backend Admin */
        .bbg-drawer-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-color: rgba(15, 23, 42, 0.6);
          backdrop-filter: blur(4px);
          display: flex;
          justify-content: flex-end;
          z-index: 100;
        }

        .bbg-drawer-content {
          width: 550px;
          max-width: 100%;
          background-color: #ffffff;
          height: 100vh;
          box-shadow: -10px 0 30px rgba(0, 0, 0, 0.15);
          display: flex;
          flex-direction: column;
          animation: slideInRight 0.3s ease-out;
          overflow-y: auto;
        }

        @keyframes slideInRight {
          from { transform: translateX(100%); }
          to { transform: translateX(0); }
        }

        /* Responsive Breakpoints */
        @media (max-width: 968px) {
          .bbg-dashboard-wrapper {
            flex-direction: column;
          }
          .bbg-sidebar {
            width: 100%;
            min-height: auto;
            padding: 16px;
            position: relative;
          }
          .bbg-menu-list {
            flex-direction: row;
            overflow-x: auto;
            padding-bottom: 8px;
          }
          .bbg-menu-item {
            white-space: nowrap;
            width: auto;
          }
          .bbg-topbar {
            padding: 16px 20px;
          }
          .bbg-content {
            padding: 20px;
          }
        }
      `}</style>

      {/* FLOATING TOAST NOTIFICATIONS */}
      {toastMessage && (
        <div className="bbg-toast">
          <span style={{ width: '8px', height: '8px', backgroundColor: '#F2C335', borderRadius: '50%' }}></span>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* ==========================================
          SIDEBAR NAVIGATION (LEFT NAV PANEL)
          ========================================== */}
      <aside className="bbg-sidebar">
        <div className="bbg-brand-logo">
          <span>🏗️</span> BahanBangun<span>Go</span>
        </div>
        
        {/* Navigasi Berdasarkan Menu - Dinonaktifkan Bagian Belanja untuk Admin Backend */}
        <div className="bbg-menu-list">
          <button 
            onClick={() => { setActiveTab('dashboard'); triggerToast('Membuka Dasbor Utama'); }} 
            className={`bbg-menu-item ${activeTab === 'dashboard' ? 'active' : ''}`}
          >
            📊 Dasbor Analitik
          </button>
          
          {/* Menu Belanja HANYA Tampil jika Peran adalah KONSUMEN (Customer) */}
          {role === 'customer' && (
            <>
              <button 
                onClick={() => { setActiveTab('browse'); triggerToast('Membuka Katalog Material'); }} 
                className={`bbg-menu-item ${activeTab === 'browse' ? 'active' : ''}`}
              >
                🧱 Jelajah Material
              </button>
              
              <button 
                onClick={() => { setActiveTab('cart'); triggerToast('Membuka Keranjang Belanja'); }} 
                className={`bbg-menu-item ${activeTab === 'cart' ? 'active' : ''}`}
              >
                🛒 Keranjang Belanja ({cart.reduce((sum, item) => sum + item.quantity, 0)})
              </button>
            </>
          )}

          <button 
            onClick={() => { setActiveTab('orders'); triggerToast('Membuka Log Kerja Pengiriman'); }} 
            className={`bbg-menu-item ${activeTab === 'orders' ? 'active' : ''}`}
          >
            📦 Lacak & Atur Order
          </button>

          <button 
            onClick={() => { setActiveTab('chat'); triggerToast('Membuka Chat Koordinator'); }} 
            className={`bbg-menu-item ${activeTab === 'chat' ? 'active' : ''}`}
          >
            💬 Chat Koordinator
          </button>
        </div>

        <div style={{ marginTop: 'auto', borderTop: '1px solid #1e293b', paddingTop: '20px' }}>
          <p style={{ fontSize: '11px', color: '#64748b', fontWeight: '700', textTransform: 'uppercase' }}>
            System Standard v4.3
          </p>
        </div>
      </aside>

      {/* ==========================================
          MAIN CONTENT VIEW AREA
          ========================================== */}
      <main className="bbg-main-area">
        
        {/* TOP BAR / NAVIGATION HEADER */}
        <header className="bbg-topbar">
          <div>
            <h2 style={{ fontSize: '18px', fontWeight: '700', margin: 0 }}>Portal Logistik Bahan Bangunan & Kargo Curah</h2>
            <p style={{ fontSize: '12px', color: '#64748b', margin: '4px 0 0 0' }}>Integrasi Admin, Toko Mitra, Konsumen, & Kurir</p>
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            {/* Custom Login Switcher */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '12px', fontWeight: '700', color: '#64748b' }}>Simulasi Peran:</span>
              <select 
                value={role} 
                onChange={(e) => {
                  setRole(e.target.value);
                  triggerToast(`Berganti Peran Ke: ${e.target.value.toUpperCase()}`);
                }}
                className="bbg-role-dropdown"
              >
                <option value="customer">👤 Konsumen (Customer)</option>
                <option value="admin">🛡️ Admin Hub (Broker)</option>
                <option value="merchant">🏪 Toko Mitra (Supplier)</option>
                <option value="driver">🚛 Kurir / Driver (Courier)</option>
              </select>
            </div>
          </div>
        </header>

        {/* BODY CONTENT BOX */}
        <div className="bbg-content">
          
          {/* STATS MATRIX CARDS */}
          <section className="bbg-stats-grid">
            <div className="bbg-stat-card">
              <span style={{ fontSize: '11px', fontWeight: '700', color: '#64748b', textTransform: 'uppercase' }}>Total Pengiriman</span>
              <span className="bbg-stat-value">{orders.length} Muatan</span>
              <span style={{ fontSize: '11px', fontWeight: '700', color: '#00805a' }}>🟢 Terdata di Cloud</span>
            </div>
            <div className="bbg-stat-card">
              <span style={{ fontSize: '11px', fontWeight: '700', color: '#64748b', textTransform: 'uppercase' }}>Tonase Logistik</span>
              <span className="bbg-stat-value">{(orders.reduce((acc, o) => acc + o.totalWeight, 0)).toLocaleString('id-ID')} Kg</span>
              <span style={{ fontSize: '11px', fontWeight: '700', color: '#00805a' }}>⚖️ Aman Dari ODOL</span>
            </div>
            <div className="bbg-stat-card">
              <span style={{ fontSize: '11px', fontWeight: '700', color: '#64748b', textTransform: 'uppercase' }}>Escrow Terkunci</span>
              <span className="bbg-stat-value">Rp {(orders.reduce((acc, o) => acc + o.grandTotal, 0)).toLocaleString('id-ID')}</span>
              <span style={{ fontSize: '11px', fontWeight: '700', color: '#0ea5e9' }}>🔒 Jaminan Keamanan</span>
            </div>
          </section>

          {/* =======================================================
              TAB 1: ANALYTICS DASHBOARD Overview
              ======================================================= */}
          {activeTab === 'dashboard' && (
            <div style={{ animation: 'fadeIn 0.4s ease' }}>
              
              {/* Promo Image Slide Banner */}
              <div className="bbg-promo-banner" style={{ background: SLIDER_PHOTOS[currentSlide].bgGradient }}>
                <span style={{ backgroundColor: '#F2C335', color: '#0f172a', fontSize: '10px', fontWeight: '800', padding: '4px 10px', borderRadius: '20px', letterSpacing: '0.05em' }}>CARGO PREMIUM B2B</span>
                <h1 style={{ fontSize: '32px', fontWeight: '800', margin: '12px 0 8px 0', lineHeight: '1.2' }}>{SLIDER_PHOTOS[currentSlide].title}</h1>
                <p style={{ fontSize: '14px', color: '#e2e8f0', margin: '0 0 24px 0', maxWidth: '600px' }}>{SLIDER_PHOTOS[currentSlide].desc}</p>
                {role === 'customer' ? (
                  <button onClick={() => { setActiveTab('browse'); }} className="bbg-btn-primary" style={{ backgroundColor: '#F2C335', color: '#0f172a' }}>
                    🧱 Jelajah & Belanja Sekarang
                  </button>
                ) : (
                  <button onClick={() => { setActiveTab('orders'); }} className="bbg-btn-primary" style={{ backgroundColor: '#ffffff', color: '#0f172a' }}>
                    📦 Kelola Log Kerja & Pengiriman
                  </button>
                )}
              </div>

              {/* Dynamic Notification Hub */}
              <div className="bbg-interactive-card">
                <h3 style={{ margin: '0 0 16px 0', fontSize: '16px', fontWeight: '700' }}>🔔 Live Status & Logs Notifikasi</h3>
                <div style={{ maxHeight: '150px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {notifications.map(n => (
                    <div key={n.id} style={{ padding: '12px 16px', backgroundColor: '#f1f5f9', borderLeft: '4px solid #00805a', borderRadius: '6px', fontSize: '13px' }}>
                      {n.text}
                    </div>
                  ))}
                </div>
              </div>

              {/* Tools Monitoring Backend Tambahan untuk Peran Admin */}
              {role === 'admin' && (
                <div className="bbg-interactive-card" style={{ borderLeft: '6px solid #1e88e5' }}>
                  <h3 style={{ margin: '0 0 8px 0', fontSize: '16px', fontWeight: '700', color: '#1e88e5' }}>🛡️ Admin System Settings Console</h3>
                  <p style={{ fontSize: '13px', color: '#64748b', marginBottom: '16px' }}>Konfigurasi margin keselamatan ODOL nasional serta penyesuaian tarif flat tol.</p>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
                    <div>
                      <label style={{ fontSize: '11px', fontWeight: '700', color: '#64748b', display: 'block', marginBottom: '6px' }}>Toleransi Keselamatan ODOL (%)</label>
                      <input 
                        type="number" 
                        value={systemSafetyMargin} 
                        onChange={(e) => setSystemSafetyMargin(parseInt(e.target.value) || 0)} 
                        className="bbg-form-control" 
                      />
                    </div>
                    <div>
                      <label style={{ fontSize: '11px', fontWeight: '700', color: '#64748b', display: 'block', marginBottom: '6px' }}>Driver Aktif Siaga (Cloud)</label>
                      <div style={{ padding: '12px', backgroundColor: '#f1f5f9', borderRadius: '12px', fontSize: '12px', fontWeight: '600' }}>
                        🟢 3 Driver Online di Jabodetabek
                      </div>
                    </div>
                  </div>
                </div>
              )}

            </div>
          )}

          {/* =======================================================
              TAB 2: MATERIAL BROWSER (CUSTOMER ONLY)
              ======================================================= */}
          {activeTab === 'browse' && role === 'customer' && (
            <div className="bbg-interactive-card" style={{ animation: 'fadeIn 0.4s ease' }}>
              <div style={{ borderBottom: '1px solid #e2e8f0', paddingBottom: '16px', marginBottom: '24px' }}>
                <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '700' }}>🧱 Katalog Pengapalan Material Konstruksi</h3>
                <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: '#64748b' }}>Bahan bermutu tinggi, terhitung berat-volumenya secara otomatis.</p>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px' }}>
                {products.map(p => (
                  <div key={p.id} style={{ border: '1px solid #e2e8f0', borderRadius: '20px', padding: '24px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '32px' }}>{p.image}</span>
                        <span style={{ backgroundColor: '#f1f5f9', fontSize: '11px', fontWeight: '700', padding: '4px 8px', borderRadius: '6px' }}>{p.category}</span>
                      </div>
                      <h4 style={{ margin: '16px 0 8px 0', fontSize: '16px', fontWeight: '700' }}>{p.name}</h4>
                      <div style={{ fontSize: '13px', color: '#64748b', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <span>⚖️ Berat: <b>{p.weight} Kg/{p.unit}</b></span>
                        <span>📐 Volume: <b>{p.volume} m³</b></span>
                        <span>📦 Stok Gudang: <b>{p.stock} {p.unit}</b></span>
                      </div>
                    </div>

                    <div style={{ borderTop: '1px solid #f1f5f9', marginTop: '16px', paddingTop: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '16px', fontWeight: '800', color: '#0f172a' }}>Rp {p.price.toLocaleString('id-ID')}</span>
                      <button 
                        onClick={() => addToCart(p)} 
                        className="bbg-btn-primary" 
                        style={{ padding: '8px 16px', fontSize: '12px' }}
                      >
                        + Keranjang
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* =======================================================
              TAB 3: KERANJANG BELANJA & CHECKOUT LOGISTICS (CUSTOMER ONLY)
              ======================================================= */}
          {activeTab === 'cart' && role === 'customer' && (
            <div className="bbg-interactive-card" style={{ animation: 'fadeIn 0.4s ease' }}>
              <h3 style={{ margin: '0 0 24px 0', fontSize: '18px', fontWeight: '700' }}>🛒 Keranjang Belanja Logistik</h3>
              
              {cart.length === 0 ? (
                <div style={{ padding: '48px 24px', textAlign: 'center', color: '#64748b' }}>
                  <span style={{ fontSize: '48px', display: 'block', marginBottom: '16px' }}>🛒</span>
                  <p style={{ margin: 0, fontWeight: '600' }}>Keranjang belanja Anda kosong.</p>
                  <button onClick={() => setActiveTab('browse')} className="bbg-btn-primary" style={{ margin: '16px auto 0 auto' }}>Belanja Sekarang</button>
                </div>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '32px' }}>
                  
                  {/* Item List */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <div style={{ borderBottom: '1px solid #e2e8f0', paddingBottom: '12px' }}>
                      <h4 style={{ margin: 0, fontSize: '14px', fontWeight: '700', color: '#64748b', textTransform: 'uppercase' }}>Daftar Muatan Anda</h4>
                    </div>
                    {cart.map(item => (
                      <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px', border: '1px solid #e2e8f0', borderRadius: '16px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <span style={{ fontSize: '24px' }}>{item.image}</span>
                          <div>
                            <h5 style={{ margin: 0, fontSize: '14px', fontWeight: '700' }}>{item.name}</h5>
                            <p style={{ margin: 0, fontSize: '12px', color: '#64748b' }}>Rp {item.price.toLocaleString('id-ID')}</p>
                          </div>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <button onClick={() => updateCartQty(item.id, item.quantity - 1)} style={{ padding: '4px 8px', borderRadius: '4px', border: '1px solid #cbd5e1', cursor: 'pointer' }}>-</button>
                          <span style={{ fontSize: '14px', fontWeight: '700' }}>{item.quantity}</span>
                          <button onClick={() => updateCartQty(item.id, item.quantity + 1)} style={{ padding: '4px 8px', borderRadius: '4px', border: '1px solid #cbd5e1', cursor: 'pointer' }}>+</button>
                        </div>
                      </div>
                    ))}

                    {/* Shipping Coordinates Setup */}
                    <div style={{ marginTop: '24px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      <div>
                        <label style={{ fontSize: '11px', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', display: 'block', marginBottom: '6px' }}>Alamat Drop-Off Proyek</label>
                        <input 
                          type="text" 
                          value={shippingAddress} 
                          onChange={(e) => setShippingAddress(e.target.value)} 
                          className="bbg-form-control" 
                        />
                      </div>

                      {/* Map Coordinate Mock Simulator */}
                      <div style={{ padding: '16px', backgroundColor: '#f8fafc', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
                        <span style={{ fontSize: '11px', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', display: 'block', marginBottom: '8px' }}>Simulasi Koordinat GPS Peta</span>
                        <div style={{ height: '100px', backgroundColor: '#0f172a', borderRadius: '12px', position: 'relative' }}>
                          <div style={{ position: 'absolute', top: '20px', left: '30px', color: '#ffffff', fontSize: '10px' }}>🏪 Depot A</div>
                          <div style={{ position: 'absolute', bottom: '20px', right: '40px', color: '#ffffff', fontSize: '10px' }}>📍 Proyek Anda</div>
                          <div style={{ position: 'absolute', top: '50px', left: '150px', color: '#FF5A36', fontSize: '12px', fontWeight: '700' }}>Rute: {activeDistance} Km</div>
                        </div>
                        <div style={{ display: 'flex', gap: '8px', marginTop: '10px' }}>
                          <button onClick={() => { setCustomerLat(-6.205); setCustomerLng(106.815); }} style={{ fontSize: '10px', padding: '4px 8px', cursor: 'pointer' }}>Set Utara</button>
                          <button onClick={() => { setCustomerLat(-6.230); setCustomerLng(106.850); }} style={{ fontSize: '10px', padding: '4px 8px', cursor: 'pointer' }}>Set Selatan</button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Summary & Checkout */}
                  <div style={{ backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '24px', padding: '32px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                    <div>
                      <h4 style={{ margin: '0 0 16px 0', fontSize: '14px', fontWeight: '700', color: '#64748b', textTransform: 'uppercase' }}>Rincian Biaya Muatan</h4>
                      
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '13px' }}>
                        <p style={{ display: 'flex', justifyContent: 'space-between' }}><span>Subtotal Semen/Pasir:</span> <b>Rp {cartTotalPrice.toLocaleString('id-ID')}</b></p>
                        <p style={{ display: 'flex', justifyContent: 'space-between' }}><span>Biaya Armada ({recommendedFleet.name}):</span> <b>Rp {rawDeliveryCost.toLocaleString('id-ID')}</b></p>
                        
                        {/* Addon checkboxes */}
                        <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                            <input type="checkbox" checked={selectedAddons.helper} onChange={(e) => setSelectedAddons({ ...selectedAddons, helper: e.target.checked })} style={{ accentColor: '#00805a' }} />
                            <span>Kuli Bongkar Muat (+Rp75.000/orang)</span>
                          </label>
                          {selectedAddons.helper && (
                            <input type="number" value={helperCount} onChange={(e) => setHelperCount(Math.max(1, parseInt(e.target.value) || 1))} style={{ width: '60px', marginLeft: '24px' }} className="bbg-form-control" />
                          )}
                          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                            <input type="checkbox" checked={selectedAddons.tol} onChange={(e) => setSelectedAddons({ ...selectedAddons, tol: e.target.checked })} />
                            <span>Biaya Jalan Tol (+Rp35.000)</span>
                          </label>
                          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                            <input type="checkbox" checked={selectedAddons.terpal} onChange={(e) => setSelectedAddons({ ...selectedAddons, terpal: e.target.checked })} />
                            <span>Penutup Terpal Hujan (+Rp20.000)</span>
                          </label>
                        </div>

                        <div style={{ borderTop: '1px solid #cbd5e1', paddingTop: '16px', display: 'flex', justifyContent: 'space-between', fontSize: '16px', fontWeight: '800' }}>
                          <span>Total Tagihan:</span>
                          <span style={{ color: '#00805a' }}>Rp {grandTotal.toLocaleString('id-ID')}</span>
                        </div>
                      </div>
                    </div>

                    <button onClick={handleCheckout} className="bbg-btn-primary" style={{ width: '100%', marginTop: '24px', padding: '16px' }}>
                      Kunci Pembayaran Escrow & Kirim Proyek 🔒
                    </button>
                  </div>

                </div>
              )}
            </div>
          )}

          {/* =======================================================
              TAB 4: MANAJEMEN LOGISTIK & TRACKING (SINKRON)
              ======================================================= */}
          {activeTab === 'orders' && (
            <div className="bbg-interactive-card" style={{ animation: 'fadeIn 0.4s ease' }}>
              <div style={{ borderBottom: '1px solid #e2e8f0', paddingBottom: '16px', marginBottom: '24px' }}>
                <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '700' }}>📦 Log Pengiriman BahanBangunGo</h3>
                <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: '#64748b' }}>
                  Aksi & detail di bawah ini akan berganti menyesuaikan peran login simulasi Anda saat ini.
                </p>
              </div>

              {orders.length === 0 ? (
                <p style={{ textAlign: 'center', color: '#64748b', margin: '32px 0' }}>Belum ada rincian logistik di sistem.</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                  {orders.map(order => (
                    <div key={order.id} style={{ border: '1px solid #cbd5e1', borderRadius: '24px', padding: '24px', backgroundColor: '#ffffff' }}>
                      
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', borderBottom: '1px solid #e2e8f0', paddingBottom: '16px', marginBottom: '16px' }}>
                        <div>
                          <span style={{ backgroundColor: '#0f172a', color: '#ffffff', padding: '4px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: '800' }}>{order.id}</span>
                          <span style={{ fontSize: '12px', color: '#64748b', marginLeft: '12px' }}>Tanggal: {order.date}</span>
                        </div>
                        <span style={{ backgroundColor: '#e0f2fe', color: '#0369a1', fontSize: '12px', fontWeight: '700', padding: '6px 12px', borderRadius: '8px' }}>
                          {order.status}
                        </span>
                      </div>

                      {/* Content details */}
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '24px' }}>
                        <div>
                          <h5 style={{ margin: '0 0 8px 0', fontSize: '13px', color: '#64748b', textTransform: 'uppercase' }}>Tujuan Drop-Off</h5>
                          <p style={{ margin: 0, fontSize: '14px', fontWeight: '700' }}>📍 {order.address}</p>
                          <p style={{ margin: '8px 0 0 0', fontSize: '13px', color: '#64748b' }}>Weight: {order.totalWeight} Kg | Volume: {order.totalVolume} m³</p>
                        </div>

                        <div>
                          <h5 style={{ margin: '0 0 8px 0', fontSize: '13px', color: '#64748b', textTransform: 'uppercase' }}>Layanan Pendukung</h5>
                          <p style={{ margin: 0, fontSize: '13px' }}>Kurir: <b>{order.driverName || 'Belum Ditugaskan'}</b></p>
                          <p style={{ margin: '4px 0 0 0', fontSize: '13px' }}>Nominal: <b>Rp {order.grandTotal.toLocaleString('id-ID')}</b></p>
                        </div>
                      </div>

                      {/* =======================================================
                          DYNAMIC ACTIONS BY CURRENT ROLE
                          ======================================================= */}
                      <div style={{ borderTop: '1px solid #e2e8f0', marginTop: '20px', paddingTop: '16px', display: 'flex', flexWrap: 'wrap', gap: '12px', justifyContent: 'flex-end' }}>
                        
                        {/* 1. ADMIN BACKEND ACTIONS - DETAIL INSPECTION DRAWER */}
                        {role === 'admin' && (
                          <button 
                            onClick={() => {
                              setSelectedAdminOrder(order);
                              setAdminSelectedMerchant(order.merchantId || 'm1');
                              setAdminSelectedDriver(order.driverName || 'Pak Rudi (Armada Truk Engkel CDE)');
                              triggerToast('Membuka Panel Detail Pengapalan...');
                            }} 
                            className="bbg-btn-primary"
                            style={{ backgroundColor: '#1e88e5' }}
                          >
                            🛡️ Kelola & Dispatch Detail
                          </button>
                        )}

                        {/* 2. MITRA TOKO ACTIONS */}
                        {role === 'merchant' && order.status === 'Disiapkan oleh Toko' && (
                          <button onClick={() => handleMerchantReady(order.id)} className="bbg-btn-primary">
                            🏪 Kemas Material & Panggil Driver
                          </button>
                        )}

                        {/* 3. KURIR / DRIVER ACTION CANVAS */}
                        {role === 'driver' && order.status === 'Dalam Perjalanan' && (
                          <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '16px', backgroundColor: '#f8fafc', padding: '16px', borderRadius: '16px' }}>
                            <h5 style={{ margin: 0, fontSize: '13px', fontWeight: '700' }}>✍️ Serah Terima PoD Kurir</h5>
                            
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
                              
                              {/* Photo capture simulation */}
                              <div style={{ border: '1px dashed #cbd5e1', borderRadius: '12px', padding: '16px', textAlign: 'center', backgroundColor: '#ffffff' }}>
                                {podPhoto ? (
                                  <div>
                                    <img src={podPhoto} alt="PoD" style={{ width: '100%', maxHeight: '100px', objectFit: 'cover', borderRadius: '8px' }} />
                                    <button onClick={() => setPodPhoto(null)} style={{ border: 'none', background: 'none', color: '#ef4444', fontSize: '11px', fontWeight: '700', cursor: 'pointer', marginTop: '8px' }}>Hapus Foto</button>
                                  </div>
                                ) : (
                                  <button onClick={() => setPodPhoto('https://images.unsplash.com/photo-1590069261209-f8e9b8642343?auto=format&fit=crop&w=600&q=80')} style={{ cursor: 'pointer', border: 'none', background: 'none', fontSize: '12px', fontWeight: '700', color: '#00805a' }}>📷 Ambil Foto Material</button>
                                )}
                              </div>

                              {/* Signature Canvas Pad */}
                              <div style={{ border: '1px solid #cbd5e1', borderRadius: '12px', padding: '12px', backgroundColor: '#ffffff' }}>
                                <canvas
                                  ref={canvasRef}
                                  onMouseDown={startDrawing}
                                  onMouseMove={draw}
                                  onMouseUp={() => setIsDrawing(false)}
                                  onTouchStart={startDrawing}
                                  onTouchMove={draw}
                                  onTouchEnd={() => setIsDrawing(false)}
                                  style={{ width: '100%', height: '80px', border: '1px solid #e2e8f0', borderRadius: '6px', cursor: 'crosshair', display: 'block' }}
                                />
                                {signatureSaved && <div style={{ fontSize: '10px', color: '#00805a', fontWeight: '700', marginTop: '4px' }}>✓ Tanda tangan tersimpan</div>}
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '4px' }}>
                                  <button onClick={clearSignature} style={{ border: 'none', background: 'none', color: '#ef4444', fontSize: '10px', cursor: 'pointer' }}>Clear</button>
                                  <button onClick={saveSignature} style={{ border: 'none', background: 'none', color: '#00805a', fontSize: '10px', cursor: 'pointer' }}>Lock TTD</button>
                                </div>
                              </div>

                            </div>

                            <button 
                              onClick={() => handleDriverDeliver(order.id)} 
                              disabled={!podPhoto || !signatureSaved}
                              className="bbg-btn-primary" 
                              style={{ width: 'fit-content', alignSelf: 'flex-end', opacity: (podPhoto && signatureSaved) ? 1 : 0.5 }}
                            >
                              Selesaikan Antaran & Cairkan Dana Escrow ✔️
                            </button>
                          </div>
                        )}

                        {/* Default Info */}
                        {order.status === 'Selesai' && (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#00805a', fontSize: '13px', fontWeight: '700' }}>
                            <span>✓ Pengiriman Sukses</span>
                            <span>🔒 Dana Dilepas</span>
                          </div>
                        )}

                      </div>

                    </div>
                  ))}
                </div>
              )}

            </div>
          )}

          {/* =======================================================
              TAB 5: KOORDINATOR CHAT (DYNAMICS)
              ======================================================= */}
          {activeTab === 'chat' && (
            <div className="bbg-interactive-card" style={{ animation: 'fadeIn 0.4s ease', maxWidth: '600px', margin: '0 auto' }}>
              <div style={{ borderBottom: '1px solid #e2e8f0', paddingBottom: '16px', marginBottom: '16px' }}>
                <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '700' }}>💬 Chat Koordinasi Hub</h3>
                <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: '#64748b' }}>Peran Anda saat ini: <b style={{ textTransform: 'uppercase' }}>{role}</b></p>
              </div>

              {/* Msg Box */}
              <div style={{ height: '240px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '12px', padding: '10px', backgroundColor: '#f8fafc', borderRadius: '16px' }}>
                {chats.map(chat => (
                  <div key={chat.id} style={{ alignSelf: chat.sender === role ? 'flex-end' : 'flex-start', maxWidth: '80%' }}>
                    <span style={{ fontSize: '10px', color: '#64748b', display: 'block', textTransform: 'uppercase', marginBottom: '2px', textAlign: chat.sender === role ? 'right' : 'left' }}>{chat.sender}</span>
                    <div style={{ padding: '12px 16px', borderRadius: '16px', fontSize: '13px', backgroundColor: chat.sender === role ? '#00805a' : '#ffffff', color: chat.sender === role ? '#ffffff' : '#1e293b', border: chat.sender === role ? 'none' : '1px solid #cbd5e1' }}>
                      {chat.text}
                    </div>
                  </div>
                ))}
              </div>

              {/* Chat Send */}
              <div style={{ display: 'flex', gap: '12px', marginTop: '16px' }}>
                <input 
                  type="text" 
                  value={newMsg} 
                  onChange={(e) => setNewMsg(e.target.value)} 
                  onKeyDown={(e) => e.key === 'Enter' && handleSendChat()}
                  placeholder="Tulis balasan koordinasi..." 
                  className="bbg-form-control" 
                />
                <button onClick={handleSendChat} className="bbg-btn-primary">Kirim</button>
              </div>
            </div>
          )}

        </div>

        {/* =======================================================
            🛡️ BACKEND ADMIN DETAILED DISPATCH DRAWER (MODAL OVERLAY)
            ======================================================= */}
        {role === 'admin' && selectedAdminOrder && (
          <div className="bbg-drawer-overlay" onClick={() => setSelectedAdminOrder(null)}>
            <div className="bbg-drawer-content" onClick={(e) => e.stopPropagation()}>
              
              {/* Header Drawer */}
              <div style={{ padding: '24px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#0f172a', color: '#ffffff' }}>
                <div>
                  <span style={{ fontSize: '11px', fontWeight: '800', backgroundColor: '#1e88e5', padding: '4px 8px', borderRadius: '6px' }}>COMMAND CENTER</span>
                  <h3 style={{ margin: '6px 0 0 0', fontSize: '18px', fontWeight: '700' }}>Detail Pengapalan {selectedAdminOrder.id}</h3>
                </div>
                <button 
                  onClick={() => setSelectedAdminOrder(null)} 
                  style={{ background: 'none', border: 'none', color: '#ffffff', fontSize: '24px', cursor: 'pointer', fontWeight: 'bold' }}
                >
                  ✕
                </button>
              </div>

              {/* Body Drawer */}
              <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '24px', flexGrow: 1 }}>
                
                {/* Section 1: Itemized Freight & Specifications */}
                <div>
                  <h4 style={{ margin: '0 0 12px 0', fontSize: '13px', textTransform: 'uppercase', color: '#64748b' }}>📦 Daftar Muatan Fisik</h4>
                  <div style={{ backgroundColor: '#f8fafc', borderRadius: '16px', padding: '16px', border: '1px solid #e2e8f0' }}>
                    {selectedAdminOrder.items.map((item, idx) => (
                      <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '8px', marginBottom: '8px', borderBottom: '1px solid #e2e8f0' }}>
                        <div>
                          <p style={{ margin: 0, fontSize: '13px', fontWeight: '700' }}>{item.name}</p>
                          <p style={{ margin: 0, fontSize: '11px', color: '#64748b' }}>{item.weight} Kg/{item.unit} | {item.volume} m³</p>
                        </div>
                        <span style={{ fontWeight: '700', fontSize: '13px' }}>{item.quantity} {item.unit}</span>
                      </div>
                    ))}
                    <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '8px', fontSize: '12px', fontWeight: '700' }}>
                      <span>Kumulatif Fisik:</span>
                      <span>⚖️ {selectedAdminOrder.totalWeight} Kg | 📐 {selectedAdminOrder.totalVolume.toFixed(3)} m³</span>
                    </div>
                  </div>
                </div>

                {/* Section 2: Audit Keamanan Anti-ODOL */}
                <div>
                  <h4 style={{ margin: '0 0 12px 0', fontSize: '13px', textTransform: 'uppercase', color: '#64748b' }}>⚖️ Analisis Batas Jalan (Anti-ODOL)</h4>
                  {selectedAdminOrder.totalWeight > 1500 ? (
                    <div style={{ padding: '16px', backgroundColor: '#fef2f2', borderLeft: '5px solid #ef4444', borderRadius: '12px', fontSize: '12px', color: '#991b1b' }}>
                      <p style={{ margin: '0 0 4px 0', fontWeight: '800' }}>⚠️ PERINGATAN ODOL (OVER-LOADING)</p>
                      Berat kargo melampaui ambang batas aman Mobil Pick-Up. <b>Wajib dialokasikan menggunakan Truk Engkel CDE atau Truk Double CDD!</b>
                    </div>
                  ) : (
                    <div style={{ padding: '16px', backgroundColor: '#f0fdf4', borderLeft: '5px solid #22c55e', borderRadius: '12px', fontSize: '12px', color: '#166534' }}>
                      <p style={{ margin: '0 0 4px 0', fontWeight: '800' }}>🟢 AMAN SEHAT JALAN RAYA</p>
                      Muatan fisik kargo berada di bawah toleransi ambang batas ODOL nasional.
                    </div>
                  )}
                </div>

                {/* Section 3: Proximity Warehouse Matcher */}
                <div>
                  <h4 style={{ margin: '0 0 12px 0', fontSize: '13px', textTransform: 'uppercase', color: '#64748b' }}>🏪 Alokasi Toko Penyuplai & Proximity</h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <label style={{ fontSize: '11px', fontWeight: '700', color: '#64748b' }}>Pilih Gudang Toko Mitra terdekat:</label>
                    <select 
                      value={adminSelectedMerchant}
                      onChange={(e) => setAdminSelectedMerchant(e.target.value)}
                      className="bbg-form-control"
                    >
                      {merchants.map(m => (
                        <option key={m.id} value={m.id}>
                          {m.name} (Rating: {m.rating} ⭐)
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Section 4: Driver Fleet Assignment */}
                <div>
                  <h4 style={{ margin: '0 0 12px 0', fontSize: '13px', textTransform: 'uppercase', color: '#64748b' }}>🚛 Dispatch Driver & Armada</h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <label style={{ fontSize: '11px', fontWeight: '700', color: '#64748b' }}>Tugaskan armada siaga:</label>
                    <select 
                      value={adminSelectedDriver}
                      onChange={(e) => setAdminSelectedDriver(e.target.value)}
                      className="bbg-form-control"
                    >
                      <option value="Pak Rudi (Armada Truk Engkel CDE)">Pak Rudi (Truk Engkel CDE - Maks 3 Ton)</option>
                      <option value="Pak Budi (Armada Mobil Pick-Up)">Pak Budi (Mobil Pick-Up - Maks 1.5 Ton)</option>
                      <option value="Pak Doni (Armada Truk Double CDD)">Pak Doni (Truk Double CDD - Maks 7 Ton)</option>
                    </select>
                  </div>
                </div>

                {/* Section 5: Financial Auditing */}
                <div>
                  <h4 style={{ margin: '0 0 12px 0', fontSize: '13px', textTransform: 'uppercase', color: '#64748b' }}>🛡️ Audit Audit Keuangan Escrow</h4>
                  <div style={{ backgroundColor: '#f1f5f9', borderRadius: '12px', padding: '16px', fontSize: '12px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                      <span>Subtotal Material:</span>
                      <b>Rp {selectedAdminOrder.subtotal.toLocaleString('id-ID')}</b>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                      <span>Biaya Pengantaran:</span>
                      <b>Rp {selectedAdminOrder.deliveryCost.toLocaleString('id-ID')}</b>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                      <span>Biaya Tambahan (Addons):</span>
                      <b>Rp {selectedAdminOrder.addonCost.toLocaleString('id-ID')}</b>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid #cbd5e1', paddingTop: '8px', fontWeight: '800' }}>
                      <span>Total Dana Dikunci:</span>
                      <span style={{ color: '#00805a' }}>Rp {selectedAdminOrder.grandTotal.toLocaleString('id-ID')}</span>
                    </div>
                  </div>
                </div>

              </div>

              {/* Footer Drawer Actions */}
              <div style={{ padding: '24px', borderTop: '1px solid #e2e8f0', backgroundColor: '#f8fafc', display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                <button 
                  onClick={() => setSelectedAdminOrder(null)} 
                  style={{ backgroundColor: '#cbd5e1', color: '#1e293b', border: 'none', padding: '12px 20px', borderRadius: '12px', cursor: 'pointer', fontWeight: '700', fontSize: '13px' }}
                >
                  Tutup Panel
                </button>
                {selectedAdminOrder.status === 'Menunggu Konfirmasi Admin' && (
                  <button 
                    onClick={() => handleAdminApproveAndDispatch(selectedAdminOrder.id)} 
                    className="bbg-btn-primary"
                  >
                    🛡️ Sahkan & Minta Toko Kemas
                  </button>
                )}
              </div>

            </div>
          </div>
        )}

        {/* FOOTER */}
        <footer style={{ backgroundColor: '#0f172a', color: '#94a3b8', padding: '24px 40px', fontSize: '12px', borderTop: '1px solid #1e293b', marginTop: 'auto', textAlign: 'center' }}>
          <p style={{ margin: 0 }}>© 2026 BahanBangunGo Cargo Portal. Hak Cipta Dilindungi Undang-Undang.</p>
        </footer>

      </main>

    </div>
  );
}