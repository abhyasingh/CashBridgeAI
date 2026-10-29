import { apiRequest, type ApiResponse } from './client';
import { mockBusinessProfile, type BusinessProfile } from '../mocks/business.mock';

export const businessApi = {
  getProfile: async (businessId: string = 'MSME0002'): Promise<ApiResponse<BusinessProfile>> => {
    return apiRequest<BusinessProfile>(
      `/business/${businessId}/profile`,
      { method: 'GET' },
      mockBusinessProfile
    );
  },

  connectSource: async (sourceId: string): Promise<ApiResponse<{ sourceId: string; status: 'connected' }>> => {
    const cleanSource = sourceId.replace('src_', '');
    return apiRequest<{ sourceId: string; status: 'connected' }>(
      `/connect/${cleanSource}`,
      { method: 'POST' },
      { sourceId, status: 'connected' }
    );
  },
};
