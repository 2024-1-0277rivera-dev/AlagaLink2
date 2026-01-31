'use client';

import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { UserProfile, LostReport, FormSection, ProgramAvailment, DirectMessage } from '@/lib/types';
import { MOCK_USERS, MOCK_REPORTS, MOCK_PROGRAM_RECORDS, MOCK_NOTIFICATION_HISTORY } from '@/mockData/index';

export interface Notification {
  id: string;
  userId?: string; // If present, targeted to specific user
  targetRole?: 'User' | 'Admin' | 'SuperAdmin'; // If present, targeted to all users of this role
  title: string;
  message: string;
  type: 'Info' | 'Success' | 'Warning' | 'Urgent';
  date: string;
  isRead: boolean;
  link?: string;
  programType?: string;
}

export interface SearchSignal {
  page: string;
  section?: string;
  itemId?: string;
}

interface AppContextType {
  currentUser: UserProfile | null;
  users: UserProfile[];
  reports: LostReport[];
  programRequests: ProgramAvailment[];
  notifications: Notification[];
  customSections: FormSection[];
  directMessages: Record<string, DirectMessage[]>;
  isDarkMode: boolean;
  globalSearchQuery: string;
  globalSearchFilter: string;
  searchSignal: SearchSignal | null;
  isRoleSwitcherOpen: boolean;
  setGlobalSearchQuery: (query: string) => void;
  setGlobalSearchFilter: (filter: string) => void;
  setSearchSignal: (signal: SearchSignal | null) => void;
  setIsRoleSwitcherOpen: (isOpen: boolean) => void;
  toggleTheme: () => void;
  login: (email: string) => void;
  loginWithPassword: (emailOrUsername: string, password: string) => boolean;
  loginById: (id: string) => void;
  logout: () => void;
  addReport: (report: LostReport) => void;
  addUser: (user: UserProfile) => void;
  updateUser: (user: UserProfile) => void;
  updateProgramRequest: (updatedReq: ProgramAvailment) => void;
  addProgramRequest: (newReq: ProgramAvailment) => void;
  addCustomSection: (label: string) => void;
  removeCustomSection: (id: string) => void;
  switchDevMode: () => void;
  markNotificationRead: (id: string) => void;
  clearAllNotifications: () => void;
  sendDirectMessage: (toUserId: string, text: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [users, setUsers] = useState<UserProfile[]>(MOCK_USERS);
  const [reports, setReports] = useState<LostReport[]>(MOCK_REPORTS);
  const [programRequests, setProgramRequests] = useState<ProgramAvailment[]>(MOCK_PROGRAM_RECORDS);
  const [notifications, setNotifications] = useState<Notification[]>(MOCK_NOTIFICATION_HISTORY);
  const [customSections, setCustomSections] = useState<FormSection[]>([]);
  const [directMessages, setDirectMessages] = useState<Record<string, DirectMessage[]>>({});
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [globalSearchQuery, setGlobalSearchQuery] = useState('');
  const [globalSearchFilter, setGlobalSearchFilter] = useState('All');
  const [searchSignal, setSearchSignal] = useState<SearchSignal | null>(null);
  const [isRoleSwitcherOpen, setIsRoleSwitcherOpen] = useState(false);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  const toggleTheme = () => setIsDarkMode(!isDarkMode);

  const login = (email: string) => {
    const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (user) setCurrentUser(user);
  };

  const loginWithPassword = (emailOrUsername: string, password: string): boolean => {
    const user = users.find(u => 
      (u.email.toLowerCase() === emailOrUsername.toLowerCase() || 
       u.id.toLowerCase() === emailOrUsername.toLowerCase()) &&
      u.password === password
    );
    if (user) {
      setCurrentUser(user);
      return true;
    }
    return false;
  };

  const loginById = (id: string) => {
    const user = users.find(u => u.id === id);
    if (user) setCurrentUser(user);
    setIsRoleSwitcherOpen(false);
  };

  const logout = () => setCurrentUser(null);

  const addReport = (report: LostReport) => {
    setReports([report, ...reports]);
    const adminNotif: Notification = {
      id: `notif-report-${Date.now()}`,
      targetRole: 'Admin',
      title: 'New Incident Reported',
      message: `Admin, a new missing person report has been filed for ${report.name}. Immediate verification required.`,
      type: 'Urgent',
      date: new Date().toISOString(),
      isRead: false,
      link: `lost-found:report:${report.id}`
    };
    setNotifications([adminNotif, ...notifications]);
  };

  const addUser = (user: UserProfile) => {
    setUsers([user, ...users]);
    if (user.role === 'Admin') {
      const saNotif: Notification = {
        id: `notif-staff-${Date.now()}`,
        targetRole: 'SuperAdmin',
        title: 'Staff Onboarding',
        message: `New administrative account created for ${user.firstName} ${user.lastName}.`,
        type: 'Info',
        date: new Date().toISOString(),
        isRead: false,
        link: `members:user:${user.id}`
      };
      setNotifications([saNotif, ...notifications]);
    }
  };

  const updateUser = (updatedUser: UserProfile) => {
    const newUsers = users.map(u => u.id === updatedUser.id ? updatedUser : u);
    setUsers(newUsers);
    if (currentUser?.id === updatedUser.id) {
      setCurrentUser(updatedUser);
    }
  };

  const updateProgramRequest = (updatedReq: ProgramAvailment) => {
    setProgramRequests(prev => prev.map(r => r.id === updatedReq.id ? updatedReq : r));
    const userNotif: Notification = {
      id: `notif-update-${Date.now()}`,
      userId: updatedReq.userId,
      title: `Application ${updatedReq.status}`,
      message: `Your request for ${updatedReq.title} has been updated to ${updatedReq.status}.`,
      type: updatedReq.status === 'Approved' || updatedReq.status === 'Completed' ? 'Success' : updatedReq.status === 'Rejected' ? 'Urgent' : 'Info',
      date: new Date().toISOString(),
      isRead: false,
      link: `programs:requests:${updatedReq.id}`,
      programType: updatedReq.programType
    };
    setNotifications([userNotif, ...notifications]);

    if (currentUser && updatedReq.userId === currentUser.id) {
       const updatedHistory = currentUser.history.programs.map(p => p.id === updatedReq.id ? updatedReq : p);
       if (!currentUser.history.programs.find(p => p.id === updatedReq.id)) {
          updatedHistory.push(updatedReq);
       }
       updateUser({
         ...currentUser,
         history: {
           ...currentUser.history,
           programs: updatedHistory
         }
       });
    }
  };

  const addProgramRequest = (newReq: ProgramAvailment) => {
    setProgramRequests([newReq, ...programRequests]);
    const userNotif: Notification = {
      id: `notif-user-${Date.now()}`,
      userId: newReq.userId,
      title: 'Request Logged',
      message: `We have received your application for ${newReq.title}. It is now pending evaluation.`,
      type: 'Info',
      date: new Date().toISOString(),
      isRead: false,
      link: `programs:requests:${newReq.id}`,
      programType: newReq.programType
    };
    const adminNotif: Notification = {
      id: `notif-admin-${Date.now()}`,
      targetRole: 'Admin',
      title: 'New Evaluation Pending',
      message: `A new ${newReq.programType} request has been submitted and requires administrative review.`,
      type: 'Warning',
      date: new Date().toISOString(),
      isRead: false,
      link: `programs:requests:${newReq.id}`,
      programType: newReq.programType
    };
    setNotifications([userNotif, adminNotif, ...notifications]);
  };

  const markNotificationRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
  };

