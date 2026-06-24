import React, { useState, useEffect, useRef } from 'react';

// Mock Database Awal sesuai Kebutuhan PRD
const INITIAL_DRIVERS = [
  { id: 'D01', name: 'Pak Budi Santoso', vehicle: 'Truk Engkel CDE', status: 'Active', online: true, wallet: 350000, lat: -6.210, lng: 106.820, idleTime: 0, docs: { SIM: 'Verified', STNK: 'Verified', KIR: 'Verified' } },
  { id: 'D02', name: 'Pak Rudi Hermawan', vehicle: 'Mobil Pick-Up L300', status: 'Active', online: true, wallet: 180000, lat: -6.225, lng: 106.840, idleTime: 75, docs: { SIM: 'Verified', STNK: 'Verified', KIR: 'Pending' } },
  { id: 'D03', name: 'Pak Doni Siregar', vehicle: 'Truk Double CDD', status: 'Inactive', online: false, wallet: 1200000, lat: -6.195, lng: 106.800, idleTime: 0, docs: { SIM: 'Verified', STNK: 'Expired', KIR: 'Verified' } },
];

const INITIAL_MERCHANTS = [
  { id: 'M101', name: 'PT. Semen Merah Putih TBK', creditLimit: 50000000, usedCredit: 12500000, topDays: 30, successfulCod: 98 },
  { id: 'M102', name: 'UD. Pasir Jaya Abadi', creditLimit: 20000000, usedCredit: 4500000, topDays: 14, successfulCod: 92 },
  { id: 'M103', name: 'Depo Besi Baja Sentosa', creditLimit: 100000000, usedCredit: 75000000, topDays: 45, successfulCod: 100 },
];

const INITIAL_ORDERS = [
  { id: 'GML-99120', sender: 'UD. Pasir Jaya Abadi', receiver: 'Andi Wijaya', address: 'Proyek Cluster Harmoni Blok C1, Jakarta', items: 'Pasir Cor Gunung (1.5 m³)', weight: 2100, volume: 1.5, status: 'In Transit', driverId: 'D02', paymentMethod: 'Invoice/TOP', deliveryType: 'Instant', price: 450000, anomaly: false, date: '2026-06-24', isInsurance: true },
  { id: 'GML-99121', sender: 'PT. Semen Merah Putih TBK', receiver: 'Toko Material Jaya', address: 'Jl. Margonda Raya No. 412, Depok', items: 'Semen Portland 40kg x 50 Sak', weight: 2000, volume: 1.4, status: 'Pending Admin', driverId: null, paymentMethod: 'Invoice/TOP', deliveryType: 'Scheduled', price: 380000, anomaly: false, date: '2026-06-25', isInsurance: true },
  { id: 'GML-99122', sender: 'Depo Besi Baja Sentosa', receiver: 'Kontraktor Mandiri', address: 'Flyover Kaligawe, Semarang', items: 'Besi Beton Ulir 12mm x 100 Batang', weight: 1050, volume: 0.4, status: 'Delivered', driverId: 'D01', paymentMethod: 'COD', deliveryType: 'Instant', price: 820000, anomaly: false, date: '2026-06-23', isInsurance: false, rating: 5, pod: { photo: 'https://images.unsplash.com/photo-1590069261209-f8e9b8642343?auto=format&fit=crop&w=300&q=80', coords: '-6.214, 106.825', signature: 'SIGNED_OK' } }
];

