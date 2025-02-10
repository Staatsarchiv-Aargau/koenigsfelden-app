describe('Organisation register check', () => {
    beforeEach('loads', () => {
        cy.visit('organisations.html?search=&category=Alle')
    })

    it('Check 404', () => {
        cy.url().should('include', '/organisations.html?search=&category=Alle');
        cy.document().its('readyState').should('eq', 'complete');
    });

    it('Check meta title', () => {
        cy.title().should('not.be.empty');
      });
    
      it.skip('Check meta description', () => {
        cy.get('meta[name="description"]').should('have.attr', 'content').and('not.be.empty');
      });
    
    it('list of organisations is not empty', () => {
        cy.get('span.register-item').its('length').should('be.gte', 0)
    })

    it('Check if there exist family of name Mühlebach and content of detail page', () => {
        cy.contains('a', 'Mühlebach')
            .should('exist')
            .and('be.visible')
            .and('have.attr', 'href', 'detail.html?ref=org008425')
            .click();
        cy.wait(10)

        // Check if exists headline "Mühlebach" in new page
        cy.contains('h2', 'Mühlebach').should('be.visible')
            .should('have.class', 'tei-org1');
    })

    it('Serch results for “Mariä” is equal 1', () => {
        cy.get('input[name="search"]').first().focus()
            .type('Mariä{enter}')
            .wait(1000)
        cy.get('.register-item').should('be.visible')
            .should('have.length', 1);
    });

})