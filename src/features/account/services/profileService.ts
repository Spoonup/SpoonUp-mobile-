import { ApiError } from '../../../services/api/interceptors';
import { apiClient } from '../../../services/api/client';
import { endpoints } from '../../../services/api/endpoints';
import { mocksEnabled } from '../../../services/api/mode';

export type ProfileInput = { username: string; email: string; phone: string };
export type Profile = { name: string; email: string; phone: string };

const delay = () => new Promise<void>(resolve => setTimeout(resolve, 500));

export class ProfileError extends Error {}

export const profileService = {
  // Live: PATCH /api/me. The backend needs username + email + phone together,
  // validates them (400) and rejects clashes (409); its message is shown as is.
  async update(input: ProfileInput): Promise<Profile> {
    const body = {
      username: input.username.trim(),
      email: input.email.trim(),
      phone: input.phone,
    };
    if (mocksEnabled) {
      await delay();
      return { name: body.username, email: body.email, phone: body.phone };
    }
    try {
      const { user } = await apiClient.patch<{ user: ProfileInput }>(
        endpoints.profile,
        body,
      );
      return { name: user.username, email: user.email, phone: user.phone };
    } catch (error) {
      const message = (error as ApiError).body as { message?: string };
      if (
        error instanceof ApiError &&
        error.status < 500 &&
        error.status !== 401 &&
        typeof message?.message === 'string'
      ) {
        throw new ProfileError(message.message);
      }
      throw new ProfileError(
        'We couldn’t save your changes. Check your connection and retry.',
      );
    }
  },
};
