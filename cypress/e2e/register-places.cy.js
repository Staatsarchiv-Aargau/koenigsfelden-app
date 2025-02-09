describe('Places register check', () => {
  beforeEach('loads', () => {
      cy.visit('places.html?search=&category=Alle')
      .wait(1000)
  })

  it('Check meta title', () => {
    cy.title().should('not.be.empty');
  });

  it.skip('Check meta description', () => {
    cy.get('meta[name="description"]').should('have.attr', 'content').and('not.be.empty');
  });

  it('list of places is not empty', () => {
      cy.get('span.register-item').its('length').should('be.gte', 0)
  })

  
  it('Check if there exist place of name Aare and content of detail page', () => {
      cy.contains('a', 'Aare')
          .should('exist')
          .and('be.visible')
          .and('have.attr', 'href', 'detail.html?ref=loc009226')
          .click();
      cy.wait(10)

      // Check if exists headline "Aare" in new page
      cy.contains('h2', 'Aare').should('be.visible')
          .should('have.class', 'tei-place1');
          cy.wait(10)
  })

  it('Serch results for Allenried” is equal 1', () => {
      cy.get('input[name="search"]').first().focus()
          .type('Allenried{enter}')
          .wait(1000)
      .get('.register-item').should('be.visible')
          .should('have.length', 1);
  });

//   it('Serch results for “XXX” is equal 0', () => {
//     cy.get('input[name="search"]').first().focus()
//         .type('XXX{enter}')
//         .wait(1000)
//     cy.get('.register-item').should('not.exist')
// });


})