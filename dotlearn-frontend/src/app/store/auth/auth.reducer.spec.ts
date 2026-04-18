import { authReducer, initialAuthState } from './auth.reducer';
import * as AuthActions from './auth.actions';
import { CurrentUser } from './auth.state';

describe('Auth Reducer', () => {
  const mockUser: CurrentUser = {
    id: '1',
    email: 'test@test.com',
    role: 'Student',
    fullName: 'Test User'
  };

  it('should return initial state by default', () => {
    const state = authReducer(undefined, { type: '@@INIT' } as any);
    expect(state).toEqual(initialAuthState);
  });

  it('login sets isLoading to true and clears error', () => {
    const action = AuthActions.login({ email: 'a@b.com', password: '123' });
    const state = authReducer(initialAuthState, action);
    expect(state.isLoading).toBe(true);
    expect(state.error).toBeNull();
  });

  it('loginSuccess sets currentUser, tokens, and isAuthenticated', () => {
    const action = AuthActions.loginSuccess({
      currentUser: mockUser,
      accessToken: 'access_abc',
      refreshToken: 'refresh_abc'
    });
    const state = authReducer(initialAuthState, action);
    expect(state.currentUser).toEqual(mockUser);
    expect(state.accessToken).toBe('access_abc');
    expect(state.refreshToken).toBe('refresh_abc');
    expect(state.isLoading).toBe(false);
    expect(state.error).toBeNull();
  });

  it('loginFailure sets error and clears isLoading', () => {
    const action = AuthActions.loginFailure({ error: 'Invalid credentials' });
    const state = authReducer(initialAuthState, action);
    expect(state.isLoading).toBe(false);
    expect(state.error).toBe('Invalid credentials');
  });

  it('logout resets state to initial', () => {
    const loggedInState = {
      ...initialAuthState,
      currentUser: mockUser,
      accessToken: 'token',
      refreshToken: 'rtoken',
    };
    const state = authReducer(loggedInState, AuthActions.logout());
    expect(state).toEqual(initialAuthState);
    expect(state.currentUser).toBeNull();
  });

  it('refreshTokenSuccess updates both tokens', () => {
    const action = AuthActions.refreshTokenSuccess({
      accessToken: 'new-access',
      refreshToken: 'new-refresh'
    });
    const state = authReducer(initialAuthState, action);
    expect(state.accessToken).toBe('new-access');
    expect(state.refreshToken).toBe('new-refresh');
  });
});
