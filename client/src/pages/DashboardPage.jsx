import React, { useEffect, useMemo, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchFleetAnalytics } from '../features/analytics/analyticsSlice';
import { useTheme } from '../context/ThemeContext';
import { StatCard } from '../components/ui/StatCard';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import {
  Truck,
  Send,
  Users,
  DollarSign,
  Activity,
  RefreshCw,
  TrendingUp,
  TrendingDown
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  PieChart,
  Pie,
  Cell
} from 'recharts';

const DispatchRow = React.memo(({ disp, getPriorityBadge, getStatusBadge }) => {
  return (
    <tr className="hover:bg-[var(--table-row-hover)] transition-colors duration-150 border-b border-[var(--border)] last:border-0">
      <td className="py-3 px-4 font-mono font-medium text-[var(--text-primary)]">
        {disp.dispatchNumber || 'N/A'}
      </td>
      <td className="py-3 px-4 text-[var(--text-primary)]">
        {disp.driver?.name || 'Unassigned'}
      </td>
      <td className="py-3 px-4 text-[var(--text-secondary)]">
        {disp.route?.originHub || 'Unknown'} → {disp.route?.destinationHub || 'Unknown'}
      </td>
      <td className="py-3 px-4 text-[var(--text-secondary)]">
        {disp.cargo || 'N/A'}
      </td>
      <td className="py-3 px-4">{getStatusBadge(disp.status)}</td>
      <td className="py-3 px-4">{getPriorityBadge(disp.priority)}</td>
      <td className="py-3 px-4 text-[var(--text-secondary)]">
        {disp.eta ? new Date(disp.eta).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'N/A'}
      </td>
    </tr>
  );
});

