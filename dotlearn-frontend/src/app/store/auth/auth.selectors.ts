import { createFeatureSelector, createSelector } from '@ngrx/store';
import { AuthState } from './auth.state';

export const selectAuthState = createFeatureSelector<AuthState>('auth');
export const selectCurrentUser = createSelector(selectAuthState, s => s.currentUser);
export const selectAccessToken = createSelector(selectAuthState, s => s.accessToken);
export const selectIsLoading = createSelector(selectAuthState, s => s.isLoading);
export const selectAuthError = createSelector(selectAuthState, s => s.error);
