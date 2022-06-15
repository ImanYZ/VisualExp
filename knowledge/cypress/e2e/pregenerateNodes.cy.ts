describe("This file will go throu every node and it will visit it's page", () => {
  it("Should visit all pages", () => {
    // const numPages = 27536;
    const numPages = 4;
    cy.visit(`http://localhost:3000/`);

    for (let i = 0; i < numPages; i++) {
      cy.findByLabelText("Go to next page").click();
      cy.wait(3000);
    }
  });
});
