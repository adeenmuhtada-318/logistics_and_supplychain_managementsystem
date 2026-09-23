import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Menu, Sun, Moon, LogOut, ChevronDown } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { useDispatch, useSelector } from 'react-redux';
import { logout, loginUser } from '../../features/auth/authSlice';

export const Navbar = ({ onMenuClick }) => {
  const { theme, toggleTheme } = useTheme();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  
  const [roleDropdownOpen, setRoleDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setRoleDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleRoleSwitch = useCallback((roleData) => {
    dispatch(loginUser(roleData));
    setRoleDropdownOpen(false);
  }, [dispatch]);

  const handleLogout = useCallback(() => {
    dispatch(logout());
  }, [dispatch]);

  const demoAccounts = [
    { email: 'manager@logistics.local', password: 'Manager@123456', role: 'Fleet Manager' },
    { email: 'dispatcher@logistics.local', password: 'Dispatcher@123456', role: 'Dispatcher' },
    { email: 'driver.john@logistics.local', password: 'Driver@123456', role: 'Driver' },
    { email: 'accountant@logistics.local', password: 'Accountant@123456', role: 'Accountant' },
  ];

  return (
    <header className="bg-[var(--bg-nav)] border-b border-[var(--border)] h-14 px-4 fixed top-0 left-0 right-0 z-30 transition-colors duration-150 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <button 
          onClick={onMenuClick}
          className="lg:hidden p-1.5 text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--table-row-hover)] rounded-md transition-colors duration-150"
        >
          <Menu className="w-5 h-5" />
        </button>
        <div className="flex items-center gap-1.5 font-bold text-base text-[var(--text-primary)]">
          <span>FleetCore</span>
          <div className="w-1.5 h-1.5 rounded-full bg-brand-500"></div>
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-4">
        <button
          onClick={toggleTheme}
          className="p-1.5 text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--table-row-hover)] rounded-md transition-colors duration-150"
          title="Toggle Theme"
        >
          {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </button>

        <div className="relative" ref={dropdownRef}>
          <button 
            onClick={() => setRoleDropdownOpen(!roleDropdownOpen)}
            className="flex items-center gap-1.5 px-2 py-1 text-xs font-medium bg-brand-500/10 text-brand-500 border border-brand-500/20 rounded-md hover:bg-brand-500/20 transition-colors duration-150"
          >
            {user?.role || 'Demo Roles'}
            <ChevronDown className="w-3 h-3" />
          </button>
          
          {roleDropdownOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-[var(--bg-card)] border border-[var(--border)] rounded-md shadow-lg overflow-hidden py-1 z-50">
              <div className="px-3 py-1.5 text-xs font-semibold text-[var(--text-secondary)] uppercase">Switch Role</div>
              {demoAccounts.map((account, idx) => (
                <button
                  key={idx}
                  onClick={() => handleRoleSwitch(account)}
                  className="w-full text-left px-3 py-2 text-sm text-[var(--text-primary)] hover:bg-[var(--table-row-hover)] transition-colors duration-150"
                >
                  {account.role}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="flex items-center gap-3 pl-2 sm:pl-4 border-l border-[var(--border)]">
          <div className="hidden sm:flex flex-col items-end">
            <span className="text-sm font-medium text-[var(--text-primary)]">{user?.name || 'Guest User'}</span>
            <span className="text-xs text-[var(--text-secondary)]">{user?.role || 'No Role'}</span>
          </div>
          <button
            onClick={handleLogout}
            className="p-1.5 text-red-500 hover:text-red-600 hover:bg-red-500/10 rounded-md transition-colors duration-150"
            title="Logout"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
