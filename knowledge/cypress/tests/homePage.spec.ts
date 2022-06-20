describe("Home page", () => {
  it("Should render basic elements the first time the page is open", () => {
    cy.visit("/");
    //the home page should have the following elements
    //header navbar
    cy.findByTestId("app-nav-bar").should("exist");
    //the search section
    cy.findByTestId("home-search").should("exist");
    //The stats should show
  });
});
