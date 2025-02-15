describe('Person detail page', () => {
    beforeEach('loads', () => {
        cy.visit('detail.html?ref=per012083')
    })

    it('Check meta title', () => {
        cy.title()
          .should('not.be.empty');
      })


    it('Should show person details Hans Albrecht', () => {
        cy.get('.panel')
          .contains('h2', 'Hans Abrecht')
          .should('be.visible')
          .should('have.class', 'tei-person1')
    })


})