export interface AuthState {
  currentUser: CurrentUser | null;
  accessToken: string | null;
  refreshToken: string | null;
  isLoading: boolean;
  error: string | null;
}

export interface CurrentUser {
  id: string;
  email: string;
  fullName: string;
  role: string;
  avatarS3Key?: string;
}

export const initialAuthState: AuthState = {
  currentUser: null,
  accessToken: null,
  refreshToken: null,
  isLoading: false,
  error: null
};
