import { useState, useEffect } from 'react';
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { TrendingUp, Users, DollarSign, ArrowUp, ArrowDown, RefreshCw, Calendar, BookOpen, ShoppingBag, Activity } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from './ToastContainer';
import { api } from '../services/api';
import { SkeletonStatCard, SkeletonCard } from './Skeleton';
import HealthCheckModal from './HealthCheckModal';

// Colorful chart color palettes
const CHART_COLORS = {
  primary: ['#0ea5e9', '#06b6d4', '#14b8a6', '#10b981', '#84cc16', '#eab308', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'],
  gradient: {
    revenue: { from: '#0ea5e9', to: '#06b6d4' },
    expenses: { from: '#ef4444', to: '#f59e0b' },
    growth: { from: '#10b981', to: '#14b8a6' },
    subscriptions: { from: '#8b5cf6', to: '#a855f7' },
    courses: { from: '#ec4899', to: '#f472b6' },
  },
};

interface DashboardData {
  overview: {
    totalUsers: number;
    userBreakdown: {
      students: number;
      admins: number;
      coordinators: number;
      districtCoordinators: number;
      teamLeaders: number;
      fieldEmployees: number;
    };
    activeUsers: {
      students: number;
      total: number;
    };
    inactiveUsers: {
      students: number;
      total: number;
      note: string;
    };
  };
  revenue: {
    period: {
      subscriptions: number;
      courses: number;
      total: number;
      transactions: number;
      netRevenue: number;
    };
    allTime: {
      subscriptions: number;
      courses: number;
      total: number;
      netRevenue: number;
    };
  };
  expenses: {
    period: {
      total: number;
      transactions: number;
    };
    allTime: {
      total: number;
    };
    note: string;
  };
  userCounts: {
    students: number;
    admins: number;
    coordinators: number;
    districtCoordinators: number;
    teamLeaders: number;
    fieldEmployees: number;
  };
  growthChart: {
    period: string;
    data: Array<{
      date: string;
      signUps: number;
    }>;
  };
  salesChart: {
    period: string;
    topSubcategories: Array<{
      subCategory: string;
      subCategoryId: string;
      totalSales: number;
      transactions: number;
    }>;
    topCourses: Array<{
      course: string;
      courseId: string;
      totalSales: number;
      transactions: number;
    }>;
  };
  recentActivity: {
    subscriptions: Array<{
      student: {
        userId: string;
        name: string;
      };
      plan: {
        duration: string;
        amount: number;
      };
      subCategory: string;
      amount: number;
      createdAt: string;
    }>;
    coursePurchases: Array<{
      student: {
        userId: string;
        name: string;
      };
      course: {
        title: string;
        price: number;
      };
      amount: number;
      createdAt: string;
    }>;
  };
}

export default function Dashboard() {
  const { token } = useAuth();
  const { showToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState(30);
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [showHealthCheck, setShowHealthCheck] = useState(false);
  const [healthCheckData, setHealthCheckData] = useState<any>(null);
  const [healthCheckLoading, setHealthCheckLoading] = useState(false);

  useEffect(() => {
    if (token) {
      fetchDashboard();
    }
  }, [token, period]);

  const fetchDashboard = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const response = await api.getDashboard(token, period);
      if (response.success) {
        setDashboardData(response.data);
      }
    } catch (error: any) {
      showToast(error.message || 'Failed to fetch dashboard data', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleHealthCheck = async () => {
    if (!token) return;
    setShowHealthCheck(true);
    setHealthCheckLoading(true);
    try {
      const response = await api.getHealthCheck(token);
      if (response.success) {
        // The response already has all the fields we need at the top level
        setHealthCheckData(response);
      }
    } catch (error: any) {
      showToast(error.message || 'Failed to fetch health check data', 'error');
      setHealthCheckData(null);
    } finally {
      setHealthCheckLoading(false);
    }
  };

  // Transform growth chart data
  const growthChartData = dashboardData?.growthChart.data.map(item => ({
    date: new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    signUps: item.signUps,
  })) || [];

  // Transform revenue/expenses data for period comparison
  const revenueExpensesData = dashboardData ? [
    {
      label: 'Subscriptions',
      revenue: dashboardData.revenue.period.subscriptions,
      expenses: 0,
    },
    {
      label: 'Courses',
      revenue: dashboardData.revenue.period.courses,
      expenses: 0,
    },
    {
      label: 'Total',
      revenue: dashboardData.revenue.period.total,
      expenses: dashboardData.expenses.period.total,
    },
  ] : [];

  // Calculate growth percentages (comparing period to all-time average)
  const calculateGrowth = (period: number, allTime: number, days: number) => {
    if (allTime === 0) return '+0%';
    const dailyAverage = allTime / 365; // Assuming all-time is roughly 1 year
    const periodAverage = period / days;
    const growth = ((periodAverage - dailyAverage) / dailyAverage) * 100;
    return `${growth >= 0 ? '+' : ''}${growth.toFixed(1)}%`;
  };

  if (loading) {
    return (
      <div className="p-8 space-y-8">
        <div>
          <div className="h-8 bg-gray-200 rounded w-64 animate-pulse mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-96 animate-pulse"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <SkeletonStatCard key={i} />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <SkeletonCard />
          <SkeletonCard />
        </div>
      </div>
    );
  }

  if (!dashboardData) {
    return (
      <div className="p-8">
        <div className="bg-white rounded-xl shadow-lg p-8 text-center">
          <p className="text-gray-600">No dashboard data available</p>
          <button
            onClick={fetchDashboard}
            className="mt-4 px-6 py-2 bg-sky-500 text-white rounded-lg hover:bg-sky-600 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const revenueGrowth = calculateGrowth(
    dashboardData.revenue.period.total,
    dashboardData.revenue.allTime.total,
    period
  );
  const userGrowth = calculateGrowth(
    dashboardData.overview.totalUsers,
    dashboardData.overview.totalUsers,
    period
  );

  return (
    <div className="p-8 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Dashboard Overview</h1>
          <p className="text-gray-600">Welcome back! Here's what's happening with your business today.</p>
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={handleHealthCheck}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg hover:from-green-600 hover:to-emerald-700 transition-all shadow-md hover:shadow-lg"
          >
            <Activity className="w-4 h-4" />
            System Health Check
          </button>
          <div className="flex items-center gap-2 bg-white rounded-lg border border-gray-200 px-4 py-2">
            <Calendar className="w-4 h-4 text-gray-500" />
            <select
              value={period}
              onChange={(e) => setPeriod(Number(e.target.value))}
              className="border-none outline-none text-sm font-medium text-gray-700 bg-transparent"
            >
              <option value={7}>Last 7 days</option>
              <option value={30}>Last 30 days</option>
              <option value={90}>Last 90 days</option>
              <option value={180}>Last 180 days</option>
              <option value={365}>Last year</option>
            </select>
          </div>
          <button
            onClick={fetchDashboard}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-sky-50 text-sky-600 rounded-lg hover:bg-sky-100 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Revenue"
          value={`₹${dashboardData.revenue.period.total.toLocaleString()}`}
          change={revenueGrowth}
          icon={DollarSign}
          color="from-sky-400 to-sky-600"
          subtitle={`Net: ₹${dashboardData.revenue.period.netRevenue.toLocaleString()}`}
        />
        <StatCard
          title="Total Users"
          value={dashboardData.overview.totalUsers.toLocaleString()}
          change={userGrowth}
          icon={Users}
          color="from-cyan-400 to-cyan-600"
          subtitle={`Active: ${dashboardData.overview.activeUsers.total.toLocaleString()}`}
        />
        <StatCard
          title="Transactions"
          value={dashboardData.revenue.period.transactions.toLocaleString()}
          change="+0%"
          icon={ShoppingBag}
          color="from-teal-400 to-teal-600"
          subtitle={`Period: ${period} days`}
        />
        <StatCard
          title="Active Users"
          value={dashboardData.overview.activeUsers.total.toLocaleString()}
          change="+0%"
          icon={TrendingUp}
          color="from-purple-400 to-purple-600"
          subtitle={`Inactive: ${dashboardData.overview.inactiveUsers.total.toLocaleString()}`}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Revenue & Expenses</h2>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={revenueExpensesData}>
              <defs>
                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={CHART_COLORS.gradient.revenue.from} stopOpacity={0.8} />
                  <stop offset="95%" stopColor={CHART_COLORS.gradient.revenue.to} stopOpacity={0.1} />
                </linearGradient>
                <linearGradient id="colorExpenses" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={CHART_COLORS.gradient.expenses.from} stopOpacity={0.8} />
                  <stop offset="95%" stopColor={CHART_COLORS.gradient.expenses.to} stopOpacity={0.1} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="label" stroke="#6b7280" />
              <YAxis stroke="#6b7280" />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#fff',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                }}
                formatter={(value: number | undefined) => value ? `₹${value.toLocaleString()}` : '₹0'}
              />
              <Legend />
              <Area
                type="monotone"
                dataKey="revenue"
                stroke={CHART_COLORS.gradient.revenue.from}
                fillOpacity={1}
                fill="url(#colorRevenue)"
                strokeWidth={3}
              />
              <Area
                type="monotone"
                dataKey="expenses"
                stroke={CHART_COLORS.gradient.expenses.from}
                fillOpacity={1}
                fill="url(#colorExpenses)"
                strokeWidth={3}
              />
            </AreaChart>
          </ResponsiveContainer>
          <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-gray-600">Period Revenue</p>
              <p className="text-lg font-bold text-sky-600">
                ₹{dashboardData.revenue.period.total.toLocaleString()}
              </p>
            </div>
            <div>
              <p className="text-gray-600">Period Expenses</p>
              <p className="text-lg font-bold text-red-600">
                ₹{dashboardData.expenses.period.total.toLocaleString()}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">User Growth ({dashboardData.growthChart.period})</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={growthChartData}>
              <defs>
                <linearGradient id="colorGrowth" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={CHART_COLORS.gradient.growth.from} stopOpacity={0.9} />
                  <stop offset="95%" stopColor={CHART_COLORS.gradient.growth.to} stopOpacity={0.7} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="date" stroke="#6b7280" />
              <YAxis stroke="#6b7280" />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#fff',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                }}
              />
              <Bar dataKey="signUps" fill="url(#colorGrowth)" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Sales by Subcategory</h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={dashboardData.salesChart.topSubcategories}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={(entry: any) =>
                  `${entry.subCategory}: ₹${((entry.totalSales || 0) / 1000).toFixed(0)}k`
                }
                outerRadius={100}
                fill="#8884d8"
                dataKey="totalSales"
              >
                {dashboardData.salesChart.topSubcategories.map((_, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={CHART_COLORS.primary[index % CHART_COLORS.primary.length]}
                  />
                ))}
              </Pie>
              <Tooltip formatter={(value: number | undefined) => value ? `₹${value.toLocaleString()}` : '₹0'} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="lg:col-span-2 bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Top Courses by Sales</h2>
          <div className="space-y-4">
            {dashboardData.salesChart.topCourses.map((course, index) => (
              <div
                key={course.courseId}
                className="flex items-center justify-between p-4 rounded-lg transition-all hover:shadow-md"
                style={{
                  background: `linear-gradient(135deg, ${CHART_COLORS.primary[index % CHART_COLORS.primary.length]}15, ${CHART_COLORS.primary[(index + 1) % CHART_COLORS.primary.length]}10)`,
                }}
              >
                <div className="flex items-center gap-4 flex-1">
                  <div
                    className="w-12 h-12 rounded-lg flex items-center justify-center text-white font-bold text-lg"
                    style={{
                      background: `linear-gradient(135deg, ${CHART_COLORS.primary[index % CHART_COLORS.primary.length]}, ${CHART_COLORS.primary[(index + 1) % CHART_COLORS.primary.length]})`,
                    }}
                  >
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-800">{course.course}</h3>
                    <p className="text-sm text-gray-600">{course.transactions} transactions</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-gray-800 text-lg">
                    ₹{course.totalSales.toLocaleString()}
                  </p>
                  <p className="text-sm text-gray-500">Total Sales</p>
                </div>
              </div>
            ))}
            {dashboardData.salesChart.topCourses.length === 0 && (
              <p className="text-center text-gray-500 py-8">No course sales data available</p>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Recent Subscriptions</h2>
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {dashboardData.recentActivity.subscriptions.length > 0 ? (
              dashboardData.recentActivity.subscriptions.map((subscription, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border border-purple-100"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <BookOpen className="w-4 h-4 text-purple-600" />
                      <p className="font-semibold text-gray-800">{subscription.student.name}</p>
                      <span className="text-xs text-gray-500">({subscription.student.userId})</span>
                    </div>
                    <p className="text-sm text-gray-600">
                      {subscription.subCategory} • {subscription.plan.duration}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {new Date(subscription.createdAt).toLocaleString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-purple-600">₹{subscription.amount.toLocaleString()}</p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-center text-gray-500 py-8">No recent subscriptions</p>
            )}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Recent Course Purchases</h2>
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {dashboardData.recentActivity.coursePurchases.length > 0 ? (
              dashboardData.recentActivity.coursePurchases.map((purchase, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-4 bg-gradient-to-r from-sky-50 to-cyan-50 rounded-lg border border-sky-100"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <ShoppingBag className="w-4 h-4 text-sky-600" />
                      <p className="font-semibold text-gray-800">{purchase.student.name}</p>
                      <span className="text-xs text-gray-500">({purchase.student.userId})</span>
                    </div>
                    <p className="text-sm text-gray-600">{purchase.course.title}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {new Date(purchase.createdAt).toLocaleString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-sky-600">₹{purchase.amount.toLocaleString()}</p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-center text-gray-500 py-8">No recent course purchases</p>
            )}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-lg p-6">
        <h2 className="text-xl font-bold text-gray-800 mb-4">User Breakdown</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {Object.entries(dashboardData.userCounts).map(([key, value], index) => (
            <div
              key={key}
              className="p-4 rounded-lg text-center"
              style={{
                background: `linear-gradient(135deg, ${CHART_COLORS.primary[index % CHART_COLORS.primary.length]}15, ${CHART_COLORS.primary[index % CHART_COLORS.primary.length]}05)`,
              }}
            >
              <p className="text-sm text-gray-600 mb-1 capitalize">
                {key.replace(/([A-Z])/g, ' $1').trim()}
              </p>
              <p
                className="text-2xl font-bold"
                style={{ color: CHART_COLORS.primary[index % CHART_COLORS.primary.length] }}
              >
                {value.toLocaleString()}
              </p>
            </div>
          ))}
        </div>
      </div>

      <HealthCheckModal
        isOpen={showHealthCheck}
        data={healthCheckData}
        loading={healthCheckLoading}
        onClose={() => {
          setShowHealthCheck(false);
          setHealthCheckData(null);
        }}
      />
    </div>
  );
}

interface StatCardProps {
  title: string;
  value: string;
  change: string;
  icon: React.ElementType;
  color: string;
  subtitle?: string;
}

function StatCard({ title, value, change, icon: Icon, color, subtitle }: StatCardProps) {
  const isPositive = change.startsWith('+') || !change.startsWith('-');

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition">
      <div className="flex items-center justify-between mb-4">
        <div className={`bg-gradient-to-br ${color} p-3 rounded-lg`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
        <div className={`flex items-center gap-1 ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
          {isPositive ? <ArrowUp className="w-4 h-4" /> : <ArrowDown className="w-4 h-4" />}
          <span className="text-sm font-semibold">{change}</span>
        </div>
      </div>
      <h3 className="text-gray-600 text-sm mb-1">{title}</h3>
      <p className="text-3xl font-bold text-gray-800">{value}</p>
      {subtitle && <p className="text-xs text-gray-500 mt-1">{subtitle}</p>}
    </div>
  );
}
