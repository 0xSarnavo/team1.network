import { homeService } from '@/lib/services/home.service';
import { apiSuccess, apiError } from '@/lib/helpers/api-response';

// ============================================================
// GET /api/home
// Public home page data (cached)
// ============================================================

export async function GET() {
  try {
    const data = await homeService.getHomePage();
    return apiSuccess(data);
  } catch (error) {
    return apiError(error);
  }
}
