describe("This file will go through every node and it will visit it's page", () => {
  it("should visit every node's page", () => {
    cy.readFile("./pages.txt").then(str => {
      // parse the string into object literal
      const res = str.split(",");
      for (let nodepage of res) {
        console.log(`visting page: ${nodepage}`);
        cy.log(`visting page: ${nodepage}`);
        cy.visit(`http://localhost:3000${nodepage}`);
        // cy.visit(`https://node.1cademy.us${nodepage}`);
        cy.findByTestId("node-item-full").should("exist");
        // cy.wait(2000);
      }
    });
  });

  it.skip("Should visit all pages", () => {
    const numPages = 27536;
    // const numPages = 4;
    cy.visit(`http://localhost:3000/`);

    for (let i = 0; i < numPages; i++) {
      cy.findByLabelText("Go to next page").click();
      cy.wait(3000);
    }
  });
});
