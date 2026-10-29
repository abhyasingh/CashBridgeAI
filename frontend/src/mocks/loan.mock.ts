export interface LoanOffer {
  offerId: string;
  lenderName: string;
  lenderType: string;
  rbiRegulated: boolean;
  sanctionedAmount: number; // ₹2,30,000 (₹2.3L)
  tenureDays: number; // 21 days
  interestRateFlatPercent: number; // 1.2% flat
  interestAmount: number; // ₹2,760
  processingFeePercent: number; // 0.2%
  processingFeeAmount: number; // ₹460
  gstOnFee: number; // ₹83 (18%)
  netDisbursalAmount: number; // ₹2,29,457
  totalRepayableAmount: number; // ₹2,32,760
  linkedInvoiceNumber: string; // 'INV-2026-089'
  linkedCustomerName: string; // 'Kapoor Retailers'
  linkedInvoiceAmount: number; // ₹1,85,000
  autoRepayMechanism: string;
  estimatedRepaymentDate: string; // '22 Nov 2026'
  keyFactsStatement: {
    labelEn: string;
    labelHi: string;
    valueEn: string;
    valueHi: string;
  }[];
}

export const mockLoanOffer: LoanOffer = {
  offerId: 'CB-LN-2026-8812',
  lenderName: 'Shivalik Small Finance Bank',
  lenderType: 'RBI Licensed Small Finance Bank',
  rbiRegulated: true,
  sanctionedAmount: 230000,
  tenureDays: 21,
  interestRateFlatPercent: 1.2,
  interestAmount: 2760,
  processingFeePercent: 0.2,
  processingFeeAmount: 460,
  gstOnFee: 83,
  netDisbursalAmount: 229457,
  totalRepayableAmount: 232760,
  linkedInvoiceNumber: 'INV-2026-089',
  linkedCustomerName: 'Kapoor Retailers',
  linkedInvoiceAmount: 185000,
  autoRepayMechanism: 'Auto-debit triggered upon invoice realization in HDFC current account',
  estimatedRepaymentDate: '22 Nov 2026',
  keyFactsStatement: [
    {
      labelEn: 'Sanctioned Micro-Credit',
      labelHi: 'स्वीकृत लोन राशि',
      valueEn: '₹2,30,000',
      valueHi: '₹2,30,000',
    },
    {
      labelEn: 'Bridge Tenure',
      labelHi: 'लोन अवधि',
      valueEn: '21 Days (Till Invoice Clears)',
      valueHi: '21 दिन (बिल भुगतान तक)',
    },
    {
      labelEn: 'Interest Rate (Flat)',
      labelHi: 'ब्याज दर',
      valueEn: '1.20% (₹2,760 total)',
      valueHi: '1.20% (कुल ₹2,760)',
    },
    {
      labelEn: 'Processing Fee + GST',
      labelHi: 'प्रोसेसिंग शुल्क + GST',
      valueEn: '₹543 (Deducted upfront)',
      valueHi: '₹543 (पहले ही काटा जाएगा)',
    },
    {
      labelEn: 'Net In Bank Account',
      labelHi: 'खाते में आने वाली राशि',
      valueEn: '₹2,29,457',
      valueHi: '₹2,29,457',
    },
    {
      labelEn: 'Total Repayment',
      labelHi: 'कुल चुकौती',
      valueEn: '₹2,32,760',
      valueHi: '₹2,32,760',
    },
    {
      labelEn: 'Automatic Settlement',
      labelHi: 'ऑटो-सेटलमेंट',
      valueEn: 'Auto-settled when Kapoor Retailers pays INV-089',
      valueHi: 'कपूर रिटेलर्स के भुगतान करते ही स्वतः कट जाएगा',
    },
  ],
};
