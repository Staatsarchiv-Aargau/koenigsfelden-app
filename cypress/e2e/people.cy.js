describe('people page', () => {
    beforeEach('loads', () => {
        cy.visit('people.html?search=&category=Alle')
    })


    it('displays list of people', () => {
        cy.get('pb-split-list > :nth-child(1) > a').should('be.visible')
    })

    it('there exist Abletten', () => {
        // cy.get('pb-split-list > :nth-child(11) > a').contains('Abletten')
        // .should('have.attr', 'href', 'detail.html?ref=per026637')
        cy.contains('a','Abletten')
        .should('exist') 
        .and('be.visible') 
       .and('have.attr', 'href', 'detail.html?ref=per026637')
       .click(); 
       cy.wait(10)

       // Check if exists "Abletten" in new page
       cy.contains('h2', 'Johannes Abletten').should('be.visible')
       .should('have.class', 'tei-person1');
    })
})