import React, { useState, useEffect } from 'react';

// ==========================================
// DUMMY STATE DATABASE (MUTABLE)
// ==========================================
const INITIAL_MEMBERS = [
  { id: 'MEM-9021', name: 'Ahmad Supriadi', email: 'ahmad.supriadi@workmail.com', role: 'Premium Contractor', status: 'Active', joinedDate: '2026-04-12' },
  { id: 'MEM-4412', name: 'Siti Rahmawati', email: 'siti.rahma@konstruksindo.id', role: 'Supplier Partner', status: 'Active', joinedDate: '2026-05-18' },
  { id: 'MEM-8873', name: 'Budi Hartono', email: 'budi.hartono@semenjaya.com', role: 'Architect Partner', status: 'Pending', joinedDate: '2026-06-01' },
  { id: 'MEM-1190', name: 'Dewi Lestari', email: 'dewi.lestari@saranabaja.co.id', role: 'VVIP Client', status: 'Suspended', joinedDate: '2025-11-20' }
];

const INITIAL_BLOGS = [
  { id: 'BLOG-1', title: '5 Tren Baja Ringan untuk Proyek Infrastruktur 2026', author: 'Siti Rahmawati', category: 'Inovasi', status: 'Published', views: 1420, date: '2026-06-15' },
  { id: 'BLOG-2', title: 'Tips Menghindari ODOL (Over Loading) pada Truk Engkel CDE', author: 'Ahmad Supriadi', category: 'Logistik', status: 'Published', views: 980, date: '2026-06-20' },
  { id: 'BLOG-3', title: 'Strategi Negosiasi Termin Tempo 30 Hari bagi Kontraktor Baru', author: 'Budi Hartono', category: 'Keuangan', status: 'Draft', views: 0, date: '2026-06-23' }
];

const INITIAL_REDEEMS = [
  { id: 'RED-501', member: 'Ahmad Supriadi', item: 'E-Wallet Balance Rp 500.000', points: 500, status: 'Pending', date: '2026-06-21' },
  { id: 'RED-502', member: 'Siti Rahmawati', item: 'Voucher BBM Solar Industri 100 Liter', points: 1200, status: 'Approved', date: '2026-06-19' },
  { id: 'RED-503', member: 'Dewi Lestari', item: 'Helm Keselamatan Kerja Proyek VVIP', points: 350, status: 'Rejected', date: '2026-06-14' }
];

