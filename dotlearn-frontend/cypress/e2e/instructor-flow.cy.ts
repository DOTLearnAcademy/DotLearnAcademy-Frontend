// ============================================================
// DOTLearn Academy — Instructor E2E Flow Tests
// Target: https://3.27.174.183.nip.io
// ============================================================

describe("Instructor Flow", () => {
  beforeEach(() => {
    cy.loginAsInstructor();
  });

  // ── ANALYTICS DASHBOARD ─────────────────────────────────────
  describe("Instructor Dashboard", () => {
    it("login as instructor redirects to analytics", () => {
      cy.visit("/");
      cy.url().should("include", "/instructor/analytics");
    });

    it("analytics page shows stats cards", () => {
      cy.visit("/instructor/analytics");
      cy.get("[data-cy=stats-card]").should("have.length.greaterThan", 0);
    });
  });

  // ── COURSE CREATION ─────────────────────────────────────────
  describe("Course Creation Wizard", () => {
    it("completes all 4 steps of the course creation wizard", () => {
      cy.visit("/instructor/courses/create");

      // Step 1 — Basic Info
      cy.get("[data-cy=course-title]").type("Cypress Automation Test Course");
      cy.get("[data-cy=course-description]").type(
        "Testing the full course creation wizard with Cypress."
      );
      cy.get("[data-cy=course-category]").select("Technology");
      cy.get("[data-cy=wizard-next]").click();

      // Step 2 — Pricing (free)
      cy.get("[data-cy=course-price]").clear().type("0");
      cy.get("[data-cy=wizard-next]").click();

      // Step 3 — Skip thumbnail upload
      cy.get("[data-cy=wizard-skip]").click();

      // Step 4 — Review and submit
      cy.get("[data-cy=wizard-submit]").click();
      cy.get("[data-cy=course-status]").should("contain", "Draft");
    });
  });

  // ── CURRICULUM BUILDER ──────────────────────────────────────
  describe("Curriculum Builder", () => {
    it("adds a lesson to an existing course", () => {
      cy.visit("/instructor/courses");
      cy.get("[data-cy=course-card]").first().click();
      cy.get("[data-cy=add-lesson-btn]").click();
      cy.get("[data-cy=lesson-title-input]").type("Lesson 1: Introduction");
      cy.get("[data-cy=lesson-save-btn]").click();
      cy.get("[data-cy=lesson-list-item]").should(
        "contain",
        "Lesson 1: Introduction"
      );
    });

    it("submits course for review → status becomes PendingApproval", () => {
      cy.visit("/instructor/courses");
      cy.get("[data-cy=course-card]").first().within(() => {
        cy.get("[data-cy=submit-for-review-btn]").click();
      });
      cy.get("[data-cy=course-status]").should("contain", "PendingApproval");
    });
  });
});

// ── ADMIN APPROVAL FLOW ─────────────────────────────────────────
describe("Admin Flow", () => {
  beforeEach(() => {
    cy.loginAsAdmin();
  });

  it("admin can approve a pending course", () => {
    cy.visit("/admin/approvals");
    cy.get("[data-cy=approval-queue-item]").first().within(() => {
      cy.get("[data-cy=approve-btn]").click();
    });
    cy.get("[data-cy=course-status]").should("contain", "Published");
  });

  it("admin analytics shows platform stats — no revenue card", () => {
    cy.visit("/admin/analytics");
    cy.get("[data-cy=kpi-total-users]").should("exist");
    cy.get("[data-cy=kpi-total-revenue]").should("not.exist");
  });
});
