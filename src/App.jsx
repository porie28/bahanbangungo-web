import React, { useState, useEffect, useRef } from 'react';

const INITIAL_SHIPMENTS = [
  {
    id: 'BBG-998122',
    item: '20 Sak Semen Gresik (1 Ton)',
    sender: 'Depo Pusat Cengkareng, Jakarta Barat',
    receiver: 'Proyek Cluster Harmoni, Tangerang',
    status: 'Dalam Perjalanan',
    statusDetail: 'Kurir sedang menuju lokasi proyek melalui jalan Tol Jakarta-Tangerang.',
    driver: 'Pak Rudi Santoso',
    fleet: 'Truk Engkel CDE',
    progress: 65,
    eta: '45 Menit',
    weight: 1000,
    volume: 0.7,
    date: '23 Juni 2026',
    history: [
      { status: 'Pesanan Dibuat', time: '10:00 AM', desc: 'Sistem mengunci pembayaran escrow.' },
      { status: 'Dikonfirmasi', time: '10:15 AM', desc: 'Merchant menyiapkan material semen.' },
      { status: 'Picked Up', time: '11:00 AM', desc: 'Semen dimuat ke armada CDE.' },
      { status: 'Dalam Perjalanan', time: '11:30 AM', desc: 'Truk melintasi tol Jakarta-Tangerang.' }
    ]
  },
  {
    id: 'BBG-776655',
    item: 'Pasir Cor Merapi (1.5 m³)',
    sender: 'Depo Tambang Merak, Banten',
    receiver: 'Gudang Konstruksi Sudirman, Jakarta Selatan',
    status: 'Disiapkan oleh Toko',
    statusDetail: 'Barang sedang dimuat ke dalam armada dump truck.',
    driver: 'Pak Budi Wijaya',
    fleet: 'Truk Double CDD',
    progress: 25,
    eta: '2 Jam 15 Menit',
    weight: 2100,
    volume: 1.5,
    date: '23 Juni 2026',
    history: [
      { status: 'Pesanan Dibuat', time: '09:00 AM', desc: 'Pesanan masuk ke sistem antrean.' },
      { status: 'Disiapkan oleh Toko', time: '09:30 AM', desc: 'Alat berat mulai memuat pasir.' }
    ]
  },
  {
    id: 'BBG-112233',
    item: 'Besi Beton SNI 10mm (50 Batang)',
    sender: 'Pabrik Baja Cilegon, Serang',
    receiver: 'Pembangunan Ruko Daan Mogot, Jakarta Barat',
    status: 'Selesai',
    statusDetail: 'Barang telah diterima oleh Bp. Ahmad (Kepala Tukang).',
    driver: 'Pak Aris Nugroho',
    fleet: 'Truk Double CDD',
    progress: 100,
    eta: 'Tiba di Lokasi',
    weight: 600,
    volume: 0.25,
    date: '22 Juni 2026',
    history: [
      { status: 'Pesanan Dibuat', time: 'Yesterday', desc: 'Transaksi tervalidasi.' },
      { status: 'Disiapkan oleh Toko', time: 'Yesterday', desc: 'Besi beton diikat aman.' },
      { status: 'Dalam Perjalanan', time: 'Yesterday', desc: 'Perjalanan lancar via arteri.' },
      { status: 'Selesai', time: 'Yesterday', desc: 'Diterima & TTD digital diverifikasi.' }
    ]
  }
];

const DEPOT_OUTLETS = [
  { region: 'Jakarta', name: 'Hub Utama Jakarta Barat - Cengkareng', address: 'Jl. Lingkar Luar No. 45, Cengkareng', tel: '+62 21-5544-3322' },
  { region: 'Jakarta', name: 'Hub Jakarta Timur - Cakung', address: 'Kawasan Industri Pulogadung Blok C, Cakung', tel: '+62 21-5544-7788' },
  { region: 'Tangerang', name: 'Hub Tangerang Raya - Batuceper', address: 'Jl. Pembangunan III No. 12, Batuceper', tel: '+62 21-5577-9911' },
  { region: 'Bekasi', name: 'Hub Bekasi - Tambun', address: 'Jl. Sultan Hasanuddin No. 88, Tambun Selatan', tel: '+62 21-8899-2211' },
  { region: 'Bandung', name: 'Hub Priangan - Soekarno Hatta', address: 'Jl. Soekarno-Hatta No. 624, Bandung', tel: '+62 22-7788-5544' }
];

const PRODUCT_CATEGORIES = [
  { id: 'semen', name: 'Semen', icon: '🧱', count: '12 Varian' },
  { id: 'pasir', name: 'Pasir & Kerikil', icon: '⏳', count: '5 Jenis' },
  { id: 'besi', name: 'Besi & Baja', icon: '⛓️', count: '18 Ukuran' },
  { id: 'cat', name: 'Cat & Pelapis', icon: '🎨', count: '24 Warna' },
  { id: 'alat', name: 'Alat Berat', icon: '🚜', count: '4 Armada' }
];

