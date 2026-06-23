import React, { useState, useMemo } from 'react';


// ==========================================
// MOCK DATA AWAL (SIMULASI DATABASE)
// ==========================================
const INITIAL_MEMBERS = [
  { id: 'MEM-001', name: 'Ahmad Supriadi', email: 'ahmad.supriadi@domain.com', role: 'Administrator', status: 'Active', joinedDate: '12 Jan 2026' },
  { id: 'MEM-002', name: 'Siti Rahmawati', email: 'siti.rahma@domain.com', role: 'Editor', status: 'Active', joinedDate: '18 Feb 2026' },
  { id: 'MEM-003', name: 'Budi Hartono', email: 'budi.hartono@domain.com', role: 'Member', status: 'Suspended', joinedDate: '01 Mar 2026' },
  { id: 'MEM-004', name: 'Diana Lestari', email: 'diana.lestari@domain.com', role: 'Member', status: 'Active', joinedDate: '15 Apr 2026' },
  { id: 'MEM-005', name: 'Eko Prasetyo', email: 'eko.prasetyo@domain.com', role: 'Editor', status: 'Active', joinedDate: '23 May 2026' },
];

const INITIAL_BLOGS = [
  { id: 'POST-01', title: 'Panduan Optimasi Logistik Proyek Konstruksi', category: 'Logistik', author: 'Ahmad Supriadi', status: 'Published', date: '10 Jun 2026', content: 'Mengoptimalkan alur distribusi bahan bangunan adalah kunci efisiensi anggaran proyek Anda...' },
  { id: 'POST-02', title: 'Mengenal Bahaya Overloading (ODOL) Bagi Keselamatan Jalan', category: 'Keselamatan', author: 'Siti Rahmawati', status: 'Draft', date: '18 Jun 2026', content: 'ODOL tidak hanya merusak fasilitas jalan nasional tetapi juga membahayakan jiwa pengendara lain...' },
  { id: 'POST-03', title: 'Tren Desain Interior Minimalis Modern Tahun 2026', category: 'Inspirasi', author: 'Diana Lestari', status: 'Published', date: '21 Jun 2026', content: 'Gaya minimalis monokrom dengan sentuhan material kayu alami kembali mendominasi tren hunian...' }
];

const INITIAL_REDEEMS = [
  { id: 'RED-889', memberName: 'Diana Lestari', points: 1500, prize: 'Voucher Belanja Rp150.000', status: 'Pending', date: '22 Jun 2026' },
  { id: 'RED-890', memberName: 'Budi Hartono', points: 3000, prize: 'Semen Gresik 10 Sak', status: 'Pending', date: '23 Jun 2026' },
  { id: 'RED-885', memberName: 'Siti Rahmawati', points: 5000, prize: 'Emas Logam Mulia 0.5gr', status: 'Approved', date: '19 Jun 2026' },
  { id: 'RED-886', memberName: 'Eko Prasetyo', points: 1000, prize: 'Free Ongkir Cargo Max 50km', status: 'Rejected', date: '15 Jun 2026' }
];

