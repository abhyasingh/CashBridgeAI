import { apiRequest, type ApiResponse } from './client';
import { mockLoanOffer, type LoanOffer } from '../mocks/loan.mock';

export interface ApplyLoanPayload {
  offerId: string;
  consentAgreed: boolean;
  linkedInvoiceNumber: string;
  businessId?: string;
}

export interface ApplyLoanResult {
  loanId: string;
  disbursedAmount: number;
  disbursalTimestamp: string;
  targetAccountMasked: string;
  status: 'DISBURSED' | 'PROCESSING';
  repaymentDueDate: string;
}

export const loanApi = {
  getOffer: async (businessId: string = 'MSME0002'): Promise<ApiResponse<LoanOffer>> => {
    return apiRequest<LoanOffer>(
      `/loan/offer?business_id=${businessId}`,
      { method: 'GET' },
      mockLoanOffer
    );
  },

  applyForLoan: async (payload: ApplyLoanPayload): Promise<ApiResponse<ApplyLoanResult>> => {
    const fallback: ApplyLoanResult = {
      loanId: 'LN-DISB-2026-9901',
      disbursedAmount: 229457,
      disbursalTimestamp: new Date().toISOString(),
      targetAccountMasked: 'HDFC Bank •••• 4912',
      status: 'DISBURSED',
      repaymentDueDate: '22 Nov 2026',
    };

    return apiRequest<ApplyLoanResult>(
      '/loan/accept',
      {
        method: 'POST',
        body: JSON.stringify({
          offerId: payload.offerId,
          consentAgreed: payload.consentAgreed,
          linkedInvoiceNumber: payload.linkedInvoiceNumber,
          businessId: payload.businessId || 'MSME0002',
        }),
      },
      fallback
    );
  },
};
