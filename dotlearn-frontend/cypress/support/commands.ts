declare global {
  namespace Cypress {
    interface Chainable {
      login(email: string, password: string): Chainable<void>;
    }
  }
}

Cypress.Commands.add('login', (email: string, password: string) => {
  cy.request('POST', '/api/auth/login', { email, password }).then((response) => {
    window.localStorage.setItem('access_token', response.body.accessToken);
    window.localStorage.setItem('refresh_token', response.body.refreshToken);
  });
});