export default function App() {
  const [activeTab, setActiveTab] = useState('members'); // members | blog | redeem | settings
  const [members, setMembers] = useState(INITIAL_MEMBERS);
  const [blogs, setBlogs] = useState(INITIAL_BLOGS);
  const [redeems, setRedeems] = useState(INITIAL_REDEEMS);
  
  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  // Modals Controller State
  const [showMemberModal, setShowMemberModal] = useState(false);
  const [showBlogModal, setShowBlogModal] = useState(false);
  
  // Form States
  const [memberForm, setMemberForm] = useState({ name: '', email: '', role: 'Premium Contractor' });
  const [blogForm, setBlogForm] = useState({ title: '', category: 'Inovasi', content: '' });

  // System Notifications
  const [toast, setToast] = useState(null);

  // Stats Ranges
  const [statsPeriod, setStatsPeriod] = useState('monthly'); // daily | weekly | monthly

  const triggerToast = (msg, type = 'success') => {
    setToast({ text: msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const totalActiveMembers = members.filter(m => m.status === 'Active').length;
  const totalPublishedBlogs = blogs.filter(b => b.status === 'Published').length;
  const totalPendingRedeems = redeems.filter(r => r.status === 'Pending').length;
  
  // Total Points Redeemed (Sum points of Approved status)
  const totalPointsRedeemed = redeems
    .filter(r => r.status === 'Approved')
    .reduce((sum, item) => sum + item.points, 0);

  const handleAddMember = (e) => {
    e.preventDefault();
    if (!memberForm.name || !memberForm.email) {
      triggerToast('Mohon lengkapi semua data formulir anggota!', 'error');
      return;
    }
    const newMember = {
      id: 'MEM-' + Math.floor(1000 + Math.random() * 9000),
      name: memberForm.name,
      email: memberForm.email,
      role: memberForm.role,
      status: 'Active',
      joinedDate: new Date().toISOString().split('T')[0]
    };
    setMembers([newMember, ...members]);
    setMemberForm({ name: '', email: '', role: 'Premium Contractor' });
    setShowMemberModal(false);
    triggerToast(`Anggota "${newMember.name}" berhasil ditambahkan ke database!`);
  };

  const handleAddBlog = (e) => {
    e.preventDefault();
    if (!blogForm.title) {
      triggerToast('Judul artikel wajib diisi!', 'error');
      return;
    }
    const newBlog = {
      id: 'BLOG-' + (blogs.length + 1),
      title: blogForm.title,
      author: 'Administrator Hub',
      category: blogForm.category,
      status: 'Published',
      views: 0,
      date: new Date().toISOString().split('T')[0]
    };
    setBlogs([newBlog, ...blogs]);
    setBlogForm({ title: '', category: 'Inovasi', content: '' });
    setShowBlogModal(false);
    triggerToast('Artikel blog baru berhasil diterbitkan secara live!');
  };

  const handleApproveRedeem = (id) => {
    setRedeems(prev => prev.map(r => r.id === id ? { ...r, status: 'Approved' } : r));
    triggerToast('Permintaan penukaran poin disetujui, bonus segera dikirim!');
  };

  const handleRejectRedeem = (id) => {
    setRedeems(prev => prev.map(r => r.id === id ? { ...r, status: 'Rejected' } : r));
    triggerToast('Permintaan penukaran poin ditolak oleh administrator.', 'warning');
  };

  const handleDeleteMember = (id) => {
    setMembers(prev => prev.filter(m => m.id !== id));
    triggerToast('Anggota berhasil dihapus dari sistem pengawasan.', 'warning');
  };

  const filteredMembers = members.filter(m => {
    const matchesSearch = m.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          m.email.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          m.id.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === 'all' || m.status.toLowerCase() === filterStatus.toLowerCase();
    return matchesSearch && matchesStatus;
  });

  const filteredBlogs = blogs.filter(b => 
    b.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
    b.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="dashboard-app">
      
      {}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=Poppins:wght@600;700&family=Open+Sans:wght@400;600&display=swap');

        :root {
          --primary-blue: #1E88E5;
          --primary-blue-hover: #1565C0;
          --accent-green: #43A047;
          --accent-green-hover: #2E7D32;
          --accent-yellow: #FDD835;
          --neutral-white: #FFFFFF;
          --dark-gray: #212121;
          --light-gray: #F5F5F5;
          --border-color: #E0E0E0;
          --text-muted: #757575;
          --card-shadow: 0 4px 8px rgba(0, 0, 0, 0.05);
        }

        * {
          box-sizing: border-box;
          margin: 0;
          padding: 0;
        }

        body {
          font-family: 'Inter', sans-serif;
          background-color: var(--light-gray);
          color: var(--dark-gray);
          overflow-x: hidden;
        }

        /* Layout Structure */
        .dashboard-app {
          display: flex;
          min-height: 100vh;
          width: 100vw;
          background-color: var(--light-gray);
        }

        /* Sidebar Navigation style */
        .sidebar-left {
          width: 260px;
          background-color: var(--dark-gray);
          color: var(--neutral-white);
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          padding: 24px 16px;
          flex-shrink: 0;
          position: sticky;
          top: 0;
          height: 100vh;
          box-shadow: 4px 0 10px rgba(0, 0, 0, 0.15);
          z-index: 50;
        }

        .brand-logo-area {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 32px;
          padding: 0 8px;
        }

        .brand-logo-icon {
          font-size: 28px;
          background-color: var(--primary-blue);
          width: 44px;
          height: 44px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 12px;
        }

        .brand-name {
          font-family: 'Poppins', sans-serif;
          font-size: 18px;
          font-weight: 700;
          letter-spacing: -0.5px;
          line-height: 1.2;
        }

        .brand-name span {
          color: var(--primary-blue);
        }

        .nav-menu-list {
          list-style: none;
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .nav-menu-item button {
          width: 100%;
          background: none;
          border: none;
          color: #B0BEC5;
          padding: 12px 16px;
          border-radius: 8px;
          font-size: 14px;
          font-weight: 500;
          text-align: left;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 12px;
          transition: all 0.2s ease;
        }

        .nav-menu-item button:hover {
          background-color: rgba(255, 255, 255, 0.08);
          color: var(--neutral-white);
        }

        .nav-menu-item.active button {
          background-color: var(--primary-blue);
          color: var(--neutral-white);
          font-weight: 600;
        }

        .nav-menu-item.active .nav-icon svg {
          fill: var(--neutral-white);
        }

        .nav-icon {
          width: 20px;
          height: 20px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .sidebar-footer-info {
          font-size: 11px;
          color: #78909C;
          border-top: 1px solid rgba(255, 255, 255, 0.1);
          padding-top: 16px;
          margin-top: 24px;
          line-height: 1.4;
        }

        /* Main Workspace Container */
        .workspace-main {
          flex: 1;
          display: flex;
          flex-direction: column;
          min-width: 0;
        }

        /* Top Bar Header Area */
        .header-topbar {
          background-color: var(--neutral-white);
          height: 70px;
          border-bottom: 1px solid var(--border-color);
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 32px;
          position: sticky;
          top: 0;
          z-index: 40;
        }

        .search-container {
          position: relative;
          width: 320px;
        }

        .search-icon-inside {
          position: absolute;
          left: 14px;
          top: 50%;
          transform: translateY(-50%);
          display: flex;
          align-items: center;
          pointer-events: none;
        }

        .search-input-field {
          width: 100%;
          background-color: var(--light-gray);
          border: 1px solid var(--border-color);
          border-radius: 8px;
          padding: 10px 14px 10px 42px;
          font-size: 13px;
          font-family: 'Inter', sans-serif;
          color: var(--dark-gray);
          transition: border-color 0.2s ease, box-shadow 0.2s ease;
        }

        .search-input-field:focus {
          outline: none;
          border-color: var(--primary-blue);
          box-shadow: 0 0 0 3px rgba(30, 136, 229, 0.15);
        }

        .profile-user-corner {
          display: flex;
          align-items: center;
          gap: 16px;
        }

        .notif-bell-btn {
          background: none;
          border: none;
          cursor: pointer;
          position: relative;
          width: 38px;
          height: 38px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 50%;
          transition: background-color 0.2s ease;
        }

        .notif-bell-btn:hover {
          background-color: var(--light-gray);
        }

        .notif-dot-active {
          position: absolute;
          top: 8px;
          right: 8px;
          width: 8px;
          height: 8px;
          background-color: var(--accent-green);
          border: 1.5px solid var(--neutral-white);
          border-radius: 50%;
        }

        .user-meta-header {
          display: flex;
          align-items: center;
          gap: 12px;
          cursor: pointer;
        }

        .avatar-placeholder {
          width: 40px;
          height: 40px;
          background-color: #E3F2FD;
          border: 2px solid var(--primary-blue);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 600;
          color: var(--primary-blue);
          font-size: 14px;
        }

        .user-info-text {
          display: flex;
          flex-direction: column;
        }

        .user-display-name {
          font-size: 14px;
          font-weight: 600;
          color: var(--dark-gray);
        }

        .user-display-role {
          font-size: 11px;
          color: var(--text-muted);
          margin-top: 1px;
        }

        /* Content Area grid */
        .dashboard-content {
          padding: 32px;
          display: flex;
          flex-direction: column;
          gap: 32px;
          max-width: 1400px;
          width: 100%;
          margin: 0 auto;
        }

        .section-headline-area {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .section-headline {
          font-family: 'Poppins', sans-serif;
          font-size: 24px;
          font-weight: 700;
          color: var(--dark-gray);
        }

        .section-subheadline {
          font-size: 13px;
          color: var(--text-muted);
          margin-top: 4px;
        }

        /* Colored Statistic Grid */
        .stats-grid-row {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
          gap: 16px;
        }

        .stat-card-widget {
          background-color: var(--neutral-white);
          border-radius: 12px;
          padding: 24px;
          box-shadow: var(--card-shadow);
          display: flex;
          align-items: center;
          justify-content: space-between;
          border-left: 5px solid var(--primary-blue);
          transition: transform 0.2s ease, box-shadow 0.2s ease;
        }

        .stat-card-widget:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 12px rgba(0, 0, 0, 0.08);
        }

        .stat-card-widget.green-accent {
          border-left-color: var(--accent-green);
        }

        .stat-card-widget.yellow-accent {
          border-left-color: var(--accent-yellow);
        }

        .stat-card-widget.blue-accent {
          border-left-color: var(--primary-blue);
        }

        .stat-info-left {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .stat-card-label {
          font-size: 12px;
          font-weight: 600;
          color: var(--text-muted);
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .stat-card-number {
          font-size: 28px;
          font-weight: 700;
          color: var(--dark-gray);
          line-height: 1;
        }

        .stat-card-subtext {
          font-size: 11px;
          color: var(--text-muted);
          display: flex;
          align-items: center;
          gap: 4px;
        }

        .stat-card-icon-right {
          width: 48px;
          height: 48px;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          background-color: var(--light-gray);
          font-size: 22px;
        }

        /* Main Content Block Grid System */
        .main-content-layout-blocks {
          display: grid;
          grid-template-columns: 2fr 1fr;
          gap: 24px;
          align-items: start;
        }

        @media (max-width: 1024px) {
          .main-content-layout-blocks {
            grid-template-columns: 1fr;
          }
        }

        /* Custom Card Panel Component */
        .panel-container-card {
          background-color: var(--neutral-white);
          border-radius: 12px;
          box-shadow: var(--card-shadow);
          padding: 24px;
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .panel-header-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          border-bottom: 1px solid var(--border-color);
          padding-bottom: 16px;
        }

        .panel-title-with-icon {
          display: flex;
          align-items: center;
          gap: 10px;
          font-family: 'Poppins', sans-serif;
          font-size: 16px;
          font-weight: 700;
          color: var(--dark-gray);
        }

        .table-data-scrolled {
          overflow-x: auto;
          width: 100%;
        }

        /* Tables modern layout */
        .modern-data-table {
          width: 100%;
          border-collapse: collapse;
          text-align: left;
          font-size: 13px;
        }

        .modern-data-table th {
          background-color: var(--light-gray);
          color: var(--dark-gray);
          font-weight: 600;
          padding: 12px 16px;
          border-bottom: 1px solid var(--border-color);
        }

        .modern-data-table td {
          padding: 14px 16px;
          border-bottom: 1px solid var(--border-color);
          color: var(--dark-gray);
          font-family: 'Inter', sans-serif;
        }

        .modern-data-table tr:last-child td {
          border-bottom: none;
        }

        .modern-data-table tr:hover td {
          background-color: rgba(30, 136, 229, 0.02);
        }

        /* Status badge styles */
        .badge-status-container {
          display: inline-flex;
          align-items: center;
          padding: 4px 10px;
          border-radius: 12px;
          font-size: 11px;
          font-weight: 600;
          text-transform: capitalize;
        }

        .badge-status-container.active {
          background-color: #E8F5E9;
          color: var(--accent-green);
        }

        .badge-status-container.pending {
          background-color: #FFFDE7;
          color: #F57F17;
        }

        .badge-status-container.suspended {
          background-color: #FFEBEE;
          color: #C62828;
        }

        .badge-status-container.approved {
          background-color: #E8F5E9;
          color: var(--accent-green);
        }

        .badge-status-container.rejected {
          background-color: #FFEBEE;
          color: #C62828;
        }

        /* Button styles requested precisely */
        .btn-style-primary {
          background-color: var(--primary-blue);
          color: var(--neutral-white);
          border: none;
          padding: 10px 18px;
          font-size: 13px;
          font-weight: 600;
          border-radius: 8px;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          gap: 8px;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
          transition: all 0.2s ease;
        }

        .btn-style-primary:hover {
          background-color: var(--primary-blue-hover);
          transform: translateY(-1px);
        }

        .btn-style-secondary {
          border: 1px solid var(--primary-blue);
          color: var(--primary-blue);
          background-color: var(--neutral-white);
          padding: 9px 16px;
          font-size: 13px;
          font-weight: 600;
          border-radius: 8px;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          gap: 8px;
          transition: all 0.2s ease;
        }

        .btn-style-secondary:hover {
          background-color: #E3F2FD;
          transform: translateY(-1px);
        }

        .btn-style-danger {
          background-color: #FFEBEE;
          color: #C62828;
          border: none;
          padding: 6px 12px;
          font-size: 11px;
          font-weight: 600;
          border-radius: 6px;
          cursor: pointer;
          transition: all 0.15s ease;
        }

        .btn-style-danger:hover {
          background-color: #FFCDD2;
        }

        .btn-style-success-mini {
          background-color: #E8F5E9;
          color: var(--accent-green);
          border: none;
          padding: 6px 12px;
          font-size: 11px;
          font-weight: 600;
          border-radius: 6px;
          cursor: pointer;
          transition: all 0.15s ease;
          margin-right: 6px;
        }

        .btn-style-success-mini:hover {
          background-color: #C8E6C9;
        }

        /* Blog Section Component Card */
        .blogs-grid-container {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
          gap: 16px;
        }

        .blog-item-card {
          background-color: var(--neutral-white);
          border: 1px solid var(--border-color);
          border-radius: 12px;
          overflow: hidden;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          transition: transform 0.2s ease, box-shadow 0.2s ease;
        }

        .blog-item-card:hover {
          transform: translateY(-2px);
          box-shadow: var(--card-shadow);
        }

        .blog-card-body {
          padding: 16px;
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .blog-meta-row {
          display: flex;
          justify-content: space-between;
          font-size: 11px;
          color: var(--text-muted);
        }

        .blog-tag-badge {
          background-color: #E3F2FD;
          color: var(--primary-blue);
          padding: 2px 8px;
          border-radius: 4px;
          font-weight: 600;
        }

        .blog-item-title {
          font-family: 'Poppins', sans-serif;
          font-size: 14px;
          font-weight: 700;
          color: var(--dark-gray);
          line-height: 1.4;
          cursor: pointer;
        }

        .blog-item-title:hover {
          color: var(--primary-blue);
        }

        .blog-card-footer {
          border-top: 1px solid var(--border-color);
          padding: 12px 16px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 12px;
          background-color: var(--light-gray);
        }

        /* SVG Data Chart */
        .chart-visual-box {
          height: 180px;
          display: flex;
          align-items: flex-end;
          justify-content: space-between;
          padding: 10px 0;
          position: relative;
        }

        .chart-svg-container {
          width: 100%;
          height: 100%;
        }

        /* Quick Action Section styled specifically */
        .quick-action-strip {
          background-color: var(--neutral-white);
          border-radius: 12px;
          box-shadow: var(--card-shadow);
          padding: 20px;
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .quick-action-strip-title {
          font-family: 'Poppins', sans-serif;
          font-size: 13px;
          font-weight: 700;
          color: var(--dark-gray);
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .quick-buttons-row {
          display: flex;
          flex-wrap: wrap;
          gap: 12px;
        }

        /* System notification system */
        .system-toast-container {
          position: fixed;
          bottom: 30px;
          right: 30px;
          background-color: var(--dark-gray);
          color: var(--neutral-white);
          padding: 16px 24px;
          border-radius: 8px;
          box-shadow: 0 10px 20px rgba(0, 0, 0, 0.2);
          font-size: 13px;
          font-weight: 500;
          display: flex;
          align-items: center;
          gap: 12px;
          z-index: 1000;
          animation: slideUpIn 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
          border-left: 4px solid var(--primary-blue);
        }

        .system-toast-container.success {
          border-left-color: var(--accent-green);
        }

        .system-toast-container.warning {
          border-left-color: var(--accent-yellow);
        }

        .system-toast-container.error {
          border-left-color: #C62828;
        }

        /* Form Modal structures */
        .modal-overlay-bg {
          position: fixed;
          inset: 0;
          background-color: rgba(33, 33, 33, 0.5);
          backdrop-filter: blur(4px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 500;
        }

        .modal-body-container {
          background-color: var(--neutral-white);
          border-radius: 12px;
          width: 100%;
          max-width: 480px;
          box-shadow: 0 20px 40px rgba(0,0,0,0.15);
          padding: 24px;
          display: flex;
          flex-direction: column;
          gap: 20px;
          animation: scaleInModal 0.2s ease-out;
        }

        .modal-header-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          border-bottom: 1px solid var(--border-color);
          padding-bottom: 12px;
        }

        .modal-title {
          font-family: 'Poppins', sans-serif;
          font-size: 18px;
          font-weight: 700;
          color: var(--dark-gray);
        }

        .close-modal-btn {
          background: none;
          border: none;
          font-size: 20px;
          color: var(--text-muted);
          cursor: pointer;
        }

        .form-group-field {
          display: flex;
          flex-direction: column;
          gap: 6px;
          margin-bottom: 16px;
        }

        .form-label-style {
          font-size: 11px;
          font-weight: 600;
          color: var(--text-muted);
          text-transform: uppercase;
        }

        .form-input-control {
          background-color: var(--light-gray);
          border: 1px solid var(--border-color);
          border-radius: 8px;
          padding: 10px 12px;
          font-size: 13px;
          color: var(--dark-gray);
          font-family: 'Inter', sans-serif;
          width: 100%;
        }

        .form-input-control:focus {
          outline: none;
          border-color: var(--primary-blue);
        }

        /* Footer Copyright design */
        .footer-copyright-strip {
          border-top: 1px solid var(--border-color);
          padding-top: 20px;
          margin-top: 40px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 12px;
          color: var(--text-muted);
        }

        .footer-links-list {
          display: flex;
          gap: 16px;
          list-style: none;
        }

        .footer-links-list a {
          color: var(--text-muted);
          text-decoration: none;
          transition: color 0.2s ease;
        }

        .footer-links-list a:hover {
          color: var(--primary-blue);
        }

        /* Filter Row bar */
        .filter-panel-row {
          display: flex;
          gap: 12px;
          align-items: center;
          flex-wrap: wrap;
        }

        .pill-tab-filter {
          background-color: var(--light-gray);
          border: 1px solid var(--border-color);
          padding: 6px 14px;
          font-size: 12px;
          border-radius: 20px;
          cursor: pointer;
          font-weight: 500;
          transition: all 0.2s ease;
          color: var(--text-muted);
        }

        .pill-tab-filter.active {
          background-color: var(--primary-blue);
          border-color: var(--primary-blue);
          color: var(--neutral-white);
          font-weight: 600;
        }

        /* Tooltip details design */
        .chart-tooltip-bubble {
          position: absolute;
          background-color: var(--dark-gray);
          color: var(--neutral-white);
          padding: 6px 12px;
          border-radius: 6px;
          font-size: 11px;
          pointer-events: none;
          box-shadow: 0 4px 6px rgba(0,0,0,0.1);
          transform: translate(-50%, -100%);
        }

        /* Animations */
        @keyframes slideUpIn {
          from {
            transform: translateY(20px);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }

        @keyframes scaleInModal {
          from {
            transform: scale(0.95);
            opacity: 0;
          }
          to {
            transform: scale(1);
            opacity: 1;
          }
        }
      `}</style>

      {/* TOAST SYSTEM ALERTS */}
      {toast && (
        <div className={`system-toast-container ${toast.type}`}>
          <span>
            {toast.type === 'success' ? '✅' : toast.type === 'warning' ? '⚠️' : '🚨'}
          </span>
          <span>{toast.text}</span>
        </div>
      )}

      {/* =======================================================
          SIDEBAR NAVIGATION (LEFT SECTION)
          ======================================================= */}
      <aside className="sidebar-left">
        <div>
          {/* Logo Brand Title */}
          <div className="brand-logo-area">
            <div className="brand-logo-icon">
              <span style={{ fontSize: '20px' }}>📊</span>
            </div>
            <div>
              <h1 className="brand-name">
                BahanBangun<span>Go</span>
              </h1>
              <span style={{ fontSize: '9px', color: '#90A4AE', fontWeight: 'bold', trackingSpacing: '1px' }}>
                ENTERPRISE CONSOLE
              </span>
            </div>
          </div>

          {/* Sidebar Menu Items */}
          <nav>
            <ul className="nav-menu-list">
              <li className={`nav-menu-item ${activeTab === 'members' ? 'active' : ''}`}>
                <button onClick={() => { setActiveTab('members'); setSearchQuery(''); }}>
                  <span className="nav-icon">👤</span>
                  <span>Anggota (Members)</span>
                </button>
              </li>
              <li className={`nav-menu-item ${activeTab === 'blog' ? 'active' : ''}`}>
                <button onClick={() => { setActiveTab('blog'); setSearchQuery(''); }}>
                  <span className="nav-icon">📝</span>
                  <span>Posting Blog (Blogs)</span>
                </button>
              </li>
              <li className={`nav-menu-item ${activeTab === 'redeem' ? 'active' : ''}`}>
                <button onClick={() => { setActiveTab('redeem'); setSearchQuery(''); }}>
                  <span className="nav-icon">🎁</span>
                  <span>Penukaran (Redeem)</span>
                  {totalPendingRedeems > 0 && (
                    <span style={{
                      backgroundColor: 'var(--accent-yellow)',
                      color: 'var(--dark-gray)',
                      fontSize: '10px',
                      fontWeight: 'bold',
                      padding: '2px 6px',
                      borderRadius: '10px',
                      marginLeft: 'auto'
                    }}>
                      {totalPendingRedeems}
                    </span>
                  )}
                </button>
              </li>
              <li className={`nav-menu-item ${activeTab === 'settings' ? 'active' : ''}`}>
                <button onClick={() => { setActiveTab('settings'); setSearchQuery(''); }}>
                  <span className="nav-icon">⚙️</span>
                  <span>Pengaturan (Settings)</span>
                </button>
              </li>
            </ul>
          </nav>
        </div>

        {/* Sidebar Footer details */}
        <div className="sidebar-footer-info">
          <p>Logged as: <b>admin_pro</b></p>
          <p style={{ marginTop: '4px', fontSize: '10px' }}>Build v2.4.1 (Stable)</p>
        </div>
      </aside>

      {/* =======================================================
          MAIN WORKSPACE WRAPPER
          ======================================================= */}
      <main className="workspace-main">
        
        {}
        {/* HEADER TOP-BAR */}
        <header className="header-topbar">
          <div className="search-container">
            <span className="search-icon-inside">🔍</span>
            <input 
              type="text" 
              placeholder="Cari data anggota, artikel, atau resi..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-input-field"
            />
          </div>

          <div className="profile-user-corner">
            {/* Bell Button */}
            <button className="notif-bell-btn" onClick={() => triggerToast('Tidak ada notifikasi sistem baru.', 'success')}>
              <span>🔔</span>
              {totalPendingRedeems > 0 && <span className="notif-dot-active"></span>}
            </button>

            {/* Separator */}
            <span style={{ width: '1px', height: '24px', backgroundColor: 'var(--border-color)' }}></span>

            {/* User Profile Info */}
            <div className="user-meta-header" onClick={() => setActiveTab('settings')}>
              <div className="avatar-placeholder">AD</div>
              <div className="user-info-text">
                <span className="user-display-name">D. Stwaret</span>
                <span className="user-display-role">Super Administrator</span>
              </div>
            </div>
          </div>
        </header>

        {/* =======================================================
            CONTENT SPACE CONTAINER
            ======================================================= */}
        <div className="dashboard-content">
          
          {/* Headline Title */}
          <div className="section-headline-area">
            <div>
              <h2 className="section-headline">
                {activeTab === 'members' && 'Manajemen Anggota Konstruksi'}
                {activeTab === 'blog' && 'Pusat Konten & Artikel Proyek'}
                {activeTab === 'redeem' && 'Persetujuan Poin & Redeem Hadiah'}
                {activeTab === 'settings' && 'Konfigurasi Sistem Utama'}
              </h2>
              <p className="section-subheadline">
                {activeTab === 'members' && 'Kelola hak akses mitra kontraktor, arsitek, dan supplier logistik.'}
                {activeTab === 'blog' && 'Terbitkan panduan teknik sipil, regulasi logistik, dan info material terbaru.'}
                {activeTab === 'redeem' && 'Verifikasi permohonan klaim saldo e-wallet dan peralatan keselamatan.'}
                {activeTab === 'settings' && 'Atur batasan kargo, notifikasi escrow, dan integrasi API pihak ketiga.'}
              </p>
            </div>

            {/* Action Header Button */}
            <div>
              {activeTab === 'members' && (
                <button className="btn-style-primary" onClick={() => setShowMemberModal(true)}>
                  <span>➕</span> Tambah Anggota Baru
                </button>
              )}
              {activeTab === 'blog' && (
                <button className="btn-style-primary" onClick={() => setShowBlogModal(true)}>
                  <span>✍️</span> Tulis Artikel Baru
                </button>
              )}
            </div>
          </div>

          {}
          {/* STATISTIC CARDS (GRID 3-4 COLUMNS) */}
          <section className="stats-grid-row">
            
            {/* Stat Card 1 */}
            <div className="stat-card-widget blue-accent">
              <div className="stat-info-left">
                <span className="stat-card-label">Anggota Aktif</span>
                <span className="stat-card-number">{totalActiveMembers}</span>
                <span className="stat-card-subtext">
                  <span style={{ color: 'var(--accent-green)', fontWeight: 'bold' }}>🟢 {members.length} Terdaftar</span>
                </span>
              </div>
              <div className="stat-card-icon-right">👥</div>
            </div>

            {/* Stat Card 2 */}
            <div className="stat-card-widget green-accent">
              <div className="stat-info-left">
                <span className="stat-card-label">Artikel Terbit</span>
                <span className="stat-card-number">{totalPublishedBlogs}</span>
                <span className="stat-card-subtext">
                  <span>📖 {blogs.length} Draft & Published</span>
                </span>
              </div>
              <div className="stat-card-icon-right">📝</div>
            </div>

            {/* Stat Card 3 */}
            <div className="stat-card-widget yellow-accent">
              <div className="stat-info-left">
                <span className="stat-card-label">Redeem Pending</span>
                <span className="stat-card-number">{totalPendingRedeems}</span>
                <span className="stat-card-subtext">
                  <span style={{ color: '#E65100', fontWeight: 'bold' }}>⚠️ Butuh Verifikasi Segera</span>
                </span>
              </div>
              <div className="stat-card-icon-right">🎁</div>
            </div>

            {/* Stat Card 4 */}
            <div className="stat-card-widget blue-accent">
              <div className="stat-info-left">
                <span className="stat-card-label">Poin Terklaim</span>
                <span className="stat-card-number">{totalPointsRedeemed} Pts</span>
                <span className="stat-card-subtext">
                  <span>💎 Dari transaksi selesai</span>
                </span>
              </div>
              <div className="stat-card-icon-right">📊</div>
            </div>

          </section>

          {/* =======================================================
              MAIN TAB CONTENT (MEMBERS / BLOGS / REDEEM / SETTINGS)
              ======================================================= */}
          <div className="main-content-layout-blocks">
            
            {/* COLUMN 1: INTERACTIVE WORK PANEL (2/3 width) */}
            <div className="panel-container-card">
              
              {/* TAB CONTENT: MEMBERS */}
              {activeTab === 'members' && (
                <>
                  <div className="panel-header-row">
                    <h3 className="panel-title-with-icon">
                      <span>👥</span> Daftar Seluruh Anggota Terdaftar
                    </h3>
                    
                    {/* Status filtering pills */}
                    <div className="filter-panel-row">
                      {['all', 'active', 'pending', 'suspended'].map(status => (
                        <button
                          key={status}
                          onClick={() => setFilterStatus(status)}
                          className={`pill-tab-filter ${filterStatus === status ? 'active' : ''}`}
                        >
                          {status}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Data Table */}
                  <div className="table-data-scrolled">
                    <table className="modern-data-table">
                      <thead>
                        <tr>
                          <th>ID Anggota</th>
                          <th>Nama Lengkap</th>
                          <th>E-Mail</th>
                          <th>Role Pengguna</th>
                          <th>Status Akun</th>
                          <th style={{ textAlign: 'right' }}>Aksi</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredMembers.length === 0 ? (
                          <tr>
                            <td colSpan="6" style={{ textAlign: 'center', padding: '30px', color: 'var(--text-muted)' }}>
                              Tidak ada data anggota yang cocok dengan filter pencarian.
                            </td>
                          </tr>
                        ) : (
                          filteredMembers.map(member => (
                            <tr key={member.id}>
                              <td style={{ fontWeight: 'bold' }}>{member.id}</td>
                              <td style={{ fontWeight: '500' }}>{member.name}</td>
                              <td>{member.email}</td>
                              <td style={{ color: 'var(--text-muted)' }}>{member.role}</td>
                              <td>
                                <span className={`badge-status-container ${member.status.toLowerCase()}`}>
                                  {member.status}
                                </span>
                              </td>
                              <td style={{ textAlign: 'right' }}>
                                <button 
                                  onClick={() => {
                                    setMembers(prev => prev.map(m => m.id === member.id ? { ...m, status: m.status === 'Active' ? 'Suspended' : 'Active' } : m));
                                    triggerToast(`Status akun ${member.name} berhasil diubah.`);
                                  }}
                                  className="btn-style-success-mini"
                                >
                                  Toggle Status
                                </button>
                                <button 
                                  onClick={() => handleDeleteMember(member.id)}
                                  className="btn-style-danger"
                                >
                                  Hapus
                                </button>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </>
              )}

              {/* TAB CONTENT: BLOG POSTS */}
              {activeTab === 'blog' && (
                <>
                  <div className="panel-header-row">
                    <h3 className="panel-title-with-icon">
                      <span>📝</span> Artikel Panduan & Promosi Konstruksi
                    </h3>
                  </div>

                  <div className="blogs-grid-container">
                    {filteredBlogs.length === 0 ? (
                      <p style={{ gridColumn: '1/-1', textAlign: 'center', color: 'var(--text-muted)', padding: '24px' }}>
                        Tidak ada tulisan artikel yang ditemukan.
                      </p>
                    ) : (
                      filteredBlogs.map(blog => (
                        <div key={blog.id} className="blog-item-card">
                          <div className="blog-card-body">
                            <div className="blog-meta-row">
                              <span className="blog-tag-badge">{blog.category}</span>
                              <span>{blog.date}</span>
                            </div>
                            <h4 className="blog-item-title" onClick={() => triggerToast(`Membuka artikel: ${blog.title}`)}>
                              {blog.title}
                            </h4>
                            <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '8px' }}>
                              Ditulis oleh: <b>{blog.author}</b>
                            </p>
                          </div>
                          <div className="blog-card-footer">
                            <span>👀 {blog.views} Kali dibaca</span>
                            <span style={{ 
                              color: blog.status === 'Published' ? 'var(--accent-green)' : '#F57F17',
                              fontWeight: 'bold'
                            }}>
                              ● {blog.status}
                            </span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </>
              )}

              {/* TAB CONTENT: REDEEM REQUESTS */}
              {activeTab === 'redeem' && (
                <>
                  <div className="panel-header-row">
                    <h3 className="panel-title-with-icon">
                      <span>🎁</span> Riwayat Pengajuan Klaim Reward Poin Mitra
                    </h3>
                  </div>

                  <div className="table-data-scrolled">
                    <table className="modern-data-table">
                      <thead>
                        <tr>
                          <th>ID Request</th>
                          <th>Nama Member</th>
                          <th>Barang Hadiah</th>
                          <th>Poin Dibutuhkan</th>
                          <th>Status Pengajuan</th>
                          <th>Tanggal</th>
                          <th style={{ textAlign: 'right' }}>Verifikasi Admin</th>
                        </tr>
                      </thead>
                      <tbody>
                        {redeems.map(red => (
                          <tr key={red.id}>
                            <td style={{ fontWeight: 'bold' }}>{red.id}</td>
                            <td>{red.member}</td>
                            <td style={{ fontWeight: '500' }}>{red.item}</td>
                            <td style={{ fontWeight: 'bold', color: 'var(--primary-blue)' }}>{red.points} Pts</td>
                            <td>
                              <span className={`badge-status-container ${red.status.toLowerCase()}`}>
                                {red.status}
                              </span>
                            </td>
                            <td>{red.date}</td>
                            <td style={{ textAlign: 'right' }}>
                              {red.status === 'Pending' ? (
                                <>
                                  <button 
                                    onClick={() => handleApproveRedeem(red.id)}
                                    className="btn-style-success-mini"
                                  >
                                    Setujui
                                  </button>
                                  <button 
                                    onClick={() => handleRejectRedeem(red.id)}
                                    className="btn-style-danger"
                                  >
                                    Tolak
                                  </button>
                                </>
                              ) : (
                                <span style={{ fontSize: '11px', color: 'var(--text-muted)', italic: 'true' }}>
                                  Selesai diproses
                                </span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </>
              )}

              {/* TAB CONTENT: SYSTEM SETTINGS */}
              {activeTab === 'settings' && (
                <>
                  <div className="panel-header-row">
                    <h3 className="panel-title-with-icon">
                      <span>⚙️</span> Pengaturan Sistem & Integrasi Server
                    </h3>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', fontSize: '13px' }}>
                    
                    {/* Setting Item 1 */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '16px', borderBottom: '1px solid var(--border-color)' }}>
                      <div>
                        <p style={{ fontWeight: 'bold' }}>Aktifkan Integrasi API Otomatis RajaOngkir</p>
                        <p style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Sinkronisasikan biaya jalan tol & cargo rute Jabar secara berkala.</p>
                      </div>
                      <input type="checkbox" defaultChecked style={{ width: '20px', height: '20px' }} />
                    </div>

                    {/* Setting Item 2 */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '16px', borderBottom: '1px solid var(--border-color)' }}>
                      <div>
                        <p style={{ fontWeight: 'bold' }}>Sistem Proteksi Overloading (Anti-ODOL)</p>
                        <p style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Kunci form order otomatis jika tonase melebihi batas armada terpilih.</p>
                      </div>
                      <input type="checkbox" defaultChecked style={{ width: '20px', height: '20px' }} />
                    </div>

                    {/* Setting Item 3 */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <p style={{ fontWeight: 'bold' }}>Pemberitahuan SMS & WhatsApp Gateway</p>
                        <p style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Kirim struk digital & nomor resi driver langsung ke konsumen.</p>
                      </div>
                      <button className="btn-style-secondary" onClick={() => triggerToast('Tes gateway sukses terkirim!')}>
                        Tes Koneksi Gateway
                      </button>
                    </div>

                  </div>
                </>
              )}

            </div>

            {/* COLUMN 2: ANALYTICAL & QUICK ACTIONS (1/3 width) */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              
              {/* Graphic mini chart panel */}
              <div className="panel-container-card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h4 style={{ fontFamily: 'Poppins', fontSize: '14px', fontWeight: '700' }}>📈 Trafik Registrasi Anggota</h4>
                  
                  {/* Period selectors */}
                  <select 
                    value={statsPeriod} 
                    onChange={(e) => {
                      setStatsPeriod(e.target.value);
                      triggerToast(`Rentang trafik diubah ke: ${e.target.value}`);
                    }}
                    style={{ border: '1px solid var(--border-color)', fontSize: '11px', padding: '4px', borderRadius: '4px' }}
                  >
                    <option value="daily">Harian</option>
                    <option value="weekly">Mingguan</option>
                    <option value="monthly">Bulanan</option>
                  </select>
                </div>

                {/* SVG Visual graph */}
                <div className="chart-visual-box">
                  <svg className="chart-svg-container" viewBox="0 0 100 50">
                    {/* Background Grid Lines */}
                    <line x1="0" y1="10" x2="100" y2="10" stroke="#E0E0E0" strokeWidth="0.5" strokeDasharray="2" />
                    <line x1="0" y1="25" x2="100" y2="25" stroke="#E0E0E0" strokeWidth="0.5" strokeDasharray="2" />
                    <line x1="0" y1="40" x2="100" y2="40" stroke="#E0E0E0" strokeWidth="0.5" strokeDasharray="2" />

                    {/* Line Path based on statsPeriod */}
                    {statsPeriod === 'daily' && (
                      <path d="M0,45 L20,38 L40,42 L60,18 L80,22 L100,5" fill="none" stroke="var(--primary-blue)" strokeWidth="2.5" />
                    )}
                    {statsPeriod === 'weekly' && (
                      <path d="M0,40 L20,15 L40,30 L60,10 L80,35 L100,12" fill="none" stroke="var(--accent-green)" strokeWidth="2.5" />
                    )}
                    {statsPeriod === 'monthly' && (
                      <path d="M0,35 L20,32 L40,12 L60,25 L80,8 L100,2" fill="none" stroke="var(--primary-blue)" strokeWidth="2.5" />
                    )}

                    {/* Nodes of chart */}
                    <circle cx="40" cy={statsPeriod === 'daily' ? 42 : statsPeriod === 'weekly' ? 30 : 12} r="3" fill="var(--primary-blue)" />
                    <circle cx="80" cy={statsPeriod === 'daily' ? 22 : statsPeriod === 'weekly' ? 35 : 8} r="3" fill="var(--accent-green)" />
                  </svg>
                  
                  {/* Tooltip dynamic simulation */}
                  <div className="chart-tooltip-bubble" style={{ left: '40%', bottom: '70%' }}>
                    <span>Konstruksi Utama: +140%</span>
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'var(--text-muted)' }}>
                  <span>Periode Awal</span>
                  <span style={{ fontWeight: 'bold', color: 'var(--dark-gray)' }}>Update Terbaru: Baru Saja</span>
                  <span>Akhir</span>
                </div>
              </div>

              {/* QUICK ACTIONS BUTTONS ROW */}
              <div className="quick-action-strip">
                <span className="quick-action-strip-title">⚡ Tindakan Cepat (Quick Actions)</span>
                
                <div className="quick-buttons-row">
                  <button className="btn-style-secondary" style={{ flex: '1 1 45%' }} onClick={() => setShowMemberModal(true)}>
                    ➕ Tambah Anggota
                  </button>
                  <button className="btn-style-secondary" style={{ flex: '1 1 45%' }} onClick={() => setShowBlogModal(true)}>
                    ✍️ Tulis Artikel
                  </button>
                  <button 
                    className="btn-style-secondary" 
                    style={{ flex: '1 1 100%' }}
                    onClick={() => {
                      const pending = redeems.filter(r => r.status === 'Pending');
                      if (pending.length === 0) {
                        triggerToast('Semua permohonan redeem poin sudah tervalidasi!', 'warning');
                      } else {
                        setRedeems(prev => prev.map(r => r.status === 'Pending' ? { ...r, status: 'Approved' } : r));
                        triggerToast(`Berhasil menyetujui massal ${pending.length} klaim poin!`);
                      }
                    }}
                  >
                    🚀 Setujui Semua Pending Redeem
                  </button>
                </div>
              </div>

            </div>

          </div>

          {/* =======================================================
              FOOTER BRAND CREDITS
              ======================================================= */}
          <footer className="footer-copyright-strip">
            <div>
              <p>© 2026 <b>BahanBangunGo Enterprise Dashboard Ltd.</b> Seluruh Hak Cipta Dilindungi.</p>
              <p style={{ fontSize: '10px', marginTop: '2px' }}>Didesain presisi berdasarkan instruksi manual figma high fidelity.</p>
            </div>
            <div>
              <ul className="footer-links-list">
                <li><a href="#privacy" onClick={(e) => { e.preventDefault(); triggerToast('Kebijakan Privasi Sistem'); }}>Privasi</a></li>
                <li><a href="#terms" onClick={(e) => { e.preventDefault(); triggerToast('Ketentuan Layanan Kargo'); }}>Syarat & Ketentuan</a></li>
                <li><a href="#help" onClick={(e) => { e.preventDefault(); triggerToast('Menghubungi Pusat Bantuan...'); }}>Bantuan</a></li>
              </ul>
            </div>
          </footer>

        </div>

      </main>

      {/* =======================================================
          MODAL: ADD NEW MEMBER
          ======================================================= */}
      {showMemberModal && (
        <div className="modal-overlay-bg">
          <div className="modal-body-container">
            <div className="modal-header-row">
              <h3 className="modal-title">➕ Registrasi Anggota Mitra Baru</h3>
              <button className="close-modal-btn" onClick={() => setShowMemberModal(false)}>✕</button>
            </div>

            <form onSubmit={handleAddMember}>
              <div className="form-group-field">
                <label className="form-label-style">Nama Lengkap Anggota</label>
                <input 
                  type="text" 
                  placeholder="Contoh: Joko Wicaksono"
                  value={memberForm.name}
                  onChange={(e) => setMemberForm({ ...memberForm, name: e.target.value })}
                  className="form-input-control"
                  required
                />
              </div>

              <div className="form-group-field">
                <label className="form-label-style">Alamat E-Mail Resmi</label>
                <input 
                  type="email" 
                  placeholder="joko.wicaksono@kontraktor.id"
                  value={memberForm.email}
                  onChange={(e) => setMemberForm({ ...memberForm, email: e.target.value })}
                  className="form-input-control"
                  required
                />
              </div>

              <div className="form-group-field">
                <label className="form-label-style">Kemitraan (Role)</label>
                <select 
                  value={memberForm.role}
                  onChange={(e) => setMemberForm({ ...memberForm, role: e.target.value })}
                  className="form-input-control"
                >
                  <option value="Premium Contractor">Premium Contractor</option>
                  <option value="Supplier Partner">Supplier Partner</option>
                  <option value="Architect Partner">Architect Partner</option>
                  <option value="VVIP Client">VVIP Client</option>
                </select>
              </div>

              <div style={{ display: 'flex', gap: '12px', marginTop: '20px', justifyContent: 'flex-end' }}>
                <button type="button" className="btn-style-secondary" onClick={() => setShowMemberModal(false)}>
                  Batalkan
                </button>
                <button type="submit" className="btn-style-primary">
                  Simpan Anggota
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =======================================================
          MODAL: WRITE NEW BLOG
          ======================================================= */}
      {showBlogModal && (
        <div className="modal-overlay-bg">
          <div className="modal-body-container">
            <div className="modal-header-row">
              <h3 className="modal-title">✍️ Tulis & Terbitkan Artikel Proyek</h3>
              <button className="close-modal-btn" onClick={() => setShowBlogModal(false)}>✕</button>
            </div>

            <form onSubmit={handleAddBlog}>
              <div className="form-group-field">
                <label className="form-label-style">Judul Artikel Kreatif</label>
                <input 
                  type="text" 
                  placeholder="Contoh: Metode Cepat Memasang Besi Beton SNI"
                  value={blogForm.title}
                  onChange={(e) => setBlogForm({ ...blogForm, title: e.target.value })}
                  className="form-input-control"
                  required
                />
              </div>

              <div className="form-group-field">
                <label className="form-label-style">Kategori Topik</label>
                <select 
                  value={blogForm.category}
                  onChange={(e) => setBlogForm({ ...blogForm, category: e.target.value })}
                  className="form-input-control"
                >
                  <option value="Inovasi">Inovasi</option>
                  <option value="Logistik">Logistik</option>
                  <option value="Keuangan">Keuangan</option>
                  <option value="Material">Material</option>
                </select>
              </div>

              <div className="form-group-field">
                <label className="form-label-style">Isi Draf Artikel</label>
                <textarea 
                  rows="4"
                  placeholder="Ketik rincian panduan material sipil di sini..."
                  value={blogForm.content}
                  onChange={(e) => setBlogForm({ ...blogForm, content: e.target.value })}
                  className="form-input-control"
                  style={{ resize: 'none' }}
                />
              </div>

              <div style={{ display: 'flex', gap: '12px', marginTop: '20px', justifyContent: 'flex-end' }}>
                <button type="button" className="btn-style-secondary" onClick={() => setShowBlogModal(false)}>
                  Kembali
                </button>
                <button type="submit" className="btn-style-primary">
                  Terbitkan Live
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}