
import React, { useMemo } from 'react';
import Image from 'next/image';
import { useAppContext } from '../context/AppContext';

const RoleSwitcherModal: React.FC = () => {
  const { isRoleSwitcherOpen, setIsRoleSwitcherOpen, users, loginById } = useAppContext();

  const superAdmins = useMemo(() => users.filter(u => u.role === 'SuperAdmin'), [users]);
  const admins = useMemo(() => users.filter(u => u.role === 'Admin'), [users]);
  const regularUsers = useMemo(() => users.filter(u => u.role === 'User').slice(0, 10), [users]);

  if (!isRoleSwitcherOpen) return null;

  return (
    <div className="fixed inset-0 z-[400] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-300">
      <div className="bg-white dark:bg-alaga-charcoal w-full max-w-3xl h-[80vh] rounded-[32px] shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95">
        <header className="p-6 border-b border-gray-100 dark:border-white/5 flex items-center justify-between bg-alaga-gold text-alaga-navy shrink-0">
          <div className="flex items-center gap-4">
             <div className="w-10 h-10 bg-alaga-navy/10 rounded-2xl flex items-center justify-center">
                <i className="fa-solid fa-users-viewfinder text-lg"></i>
             </div>
             <div>
                <h3 className="text-xl font-black">Role Switcher</h3>
                <p className="text-[9px] font-black uppercase tracking-widest opacity-60">Session Simulation</p>
             </div>
          </div>
          <button 
            onClick={() => setIsRoleSwitcherOpen(false)}
            className="w-10 h-10 flex items-center justify-center rounded-full bg-alaga-navy/10 hover:bg-alaga-navy hover:text-white transition-all"
          >
            <i className="fa-solid fa-xmark text-lg"></i>
          </button>
        </header>

        <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-10 no-scrollbar">
           {/* Section 1: Super Admins */}
           <section>
              <h4 className="text-[10px] font-black uppercase tracking-widest opacity-40 mb-4 flex items-center gap-2">
                 <i className="fa-solid fa-crown text-alaga-gold"></i>
                 Super Administrative
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 {superAdmins.map(admin => (
                   <button 
                     key={admin.id} 
                     onClick={() => loginById(admin.id)}
                     className="flex items-center gap-4 p-4 bg-alaga-navy text-white rounded-2xl hover:scale-[1.02] active:scale-95 transition-all group"
                   >
                     {admin.photoUrl ? (
                       <Image src={admin.photoUrl} width={48} height={48} className="w-12 h-12 rounded-xl object-cover border-2 border-alaga-gold/50" alt={`${admin.firstName} ${admin.lastName}`} />
                     ) : (
                       <div className="w-12 h-12 rounded-xl bg-gray-100 border-2 border-alaga-gold/50" />
                     )}
                     <div className="text-left">
                        <p className="font-black text-base leading-tight">{admin.firstName} {admin.lastName}</p>
                        <p className="text-[9px] text-alaga-gold uppercase font-black tracking-tighter">Executive</p>
                     </div>
                     <i className="fa-solid fa-chevron-right ml-auto opacity-40 group-hover:opacity-100 transition-all"></i>
                   </button>
                 ))}
              </div>
           </section>

           {/* Section 2: Admins */}
           <section>
              <h4 className="text-[10px] font-black uppercase tracking-widest opacity-40 mb-4 flex items-center gap-2">
                 <i className="fa-solid fa-shield-halved text-red-500"></i>
                 Standard Staff
              </h4>
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
                 {admins.map(admin => (
                   <button 
                     key={admin.id} 
                     onClick={() => loginById(admin.id)}
                     className="flex items-center gap-3 p-3 bg-alaga-gray dark:bg-alaga-navy/40 rounded-2xl border border-gray-100 dark:border-white/5 hover:border-red-500 transition-all group"
                   >
                     {admin.photoUrl ? (
                       <Image src={admin.photoUrl} width={40} height={40} className="w-10 h-10 rounded-xl object-cover grayscale group-hover:grayscale-0 transition-all" alt={`${admin.firstName} ${admin.lastName}`} />
                     ) : (
                       <div className="w-10 h-10 rounded-xl bg-gray-100" />
                     )}
                     <div className="text-left">
                        <p className="font-bold text-xs leading-tight truncate max-w-[100px]">{admin.firstName} {admin.lastName}</p>
                        <p className="text-[8px] opacity-40 uppercase font-black">Staff</p>
                     </div>
                   </button>
                 ))}
              </div>
           </section>

           {/* Section 3: Regular Users */}
           <section>
              <h4 className="text-[10px] font-black uppercase tracking-widest opacity-40 mb-4 flex items-center gap-2">
                 <i className="fa-solid fa-person-rays text-alaga-teal"></i>
                 Registry Samples
              </h4>
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3">
                 {regularUsers.map(user => (
                   <button 
                     key={user.id} 
                     onClick={() => loginById(user.id)}
                     className="flex flex-col items-center p-3 bg-white dark:bg-alaga-navy/20 rounded-2xl border border-gray-100 dark:border-white/5 hover:border-alaga-blue hover:shadow-lg transition-all group text-center"
                   >
                     {user.photoUrl ? (
                       <Image src={user.photoUrl} width={48} height={48} className="w-12 h-12 rounded-full object-cover mb-2 group-hover:scale-110 transition-transform" alt={`${user.firstName} ${user.lastName}`} />
                     ) : (
                       <div className="w-12 h-12 rounded-full bg-gray-100 mb-2" />
                     )}
                     <p className="font-black text-[9px] leading-tight mb-1 truncate w-full">{user.firstName} {user.lastName}</p>
                     <p className="text-[7px] opacity-40 uppercase font-bold">{user.disabilityCategory.split(' ')[0]}</p>
                   </button>
                 ))}
              </div>
           </section>
        </div>

        <footer className="p-4 bg-alaga-gray dark:bg-black/20 border-t border-gray-100 dark:border-white/5 text-center">
           <p className="text-[9px] font-bold opacity-30 uppercase tracking-[0.2em]">Select Profile to Switch Session</p>
        </footer>
      </div>
    </div>
  );
};

export default RoleSwitcherModal;
