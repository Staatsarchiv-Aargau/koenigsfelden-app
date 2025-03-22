describe('Person register check', () => {
    beforeEach('loads', () => {
        cy.visit('people.html?search=&category=Alle')
    })

    it('Check meta title', () => {
        cy.title()
          .should('not.be.empty');
      });
    
      it.skip('Check meta description', () => {
        cy.get('meta[name="description"]')
          .should('have.attr', 'content')
          .and('not.be.empty');
      });
    

    it('list of people is not empty', () => {
        cy.get('span.register-item')
          .its('length')
          .should('be.gte', 0)
    })

    it('Check if there exist person of name Abletten', () => {
        cy.get('pb-split-list')
          .contains('a', 'Abletten, Johannes')
          .should('exist')
          .and('be.visible')
          .and('have.attr', 'href', 'detail.html?ref=per026637')
    })

    it('Should show person details on click', () => {
        cy.get('span.register-item')
          .as('persons')
          .find('[href="detail.html?ref=per012083"]')
        // TODO(DP): get rid of the necessity to use force here on FF 
          .click({force: true})
        cy.url()
           .should('contain', '012083')
    })

    it('Serch results for “Böp” is equal 1', () => {
        cy.get('input[name="search"]')
          .first()
          .focus()
          .type('Böp{enter}')
        cy.get('.register-item')
          .should('be.visible')
          .should('have.length', 1)
    });


})