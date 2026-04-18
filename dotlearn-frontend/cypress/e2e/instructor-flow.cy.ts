describe('Instructor Create and Publish Flow', () => {
  const instructor = { email: 'instructor@dotlearn.test', password: 'Instructor@123' };

  beforeEach(() => {
    cy.login(instructor.email, instructor.password);
  });

  it('Step 1: Login as instructor redirects to /instructor/analytics', () => {
    cy.visit('/');
    cy.url().should('include', '/instructor/analytics');
  });

  it('Step 2-6: Create course wizard completes all 4 steps', () => {
    cy.visit('/instructor/courses/create');
    // Step 1
    cy.get('[data-cy="course-title"]').type('Test Automation Course');
    cy.get('[data-cy="course-description"]').type('Learn testing with Cypress and MSTest.');
    cy.get('[data-cy="course-category"]').select('Technology');
    cy.get('[data-cy="wizard-next"]').click();
    // Step 2 — price = 0 (free)
    cy.get('[data-cy="course-price"]').clear().type('0');
    cy.get('[data-cy="wizard-next"]').click();
    // Step 3 — skip thumbnail upload (mock)
    cy.get('[data-cy="wizard-skip"]').click();
    // Step 4 — review and submit
    cy.get('[data-cy="wizard-submit"]').click();
    cy.get('[data-cy="course-status"]').should('contain', 'Draft');
  });

  it('Step 7-8: Curriculum builder adds a lesson', () => {
    cy.visit('/instructor/courses');
    cy.get('[data-cy="course-card"]').first().click();
    cy.get('[data-cy="add-lesson-btn"]').click();
    cy.get('[data-cy="lesson-title-input"]').type('Lesson 1: Introduction');
    cy.get('[data-cy="lesson-save-btn"]').click();
    cy.get('[data-cy="lesson-list-item"]').should('contain', 'Lesson 1: Introduction');
  });

  it('Step 9: Submit course for review changes status to PendingApproval', () => {
    cy.visit('/instructor/courses');
    cy.get('[data-cy="course-card"]').first().within(() => {
      cy.get('[data-cy="submit-for-review-btn"]').click();
    });
    cy.get('[data-cy="course-status"]').should('contain', 'PendingApproval');
  });

  it('Step 10-11: Admin approves course → Published', () => {
    cy.login('admin@dotlearn.test', 'Admin@123');
    cy.visit('/admin/approvals');
    cy.get('[data-cy="approval-queue-item"]').first().within(() => {
      cy.get('[data-cy="approve-btn"]').click();
    });
    cy.get('[data-cy="course-status"]').should('contain', 'Published');
  });
});
