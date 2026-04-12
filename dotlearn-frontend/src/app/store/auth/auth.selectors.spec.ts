import { selectCurrentUser, selectAccessToken, selectIsLoading, selectAuthError } from './auth.selectors';
import { AuthState, initialAuthState } from './auth.state';

describe('Auth Selectors', () => {
  const mockState = {
    auth: {
      ...initialAuthState,
      currentUser: { id: '1', email: 'a@b.com', role: 'Student', fullName: 'Samar' },
      accessToken: 'abc',
      isLoading: false,
      error: null
    } as AuthState
  };

  it('selectCurrentUser returns the user from state', () => {
    const result = selectCurrentUser(mockState as any);
    expect(result?.email).toBe('a@b.com');
  });

  it('selectAccessToken returns the token', () => {
    const result = selectAccessToken(mockState as any);
    expect(result).toBe('abc');
  });

  it('selectIsLoading returns false when idle', () => {
    const result = selectIsLoading(mockState as any);
    expect(result).toBe(false);
  });

  it('selectAccessToken returns null when not authenticated', () => {
    const emptyState = { auth: initialAuthState };
    const result = selectAccessToken(emptyState as any);
    expect(result).toBeNull();
  });

  it('selectAuthError returns null when no error', () => {
    const result = selectAuthError(mockState as any);
    expect(result).toBeNull();
  });
});
