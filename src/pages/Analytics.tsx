import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/ToastContainer';
import { api } from '../services/api';
import { BarChart3, RefreshCw, Calendar, TrendingUp, Wallet } from 'lucide-react';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts';
import { SkeletonCard } from '../components/Skeleton';

const CHART_COLORS = ['#3b82f6', '#10b981', '#8b5cf6', '#f59e0b', '#ef4444', '#06b6d4'];

export default function Analytics() {
  const { token } = useAuth();
  const { showToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState<'all' | 'today' | 'week' | 'month' | 'year'>('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [analyticsData, setAnalyticsData] = useState<any>(null);

  useEffect(() => {
    if (token) {
      fetchAnalytics();
    }
  }, [token, period, startDate, endDate]);

  const fetchAnalytics = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const response = await api.getAnalytics(
        token,
        period,
        startDate || undefined,
        endDate || undefined
      );
      console.log('Analytics API Response:', response); // Debug log
      console.log('Response success:', response.success); // Debug log
      console.log('Response data:', response.data); // Debug log
      
      if (response.success) {
        // Handle different response structures
        let dataToSet = null;
        
        // Check if response.data exists
        if (response.data) {
          // Check if response.data has a nested 'data' property (expected structure)
          if (response.data.data) {
            dataToSet = response.data;
          } 
          // Check if response.data itself contains analytics data (flat structure)
          else if ((response.data as any).trialBalance || (response.data as any).incomeStatement || (response.data as any).revenue) {
            // Wrap it in the expected structure
            dataToSet = {
              period: response.data.period || period,
              dateRange: response.data.dateRange || {},
              data: response.data
            };
          }
          // Otherwise, try to use response.data as-is
          else {
            dataToSet = response.data;
          }
        }
        
        if (dataToSet) {
          setAnalyticsData(dataToSet);
          console.log('Set analytics data:', dataToSet); // Debug log
          
          // Check if we have any meaningful data
          const dataObj: any = dataToSet.data || dataToSet;
          const hasAnyData = 
            (dataObj?.trialBalance && Object.keys(dataObj.trialBalance).length > 0) ||
            (dataObj?.incomeStatement && Object.keys(dataObj.incomeStatement).length > 0) ||
            (dataObj?.balanceSheet && Object.keys(dataObj.balanceSheet).length > 0) ||
            (dataObj?.revenue && Object.keys(dataObj.revenue).length > 0) ||
            (dataObj?.expenses && Object.keys(dataObj.expenses).length > 0) ||
            (dataObj?.commissionDistribution && Object.keys(dataObj.commissionDistribution).length > 0) ||
            (dataObj?.walletBalances && Object.keys(dataObj.walletBalances).length > 0) ||
            (dataObj?.moneyDistribution && Object.keys(dataObj.moneyDistribution).length > 0);
          
          if (!hasAnyData) {
            showToast('Analytics data is empty for the selected period', 'info');
          }
        } else {
          setAnalyticsData(null);
          showToast('No analytics data available in response', 'info');
        }
      } else {
        setAnalyticsData(null);
        showToast(response.message || 'No analytics data available', 'info');
      }
    } catch (error: any) {
      console.error('Analytics fetch error:', error); // Debug log
      setAnalyticsData(null);
      showToast(error.message || 'Failed to fetch analytics', 'error');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return `₹${amount.toLocaleString('en-IN')}`;
  };

  if (loading && !analyticsData) {
    return (
      <div className="p-8 space-y-8">
        <SkeletonCard />
        <SkeletonCard />
        <SkeletonCard />
      </div>
    );
  }

  // Check if we have valid analytics data - be more lenient
  const dataObj: any = analyticsData?.data || analyticsData;
  const hasValidData = analyticsData && (
    (dataObj?.trialBalance && Object.keys(dataObj.trialBalance).length > 0) ||
    (dataObj?.incomeStatement && Object.keys(dataObj.incomeStatement).length > 0) ||
    (dataObj?.balanceSheet && Object.keys(dataObj.balanceSheet).length > 0) ||
    (dataObj?.revenue && Object.keys(dataObj.revenue).length > 0) ||
    (dataObj?.expenses && Object.keys(dataObj.expenses).length > 0) ||
    (dataObj?.commissionDistribution && Object.keys(dataObj.commissionDistribution).length > 0) ||
    (dataObj?.walletBalances && Object.keys(dataObj.walletBalances).length > 0) ||
    (dataObj?.moneyDistribution && Object.keys(dataObj.moneyDistribution).length > 0)
  );

  if (!analyticsData || !analyticsData.data || !hasValidData) {
    return (
      <div className="p-8">
        <div className="bg-white rounded-xl shadow-lg p-8 text-center">
          <p className="text-gray-600 mb-2">No analytics data available</p>
          {analyticsData && analyticsData.period && (
            <p className="text-sm text-gray-500 mb-4">Period: {analyticsData.period}</p>
          )}
          <button
            onClick={fetchAnalytics}
            disabled={loading}
            className="mt-4 px-6 py-2 bg-sky-500 text-white rounded-lg hover:bg-sky-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Loading...' : 'Retry'}
          </button>
        </div>
      </div>
    );
  }

  // Prepare chart data
  const revenueChartData = [
    { name: 'Subscriptions', value: analyticsData.data.revenue?.subscriptions?.total || 0 },
    { name: 'Courses', value: analyticsData.data.revenue?.courses?.total || 0 },
  ];

  const expenseByRoleData = Object.entries(analyticsData.data.expenses?.byRole || {}).map(([role, amount]) => ({
    role,
    amount: amount as number,
  }));

  const commissionDistributionData = Object.entries(analyticsData.data.commissionDistribution?.byRole || {}).map(
    ([role, data]: [string, any]) => ({
      role,
      total: data?.totalCommissions || 0,
      transactions: data?.transactions || 0,
      users: data?.uniqueUsers || 0,
    })
  );

  const moneyDistributionChartData = Object.entries(analyticsData.data.moneyDistribution?.byRole || {}).flatMap(
    ([role, months]: [string, any]) =>
      (Array.isArray(months) ? months : []).map((month: any) => ({
        month: new Date(month.month + '-01').toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
        role,
        amount: month.amount || 0,
      }))
  );

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Analytics Report</h1>
          <p className="text-gray-600">Comprehensive financial analytics and reports</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 bg-white rounded-lg border border-gray-200 px-4 py-2">
            <Calendar className="w-4 h-4 text-gray-500" />
            <select
              value={period}
              onChange={(e) => {
                setPeriod(e.target.value as typeof period);
                setStartDate('');
                setEndDate('');
              }}
              className="border-none outline-none text-sm font-medium text-gray-700 bg-transparent"
            >
              <option value="all">All Time</option>
              <option value="today">Today</option>
              <option value="week">Last 7 Days</option>
              <option value="month">Last 30 Days</option>
              <option value="year">Last Year</option>
            </select>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="date"
              value={startDate}
              onChange={(e) => {
                setStartDate(e.target.value);
                setPeriod('all');
              }}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
              placeholder="Start Date"
            />
            <input
              type="date"
              value={endDate}
              onChange={(e) => {
                setEndDate(e.target.value);
                setPeriod('all');
              }}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
              placeholder="End Date"
            />
          </div>
          <button
            onClick={fetchAnalytics}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-sky-50 text-sky-600 rounded-lg hover:bg-sky-100 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
      </div>

      {analyticsData.period && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
          <p className="text-sm text-blue-800">
            <strong>Period:</strong> {analyticsData.period}
          </p>
        </div>
      )}

      {/* Trial Balance */}
      {analyticsData.data?.trialBalance && (
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-sky-600" />
            Trial Balance
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <h3 className="text-sm font-semibold text-red-800 mb-2">Debits</h3>
              <p className="text-2xl font-bold text-red-600">
                {formatCurrency(analyticsData.data.trialBalance.debits?.total || 0)}
              </p>
              <div className="mt-2 space-y-1 text-xs text-red-700">
                <p>Expenses: {formatCurrency(analyticsData.data.trialBalance.debits?.expenses || 0)}</p>
                <p>Wallet Balances: {formatCurrency(analyticsData.data.trialBalance.debits?.walletBalances || 0)}</p>
              </div>
            </div>
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h3 className="text-sm font-semibold text-green-800 mb-2">Credits</h3>
              <p className="text-2xl font-bold text-green-600">
                {formatCurrency(analyticsData.data.trialBalance.credits?.total || 0)}
              </p>
              <div className="mt-2 text-xs text-green-700">
                <p>Revenue: {formatCurrency(analyticsData.data.trialBalance.credits?.revenue || 0)}</p>
              </div>
            </div>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="text-sm font-semibold text-blue-800 mb-2">Balance</h3>
              <p className="text-2xl font-bold text-blue-600">
                {formatCurrency(analyticsData.data.trialBalance.balance || 0)}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Income Statement */}
      {analyticsData.data?.incomeStatement && (
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-green-600" />
            Income Statement
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-3">Revenue</h3>
              <div className="space-y-2">
                <div className="flex justify-between p-2 bg-gray-50 rounded">
                  <span className="text-gray-600">Subscriptions</span>
                  <span className="font-semibold text-gray-800">
                    {formatCurrency(analyticsData.data.incomeStatement.revenue?.subscriptions || 0)}
                  </span>
                </div>
                <div className="flex justify-between p-2 bg-gray-50 rounded">
                  <span className="text-gray-600">Courses</span>
                  <span className="font-semibold text-gray-800">
                    {formatCurrency(analyticsData.data.incomeStatement.revenue?.courses || 0)}
                  </span>
                </div>
                <div className="flex justify-between p-3 bg-green-50 rounded border border-green-200">
                  <span className="font-semibold text-green-800">Total Revenue</span>
                  <span className="font-bold text-green-600">
                    {formatCurrency(analyticsData.data.incomeStatement.revenue?.total || 0)}
                  </span>
                </div>
              </div>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-3">Expenses</h3>
              <div className="space-y-2">
                <div className="flex justify-between p-2 bg-gray-50 rounded">
                  <span className="text-gray-600">Commissions</span>
                  <span className="font-semibold text-gray-800">
                    {formatCurrency(analyticsData.data.incomeStatement.expenses?.commissions || 0)}
                  </span>
                </div>
                <div className="flex justify-between p-3 bg-red-50 rounded border border-red-200">
                  <span className="font-semibold text-red-800">Total Expenses</span>
                  <span className="font-bold text-red-600">
                    {formatCurrency(analyticsData.data.incomeStatement.expenses?.total || 0)}
                  </span>
                </div>
                <div className="flex justify-between p-3 bg-blue-50 rounded border border-blue-200 mt-4">
                  <span className="font-semibold text-blue-800">Net Income</span>
                  <span className="font-bold text-blue-600">
                    {formatCurrency(analyticsData.data.incomeStatement.netIncome || 0)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Balance Sheet */}
      {analyticsData.data?.balanceSheet && (
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
            <Wallet className="w-5 h-5 text-purple-600" />
            Balance Sheet
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="text-sm font-semibold text-blue-800 mb-3">Assets</h3>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-blue-700">Cash</span>
                  <span className="font-semibold text-blue-800">
                    {formatCurrency(analyticsData.data.balanceSheet.assets?.cash || 0)}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-blue-700">Accounts Receivable</span>
                  <span className="font-semibold text-blue-800">
                    {formatCurrency(analyticsData.data.balanceSheet.assets?.accountsReceivable || 0)}
                  </span>
                </div>
                <div className="flex justify-between pt-2 border-t border-blue-300">
                  <span className="font-semibold text-blue-800">Total Assets</span>
                  <span className="font-bold text-blue-600">
                    {formatCurrency(analyticsData.data.balanceSheet.assets?.total || 0)}
                  </span>
                </div>
              </div>
            </div>
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <h3 className="text-sm font-semibold text-red-800 mb-3">Liabilities</h3>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-red-700">Accounts Payable</span>
                  <span className="font-semibold text-red-800">
                    {formatCurrency(analyticsData.data.balanceSheet.liabilities?.accountsPayable || 0)}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-red-700">Commissions Payable</span>
                  <span className="font-semibold text-red-800">
                    {formatCurrency(analyticsData.data.balanceSheet.liabilities?.commissionsPayable || 0)}
                  </span>
                </div>
                <div className="flex justify-between pt-2 border-t border-red-300">
                  <span className="font-semibold text-red-800">Total Liabilities</span>
                  <span className="font-bold text-red-600">
                    {formatCurrency(analyticsData.data.balanceSheet.liabilities?.total || 0)}
                  </span>
                </div>
              </div>
            </div>
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h3 className="text-sm font-semibold text-green-800 mb-3">Equity</h3>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-green-700">Retained Earnings</span>
                  <span className="font-semibold text-green-800">
                    {formatCurrency(analyticsData.data.balanceSheet.equity?.retainedEarnings || 0)}
                  </span>
                </div>
                <div className="flex justify-between pt-2 border-t border-green-300">
                  <span className="font-semibold text-green-800">Total Equity</span>
                  <span className="font-bold text-green-600">
                    {formatCurrency(analyticsData.data.balanceSheet.equity?.total || 0)}
                  </span>
                </div>
              </div>
            </div>
          </div>
          <div className="mt-4 p-4 bg-gray-50 rounded-lg">
            <div className="flex justify-between items-center">
              <span className="font-bold text-gray-800">Total (Assets = Liabilities + Equity)</span>
              <span className="text-2xl font-bold text-gray-800">
                {formatCurrency(analyticsData.data.balanceSheet.total || 0)}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Revenue Breakdown */}
      {(analyticsData.data?.revenue || analyticsData.data?.expenses) && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {analyticsData.data?.revenue && (
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4">Revenue Breakdown</h2>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={revenueChartData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value }) => `${name}: ${formatCurrency(value)}`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {revenueChartData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: number | undefined) => value ? formatCurrency(value) : '₹0'} />
                </PieChart>
              </ResponsiveContainer>
              <div className="mt-4 space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subscriptions</span>
                  <span className="font-semibold">
                    {formatCurrency(analyticsData.data.revenue?.subscriptions?.total || 0)} ({analyticsData.data.revenue?.subscriptions?.count || 0} transactions)
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Courses</span>
                  <span className="font-semibold">
                    {formatCurrency(analyticsData.data.revenue?.courses?.total || 0)} ({analyticsData.data.revenue?.courses?.count || 0} transactions)
                  </span>
                </div>
                <div className="flex justify-between pt-2 border-t">
                  <span className="font-bold text-gray-800">Total Revenue</span>
                  <span className="font-bold text-gray-800">
                    {formatCurrency(analyticsData.data.revenue?.total || 0)} ({analyticsData.data.revenue?.totalTransactions || 0} transactions)
                  </span>
                </div>
              </div>
            </div>
          )}

          {analyticsData.data?.expenses && (
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4">Expenses by Role</h2>
              {expenseByRoleData.length > 0 ? (
                <>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={expenseByRoleData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis dataKey="role" stroke="#6b7280" />
                      <YAxis stroke="#6b7280" />
                      <Tooltip formatter={(value: number | undefined) => value ? formatCurrency(value) : '₹0'} />
                      <Bar dataKey="amount" fill="#ef4444" radius={[8, 8, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                  <div className="mt-4 space-y-2">
                    {expenseByRoleData.map((item) => (
                      <div key={item.role} className="flex justify-between">
                        <span className="text-gray-600">{item.role}</span>
                        <span className="font-semibold">{formatCurrency(item.amount)}</span>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <div className="py-12 text-center">
                  <p className="text-gray-500">No expense data by role available</p>
                </div>
              )}
              <div className="mt-4 pt-4 border-t">
                <div className="flex justify-between">
                  <span className="font-bold text-gray-800">Total Expenses</span>
                  <span className="font-bold text-gray-800">
                    {formatCurrency(analyticsData.data.expenses?.total || 0)} ({analyticsData.data.expenses?.count || 0} transactions)
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Commission Distribution */}
      {analyticsData.data?.commissionDistribution && (
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Commission Distribution</h2>
          {commissionDistributionData.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              {commissionDistributionData.map((item, index) => (
                <div
                  key={item.role}
                  className="p-4 rounded-lg border"
                  style={{
                    backgroundColor: `${CHART_COLORS[index % CHART_COLORS.length]}15`,
                    borderColor: `${CHART_COLORS[index % CHART_COLORS.length]}40`,
                  }}
                >
                  <h3 className="font-semibold text-gray-800 mb-2">{item.role}</h3>
                  <p className="text-2xl font-bold mb-1" style={{ color: CHART_COLORS[index % CHART_COLORS.length] }}>
                    {formatCurrency(item.total)}
                  </p>
                  <div className="text-xs text-gray-600 space-y-1">
                    <p>{item.transactions} transactions</p>
                    <p>{item.users} unique users</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-12 text-center mb-6">
              <p className="text-gray-500">No commission distribution data available</p>
            </div>
          )}
          <div className="p-4 bg-gray-50 rounded-lg">
            <div className="flex justify-between">
              <span className="font-bold text-gray-800">Total Commissions</span>
              <span className="text-xl font-bold text-gray-800">
                {formatCurrency(analyticsData.data.commissionDistribution.total || 0)}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Wallet Balances */}
      {analyticsData.data?.walletBalances && (
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Wallet Balances</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            {Object.entries(analyticsData.data.walletBalances)
              .filter(([key]) => key !== 'total')
              .map(([role, data]: [string, any], index) => (
                <div
                  key={role}
                  className="p-4 rounded-lg border"
                  style={{
                    backgroundColor: `${CHART_COLORS[index % CHART_COLORS.length]}15`,
                    borderColor: `${CHART_COLORS[index % CHART_COLORS.length]}40`,
                  }}
                >
                  <h3 className="font-semibold text-gray-800 mb-3 capitalize">{role.replace(/([A-Z])/g, ' $1').trim()}</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Balance</span>
                      <span className="font-semibold" style={{ color: CHART_COLORS[index % CHART_COLORS.length] }}>
                        {formatCurrency(data?.totalBalance || 0)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Earned</span>
                      <span className="font-semibold text-gray-800">{formatCurrency(data?.totalEarned || 0)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Withdrawn</span>
                      <span className="font-semibold text-gray-800">{formatCurrency(data?.totalWithdrawn || 0)}</span>
                    </div>
                    <div className="pt-2 border-t">
                      <span className="text-gray-600">{data?.count || 0} users</span>
                    </div>
                  </div>
                </div>
              ))}
          </div>
          {analyticsData.data.walletBalances.total && (
            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Total Balance</p>
                  <p className="text-xl font-bold text-gray-800">
                    {formatCurrency(analyticsData.data.walletBalances.total.balance || 0)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Total Earned</p>
                  <p className="text-xl font-bold text-gray-800">
                    {formatCurrency(analyticsData.data.walletBalances.total.earned || 0)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Total Withdrawn</p>
                  <p className="text-xl font-bold text-gray-800">
                    {formatCurrency(analyticsData.data.walletBalances.total.withdrawn || 0)}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Money Distribution Chart */}
      {moneyDistributionChartData.length > 0 && (
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Money Distribution Over Time</h2>
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={moneyDistributionChartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="month" stroke="#6b7280" />
              <YAxis stroke="#6b7280" />
              <Tooltip formatter={(value: number | undefined) => value ? formatCurrency(value) : '₹0'} />
              <Legend />
              {Array.from(new Set(moneyDistributionChartData.map((d) => d.role))).map((role, index) => (
                <Line
                  key={role}
                  type="monotone"
                  dataKey="amount"
                  data={moneyDistributionChartData.filter((d) => d.role === role)}
                  name={role}
                  stroke={CHART_COLORS[index % CHART_COLORS.length]}
                  strokeWidth={3}
                  dot={{ fill: CHART_COLORS[index % CHART_COLORS.length], r: 5 }}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
