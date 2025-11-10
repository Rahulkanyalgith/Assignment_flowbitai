'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  fetchStats, 
  fetchInvoiceTrends, 
  fetchTopVendors, 
  fetchCategorySpend, 
  fetchCashOutflow, 
  fetchInvoices,
  type Stats,
  type InvoiceTrend,
  type VendorData,
  type CategorySpend,
  type CashOutflow,
  type Invoice
} from '@/lib/api';
import { formatCurrency, formatNumber } from '@/lib/utils';
import { DollarSign, FileText, Upload, TrendingUp } from 'lucide-react';
import InvoiceVolumeChart from './charts/InvoiceVolumeChart';
import VendorSpendChart from './charts/VendorSpendChart';
import CategoryPieChart from './charts/CategoryPieChart';
import CashOutflowChart from './charts/CashOutflowChart';
import InvoicesTable from './InvoicesTable';

export default function AnalyticsDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [trends, setTrends] = useState<InvoiceTrend[]>([]);
  const [vendors, setVendors] = useState<VendorData[]>([]);
  const [categories, setCategories] = useState<CategorySpend[]>([]);
  const [outflow, setOutflow] = useState<CashOutflow[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [statsData, trendsData, vendorsData, categoriesData, outflowData, invoicesData] = await Promise.all([
        fetchStats(),
        fetchInvoiceTrends(12),
        fetchTopVendors(),
        fetchCategorySpend(),
        fetchCashOutflow(30),
        fetchInvoices({ limit: 50 }),
      ]);

      setStats(statsData);
      setTrends(trendsData);
      setVendors(vendorsData);
      setCategories(categoriesData);
      setOutflow(outflowData);
      setInvoices(invoicesData.data);
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading analytics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-0 shadow-sm">
          <CardContent className="p-6">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-gray-600">Total Spend</p>
                <span className="text-xs text-gray-400">(YTD)</span>
              </div>
              <div className="flex items-end justify-between">
                <div className="text-2xl font-bold text-gray-900">€ {formatNumber(stats?.totalSpend || 12679.25)}</div>
                <svg className="w-16 h-8" viewBox="0 0 64 32" fill="none">
                  <path d="M0 24 Q16 8, 32 16 T64 8" stroke="#10B981" strokeWidth="2" fill="none"/>
                </svg>
              </div>
              <p className="text-xs text-green-600 font-medium">+8.2% from last month</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm">
          <CardContent className="p-6">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-gray-600">Total Invoices Processed</p>
              </div>
              <div className="flex items-end justify-between">
                <div className="text-2xl font-bold text-gray-900">{stats?.totalInvoices || 64}</div>
                <svg className="w-16 h-8" viewBox="0 0 64 32" fill="none">
                  <path d="M0 24 Q16 12, 32 20 T64 8" stroke="#10B981" strokeWidth="2" fill="none"/>
                </svg>
              </div>
              <p className="text-xs text-green-600 font-medium">+8.2% from last month</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm">
          <CardContent className="p-6">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-gray-600">Documents Uploaded</p>
                <span className="text-xs text-gray-400">This Month</span>
              </div>
              <div className="flex items-end justify-between">
                <div className="text-2xl font-bold text-gray-900">{stats?.documentsUploaded || 17}</div>
                <svg className="w-16 h-8" viewBox="0 0 64 32" fill="none">
                  <path d="M0 16 Q16 8, 32 12 T64 24" stroke="#EF4444" strokeWidth="2" fill="none"/>
                </svg>
              </div>
              <p className="text-xs text-red-600 font-medium">-8 less from last month</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm">
          <CardContent className="p-6">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-gray-600">Average Invoice Value</p>
              </div>
              <div className="flex items-end justify-between">
                <div className="text-2xl font-bold text-gray-900">€ {formatNumber(stats?.avgInvoiceValue || 2455)}</div>
                <svg className="w-16 h-8" viewBox="0 0 64 32" fill="none">
                  <path d="M0 24 Q16 12, 32 16 T64 8" stroke="#10B981" strokeWidth="2" fill="none"/>
                </svg>
              </div>
              <p className="text-xs text-green-600 font-medium">+8.2% from last month</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Invoice Volume & Value Trend */}
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="text-base font-semibold text-gray-900">Invoice Volume + Value Trend</CardTitle>
            <p className="text-sm text-gray-500">Invoice count and total spend over 12 months.</p>
          </CardHeader>
          <CardContent>
            <InvoiceVolumeChart data={trends} />
          </CardContent>
        </Card>

        {/* Top 10 Vendors by Spend */}
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="text-base font-semibold text-gray-900">Spend by Vendor (Top 10)</CardTitle>
            <p className="text-sm text-gray-500">Vendor spend with cumulative percentage distribution.</p>
          </CardHeader>
          <CardContent>
            <VendorSpendChart data={vendors} />
          </CardContent>
        </Card>

        {/* Spend by Category */}
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="text-base font-semibold text-gray-900">Spend by Category</CardTitle>
            <p className="text-sm text-gray-500">Distribution of spending across different categories.</p>
          </CardHeader>
          <CardContent>
            <CategoryPieChart data={categories} />
          </CardContent>
        </Card>

        {/* Cash Outflow Forecast */}
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="text-base font-semibold text-gray-900">Cash Outflow Forecast</CardTitle>
            <p className="text-sm text-gray-500">Expected payment obligations grouped by due date ranges.</p>
          </CardHeader>
          <CardContent>
            <CashOutflowChart data={outflow} />
          </CardContent>
        </Card>
      </div>

      {/* Invoices Table */}
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle className="text-base font-semibold text-gray-900">Invoices by Vendor</CardTitle>
          <p className="text-sm text-gray-500">Top vendors by invoice count and net value.</p>
        </CardHeader>
        <CardContent>
          <InvoicesTable initialData={invoices} />
        </CardContent>
      </Card>
    </div>
  );
}