export default function App() {
  const [role, setRole] = useState('admin'); // admin | merchant | driver | customer
  const [orders, setOrders] = useState(INITIAL_ORDERS);
  const [drivers, setDrivers] = useState(INITIAL_DRIVERS);
  const [merchants, setMerchants] = useState(INITIAL_MERCHANTS);
  const [tickets, setTickets] = useState([
    { id: 'TCK-01', orderId: 'GML-99120', subject: 'Keterlambatan Armada L300', status: 'Open', message: 'Armada berhenti di titik macet parah selama 45 menit.' }
  ]);

  // Sub-tab Navigation
  const [adminTab, setAdminTab] = useState('fleet'); // fleet | pricing | map | finance | support
  const [merchantTab, setMerchantTab] = useState('bulk'); // bulk | label | billing | analytics
  const [driverTab, setDriverTab] = useState('manifest'); // manifest | nav | wallet | ar_calc
  const [customerTab, setCustomerTab] = useState('booking'); // booking | track | history

  // Notifications & Toast
  const [notifications, setNotifications] = useState([
    { id: 1, text: 'Sistem Siap: Selamat datang di Gudang Materials Logistik Platform.' }
  ]);
  const [toast, setToast] = useState(null);

  // States: Pricing Engine Calculator
  const [priceCalc, setPriceCalc] = useState({ distance: 15, weight: 1500, length: 120, width: 120, height: 120, addOnTol: false, addOnHelper: false });
  const [calculatedFare, setCalculatedFare] = useState(0);

  // States: Create Ticket
  const [newTicket, setNewTicket] = useState({ orderId: '', subject: '', message: '' });

  // States: Bulk Upload simulation
  const [bulkCsvText, setBulkCsvText] = useState("sender,receiver,address,items,weight,volume,paymentMethod\nPT. Semen Merah Putih,Rian,Jl. Melati 12,Semen 40kg x10 Sak,400,0.28,COD\nUD. Pasir Jaya,Beni,Jl. Raya Barat,Pasir 1m3,1400,1.0,Invoice/TOP");

  // States: Waybill Print view selection
  const [selectedWaybill, setSelectedWaybill] = useState(INITIAL_ORDERS[0]);

  // States: Driver Navigation Mock GPS Simulation
  const [driverGpsSim, setDriverGpsSim] = useState({ lat: -6.210, lng: 106.820, progress: 0 });

  // States: AR Verifier
  const [arVerifyResult, setArVerifyResult] = useState(null);
  const [isVerifyingAR, setIsVerifyingAR] = useState(false);

  // States: Digital Signature Pad for Driver
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [signatureSaved, setSignatureSaved] = useState(false);
  const [driverPodPhoto, setDriverPodPhoto] = useState(null);

  // States: Customer Booking Form
  const [bookingForm, setBookingForm] = useState({
    sender: 'UD. Pasir Jaya Abadi', receiverName: 'Diki Sanjaya', address: 'Jl. Pemuda No. 77, Bekasi',
    items: 'Semen Gresik 50kg x 30 Sak', weight: 1500, length: 100, width: 100, height: 100,
    deliveryType: 'Instant', scheduledDate: '', paymentMethod: 'COD', isInsurance: true
  });

  // Auto calculate pricing on calculator state changes
  useEffect(() => {
    const vol = (priceCalc.length * priceCalc.width * priceCalc.height) / 1000000; // m3
    let base = 50000; // Base minimal fare
    let distanceCost = priceCalc.distance * 6000;
    let weightCost = priceCalc.weight * 120; // Rp120 per KG
    let volCost = vol * 150000; // Rp150.000 per m3
    
    let total = base + distanceCost + Math.max(weightCost, volCost);
    if (priceCalc.addOnTol) total += 35000;
    if (priceCalc.addOnHelper) total += 75000;

    setCalculatedFare(Math.round(total));
  }, [priceCalc]);

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const addNotification = (text) => {
    setNotifications(prev => [{ id: Date.now(), text }, ...prev]);
  };

  const handleBulkUpload = () => {
    try {
      const lines = bulkCsvText.trim().split('\n');
      if (lines.length <= 1) return showToast('CSV Format Salah!');
      
      const newUploadedOrders = [];
      for (let i = 1; i < lines.length; i++) {
        const cols = lines[i].split(',');
        if (cols.length >= 7) {
          const orderId = 'GML-' + Math.floor(100000 + Math.random() * 900000);
          newUploadedOrders.push({
            id: orderId,
            sender: cols[0],
            receiver: cols[1],
            address: cols[2],
            items: cols[3],
            weight: parseFloat(cols[4]) || 100,
            volume: parseFloat(cols[5]) || 0.1,
            status: 'Pending Admin',
            driverId: null,
            paymentMethod: cols[6],
            deliveryType: 'Instant',
            price: Math.round(150000 + Math.random() * 300000),
            anomaly: false,
            date: '2026-06-24',
            isInsurance: true
          });
        }
      }

      setOrders(prev => [...newUploadedOrders, ...prev]);
      addNotification(`Berhasil upload massal ${newUploadedOrders.length} order dari Toko Mitra.`);
      showToast(`Sukses upload ${newUploadedOrders.length} order!`);
    } catch (e) {
      showToast('Gagal memproses CSV.');
    }
  };

  const runARVerifier = () => {
    setIsVerifyingAR(true);
    setArVerifyResult(null);
    setTimeout(() => {
      setIsVerifyingAR(false);
      const measuredWeight = Math.round(1450 + Math.random() * 100);
      setArVerifyResult({
        weight: measuredWeight,
        volume: 1.25,
        match: true,
        desc: 'Dimensi & bobot kargo 98% akurat dengan manifest digital.'
      });
      showToast('Kamera AR Selesai Memindai Muatan!');
    }, 2500);
  };

  const startDrawing = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    ctx.strokeStyle = '#1E88E5';
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX || (e.touches && e.touches[0].clientX)) - rect.left;
    const y = (e.clientY || (e.touches && e.touches[0].clientY)) - rect.top;
    ctx.beginPath();
    ctx.moveTo(x, y);
    setIsDrawing(true);
  };

  const draw = (e) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX || (e.touches && e.touches[0].clientX)) - rect.left;
    const y = (e.clientY || (e.touches && e.touches[0].clientY)) - rect.top;
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const saveSignature = () => {
    setSignatureSaved(true);
    showToast('Tanda Tangan Pelanggan Terkunci!');
  };

  const clearSignature = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      setSignatureSaved(false);
    }
  };

  const completeDriverOrder = (orderId) => {
    setOrders(prev => prev.map(o => {
      if (o.id === orderId) {
        return {
          ...o,
          status: 'Delivered',
          pod: {
            photo: driverPodPhoto || 'https://images.unsplash.com/photo-1590069261209-f8e9b8642343?auto=format&fit=crop&w=300&q=80',
            coords: '-6.214, 106.825',
            signature: 'SIGNED_OK'
          }
        };
      }
      return o;
    }));
    showToast('Manifest Selesai Dikirim! Dana Masuk ke Dompet Driver.');
    addNotification(`Pengiriman ${orderId} telah selesai dikonfirmasi oleh Kurir.`);
    setDriverPodPhoto(null);
    setSignatureSaved(false);
  };

  const handleCustomerBooking = (e) => {
    e.preventDefault();
    const orderId = 'GML-' + Math.floor(100000 + Math.random() * 900000);
    const newOrder = {
      id: orderId,
      sender: bookingForm.sender,
      receiver: bookingForm.receiverName,
      address: bookingForm.address,
      items: bookingForm.items,
      weight: parseFloat(bookingForm.weight),
      volume: (bookingForm.length * bookingForm.width * bookingForm.height) / 1000000,
      status: 'Pending Admin',
      driverId: null,
      paymentMethod: bookingForm.paymentMethod,
      deliveryType: bookingForm.deliveryType,
      price: calculatedFare,
      anomaly: false,
      date: bookingForm.scheduledDate || '2026-06-24',
      isInsurance: bookingForm.isInsurance
    };

    setOrders(prev => [newOrder, ...prev]);
    showToast('Order Terjadwal Berhasil Dikunci!');
    addNotification(`Konsumen membuat pesanan baru ${orderId}. Menunggu audit rute Admin.`);
    setCustomerTab('track');
  };

  const handleCreateTicket = (e) => {
    e.preventDefault();
    if (!newTicket.orderId || !newTicket.subject) return showToast('Lengkapi Data Tiket!');
    const ticketId = 'TCK-' + Math.floor(10 + Math.random() * 90);
    setTickets(prev => [...prev, { ...newTicket, id: ticketId, status: 'Open' }]);
    setNewTicket({ orderId: '', subject: '', message: '' });
    showToast('Tiket Klaim Kerusakan Terkirim ke Admin!');
  };

  return (
    <div className="gml-wrapper">
      
      {/* ==========================================
          EMBEDDED STYLE ENGINE (ANTI-UNSTYLED LAYOUT ON VERCEL)
          ========================================== */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Poppins:wght@600;700;800&family=Open+Sans:wght@400;600&display=swap');
        
        .gml-wrapper {
          font-family: 'Inter', sans-serif;
          background-color: #F3F4F6;
          color: #212121;
          min-height: 100vh;
          display: flex;
          overflow-x: hidden;
        }

        h1, h2, h3, h4 {
          font-family: 'Poppins', sans-serif;
        }

        /* Responsive Sidebar */
        .gml-sidebar {
          width: 280px;
          background-color: #212121;
          color: #FFFFFF;
          display: flex;
          flex-direction: column;
          padding: 24px;
          border-right: 1px solid #374151;
          min-height: 100vh;
          position: sticky;
          top: 0;
          z-index: 50;
        }

        .gml-brand {
          font-size: 20px;
          font-weight: 800;
          color: #FFFFFF;
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 32px;
        }

        .gml-brand span {
          color: #FDD835;
        }

        .gml-menu {
          display: flex;
          flex-direction: column;
          gap: 8px;
          flex-grow: 1;
        }

        .gml-menu-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px 16px;
          border-radius: 12px;
          color: #9CA3AF;
          font-weight: 600;
          font-size: 14px;
          background: none;
          border: none;
          text-align: left;
          cursor: pointer;
          transition: all 0.2s ease;
          width: 100%;
        }

        .gml-menu-item:hover, .gml-menu-item.active {
          color: #FFFFFF;
          background-color: #374151;
        }

        .gml-menu-item.active {
          background-color: #1E88E5;
          box-shadow: 0 4px 12px rgba(30, 136, 229, 0.3);
        }

        /* Top Bar Header */
        .gml-main-area {
          flex-grow: 1;
          display: flex;
          flex-direction: column;
          min-width: 0;
        }

        .gml-topbar {
          background-color: #FFFFFF;
          border-bottom: 1px solid #E5E7EB;
          padding: 16px 40px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          position: sticky;
          top: 0;
          z-index: 40;
        }

        .gml-role-dropdown {
          background-color: #F3F4F6;
          border: 1px solid #D1D5DB;
          font-weight: 700;
          padding: 8px 16px;
          border-radius: 10px;
          outline: none;
          cursor: pointer;
          color: #212121;
          font-size: 13px;
        }

        /* Layout Grid and Cards */
        .gml-content {
          padding: 40px;
          flex-grow: 1;
        }

        .gml-stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
          gap: 24px;
          margin-bottom: 32px;
        }

        .gml-stat-card {
          background-color: #FFFFFF;
          border-radius: 20px;
          padding: 24px;
          box-shadow: 0 4px 20px rgba(0,0,0,0.03);
          border: 1px solid #E5E7EB;
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .gml-stat-value {
          font-size: 26px;
          font-weight: 800;
          color: #212121;
        }

        .gml-interactive-card {
          background-color: #FFFFFF;
          border-radius: 24px;
          padding: 32px;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.03);
          border: 1px solid #E5E7EB;
          margin-bottom: 32px;
        }

        /* Interactive Forms & Controls */
        .gml-form-control {
          background-color: #F9FAFB;
          border: 1px solid #E5E7EB;
          border-radius: 12px;
          padding: 12px 16px;
          font-size: 13px;
          font-weight: 500;
          color: #212121;
          width: 100%;
          outline: none;
          box-sizing: border-box;
          transition: all 0.2s ease;
        }

        .gml-form-control:focus {
          border-color: #1E88E5;
          background-color: #FFFFFF;
        }

        .gml-btn-primary {
          background-color: #1E88E5;
          color: #FFFFFF;
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

        .gml-btn-primary:hover {
          background-color: #1565C0;
        }

        /* Toast Popup Alerts */
        .gml-toast {
          position: fixed;
          top: 32px;
          left: 50%;
          transform: translateX(-50%);
          background-color: #212121;
          color: #FFFFFF;
          font-size: 12px;
          font-weight: 700;
          padding: 12px 24px;
          border-radius: 40px;
          box-shadow: 0 10px 25px rgba(0,0,0,0.15);
          display: flex;
          align-items: center;
          gap: 10px;
          z-index: 100;
          border: 1px solid #374151;
        }

        /* Mobile Phone Frame for Driver Demo */
        .gml-phone-container {
          max-width: 380px;
          width: 100%;
          background-color: #000000;
          border-radius: 40px;
          padding: 12px;
          box-shadow: 0 20px 50px rgba(0,0,0,0.15);
          margin: 0 auto;
          border: 4px solid #374151;
        }

        .gml-phone-screen {
          background-color: #F3F4F6;
          border-radius: 32px;
          height: 580px;
          overflow-y: auto;
          display: flex;
          flex-direction: column;
          position: relative;
        }

        .gml-phone-header {
          background-color: #FFFFFF;
          padding: 16px;
          border-bottom: 1px solid #E5E7EB;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        /* Timeline and Interactive Map */
        .gml-map-mock {
          background-color: #1E293B;
          border-radius: 20px;
          height: 200px;
          position: relative;
          overflow: hidden;
          margin-bottom: 20px;
        }

        .gml-map-dot {
          position: absolute;
          width: 12px;
          height: 12px;
          border-radius: 50%;
          background-color: #FF5A36;
          box-shadow: 0 0 12px #FF5A36;
        }

        /* Responsive Breakpoints */
        @media (max-width: 968px) {
          .gml-wrapper {
            flex-direction: column;
          }
          .gml-sidebar {
            width: 100%;
            min-height: auto;
            padding: 16px;
            position: relative;
          }
          .gml-menu {
            flex-direction: row;
            overflow-x: auto;
            padding-bottom: 8px;
          }
          .gml-menu-item {
            white-space: nowrap;
            width: auto;
          }
          .gml-topbar {
            padding: 16px 20px;
          }
          .gml-content {
            padding: 20px;
          }
        }
      `}</style>

      {/* FLOATING TOAST NOTIFICATION */}
      {toast && (
        <div className="gml-toast">
          <span style={{ width: '8px', height: '8px', backgroundColor: '#FDD835', borderRadius: '50%' }}></span>
          <span>{toast}</span>
        </div>
      )}

      {/* ==========================================
          SIDEBAR NAVIGATION (LEFT NAV PANEL)
          ========================================== */}
      <aside className="gml-sidebar">
        <div className="gml-brand">
          <span>📦</span> Gudang Materials <span>Logistik</span>
        </div>
        
        {/* Dynamic Menu berdasarkan Peran / Role */}
        <div className="gml-menu">
          {/* 1. VIEW MENU: ADMIN OPERATIONAL */}
          {role === 'admin' && (
            <>
              <button onClick={() => setAdminTab('fleet')} className={`gml-menu-item ${adminTab === 'fleet' ? 'active' : ''}`}>
                🚚 Fleet Management
              </button>
              <button onClick={() => setAdminTab('pricing')} className={`gml-menu-item ${adminTab === 'pricing' ? 'active' : ''}`}>
                📊 Pricing Engine
              </button>
              <button onClick={() => setAdminTab('map')} className={`gml-menu-item ${adminTab === 'map' ? 'active' : ''}`}>
                🌐 Live Control Tower
              </button>
              <button onClick={() => setAdminTab('finance')} className={`gml-menu-item ${adminTab === 'finance' ? 'active' : ''}`}>
                💳 Finance & Billing
              </button>
              <button onClick={() => setAdminTab('support')} className={`gml-menu-item ${adminTab === 'support' ? 'active' : ''}`}>
                🎫 Customer Support {tickets.length > 0 && `(${tickets.length})`}
              </button>
            </>
          )}

          {/* 2. VIEW MENU: B2B MERCHANT */}
          {role === 'merchant' && (
            <>
              <button onClick={() => setMerchantTab('bulk')} className={`gml-menu-item ${merchantTab === 'bulk' ? 'active' : ''}`}>
                📥 Bulk CSV Orders
              </button>
              <button onClick={() => setMerchantTab('label')} className={`gml-menu-item ${merchantTab === 'label' ? 'active' : ''}`}>
                🏷️ Thermal A6 Waybill
              </button>
              <button onClick={() => setMerchantTab('billing')} className={`gml-menu-item ${merchantTab === 'billing' ? 'active' : ''}`}>
                💳 TOP Corporate Billing
              </button>
              <button onClick={() => setMerchantTab('analytics')} className={`gml-menu-item ${merchantTab === 'analytics' ? 'active' : ''}`}>
                📊 Analytics Dashboard
              </button>
            </>
          )}

          {/* 3. VIEW MENU: DRIVER MOBILE APP */}
          {role === 'driver' && (
            <>
              <button onClick={() => setDriverTab('manifest')} className={`gml-menu-item ${driverTab === 'manifest' ? 'active' : ''}`}>
                📋 Manifest Tugas
              </button>
              <button onClick={() => setDriverTab('nav')} className={`gml-menu-item ${driverTab === 'nav' ? 'active' : ''}`}>
                🧭 In-App Navigation
              </button>
              <button onClick={() => setDriverTab('ar_calc')} className={`gml-menu-item ${driverTab === 'ar_calc' ? 'active' : ''}`}>
                📏 AR Cargo Verifier
              </button>
              <button onClick={() => setDriverTab('wallet')} className={`gml-menu-item ${driverTab === 'wallet' ? 'active' : ''}`}>
                💰 Driver Wallet
              </button>
            </>
          )}

          {/* 4. VIEW MENU: END KONSUMEN */}
          {role === 'customer' && (
            <>
              <button onClick={() => setCustomerTab('booking')} className={`gml-menu-item ${customerTab === 'booking' ? 'active' : ''}`}>
                📅 Instant & Scheduled Booking
              </button>
              <button onClick={() => setCustomerTab('track')} className={`gml-menu-item ${customerTab === 'track' ? 'active' : ''}`}>
                📍 Real-Time Tracking & ETA
              </button>
              <button onClick={() => setCustomerTab('history')} className={`gml-menu-item ${customerTab === 'history' ? 'active' : ''}`}>
                📜 History & Reviews
              </button>
            </>
          )}
        </div>

        <div style={{ marginTop: 'auto', borderTop: '1px solid #374151', paddingTop: '20px' }}>
          <p style={{ fontSize: '11px', color: '#9CA3AF', fontWeight: '700', textTransform: 'uppercase' }}>
            System Version v4.2
          </p>
        </div>
      </aside>

      {/* ==========================================
          MAIN CONTENT VIEW AREA
          ========================================== */}
      <main className="gml-main-area">
        
        {/* TOP BAR / NAVIGATION HEADER */}
        <header className="gml-topbar">
          <div>
            <h2 style={{ fontSize: '18px', fontWeight: '700', margin: 0 }}>Portal Logistik Bahan Bangunan & Kargo Curah</h2>
            <p style={{ fontSize: '12px', color: '#6B7280', margin: '4px 0 0 0' }}>Integrasi Admin, Toko Mitra, Konsumen, & Kurir</p>
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            {/* Custom Login Switcher */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '12px', fontWeight: '700', color: '#6B7280' }}>Simulasi Peran:</span>
              <select 
                value={role} 
                onChange={(e) => {
                  setRole(e.target.value);
                  showToast(`Berganti Peran Ke: ${e.target.value.toUpperCase()}`);
                }}
                className="gml-role-dropdown"
              >
                <option value="admin">🛡️ Admin Hub (Broker)</option>
                <option value="merchant">🏪 Toko Mitra (B2B)</option>
                <option value="driver">🚛 Kurir / Driver (Mobile)</option>
                <option value="customer">👤 Konsumen Akhir (B2C)</option>
              </select>
            </div>
          </div>
        </header>

        {/* BODY CONTENT BOX */}
        <div className="gml-content">
          
          {/* STATS MATRIX CARDS */}
          <section className="gml-stats-grid">
            <div className="gml-stat-card">
              <span style={{ fontSize: '11px', fontWeight: '700', color: '#6B7280', textTransform: 'uppercase' }}>Total Pengiriman</span>
              <span className="gml-stat-value">{orders.length} Muatan</span>
              <span style={{ fontSize: '11px', fontWeight: '700', color: '#43A047' }}>🟢 Terdata di Cloud</span>
            </div>
            <div className="gml-stat-card">
              <span style={{ fontSize: '11px', fontWeight: '700', color: '#6B7280', textTransform: 'uppercase' }}>Tonase Logistik</span>
              <span className="gml-stat-value">{(orders.reduce((acc, o) => acc + o.weight, 0)).toLocaleString('id-ID')} Kg</span>
              <span style={{ fontSize: '11px', fontWeight: '700', color: '#43A047' }}>⚖️ Aman Dari ODOL</span>
            </div>
            <div className="gml-stat-card">
              <span style={{ fontSize: '11px', fontWeight: '700', color: '#6B7280', textTransform: 'uppercase' }}>Dana Escrow Terjamin</span>
              <span className="gml-stat-value">Rp {(orders.reduce((acc, o) => acc + o.price, 0)).toLocaleString('id-ID')}</span>
              <span style={{ fontSize: '11px', fontWeight: '700', color: '#1E88E5' }}>🔒 Jaminan Keamanan</span>
            </div>
          </section>

          {/* DYNAMIC VIEWPORTS PER ROLE & SUBTAB */}
          
          {/* =======================================================
              A. ADMIN VIEWPORTS
              ======================================================= */}
          {role === 'admin' && (
            <div style={{ animation: 'fadeIn 0.3s ease' }}>
              
              {/* Fleet Management Tab */}
              {adminTab === 'fleet' && (
                <div className="gml-interactive-card">
                  <h3 style={{ margin: '0 0 16px 0', fontSize: '16px', fontWeight: '700' }}>🚚 Fleet Management & Verifikasi Dokumen</h3>
                  <div className="overflow-x-auto">
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                      <thead>
                        <tr style={{ borderBottom: '2px solid #E5E7EB', color: '#6B7280', textAlign: 'left' }}>
                          <th style={{ padding: '12px' }}>Nama Driver</th>
                          <th style={{ padding: '12px' }}>Tipe Armada</th>
                          <th style={{ padding: '12px' }}>Status KIR</th>
                          <th style={{ padding: '12px' }}>Status Online</th>
                          <th style={{ padding: '12px', textAlign: 'right' }}>Aksi</th>
                        </tr>
                      </thead>
                      <tbody>
                        {drivers.map(d => (
                          <tr key={d.id} style={{ borderBottom: '1px solid #F3F4F6' }}>
                            <td style={{ padding: '12px', fontWeight: '700' }}>{d.name}</td>
                            <td style={{ padding: '12px' }}>{d.vehicle}</td>
                            <td style={{ padding: '12px' }}>
                              <span style={{
                                backgroundColor: d.docs.KIR === 'Verified' ? '#D1FAE5' : d.docs.KIR === 'Expired' ? '#FEE2E2' : '#FEF3C7',
                                color: d.docs.KIR === 'Verified' ? '#065F46' : d.docs.KIR === 'Expired' ? '#991B1B' : '#92400E',
                                padding: '4px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: '700'
                              }}>
                                {d.docs.KIR}
                              </span>
                            </td>
                            <td style={{ padding: '12px' }}>
                              <span style={{ color: d.online ? '#43A047' : '#9CA3AF', fontWeight: 'bold' }}>
                                {d.online ? '● Online' : '○ Offline'}
                              </span>
                            </td>
                            <td style={{ padding: '12px', textAlign: 'right' }}>
                              <button 
                                onClick={() => {
                                  setDrivers(drivers.map(item => item.id === d.id ? { ...item, docs: { ...item.docs, KIR: 'Verified' } } : item));
                                  showToast('Dokumen KIR Driver Berhasil Diverifikasi!');
                                }}
                                disabled={d.docs.KIR === 'Verified'}
                                className="gml-btn-primary" 
                                style={{ padding: '6px 12px', display: 'inline-flex', fontSize: '11px' }}
                              >
                                {d.docs.KIR === 'Verified' ? '✓ Clear' : 'Verifikasi'}
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Pricing Engine Tab */}
              {adminTab === 'pricing' && (
                <div className="gml-interactive-card">
                  <h3 style={{ margin: '0 0 16px 0', fontSize: '16px', fontWeight: '700' }}>📊 Dynamic Pricing Engine & Anti-ODOL Auditor</h3>
                  
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px', marginBottom: '24px' }}>
                    <div>
                      <label style={{ fontSize: '11px', fontWeight: '700', color: '#6B7280', display: 'block', marginBottom: '6px' }}>Jarak Tempuh (KM)</label>
                      <input 
                        type="number" 
                        value={priceCalc.distance} 
                        onChange={(e) => setPriceCalc({ ...priceCalc, distance: parseInt(e.target.value) || 0 })} 
                        className="gml-form-control" 
                      />
                    </div>
                    <div>
                      <label style={{ fontSize: '11px', fontWeight: '700', color: '#6B7280', display: 'block', marginBottom: '6px' }}>Berat Muatan (KG)</label>
                      <input 
                        type="number" 
                        value={priceCalc.weight} 
                        onChange={(e) => setPriceCalc({ ...priceCalc, weight: parseInt(e.target.value) || 0 })} 
                        className="gml-form-control" 
                      />
                    </div>
                    <div>
                      <label style={{ fontSize: '11px', fontWeight: '700', color: '#6B7280', display: 'block', marginBottom: '6px' }}>Panjang x Lebar x Tinggi (CM)</label>
                      <div style={{ display: 'flex', gap: '4px' }}>
                        <input type="number" placeholder="P" value={priceCalc.length} onChange={(e) => setPriceCalc({ ...priceCalc, length: parseInt(e.target.value) || 0 })} className="gml-form-control" style={{ padding: '8px' }} />
                        <input type="number" placeholder="L" value={priceCalc.width} onChange={(e) => setPriceCalc({ ...priceCalc, width: parseInt(e.target.value) || 0 })} className="gml-form-control" style={{ padding: '8px' }} />
                        <input type="number" placeholder="T" value={priceCalc.height} onChange={(e) => setPriceCalc({ ...priceCalc, height: parseInt(e.target.value) || 0 })} className="gml-form-control" style={{ padding: '8px' }} />
                      </div>
                    </div>
                  </div>

                  <div style={{ backgroundColor: '#F9FAFB', border: '1px dashed #D1D5DB', borderRadius: '16px', padding: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <p style={{ fontSize: '12px', color: '#6B7280', margin: 0 }}>Estimasi Volume Kargo: <b>{((priceCalc.length * priceCalc.width * priceCalc.height) / 1000000).toFixed(2)} m³</b></p>
                      <p style={{ fontSize: '16px', fontWeight: '800', margin: '4px 0 0 0', color: '#1E88E5' }}>Hasil Tarif: Rp {calculatedFare.toLocaleString('id-ID')}</p>
                    </div>
                    {priceCalc.weight > 3000 ? (
                      <span style={{ backgroundColor: '#FEE2E2', color: '#991B1B', padding: '8px 16px', borderRadius: '12px', fontSize: '12px', fontWeight: '800' }}>
                        ⚠️ Overload (Truk CDD Wajib)
                      </span>
                    ) : (
                      <span style={{ backgroundColor: '#D1FAE5', color: '#065F46', padding: '8px 16px', borderRadius: '12px', fontSize: '12px', fontWeight: '800' }}>
                        🟢 Aman Aturan ODOL
                      </span>
                    )}
                  </div>
                </div>
              )}

              {/* Control Tower Map Tab */}
              {adminTab === 'map' && (
                <div className="gml-interactive-card">
                  <h3 style={{ margin: '0 0 8px 0', fontSize: '16px', fontWeight: '700' }}>🌐 Live Control Tower & Anomaly Tracker</h3>
                  <p style={{ fontSize: '13px', color: '#6B7280', marginBottom: '16px' }}>Melacak pergerakan kurir di lapangan dan mendeteksi anomali transit.</p>
                  
                  <div className="gml-map-mock">
                    {/* Mock Map Points */}
                    <div className="gml-map-dot" style={{ top: '30%', left: '40%' }}></div>
                    <div className="gml-map-dot" style={{ top: '60%', left: '70%', backgroundColor: '#FDD835', boxShadow: '0 0 12px #FDD835' }}></div>
                    
                    <div style={{ position: 'absolute', bottom: '10px', left: '10px', backgroundColor: 'rgba(0,0,0,0.8)', color: '#fff', padding: '6px 12px', borderRadius: '8px', fontSize: '10px' }}>
                      Legend: 🔴 Aktif | 🟡 Anomali (Berhenti &gt; 30 mnt)
                    </div>
                  </div>

                  {/* Anomaly Alerts */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {drivers.filter(d => d.idleTime > 30).map(d => (
                      <div key={d.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#FFFBEB', border: '1px solid #FCD34D', borderRadius: '12px', padding: '12px 16px' }}>
                        <span style={{ fontSize: '12px', color: '#92400E', fontWeight: '700' }}>
                          ⚠️ ANOMALI: {d.name} terdeteksi diam selama {d.idleTime} menit di koordinat GPS {d.lat}, {d.lng}.
                        </span>
                        <button 
                          onClick={() => showToast(`Menghubungi ${d.name} via Chat Gateway...`)}
                          style={{ backgroundColor: '#F59E0B', color: '#fff', fontSize: '11px', border: 'none', padding: '6px 12px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}
                        >
                          Hubungi Driver
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Finance Tab */}
              {adminTab === 'finance' && (
                <div className="gml-interactive-card">
                  <h3 style={{ margin: '0 0 16px 0', fontSize: '16px', fontWeight: '700' }}>💳 Rekonsiliasi Keuangan & Komisi</h3>
                  
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
                    <div style={{ border: '1px solid #E5E7EB', borderRadius: '16px', padding: '20px', textAlign: 'center' }}>
                      <p style={{ fontSize: '12px', color: '#6B7280', margin: 0 }}>Total Escrow Dibekukan</p>
                      <h4 style={{ fontSize: '24px', margin: '8px 0', fontWeight: '800', color: '#1E88E5' }}>Rp 1.650.000</h4>
                      <p style={{ fontSize: '11px', color: '#059669' }}>🔒 Dana Aman B2B</p>
                    </div>

                    <div style={{ border: '1px solid #E5E7EB', borderRadius: '16px', padding: '20px', textAlign: 'center' }}>
                      <p style={{ fontSize: '12px', color: '#6B7280', margin: 0 }}>Komisi Platform (10%)</p>
                      <h4 style={{ fontSize: '24px', margin: '8px 0', fontWeight: '800', color: '#43A047' }}>Rp 165.000</h4>
                      <p style={{ fontSize: '11px', color: '#6B7280' }}>Pendapatan Bersih</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Customer Support Tab */}
              {adminTab === 'support' && (
                <div className="gml-interactive-card">
                  <h3 style={{ margin: '0 0 16px 0', fontSize: '16px', fontWeight: '700' }}>🎫 Ticketing & Klaim Asuransi</h3>
                  
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {tickets.map(t => (
                      <div key={t.id} style={{ border: '1px solid #E5E7EB', borderRadius: '16px', padding: '16px', display: 'flex', justify: 'space-between', alignItems: 'center' }}>
                        <div>
                          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                            <span style={{ fontSize: '11px', fontWeight: '800', backgroundColor: '#374151', color: '#fff', padding: '2px 6px', borderRadius: '4px' }}>{t.id}</span>
                            <span style={{ fontSize: '12px', fontWeight: '700' }}>Order Ref: {t.orderId}</span>
                          </div>
                          <p style={{ margin: '8px 0 4px 0', fontSize: '14px', fontWeight: '700' }}>{t.subject}</p>
                          <p style={{ margin: 0, fontSize: '12px', color: '#6B7280' }}>"{t.message}"</p>
                        </div>
                        <button 
                          onClick={() => {
                            setTickets(tickets.filter(item => item.id !== t.id));
                            showToast('Tiket Komplain Diselesaikan!');
                          }}
                          className="gml-btn-primary" 
                          style={{ fontSize: '11px', padding: '8px 16px' }}
                        >
                          Tandai Selesai
                        </button>
                      </div>
                    ))}
                    {tickets.length === 0 && <p style={{ textAlign: 'center', fontSize: '13px', color: '#6B7280' }}>Semua tiket pengaduan selesai diverifikasi.</p>}
                  </div>
                </div>
              )}

            </div>
          )}

          {/* =======================================================
              B. PORTAL TOKO MITRA (B2B MERCHANT)
              ======================================================= */}
          {role === 'merchant' && (
            <div style={{ animation: 'fadeIn 0.3s ease' }}>
              
              {/* Bulk Order Tab */}
              {merchantTab === 'bulk' && (
                <div className="gml-interactive-card">
                  <h3 style={{ margin: '0 0 8px 0', fontSize: '16px', fontWeight: '700' }}>📥 Import Massal Pesanan Kargo (Bulk CSV)</h3>
                  <p style={{ fontSize: '13px', color: '#6B7280', marginBottom: '16px' }}>Tempel data pesanan material massal berformat CSV di bawah ini untuk membuat banyak manifes pengiriman secara instan.</p>
                  
                  <textarea 
                    value={bulkCsvText}
                    onChange={(e) => setBulkCsvText(e.target.value)}
                    style={{ fontFamily: 'monospace', height: '120px', marginBottom: '16px' }}
                    className="gml-form-control"
                  />

                  <button onClick={handleBulkUpload} className="gml-btn-primary">
                    Proses Import Massal 🚀
                  </button>
                </div>
              )}

              {/* Waybill Generator Tab */}
              {merchantTab === 'label' && (
                <div className="gml-interactive-card">
                  <h3 style={{ margin: '0 0 16px 0', fontSize: '16px', fontWeight: '700' }}>🏷️ Cetak Thermal A6 Waybill (Resi Toko)</h3>
                  
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '32px' }}>
                    {/* List Select Order */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      <p style={{ fontSize: '12px', fontWeight: '700', color: '#6B7280' }}>Pilih Manifest untuk dicetak:</p>
                      {orders.map(o => (
                        <div 
                          key={o.id} 
                          onClick={() => setSelectedWaybill(o)}
                          style={{ padding: '12px', border: '1px solid #E5E7EB', borderRadius: '12px', cursor: 'pointer', backgroundColor: selectedWaybill.id === o.id ? '#EFF6FF' : '#fff' }}
                        >
                          <p style={{ margin: 0, fontSize: '12px', fontWeight: '700' }}>{o.id} - {o.receiver}</p>
                          <p style={{ margin: '4px 0 0 0', fontSize: '11px', color: '#6B7280' }}>{o.items}</p>
                        </div>
                      ))}
                    </div>

                    {/* Waybill Render Card (Thermal A6 Preview) */}
                    <div style={{ border: '2px solid #000', padding: '16px', backgroundColor: '#fff', borderRadius: '8px', maxWidth: '300px' }}>
                      <div style={{ display: 'flex', justify: 'space-between', borderBottom: '2px solid #000', paddingBottom: '8px' }}>
                        <span style={{ fontSize: '16px', fontWeight: '800' }}>GML CARGO</span>
                        <span style={{ fontSize: '12px', fontWeight: '800', border: '1px solid #000', padding: '2px 4px' }}>A6 THERMAL</span>
                      </div>
                      
                      <div style={{ padding: '12px 0', borderBottom: '1px dashed #000', fontSize: '11px' }}>
                        <p style={{ margin: '0 0 4px 0' }}><b>PENERIMA:</b> {selectedWaybill.receiver}</p>
                        <p style={{ margin: '0 0 4px 0' }}><b>ALAMAT:</b> {selectedWaybill.address}</p>
                        <p style={{ margin: 0 }}><b>MUATAN:</b> {selectedWaybill.items} ({selectedWaybill.weight} KG)</p>
                      </div>

                      <div style={{ padding: '12px 0', textAlign: 'center' }}>
                        {/* Mock SVG Barcode */}
                        <svg width="200" height="40" style={{ margin: '0 auto' }}>
                          <rect x="10" y="5" width="4" height="30" fill="black" />
                          <rect x="18" y="5" width="2" height="30" fill="black" />
                          <rect x="24" y="5" width="8" height="30" fill="black" />
                          <rect x="36" y="5" width="4" height="30" fill="black" />
                          <rect x="44" y="5" width="2" height="30" fill="black" />
                          <rect x="50" y="5" width="6" height="30" fill="black" />
                          <rect x="60" y="5" width="8" height="30" fill="black" />
                          <rect x="72" y="5" width="4" height="30" fill="black" />
                          <rect x="80" y="5" width="2" height="30" fill="black" />
                          <rect x="88" y="5" width="8" height="30" fill="black" />
                          <rect x="100" y="5" width="2" height="30" fill="black" />
                          <rect x="110" y="5" width="6" height="30" fill="black" />
                          <rect x="120" y="5" width="8" height="30" fill="black" />
                          <rect x="130" y="5" width="4" height="30" fill="black" />
                          <rect x="140" y="5" width="2" height="30" fill="black" />
                        </svg>
                        <p style={{ margin: '4px 0 0 0', fontSize: '10px', fontWeight: '700' }}>*{selectedWaybill.id}*</p>
                      </div>

                      <button 
                        onClick={() => showToast(`Mencetak Waybill ${selectedWaybill.id} ke Printer Thermal...`)}
                        className="gml-btn-primary" 
                        style={{ width: '100%', fontSize: '11px', padding: '6px' }}
                      >
                        Cetak Sekarang
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* TOP Billing Tab */}
              {merchantTab === 'billing' && (
                <div className="gml-interactive-card">
                  <h3 style={{ margin: '0 0 8px 0', fontSize: '16px', fontWeight: '700' }}>💳 TOP (Term of Payment) Corporate Billing</h3>
                  <p style={{ fontSize: '13px', color: '#6B7280', marginBottom: '16px' }}>Pemantauan limit kredit tempo pengiriman massal Anda.</p>
                  
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
                    <div style={{ border: '1px solid #E5E7EB', padding: '20px', borderRadius: '16px' }}>
                      <span style={{ fontSize: '12px', color: '#6B7280' }}>Mitra Corporate:</span>
                      <h4 style={{ margin: '4px 0', fontSize: '16px', fontWeight: '800' }}>PT. Semen Merah Putih TBK</h4>
                      <p style={{ fontSize: '12px', margin: '12px 0 0 0' }}>Sisa Limit Kredit: <b>Rp 37.500.000</b></p>
                      <div style={{ height: '6px', backgroundColor: '#E5E7EB', borderRadius: '3px', marginTop: '4px', overflow: 'hidden' }}>
                        <div style={{ width: '25%', height: '100%', backgroundColor: '#1E88E5' }}></div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Analytics Tab */}
              {merchantTab === 'analytics' && (
                <div className="gml-interactive-card">
                  <h3 style={{ margin: '0 0 16px 0', fontSize: '16px', fontWeight: '700' }}>📈 Laporan & Analytics Toko Mitra</h3>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px' }}>
                    <div style={{ border: '1px solid #E5E7EB', padding: '16px', borderRadius: '12px', textAlign: 'center' }}>
                      <span style={{ fontSize: '11px', color: '#6B7280' }}>Persentase Sukses COD</span>
                      <p style={{ fontSize: '24px', fontWeight: '800', margin: '4px 0', color: '#43A047' }}>98%</p>
                    </div>
                    <div style={{ border: '1px solid #E5E7EB', padding: '16px', borderRadius: '12px', textAlign: 'center' }}>
                      <span style={{ fontSize: '11px', color: '#6B7280' }}>SLA Pengiriman Tepat Waktu</span>
                      <p style={{ fontSize: '24px', fontWeight: '800', margin: '4px 0', color: '#1E88E5' }}>96.4%</p>
                    </div>
                  </div>
                </div>
              )}

            </div>
          )}

          {/* =======================================================
              C. DRIVER MOBILE VIEWPORT (PHONE MOCKUP)
              ======================================================= */}
          {role === 'driver' && (
            <div style={{ animation: 'fadeIn 0.3s ease' }}>
              
              <div className="gml-phone-container">
                <div className="gml-phone-screen">
                  
                  {/* Phone Header */}
                  <div className="gml-phone-header">
                    <span style={{ fontSize: '13px', fontWeight: '800' }}>GML Mobile</span>
                    <span style={{ fontSize: '11px', color: '#43A047', fontWeight: '700' }}>● Online</span>
                  </div>

                  {/* Phone Internal Content */}
                  <div style={{ padding: '16px', flexGrow: 1, display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    
                    {/* Manifest Tab */}
                    {driverTab === 'manifest' && (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        <p style={{ fontSize: '12px', fontWeight: '700', margin: 0 }}>📋 Manifest Tugas Pengantaran Anda:</p>
                        
                        {orders.filter(o => o.status === 'In Transit' && o.driverId === 'D02').map(o => (
                          <div key={o.id} style={{ backgroundColor: '#fff', border: '1px solid #E5E7EB', padding: '12px', borderRadius: '16px', fontSize: '12px' }}>
                            <div style={{ display: 'flex', justify: 'space-between', marginBottom: '8px' }}>
                              <span style={{ fontWeight: '800' }}>{o.id}</span>
                              <span style={{ color: '#1E88E5', fontWeight: '700' }}>{o.status}</span>
                            </div>
                            <p style={{ margin: '0 0 4px 0' }}><b>Antar Ke:</b> {o.receiver}</p>
                            <p style={{ margin: '0 0 8px 0', color: '#6B7280' }}>📍 {o.address}</p>
                            
                            {/* Complete order process */}
                            <div style={{ borderTop: '1px dashed #E5E7EB', paddingTop: '8px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                              <button 
                                onClick={runARVerifier}
                                className="gml-btn-primary" 
                                style={{ width: '100%', fontSize: '11px', padding: '8px', backgroundColor: '#4B5563' }}
                              >
                                Verifikasi Kamera AR Kargo
                              </button>

                              {/* Camera capture mockup */}
                              {!driverPodPhoto ? (
                                <button 
                                  onClick={() => setDriverPodPhoto('https://images.unsplash.com/photo-1590069261209-f8e9b8642343?auto=format&fit=crop&w=300&q=80')}
                                  className="gml-btn-primary" 
                                  style={{ width: '100%', fontSize: '11px', padding: '8px', backgroundColor: '#F59E0B' }}
                                >
                                  Ambil Foto Serah Terima (PoD)
                                </button>
                              ) : (
                                <div style={{ textAlign: 'center' }}>
                                  <span style={{ fontSize: '11px', color: '#43A047', fontWeight: '700' }}>✓ Foto PoD Tersimpan</span>
                                </div>
                              )}

                              {/* Canvas Signature */}
                              <div style={{ border: '1px solid #D1D5DB', borderRadius: '8px', padding: '8px', backgroundColor: '#fff' }}>
                                <p style={{ margin: '0 0 4px 0', fontSize: '10px' }}>Tanda Tangan Digital Penerima:</p>
                                <canvas 
                                  ref={canvasRef}
                                  onMouseDown={startDrawing}
                                  onMouseMove={draw}
                                  onMouseUp={() => setIsDrawing(false)}
                                  onTouchStart={startDrawing}
                                  onTouchMove={draw}
                                  onTouchEnd={() => setIsDrawing(false)}
                                  style={{ width: '100%', height: '60px', backgroundColor: '#F9FAFB', border: '1px solid #E5E7EB', borderRadius: '4px' }}
                                />
                                <div style={{ display: 'flex', justify: 'space-between', marginTop: '4px' }}>
                                  <button onClick={clearSignature} style={{ fontSize: '9px', background: 'none', border: 'none', color: '#EF4444', cursor: 'pointer' }}>Hapus</button>
                                  <button onClick={saveSignature} style={{ fontSize: '9px', background: 'none', border: 'none', color: '#1E88E5', cursor: 'pointer' }}>Kunci TTD</button>
                                </div>
                              </div>

                              <button 
                                onClick={() => completeDriverOrder(o.id)}
                                disabled={!signatureSaved || !driverPodPhoto}
                                className="gml-btn-primary" 
                                style={{ width: '100%', padding: '10px', fontSize: '11px', opacity: (signatureSaved && driverPodPhoto) ? 1 : 0.5 }}
                              >
                                Selesaikan Pengiriman & Cairkan
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Navigation Tab */}
                    {driverTab === 'nav' && (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        <p style={{ fontSize: '12px', fontWeight: '700', margin: 0 }}>🧭 Navigasi Waktu Nyata (Google Maps / Waze Mock):</p>
                        <div className="gml-map-mock" style={{ height: '220px' }}>
                          <div className="gml-map-dot" style={{ top: '40%', left: '50%' }}></div>
                          <div style={{ position: 'absolute', top: '10px', right: '10px', backgroundColor: '#212121', color: '#fff', padding: '4px 8px', borderRadius: '6px', fontSize: '9px' }}>
                            Rute Tercepat: 15 Menit (5.4 KM)
                          </div>
                        </div>
                      </div>
                    )}

                    {/* AR Calc Tab */}
                    {driverTab === 'ar_calc' && (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', textAlign: 'center' }}>
                        <p style={{ fontSize: '12px', fontWeight: '700', margin: 0, textAlign: 'left' }}>📏 AR Weight & Volume Verifier:</p>
                        
                        <div style={{ border: '2px dashed #D1D5DB', borderRadius: '16px', padding: '32px 16px', backgroundColor: '#fff' }}>
                          {isVerifyingAR ? (
                            <div>
                              <span style={{ fontSize: '24px', display: 'block', animation: 'spin 1s linear infinite' }}>🔄</span>
                              <p style={{ fontSize: '11px', color: '#6B7280', marginTop: '8px' }}>Menganalisis kerapatan kargo semen...</p>
                            </div>
                          ) : (
                            <div>
                              <span style={{ fontSize: '32px', display: 'block' }}>📷</span>
                              <p style={{ fontSize: '11px', color: '#6B7280', margin: '4px 0 12px 0' }}>Arahkan kamera ke tumpukan semen untuk verifikasi dimensi fisik.</p>
                              <button onClick={runARVerifier} className="gml-btn-primary" style={{ margin: '0 auto', fontSize: '11px', padding: '8px 16px' }}>
                                Mulai Pindai AR
                              </button>
                            </div>
                          )}
                        </div>

                        {arVerifyResult && (
                          <div style={{ backgroundColor: '#D1FAE5', border: '1px solid #10B981', borderRadius: '12px', padding: '12px', fontSize: '11px', color: '#065F46', textAlign: 'left' }}>
                            <p style={{ margin: '0 0 4px 0', fontWeight: '800' }}>Hasil Pengukuran AR:</p>
                            <p style={{ margin: '0 0 2px 0' }}>Berat Terpindai: <b>{arVerifyResult.weight} KG</b></p>
                            <p style={{ margin: '0 0 2px 0' }}>Volume Terpindai: <b>{arVerifyResult.volume} m³</b></p>
                            <p style={{ margin: 0, fontSize: '10px', color: '#047857' }}>{arVerifyResult.desc}</p>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Wallet Tab */}
                    {driverTab === 'wallet' && (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        <div style={{ backgroundColor: '#212121', color: '#fff', padding: '20px', borderRadius: '20px', textAlign: 'center' }}>
                          <span style={{ fontSize: '11px', color: '#9CA3AF' }}>Saldo Pendapatan Driver</span>
                          <p style={{ fontSize: '24px', fontWeight: '800', margin: '8px 0', color: '#FDD835' }}>Rp 350.000</p>
                          <button 
                            onClick={() => {
                              showToast('Pencairan Sedang Diproses ke Rekening Anda!');
                              addNotification('Driver mencairkan dana senilai Rp350.000.');
                            }}
                            className="gml-btn-primary" 
                            style={{ margin: '0 auto', fontSize: '11px', padding: '6px 12px', backgroundColor: '#1E88E5' }}
                          >
                            Cairkan ke Bank (Withdraw)
                          </button>
                        </div>
                      </div>
                    )}

                  </div>

                </div>
              </div>

            </div>
          )}

          {/* =======================================================
              D. APLIKASI KONSUMEN (B2C / C2C END-USER)
              ======================================================= */}
          {role === 'customer' && (
            <div style={{ animation: 'fadeIn 0.3s ease' }}>
              
              {/* Booking Tab */}
              {customerTab === 'booking' && (
                <div className="gml-interactive-card">
                  <h3 style={{ margin: '0 0 16px 0', fontSize: '16px', fontWeight: '700' }}>📅 Instant & Scheduled Booking</h3>
                  
                  <form onSubmit={handleCustomerBooking} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
                      <div>
                        <label style={{ fontSize: '11px', fontWeight: '700', color: '#6B7280', display: 'block', marginBottom: '6px' }}>Nama Penerima</label>
                        <input type="text" required value={bookingForm.receiverName} onChange={(e) => setBookingForm({ ...bookingForm, receiverName: e.target.value })} className="gml-form-control" />
                      </div>
                      <div>
                        <label style={{ fontSize: '11px', fontWeight: '700', color: '#6B7280', display: 'block', marginBottom: '6px' }}>Alamat Tujuan Drop-Off</label>
                        <input type="text" required value={bookingForm.address} onChange={(e) => setBookingForm({ ...bookingForm, address: e.target.value })} className="gml-form-control" />
                      </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px' }}>
                      <div>
                        <label style={{ fontSize: '11px', fontWeight: '700', color: '#6B7280', display: 'block', marginBottom: '6px' }}>Deskripsi Barang</label>
                        <input type="text" required value={bookingForm.items} onChange={(e) => setBookingForm({ ...bookingForm, items: e.target.value })} className="gml-form-control" />
                      </div>
                      <div>
                        <label style={{ fontSize: '11px', fontWeight: '700', color: '#6B7280', display: 'block', marginBottom: '6px' }}>Berat Kargo (KG)</label>
                        <input type="number" required value={bookingForm.weight} onChange={(e) => setBookingForm({ ...bookingForm, weight: e.target.value })} className="gml-form-control" />
                      </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px' }}>
                      <div>
                        <label style={{ fontSize: '11px', fontWeight: '700', color: '#6B7280', display: 'block', marginBottom: '6px' }}>Pilihan Pengiriman</label>
                        <select value={bookingForm.deliveryType} onChange={(e) => setBookingForm({ ...bookingForm, deliveryType: e.target.value })} className="gml-form-control">
                          <option value="Instant">Instant (Segera Kirim)</option>
                          <option value="Scheduled">Scheduled (Terjadwal)</option>
                        </select>
                      </div>
                      {bookingForm.deliveryType === 'Scheduled' && (
                        <div>
                          <label style={{ fontSize: '11px', fontWeight: '700', color: '#6B7280', display: 'block', marginBottom: '6px' }}>Tanggal Pengiriman</label>
                          <input type="date" required value={bookingForm.scheduledDate} onChange={(e) => setBookingForm({ ...bookingForm, scheduledDate: e.target.value })} className="gml-form-control" />
                        </div>
                      )}
                      <div>
                        <label style={{ fontSize: '11px', fontWeight: '700', color: '#6B7280', display: 'block', marginBottom: '6px' }}>Metode Pembayaran</label>
                        <select value={bookingForm.paymentMethod} onChange={(e) => setBookingForm({ ...bookingForm, paymentMethod: e.target.value })} className="gml-form-control">
                          <option value="COD">COD (Cash on Delivery)</option>
                          <option value="E-Wallet">E-Wallet (Gopay/OVO)</option>
                          <option value="Bank Transfer">Transfer Virtual Account</option>
                        </select>
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <input 
                        type="checkbox" 
                        checked={bookingForm.isInsurance} 
                        onChange={(e) => setBookingForm({ ...bookingForm, isInsurance: e.target.checked })} 
                        style={{ width: '16px', height: '16px' }}
                      />
                      <span style={{ fontSize: '12px', fontWeight: '600' }}>Aktifkan Asuransi Kehilangan & Kerusakan (Proteksi 100%)</span>
                    </div>

                    <button type="submit" className="gml-btn-primary" style={{ alignSelf: 'flex-start' }}>
                      Kunci Booking Logistik 📅
                    </button>
                  </form>
                </div>
              )}

              {/* Tracking & ETA Tab */}
              {customerTab === 'track' && (
                <div className="gml-interactive-card">
                  <h3 style={{ margin: '0 0 16px 0', fontSize: '16px', fontWeight: '700' }}>📍 Real-Time Tracking & ETA</h3>
                  
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    {orders.filter(o => o.status !== 'Delivered').map(o => (
                      <div key={o.id} style={{ border: '1px solid #E5E7EB', borderRadius: '16px', padding: '16px' }}>
                        <div style={{ display: 'flex', justify: 'space-between', marginBottom: '8px', fontSize: '12px' }}>
                          <span style={{ fontWeight: '800', backgroundColor: '#F3F4F6', padding: '4px 8px', borderRadius: '4px' }}>{o.id}</span>
                          <span style={{ color: '#1E88E5', fontWeight: '700' }}>{o.status}</span>
                        </div>
                        <p style={{ margin: '0 0 4px 0', fontSize: '13px' }}>Muatan: <b>{o.items}</b></p>
                        <p style={{ margin: '0 0 12px 0', fontSize: '12px', color: '#6B7280' }}>Tujuan: {o.address}</p>

                        <div className="gml-map-mock" style={{ height: '120px' }}>
                          <div className="gml-map-dot" style={{ top: '50%', left: '30%' }}></div>
                        </div>

                        <div style={{ display: 'flex', justify: 'space-between', fontSize: '12px' }}>
                          <span>Estimasi Tiba (ETA):</span>
                          <b style={{ color: '#43A047' }}>20 Menit</b>
                        </div>
                      </div>
                    ))}
                    {orders.filter(o => o.status !== 'Delivered').length === 0 && (
                      <p style={{ textAlign: 'center', fontSize: '13px', color: '#6B7280' }}>Tidak ada pengiriman aktif saat ini.</p>
                    )}
                  </div>
                </div>
              )}

              {/* History & Reviews Tab */}
              {customerTab === 'history' && (
                <div className="gml-interactive-card">
                  <h3 style={{ margin: '0 0 16px 0', fontSize: '16px', fontWeight: '700' }}>📜 Riwayat Pengantaran & Ticket Klaim</h3>
                  
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '32px' }}>
                    {/* List Riwayat */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      {orders.filter(o => o.status === 'Delivered').map(o => (
                        <div key={o.id} style={{ border: '1px solid #E5E7EB', borderRadius: '16px', padding: '16px', fontSize: '12px' }}>
                          <div style={{ display: 'flex', justify: 'space-between', marginBottom: '4px' }}>
                            <span style={{ fontWeight: '800' }}>{o.id}</span>
                            <span style={{ color: '#059669', fontWeight: '700' }}>Selesai</span>
                          </div>
                          <p style={{ margin: '0 0 8px 0' }}>Muatan: {o.items}</p>
                          
                          {/* Rating review mock */}
                          <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
                            <span style={{ color: '#F59E0B' }}>⭐⭐⭐⭐⭐</span>
                            <span style={{ fontSize: '11px', color: '#6B7280' }}>5.0 Rating</span>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Create Damage Claim Ticket Form */}
                    <div style={{ border: '1px solid #E5E7EB', borderRadius: '24px', padding: '24px' }}>
                      <h4 style={{ margin: '0 0 12px 0', fontSize: '14px', fontWeight: '700' }}>⚠️ Ajukan Klaim Kerusakan / Hilang</h4>
                      
                      <form onSubmit={handleCreateTicket} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        <div>
                          <label style={{ fontSize: '10px', fontWeight: '700', color: '#6B7280', display: 'block', marginBottom: '4px' }}>ID Order Terkait</label>
                          <input type="text" required placeholder="GML-XXXXX" value={newTicket.orderId} onChange={(e) => setNewTicket({ ...newTicket, orderId: e.target.value })} className="gml-form-control" />
                        </div>
                        <div>
                          <label style={{ fontSize: '10px', fontWeight: '700', color: '#6B7280', display: 'block', marginBottom: '4px' }}>Subjek Komplain</label>
                          <input type="text" required placeholder="Semen basah terkena air hujan" value={newTicket.subject} onChange={(e) => setNewTicket({ ...newTicket, subject: e.target.value })} className="gml-form-control" />
                        </div>
                        <div>
                          <label style={{ fontSize: '10px', fontWeight: '700', color: '#6B7280', display: 'block', marginBottom: '4px' }}>Deskripsi Masalah</label>
                          <textarea required placeholder="Tuliskan kronologi kerusakan barang..." value={newTicket.message} onChange={(e) => setNewTicket({ ...newTicket, message: e.target.value })} className="gml-form-control" style={{ height: '80px' }} />
                        </div>
                        <button type="submit" className="gml-btn-primary" style={{ fontSize: '12px', padding: '10px' }}>
                          Kirim Tiket Klaim
                        </button>
                      </form>
                    </div>
                  </div>
                </div>
              )}

            </div>
          )}

        </div>

        {/* FOOTER */}
        <footer style={{ backgroundColor: '#212121', color: '#9CA3AF', padding: '24px 40px', fontSize: '12px', borderTop: '1px solid #374151', marginTop: 'auto', textAlign: 'center' }}>
          <p style={{ margin: 0 }}>© 2026 Gudang Materials Logistik Platform. Hak Cipta Dilindungi.</p>
        </footer>

      </main>

    </div>
  );
}