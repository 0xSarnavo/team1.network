import { withAuth } from '@/lib/middleware/auth.middleware';
import { membershipApplicationService } from '@/lib/services/membership-application.service';
import { apiCreated, apiError } from '@/lib/helpers/api-response';
import { z } from 'zod';

const applySchema = z.object({
  fullName: z.string().min(1).max(200),
  email: z.string().email().max(255),
  telegram: z.string().min(1).max(100),
  xHandle: z.string().min(1).max(100),
  country: z.string().min(1).max(100),
  state: z.string().min(1).max(100),
  bio: z.string().min(10),
  resumeLink: z.string().url().max(500),
  skills: z.array(z.string().min(1)).min(1),
  whyJoin: z.string().min(10),
  howHelp: z.string().min(10),
  expectations: z.string().min(10),
  hoursWeekly: z.number().int().min(1).max(168),
  github: z.string().max(200).optional(),
  referredBy: z.string().max(200).optional(),
});

// POST /api/portal/membership/apply — Submit membership application
export const POST = withAuth(async (req, { user }) => {
  try {
    const body = await req.json();
    const data = applySchema.parse(body);
    const result = await membershipApplicationService.submitApplication(user.id, data);
    return apiCreated(result);
  } catch (error) {
    return apiError(error);
  }
});
