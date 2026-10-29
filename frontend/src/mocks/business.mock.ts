export interface BusinessProfile {
  id: string;
  name: string;
  ownerName: string;
  location: string;
  category: string;
  gstin: string;
  bankAccount: {
    bankName: string;
    accountNumberMasked: string;
    currentBalance: number;
    safeBufferThreshold: number;
    lastSyncedAt: string;
  };
  connectedSources: {
    id: string;
    name: string;
    type: 'accounting' | 'banking' | 'file';
    status: 'connected' | 'disconnected' | 'syncing';
    lastSync: string;
    itemCount: number;
  }[];
}

export const mockBusinessProfile: BusinessProfile = {
  id: 'biz_sharma_001',
  name: 'Sharma Garments',
  ownerName: 'Ramesh Sharma',
  location: 'Aminabad, Lucknow, Uttar Pradesh',
  category: 'Textiles & Chikan Kurta Wholesale',
  gstin: '09AABCU9603R1ZM',
  bankAccount: {
    bankName: 'HDFC Bank (Hazratganj Branch)',
    accountNumberMasked: '•••• •••• 4912',
    currentBalance: 485000,
    safeBufferThreshold: 250000,
    lastSyncedAt: 'Today, 10:15 AM',
  },
  connectedSources: [
    {
      id: 'src_tally',
      name: 'Tally Prime 4.1',
      type: 'accounting',
      status: 'connected',
      lastSync: 'Today, 09:30 AM',
      itemCount: 14,
    },
    {
      id: 'src_aa_hdfc',
      name: 'Account Aggregator (HDFC Bank)',
      type: 'banking',
      status: 'connected',
      lastSync: 'Today, 10:15 AM',
      itemCount: 124,
    },
    {
      id: 'src_quickbooks',
      name: 'QuickBooks Online',
      type: 'accounting',
      status: 'disconnected',
      lastSync: 'Not linked',
      itemCount: 0,
    },
    {
      id: 'src_csv',
      name: 'Tally / Bank Statement CSV',
      type: 'file',
      status: 'disconnected',
      lastSync: 'Not uploaded',
      itemCount: 0,
    },
  ],
};
