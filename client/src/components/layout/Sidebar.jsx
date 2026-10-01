import React, { useMemo } from 'react';
import { NavLink } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { 
  LayoutDashboard, 
  Truck, 
  Send, 
  Navigation2, 
  Clock, 
  CircleDollarSign 
} from 'lucide-react';

/** Roles that may access financial data (Payroll tab, cost metrics). */
const FINANCIAL_ROLES = ['Fleet_Manager', 'Accountant'];

const ALL_NAV_ITEMS = [
  { path: '/', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/vehicles', label: 'Fleet Vehicles', icon: Truck },
  { path: '/dispatches', label: 'Dispatch Logs', icon: Send },
  { path: '/routes', label: 'Route Metrics', icon: Navigation2 },
  { path: '/attendance', label: 'Attendance', icon: Clock },
  // Restricted: visible to Fleet_Manager and Accountant only
  { path: '/payroll', label: 'Payroll', icon: CircleDollarSign, allowedRoles: FINANCIAL_ROLES },
];

export const Sidebar = React.memo(({ isOpen, onClose }) => {
  const { user } = useSelector((state) => state.auth);

  const navItems = useMemo(() =>
    ALL_NAV_ITEMS.filter(({ allowedRoles }) =>
      !allowedRoles || allowedRoles.includes(user?.role)
    ),
    [user?.role]
  );

  return (
    <aside 
      className={`fixed top-14 left-0 w-56 h-[calc(100vh-3.5rem)] bg-[var(--bg-sidebar)] border-r border-[var(--border)] overflow-y-auto transition-transform duration-150 z-40 lg:translate-x-0 ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}
    >
      <nav className="flex flex-col py-3">
        {navItems.map(({ path, label, icon: Icon }) => (
          <NavLink
            key={path}
            to={path}
            onClick={() => {
              if (window.innerWidth < 1024 && onClose) onClose();
            }}
            className={({ isActive }) => 
              `flex items-center gap-3 px-4 py-2.5 text-sm font-medium rounded-md mx-2 my-0.5 transition-colors duration-150 border-l-2 ${
                isActive 
                  ? 'bg-brand-500/10 text-brand-500 dark:bg-brand-500/15 dark:text-brand-400 border-brand-500' 
                  : 'border-transparent text-[var(--text-secondary)] hover:bg-[var(--table-row-hover)] hover:text-[var(--text-primary)]'
              }`
            }
          >
            <Icon className="w-4 h-4" />
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>
    </aside>
  );
});
