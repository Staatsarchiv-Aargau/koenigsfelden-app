describe('Single document check', () => {
  beforeEach('loads', () => {
    cy.visit('data/docs/U-17_0755.xml')
  })

  it('Check meta title', () => {
    cy.title()
      .should('not.be.empty')
  });

  it.skip('Check meta description', () => {
    cy.get('meta[name="description"]')
      .should('have.attr', 'content')
      .and('not.be.empty')
  });

  it('list of panels is not empty', () => {
    cy.get('pb-panel')
      .should('have.length', 3)
  })

  it('Person of name Abletten is in register', () => {
    cy.contains('a', 'Abletten')
      .should('exist')
      .should('have.length', 1)
      .and('have.attr', 'href', '../../detail.html?ref=per017829')
      .invoke('text')
  })

  it('Person of name Abletten is mentioned in the text', () => {
    cy.get('#edition')
    cy.contains('a', 'Abletten')
      .should('exist')
      .should('have.length', 1)
      .and('have.attr', 'href', '../../detail.html?ref=per017829')
    cy.get('[href$="per017829"]')
      .contains('Cuͦnrat Abletten')

    cy.contains('pb-popover', 'Abletten')
      .should('not.have.class', 'highlight')
  })


  // TODO(DP): this fails to consistently apply highlighting in Chrome
  it.skip('should highlight selected person in edition', () => {
    // clicking name in register list
    cy.get('[data-ref=per000342]')
      .find('div#checkboxContainer')
      .click()
    // checking highlight
    cy.get('#edition')
      .contains('pb-popover', 'Lùpolt')
      .should('have.class', 'highlight')
  })

})