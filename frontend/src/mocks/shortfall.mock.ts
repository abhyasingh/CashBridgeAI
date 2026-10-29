export interface ShortfallFactor {
  id: string;
  category: 'invoice_delay' | 'tax_statutory' | 'payroll' | 'supplier';
  titleEn: string;
  titleHi: string;
  descriptionEn: string;
  descriptionHi: string;
  impactAmount: number;
  percentageContribution: number;
  severity: 'high' | 'medium' | 'low';
}

export interface ShortfallAnalysis {
  shortfallDay: number;
  shortfallDate: string;
  runwayDays: number;
  shortfallAmount: number;
  bufferThreshold: number;
  projectedBalance: number;
  confidenceScore: number; // 82%
  riskLevel: 'HIGH_RISK' | 'MEDIUM_RISK' | 'STABLE';
  summaryEn: string;
  summaryHi: string;
  factors: ShortfallFactor[];
}

export const mockShortfallAnalysis: ShortfallAnalysis = {
  shortfallDay: 18,
  shortfallDate: '17 Nov 2026',
  runwayDays: 18,
  shortfallAmount: 210000, // ₹2.1L
  bufferThreshold: 250000, // ₹2.5L
  projectedBalance: 40000, // drops to ₹40K
  confidenceScore: 82, // 82% confidence
  riskLevel: 'HIGH_RISK',
  summaryEn: 'Day 18 Shortfall Alert: Cash balance will plunge ₹2,10,000 below your safe operational buffer (82% model confidence).',
  summaryHi: '18वें दिन पैसे की कमी की चेतावनी: आपका बैंक बैलेंस सुरक्षित बफर से ₹2,10,000 नीचे चला जाएगा (82% मॉडल सटीकता)।',
  factors: [
    {
      id: 'fact_01',
      category: 'invoice_delay',
      titleEn: 'Kapoor Retailers Invoice #INV-089 Delayed',
      titleHi: 'कपूर रिटेलर्स का बिल #INV-089 अटका हुआ',
      descriptionEn: 'Payment of ₹1,85,000 was due on Day -7. Based on their 12-month payment trail (avg 41 days delay), collection is postponed to Day 38.',
      descriptionHi: '₹1,85,000 का भुगतान 7 दिन पहले आना था। पिछले 12 महीनों के रिकॉर्ड (औसत 41 दिन की देरी) के अनुसार यह 38वें दिन तक आने की उम्मीद है।',
      impactAmount: 185000,
      percentageContribution: 45,
      severity: 'high',
    },
    {
      id: 'fact_02',
      category: 'tax_statutory',
      titleEn: 'Quarterly GST & Advance Tax Due on 15th',
      titleHi: '15 तारीख को तिमाही GST और अग्रिम कर देय',
      descriptionEn: 'Mandatory statutory tax remittance of ₹1,40,000 scheduled for Day 15. Cannot be deferred without interest penalties.',
      descriptionHi: '15वें दिन ₹1,40,000 का सरकारी टैक्स भुगतान अनिवार्य है। इसे टालने पर ब्याज और जुर्माना लगेगा।',
      impactAmount: 140000,
      percentageContribution: 32,
      severity: 'medium',
    },
    {
      id: 'fact_03',
      category: 'payroll',
      titleEn: 'Workshop Artisans & Tailors Monthly Wages',
      titleHi: 'कारीगरों और दर्जियों का मासिक वेतन',
      descriptionEn: 'Factory worker wage disbursement of ₹1,15,000 scheduled for Day 10 to keep Chikan embroidery production on schedule.',
      descriptionHi: 'कारखाने के कामगारों और चिकनकारी कारीगरों को 10वें दिन ₹1,15,000 का वेतन भुगतान आवश्यक है।',
      impactAmount: 115000,
      percentageContribution: 23,
      severity: 'medium',
    },
  ],
};