const SLIDER_PHOTOS = [
  {
    id: 1,
    title: 'PAKET BESAR & MATERIAL PROYEK, CARI BAHANBANGUNGO!',
    desc: 'Pengiriman semen curah, pasir tambang, dan besi beton struktural dijamin aman dengan perlindungan anti-ODOL serta sistem lacak GPS real-time.',
    badge: '⚡ CARGO PREMIUM',
    bgGradient: 'linear-gradient(135deg, #004d34 0%, #00805a 100%)'
  },
  {
    id: 2,
    title: '👑 REGISTRASI VIP CLIENT UNTUK KONTRAKTOR PROYEK',
    desc: 'Nikmati kemudahan pembayaran termin (Tempo 30 Hari), diskon tarif pengiriman flat-rate 10%, serta fasilitas bebas biaya kuli bongkar di lokasi.',
    badge: '💎 MEMBER B2B',
    bgGradient: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)'
  },
  {
    id: 3,
    title: '🛠️ KEAMANAN MUATAN PRIORITAS JALAN RAYA',
    desc: 'Sistem logistik kami dilengkapi kecerdasan konversi berat-volume otomatis untuk merekomendasikan armada yang tepat sesuai regulasi jalan raya nasional.',
    badge: '🛡️ GARANSI ANTI-ODOL',
    bgGradient: 'linear-gradient(135deg, #78350f 0%, #b45309 100%)'
  }
];

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard'); // dashboard | tracking | price | outlet | simulator
  const [shipments, setShipments] = useState(INITIAL_SHIPMENTS);
  const [selectedShipmentId, setSelectedShipmentId] = useState('BBG-998122');
  const [searchTrackingId, setSearchTrackingId] = useState('BBG-998122');
  const [activeRole, setActiveRole] = useState('customer'); // customer | merchant | driver
  
  // Carousel Slider State
  const [currentSlide, setCurrentSlide] = useState(0);

  // State untuk Kalkulator Tarif (Cek Harga)
  const [calcWeight, setCalcWeight] = useState(1500); // dalam Kg
  const [calcVolume, setCalcVolume] = useState(1.2); // dalam m³
  const [calcDistance, setCalcDistance] = useState(25); // dalam Km
  const [calcFleet, setCalcFleet] = useState('engkel'); // pickup | engkel | double
  const [helperService, setHelperService] = useState(true);
  const [calculatedPrice, setCalculatedPrice] = useState(0);
  const [odolAlert, setOdolAlert] = useState(false);

  // State untuk Pencarian Outlet
  const [selectedRegion, setSelectedRegion] = useState('Jakarta');

  // State untuk Registrasi VIP Client
  const [showVipModal, setShowVipModal] = useState(false);
  const [vipForm, setVipForm] = useState({ company: '', pic: '', phone: '', address: '' });

  // State Toast Pemberitahuan
  const [toastMessage, setToastMessage] = useState(null);

  // State Tanda Tangan Driver (Canvas)
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

  useEffect(() => {
    let baseFare = 150000;
    let ratePerKm = 8000;
    let maxCapacity = 3000; // Default Truk Engkel CDE

    if (calcFleet === 'pickup') {
      baseFare = 75000;
      ratePerKm = 5000;
      maxCapacity = 1500;
    } else if (calcFleet === 'double') {
      baseFare = 250000;
      ratePerKm = 12000;
      maxCapacity = 7000;
    }

    // Hitung total tarif
    let total = baseFare + (calcDistance * ratePerKm);
    if (helperService) total += 50000; // Biaya kuli bongkar flat rate

    setCalculatedPrice(total);

    // Deteksi ODOL (Over Dimension Over Loading)
    if (calcWeight > maxCapacity) {
      setOdolAlert(true);
    } else {
      setOdolAlert(false);
    }
  }, [calcWeight, calcVolume, calcDistance, calcFleet, helperService]);

  // Trigger Notifikasi Toast
  const triggerToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Mencari Detail Shipments berdasarkan ID
  const searchedShipment = shipments.find(
    s => s.id.toLowerCase().trim() === searchTrackingId.toLowerCase().trim()
  );

  const handleSimulateProgress = () => {
    setShipments(prev => prev.map(s => {
      if (s.id === selectedShipmentId) {
        if (s.progress >= 100) {
          triggerToast(`Muatan ${s.id} sudah selesai dikirim.`);
          return s;
        }
        const nextProgress = Math.min(s.progress + 25, 100);
        let nextStatus = s.status;
        let nextDetail = s.statusDetail;

        if (nextProgress === 100) {
          nextStatus = 'Selesai';
          nextDetail = 'Muatan telah sukses diserahterimakan dan ditandatangani.';
        } else if (nextProgress > 75) {
          nextStatus = 'Dalam Perjalanan';
          nextDetail = 'Kurir telah keluar tol dan memasuki rute jalan raya kota tujuan.';
        } else if (nextProgress > 50) {
          nextStatus = 'Dalam Perjalanan';
          nextDetail = 'Kurir sedang berada di rest area tol KM 57.';
        }

        const newHistory = [...s.history, {
          status: nextStatus,
          time: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
          desc: nextDetail
        }];

        triggerToast(`Status logistik ${s.id} berhasil diperbarui!`);
        return { ...s, progress: nextProgress, status: nextStatus, statusDetail: nextDetail, eta: nextProgress === 100 ? 'Tiba' : s.eta, history: newHistory };
      }
      return s;
    }));
  };

  const startDrawing = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    ctx.strokeStyle = '#0f172a';
    const rect = canvas.getBoundingClientRect();
    const clientX = e.clientX || (e.touches && e.touches[0].clientX);
    const clientY = e.clientY || (e.touches && e.touches[0].clientY);
    const x = clientX - rect.left;
    const y = clientY - rect.top;
    ctx.beginPath();
    ctx.moveTo(x, y);
    setIsDrawing(true);
  };

  const draw = (e) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const rect = canvas.getBoundingClientRect();
    const clientX = e.clientX || (e.touches && e.touches[0].clientX);
    const clientY = e.clientY || (e.touches && e.touches[0].clientY);
    const x = clientX - rect.left;
    const y = clientY - rect.top;
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const saveSignature = () => {
    setSignatureSaved(true);
    triggerToast('Tanda tangan digital penerima berhasil dikunci!');
  };

  const handleCompleteDelivery = (shipmentId) => {
    setShipments(prev => prev.map(s => {
      if (s.id === shipmentId) {
        return {
          ...s,
          status: 'Selesai',
          statusDetail: 'Selesai. Barang diterima dengan baik di lokasi proyek.',
          progress: 100,
          eta: 'Tiba',
          history: [...s.history, { status: 'Selesai', time: 'Just Now', desc: 'Diterima oleh kepala proyek.' }]
        };
      }
      return s;
    }));
    setPodPhoto(null);
    setSignatureSaved(false);
    triggerToast(`Pengiriman ${shipmentId} sukses diselesaikan! Dana Escrow dicairkan.`);
  };

  return (
    <div className="bbg-dashboard-wrapper">
      
      {/* ==========================================
          FALLBACK DESKRIPSI GAYA VISUAL (EMBEDDED STYLE ENGINE)
          Mencegah visual pecah atau polos di Vercel/Codespaces
          ========================================== */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Poppins:wght@600;700;800&display=swap');
        
        .bbg-dashboard-wrapper {
          font-family: 'Inter', sans-serif;
          background-color: #f1f5f9;
          color: #1e293b;
          min-height: 100vh;
          display: flex;
          overflow-x: hidden;
        }

        h1, h2, h3, h4, h5 {
          font-family: 'Poppins', sans-serif;
        }

        /* Sidebar Styling */
        .bbg-sidebar {
          width: 260px;
          background-color: #0f172a;
          color: #f8fafc;
          display: flex;
          flex-direction: column;
          padding: 24px;
          border-right: 1px solid #1e293b;
          min-height: 100vh;
          position: sticky;
          top: 0;
          transition: all 0.3s ease;
        }

        .bbg-brand-logo {
          font-size: 20px;
          font-weight: 800;
          color: #ffffff;
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 40px;
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

        /* Main Area Layout */
        .bbg-main-area {
          flex-grow: 1;
          display: flex;
          flex-direction: column;
          min-width: 0; /* Mencegah overflow */
        }

        /* Top Bar Header */
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

        .bbg-topbar-left h2 {
          font-size: 18px;
          font-weight: 700;
          color: #0f172a;
          margin: 0;
        }

        .bbg-topbar-right {
          display: flex;
          align-items: center;
          gap: 20px;
        }

        .bbg-vip-badge-btn {
          background-color: #F2C335;
          color: #0f172a;
          font-weight: 700;
          font-size: 13px;
          padding: 8px 16px;
          border-radius: 10px;
          border: none;
          cursor: pointer;
          transition: all 0.2s ease;
          box-shadow: 0 4px 10px rgba(242, 195, 53, 0.2);
        }

        .bbg-vip-badge-btn:hover {
          background-color: #e0b224;
          transform: translateY(-1px);
        }

        .bbg-profile-section {
          display: flex;
          align-items: center;
          gap: 10px;
          font-size: 14px;
          font-weight: 600;
          color: #334155;
        }

        /* Content Container */
        .bbg-content {
          padding: 40px;
          flex-grow: 1;
        }

        /* Custom Stat Cards */
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

        .bbg-stat-title {
          font-size: 12px;
          color: #64748b;
          text-transform: uppercase;
          font-weight: 700;
          letter-spacing: 0.05em;
        }

        .bbg-stat-value {
          font-size: 24px;
          font-weight: 800;
          color: #0f172a;
        }

        .bbg-stat-badge {
          font-size: 11px;
          font-weight: 600;
          padding: 4px 8px;
          border-radius: 6px;
          align-self: flex-start;
        }

        .bbg-stat-badge.success {
          background-color: #dcfce7;
          color: #15803d;
        }

        .bbg-stat-badge.info {
          background-color: #e0f2fe;
          color: #0369a1;
        }

        /* Promosi Carousel Banner */
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

        .bbg-promo-badge {
          background-color: #F2C335;
          color: #0f172a;
          font-size: 10px;
          font-weight: 800;
          padding: 4px 10px;
          border-radius: 20px;
          display: inline-block;
          margin-bottom: 16px;
          letter-spacing: 0.05em;
        }

        .bbg-promo-title {
          font-size: 32px;
          font-weight: 800;
          line-height: 1.2;
          margin-bottom: 12px;
          max-width: 650px;
        }

        .bbg-promo-desc {
          font-size: 14px;
          color: #e2e8f0;
          max-width: 600px;
          margin-bottom: 24px;
          line-height: 1.6;
        }

        /* Dynamic dots for banner */
        .bbg-promo-dots {
          display: flex;
          gap: 6px;
          margin-top: 16px;
        }

        .bbg-promo-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background-color: rgba(255, 255, 255, 0.4);
          border: none;
          cursor: pointer;
        }

        .bbg-promo-dot.active {
          background-color: #F2C335;
          width: 24px;
          border-radius: 10px;
        }

        /* Interactive Grid Panels */
        .bbg-interactive-card {
          background-color: #ffffff;
          border-radius: 24px;
          padding: 32px;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.03);
          border: 1px solid #e2e8f0;
          margin-bottom: 32px;
        }

        .bbg-card-title {
          font-size: 16px;
          font-weight: 700;
          color: #0f172a;
          margin-bottom: 24px;
          display: flex;
          align-items: center;
          gap: 10px;
        }

        /* Form Inputs & Selects */
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
          padding: 14px 24px;
          border-radius: 12px;
          border: none;
          cursor: pointer;
          transition: all 0.2s ease;
          box-shadow: 0 4px 12px rgba(0, 128, 90, 0.15);
        }

        .bbg-btn-primary:hover {
          background-color: #006647;
          transform: translateY(-1px);
        }

        /* Toast Alert Floating Box */
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

        .bbg-toast-dot {
          width: 8px;
          height: 8px;
          background-color: #F2C335;
          border-radius: 50%;
          display: inline-block;
          animation: bbg-ping 1s infinite alternate;
        }

        @keyframes bbg-ping {
          0% { transform: scale(1); opacity: 0.5; }
          100% { transform: scale(1.5); opacity: 1; }
        }

        /* Tracking Timeline styling */
        .bbg-timeline-container {
          background-color: #f8fafc;
          border-radius: 16px;
          padding: 24px;
          border: 1px solid #e2e8f0;
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .bbg-timeline-progress-bar {
          height: 6px;
          background-color: #e2e8f0;
          border-radius: 10px;
          position: relative;
          margin: 20px 0;
          overflow: hidden;
        }

        .bbg-timeline-progress-fill {
          height: 100%;
          background-color: #00805a;
          transition: width 0.5s ease-in-out;
        }

        /* Floating Sidebar Actions */
        .bbg-floating-widget {
          position: fixed;
          right: 24px;
          bottom: 24px;
          display: flex;
          flex-direction: column;
          gap: 10px;
          z-index: 50;
        }

        .bbg-floating-btn {
          width: 48px;
          height: 48px;
          border-radius: 50%;
          background-color: #ffffff;
          color: #0f172a;
          border: 1px solid #e2e8f0;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 18px;
          cursor: pointer;
          box-shadow: 0 4px 15px rgba(0,0,0,0.08);
          transition: all 0.3s ease;
        }

        .bbg-floating-btn:hover {
          background-color: #00805a;
          color: #ffffff;
          transform: translateY(-2px);
        }

        /* Modal Layout */
        .bbg-modal-overlay {
          position: fixed;
          inset: 0;
          background-color: rgba(15, 23, 42, 0.6);
          backdrop-filter: blur(4px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 60;
          padding: 16px;
        }

        .bbg-modal-card {
          background-color: #ffffff;
          border-radius: 24px;
          width: 100%;
          max-width: 480px;
          padding: 32px;
          box-shadow: 0 20px 40px rgba(0,0,0,0.15);
          position: relative;
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
          .bbg-brand-logo {
            margin-bottom: 20px;
          }
          .bbg-menu-list {
            flex-direction: row;
            overflow-x: auto;
            padding-bottom: 8px;
          }
          .bbg-menu-item {
            white-space: nowrap;
            width: auto;
            padding: 8px 16px;
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
          <span className="bbg-toast-dot"></span>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* ==========================================
          SIDEBAR NAVIGATION (LEFT SIDEBAR)
          ========================================== */}
      <aside className="bbg-sidebar">
        <div className="bbg-brand-logo">
          <span>🏗️</span> BahanBangun<span>Go</span>
        </div>
        <div className="bbg-menu-list">
          <button 
            onClick={() => { setActiveTab('dashboard'); triggerToast('Membuka Dasbor Analitik'); }} 
            className={`bbg-menu-item ${activeTab === 'dashboard' ? 'active' : ''}`}
          >
            📊 Dasbor Analitik
          </button>
          <button 
            onClick={() => { setActiveTab('tracking'); triggerToast('Membuka Pelacakan Resi'); }} 
            className={`bbg-menu-item ${activeTab === 'tracking' ? 'active' : ''}`}
          >
            🔍 Lacak Resi AWB
          </button>
          <button 
            onClick={() => { setActiveTab('price'); triggerToast('Membuka Kalkulator Ongkir'); }} 
            className={`bbg-menu-item ${activeTab === 'price' ? 'active' : ''}`}
          >
            ⚖️ Cek Tarif & ODOL
          </button>
          <button 
            onClick={() => { setActiveTab('outlet'); triggerToast('Membuka Pencarian Hub'); }} 
            className={`bbg-menu-item ${activeTab === 'outlet' ? 'active' : ''}`}
          >
            🏪 Cari Cabang Hub
          </button>
          <button 
            onClick={() => { setActiveTab('simulator'); triggerToast('Membuka Simulator Peran'); }} 
            className={`bbg-menu-item ${activeTab === 'simulator' ? 'active' : ''}`}
          >
            🎛️ Simulator Sandboks
          </button>
        </div>
        <div style={{ marginTop: 'auto', borderTop: '1px solid #1e293b', paddingTop: '20px' }}>
          <p style={{ fontSize: '10px', color: '#64748b', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            System Standard v4.0
          </p>
        </div>
      </aside>

      {/* ==========================================
          MAIN AREA CONTENT (TOPBAR + GRID BODY)
          ========================================== */}
      <main className="bbg-main-area">
        
        {/* TOP BAR HEADER */}
        <header className="bbg-topbar">
          <div className="bbg-topbar-left">
            <h2>Portal Logistik Bahan Bangunan & Kargo Curah</h2>
          </div>
          <div className="bbg-topbar-right">
            <button onClick={() => setShowVipModal(true)} className="bbg-vip-badge-btn">
              👑 Daftar VIP Proyek
            </button>
            <span style={{ width: '1px', height: '24px', backgroundColor: '#cbd5e1' }}></span>
            <div className="bbg-profile-section">
              <span>👤</span>
              <span className="hidden md:inline">Kontraktor_Hub</span>
            </div>
          </div>
        </header>

        {/* CONTAINER CONTENT */}
        <div className="bbg-content">
          
          {/* STATS COUNTERS GRID */}
          <section className="bbg-stats-grid">
            <div className="bbg-stat-card">
              <span className="bbg-stat-title">Total Muatan Aktif</span>
              <span className="bbg-stat-value">3 Pengiriman</span>
              <span className="bbg-stat-badge success">🟢 3 Armada di Jalan</span>
            </div>
            <div className="bbg-stat-card">
              <span className="bbg-stat-title">Tonase Logistik</span>
              <span className="bbg-stat-value">3.700 Kg</span>
              <span className="bbg-stat-badge success">⚖️ Bebas ODOL</span>
            </div>
            <div className="bbg-stat-card">
              <span className="bbg-stat-title">Cabang Hub Depot</span>
              <span className="bbg-stat-value">5 Wilayah</span>
              <span className="bbg-stat-badge info">📍 Jawa & Banten</span>
            </div>
            <div className="bbg-stat-card">
              <span className="bbg-stat-title">Dana Escrow Terjamin</span>
              <span className="bbg-stat-value">Rp 12.5M</span>
              <span className="bbg-stat-badge info">🔒 Aman 100%</span>
            </div>
          </section>

          {/* ==========================================
              TAB CONTROLLER VIEW
              ========================================== */}

          {/* TAB 1: DASHBOARD (HOME SLIDER & CATEGORIES) */}
          {activeTab === 'dashboard' && (
            <div style={{ animation: 'fadeIn 0.4s ease' }}>
              
              {/* Dynamic Promo Banner Slider */}
              <div 
                className="bbg-promo-banner" 
                style={{ background: SLIDER_PHOTOS[currentSlide].bgGradient }}
              >
                <span className="bbg-promo-badge">{SLIDER_PHOTOS[currentSlide].badge}</span>
                <h1 className="bbg-promo-title">{SLIDER_PHOTOS[currentSlide].title}</h1>
                <p className="bbg-promo-desc">{SLIDER_PHOTOS[currentSlide].desc}</p>
                <div style={{ display: 'flex', gap: '12px' }}>
                  <button 
                    onClick={() => setShowVipModal(true)} 
                    className="bbg-vip-badge-btn"
                  >
                    Daftar Akun VIP
                  </button>
                  <button 
                    onClick={() => { setActiveTab('price'); triggerToast('Membuka Kalkulator ODOL'); }}
                    style={{ background: 'rgba(255,255,255,0.15)', color: '#ffffff', border: '1px solid rgba(255,255,255,0.2)', padding: '8px 16px', borderRadius: '10px', fontSize: '13px', fontWeight: '700', cursor: 'pointer' }}
                  >
                    ⚖️ Hitung Toleransi ODOL
                  </button>
                </div>

                <div className="bbg-promo-dots">
                  {SLIDER_PHOTOS.map((_, idx) => (
                    <button 
                      key={idx} 
                      onClick={() => setCurrentSlide(idx)}
                      className={`bbg-promo-dot ${currentSlide === idx ? 'active' : ''}`}
                    ></button>
                  ))}
                </div>
              </div>

              {/* Grid Categories */}
              <div className="bbg-interactive-card">
                <h3 className="bbg-card-title">🧱 Kategori Pengapalan Material Konstruksi</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px' }}>
                  {PRODUCT_CATEGORIES.map(cat => (
                    <div 
                      key={cat.id} 
                      onClick={() => { setActiveTab('price'); triggerToast(`Menyaring: ${cat.name}`); }}
                      style={{ padding: '20px', backgroundColor: '#f8fafc', borderRadius: '16px', border: '1px solid #e2e8f0', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '16px', transition: 'all 0.2s ease' }}
                    >
                      <span style={{ fontSize: '28px' }}>{cat.icon}</span>
                      <div>
                        <h4 style={{ margin: '0 0 4px 0', fontSize: '14px', fontWeight: '700', color: '#0f172a' }}>{cat.name}</h4>
                        <p style={{ margin: 0, fontSize: '11px', color: '#64748b', fontWeight: '500' }}>{cat.count}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          )}

          {/* TAB 2: RESI TRACKING */}
          {activeTab === 'tracking' && (
            <div className="bbg-interactive-card" style={{ animation: 'fadeIn 0.4s ease' }}>
              <h3 className="bbg-card-title">🔍 Lacak Pengiriman Material Real-Time</h3>
              <p style={{ fontSize: '13px', color: '#64748b', marginBottom: '20px' }}>
                Masukkan ID resi / AWB pengiriman Anda untuk melacak posisi armada kurir truk logistik.
              </p>
              
              <div style={{ display: 'flex', gap: '12px', marginBottom: '32px' }}>
                <input 
                  type="text" 
                  value={searchTrackingId}
                  onChange={(e) => setSearchTrackingId(e.target.value)}
                  placeholder="Masukkan Nomor Resi (Contoh: BBG-998122, BBG-776655, BBG-112233)"
                  className="bbg-form-control"
                  style={{ maxWidth: '400px' }}
                />
                <button 
                  onClick={() => {
                    if (searchedShipment) {
                      triggerToast(`Resi ${searchTrackingId} ditemukan!`);
                    } else {
                      triggerToast('Resi tidak ditemukan. Cek kembali ID Anda.');
                    }
                  }}
                  className="bbg-btn-primary"
                >
                  CEK RESI
                </button>
              </div>

              {searchedShipment ? (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '32px' }}>
                  
                  {/* Data Ringkas Paket */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <div style={{ borderBottom: '1px solid #e2e8f0', paddingBottom: '16px' }}>
                      <span style={{ backgroundColor: '#dcfce7', color: '#15803d', fontSize: '10px', fontWeight: '700', padding: '4px 10px', borderRadius: '6px', textTransform: 'uppercase' }}>
                        {searchedShipment.status}
                      </span>
                      <h4 style={{ fontSize: '18px', fontWeight: '800', margin: '12px 0 4px 0', color: '#0f172a' }}>{searchedShipment.id}</h4>
                      <p style={{ margin: 0, fontSize: '12px', color: '#64748b' }}>Pengapalan: {searchedShipment.date}</p>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '13px', color: '#334155' }}>
                      <p>📦 <b>Barang Muatan:</b> {searchedShipment.item}</p>
                      <p>🚛 <b>Armada Truk:</b> {searchedShipment.fleet}</p>
                      <p>👨‍✈️ <b>Nama Driver:</b> {searchedShipment.driver}</p>
                      <p>⏳ <b>Estimasi Tiba:</b> {searchedShipment.eta}</p>
                    </div>
                  </div>

                  {/* Visual Stepper Progress */}
                  <div className="bbg-timeline-container">
                    <h5 style={{ margin: '0 0 10px 0', fontSize: '14px', fontWeight: '700', color: '#0f172a' }}>Timeline Rute Pengiriman:</h5>
                    
                    <div className="bbg-timeline-progress-bar">
                      <div className="bbg-timeline-progress-fill" style={{ width: `${searchedShipment.progress}%` }}></div>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', fontWeight: '700', color: '#64748b' }}>
                      <span style={{ color: searchedShipment.progress >= 25 ? '#00805a' : '#64748b' }}>Disiapkan</span>
                      <span style={{ color: searchedShipment.progress >= 50 ? '#00805a' : '#64748b' }}>Dalam Perjalanan</span>
                      <span style={{ color: searchedShipment.progress >= 100 ? '#00805a' : '#64748b' }}>Selesai / Tiba</span>
                    </div>

                    <div style={{ backgroundColor: '#f1f5f9', borderLeft: '4px solid #00805a', padding: '12px', borderRadius: '8px', fontSize: '12px', color: '#334155', fontStyle: 'italic', marginTop: '10px' }}>
                      "{searchedShipment.statusDetail}"
                    </div>
                  </div>

                </div>
              ) : (
                <div style={{ padding: '40px', textAlign: 'center', backgroundColor: '#f8fafc', borderRadius: '16px', border: '1px solid #e2e8f0', color: '#64748b' }}>
                  ⚠️ Nomor resi tidak ditemukan. Gunakan ID demo bawaan seperti <b>BBG-998122</b> atau <b>BBG-776655</b>.
                </div>
              )}
            </div>
          )}

          {/* TAB 3: CEK HARGA & KALKULATOR ODOL */}
          {activeTab === 'price' && (
            <div className="bbg-interactive-card" style={{ animation: 'fadeIn 0.4s ease' }}>
              <h3 className="bbg-card-title">⚖️ Kalkulator Ongkir & Keamanan Muatan (Anti-ODOL)</h3>
              
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '32px' }}>
                
                {/* Inputs */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', marginBottom: '6px' }}>Pilih Tipe Armada</label>
                    <select 
                      value={calcFleet} 
                      onChange={(e) => setCalcFleet(e.target.value)}
                      className="bbg-form-control"
                    >
                      <option value="pickup">🚗 Mobil Pick-Up (Maks 1.5 Ton)</option>
                      <option value="engkel">🚚 Truk Engkel CDE (Maks 3 Ton)</option>
                      <option value="double">🚛 Truk Double CDD (Maks 7 Ton)</option>
                    </select>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', marginBottom: '6px' }}>Jarak Rute (Km)</label>
                      <input 
                        type="number" 
                        value={calcDistance} 
                        onChange={(e) => setCalcDistance(Math.max(1, parseInt(e.target.value) || 0))}
                        className="bbg-form-control"
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', marginBottom: '6px' }}>Berat Muatan (Kg)</label>
                      <input 
                        type="number" 
                        value={calcWeight} 
                        onChange={(e) => setCalcWeight(Math.max(1, parseInt(e.target.value) || 0))}
                        className="bbg-form-control"
                      />
                    </div>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', marginBottom: '6px' }}>Volume Muatan (m³)</label>
                    <input 
                      type="number" 
                      step="0.1"
                      value={calcVolume} 
                      onChange={(e) => setCalcVolume(Math.max(0.1, parseFloat(e.target.value) || 0))}
                      className="bbg-form-control"
                    />
                  </div>

                  <label style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13px', fontWeight: '600', cursor: 'pointer' }}>
                    <input 
                      type="checkbox" 
                      checked={helperService}
                      onChange={(e) => setHelperService(e.target.checked)}
                      style={{ width: '18px', height: '18px', accentColor: '#00805a' }}
                    />
                    <span>Gunakan Jasa Helper Bongkar Muat (+Rp50.000)</span>
                  </label>
                </div>

                {/* Pricing Summary Box */}
                <div style={{ backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '20px', padding: '32px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                  <div>
                    <span style={{ fontSize: '11px', color: '#64748b', fontWeight: '700', textTransform: 'uppercase' }}>Estimasi Biaya Pengiriman</span>
                    <h1 style={{ fontSize: '32px', fontWeight: '800', color: '#0f172a', margin: '8px 0 24px 0' }}>
                      Rp {calculatedPrice.toLocaleString('id-ID')}
                    </h1>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '13px', color: '#475569', borderTop: '1px solid #e2e8f0', paddingTop: '20px' }}>
                      <p>🛣️ <b>Total Jarak:</b> {calcDistance} Km</p>
                      <p>⚖️ <b>Bobot Muatan:</b> {calcWeight} Kg</p>
                      <p>📐 <b>Volume Muatan:</b> {calcVolume} m³</p>
                    </div>
                  </div>

                  {/* ODOL Safety warning banner */}
                  <div style={{ 
                    marginTop: '24px', 
                    padding: '16px', 
                    borderRadius: '12px', 
                    fontSize: '12px', 
                    fontWeight: '600', 
                    border: '1px solid',
                    backgroundColor: odolAlert ? '#fef2f2' : '#f0fdf4',
                    borderColor: odolAlert ? '#fca5a5' : '#bbf7d0',
                    color: odolAlert ? '#991b1b' : '#166534'
                  }}>
                    {odolAlert ? (
                      <span>🚨 <b>Overloading Warning (ODOL)!</b> Bobot melebihi kapasitas standar armada pilihan Anda. Harap tingkatkan armada atau pecah muatan demi keselamatan.</span>
                    ) : (
                      <span>✅ <b>Muatan Aman!</b> Berat muatan Anda sesuai dengan regulasi kapasitas angkut jalan raya nasional.</span>
                    )}
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* TAB 4: CABANG HUB DEPOT */}
          {activeTab === 'outlet' && (
            <div className="bbg-interactive-card" style={{ animation: 'fadeIn 0.4s ease' }}>
              <h3 className="bbg-card-title">🏪 Hub Depot Utama & Pusat Distribusi</h3>
              
              {/* Region Filter Buttons */}
              <div style={{ display: 'flex', gap: '10px', marginBottom: '24px' }}>
                {['Jakarta', 'Tangerang', 'Bekasi', 'Bandung'].map(city => (
                  <button
                    key={city}
                    onClick={() => setSelectedRegion(city)}
                    style={{ 
                      padding: '8px 16px', 
                      borderRadius: '8px', 
                      fontSize: '13px', 
                      fontWeight: '700', 
                      border: '1px solid',
                      cursor: 'pointer',
                      backgroundColor: selectedRegion === city ? '#00805a' : '#ffffff',
                      color: selectedRegion === city ? '#ffffff' : '#475569',
                      borderColor: selectedRegion === city ? '#00805a' : '#cbd5e1'
                    }}
                  >
                    {city}
                  </button>
                ))}
              </div>

              {/* Grid Hub Depots */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
                {DEPOT_OUTLETS.filter(o => o.region === selectedRegion).map((outlet, idx) => (
                  <div key={idx} style={{ padding: '24px', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <h4 style={{ margin: '0 0 8px 0', fontSize: '15px', fontWeight: '700', color: '#0f172a' }}>{outlet.name}</h4>
                      <p style={{ margin: '0 0 12px 0', fontSize: '12px', color: '#64748b', lineHeight: '1.4' }}>{outlet.address}</p>
                      <p style={{ margin: 0, fontSize: '12px', color: '#00805a', fontWeight: '700' }}>📞 {outlet.tel}</p>
                    </div>
                    <span style={{ backgroundColor: '#dcfce7', color: '#15803d', fontSize: '10px', fontWeight: '700', padding: '4px 8px', borderRadius: '6px' }}>
                      BUKA
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 5: SIMULATOR PERAN (MULTI-ROLE SANDBOX) */}
          {activeTab === 'simulator' && (
            <div className="bbg-interactive-card" style={{ animation: 'fadeIn 0.4s ease' }}>
              <div style={{ borderBottom: '1px solid #e2e8f0', paddingBottom: '16px', marginBottom: '24px' }}>
                <h3 className="bbg-card-title" style={{ marginBottom: '8px' }}>🎛️ Simulator Sandboks Multi-Peran</h3>
                <p style={{ fontSize: '13px', color: '#64748b', margin: 0 }}>
                  Ubah peran Anda di bawah ini untuk mensimulasikan alur pengiriman semen/pasir, konfirmasi toko, hingga tanda tangan serah terima digital.
                </p>
              </div>

              {/* Selector Mode Sandbox */}
              <div style={{ display: 'flex', gap: '8px', marginBottom: '32px', backgroundColor: '#f1f5f9', padding: '6px', borderRadius: '12px', width: 'fit-content' }}>
                {[
                  { id: 'customer', label: 'Konsumen', icon: '👤' },
                  { id: 'merchant', label: 'Toko Material', icon: '🏪' },
                  { id: 'driver', label: 'Sopir Truk', icon: '🚛' }
                ].map(role => (
                  <button
                    key={role.id}
                    onClick={() => { setActiveRole(role.id); triggerToast(`Ubah Mode Simulasi: ${role.label}`); }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '8px 16px',
                      borderRadius: '8px',
                      fontSize: '13px',
                      fontWeight: '700',
                      border: 'none',
                      cursor: 'pointer',
                      backgroundColor: activeRole === role.id ? '#0f172a' : 'transparent',
                      color: activeRole === role.id ? '#ffffff' : '#64748b'
                    }}
                  >
                    <span>{role.icon}</span>
                    <span>{role.label}</span>
                  </button>
                ))}
              </div>

              {/* SIMULATOR SCREEN CONTENT BY ACTIVE ROLE */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '32px' }}>
                
                {/* LEFT SIDE: ACTION PANEL */}
                <div>
                  
                  {/* ROLE 1: CUSTOMER VIEW */}
                  {activeRole === 'customer' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                      <h4 style={{ margin: 0, fontSize: '15px', color: '#0f172a', fontWeight: '700' }}>🛒 Panel Pelanggan (Pilih & Pantau Resi)</h4>
                      
                      <div style={{ backgroundColor: '#f8fafc', padding: '16px', borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '13px' }}>
                        <p style={{ margin: '0 0 4px 0', color: '#64748b' }}>Simulasi Paket Belanja:</p>
                        <p style={{ margin: 0, fontWeight: '700' }}>20 Sak Semen Padang (1 Ton) - Rp 1.440.000</p>
                      </div>

                      <div>
                        <p style={{ fontSize: '12px', fontWeight: '700', color: '#64748b', marginBottom: '8px' }}>PILIH ID RESI UNTUK DIPANTAU:</p>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                          {shipments.map(s => (
                            <button
                              key={s.id}
                              onClick={() => { setSelectedShipmentId(s.id); setSearchTrackingId(s.id); triggerToast(`Memilih Resi ${s.id}`); }}
                              style={{
                                padding: '12px',
                                borderRadius: '10px',
                                border: '1px solid',
                                cursor: 'pointer',
                                textAlign: 'left',
                                fontSize: '12px',
                                fontWeight: '600',
                                backgroundColor: selectedShipmentId === s.id ? '#f0fdf4' : '#ffffff',
                                borderColor: selectedShipmentId === s.id ? '#00805a' : '#e2e8f0',
                                color: selectedShipmentId === s.id ? '#00805a' : '#334155'
                              }}
                            >
                              🚚 <b>{s.id}</b> ({s.item}) - {s.status}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* ROLE 2: MERCHANT VIEW */}
                  {activeRole === 'merchant' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                      <h4 style={{ margin: 0, fontSize: '15px', color: '#0f172a', fontWeight: '700' }}>🏪 Panel Mitra Toko (Konfirmasi Material)</h4>
                      <p style={{ fontSize: '13px', color: '#475569', margin: 0 }}>
                        Gunakan simulator tombol di bawah untuk menggerakkan status pengiriman kurir di database BahanBangunGo.
                      </p>

                      <div style={{ display: 'flex', gap: '12px' }}>
                        <button onClick={handleSimulateProgress} className="bbg-btn-primary">
                          ⚡ Jalankan Kurir (Update Progress)
                        </button>
                        <button 
                          onClick={() => { setShipments(INITIAL_SHIPMENTS); triggerToast('Database simulasi disetel ulang'); }}
                          style={{ padding: '12px 20px', borderRadius: '12px', border: '1px solid #cbd5e1', backgroundColor: '#ffffff', color: '#475569', fontSize: '13px', fontWeight: '700', cursor: 'pointer' }}
                        >
                          Reset Data
                        </button>
                      </div>
                    </div>
                  )}

                  {/* ROLE 3: DRIVER VIEW */}
                  {activeRole === 'driver' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                      <h4 style={{ margin: 0, fontSize: '15px', color: '#0f172a', fontWeight: '700' }}>🚛 Aplikasi Sopir (Bukti Pengiriman - PoD)</h4>
                      <p style={{ fontSize: '12px', color: '#64748b', margin: 0 }}>
                        Gunakan modul ini di lokasi bongkar muatan semen/pasir proyek untuk meminta bukti foto & tanda tangan penerima.
                      </p>

                      {/* Photo upload mock */}
                      <div style={{ border: '1px dashed #cbd5e1', borderRadius: '16px', padding: '20px', textAlign: 'center', backgroundColor: '#f8fafc' }}>
                        {podPhoto ? (
                          <div style={{ position: 'relative' }}>
                            <img src={podPhoto} alt="POD" style={{ width: '100%', maxHeight: '140px', objectFit: 'cover', borderRadius: '8px' }} />
                            <button 
                              onClick={() => setPodPhoto(null)}
                              style={{ position: 'absolute', top: '8px', right: '8px', backgroundColor: '#ef4444', color: '#ffffff', border: 'none', borderRadius: '4px', fontSize: '10px', padding: '4px 8px', cursor: 'pointer' }}
                            >
                              Hapus
                            </button>
                          </div>
                        ) : (
                          <div>
                            <span style={{ fontSize: '28px', display: 'block', marginBottom: '8px' }}>📷</span>
                            <p style={{ margin: '0 0 10px 0', fontSize: '12px', fontWeight: '700' }}>Ambil Foto Material Bongkar</p>
                            <button 
                              onClick={() => setPodPhoto('https://images.unsplash.com/photo-1590069261209-f8e9b8642343?auto=format&fit=crop&w=600&q=80')}
                              style={{ padding: '6px 12px', fontSize: '11px', fontWeight: '700', borderRadius: '6px', border: '1px solid #cbd5e1', backgroundColor: '#ffffff', cursor: 'pointer' }}
                            >
                              Gunakan Kamera Simulasi
                            </button>
                          </div>
                        )}
                      </div>

                      {/* Signature Canvas */}
                      <div style={{ border: '1px solid #cbd5e1', borderRadius: '16px', padding: '16px', backgroundColor: '#ffffff' }}>
                        <p style={{ margin: '0 0 8px 0', fontSize: '11px', fontWeight: '700', color: '#64748b', textTransform: 'uppercase' }}>Tanda Tangan Penerima:</p>
                        
                        <div style={{ height: '90px', border: '1px solid #e2e8f0', borderRadius: '8px', position: 'relative', overflow: 'hidden' }}>
                          <canvas
                            ref={canvasRef}
                            onMouseDown={startDrawing}
                            onMouseMove={draw}
                            onMouseUp={() => setIsDrawing(false)}
                            onTouchStart={startDrawing}
                            onTouchMove={draw}
                            onTouchEnd={() => setIsDrawing(false)}
                            style={{ display: 'block', width: '100%', height: '100%', cursor: 'crosshair' }}
                          />
                          {signatureSaved && (
                            <div style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(220, 252, 231, 0.9)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: '700', color: '#15803d' }}>
                              ✅ Tanda Tangan Terkunci
                            </div>
                          )}
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '10px' }}>
                          <button 
                            onClick={() => {
                              const canvas = canvasRef.current;
                              if (canvas) {
                                const ctx = canvas.getContext('2d');
                                ctx.clearRect(0, 0, canvas.width, canvas.height);
                                setSignatureSaved(false);
                              }
                            }}
                            style={{ border: 'none', background: 'none', color: '#ef4444', fontSize: '11px', fontWeight: '700', cursor: 'pointer' }}
                          >
                            Hapus TTD
                          </button>
                          <button 
                            onClick={saveSignature}
                            style={{ border: 'none', background: 'none', color: '#00805a', fontSize: '11px', fontWeight: '700', cursor: 'pointer' }}
                          >
                            Kunci TTD
                          </button>
                        </div>
                      </div>

                      <button
                        onClick={() => handleCompleteDelivery(selectedShipmentId)}
                        disabled={!podPhoto || !signatureSaved}
                        className="bbg-btn-primary"
                        style={{ opacity: (podPhoto && signatureSaved) ? 1 : 0.5, cursor: (podPhoto && signatureSaved) ? 'pointer' : 'not-allowed' }}
                      >
                        Selesaikan Pengantaran Paket ✔️
                      </button>
                    </div>
                  )}

                </div>

                {/* RIGHT SIDE: HUB DATABASE MONITOR */}
                <div style={{ backgroundColor: '#f8fafc', padding: '24px', borderRadius: '20px', border: '1px solid #e2e8f0' }}>
                  <h4 style={{ margin: '0 0 16px 0', fontSize: '13px', color: '#64748b', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Monitor Basis Data (Database Hub)
                  </h4>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {shipments.map(s => (
                      <div 
                        key={s.id} 
                        style={{ padding: '16px', backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid #cbd5e1', fontSize: '12px' }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: '700', marginBottom: '4px' }}>
                          <span style={{ color: '#0f172a' }}>{s.id}</span>
                          <span style={{ color: '#00805a' }}>{s.status}</span>
                        </div>
                        <p style={{ margin: '0 0 8px 0', color: '#64748b' }}>{s.item}</p>
                        
                        {/* mini progress fills */}
                        <div style={{ height: '4px', backgroundColor: '#e2e8f0', borderRadius: '2px', overflow: 'hidden' }}>
                          <div style={{ height: '100%', backgroundColor: '#00805a', width: `${s.progress}%` }}></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            </div>
          )}

        </div>

        {/* FOOTER */}
        <footer style={{ backgroundColor: '#0f172a', color: '#94a3b8', padding: '24px 40px', fontSize: '12px', borderTop: '1px solid #1e293b', marginTop: 'auto', textAlign: 'center' }}>
          <p style={{ margin: 0 }}>© 2026 BahanBangunGo Cargo Portal. Hak Cipta Dilindungi Undang-Undang.</p>
        </footer>

      </main>

      {/* ==========================================
          FLOATING QUICK ACTIONS WIDGETS
          ========================================== */}
      <div className="bbg-floating-widget">
        <button onClick={() => { setActiveTab('price'); triggerToast('Membuka Kalkulator Ongkos Kirim'); }} title="Cek Tarif" className="bbg-floating-btn">📊</button>
        <button onClick={() => { setActiveTab('outlet'); triggerToast('Membuka Peta Lokasi Depot'); }} title="Lokasi Hub" className="bbg-floating-btn">📍</button>
        <button onClick={() => setShowVipModal(true)} title="VIP Registrasi" className="bbg-floating-btn">👑</button>
      </div>

      {/* ==========================================
          MODAL REGISTRASI VIP CLIENT (B2B PORTAL)
          ========================================== */}
      {showVipModal && (
        <div className="bbg-modal-overlay">
          <div className="bbg-modal-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '800', color: '#0f172a' }}>👑 Pengajuan VIP Client B2B</h3>
              <button 
                onClick={() => setShowVipModal(false)}
                style={{ background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer', color: '#64748b' }}
              >
                ✕
              </button>
            </div>
            
            <p style={{ fontSize: '12px', color: '#64748b', marginBottom: '24px', lineHeight: '1.5' }}>
              Dapatkan keuntungan pembayaran tempo 30 hari, proteksi jaminan anti-ODOL secara gratis, flat-rate pengiriman 10%, dan bantuan prioritas armada.
            </p>

            <form 
              onSubmit={(e) => {
                e.preventDefault();
                setShowVipModal(false);
                triggerToast(`Sukses mendaftarkan perusahaan ${vipForm.company}! Tim B2B kami akan segera menghubungi Anda.`);
              }}
              style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}
            >
              <div>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', marginBottom: '4px' }}>Nama Perusahaan</label>
                <input 
                  type="text" 
                  value={vipForm.company}
                  onChange={(e) => setVipForm({ ...vipForm, company: e.target.value })}
                  placeholder="Contoh: PT. Adhi Karya Semesta"
                  className="bbg-form-control"
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', marginBottom: '4px' }}>Nama PIC</label>
                  <input 
                    type="text" 
                    value={vipForm.pic}
                    onChange={(e) => setVipForm({ ...vipForm, pic: e.target.value })}
                    placeholder="Nama Anda"
                    className="bbg-form-control"
                    required
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', marginBottom: '4px' }}>Nomor HP</label>
                  <input 
                    type="text" 
                    value={vipForm.phone}
                    onChange={(e) => setVipForm({ ...vipForm, phone: e.target.value })}
                    placeholder="Nomor Telepon"
                    className="bbg-form-control"
                    required
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', marginBottom: '4px' }}>Alamat Kantor</label>
                <textarea 
                  value={vipForm.address}
                  onChange={(e) => setVipForm({ ...vipForm, address: e.target.value })}
                  placeholder="Alamat Lengkap Perusahaan"
                  className="bbg-form-control"
                  style={{ height: '70px', resize: 'none' }}
                  required
                />
              </div>

              <button type="submit" className="bbg-btn-primary" style={{ marginTop: '10px' }}>
                KIRIM PENGAJUAN VIP PROYEK 🚀
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}