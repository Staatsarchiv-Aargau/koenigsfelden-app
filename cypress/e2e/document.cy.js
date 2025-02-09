describe('Single document check', () => {
  beforeEach('loads', () => {
    cy.visit('data/docs/U-17_0755.xml')
      .wait(1000)
  })

  it('Check meta title', () => {
    cy.title().should('not.be.empty');
  });

  it.skip('Check meta description', () => {
    cy.get('meta[name="description"]').should('have.attr', 'content').and('not.be.empty');
  });

  it('list of panels is not empty', () => {
    cy.get('pb-panel').should('have.length', 3)
  })

  it('Person of name Abletten is in register', () => {
    cy.contains('a', 'Abletten')
      .should('exist')
      // .and('be.visible')
      .should('have.length', 1)
      .and('have.attr', 'href', '../../detail.html?ref=per017829')
      .invoke('text')
  })

  it('Person of name Abletten is mentioned in the text', () => {
    cy.get('pb-view.edition')
      .shadow()
    cy.contains('a', 'Abletten')
      .should('exist')
      // .and('be.visible')
      .should('have.length', 1)
      .and('have.attr', 'href', '../../detail.html?ref=per017829')
      .invoke('text')
      .should('eq', 'Cuͦnrat Abletten');

    cy.contains('pb-popover', 'Abletten')
      .should('not.have.class', 'highlight')
  })


  it('Person of name Abletten is highlighted in the text after checking name in register', () => {
    // clicking name in register list
    cy.get('[data-ref=per017829]')
      .find('div#checkboxContainer')
      .click();
    // checking highlight
    cy.get('pb-view.edition')
      .shadow()
    cy.contains('pb-popover', 'Abletten')
      .should('have.class', 'highlight')
  })

})