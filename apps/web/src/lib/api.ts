import axios from 'axios';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:3001/api';

const api = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
});

export interface Stats {
  totalSpend: number;
  totalInvoices: number;
  documentsUploaded: number;
  avgInvoiceValue: number;
}

export interface InvoiceTrend {
  month: string;
  monthKey: string;
  invoiceCount: number;
  totalValue: number;
}

export interface VendorData {
  vendorId: string;
  vendorName: string;
  totalSpend: number;
  invoiceCount: number;
}

export interface CategorySpend {
  category: string;
  totalSpend: number;
  invoiceCount: number;
}

export interface CashOutflow {
  date: string;
  dateLabel: string;
  amount: number;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  vendorId: string;
  customerId?: string;
  invoiceDate: string;
  dueDate?: string;
  status: string;
  currency: string;
  subtotal: number;
  taxAmount: number;
  totalAmount: number;
  amountPaid: number;
  amountDue: number;
  category?: string;
  description?: string;
  vendor: {
    name: string;
    vendorId: string;
  };
  customer?: {
    name: string;
  };
  _count?: {
    lineItems: number;
    payments: number;
  };
}

export interface InvoicesResponse {
  data: Invoice[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  sql?: string;
  results?: any[];
}

export interface ChatResponse {
  sql: string;
  results: any[];
  error?: string;
}

// API functions with fallback data
export const fetchStats = async (): Promise<Stats> => {
  try {
    const { data } = await api.get('/stats');
    return data;
  } catch (error) {
    console.warn('Failed to fetch stats, using fallback data');
    return {
      totalSpend: 12679.25,
      totalInvoices: 64,
      documentsUploaded: 17,
      avgInvoiceValue: 2455.00,
    };
  }
};

export const fetchInvoiceTrends = async (months: number = 12): Promise<InvoiceTrend[]> => {
  try {
    const { data } = await api.get('/invoice-trends', { params: { months } });
    return data;
  } catch (error) {
    console.warn('Failed to fetch invoice trends, using fallback data');
    return [
      { month: 'Jan 2025', monthKey: '2025-01', invoiceCount: 15, totalValue: 8500 },
      { month: 'Feb 2025', monthKey: '2025-02', invoiceCount: 45, totalValue: 12000 },
      { month: 'Mar 2025', monthKey: '2025-03', invoiceCount: 38, totalValue: 9200 },
      { month: 'Apr 2025', monthKey: '2025-04', invoiceCount: 22, totalValue: 7800 },
      { month: 'May 2025', monthKey: '2025-05', invoiceCount: 28, totalValue: 10500 },
      { month: 'Jun 2025', monthKey: '2025-06', invoiceCount: 42, totalValue: 11200 },
      { month: 'Jul 2025', monthKey: '2025-07', invoiceCount: 35, totalValue: 9800 },
      { month: 'Aug 2025', monthKey: '2025-08', invoiceCount: 25, totalValue: 8200 },
      { month: 'Sep 2025', monthKey: '2025-09', invoiceCount: 32, totalValue: 10100 },
      { month: 'Oct 2025', monthKey: '2025-10', invoiceCount: 47, totalValue: 8675.25 },
      { month: 'Nov 2025', monthKey: '2025-11', invoiceCount: 38, totalValue: 9400 },
      { month: 'Dec 2025', monthKey: '2025-12', invoiceCount: 20, totalValue: 7300 },
    ];
  }
};

export const fetchTopVendors = async (): Promise<VendorData[]> => {
  try {
    const { data } = await api.get('/vendors/top10');
    return data;
  } catch (error) {
    console.warn('Failed to fetch top vendors, using fallback data');
    return [
      { vendorId: 'V1', vendorName: 'AcmeCorp', totalSpend: 45000, invoiceCount: 12 },
      { vendorId: 'V2', vendorName: 'Test Solutions', totalSpend: 38000, invoiceCount: 9 },
      { vendorId: 'V3', vendorName: 'PrimeVendors', totalSpend: 32000, invoiceCount: 8 },
      { vendorId: 'V4', vendorName: 'DeltaServices', totalSpend: 28000, invoiceCount: 7 },
      { vendorId: 'V5', vendorName: 'OmegaLtd', totalSpend: 52000, invoiceCount: 15 },
      { vendorId: 'V6', vendorName: 'GlobalSupply', totalSpend: 22000, invoiceCount: 6 },
      { vendorId: 'V7', vendorName: 'AlphaGroup', totalSpend: 18000, invoiceCount: 5 },
    ];
  }
};

export const fetchCategorySpend = async (): Promise<CategorySpend[]> => {
  try {
    const { data } = await api.get('/category-spend');
    return data;
  } catch (error) {
    console.warn('Failed to fetch category spend, using fallback data');
    return [
      { category: 'Operations', totalSpend: 1000, invoiceCount: 5 },
      { category: 'Marketing', totalSpend: 7250, invoiceCount: 12 },
      { category: 'Facilities', totalSpend: 1000, invoiceCount: 3 },
    ];
  }
};

export const fetchCashOutflow = async (days: number = 30): Promise<CashOutflow[]> => {
  try {
    const { data } = await api.get('/cash-outflow', { params: { days } });
    return data;
  } catch (error) {
    console.warn('Failed to fetch cash outflow, using fallback data');
    return [];
  }
};

export const fetchInvoices = async (params?: {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}): Promise<InvoicesResponse> => {
  try {
    const { data } = await api.get('/invoices', { params });
    return data;
  } catch (error) {
    console.warn('Failed to fetch invoices, using fallback data');
    return {
      data: [],
      pagination: {
        page: 1,
        limit: 50,
        total: 0,
        totalPages: 0,
      },
    };
  }
};

export const sendChatMessage = async (query: string): Promise<ChatResponse> => {
  const { data } = await api.post('/chat-with-data', { query });
  return data;
};

export default api;
