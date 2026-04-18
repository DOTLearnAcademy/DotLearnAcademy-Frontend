import { createReducer, on } from '@ngrx/store';
import { initialAuthState } from './auth.state';
import * as AuthActions from './auth.actions';

export const authReducer = createReducer(
  initialAuthState,
  on(AuthActions.login, state => ({ ...state, isLoading: true, error: null })),
  on(AuthActions.loginSuccess, (state, { currentUser, accessToken, refreshToken }) => ({
    ...state,
    currentUser,
    accessToken,
    refreshToken,
    isLoading: false,
    error: null
  })),
  on(AuthActions.loginFailure, (state, { error }) => ({
    ...state,
    isLoading: false,
    error
  })),
  on(AuthActions.logout, () => initialAuthState),
  on(AuthActions.refreshTokenSuccess, (state, { accessToken, refreshToken }) => ({
    ...state,
    accessToken,
    refreshToken
  }))
);
