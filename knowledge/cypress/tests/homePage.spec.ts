describe("Home page", () => {
  it("Should render basic elements the first time the page is open", () => {
    cy.visit("/");
    //It should show header navbar
    cy.findByTestId("app-nav-bar").should("exist");
    //It should show the search section
    cy.findByTestId("home-search").should("exist");
    //The stats should show
    cy.findByTestId("stats").should("exist");
    //It should show 10 node items by default
    cy.findAllByTestId("node-item").should("have.length", 10);
    //it should show the pagination
    cy.findByTestId("pagination").should("exist");
  });

  it("Should allow search", () => {
    const textToSearch = "covid";
    cy.visit("/");
    //Let's enter some text to search
    cy.findByTestId("home-search").findByPlaceholderText("Search on 1Cademy").type(`${textToSearch}{enter}`);
    //the actual serach should show
    cy.findAllByTestId("node-item").should("have.length", 10);
    //the url should have the text entered as a parameter
    cy.url().should("include", `q=${textToSearch}`);
    //it should be on the first page
    cy.url().should("include", `page=1`);
    //let's change the page
    cy.findByTestId("pagination").findByLabelText("Go to page 2").click();
    //assert the page number changed in the url
    cy.url().should("include", `page=2`);
    //assert the second page is selected in the pagination component
    cy.findByLabelText("page 2").should("have.class", "Mui-selected");
    //let's click in the first node, it should redirect to the node page
    cy.findAllByTestId("node-item").eq(0).click();
    cy.findByTestId("node-item-container").should("exist");
  });

  it("Should search by tags", () => {
    cy.visit("/");
    cy.findByLabelText("Tags").type("covid");
  });
});