  const clearAllNotifications = () => {
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
  };

  const addCustomSection = (label: string) => {
    setCustomSections([...customSections, { id: Date.now().toString(), label }]);
  };

  const removeCustomSection = (id: string) => {
    setCustomSections(customSections.filter(s => s.id !== id));
  };

  const switchDevMode = () => {
    setIsRoleSwitcherOpen(true);
  };

  const sendDirectMessage = (toUserId: string, text: string) => {
    if (!currentUser) return;
    const threadKey = [currentUser.id, toUserId].sort().join('_');
    const newMessage: DirectMessage = {
      id: `msg-${Date.now()}`,
      senderId: currentUser.id,
      text,
      timestamp: new Date().toISOString()
    };
    
    setDirectMessages(prev => ({
      ...prev,
      [threadKey]: [...(prev[threadKey] || []), newMessage]
    }));
  };

  const userNotifications = useMemo(() => {
    if (!currentUser) return [];
    return notifications.filter(n => {
      if (n.userId === currentUser.id) return true;
      if (n.targetRole === 'SuperAdmin' && currentUser.role === 'SuperAdmin') return true;
      if (n.targetRole === 'Admin' && (currentUser.role === 'Admin' || currentUser.role === 'SuperAdmin')) return true;
      if (n.targetRole === 'User' && currentUser.role === 'User') return true;
      return false;
    });
  }, [notifications, currentUser]);

  return (
    <AppContext.Provider value={{
      currentUser, users, reports, programRequests, notifications: userNotifications, customSections, 
      directMessages, isDarkMode, globalSearchQuery, globalSearchFilter, searchSignal, isRoleSwitcherOpen, 
      setGlobalSearchQuery, setGlobalSearchFilter, setSearchSignal, setIsRoleSwitcherOpen, toggleTheme, 
      login, loginWithPassword, loginById, logout, addReport, addUser, updateUser, updateProgramRequest, addProgramRequest,
      addCustomSection, removeCustomSection, switchDevMode, markNotificationRead, clearAllNotifications,
      sendDirectMessage
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useAppContext must be used within an AppProvider');
  return context;
};
