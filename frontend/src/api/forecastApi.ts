import { apiRequest, type ApiResponse } from './client';
import { mockForecastData, mockLiveTicker, type ForecastDataPoint, type LiveTickerItem } from '../mocks/forecast.mock';
import { mockShortfallAnalysis, type ShortfallAnalysis } from '../mocks/shortfall.mock';

export const forecastApi = {
  get13WeekForecast: async (businessId: string = 'MSME0002'): Promise<ApiResponse<ForecastDataPoint[]>> => {
    return apiRequest<ForecastDataPoint[]>(
      `/business/${businessId}/forecast`,
      { method: 'GET' },
      mockForecastData
    );
  },

  getShortfallAnalysis: async (alertId: string = 'alt_gap_01', lang: string = 'en'): Promise<ApiResponse<ShortfallAnalysis>> => {
    return apiRequest<ShortfallAnalysis>(
      `/alerts/${alertId}/explain?lang=${lang}`,
      { method: 'GET' },
      mockShortfallAnalysis
    );
  },

  getLiveTicker: async (): Promise<ApiResponse<LiveTickerItem[]>> => {
    return apiRequest<LiveTickerItem[]>(
      '/alerts/ticker',
      { method: 'GET' },
      mockLiveTicker
    );
  },
};