export const DashboardPage = () => {
  const dispatch = useDispatch();
  const { theme } = useTheme();
  
  // Destructure fleetData or fallback to data just in case
  const { fleetData, data, loading } = useSelector((state) => state.analytics);
  
  const analyticsData = fleetData || data || {};

  useEffect(() => {
    dispatch(fetchFleetAnalytics());
  }, [dispatch]);

  const summary = analyticsData.summary || {};
  const recentDispatches = analyticsData.recentDispatches || [];
  const costTrends = analyticsData.costTrends || analyticsData.monthlyCostTrends || [];

  // KPI Calculations
  const totalVehicles = summary.totalVehicles || 0;
  const inTransitVehicles = summary.inTransitVehicles || 0;
  const availableVehicles = summary.availableVehicles || 0;
  const maintenanceVehicles = summary.maintenanceVehicles || 0;
  const outOfServiceVehicles = summary.outOfServiceVehicles || 0;
  
  const activeDispatches = summary.activeDispatches || 0;
  const onDutyDrivers = summary.onDutyDrivers || 0;
  const totalOperatingCost = summary.totalOperatingCost || 0;
  
  const fleetUtilizationRate = summary.fleetUtilizationRate || 0;

  // Pie chart data
  const pieData = useMemo(() => [
    { name: 'Available', value: availableVehicles },
    { name: 'In Transit', value: inTransitVehicles },
    { name: 'Maintenance', value: maintenanceVehicles },
    { name: 'Out of Service', value: outOfServiceVehicles },
  ], [availableVehicles, inTransitVehicles, maintenanceVehicles, outOfServiceVehicles]);

  const PIE_COLORS = ['#1F7A63', '#3B82F6', '#F59E0B', '#EF4444'];

  const getPriorityBadge = useCallback((p) => {
    switch (p) {
      case 'Urgent':
      case 'Hazardous/Critical':
        return <Badge variant="danger" size="sm">{p}</Badge>;
      case 'Express':
        return <Badge variant="purple" size="sm">{p}</Badge>;
      default:
        return <Badge variant="default" size="sm">{p}</Badge>;
    }
  }, []);

  const getStatusBadge = useCallback((s) => {
    switch (s) {
      case 'Delivered':
        return <Badge variant="success" size="sm">Delivered</Badge>;
      case 'Incident Reported':
        return <Badge variant="danger" size="sm">Incident Alert</Badge>;
      case 'En Route':
      case 'At Checkpoint':
        return <Badge variant="primary" size="sm" dot>En Route</Badge>;
      case 'Dispatched':
        return <Badge variant="purple" size="sm">Dispatched</Badge>;
      default:
        return <Badge variant="warning" size="sm">Assigned</Badge>;
    }
  }, []);

  const tooltipBg = theme === 'dark' ? '#0D253A' : '#FFFFFF';
  const tooltipBorder = theme === 'dark' ? '#16354D' : '#E2E8F0';
  const tooltipText = theme === 'dark' ? '#F5F7FA' : '#081C2D';

  const yAxisFormatter = useCallback((value) => `$${value.toLocaleString()}`, []);
  const tooltipFormatter = useCallback((value, label) => [`$${value.toLocaleString()}`, label], []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-base font-semibold text-[var(--text-primary)]">Operations Overview</h1>
          <p className="text-sm text-[var(--text-secondary)] mt-1">
            Fleet overview, dispatch tracking, and cost metrics
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            icon={RefreshCw}
            onClick={() => dispatch(fetchFleetAnalytics())}
            loading={loading}
          >
            Refresh
          </Button>
        </div>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Fleet Vehicles"
          value={totalVehicles}
          subtitle={`${fleetUtilizationRate}% utilization rate`}
          icon={Truck}
          accent={true}
          loading={loading}
        />
        <StatCard
          title="Active Dispatches"
          value={activeDispatches}
          subtitle={`${summary.deliveredDispatches || 0} completed today`}
          icon={Send}
          accent={true}
          loading={loading}
        />
        <StatCard
          title="Drivers On-Duty"
          value={onDutyDrivers}
          subtitle={`${summary.totalDrivers || 0} total drivers`}
          icon={Users}
          accent={true}
          loading={loading}
        />
        <StatCard
          title="Monthly Operating Cost"
          value={`$${totalOperatingCost.toLocaleString()}`}
          subtitle={`Fuel: $${(summary.totalFuelExpense || 0).toLocaleString()}`}
          icon={DollarSign}
          accent={true}
          loading={loading}
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Bar Chart */}
        <Card className="bg-[var(--bg-card)] border-[var(--border)] p-4 flex flex-col">
          <CardHeader className="px-0 pt-0 pb-4 flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-base font-semibold text-[var(--text-primary)]">Monthly Operating Costs</CardTitle>
            </div>
            <TrendingUp className="w-4 h-4 text-[var(--text-secondary)]" />
          </CardHeader>
          <div className="h-64 mt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={costTrends}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--table-border)" vertical={false} />
                <XAxis 
                  dataKey="month" 
                  tick={{ fill: 'var(--text-secondary)', fontSize: 11 }}
                  axisLine={{ stroke: 'var(--table-border)' }}
                  tickLine={false}
                />
                <YAxis 
                  tickFormatter={yAxisFormatter}
                  tick={{ fill: 'var(--text-secondary)', fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  formatter={tooltipFormatter}
                  contentStyle={{
                    backgroundColor: tooltipBg,
                    borderColor: tooltipBorder,
                    color: tooltipText,
                    fontSize: '12px',
                    borderRadius: '6px'
                  }}
                  itemStyle={{ color: tooltipText }}
                />
                <Bar dataKey="fuel" name="Fuel" fill="#1F7A63" radius={[4, 4, 0, 0]} />
                <Bar dataKey="tolls" name="Tolls" fill="#9AA3A8" radius={[4, 4, 0, 0]} />
                <Bar dataKey="payroll" name="Payroll" fill="#F59E0B" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Pie Chart */}
        <Card className="bg-[var(--bg-card)] border-[var(--border)] p-4 flex flex-col">
          <CardHeader className="px-0 pt-0 pb-4 flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-base font-semibold text-[var(--text-primary)]">Fleet Status Distribution</CardTitle>
            </div>
            <Activity className="w-4 h-4 text-[var(--text-secondary)]" />
          </CardHeader>
          <div className="h-64 mt-2 flex flex-col sm:flex-row items-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: tooltipBg,
                    borderColor: tooltipBorder,
                    color: tooltipText,
                    fontSize: '12px',
                    borderRadius: '6px'
                  }}
                  itemStyle={{ color: tooltipText }}
                />
              </PieChart>
            </ResponsiveContainer>
            
            {/* Legend */}
            <div className="flex flex-col gap-3 w-full sm:w-1/3 mt-4 sm:mt-0 pl-4">
              {pieData.map((item, index) => (
                <div key={item.name} className="flex items-center gap-2">
                  <span 
                    className="w-3 h-3 rounded-full shrink-0" 
                    style={{ backgroundColor: PIE_COLORS[index % PIE_COLORS.length] }} 
                  />
                  <div className="flex flex-col">
                    <span className="text-xs text-[var(--text-secondary)]">{item.name}</span>
                    <span className="text-sm font-semibold text-[var(--text-primary)]">{item.value}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Card>
      </div>

      {/* Active Dispatches Table */}
      <Card className="bg-[var(--bg-card)] border-[var(--border)]">
        <CardHeader className="px-6 py-4 border-b border-[var(--border)]">
          <CardTitle className="text-base font-semibold text-[var(--text-primary)]">Active Dispatches</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-[var(--bg-page)] text-xs text-[var(--text-secondary)] uppercase font-medium">
                <tr>
                  <th className="py-3 px-4 font-medium">Dispatch #</th>
                  <th className="py-3 px-4 font-medium">Driver</th>
                  <th className="py-3 px-4 font-medium">Route</th>
                  <th className="py-3 px-4 font-medium">Cargo</th>
                  <th className="py-3 px-4 font-medium">Status</th>
                  <th className="py-3 px-4 font-medium">Priority</th>
                  <th className="py-3 px-4 font-medium">ETA</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border)]">
                {recentDispatches.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-sm text-[var(--text-secondary)]">
                      No active dispatches at the moment.
                    </td>
                  </tr>
                ) : (
                  recentDispatches.map((disp) => (
                    <DispatchRow 
                      key={disp._id || disp.dispatchNumber} 
                      disp={disp}
                      getPriorityBadge={getPriorityBadge}
                      getStatusBadge={getStatusBadge}
                    />
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
