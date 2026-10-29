import { apiRequest, type ApiResponse } from './client';
import { mockInvoices, type InvoiceItem } from '../mocks/invoices.mock';

export const invoiceApi = {
  getInvoices: async (businessId: string = 'MSME0002'): Promise<ApiResponse<InvoiceItem[]>> => {
    return apiRequest<InvoiceItem[]>(
      `/business/${businessId}/receivables`,
      { method: 'GET' },
      mockInvoices
    );
  },

  getInvoiceById: async (id: string): Promise<ApiResponse<InvoiceItem | undefined>> => {
    const fallback = mockInvoices.find((inv) => inv.id === id);
    return apiRequest<InvoiceItem | undefined>(
      `/invoices/${id}`,
      { method: 'GET' },
      fallback
    );
  },
};
