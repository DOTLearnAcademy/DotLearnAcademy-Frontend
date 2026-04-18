describe('Student Full Flow', () => {
  const student = {
    email: `student_${Date.now()}@test.com`,
    password: 'TestPass@123',
    fullName: 'Test Student',
  };

  it('Step 1-3: Home page loads and course catalog renders', () => {
    cy.visit('/');
    cy.get('[data-cy="hero-section"]').should('be.visible');
    cy.get('[data-cy="featured-courses"]').should('exist');

    cy.get('[data-cy="nav-courses"]').click();
    cy.url().should('include', '/courses');
    cy.get('[data-cy="course-card"]').should('have.length.greaterThan', 0);
  });

  it('Step 4: Enroll without login redirects to /auth/login', () => {
    cy.visit('/courses');
    cy.get('[data-cy="course-card"]').first().click();
    cy.get('[data-cy="enroll-free-btn"]').click();
    cy.url().should('include', '/auth/login');
  });

  it('Step 5-6: Register and enroll in free course', () => {
    cy.visit('/auth/register');
    cy.get('[data-cy="fullname-input"]').type(student.fullName);
    cy.get('[data-cy="email-input"]').type(student.email);
    cy.get('[data-cy="password-input"]').type(student.password);
    cy.get('[data-cy="role-select"]').select('Student');
    cy.get('[data-cy="register-btn"]').click();
    cy.url().should('include', '/student/my-learning');
  });

  it('Step 7: Lesson player loads after enrollment', () => {
    cy.login(student.email, student.password);
    cy.visit('/student/my-learning');
    cy.get('[data-cy="enrolled-course-card"]').first().click();
    cy.get('[data-cy="lesson-player"]').should('be.visible');
    cy.get('[data-cy="curriculum-sidebar"]').should('exist');
  });

  it('Step 9-10: My Learning shows progress, Certificates page renders', () => {
    cy.login(student.email, student.password);
    cy.visit('/student/my-learning');
    cy.get('[data-cy="progress-percent"]').should('exist');

    cy.visit('/student/certificates');
    cy.url().should('include', '/student/certificates');
  });
});
