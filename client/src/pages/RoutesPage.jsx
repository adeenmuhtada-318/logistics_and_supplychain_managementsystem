import React, { useEffect, useState, useMemo, useCallback, memo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchRoutes, deleteRoute } from '../features/routes/routeSlice';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { CreateRouteModal } from '../components/routes/CreateRouteModal';
import { Navigation2, Plus, Search, Edit2, Trash2 } from 'lucide-react';

const RouteRow = memo(({ route, onDelete, onEdit, canManage }) => {
  const getStatusBadge = (status) => {
    switch (status) {
      case 'Active': return <Badge variant="success">Active</Badge>;
      case 'Optimized': return <Badge variant="info">Optimized</Badge>;
      case 'Suspended': return <Badge variant="warning">Suspended</Badge>;
      default: return <Badge variant="secondary">{status}</Badge>;
    }
  };

  return (
    <tr className="border-b border-[var(--table-border)] hover:bg-[var(--table-row-hover)] transition-colors duration-150">
      <td className="py-3 px-4 whitespace-nowrap text-sm font-medium text-[var(--text-primary)]">
        {route.routeCode}
      </td>
      <td className="py-3 px-4 whitespace-nowrap text-sm text-[var(--text-secondary)]">
        {route.routeName}
      </td>
      <td className="py-3 px-4 whitespace-nowrap text-sm text-[var(--text-secondary)]">
        {route.originHub}
      </td>
      <td className="py-3 px-4 whitespace-nowrap text-sm text-[var(--text-secondary)]">
        {route.destinationHub}
      </td>
      <td className="py-3 px-4 whitespace-nowrap text-sm text-[var(--text-secondary)]">
        {route.estimatedDistanceKm}
      </td>
      <td className="py-3 px-4 whitespace-nowrap text-sm text-[var(--text-secondary)]">
        {route.estimatedDurationHours}
      </td>
      <td className="py-3 px-4 whitespace-nowrap text-sm text-[var(--text-secondary)]">
        {route.fuelConsumedLiters || ((route.estimatedDistanceKm / 100) * 30).toFixed(1)}
      </td>
      <td className="py-3 px-4 whitespace-nowrap text-sm text-[var(--text-secondary)]">
        ${(route.tolls || 0).toFixed(2)}
      </td>
      <td className="py-3 px-4 whitespace-nowrap text-sm text-[var(--text-secondary)]">
        {route.carbonFootprintKg || (route.estimatedDistanceKm * 0.8).toFixed(1)}
      </td>
      <td className="py-3 px-4 whitespace-nowrap text-sm">
        {getStatusBadge(route.status)}
      </td>
      <td className="py-3 px-4 whitespace-nowrap text-sm text-right">
        {canManage && (
          <div className="flex items-center justify-end gap-2">
            <button
              onClick={() => onEdit(route)}
              className="p-1 text-[var(--text-secondary)] hover:text-brand-500 transition-colors duration-150"
              title="Edit"
            >
              <Edit2 className="w-4 h-4" />
            </button>
            <button
              onClick={() => onDelete(route._id, route.routeCode)}
              className="p-1 text-[var(--text-secondary)] hover:text-red-500 transition-colors duration-150"
              title="Delete"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        )}
      </td>
    </tr>
  );
});
RouteRow.displayName = 'RouteRow';

export const RoutesPage = () => {
  const dispatch = useDispatch();
  const { routes, loading } = useSelector((state) => state.routes);
  const { user } = useSelector((state) => state.auth);

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  useEffect(() => {
    dispatch(fetchRoutes({ search }));
  }, [dispatch, search]);

  const handleDelete = useCallback(async (id, code) => {
    if (window.confirm(`Are you sure you want to delete route corridor ${code}?`)) {
      await dispatch(deleteRoute(id));
    }
  }, [dispatch]);

  const handleEdit = useCallback((route) => {
    console.log('Edit route', route);
  }, []);

  const filteredRoutes = useMemo(() => {
    return routes.filter(route => {
      const matchStatus = statusFilter === 'All' || route.status === statusFilter;
      const term = search.toLowerCase();
      const matchSearch = 
        !term || 
        route.routeCode?.toLowerCase().includes(term) ||
        route.routeName?.toLowerCase().includes(term) ||
        route.originHub?.toLowerCase().includes(term) ||
        route.destinationHub?.toLowerCase().includes(term);
      
      return matchStatus && matchSearch;
    });
  }, [routes, search, statusFilter]);

  const canManage = user?.role === 'Fleet_Manager' || user?.role === 'Dispatcher';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-base font-semibold text-[var(--text-primary)] flex items-center gap-2">
            <Navigation2 className="w-5 h-5 text-brand-500" /> Route Corridors
          </h1>
          <p className="text-sm text-[var(--text-secondary)] mt-1">
            Manage freight routes, waypoints, and cost data.
          </p>
        </div>

        {canManage && (
          <Button
            className="bg-[#1F7A63] hover:bg-[#186350] text-white"
            icon={Plus}
            onClick={() => setIsCreateModalOpen(true)}
          >
            Add Route
          </Button>
        )}
      </div>

      {/* Filter Bar */}
      <Card className="p-4 bg-[var(--bg-card)] border-[var(--border)] rounded-md">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <Input
              icon={Search}
              placeholder="Search by route code, name, origin, destination..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="w-full sm:w-48">
            <Select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              options={[
                { value: 'All', label: 'All Statuses' },
                { value: 'Active', label: 'Active' },
                { value: 'Optimized', label: 'Optimized' },
                { value: 'Suspended', label: 'Suspended' },
              ]}
            />
          </div>
        </div>
      </Card>

      {/* Data Table */}
      <Card className="overflow-hidden bg-[var(--bg-card)] border-[var(--border)] rounded-md">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-[var(--table-header)] border-b border-[var(--table-border)]">
              <tr>
                <th className="py-3 px-4 text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider">Route Code</th>
                <th className="py-3 px-4 text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider">Route Name</th>
                <th className="py-3 px-4 text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider">Origin Hub</th>
                <th className="py-3 px-4 text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider">Destination Hub</th>
                <th className="py-3 px-4 text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider">Distance (km)</th>
                <th className="py-3 px-4 text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider">Duration (hrs)</th>
                <th className="py-3 px-4 text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider">Fuel (L)</th>
                <th className="py-3 px-4 text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider">Tolls ($)</th>
                <th className="py-3 px-4 text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider">CO2 (kg)</th>
                <th className="py-3 px-4 text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider">Status</th>
                <th className="py-3 px-4 text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--table-border)]">
              {loading && routes.length === 0 ? (
                <tr>
                  <td colSpan={11} className="py-8 text-center text-sm text-[var(--text-secondary)]">
                    Loading route corridors...
                  </td>
                </tr>
              ) : filteredRoutes.length === 0 ? (
                <tr>
                  <td colSpan={11} className="py-8 text-center text-sm text-[var(--text-secondary)]">
                    No routes found.
                  </td>
                </tr>
              ) : (
                filteredRoutes.map((route) => (
                  <RouteRow
                    key={route._id}
                    route={route}
                    onDelete={handleDelete}
                    onEdit={handleEdit}
                    canManage={canManage}
                  />
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Modal */}
      <CreateRouteModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
      />
    </div>
  );
};
