describe("Test user signin/signout functionality", () => {
  // before();
  beforeEach(() => {
    cy.visit("/signin");
  });
  // after();
  // afterEach();

  describe("Test signin", () => {
    describe("Test signin with wrong data", () => {
      it("Should fail on wrong username", () => {
        cy.fixture("auth/signinData").then((userInput) => {
          cy.get("[data-cy=signinUsername]").type(userInput.usernameWrong);
          cy.get("[data-cy=signinPassword]").type(userInput.passwordCorrect);
          cy.get("[data-cy=signinSubmit]").click();
          cy.get("[data-cy=authErrorSnackbar]")
            .should("be.visible")
            .contains("Error GraphQL error: User not found.");
        });
      });
      it("Should fail on wrong password", () => {
        cy.fixture("auth/signinData").then((userInput) => {
          cy.get("[data-cy=signinUsername]").type(userInput.usernameCorrect);
          cy.get("[data-cy=signinPassword]").type(userInput.passwordWrong);
          cy.get("[data-cy=signinSubmit]").click();
          cy.get("[data-cy=authErrorSnackbar]")
            .should("be.visible")
            .contains("Error GraphQL error: Invalid password.");
        });
      });
    });

    describe("Test signin with correct data", () => {
      it("Should successfully login", () => {
        cy.fixture("auth/signinData").then((userInput) => {
          cy.get("[data-cy=signinUsername]").type(userInput.usernameCorrect);
          cy.get("[data-cy=signinPassword]").type(userInput.passwordCorrect);
          cy.get("[data-cy=signinSubmit]").click();
          cy.url().should("eq", Cypress.config("baseUrl"));
        });
      });
    });
  });

  describe("Test signout", () => {
    it("Should successfully signout", () => {
      cy.fixture("auth/signinData").then((userInput) => {
        cy.get("[data-cy=signinUsername]").type(userInput.usernameCorrect);
        cy.get("[data-cy=signinPassword]").type(userInput.passwordCorrect);
        cy.get("[data-cy=signinSubmit]").click();
      });
      cy.get("[data-cy=signoutBtn]").click();
      cy.get("[data-cy=signinBtn]").should("be.visible");
    });
  });
});
