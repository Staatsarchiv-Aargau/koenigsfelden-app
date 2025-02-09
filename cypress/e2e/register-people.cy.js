describe('Person register check', () => {
    beforeEach('loads', () => {
        cy.visit('people.html?search=&category=Alle')
        .wait(1000)
    })

    it('Check meta title', () => {
        cy.title().should('not.be.empty');
      });
    
      it.skip('Check meta description', () => {
        cy.get('meta[name="description"]').should('have.attr', 'content').and('not.be.empty');
      });
    

    it('list of people is not empty', () => {
        cy.get('span.register-item').its('length').should('be.gte', 0)
    })

    it('Check if there exist person of name Abletten and content of detail page', () => {
        cy.contains('a', 'Abletten, Johannes')
            .should('exist')
            .and('be.visible')
            .and('have.attr', 'href', 'detail.html?ref=per026637')
            .click();
        cy.wait(10)

        // Check if exists headline "Abletten" in new page
        cy.contains('h2', 'Johannes Abletten').should('be.visible')
            .should('have.class', 'tei-person1');
    })

    it('Serch results for “Böp” is equal 1', () => {
        cy.get('input[name="search"]').first().focus()
            .type('Böp{enter}')
        cy.get('.register-item').should('be.visible')
            .should('have.length', 1);
    });


})