const CHARTS_DATA = {
  daily: [30, 45, 35, 50, 40, 60, 55],
  weekly: [120, 150, 180, 140, 210, 190, 240],
  monthly: [450, 520, 610, 580, 720, 690, 810]
};

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard'); // dashboard | members | blog | redeem | settings
  const [members, setMembers] = useState(INITIAL_MEMBERS);
  const [blogs, setBlogs] = useState(INITIAL_BLOGS);
  const [redeems, setRedeems] = useState(INITIAL_REDEEMS);
  
  // State Input & Filter
  const [searchQuery, setSearchQuery] = useState('');
  const [chartRange, setChartRange] = useState('weekly'); // daily | weekly | monthly
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  // Modals & Forms State
  const [showMemberModal, setShowMemberModal] = useState(false);
  const [editingMember, setEditingMember] = useState(null);
  const [memberForm, setMemberForm] = useState({ name: '', email: '', role: 'Member', status: 'Active' });

  const [showBlogModal, setShowBlogModal] = useState(false);
  const [blogForm, setBlogForm] = useState({ title: '', category: 'Logistik', content: '' });

  const [showRedeemModal, setShowRedeemModal] = useState(false);
  const [selectedRedeem, setSelectedRedeem] = useState(null);

  // Toast Alerts
  const [toasts, setToasts] = useState([]);

  const addToast = (message, type = 'success') => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

  // Perhitungan Statistik Dinamis berdasarkan State Terkini
  const stats = useMemo(() => {
    const totalMemb = members.length;
    const activeMemb = members.filter(m => m.status === 'Active').length;
    const totalBlogs = blogs.length;
    const pendingRedeems = redeems.filter(r => r.status === 'Pending').length;
    const approvedRedeemsCount = redeems.filter(r => r.status === 'Approved').length;
    const approvedPointsValue = redeems
      .filter(r => r.status === 'Approved')
      .reduce((sum, item) => sum + item.points, 0);

    return {
      totalMemb,
      activeMemb,
      totalBlogs,
      pendingRedeems,
      approvedRedeemsCount,
      approvedPointsValue
    };
  }, [members, blogs, redeems]);

  // Handler CRUD Anggota (Members)
  const handleOpenMemberModal = (member = null) => {
    if (member) {
      setEditingMember(member);
      setMemberForm({ name: member.name, email: member.email, role: member.role, status: member.status });
    } else {
      setEditingMember(null);
      setMemberForm({ name: '', email: '', role: 'Member', status: 'Active' });
    }
    setShowMemberModal(true);
  };

  const handleSaveMember = (e) => {
    e.preventDefault();
    if (!memberForm.name || !memberForm.email) {
      addToast('Nama dan Email wajib diisi!', 'warning');
      return;
    }

    if (editingMember) {
      // Edit Mode
      setMembers(prev => prev.map(m => m.id === editingMember.id ? { ...m, ...memberForm } : m));
      addToast(`Anggota ${memberForm.name} berhasil diperbarui.`);
    } else {
      // Add Mode
      const newId = `MEM-${String(members.length + 1).padStart(3, '0')}`;
      const newMember = {
        id: newId,
        ...memberForm,
        joinedDate: new Date().toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })
      };
      setMembers(prev => [...prev, newMember]);
      addToast(`Anggota baru ${memberForm.name} sukses didaftarkan.`);
    }
    setShowMemberModal(false);
  };

  const handleDeleteMember = (id, name) => {
    setMembers(prev => prev.filter(m => m.id !== id));
    addToast(`Akun ${name} telah dihapus dari sistem.`, 'warning');
  };

  // Handler Blog Posts
  const handleCreateBlog = (e) => {
    e.preventDefault();
    if (!blogForm.title || !blogForm.content) {
      addToast('Judul dan Konten blog tidak boleh kosong!', 'warning');
      return;
    }

    const newPost = {
      id: `POST-${String(blogs.length + 1).padStart(2, '0')}`,
      title: blogForm.title,
      category: blogForm.category,
      author: 'Super Admin',
      status: 'Published',
      date: new Date().toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' }),
      content: blogForm.content
    };

    setBlogs(prev => [newPost, ...prev]);
    setShowBlogModal(false);
    setBlogForm({ title: '', category: 'Logistik', content: '' });
    addToast('Artikel blog baru berhasil dipublikasikan!');
  };

  const handleDeleteBlog = (id) => {
    setBlogs(prev => prev.filter(b => b.id !== id));
    addToast('Artikel blog berhasil dihapus.', 'warning');
  };

  // Handler Redeem Requests
  const handleProcessRedeem = (id, action) => {
    setRedeems(prev => prev.map(r => {
      if (r.id === id) {
        return { ...r, status: action };
      }
      return r;
    }));
    setShowRedeemModal(false);
    addToast(`Permintaan penukaran ${id} telah ${action === 'Approved' ? 'disetujui' : 'ditolak'}.`, action === 'Approved' ? 'success' : 'warning');
  };

  // Filter Data Berdasarkan Query Pencarian Global
  const filteredMembers = useMemo(() => {
    return members.filter(m => 
      m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.role.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [members, searchQuery]);

  const filteredBlogs = useMemo(() => {
    return blogs.filter(b => 
      b.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.category.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [blogs, searchQuery]);

  const filteredRedeems = useMemo(() => {
    return redeems.filter(r => 
      r.memberName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.prize.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.status.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [redeems, searchQuery]);

  return (
    <div className="min-h-screen bg-[#F5F5F5] font-sans text-[#212121] flex antialiased selection:bg-[#1E88E5]/20">
      
      {/* INJECTED GLOBAL STYLES (CUSTOM FONTS & TOKENS) */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@500;600;700&family=Inter:wght@400;500;600;700&family=Open+Sans:wght@400;500;600&display=swap');
        
        .font-poppins {
          font-family: 'Poppins', sans-serif;
        }
        .font-inter {
          font-family: 'Inter', sans-serif;
        }
        .font-opensans {
          font-family: 'Open Sans', sans-serif;
        }

        /* Custom Scrollbar for Sleek Aesthetic */
        ::-webkit-scrollbar {
          width: 6px;
          height: 6px;
        }
        ::-webkit-scrollbar-track {
          background: #F5F5F5;
        }
        ::-webkit-scrollbar-thumb {
          background: #E0E0E0;
          border-radius: 10px;
        }
        ::-webkit-scrollbar-thumb:hover {
          background: #BDBDBD;
        }
      `}</style>

      {/* TOAST NOTIFICATIONS */}
      <div className="fixed top-6 right-6 z-[100] flex flex-col gap-3 max-w-sm w-full font-inter">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`p-4 rounded-xl shadow-lg border flex items-center gap-3 transition-all transform translate-y-0 animate-fade-in ${
              toast.type === 'success' 
                ? 'bg-white border-emerald-100 text-slate-800' 
                : toast.type === 'warning'
                ? 'bg-white border-rose-100 text-slate-800'
                : 'bg-white border-amber-100 text-slate-800'
            }`}
          >
            {toast.type === 'success' && (
              <span className="w-8 h-8 rounded-full bg-[#43A047]/10 flex items-center justify-center text-[#43A047] shrink-0 font-bold">✓</span>
            )}
            {toast.type === 'warning' && (
              <span className="w-8 h-8 rounded-full bg-rose-50 flex items-center justify-center text-rose-500 shrink-0 font-bold">✕</span>
            )}
            {toast.type === 'info' && (
              <span className="w-8 h-8 rounded-full bg-[#1E88E5]/10 flex items-center justify-center text-[#1E88E5] shrink-0 font-bold">!</span>
            )}
            <div className="text-xs font-semibold">{toast.message}</div>
          </div>
        ))}
      </div>

      {/* =======================================================
          SIDEBAR NAVIGASI (LEFT) - FIXED HIGH FIDELITY
          ======================================================= */}
      <aside className={`w-64 bg-[#212121] text-white flex flex-col justify-between shrink-0 fixed h-full z-40 transition-transform duration-300 lg:translate-x-0 lg:static ${
        mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <div className="flex flex-col">
          {/* Logo & Brand Header */}
          <div className="p-6 border-b border-neutral-800 flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-[#1E88E5] flex items-center justify-center font-poppins font-bold text-lg text-white shadow-md shadow-[#1E88E5]/20">
                A
              </div>
              <div>
                <h1 className="font-poppins font-bold text-base tracking-tight leading-none text-white">ApexDash</h1>
                <p className="text-[10px] text-neutral-500 font-inter font-medium mt-1">CORE MANAGEMENT</p>
              </div>
            </div>
            {/* Mobile Close Button */}
            <button className="lg:hidden text-neutral-400 hover:text-white" onClick={() => setMobileMenuOpen(false)}>
              ✕
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="p-4 space-y-1 font-inter text-sm">
            {[
              { id: 'dashboard', label: 'Dashboard', icon: (active) => (
                <svg className={`w-5 h-5 ${active ? 'text-[#1E88E5]' : 'text-neutral-400'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2H6a2 2 0 01-2-2v-4zM14 16a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 01-2-2v-4z" />
                </svg>
              )},
              { id: 'members', label: 'Members', count: members.length, icon: (active) => (
                <svg className={`w-5 h-5 ${active ? 'text-[#1E88E5]' : 'text-neutral-400'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              )},
              { id: 'blog', label: 'Blog Posts', count: blogs.length, icon: (active) => (
                <svg className={`w-5 h-5 ${active ? 'text-[#1E88E5]' : 'text-neutral-400'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6m-6 4h3" />
                </svg>
              )},
              { id: 'redeem', label: 'Redeem Requests', count: stats.pendingRedeems, isBadge: true, icon: (active) => (
                <svg className={`w-5 h-5 ${active ? 'text-[#1E88E5]' : 'text-neutral-400'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              )},
              { id: 'settings', label: 'Settings', icon: (active) => (
                <svg className={`w-5 h-5 ${active ? 'text-[#1E88E5]' : 'text-neutral-400'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              )}
            ].map((item) => {
              const active = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id);
                    setSearchQuery('');
                    setMobileMenuOpen(false);
                    addToast(`Beralih ke halaman ${item.label}`, 'info');
                  }}
                  className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition duration-200 ${
                    active 
                      ? 'bg-neutral-800 text-white font-semibold border-l-4 border-[#1E88E5]' 
                      : 'text-neutral-400 hover:bg-neutral-800/50 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {item.icon(active)}
                    <span>{item.label}</span>
                  </div>
                  {item.count !== undefined && (
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                      item.isBadge && item.count > 0 
                        ? 'bg-[#FDD835] text-[#212121]' 
                        : 'bg-neutral-800 text-neutral-400'
                    }`}>
                      {item.count}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Footer Profile Sidebar info */}
        <div className="p-4 border-t border-neutral-800 text-xs text-neutral-500 font-inter">
          <p>Super Admin Console</p>
          <p className="mt-1">Version 4.2.0-stable</p>
        </div>
      </aside>

      {/* MOBILE MENU OVERLAY */}
      {mobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/40 z-30 lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* =======================================================
          MAIN WORKSPACE LAYOUT (HEADER + DYNAMIC VIEWS)
          ======================================================= */}
      <div className="flex-1 flex flex-col min-w-0 max-h-screen overflow-y-auto font-inter">
        
        {/* HEADER (TOP BAR: SEARCH, NOTIFICATIONS, PROFILE) */}
        <header className="bg-white border-b border-neutral-100 sticky top-0 z-30 px-6 py-4 flex justify-between items-center shadow-sm">
          <div className="flex items-center gap-4">
            {/* Mobile Hamburger Toggle */}
            <button 
              className="lg:hidden p-2 rounded-xl hover:bg-neutral-100 text-[#212121]"
              onClick={() => setMobileMenuOpen(true)}
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            
            {/* Page Name Context */}
            <div>
              <h2 className="font-poppins font-bold text-lg text-[#212121] uppercase tracking-wide leading-tight">
                {activeTab === 'dashboard' ? 'Overview' : activeTab}
              </h2>
              <p className="text-[11px] text-neutral-400 font-medium">Sistem Kendali Utama Terintegrasi</p>
            </div>
          </div>

          {/* Search bar & Admin profile row */}
          <div className="flex items-center gap-6">
            <div className="relative hidden md:block w-64">
              <span className="absolute left-3.5 top-1/2 transform -translate-y-1/2 text-neutral-400">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </span>
              <input
                type="text"
                placeholder="Cari data global..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full text-xs font-medium border border-neutral-200 rounded-xl pl-10 pr-4 py-2.5 bg-neutral-50 focus:outline-none focus:ring-2 focus:ring-[#1E88E5] focus:bg-white transition-all"
              />
            </div>

            {/* Notification bell and profile mock */}
            <div className="flex items-center gap-4">
              <button 
                onClick={() => addToast('Pusat pemberitahuan kosong.', 'info')}
                className="w-10 h-10 rounded-xl bg-neutral-50 hover:bg-neutral-100 transition flex items-center justify-center text-neutral-600 relative"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
                {stats.pendingRedeems > 0 && (
                  <span className="absolute top-2 right-2.5 w-2 h-2 rounded-full bg-[#1E88E5] ring-2 ring-white"></span>
                )}
              </button>

              <span className="w-px h-8 bg-neutral-200"></span>

              <div className="flex items-center gap-2.5">
                <img 
                  src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80" 
                  alt="Admin Profile" 
                  className="w-9 h-9 rounded-xl object-cover ring-2 ring-neutral-100"
                />
                <div className="hidden xl:block text-left">
                  <h4 className="text-xs font-bold text-[#212121] leading-none">D. Stwaret</h4>
                  <p className="text-[10px] text-neutral-400 font-semibold mt-1">Super Administrator</p>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* CONTAINER CONTENT */}
        <div className="p-6 max-w-7xl w-full mx-auto space-y-8 flex-1">
          
          {/* SEARCH FOR MOBILE DEVICES */}
          <div className="md:hidden">
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 transform -translate-y-1/2 text-neutral-400">🔍</span>
              <input
                type="text"
                placeholder="Cari data global..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full text-xs font-medium border border-neutral-200 rounded-xl pl-10 pr-4 py-3 bg-white focus:outline-none focus:ring-2 focus:ring-[#1E88E5]"
              />
            </div>
          </div>

          {/* =======================================================
              STATISTIC CARDS (GRID 3-4 COLUMNS)
              ======================================================= */}
          <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            
            {/* CARD 1: Total Members */}
            <div className="bg-white rounded-[12px] p-5 shadow-[0_4px_8px_rgba(0,0,0,0.03)] border border-neutral-100 flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2 text-neutral-500">
                  <svg className="w-4 h-4 text-[#1E88E5]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  <span className="text-xs font-bold uppercase tracking-wider text-neutral-400">Total Members</span>
                </div>
                <p className="text-2xl font-bold text-[#212121] mt-2 font-poppins">{stats.totalMemb}</p>
                <p className="text-[10px] text-[#43A047] font-semibold mt-1">🟢 {stats.activeMemb} Active Accounts</p>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-[#1E88E5]/10 flex items-center justify-center text-[#1E88E5]">
                👥
              </div>
            </div>

            {/* CARD 2: Active Blogs */}
            <div className="bg-white rounded-[12px] p-5 shadow-[0_4px_8px_rgba(0,0,0,0.03)] border border-neutral-100 flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2 text-neutral-500">
                  <svg className="w-4 h-4 text-[#43A047]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  <span className="text-xs font-bold uppercase tracking-wider text-neutral-400">Blog Posts</span>
                </div>
                <p className="text-2xl font-bold text-[#212121] mt-2 font-poppins">{stats.totalBlogs}</p>
                <p className="text-[10px] text-neutral-400 font-semibold mt-1">Published Articles</p>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-[#43A047]/10 flex items-center justify-center text-[#43A047]">
                ✍️
              </div>
            </div>

            {/* CARD 3: Redeem Requests */}
            <div className="bg-white rounded-[12px] p-5 shadow-[0_4px_8px_rgba(0,0,0,0.03)] border border-neutral-100 flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2 text-neutral-500">
                  <svg className="w-4 h-4 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="text-xs font-bold uppercase tracking-wider text-neutral-400">Pending Redeems</span>
                </div>
                <p className="text-2xl font-bold text-[#212121] mt-2 font-poppins">{stats.pendingRedeems}</p>
                <p className="text-[10px] text-amber-600 font-semibold mt-1">🟡 Awaiting Moderator Review</p>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-[#FDD835]/10 flex items-center justify-center text-amber-600">
                ⌛
              </div>
            </div>

            {/* CARD 4: Conversions / Volume */}
            <div className="bg-white rounded-[12px] p-5 shadow-[0_4px_8px_rgba(0,0,0,0.03)] border border-neutral-100 flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2 text-neutral-500">
                  <svg className="w-4 h-4 text-[#1E88E5]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                  </svg>
                  <span className="text-xs font-bold uppercase tracking-wider text-neutral-400">Claim Volume</span>
                </div>
                <p className="text-2xl font-bold text-[#212121] mt-2 font-poppins">{stats.approvedPointsValue.toLocaleString('id-ID')} Pts</p>
                <p className="text-[10px] text-emerald-600 font-semibold mt-1">🎉 {stats.approvedRedeemsCount} Approved Conversions</p>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 flex items-center justify-center text-[#43A047]">
                💎
              </div>
            </div>

          </section>

          {/* =======================================================
              QUICK ACTIONS BAR (INTERACTIVE OPERATION BUTTONS)
              ======================================================= */}
          <section className="bg-white rounded-[12px] p-5 shadow-[0_4px_8px_rgba(0,0,0,0.03)] border border-neutral-100">
            <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-400 mb-3 flex items-center gap-1.5 font-poppins">
              ⚡ Quick Actions Menu
            </h3>
            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => handleOpenMemberModal()}
                className="bg-[#1E88E5] hover:bg-[#1565C0] text-white text-xs font-bold px-4 py-2.5 rounded-[8px] shadow-[0_2px_4px_rgba(0,0,0,0.1)] transition flex items-center gap-2"
              >
                <span>➕</span> Add New Member
              </button>
              <button
                onClick={() => setShowBlogModal(true)}
                className="bg-[#FFFFFF] border border-[#1E88E5] text-[#1E88E5] hover:bg-[#E3F2FD] text-xs font-bold px-4 py-2.5 rounded-[8px] transition flex items-center gap-2"
              >
                <span>📝</span> Draft Blog Post
              </button>
              <button
                onClick={() => {
                  setActiveTab('redeem');
                  addToast('Menampilkan seluruh permintaan penukaran.', 'info');
                }}
                className="bg-[#FFFFFF] border border-neutral-300 text-neutral-600 hover:bg-neutral-50 text-xs font-bold px-4 py-2.5 rounded-[8px] transition flex items-center gap-2"
              >
                <span>💸</span> Review Redeems ({stats.pendingRedeems})
              </button>
              <button
                onClick={() => {
                  setMembers(INITIAL_MEMBERS);
                  setBlogs(INITIAL_BLOGS);
                  setRedeems(INITIAL_REDEEMS);
                  addToast('Database simulator disetel ulang ke kondisi awal.', 'info');
                }}
                className="ml-auto bg-rose-50 text-rose-600 hover:bg-rose-100 text-xs font-bold px-4 py-2.5 rounded-[8px] transition flex items-center gap-2"
              >
                <span>🔄</span> Reset Mock Database
              </button>
            </div>
          </section>

          {/* =======================================================
              DYNAMIC MAIN CONTENT CONTAINER
              ======================================================= */}
          <main className="transition-all duration-300">
            
            {/* VIEW: OVERVIEW / DASHBOARD */}
            {activeTab === 'dashboard' && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                
                {/* Visualisasi Data Chart Interaktif (Desktop: 7/12) */}
                <div className="lg:col-span-7 bg-white rounded-[12px] p-5 border border-neutral-100 shadow-[0_4px_8px_rgba(0,0,0,0.03)] flex flex-col justify-between">
                  <div className="flex justify-between items-center mb-6">
                    <div className="flex items-center gap-2.5">
                      <span className="text-xl">📈</span>
                      <div>
                        <h4 className="text-sm font-bold font-poppins text-[#212121]">Statistik Keaktifan Platform</h4>
                        <p className="text-[10px] text-neutral-400">Total volume transaksi poin penukaran</p>
                      </div>
                    </div>

                    <div className="flex bg-neutral-100 p-1 rounded-xl text-[10px] font-bold">
                      {['daily', 'weekly', 'monthly'].map((range) => (
                        <button
                          key={range}
                          onClick={() => {
                            setChartRange(range);
                            addToast(`Grafik diperbarui ke rentang ${range}`);
                          }}
                          className={`px-3 py-1.5 rounded-lg uppercase transition ${
                            chartRange === range 
                              ? 'bg-[#1E88E5] text-white' 
                              : 'text-neutral-500 hover:text-[#212121]'
                          }`}
                        >
                          {range}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Render Chart SVG Dinamis */}
                  <div className="w-full h-48 bg-neutral-50 rounded-2xl relative p-4 flex flex-col justify-between overflow-hidden">
                    <svg className="w-full h-32 absolute bottom-4 left-0 right-0 px-2" viewBox="0 0 700 120" preserveAspectRatio="none">
                      <defs>
                        <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#1E88E5" stopOpacity="0.3" />
                          <stop offset="100%" stopColor="#1E88E5" stopOpacity="0.0" />
                        </linearGradient>
                      </defs>
                      
                      {/* Area Fill */}
                      <path
                        d={`M 10 120 
                            L 10 ${100 - CHARTS_DATA[chartRange][0] / 8} 
                            L 110 ${100 - CHARTS_DATA[chartRange][1] / 8} 
                            L 220 ${100 - CHARTS_DATA[chartRange][2] / 8} 
                            L 330 ${100 - CHARTS_DATA[chartRange][3] / 8} 
                            L 440 ${100 - CHARTS_DATA[chartRange][4] / 8} 
                            L 550 ${100 - CHARTS_DATA[chartRange][5] / 8} 
                            L 680 ${100 - CHARTS_DATA[chartRange][6] / 8} 
                            L 680 120 Z`}
                        fill="url(#chartGradient)"
                        className="transition-all duration-500"
                      />

                      {/* Stroke Line */}
                      <path
                        d={`M 10 ${100 - CHARTS_DATA[chartRange][0] / 8} 
                            L 110 ${100 - CHARTS_DATA[chartRange][1] / 8} 
                            L 220 ${100 - CHARTS_DATA[chartRange][2] / 8} 
                            L 330 ${100 - CHARTS_DATA[chartRange][3] / 8} 
                            L 440 ${100 - CHARTS_DATA[chartRange][4] / 8} 
                            L 550 ${100 - CHARTS_DATA[chartRange][5] / 8} 
                            L 680 ${100 - CHARTS_DATA[chartRange][6] / 8}`}
                        fill="none"
                        stroke="#1E88E5"
                        strokeWidth="3.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="transition-all duration-500"
                      />

                      {/* Interactive Dots */}
                      {CHARTS_DATA[chartRange].map((val, index) => {
                        const x = index === 6 ? 680 : index * 110 + 10;
                        const y = 100 - val / 8;
                        return (
                          <circle
                            key={index}
                            cx={x}
                            cy={y}
                            r="5"
                            className="fill-[#FFFFFF] stroke-[#1E88E5] stroke-[3] cursor-pointer hover:r-[7] transition-all"
                            onClick={() => addToast(`Nilai pada titik ini: ${val}`, 'info')}
                          />
                        );
                      })}
                    </svg>

                    <div className="flex justify-between text-[10px] text-neutral-400 z-10">
                      <span>Rentang Waktu Awal</span>
                      <span>Rentang Waktu Akhir</span>
                    </div>
                  </div>
                </div>

                {/* Aktivitas Penukaran Terbaru (Desktop: 5/12) */}
                <div className="lg:col-span-5 bg-white rounded-[12px] p-5 border border-neutral-100 shadow-[0_4px_8px_rgba(0,0,0,0.03)] flex flex-col justify-between">
                  <div>
                    <h4 className="text-sm font-bold font-poppins text-[#212121] mb-4 flex items-center gap-2">
                      <span>💸</span> Penukaran Pending Terkini
                    </h4>
                    
                    <div className="space-y-3">
                      {redeems.filter(r => r.status === 'Pending').slice(0, 3).map((item) => (
                        <div key={item.id} className="p-3 bg-neutral-50 rounded-xl border border-neutral-100 flex items-center justify-between text-xs">
                          <div>
                            <p className="font-bold text-[#212121]">{item.memberName}</p>
                            <p className="text-[10px] text-neutral-400 mt-1">{item.prize}</p>
                          </div>
                          <div className="text-right">
                            <span className="font-bold text-[#1E88E5]">{item.points} Pts</span>
                            <button 
                              onClick={() => {
                                setSelectedRedeem(item);
                                setShowRedeemModal(true);
                              }}
                              className="block text-[10px] text-[#43A047] font-bold mt-1.5 hover:underline"
                            >
                              Tinjau Klaim ➔
                            </button>
                          </div>
                        </div>
                      ))}

                      {redeems.filter(r => r.status === 'Pending').length === 0 && (
                        <div className="p-6 text-center text-xs text-neutral-400 border border-dashed border-neutral-200 rounded-xl">
                          Tidak ada klaim pending baru saat ini.
                        </div>
                      )}
                    </div>
                  </div>

                  <button
                    onClick={() => setActiveTab('redeem')}
                    className="w-full text-center text-xs font-bold text-[#1E88E5] hover:underline pt-3 mt-4 border-t border-neutral-100"
                  >
                    Buka Semua Penukaran ➔
                  </button>
                </div>

              </div>
            )}

            {/* VIEW: MEMBERS MANAGEMENT */}
            {activeTab === 'members' && (
              <div className="bg-white rounded-[12px] p-5 border border-neutral-100 shadow-[0_4px_8px_rgba(0,0,0,0.03)] space-y-4">
                <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3 border-b border-neutral-100 pb-4">
                  <div>
                    <h3 className="font-poppins font-bold text-base text-[#212121]">Daftar Keanggotaan Terdaftar</h3>
                    <p className="text-xs text-neutral-400 mt-0.5">Kelola data, peran, dan status akun pengguna</p>
                  </div>
                  <button
                    onClick={() => handleOpenMemberModal()}
                    className="bg-[#1E88E5] hover:bg-[#1565C0] text-white text-xs font-bold px-4 py-2.5 rounded-[8px] transition"
                  >
                    ➕ Tambah Anggota
                  </button>
                </div>

                {/* Tables of members */}
                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left border-collapse">
                    <thead>
                      <tr className="bg-neutral-50 text-neutral-500 font-bold border-b border-neutral-100">
                        <th className="p-3.5">ID Anggota</th>
                        <th className="p-3.5">Nama</th>
                        <th className="p-3.5">Email</th>
                        <th className="p-3.5">Peran</th>
                        <th className="p-3.5">Status</th>
                        <th className="p-3.5">Tanggal Bergabung</th>
                        <th className="p-3.5 text-right">Aksi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-100">
                      {filteredMembers.map((member) => (
                        <tr key={member.id} className="hover:bg-neutral-50/50 transition">
                          <td className="p-3.5 font-bold text-[#1E88E5]">{member.id}</td>
                          <td className="p-3.5 font-semibold text-[#212121]">{member.name}</td>
                          <td className="p-3.5 text-neutral-500">{member.email}</td>
                          <td className="p-3.5 font-medium">{member.role}</td>
                          <td className="p-3.5">
                            <span className={`px-2.5 py-1 rounded-full text-[9px] font-bold uppercase tracking-wider ${
                              member.status === 'Active' 
                                ? 'bg-emerald-50 text-[#43A047]' 
                                : 'bg-rose-50 text-rose-600'
                            }`}>
                              {member.status}
                            </span>
                          </td>
                          <td className="p-3.5 text-neutral-400">{member.joinedDate}</td>
                          <td className="p-3.5 text-right space-x-1.5 whitespace-nowrap">
                            <button 
                              onClick={() => handleOpenMemberModal(member)}
                              className="text-[#1E88E5] font-bold hover:underline"
                            >
                              Edit
                            </button>
                            <span className="text-neutral-200">|</span>
                            <button 
                              onClick={() => handleDeleteMember(member.id, member.name)}
                              className="text-rose-500 font-bold hover:underline"
                            >
                              Hapus
                            </button>
                          </td>
                        </tr>
                      ))}

                      {filteredMembers.length === 0 && (
                        <tr>
                          <td colSpan="7" className="text-center p-8 text-neutral-400">
                            Tidak ada data anggota yang cocok dengan kata kunci pencarian.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* VIEW: BLOG POSTS */}
            {activeTab === 'blog' && (
              <div className="space-y-6">
                <div className="bg-white rounded-[12px] p-5 border border-neutral-100 shadow-[0_4px_8px_rgba(0,0,0,0.03)] flex justify-between items-center">
                  <div>
                    <h3 className="font-poppins font-bold text-base text-[#212121]">Portal Artikel & Draf Blog</h3>
                    <p className="text-xs text-neutral-400 mt-0.5">Atur materi edukasi dan informasi yang tersaji di aplikasi klien</p>
                  </div>
                  <button
                    onClick={() => setShowBlogModal(true)}
                    className="bg-[#1E88E5] hover:bg-[#1565C0] text-white text-xs font-bold px-4 py-2.5 rounded-[8px] transition"
                  >
                    📝 Tulis Artikel Baru
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredBlogs.map((blog) => (
                    <article key={blog.id} className="bg-white rounded-[12px] border border-neutral-100 shadow-[0_4px_8px_rgba(0,0,0,0.03)] flex flex-col justify-between overflow-hidden">
                      <div className="p-5 space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-[10px] uppercase font-bold text-[#1E88E5] bg-[#1E88E5]/10 px-2.5 py-1 rounded-full">
                            {blog.category}
                          </span>
                          <span className={`text-[9px] font-bold px-2 py-0.5 rounded-md uppercase ${
                            blog.status === 'Published' 
                              ? 'bg-emerald-50 text-[#43A047]' 
                              : 'bg-amber-50 text-amber-600'
                          }`}>
                            {blog.status}
                          </span>
                        </div>

                        <h4 className="font-poppins font-bold text-sm text-[#212121] leading-snug">
                          {blog.title}
                        </h4>

                        {/* Open Sans applied for readable content body */}
                        <p className="text-xs text-neutral-500 font-opensans leading-relaxed line-clamp-3">
                          {blog.content}
                        </p>
                      </div>

                      <div className="p-5 bg-neutral-50 border-t border-neutral-100 flex justify-between items-center text-[11px] text-neutral-400 font-inter">
                        <div>
                          <p className="font-semibold text-neutral-600">Oleh: {blog.author}</p>
                          <p className="text-[9px] mt-0.5">{blog.date}</p>
                        </div>
                        <button 
                          onClick={() => handleDeleteBlog(blog.id)}
                          className="text-rose-500 font-bold hover:underline"
                        >
                          Hapus Artikel
                        </button>
                      </div>
                    </article>
                  ))}

                  {filteredBlogs.length === 0 && (
                    <div className="col-span-full text-center p-12 bg-white rounded-2xl border border-dashed border-neutral-200 text-neutral-400">
                      Belum ada artikel blog yang terdaftar atau hasil pencarian nihil.
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* VIEW: REDEEM REQUESTS */}
            {activeTab === 'redeem' && (
              <div className="bg-white rounded-[12px] p-5 border border-neutral-100 shadow-[0_4px_8px_rgba(0,0,0,0.03)] space-y-4">
                <div>
                  <h3 className="font-poppins font-bold text-base text-[#212121]">Verifikasi Klaim & Penukaran</h3>
                  <p className="text-xs text-neutral-400 mt-0.5">Tinjau, setujui, atau tolak klaim pencairan hadiah poin anggota</p>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left border-collapse">
                    <thead>
                      <tr className="bg-neutral-50 text-neutral-500 font-bold border-b border-neutral-100">
                        <th className="p-3.5">ID Transaksi</th>
                        <th className="p-3.5">Nama Anggota</th>
                        <th className="p-3.5">Poin Ditukarkan</th>
                        <th className="p-3.5">Hadiah / Reward</th>
                        <th className="p-3.5">Tanggal Pengajuan</th>
                        <th className="p-3.5">Status</th>
                        <th className="p-3.5 text-right">Aksi Moderasi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-100">
                      {filteredRedeems.map((redeem) => (
                        <tr key={redeem.id} className="hover:bg-neutral-50/50 transition">
                          <td className="p-3.5 font-bold text-neutral-600">{redeem.id}</td>
                          <td className="p-3.5 font-semibold text-[#212121]">{redeem.memberName}</td>
                          <td className="p-3.5 font-bold text-[#1E88E5]">{redeem.points.toLocaleString('id-ID')} Pts</td>
                          <td className="p-3.5 font-medium">{redeem.prize}</td>
                          <td className="p-3.5 text-neutral-400">{redeem.date}</td>
                          <td className="p-3.5">
                            <span className={`px-2.5 py-1 rounded-full text-[9px] font-bold uppercase tracking-wider ${
                              redeem.status === 'Approved' 
                                ? 'bg-emerald-50 text-[#43A047]' 
                                : redeem.status === 'Pending'
                                ? 'bg-amber-50 text-amber-600'
                                : 'bg-rose-50 text-rose-600'
                            }`}>
                              {redeem.status}
                            </span>
                          </td>
                          <td className="p-3.5 text-right space-x-2">
                            {redeem.status === 'Pending' ? (
                              <>
                                <button
                                  onClick={() => handleProcessRedeem(redeem.id, 'Approved')}
                                  className="bg-[#43A047] text-white font-bold px-2 py-1.5 rounded-[6px] hover:bg-emerald-700 transition text-[10px]"
                                >
                                  Approve
                                </button>
                                <button
                                  onClick={() => handleProcessRedeem(redeem.id, 'Rejected')}
                                  className="bg-rose-100 text-rose-600 font-bold px-2 py-1.5 rounded-[6px] hover:bg-rose-200 transition text-[10px]"
                                >
                                  Reject
                                </button>
                              </>
                            ) : (
                              <span className="text-neutral-400 italic text-[10px]">Telah Dimoderasi</span>
                            )}
                          </td>
                        </tr>
                      ))}

                      {filteredRedeems.length === 0 && (
                        <tr>
                          <td colSpan="7" className="text-center p-8 text-neutral-400">
                            Tidak ada pengajuan klaim penukaran poin saat ini.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* VIEW: SETTINGS */}
            {activeTab === 'settings' && (
              <div className="bg-white rounded-[12px] p-5 border border-neutral-100 shadow-[0_4px_8px_rgba(0,0,0,0.03)] space-y-6">
                <div>
                  <h3 className="font-poppins font-bold text-base text-[#212121]">Konfigurasi Sistem Utama</h3>
                  <p className="text-xs text-neutral-400 mt-0.5">Sesuaikan preferensi operasional dashboard manajemen</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs font-inter">
                  <div className="space-y-3">
                    <h4 className="font-bold text-neutral-600 uppercase tracking-wider text-[10px]">Opsi Tema & Aksesibilitas</h4>
                    <label className="flex items-center gap-3 bg-neutral-50 p-3 rounded-xl border border-neutral-100 cursor-pointer">
                      <input type="checkbox" defaultChecked className="rounded text-[#1E88E5] focus:ring-[#1E88E5] w-4 h-4" />
                      <div>
                        <p className="font-bold text-[#212121]">Gunakan Pola Warna Solid</p>
                        <p className="text-[10px] text-neutral-400 mt-0.5">Mempertahankan palet biru (#1E88E5) agar kontras tinggi</p>
                      </div>
                    </label>

                    <label className="flex items-center gap-3 bg-neutral-50 p-3 rounded-xl border border-neutral-100 cursor-pointer">
                      <input type="checkbox" defaultChecked className="rounded text-[#1E88E5] focus:ring-[#1E88E5] w-4 h-4" />
                      <div>
                        <p className="font-bold text-[#212121]">Tingkatkan Kepadatan Tabel</p>
                        <p className="text-[10px] text-neutral-400 mt-0.5">Mengurangi jarak padding sel untuk memuat baris lebih banyak</p>
                      </div>
                    </label>
                  </div>

                  <div className="space-y-3">
                    <h4 className="font-bold text-neutral-600 uppercase tracking-wider text-[10px]">Sistem Integrasi Platform</h4>
                    <div className="p-4 bg-[#1E88E5]/5 border border-[#1E88E5]/10 rounded-xl space-y-2">
                      <p className="font-semibold text-neutral-700">🔐 Status Kunci API (Gateway):</p>
                      <p className="font-mono text-[10px] text-neutral-500">APEX_KEY_LIVE_9982x11283hds09</p>
                      <button 
                        onClick={() => addToast('API Key sukses dibuat ulang.', 'info')}
                        className="bg-white hover:bg-[#E3F2FD] border border-[#1E88E5] text-[#1E88E5] text-[10px] font-bold px-3 py-1.5 rounded-lg transition"
                      >
                        Regenerate API Key
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

          </main>

        </div>

        {/* =======================================================
            FOOTER (COPYRIGHT & USEFUL LINKS)
            ======================================================= */}
        <footer className="bg-white border-t border-neutral-100 py-6 mt-12 text-xs font-inter text-neutral-400">
          <div className="max-w-7xl w-full mx-auto px-6 flex flex-col sm:flex-row justify-between items-center gap-3">
            <div>
              <p className="font-semibold text-neutral-500">© 2026 ApexDash. All rights reserved.</p>
              <p className="text-[10px] text-neutral-400 mt-0.5">Core Administrator Integrated Suite Suite Portal.</p>
            </div>
            <div className="flex gap-4 font-bold text-[#1E88E5]">
              <button onClick={() => addToast('Syarat & Ketentuan Layanan dibuka.', 'info')} className="hover:underline">Terms of Service</button>
              <button onClick={() => addToast('Kebijakan Privasi dibuka.', 'info')} className="hover:underline">Privacy Policy</button>
              <button onClick={() => addToast('Sistem Uptime 100% lancar.', 'success')} className="text-[#43A047] flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#43A047] animate-pulse"></span>
                System Normal
              </button>
            </div>
          </div>
        </footer>

      </div>

      {/* =======================================================
          MODAL 1: ADD / EDIT MEMBER (STATE DRIVEN)
          ======================================================= */}
      {showMemberModal && (
        <div className="fixed inset-0 bg-neutral-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in font-inter">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl border border-neutral-100 transform transition-all scale-100">
            <div className="flex justify-between items-center mb-5">
              <h3 className="text-base font-extrabold text-[#212121] font-poppins">
                {editingMember ? '📝 Sunting Informasi Anggota' : '👥 Tambah Anggota Baru'}
              </h3>
              <button 
                onClick={() => setShowMemberModal(false)}
                className="w-8 h-8 rounded-xl bg-neutral-50 hover:bg-neutral-100 flex items-center justify-center text-neutral-500 font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveMember} className="space-y-4 text-xs font-medium text-neutral-500">
              <div>
                <label className="block font-bold mb-1">Nama Lengkap</label>
                <input 
                  type="text" 
                  value={memberForm.name}
                  onChange={(e) => setMemberForm({ ...memberForm, name: e.target.value })}
                  placeholder="Contoh: Muhammad Yusuf"
                  className="w-full border border-neutral-200 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-[#1E88E5] text-[#212121]"
                  required
                />
              </div>

              <div>
                <label className="block font-bold mb-1">Alamat Email Aktif</label>
                <input 
                  type="email" 
                  value={memberForm.email}
                  onChange={(e) => setMemberForm({ ...memberForm, email: e.target.value })}
                  placeholder="yusuf@domain.com"
                  className="w-full border border-neutral-200 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-[#1E88E5] text-[#212121]"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold mb-1">Peran Akses</label>
                  <select 
                    value={memberForm.role}
                    onChange={(e) => setMemberForm({ ...memberForm, role: e.target.value })}
                    className="w-full border border-neutral-200 bg-white rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-[#1E88E5] text-[#212121]"
                  >
                    <option value="Member">Member</option>
                    <option value="Editor">Editor</option>
                    <option value="Administrator">Administrator</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold mb-1">Status Akun</label>
                  <select 
                    value={memberForm.status}
                    onChange={(e) => setMemberForm({ ...memberForm, status: e.target.value })}
                    className="w-full border border-neutral-200 bg-white rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-[#1E88E5] text-[#212121]"
                  >
                    <option value="Active">Active</option>
                    <option value="Suspended">Suspended</option>
                  </select>
                </div>
              </div>

              <div className="pt-2 flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowMemberModal(false)}
                  className="flex-1 bg-neutral-100 text-neutral-600 hover:bg-neutral-200 py-3 rounded-xl font-bold text-xs transition"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-[#1E88E5] text-white py-3 rounded-xl font-bold text-xs shadow-lg hover:bg-[#1565C0] transition"
                >
                  {editingMember ? 'Simpan Perubahan' : 'Daftarkan Anggota'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =======================================================
          MODAL 2: WRITE BLOG POST (STATE DRIVEN)
          ======================================================= */}
      {showBlogModal && (
        <div className="fixed inset-0 bg-neutral-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in font-inter">
          <div className="bg-white rounded-2xl w-full max-w-lg p-6 shadow-2xl border border-neutral-100 transform transition-all scale-100">
            <div className="flex justify-between items-center mb-5">
              <h3 className="text-base font-extrabold text-[#212121] font-poppins">📝 Tulis Artikel Blog Baru</h3>
              <button 
                onClick={() => setShowBlogModal(false)}
                className="w-8 h-8 rounded-xl bg-neutral-50 hover:bg-neutral-100 flex items-center justify-center text-neutral-500 font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateBlog} className="space-y-4 text-xs font-medium text-neutral-500">
              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-2">
                  <label className="block font-bold mb-1">Judul Artikel</label>
                  <input 
                    type="text" 
                    value={blogForm.title}
                    onChange={(e) => setBlogForm({ ...blogForm, title: e.target.value })}
                    placeholder="Contoh: Dampak Efisiensi Cargo Modern..."
                    className="w-full border border-neutral-200 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-[#1E88E5] text-[#212121]"
                    required
                  />
                </div>
                <div>
                  <label className="block font-bold mb-1">Kategori</label>
                  <select 
                    value={blogForm.category}
                    onChange={(e) => setBlogForm({ ...blogForm, category: e.target.value })}
                    className="w-full border border-neutral-200 bg-white rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-[#1E88E5] text-[#212121]"
                  >
                    <option value="Logistik">Logistik</option>
                    <option value="Keselamatan">Keselamatan</option>
                    <option value="Inspirasi">Inspirasi</option>
                    <option value="Konstruksi">Konstruksi</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold mb-1">Isi / Materi Artikel</label>
                <textarea 
                  value={blogForm.content}
                  onChange={(e) => setBlogForm({ ...blogForm, content: e.target.value })}
                  placeholder="Tuliskan draf artikel lengkap Anda di sini..."
                  className="w-full border border-neutral-200 rounded-xl p-3 h-36 focus:outline-none focus:ring-2 focus:ring-[#1E88E5] text-[#212121] font-opensans leading-relaxed"
                  required
                />
              </div>

              <div className="pt-2 flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowBlogModal(false)}
                  className="flex-1 bg-neutral-100 text-neutral-600 hover:bg-neutral-200 py-3 rounded-xl font-bold text-xs transition"
                >
                  Kembali ke Dashboard
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-[#1E88E5] text-white py-3 rounded-xl font-bold text-xs shadow-lg hover:bg-[#1565C0] transition"
                >
                  🚀 Terbitkan Artikel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =======================================================
          MODAL 3: REVIEW / PROCESS REDEEM CLAIM
          ======================================================= */}
      {showRedeemModal && selectedRedeem && (
        <div className="fixed inset-0 bg-neutral-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in font-inter">
          <div className="bg-white rounded-2xl w-full max-w-sm p-6 shadow-2xl border border-neutral-100 transform transition-all scale-100">
            <div className="flex justify-between items-center mb-5">
              <h3 className="text-base font-extrabold text-[#212121] font-poppins">💸 Moderasi Permintaan Klaim</h3>
              <button 
                onClick={() => setShowRedeemModal(false)}
                className="w-8 h-8 rounded-xl bg-neutral-50 hover:bg-neutral-100 flex items-center justify-center text-neutral-500 font-bold"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4 text-xs text-neutral-500 font-medium">
              <p className="bg-neutral-50 p-3 rounded-xl border border-neutral-100 leading-relaxed">
                Anda sedang meninjau pengajuan penukaran hadiah atas nama <b className="text-[#212121]">{selectedRedeem.memberName}</b> pada tanggal <span className="font-bold">{selectedRedeem.date}</span>.
              </p>

              <div className="space-y-2">
                <p>🎁 <b>Pilihan Hadiah:</b> {selectedRedeem.prize}</p>
                <p>💎 <b>Poin Terpotong:</b> {selectedRedeem.points.toLocaleString('id-ID')} Pts</p>
                <p>🎫 <b>ID Transaksi:</b> {selectedRedeem.id}</p>
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  onClick={() => handleProcessRedeem(selectedRedeem.id, 'Rejected')}
                  className="flex-1 bg-rose-50 text-rose-600 hover:bg-rose-100 py-3 rounded-xl font-bold text-xs transition"
                >
                  Tolak Klaim ✕
                </button>
                <button
                  onClick={() => handleProcessRedeem(selectedRedeem.id, 'Approved')}
                  className="flex-1 bg-[#43A047] text-white hover:bg-emerald-700 py-3 rounded-xl font-bold text-xs shadow-lg transition"
                >
                  Setujui Klaim ✓
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}