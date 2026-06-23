import React, { useState, useEffect, useRef } from 'react';

// ==========================================
// DATA SIMULASI DATABASE UTAMA (MUTABLE)
// ==========================================
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
    bgGradient: 'from-emerald-900 via-emerald-800 to-teal-800'
  },
  {
    id: 2,
    title: '👑 REGISTRASI VIP CLIENT UNTUK KONTRAKTOR PROYEK',
    desc: 'Nikmati kemudahan pembayaran termin (Tempo 30 Hari), diskon tarif pengiriman flat-rate 10%, serta fasilitas bebas biaya kuli bongkar di lokasi.',
    badge: '💎 MEMBER B2B',
    bgGradient: 'from-slate-900 via-blue-950 to-indigo-900'
  },
  {
    id: 3,
    title: '🛠️ KEAMANAN MUATAN PRIORITAS JALAN RAYA',
    desc: 'Sistem logistik kami dilengkapi kecerdasan konversi berat-volume otomatis untuk merekomendasikan armada yang tepat sesuai regulasi jalan raya nasional.',
    badge: '🛡️ GARANSI ANTI-ODOL',
    bgGradient: 'from-amber-950 via-stone-900 to-emerald-950'
  }
];

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard'); // dashboard | tracking | price | outlet | order
  const [shipments, setShipments] = useState(INITIAL_SHIPMENTS);
  const [selectedShipmentId, setSelectedShipmentId] = useState('BBG-998122');
  const [searchTrackingId, setSearchTrackingId] = useState('BBG-998122');
  const [activeRole, setActiveRole] = useState('customer'); // customer | admin | driver | merchant
  
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

  // Auto-Slide untuk Banner Promosi
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % SLIDER_PHOTOS.length);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  // Kalkulator Tarif & Proteksi ODOL
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

  // Handlers Tanda Tangan Canvas Driver
  const startDrawing = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    ctx.strokeStyle = '#000000';
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
    <div className="min-h-screen bg-[#F8FAFC] font-sans text-slate-800 flex flex-col justify-between antialiased selection:bg-[#00805A] selection:text-white">
      
      {}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
        
        body {
          font-family: 'Plus Jakarta Sans', sans-serif !important;
          background-color: #F8FAFC;
        }

        .bg-logistics-green {
          background-color: #00805A;
        }

        .text-logistics-green {
          color: #00805A;
        }

        .bg-logistics-yellow {
          background-color: #F2C335;
        }

        .custom-glass {
          background: rgba(255, 255, 255, 0.9);
          backdrop-filter: blur(12px);
          border: 1px solid rgba(255, 255, 255, 0.6);
        }

        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>

      {/* TOAST ALERTS */}
      {toastMessage && (
        <div className="fixed top-24 left-1/2 transform -translate-x-1/2 z-[100] bg-slate-900 text-white text-xs font-bold px-6 py-3.5 rounded-full shadow-2xl flex items-center gap-2.5 animate-bounce border border-slate-800">
          <span className="w-2.5 h-2.5 rounded-full bg-[#F2C335] animate-ping"></span>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* =======================================================
          TOP NAVBAR (LOGISTICS ENTERPRISE STANDARD)
          ======================================================= */}
      <header className="bg-white border-b border-slate-100 sticky top-0 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-3 flex justify-between items-center">
          <div className="flex items-center gap-8">
            {/* Logo Brand */}
            <div className="flex items-center gap-2 cursor-pointer" onClick={() => setActiveTab('dashboard')}>
              <span className="text-3xl">🏗️</span>
              <div>
                <h1 className="font-extrabold text-xl tracking-tight text-slate-900 leading-none flex items-center gap-1.5">
                  BahanBangun<span className="text-[#00805A]">Go</span>
                  <span className="text-[10px] bg-slate-100 text-[#00805A] px-2 py-0.5 rounded-md font-bold uppercase">Cargo</span>
                </h1>
                <p className="text-[10px] text-slate-400 font-bold tracking-widest mt-0.5">INTEGRATED LOGISTICS PORTAL</p>
              </div>
            </div>

            {/* Desktop Nav Links */}
            <nav className="hidden lg:flex items-center gap-6 text-xs font-bold text-slate-600">
              <button onClick={() => setActiveTab('dashboard')} className={`hover:text-[#00805A] transition uppercase ${activeTab === 'dashboard' ? 'text-[#00805A]' : ''}`}>Dashboard</button>
              <button onClick={() => setActiveTab('tracking')} className={`hover:text-[#00805A] transition uppercase ${activeTab === 'tracking' ? 'text-[#00805A]' : ''}`}>Lacak Resi</button>
              <button onClick={() => setActiveTab('price')} className={`hover:text-[#00805A] transition uppercase ${activeTab === 'price' ? 'text-[#00805A]' : ''}`}>Kalkulator</button>
              <button onClick={() => setActiveTab('outlet')} className={`hover:text-[#00805A] transition uppercase ${activeTab === 'outlet' ? 'text-[#00805A]' : ''}`}>Cabang Hub</button>
            </nav>
          </div>

          <div className="flex items-center gap-3">
            {/* VIP Client Portal Action Button */}
            <button 
              onClick={() => setShowVipModal(true)}
              className="bg-[#F2C335] hover:bg-[#E0B224] text-slate-950 text-xs font-extrabold px-4 py-2.5 rounded-xl transition shadow-md shadow-amber-500/10"
            >
              👑 Registrasi VIP Client
            </button>
            <span className="w-px h-6 bg-slate-200"></span>
            <span className="text-xs font-bold text-slate-600 hidden sm:inline">👤 Contractor_Hub</span>
          </div>
        </div>
      </header>

      {}
      {/* =======================================================
          DYNAMIC PHOTO SLIDER (DYNAMIC BANNER CAROUSEL)
          ======================================================= */}
      <section className="relative overflow-hidden text-white transition-all duration-700 ease-in-out">
        <div className={`bg-gradient-to-r ${SLIDER_PHOTOS[currentSlide].bgGradient} py-12 lg:py-20 px-4 transition-all duration-700`}>
          
          <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
            <div className="lg:col-span-8 space-y-4 text-center lg:text-left">
              <span className="inline-flex items-center gap-1.5 bg-[#F2C335] text-slate-950 font-black text-[10px] px-3.5 py-1 rounded-full uppercase tracking-widest">
                {SLIDER_PHOTOS[currentSlide].badge}
              </span>
              <h2 className="text-3xl lg:text-5xl font-black tracking-tight leading-tight uppercase transition-all duration-500">
                {SLIDER_PHOTOS[currentSlide].title}
              </h2>
              <p className="text-sm text-emerald-100 max-w-2xl font-medium leading-relaxed">
                {SLIDER_PHOTOS[currentSlide].desc}
              </p>
              
              <div className="pt-2 flex flex-wrap justify-center lg:justify-start gap-3">
                <button 
                  onClick={() => setShowVipModal(true)}
                  className="bg-[#F2C335] hover:bg-white hover:text-slate-900 text-slate-950 font-black text-xs px-6 py-3 rounded-xl transition shadow-lg"
                >
                  Daftar Kontraktor VIP
                </button>
                <button 
                  onClick={() => {
                    setActiveTab('price');
                    triggerToast('Membuka Kalkulator Ongkir.');
                  }}
                  className="bg-white/10 hover:bg-white/20 border border-white/20 font-bold text-xs px-5 py-3 rounded-xl transition"
                >
                  📊 Kalkulator ODOL
                </button>
              </div>
            </div>

            {/* Graphic Side: Interactive Visual Representation */}
            <div className="lg:col-span-4 hidden lg:flex justify-end relative">
              <div className="bg-white/10 backdrop-blur-md rounded-3xl p-6 border border-white/10 shadow-2xl w-full max-w-sm">
                <p className="text-xs font-bold text-emerald-300 uppercase tracking-wider mb-2">Simulasi Status Ekspedisi</p>
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">🚛</span>
                    <div>
                      <h4 className="text-xs font-bold text-white">CDE Engkel Jakarta</h4>
                      <p className="text-[10px] text-slate-300">Muatan Semen Padang (1 Ton)</p>
                    </div>
                  </div>
                  <div className="h-1.5 bg-white/20 rounded-full overflow-hidden">
                    <div className="h-full bg-[#F2C335] animate-pulse" style={{ width: '65%' }}></div>
                  </div>
                  <div className="flex justify-between text-[10px] text-emerald-100">
                    <span>Estimasi Selesai</span>
                    <span className="font-bold">45 Menit</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Slider Controls / Dots */}
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2 z-20">
            {SLIDER_PHOTOS.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentSlide(index)}
                className={`w-2.5 h-2.5 rounded-full transition-all ${
                  currentSlide === index ? 'bg-[#F2C335] w-6' : 'bg-white/40'
                }`}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>

        </div>
      </section>

      {}
      {/* =======================================================
          WIDGET HUB UTAMA (CEK STATUS, CEK HARGA, CEK OUTLET)
          ======================================================= */}
      <section className="max-w-7xl w-full mx-auto px-4 -mt-8 relative z-20">
        <div className="bg-white rounded-[24px] shadow-xl border border-slate-100 p-5 lg:p-6">
          
          {/* Tabs Navigator */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-2 border-b border-slate-100 pb-4 mb-6">
            {[
              { id: 'dashboard', label: '📊 Dasbor Analitik', icon: '📈' },
              { id: 'tracking', label: '🔍 Lacak Resi', icon: '📦' },
              { id: 'price', label: '⚖️ Cek Tarif (Anti-ODOL)', icon: '💵' },
              { id: 'outlet', label: '🏪 Cari Outlet Hub', icon: '📍' },
              { id: 'order', label: '🏗️ Buat Order Baru', icon: '📝' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id);
                  triggerToast(`Membuka panel ${tab.label}`);
                }}
                className={`flex items-center gap-2 px-4 py-3 rounded-xl text-xs font-extrabold transition-all ${
                  activeTab === tab.id 
                    ? 'bg-[#00805A] text-white shadow-md shadow-emerald-700/10' 
                    : 'bg-slate-50 text-slate-500 hover:bg-slate-100'
                }`}
              >
                <span>{tab.icon}</span>
                <span>{tab.label}</span>
              </button>
            ))}
          </div>

          {}
          {/* TAB: DASHBOARD ANALITIK */}
          {activeTab === 'dashboard' && (
            <div className="space-y-6">
              
              {/* Stats Counters */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-slate-50 border border-slate-100 p-4 rounded-2xl">
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Total Muatan Aktif</p>
                  <p className="text-2xl font-extrabold text-slate-900 mt-1">3 Pengiriman</p>
                  <span className="text-[9px] text-emerald-600 font-bold">🟢 3 Armada di Jalan</span>
                </div>
                <div className="bg-slate-50 border border-slate-100 p-4 rounded-2xl">
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Tonase Logistik</p>
                  <p className="text-2xl font-extrabold text-slate-900 mt-1">3.700 Kg</p>
                  <span className="text-[9px] text-emerald-600 font-bold">⚖️ Bebas ODOL</span>
                </div>
                <div className="bg-slate-50 border border-slate-100 p-4 rounded-2xl">
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Cabang Hub Depot</p>
                  <p className="text-2xl font-extrabold text-slate-900 mt-1">5 Wilayah</p>
                  <span className="text-[9px] text-slate-500 font-bold">📍 Jawa & Banten</span>
                </div>
                <div className="bg-slate-50 border border-slate-100 p-4 rounded-2xl">
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Dana Escrow Terkunci</p>
                  <p className="text-2xl font-extrabold text-slate-900 mt-1">Rp 12.5M</p>
                  <span className="text-[9px] text-emerald-600 font-bold">🔒 Terjamin 100% Aman</span>
                </div>
              </div>

              {/* Categories Grid */}
              <div>
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Kategori Material Logistik</h4>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                  {PRODUCT_CATEGORIES.map(cat => (
                    <div 
                      key={cat.id} 
                      onClick={() => {
                        setActiveTab('order');
                        triggerToast(`Menyaring kategori: ${cat.name}`);
                      }}
                      className="bg-white border border-slate-100 hover:border-emerald-500/30 p-4 rounded-2xl cursor-pointer transition-all hover:shadow-md flex items-center gap-3 group"
                    >
                      <span className="text-2xl p-2.5 bg-slate-50 rounded-xl group-hover:bg-emerald-50 transition">{cat.icon}</span>
                      <div>
                        <h5 className="font-extrabold text-xs text-slate-900 leading-none">{cat.name}</h5>
                        <p className="text-[9px] text-slate-400 mt-1">{cat.count}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          )}

          {}
          {/* TAB 1: CEK STATUS RESI (LACAK REAL-TIME) */}
          {activeTab === 'tracking' && (
            <div className="space-y-6">
              <div className="flex flex-col md:flex-row gap-3">
                <div className="flex-1 relative">
                  <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400">🎫</span>
                  <input 
                    type="text" 
                    value={searchTrackingId}
                    onChange={(e) => setSearchTrackingId(e.target.value)}
                    placeholder="Masukkan Nomor Resi / ID Order Anda (Contoh: BBG-998122, BBG-776655)" 
                    className="w-full text-xs font-bold border border-slate-200 rounded-xl pl-10 pr-4 py-3.5 focus:outline-none focus:ring-2 focus:ring-[#00805A]"
                  />
                </div>
                <button 
                  onClick={() => {
                    if (searchedShipment) {
                      triggerToast(`Resi ${searchTrackingId} ditemukan!`);
                    } else {
                      triggerToast(`Resi tidak ditemukan. Gunakan ID simulasi.`);
                    }
                  }}
                  className="bg-[#00805A] hover:bg-[#006647] text-white text-xs font-black px-6 py-3.5 rounded-xl transition"
                >
                  CEK RESI
                </button>
              </div>

              {/* Hasil Pelacakan Resi */}
              {searchedShipment ? (
                <div className="bg-slate-50 rounded-2xl p-5 border border-slate-100 grid grid-cols-1 lg:grid-cols-12 gap-6">
                  
                  {/* Informasi Ringkas */}
                  <div className="lg:col-span-4 space-y-4 border-b lg:border-b-0 lg:border-r border-slate-200 pb-5 lg:pb-0 lg:pr-6">
                    <div>
                      <span className="text-[10px] bg-emerald-100 text-[#00805A] px-2.5 py-1 rounded-md font-bold uppercase">{searchedShipment.status}</span>
                      <h4 className="text-base font-extrabold text-slate-900 mt-2">{searchedShipment.id}</h4>
                      <p className="text-xs text-slate-400 mt-0.5">Tanggal Pengapalan: {searchedShipment.date}</p>
                    </div>

                    <div className="text-xs space-y-2 text-slate-600">
                      <p>📦 <b>Barang:</b> {searchedShipment.item}</p>
                      <p>🚛 <b>Armada:</b> {searchedShipment.fleet}</p>
                      <p>👨‍✈️ <b>Driver:</b> {searchedShipment.driver}</p>
                      <p>⏳ <b>Estimasi Tiba:</b> {searchedShipment.eta}</p>
                    </div>
                  </div>

                  {/* Rute & Live Stepper Progress */}
                  <div className="lg:col-span-8 flex flex-col justify-between">
                    <div>
                      <h5 className="font-extrabold text-xs text-slate-800 mb-3">Timeline Pelacakan Pengiriman:</h5>
                      
                      {/* Horizontal progress tracker */}
                      <div className="relative py-4">
                        <div className="h-1 bg-slate-200 rounded-full w-full absolute top-1/2 transform -translate-y-1/2"></div>
                        <div 
                          className="h-1 bg-[#00805A] rounded-full absolute top-1/2 transform -translate-y-1/2 transition-all duration-700"
                          style={{ width: `${searchedShipment.progress}%` }}
                        ></div>
                        
                        {/* Stepper Milestones */}
                        <div className="flex justify-between relative z-10">
                          <div className="flex flex-col items-center">
                            <span className="w-4 h-4 rounded-full border-2 border-white bg-[#00805A]"></span>
                            <span className="text-[9px] font-bold text-slate-500 mt-1">Disiapkan</span>
                          </div>
                          <div className="flex flex-col items-center">
                            <span className={`w-4 h-4 rounded-full border-2 border-white ${searchedShipment.progress >= 50 ? 'bg-[#00805A]' : 'bg-slate-200'}`}></span>
                            <span className="text-[9px] font-bold text-slate-500 mt-1">Dalam Perjalanan</span>
                          </div>
                          <div className="flex flex-col items-center">
                            <span className={`w-4 h-4 rounded-full border-2 border-white ${searchedShipment.progress >= 100 ? 'bg-[#00805A]' : 'bg-slate-200'}`}></span>
                            <span className="text-[9px] font-bold text-slate-500 mt-1">Tiba</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="bg-[#00805A]/5 border border-[#00805A]/10 rounded-xl p-3 mt-4">
                      <p className="text-[10px] text-[#00805A] font-bold uppercase tracking-wider">Status Terkini:</p>
                      <p className="text-xs text-slate-700 font-medium mt-1">"{searchedShipment.statusDetail}"</p>
                    </div>
                  </div>

                </div>
              ) : (
                <div className="text-center py-6 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                  <span className="text-3xl">⚠️</span>
                  <p className="text-xs text-slate-500 font-bold mt-2">Nomor resi "{searchTrackingId}" tidak ditemukan. Harap pastikan kembali.</p>
                </div>
              )}
            </div>
          )}

          {}
          {/* TAB 2: CEK HARGA (KALKULATOR ONGKIR & ANTI-ODOL) */}
          {activeTab === 'price' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              
              {/* Parameter Input */}
              <div className="lg:col-span-7 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Pilih Jenis Kendaraan / Armada</label>
                    <select 
                      value={calcFleet}
                      onChange={(e) => setCalcFleet(e.target.value)}
                      className="w-full text-xs font-bold border border-slate-200 rounded-xl p-3 focus:outline-none focus:ring-1 focus:ring-[#00805A]"
                    >
                      <option value="pickup">🚗 Mobil Pick-Up (Maks 1.5 Ton)</option>
                      <option value="engkel">🚚 Truk Engkel CDE (Maks 3 Ton)</option>
                      <option value="double">🚛 Truk Double CDD (Maks 7 Ton)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Jarak Pengiriman (Km)</label>
                    <input 
                      type="number" 
                      value={calcDistance}
                      onChange={(e) => setCalcDistance(Math.max(1, parseInt(e.target.value) || 0))}
                      className="w-full text-xs font-bold border border-slate-200 rounded-xl p-3 focus:outline-none focus:ring-1 focus:ring-[#00805A]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Total Berat Muatan (Kg)</label>
                    <input 
                      type="number" 
                      value={calcWeight}
                      onChange={(e) => setCalcWeight(Math.max(1, parseInt(e.target.value) || 0))}
                      className="w-full text-xs font-bold border border-slate-200 rounded-xl p-3 focus:outline-none focus:ring-1 focus:ring-[#00805A]"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Estimasi Volume (m³)</label>
                    <input 
                      type="number" 
                      step="0.1"
                      value={calcVolume}
                      onChange={(e) => setCalcVolume(Math.max(0.1, parseFloat(e.target.value) || 0))}
                      className="w-full text-xs font-bold border border-slate-200 rounded-xl p-3 focus:outline-none focus:ring-1 focus:ring-[#00805A]"
                    />
                  </div>
                </div>

                <div>
                  <label className="flex items-center gap-2 cursor-pointer bg-slate-50 p-3 rounded-xl border border-slate-100">
                    <input 
                      type="checkbox" 
                      checked={helperService}
                      onChange={(e) => setHelperService(e.target.checked)}
                      className="rounded text-[#00805A] focus:ring-[#00805A] w-4 h-4"
                    />
                    <div className="text-xs">
                      <p className="font-bold text-slate-800">Tambahkan Jasa Helper (Kuli Bongkar Muat)</p>
                      <p className="text-[10px] text-slate-400">Bantuan menaikkan/menurunkan semen & besi ke proyek (+Rp50.000)</p>
                    </div>
                  </label>
                </div>
              </div>

              {/* Summary Kalkulasi & Keamanan */}
              <div className="lg:col-span-5 bg-slate-50 rounded-2xl p-5 border border-slate-100 flex flex-col justify-between">
                <div>
                  <h4 className="font-extrabold text-xs text-slate-400 uppercase tracking-widest">Estimasi Ongkos Kirim</h4>
                  <p className="text-2xl font-black text-slate-900 mt-1">Rp {calculatedPrice.toLocaleString('id-ID')}</p>
                  
                  <div className="text-[11px] text-slate-500 space-y-1.5 mt-4 border-t border-slate-200 pt-3">
                    <p>🛣️ <b>Jarak Rute:</b> {calcDistance} Km</p>
                    <p>⚖️ <b>Bobot Muatan:</b> {calcWeight} Kg</p>
                    <p>📦 <b>Kebutuhan Ruang:</b> {calcVolume} m³</p>
                  </div>
                </div>

                {/* ODOL Alert Indicator */}
                <div className={`mt-4 p-3 rounded-xl border text-xs font-semibold ${
                  odolAlert 
                    ? 'bg-rose-50 border-rose-200 text-rose-800' 
                    : 'bg-emerald-50 border-emerald-200 text-emerald-800'
                }`}>
                  {odolAlert ? (
                    <p>🚨 <b>Overloading Warning (ODOL)!</b> Bobot melebihi kapasitas standar armada pilihan Anda. Harap tingkatkan armada atau pecah muatan.</p>
                  ) : (
                    <p>✅ <b>Safety Cleared!</b> Muatan Anda aman sesuai regulasi daya angkut jalan raya nasional.</p>
                  )}
                </div>
              </div>

            </div>
          )}

          {}
          {/* TAB 3: CEK OUTLET DEPOT */}
          {activeTab === 'outlet' && (
            <div className="space-y-4">
              <div className="flex gap-2">
                {['Jakarta', 'Tangerang', 'Bekasi', 'Bandung'].map(city => (
                  <button
                    key={city}
                    onClick={() => setSelectedRegion(city)}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
                      selectedRegion === city 
                        ? 'bg-[#00805A] text-white' 
                        : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    📍 {city}
                  </button>
                ))}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {DEPOT_OUTLETS.filter(o => o.region === selectedRegion).map((outlet, index) => (
                  <div key={index} className="bg-slate-50 p-4 rounded-xl border border-slate-100 flex justify-between items-center">
                    <div>
                      <h4 className="font-extrabold text-xs text-slate-800">🏪 {outlet.name}</h4>
                      <p className="text-[11px] text-slate-400 mt-1">{outlet.address}</p>
                      <p className="text-[10px] text-slate-500 font-bold mt-1.5">📞 {outlet.tel}</p>
                    </div>
                    <span className="text-emerald-600 font-extrabold text-xs bg-emerald-50 px-2.5 py-1 rounded-lg">BUKA</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: BUAT ORDER PORTAL (FAST CHECKOUT) */}
          {activeTab === 'order' && (
            <div className="bg-[#00805A]/5 rounded-2xl p-5 border border-[#00805A]/10 text-center space-y-3">
              <span className="text-4xl">🏗️</span>
              <h4 className="font-black text-slate-800 text-base">Butuh Pengiriman Material Proyek Sekarang?</h4>
              <p className="text-xs text-slate-500 max-w-md mx-auto">Kami mengintegrasikan logistik instan langsung dengan toko besi & semen terdekat. Klik di bawah untuk login & pendaftaran VIP.</p>
              <button 
                onClick={() => setShowVipModal(true)}
                className="bg-[#F2C335] hover:bg-slate-900 hover:text-white text-slate-950 font-black text-xs px-6 py-3 rounded-xl transition"
              >
                MULAI BUAT ORDER PROYEK
              </button>
            </div>
          )}

        </div>
      </section>

      {}
      {/* =======================================================
          SIMULATOR CONTROL CENTER & MULTI-ROLE SANDBOX
          ======================================================= */}
      <section className="max-w-7xl w-full mx-auto p-4 mt-8">
        <div className="bg-slate-900 rounded-[28px] p-6 text-white shadow-xl">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-800 pb-4 mb-6">
            <div>
              <span className="text-[9px] bg-amber-500 text-slate-950 px-2 py-0.5 rounded-md font-bold uppercase">Simulator Hub</span>
              <h3 className="text-base font-black tracking-tight mt-1">🎛️ Pusat Simulasi Alur Logistik</h3>
              <p className="text-[11px] text-slate-400 mt-0.5">Ubah peran untuk menguji alur penyiapan barang dari toko, pengantaran driver, hingga tanda tangan PoD.</p>
            </div>

            {/* Role Switcher */}
            <div className="flex flex-wrap gap-1.5 bg-slate-800 p-1 rounded-xl">
              {[
                { id: 'customer', label: 'Konsumen', icon: '👤' },
                { id: 'merchant', label: 'Toko Material', icon: '🏪' },
                { id: 'driver', label: 'Driver Truk', icon: '🚛' }
              ].map(role => (
                <button
                  key={role.id}
                  onClick={() => {
                    setActiveRole(role.id);
                    triggerToast(`Mode disetel ke: ${role.label}`);
                  }}
                  className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    activeRole === role.id 
                      ? 'bg-[#00805A] text-white shadow-md' 
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <span>{role.icon}</span>
                  <span>{role.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* SIMULATOR SCREEN CONTENT */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* SISI KIRI: AKSI PERAN (SANDBOX) */}
            <div className="lg:col-span-8 space-y-4">
              
              {/* ROLE: CUSTOMER VIEW */}
              {activeRole === 'customer' && (
                <div className="bg-slate-800 p-5 rounded-2xl border border-slate-700/60 space-y-4">
                  <h4 className="font-extrabold text-sm text-[#F2C335]">🛒 Panel Pelanggan (Cari & Pesan Logistik)</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-3">
                      <p className="text-xs text-slate-300 font-bold">Simulasi Material Yang Dipesan:</p>
                      <div className="bg-slate-900 p-3.5 rounded-xl border border-slate-800 text-xs flex justify-between items-center">
                        <div>
                          <p className="font-bold">20 Sak Semen Padang 50kg</p>
                          <p className="text-[10px] text-slate-500 mt-0.5">Total Bobot: 1.000 Kg (1 Ton)</p>
                        </div>
                        <span className="font-extrabold">Rp 1.440.000</span>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <p className="text-xs text-slate-300 font-bold">Pilih ID Kiriman yang Mau Dipantau:</p>
                      <div className="grid grid-cols-1 gap-2">
                        {shipments.map(s => (
                          <button
                            key={s.id}
                            onClick={() => {
                              setSelectedShipmentId(s.id);
                              setSearchTrackingId(s.id);
                              triggerToast(`Memantau ID ${s.id}`);
                            }}
                            className={`p-3 rounded-xl border text-xs font-bold text-left transition ${
                              selectedShipmentId === s.id 
                                ? 'border-[#F2C335] bg-[#F2C335]/10 text-[#F2C335]' 
                                : 'border-slate-700 hover:bg-slate-700 text-slate-300'
                            }`}
                          >
                            🚚 {s.id} ({s.item}) - <span className="font-extrabold">{s.status}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {}
              {/* ROLE: MERCHANT VIEW */}
              {activeRole === 'merchant' && (
                <div className="bg-slate-800 p-5 rounded-2xl border border-slate-700/60 space-y-4">
                  <h4 className="font-extrabold text-sm text-[#F2C335]">🏪 Panel Mitra Toko (Penyiapan Material)</h4>
                  <p className="text-xs text-slate-300">Gunakan tombol simulasi di bawah untuk mempercepat progress pengantaran kurir di database.</p>
                  
                  <div className="flex gap-3">
                    <button
                      onClick={handleSimulateProgress}
                      className="bg-[#00805A] hover:bg-[#006647] text-white font-extrabold text-xs px-5 py-3 rounded-xl transition flex items-center gap-2"
                    >
                      ⚡ Gerakkan Kurir (Simulate Progress)
                    </button>
                    <button
                      onClick={() => {
                        setShipments(INITIAL_SHIPMENTS);
                        triggerToast('Data simulasi logistik disetel ulang.');
                      }}
                      className="bg-slate-700 hover:bg-slate-600 text-slate-200 font-bold text-xs px-4 py-3 rounded-xl transition"
                    >
                      Reset Simulasi
                    </button>
                  </div>
                </div>
              )}

              {}
              {/* ROLE: DRIVER VIEW */}
              {activeRole === 'driver' && (
                <div className="bg-slate-800 p-5 rounded-2xl border border-slate-700/60 space-y-4">
                  <h4 className="font-extrabold text-sm text-[#F2C335]">🚛 Panel Driver & Tanda Tangan PoD (Proof of Delivery)</h4>
                  <p className="text-xs text-slate-300">Setelah material semen/pasir diturunkan di lokasi proyek, gunakan panel ini untuk mengunci tanda tangan digital penerima.</p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Kamera Simulasi */}
                    <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col items-center justify-center text-center relative overflow-hidden aspect-video">
                      {podPhoto ? (
                        <>
                          <img src={podPhoto} alt="PoD Cargo" className="absolute inset-0 w-full h-full object-cover" />
                          <button 
                            onClick={() => setPodPhoto(null)} 
                            className="absolute top-2 right-2 bg-rose-500 text-white rounded-md px-2 py-1 text-[10px] font-bold"
                          >
                            Hapus 🗑️
                          </button>
                        </>
                      ) : (
                        <div className="space-y-2">
                          <span className="text-3xl">📷</span>
                          <p className="text-xs font-bold text-slate-300">Ambil Foto Material Bongkar</p>
                          <button
                            onClick={() => setPodPhoto('https://images.unsplash.com/photo-1590069261209-f8e9b8642343?auto=format&fit=crop&w=600&q=80')}
                            className="bg-slate-800 hover:bg-slate-700 text-white text-[10px] font-bold px-3 py-1.5 rounded-lg transition"
                          >
                            Ambil Gambar Simulasi
                          </button>
                        </div>
                      )}
                    </div>

                    {/* TTD Canvas */}
                    <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 flex flex-col justify-between aspect-video">
                      <p className="text-[10px] text-slate-400 font-bold uppercase">Tanda Tangan Penerima di Layar HP:</p>
                      
                      <div className="bg-white rounded-lg h-24 relative overflow-hidden my-2">
                        <canvas
                          ref={canvasRef}
                          onMouseDown={startDrawing}
                          onMouseMove={draw}
                          onMouseUp={() => setIsDrawing(false)}
                          onTouchStart={startDrawing}
                          onTouchMove={draw}
                          onTouchEnd={() => setIsDrawing(false)}
                          className="w-full h-full cursor-crosshair block"
                        />
                        {signatureSaved && (
                          <div className="absolute inset-0 bg-emerald-500/10 flex items-center justify-center">
                            <span className="bg-emerald-600 text-white text-[9px] font-bold px-2 py-0.5 rounded-full">Kunci TTD OK</span>
                          </div>
                        )}
                      </div>

                      <div className="flex justify-between items-center text-[10px]">
                        <button 
                          onClick={() => {
                            const canvas = canvasRef.current;
                            if (canvas) {
                              const ctx = canvas.getContext('2d');
                              ctx.clearRect(0, 0, canvas.width, canvas.height);
                              setSignatureSaved(false);
                            }
                          }}
                          className="text-rose-400 hover:underline"
                        >
                          Hapus TTD
                        </button>
                        <button onClick={saveSignature} className="text-emerald-400 font-bold hover:underline">Kunci TTD</button>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => handleCompleteDelivery(selectedShipmentId)}
                    disabled={!podPhoto || !signatureSaved}
                    className={`w-full py-3 rounded-xl font-bold text-xs transition flex items-center justify-center gap-1.5 ${
                      podPhoto && signatureSaved 
                        ? 'bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer' 
                        : 'bg-slate-700 text-slate-500 cursor-not-allowed'
                    }`}
                  >
                    <span>✔️</span> Konfirmasi & Selesaikan Tugas Pengiriman
                  </button>
                </div>
              )}

            </div>

            {/* SISI KANAN: STATUS DATABASE MONITOR */}
            <div className="lg:col-span-4 bg-slate-800 p-5 rounded-2xl border border-slate-700/60 flex flex-col justify-between">
              <div>
                <h4 className="font-extrabold text-xs text-slate-400 uppercase tracking-widest">Monitor Hub</h4>
                <p className="text-xs text-slate-300 mt-2">Daftar muatan logistik aktif dalam sistem:</p>
                
                <div className="space-y-3 mt-4">
                  {shipments.map(ship => (
                    <div 
                      key={ship.id}
                      onClick={() => {
                        setSelectedShipmentId(ship.id);
                        setSearchTrackingId(ship.id);
                        triggerToast(`Detail ${ship.id} terpilih.`);
                      }}
                      className={`p-3 rounded-xl border text-xs cursor-pointer transition ${
                        selectedShipmentId === ship.id 
                          ? 'bg-slate-900 border-[#F2C335]' 
                          : 'bg-slate-900/40 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex justify-between font-bold">
                        <span>{ship.id}</span>
                        <span className="text-[#F2C335]">{ship.status}</span>
                      </div>
                      <p className="text-[10px] text-slate-500 mt-1 truncate">{ship.item}</p>
                      
                      {/* Mini bar */}
                      <div className="w-full bg-slate-800 h-1 rounded-full mt-2 overflow-hidden">
                        <div className="bg-[#00805A] h-full" style={{ width: `${ship.progress}%` }}></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="border-t border-slate-700 pt-3 mt-4 text-[10px] text-slate-500">
                <p>Status Driver: 🟢 Online (3 Armadas)</p>
                <p className="mt-1">Sistem Escrow Terkunci: Aman</p>
              </div>
            </div>

          </div>
        </div>
      </section>

      {}
      {/* =======================================================
          FLOATING SIDEBAR MENU (RIGHT SIDE ACTION WIDGETS)
          ======================================================= */}
      <div className="fixed right-4 bottom-24 z-30 flex flex-col gap-2.5">
        {[
          { label: 'WA Chat 24H', icon: '💬', action: () => triggerToast('Menghubungi CS via WhatsApp (Simulasi)...') },
          { label: 'Cari Tarif', icon: '📊', action: () => { setActiveTab('price'); triggerToast('Membuka Kalkulator Ongkir.'); } },
          { label: 'Lokasi Depot', icon: '📍', action: () => { setActiveTab('outlet'); triggerToast('Membuka Peta Outlet.'); } },
          { label: 'Kontraktor VIP', icon: '👑', action: () => setShowVipModal(true) }
        ].map((widget, i) => (
          <button
            key={i}
            onClick={widget.action}
            title={widget.label}
            className="w-12 h-12 rounded-full bg-white text-slate-800 hover:bg-[#00805A] hover:text-white transition-all duration-300 flex items-center justify-center text-lg shadow-xl border border-slate-100 group relative"
          >
            <span>{widget.icon}</span>
            {/* Tooltip Label */}
            <span className="absolute right-14 bg-slate-900 text-white text-[10px] font-bold px-2.5 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition duration-300 pointer-events-none whitespace-nowrap shadow-md">
              {widget.label}
            </span>
          </button>
        ))}
      </div>

      {}
      {/* =======================================================
          MODAL REGISTRASI VIP CLIENT / MITRA KONTRAKTOR
          ======================================================= */}
      {showVipModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[24px] w-full max-w-md p-6 shadow-2xl border border-slate-100 transform transition-all">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-base font-extrabold text-slate-900">👑 Pengajuan VIP Client (Kontraktor B2B)</h3>
              <button 
                onClick={() => setShowVipModal(false)}
                className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 font-bold"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-500 mb-4">Dapatkan diskon logistik flat-rate 10%, layanan kuli bongkar muat gratis, dan sistem pembayaran termin (Tempo 30 hari).</p>

            <form 
              onSubmit={(e) => {
                e.preventDefault();
                setShowVipModal(false);
                triggerToast(`Pendaftaran Perusahaan ${vipForm.company} sukses! Tim Account Manager akan menghubungi PIC.`);
              }} 
              className="space-y-4 text-xs"
            >
              <div>
                <label className="block font-bold text-slate-500 mb-1">Nama Perusahaan / Kontraktor</label>
                <input 
                  type="text" 
                  value={vipForm.company}
                  onChange={(e) => setVipForm({ ...vipForm, company: e.target.value })}
                  placeholder="Contoh: PT. Maju Karya Konstruksi"
                  className="w-full border border-slate-200 rounded-xl p-3 focus:outline-none focus:ring-1 focus:ring-[#00805A]"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-500 mb-1">Nama PIC Proyek</label>
                  <input 
                    type="text" 
                    value={vipForm.pic}
                    onChange={(e) => setVipForm({ ...vipForm, pic: e.target.value })}
                    className="w-full border border-slate-200 rounded-xl p-3 focus:outline-none focus:ring-1 focus:ring-[#00805A]"
                    required
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-500 mb-1">No. Handphone PIC</label>
                  <input 
                    type="text" 
                    value={vipForm.phone}
                    onChange={(e) => setVipForm({ ...vipForm, phone: e.target.value })}
                    className="w-full border border-slate-200 rounded-xl p-3 focus:outline-none focus:ring-1 focus:ring-[#00805A]"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-500 mb-1">Alamat Kantor Pusat</label>
                <textarea 
                  value={vipForm.address}
                  onChange={(e) => setVipForm({ ...vipForm, address: e.target.value })}
                  className="w-full border border-slate-200 rounded-xl p-2.5 focus:outline-none focus:ring-1 focus:ring-[#00805A] h-16"
                  required
                />
              </div>

              <button
                type="submit"
                className="w-full bg-[#00805A] text-white py-3.5 rounded-xl font-bold text-xs shadow-lg hover:bg-[#006647] transition"
              >
                KIRIM PENGAJUAN KEMITRAAN B2B 🚀
              </button>
            </form>
          </div>
        </div>
      )}

      {}
      {/* =======================================================
          FOOTER INFORMASI & HAK CIPTA
          ======================================================= */}
      <footer className="bg-slate-900 text-white mt-16 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 py-8 grid grid-cols-1 md:grid-cols-3 gap-6 text-xs text-slate-400">
          <div>
            <h4 className="font-extrabold text-slate-200 text-sm mb-3">🏗️ BahanBangunGo Cargo</h4>
            <p className="leading-relaxed">Solusi logistik premium terpercaya untuk pengiriman bahan bangunan, baja struktural, semen curah, dan kebutuhan infrastruktur nasional.</p>
          </div>
          <div>
            <h4 className="font-extrabold text-slate-200 text-sm mb-3">Layanan Logistik</h4>
            <ul className="space-y-1.5">
              <li>• Pengiriman Trucking CDE & CDD</li>
              <li>• Jasa Kuli Bongkar Muat Proyek</li>
              <li>• Pengiriman Anti-ODOL Bersertifikasi</li>
              <li>• Layanan Escrow Pembayaran Aman</li>
            </ul>
          </div>
          <div>
            <h4 className="font-extrabold text-slate-200 text-sm mb-3">Hubungi Kantor Pusat</h4>
            <p>Menara Cakung Cargo Lt. 8, Jakarta Timur</p>
            <p className="mt-1">Email: support@bahanbangungo.id</p>
            <p className="mt-1">Telp: +62 21-5500-8800</p>
          </div>
        </div>
        <div className="bg-slate-950 py-4 text-center text-[10px] text-slate-600 font-bold uppercase tracking-widest">
          <p>© 2026 BahanBangunGo Ltd. All rights reserved.</p>
        </div>
      </footer>

    </div>
  );
}