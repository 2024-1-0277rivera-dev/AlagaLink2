
'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useAppContext } from '../context/AppContext';
import NotificationPopover from './notifications/NotificationPopover';
import { MOCK_UPDATES, MOCK_DEVICES, MOCK_MEDICAL, MOCK_LIVELIHOODS } from '../mockData/index';

interface SearchResult {
  id: string;
  title: string;
  category: string;
  icon: string;
  page: string;
  section?: string;
  itemId?: string;
}

const Navbar: React.FC<{ onNavigate: (page: string) => void, currentPage: string }> = ({ onNavigate, currentPage }) => {
  const { 
    currentUser, 
    isDarkMode, 
    toggleTheme, 
    logout, 
    globalSearchQuery, 
    setGlobalSearchQuery, 
    setSearchSignal,
    switchDevMode,
    notifications,
    reports,
    users
  } = useAppContext();
  
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowResults(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const isAdmin = currentUser?.role === 'Admin' || currentUser?.role === 'SuperAdmin';

  const navItems = useMemo(() => [
    { id: 'home', label: 'Home', icon: 'fa-house' },
    { id: 'programs', label: 'Programs', icon: 'fa-briefcase' },
    { id: 'lost-found', label: 'Lost & Found', icon: 'fa-magnifying-glass-location' },
    ...(isAdmin ? [{ id: 'members', label: 'Members', icon: 'fa-users' }] : [])
  ], [isAdmin]);

  const universalResults = useMemo(() => {
    if (!globalSearchQuery || globalSearchQuery.length < 2) return [];

    const query = globalSearchQuery.toLowerCase();
    const results: SearchResult[] = [];

    navItems.forEach(item => {
      if (item.label.toLowerCase().includes(query)) {
        results.push({ id: item.id, title: item.label, category: 'App Page', icon: item.icon, page: item.id });
      }
    });

    const programCategories = [
      { id: 'ID', title: 'PWD ID Issuance', section: 'ID' },
      { id: 'Device', title: 'Assistive Devices', section: 'Device' },
      { id: 'Medical', title: 'Medical Assistance', section: 'Medical' },
      { id: 'PhilHealth', title: 'PhilHealth Enrollment', section: 'PhilHealth' },
      { id: 'Livelihood', title: 'Livelihood Programs', section: 'Livelihood' }
    ];
    programCategories.forEach(cat => {
      if (cat.title.toLowerCase().includes(query)) {
        results.push({ id: cat.id, title: cat.title, category: 'Service Portal', icon: 'fa-door-open', page: 'programs', section: cat.section });
      }
    });

    MOCK_DEVICES.forEach(d => {
      if (d.name.toLowerCase().includes(query)) {
        results.push({ id: d.id, title: d.name, category: 'Assistive Device', icon: 'fa-wheelchair', page: 'programs', section: 'Device', itemId: d.id });
      }
    });
    MOCK_MEDICAL.forEach(m => {
      if (m.name.toLowerCase().includes(query)) {
        results.push({ id: m.id, title: m.name, category: 'Medical Aid', icon: 'fa-kit-medical', page: 'programs', section: 'Medical', itemId: m.id });
      }
    });
    MOCK_LIVELIHOODS.forEach(l => {
      if (l.title.toLowerCase().includes(query)) {
        results.push({ id: l.id, title: l.title, category: 'Livelihood Training', icon: 'fa-briefcase', page: 'programs', section: 'Livelihood', itemId: l.id });
      }
    });

    reports.forEach(r => {
      if (r.name.toLowerCase().includes(query) || r.lastSeen.toLowerCase().includes(query)) {
        results.push({ id: r.id, title: `${r.status}: ${r.name}`, category: 'Lost & Found', icon: 'fa-person-circle-question', page: 'lost-found', itemId: r.id });
      }
    });

    if (isAdmin) {
      users.forEach(u => {
        if (`${u.firstName} ${u.lastName}`.toLowerCase().includes(query) || u.id.toLowerCase().includes(query)) {
          results.push({ id: u.id, title: `${u.firstName} ${u.lastName}`, category: 'Member Registry', icon: 'fa-user-tag', page: 'members', itemId: u.id });
        }
      });
    }

    MOCK_UPDATES.forEach(upd => {
      if (upd.title.toLowerCase().includes(query)) {
        results.push({ id: `news-${upd.id}`, title: upd.title, category: 'News & Updates', icon: 'fa-bullhorn', page: 'home', itemId: upd.id.toString() });
      }
    });

    return results.slice(0, 8);
  }, [globalSearchQuery, reports, users, navItems, isAdmin]);

  const handleResultClick = (res: SearchResult) => {
    setSearchSignal({ page: res.page, section: res.section, itemId: res.itemId });
    onNavigate(res.page);
    setGlobalSearchQuery('');
    setShowResults(false);
  };

  const handleNavigate = (id: string) => {
    // If the target is an in-page anchor, scroll smoothly instead of navigating away
    const anchorMap: Record<string, string> = {
      home: 'home',
      programs: 'programs',
      'lost-found': 'community-vigil'
    };
    const anchorId = anchorMap[id];
    if (anchorId) {
      const el = document.getElementById(anchorId);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
        setIsMobileMenuOpen(false);
        return;
      }
    }

    onNavigate(id);
    setIsMobileMenuOpen(false);
  };

  const unreadNotifs = notifications.filter(n => !n.isRead).length;

  return (
    <nav className="sticky top-0 z-[100] bg-alaga-blue dark:bg-alaga-navy text-white shadow-[0_10px_30px_rgba(0,0,0,0.1)] px-4 py-4 flex items-center justify-between transition-all duration-500">
      <div className="flex items-center space-x-4 cursor-pointer shrink-0" onClick={() => handleNavigate('home')}>
        <div className="w-10 h-10 md:w-12 md:h-12 bg-white rounded-2xl flex items-center justify-center shadow-2xl transform active:scale-90 transition-transform inner-glow">
          <i className="fa-solid fa-hands-holding-child text-alaga-blue text-xl md:text-2xl drop-shadow-md"></i>
        </div>
        <div className="hidden sm:block">
          <h1 className="font-black text-lg md:text-xl leading-none text-white text-3d tracking-tight">AlagaLink</h1>
          <p className="text-[7px] md:text-[9px] text-alaga-gold font-black uppercase tracking-widest mt-1">Registry Backbone</p>
        </div>
      </div>

      {/* Middle: Universal Search Bar - Inflated Style (Hidden on Mobile) */}
      <div className="hidden md:flex flex-1 max-w-lg lg:max-w-xl mx-4 lg:mx-12 relative" ref={searchRef}>
        <div className="relative flex items-center w-full bg-white/10 border border-white/20 rounded-[20px] overflow-hidden transition-all focus-within:bg-white focus-within:text-gray-900 focus-within:ring-8 focus-within:ring-alaga-gold/20 shadow-inner">
          <div className="relative flex-1 group">
            <i className="fa-solid fa-magnifying-glass absolute left-5 top-1/2 -translate-y-1/2 opacity-50 group-focus-within:text-alaga-blue transition-colors"></i>
            <input 
              type="text" 
              value={globalSearchQuery}
              onChange={(e) => { setGlobalSearchQuery(e.target.value); setShowResults(true); }}
              onFocus={() => setShowResults(true)}
              autoComplete="off"
              placeholder="Jump to items..." 
              className="w-full pl-14 pr-10 py-3 md:py-4 bg-transparent border-none outline-none text-sm placeholder:text-white/40 focus-within:placeholder:text-gray-400 font-bold"
            />
          </div>
        </div>

        {showResults && globalSearchQuery.length >= 2 && (
          <div className="absolute top-full left-0 mt-4 w-full bg-white dark:bg-alaga-charcoal text-gray-900 dark:text-white rounded-[32px] shadow-[0_40px_100px_rgba(0,0,0,0.4)] overflow-hidden border border-gray-100 dark:border-white/10 animate-in fade-in zoom-in-95 duration-300">
            <div className="p-4 border-b border-gray-100 dark:border-white/5 bg-gray-50/50 dark:bg-black/20">
              <p className="text-[9px] font-black uppercase opacity-40 tracking-[0.3em] px-4">Global Discovery Engine</p>
            </div>
            <div className="max-h-[400px] overflow-y-auto no-scrollbar py-2">
              {universalResults.length > 0 ? (
                universalResults.map(res => (
                  <button
                    key={res.id}
                    onClick={() => handleResultClick(res)}
                    className="w-full flex items-center gap-4 px-6 py-4 hover:bg-alaga-blue/5 dark:hover:bg-alaga-blue/10 transition-all text-left group"
                  >
                    <div className="w-10 h-10 rounded-[14px] bg-alaga-gray dark:bg-white/5 flex items-center justify-center text-alaga-blue group-hover:bg-alaga-blue group-hover:text-white transition-all shadow-sm">
                      <i className={`fa-solid ${res.icon} text-sm glow-icon`}></i>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-black text-sm text-3d truncate">{res.title}</p>
                      <p className="text-[9px] opacity-40 uppercase font-black tracking-widest">{res.category}</p>
                    </div>
                  </button>
                ))
              ) : (
                <div className="p-12 text-center opacity-30">
                  <p className="font-black uppercase tracking-widest text-xs">No entries match</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      <div className="flex items-center space-x-2 md:space-x-3">
        {/* Navigation List - Appearing on Tablet and Desktop */}
      <ul className="hidden md:flex items-center space-x-1 lg:space-x-2">
          {navItems.map(item => {
            const navUnread = notifications.filter(n => n.link && n.link.startsWith(item.id)).length;
            return (
              <li 
                key={item.id}
                onClick={() => handleNavigate(item.id)}
                className={`cursor-pointer p-3 lg:px-5 lg:py-3 rounded-2xl transition-all flex items-center group active:scale-90 ${
                  currentPage === item.id 
                    ? 'bg-alaga-gold text-alaga-navy font-black shadow-xl inner-glow shadow-alaga-gold/30' 
                    : 'hover:bg-white/10'
                }`}
                title={item.label}
              >
                <i className={`fa-solid ${item.icon} text-lg ${currentPage === item.id ? 'glow-icon-gold' : 'opacity-80'}`}></i>
                <span className="hidden lg:inline ml-3 text-[10px] font-black uppercase tracking-widest">{item.label}</span>
                {navUnread > 0 && !['programs','lost-found','members'].includes(item.id) && (
                  navUnread > 1 ? (
                    <span className="ml-3 inline-flex items-center justify-center bg-red-500 text-white text-[10px] font-black rounded-full w-6 h-6">{navUnread}</span>
                  ) : (
                    <span className="ml-3 w-3 h-3 bg-red-500 rounded-full inline-block" />
                  )
                )}
              </li>
            );
          })}
        </ul>

        <div className="h-8 w-[1px] bg-white/20 mx-1 hidden lg:block"></div>

        <div className="flex items-center gap-2 md:gap-3">
          {/* Notifications - visible when logged in (including Home for authenticated users) */}
          {currentUser && (
            <div className="relative">
              <div 
                className="relative cursor-pointer w-10 h-10 md:w-12 md:h-12 flex items-center justify-center rounded-[16px] md:rounded-[18px] bg-white/10 hover:bg-white/20 transition-all shadow-lg active:scale-90 inner-glow"
                onClick={() => setIsNotifOpen(!isNotifOpen)}
              >
                <i className={`fa-solid fa-bell text-lg md:text-xl ${unreadNotifs > 0 ? 'animate-bounce glow-icon' : ''}`}></i>
                {unreadNotifs > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-[9px] w-5 h-5 md:w-6 md:h-6 rounded-full flex items-center justify-center font-black border-2 md:border-4 border-alaga-blue dark:border-alaga-navy shadow-2xl scale-110">
                    {unreadNotifs}
                  </span>
                )}
              </div>
              <NotificationPopover isOpen={isNotifOpen} onClose={() => setIsNotifOpen(false)} onNavigate={handleNavigate} />
            </div>
          )}

          {/* Profile / Auth Buttons */}
          <div className="relative hidden sm:block">
            <div 
              className="flex items-center gap-3 cursor-pointer hover:bg-white/20 transition-all bg-white/10 p-1 rounded-[16px] md:rounded-[20px] border border-white/20 shadow-lg active:scale-95 inner-glow pr-2 md:pr-4"
              onClick={() => setShowProfileMenu(!showProfileMenu)}
            >
              {currentUser ? (
                <img src={currentUser?.photoUrl} alt="Profile" className="w-8 h-8 md:w-9 md:h-9 rounded-[12px] md:rounded-[14px] border-2 border-white/30 object-cover shadow-md" />
              ) : (
                <div className="w-8 h-8 md:w-9 md:h-9 rounded-[12px] md:rounded-[14px] border-2 border-white/30 shadow-md bg-white/10 flex items-center justify-center">
                  <i className="fa-solid fa-circle-user text-lg md:text-xl opacity-80"></i>
                </div>
              )}
              <i className={`fa-solid fa-chevron-down text-[8px] opacity-60 transition-transform ${showProfileMenu ? 'rotate-180' : ''}`}></i>
            </div>
            {showProfileMenu && (
              <div className="absolute right-0 mt-5 w-64 bg-white dark:bg-alaga-charcoal text-gray-800 dark:text-white rounded-[32px] shadow-[0_30px_80px_rgba(0,0,0,0.5)] py-4 overflow-hidden border border-gray-100 dark:border-white/10 animate-in fade-in slide-in-from-top-4 origin-top-right inflated-card">
                {currentUser ? (
                  <>
                    <div className="px-6 py-6 border-b border-gray-100 dark:border-white/10 text-center space-y-2">
                      <p className="font-black text-lg truncate text-3d">{currentUser?.firstName}</p>
                      <div className={`mt-3 px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-[0.2em] shadow-lg inner-glow inline-block ${
                        currentUser?.role === 'SuperAdmin' ? 'bg-purple-600 text-white' :
                        currentUser?.role === 'Admin' ? 'bg-red-500 text-white' : 'bg-alaga-teal text-white'
                      }`}>
                        {currentUser?.role}
                      </div>
                    </div>
                    <div className="py-2 px-2 space-y-1">
                       {[
                        { id: 'profile', label: 'Identity Profile', icon: 'fa-id-badge', color: 'text-alaga-blue' },
                        { id: 'theme', label: isDarkMode ? 'Daylight Vision' : 'Night Owl Vision', icon: isDarkMode ? 'fa-sun' : 'fa-moon', color: 'text-alaga-gold' },
                        { id: 'about', label: 'About Systems', icon: 'fa-circle-info', color: 'text-alaga-blue' }
                       ].map(link => (
                        <button key={link.id} onClick={() => { if(link.id==='theme') toggleTheme(); else handleNavigate(link.id); setShowProfileMenu(false); }} className="w-full text-left px-5 py-3.5 text-xs font-black uppercase tracking-widest hover:bg-alaga-blue/5 rounded-2xl flex items-center transition-all group">
                          <i className={`fa-solid ${link.icon} mr-4 w-5 text-center ${link.color}`}></i> 
                          <span className="opacity-70 group-hover:opacity-100">{link.label}</span>
                        </button>
                       ))}
                       
                       {/* Restored Role Switcher for Admin/Devs */}
                       <button onClick={() => {switchDevMode(); setShowProfileMenu(false);}} className="w-full text-left px-5 py-3.5 text-xs font-black uppercase tracking-widest hover:bg-alaga-gold/10 rounded-2xl flex items-center transition-all group">
                        <i className="fa-solid fa-arrows-spin mr-4 w-5 text-center text-alaga-gold glow-icon-gold"></i> 
                        <span className="text-alaga-gold">Role Switcher</span>
                       </button>

                       <button onClick={() => {logout(); setShowProfileMenu(false);}} className="w-full text-left px-5 py-3.5 rounded-2xl text-[10px] font-black uppercase tracking-widest text-red-500 hover:bg-red-500 hover:text-white flex items-center transition-all">
                        <i className="fa-solid fa-power-off mr-4 w-5 text-center"></i> System Logout
                       </button>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="px-6 py-6 border-b border-gray-100 dark:border-white/10 text-center space-y-2">
                      <p className="font-black text-lg text-3d">Welcome</p>
                      <p className="text-xs opacity-60 font-medium">Sign in to your account or register</p>
                    </div>
                    <div className="py-2 px-2 space-y-2">
                       <button onClick={() => {setShowProfileMenu(false); setSearchSignal({ page: 'home', section: 'login' }); handleNavigate('home');}} className="w-full text-left px-5 py-3.5 text-xs font-black uppercase tracking-widest hover:bg-alaga-blue/5 rounded-2xl flex items-center transition-all group">
                         <i className="fa-solid fa-arrow-right-to-bracket mr-4 w-5 text-center text-alaga-blue"></i> 
                         <span className="opacity-70 group-hover:opacity-100">Log In</span>
                       </button>
                       
                       <button onClick={() => {setShowProfileMenu(false); setSearchSignal({ page: 'home', section: 'signup' }); handleNavigate('home');}} className="w-full text-left px-5 py-3.5 text-xs font-black uppercase tracking-widest hover:bg-alaga-teal/5 rounded-2xl flex items-center transition-all group">
                         <i className="fa-solid fa-user-plus mr-4 w-5 text-center text-alaga-teal"></i> 
                         <span className="opacity-70 group-hover:opacity-100">Sign Up</span>
                       </button>

                       <button onClick={() => {toggleTheme(); setShowProfileMenu(false);}} className="w-full text-left px-5 py-3.5 text-xs font-black uppercase tracking-widest hover:bg-alaga-gold/5 rounded-2xl flex items-center transition-all group mt-4 pt-4 border-t border-gray-100 dark:border-white/10">
                         <i className={`fa-solid ${isDarkMode ? 'fa-sun' : 'fa-moon'} mr-4 w-5 text-center text-alaga-gold`}></i> 
                         <span className="opacity-70 group-hover:opacity-100">{isDarkMode ? 'Daylight Vision' : 'Night Owl Vision'}</span>
                       </button>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>

          {/* Hamburger Mobile Toggle */}
          <button 
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden w-10 h-10 flex items-center justify-center rounded-[16px] bg-white text-alaga-blue shadow-xl inflated-card active:scale-90"
          >
            <i className={`fa-solid ${isMobileMenuOpen ? 'fa-xmark' : 'fa-bars-staggered'} text-lg`}></i>
          </button>
        </div>
      </div>

      {/* Tactile Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-[200] bg-black/60 backdrop-blur-xl animate-in fade-in duration-300 md:hidden overflow-hidden">
          <div className="absolute right-0 top-0 h-full w-full max-w-[320px] bg-white dark:bg-alaga-charcoal shadow-2xl flex flex-col p-8 animate-in slide-in-from-right duration-500">
             <div className="flex items-center justify-between mb-12">
               <div className="flex items-center gap-3">
                 <div className="w-10 h-10 bg-alaga-blue rounded-xl flex items-center justify-center text-white shadow-lg inner-glow">
                   <i className="fa-solid fa-hands-holding-child"></i>
                 </div>
                 <h2 className="font-black text-lg text-alaga-blue uppercase tracking-widest">AlagaLink</h2>
               </div>
               <button onClick={() => setIsMobileMenuOpen(false)} className="w-10 h-10 rounded-full bg-gray-100 dark:bg-white/5 flex items-center justify-center">
                 <i className="fa-solid fa-xmark"></i>
               </button>
             </div>

             <nav className="flex-1 space-y-4 overflow-y-auto no-scrollbar pb-6">
                {navItems.map(item => (
                  <button 
                    key={item.id}
                    onClick={() => handleNavigate(item.id)}
                    className={`w-full flex items-center gap-6 p-6 rounded-[24px] transition-all inflated-card border border-transparent ${
                      currentPage === item.id 
                        ? 'bg-alaga-blue text-white shadow-alaga-blue/30 translate-x-2' 
                        : 'bg-gray-50 dark:bg-alaga-navy/40 hover:bg-alaga-blue/5'
                    }`}
                  >
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center shadow-md ${currentPage === item.id ? 'bg-white/20' : 'bg-white dark:bg-alaga-charcoal text-alaga-blue'}`}>
                      <i className={`fa-solid ${item.icon}`}></i>
                    </div>
                    <span className="font-black uppercase tracking-[0.2em] text-xs">{item.label}</span>
                  </button>
                ))}

                {/* Restored Mobile Simulator Mode Trigger */}
                <button 
                    onClick={() => { switchDevMode(); setIsMobileMenuOpen(false); }}
                    className="w-full flex items-center gap-6 p-6 rounded-[24px] transition-all inflated-card border border-alaga-gold/20 bg-alaga-gold/5 text-alaga-navy dark:text-alaga-gold"
                >
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center shadow-md bg-white dark:bg-alaga-charcoal text-alaga-gold">
                      <i className="fa-solid fa-arrows-spin"></i>
                    </div>
                    <span className="font-black uppercase tracking-[0.2em] text-xs">Simulator Mode</span>
                </button>
             </nav>

             <div className="mt-auto space-y-4 pt-8 border-t border-gray-100 dark:border-white/5">
                {currentUser ? (
                  <>
                    <div className="flex items-center gap-4 p-4 bg-alaga-gray dark:bg-white/5 rounded-[24px]">
                      <img src={currentUser?.photoUrl} className="w-12 h-12 rounded-xl object-cover" />
                      <div className="flex-1 min-w-0">
                        <p className="font-black text-sm truncate">{currentUser?.firstName}</p>
                        <p className="text-[8px] opacity-40 uppercase font-black tracking-widest">{currentUser?.role}</p>
                      </div>
                      <button onClick={() => {logout(); setIsMobileMenuOpen(false);}} className="w-10 h-10 rounded-xl bg-red-500/10 text-red-500 flex items-center justify-center">
                        <i className="fa-solid fa-power-off"></i>
                      </button>
                    </div>
                    
                    <button 
                      onClick={() => { toggleTheme(); setIsMobileMenuOpen(false); }}
                      className="w-full py-4 rounded-[20px] bg-alaga-gold/10 text-alaga-navy dark:text-alaga-gold font-black uppercase tracking-widest text-[10px] flex items-center justify-center gap-3"
                    >
                      <i className={`fa-solid ${isDarkMode ? 'fa-sun' : 'fa-moon'}`}></i>
                      {isDarkMode ? 'Switch to Daylight' : 'Switch to Night Vision'}
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => { setIsMobileMenuOpen(false); setSearchSignal({ page: 'home', section: 'login' }); handleNavigate('home'); }}
                      className="w-full py-4 rounded-[20px] bg-alaga-blue/10 text-alaga-blue dark:text-white font-black uppercase tracking-widest text-[10px] flex items-center justify-center gap-3"
                    >
                      <i className="fa-solid fa-arrow-right-to-bracket"></i>
                      Log In
                    </button>
                    
                    <button
                      onClick={() => { setIsMobileMenuOpen(false); setSearchSignal({ page: 'home', section: 'signup' }); handleNavigate('home'); }}
                      className="w-full py-4 rounded-[20px] bg-alaga-teal/10 text-alaga-teal dark:text-white font-black uppercase tracking-widest text-[10px] flex items-center justify-center gap-3"
                    >
                      <i className="fa-solid fa-user-plus"></i>
                      Sign Up
                    </button>

                    <button 
                      onClick={() => { toggleTheme(); setIsMobileMenuOpen(false); }}
                      className="w-full py-4 rounded-[20px] bg-alaga-gold/10 text-alaga-navy dark:text-alaga-gold font-black uppercase tracking-widest text-[10px] flex items-center justify-center gap-3"
                    >
                      <i className={`fa-solid ${isDarkMode ? 'fa-sun' : 'fa-moon'}`}></i>
                      {isDarkMode ? 'Switch to Daylight' : 'Switch to Night Vision'}
                    </button>
                  </>
                )}
             </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
