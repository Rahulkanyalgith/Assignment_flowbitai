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

// API functions
export const fetchStats = async (): Promise<Stats> => {
  const { data } = await api.get('/stats');
  return data;
};

export const fetchInvoiceTrends = async (months: number = 12): Promise<InvoiceTrend[]> => {
  const { data } = await api.get('/invoice-trends', { params: { months } });
  return data;
};

export const fetchTopVendors = async (): Promise<VendorData[]> => {
  const { data } = await api.get('/vendors/top10');
  return data;
};

export const fetchCategorySpend = async (): Promise<CategorySpend[]> => {
  const { data } = await api.get('/category-spend');
  return data;
};

export const fetchCashOutflow = async (days: number = 30): Promise<CashOutflow[]> => {
  const { data } = await api.get('/cash-outflow', { params: { days } });
  return data;
};

export const fetchInvoices = async (params?: {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}): Promise<InvoicesResponse> => {
  const { data } = await api.get('/invoices', { params });
  return data;
};

export const sendChatMessage = async (query: string): Promise<ChatResponse> => {
  const { data } = await api.post('/chat-with-data', { query });
  return data;
};

export default api;
