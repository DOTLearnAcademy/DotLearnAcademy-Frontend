// ============================================================
// DOTLearn Academy — Cypress Custom Commands
// ============================================================

declare global {
    namespace Cypress {
        interface Chainable {
            /**
             * Login via API (bypasses UI, sets token in localStorage)
             * @param email - user email
             * @param password - user password
             */
            login(email: string, password: string): Chainable<void>;

            /**
             * Login as a Student role
             */
            loginAsStudent(): Chainable<void>;

            /**
             * Login as an Instructor role
             */
            loginAsInstructor(): Chainable<void>;

            /**
             * Login as an Admin role
             */
            loginAsAdmin(): Chainable<void>;
        }
    }
}

// ── Core login command (calls API directly, then sets token) ──
Cypress.Commands.add("login", (email: string, password: string) => {
    cy.request("POST", "/api/auth/login", { email, password }).then(
        (response) => {
            expect(response.status).to.eq(200);
            // Set tokens in localStorage before Angular bootstraps on the target page
            window.localStorage.setItem("access_token", response.body.accessToken);
            window.localStorage.setItem("refresh_token", response.body.refreshToken);
        }
    );
});

// ── Role-specific shortcuts ───────────────────────────────────
Cypress.Commands.add("loginAsStudent", () => {
    cy.login(
        Cypress.env("STUDENT_EMAIL") || "student@dotlearn.test",
        Cypress.env("STUDENT_PASSWORD") || "Student@123"
    );
});

Cypress.Commands.add("loginAsInstructor", () => {
    cy.login(
        Cypress.env("INSTRUCTOR_EMAIL") || "instructor@dotlearn.test",
        Cypress.env("INSTRUCTOR_PASSWORD") || "Instructor@123"
    );
});

Cypress.Commands.add("loginAsAdmin", () => {
    cy.login(
        Cypress.env("ADMIN_EMAIL") || "admin@dotlearn.test",
        Cypress.env("ADMIN_PASSWORD") || "Admin@123"
    );
});
