export interface ForecastDataPoint {
  day: number;
  week: number;
  label: string;
  dateStr: string;
  p10: number; // pessimistic / stress
  p50: number; // expected baseline
  p90: number; // optimistic
  buffer: number;
  deficitAmount: number; // shortfall below buffer (0 if none)
  isDeficit: boolean;
  eventNote?: string;
}

export interface LiveTickerItem {
  id: string;
  severity: 'critical' | 'warning' | 'info';
  messageEn: string;
  messageHi: string;
  timeLabel: string;
}

export const mockLiveTicker: LiveTickerItem[] = [
  {
    id: 'tick_1',
    severity: 'critical',
    messageEn: 'Day 18 Deficit Alert: ₹2.1L gap below safety buffer (82% probability)',
    messageHi: '18वें दिन ₹2.1 लाख की कमी का अनुमान (82% संभावना)',
    timeLabel: 'Forecast Model',
  },
  {
    id: 'tick_2',
    severity: 'warning',
    messageEn: 'Kapoor Retailers (₹1.85L) delayed: historical lag avg 41 days',
    messageHi: 'कपूर रिटेलर्स (₹1.85 लाख) में देरी: आमतौर पर 41 दिन देर से भुगतान',
    timeLabel: 'Invoice Delay AI',
  },
  {
    id: 'tick_3',
    severity: 'info',
    messageEn: 'GST Q3 payment ₹1.40L scheduled on Day 15 (auto-synced from Tally)',
    messageHi: '15वें दिन ₹1.40 लाख GST भुगतान निर्धारित (Tally से सिंक)',
    timeLabel: 'Statutory Outflow',
  },
];

// Generate 13-week forecast points (total 91 days; sampled daily for first 30 days, then weekly)
function generate13WeekForecast(): ForecastDataPoint[] {
  const points: ForecastDataPoint[] = [];
  const buffer = 250000;
  const startDate = new Date(2026, 10, 1); // Nov 1, 2026

  // Key cash points
  // Day 0: 4,85,000
  // Day 10: 2,80,000 (wage outflow)
  // Day 15: 1,40,000 (GST outflow)
  // Day 18: 40,000 (Shortfall peak: deficit = 2,10,000 below buffer)
  // Day 24: 1,60,000 (Awadh Fabrics clears)
  // Day 38: 3,45,000 (Kapoor Retailers clears)
  // Week 8: 4,20,000
  // Week 13: 5,60,000

  for (let day = 0; day <= 91; day++) {
    const curDate = new Date(startDate);
    curDate.setDate(curDate.getDate() + day);
    const dateFormatted = curDate.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
    const week = Math.floor(day / 7) + 1;

    let p50 = 485000;
    let eventNote: string | undefined = undefined;

    if (day <= 7) {
      p50 = 485000 - day * 18000;
    } else if (day <= 10) {
      p50 = 360000 - (day - 7) * 26600;
      if (day === 10) eventNote = 'Worker Wages (₹1.15L)';
    } else if (day <= 15) {
      p50 = 280000 - (day - 10) * 28000;
      if (day === 15) eventNote = 'GST Settlement (₹1.40L)';
    } else if (day <= 18) {
      p50 = 140000 - (day - 15) * 33333; // hits 40,000 at day 18
      if (day === 18) eventNote = 'Shortfall Peak: -₹2.1L buffer gap';
    } else if (day <= 24) {
      p50 = 40000 + (day - 18) * 20000; // Awadh Fabrics starts paying
      if (day === 24) eventNote = 'Awadh Fabrics Paid (₹1.20L)';
    } else if (day <= 38) {
      p50 = 160000 + (day - 24) * 13200; // Kapoor Retailers clears at 38
      if (day === 38) eventNote = 'Kapoor Retailers Paid (₹1.85L)';
    } else {
      // Normalizing up to week 13
      const daysAfter38 = day - 38;
      p50 = 345000 + daysAfter38 * 4000;
    }

    const spread = Math.min(120000, 35000 + day * 1000);
    const p10 = Math.round(p50 - spread);
    const p90 = Math.round(p50 + spread * 0.95);
    const isDeficit = p50 < buffer;
    const deficitAmount = isDeficit ? buffer - p50 : 0;

    // Daily for first 30 days, then weekly steps (day % 7 === 0 or day === 91)
    if (day <= 30 || day % 7 === 0 || day === 91) {
      points.push({
        day,
        week,
        label: day === 0 ? 'Today' : `Day ${day}`,
        dateStr: dateFormatted,
        p10,
        p50,
        p90,
        buffer,
        deficitAmount,
        isDeficit,
        eventNote,
      });
    }
  }

  return points;
}

export const mockForecastData: ForecastDataPoint[] = generate13WeekForecast();
