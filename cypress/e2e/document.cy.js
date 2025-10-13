describe('Single document check', () => {
  beforeEach('loads', () => {
    cy.intercept({ resourceType: /xhr|fetch/ }, { log: false })
    cy.visit('data/docs/U-17_0755.xml')
  })


  // Metadata tests

  it('Check meta title', () => {
    cy.title()
      .should('not.be.empty')
      .should('eq', 'Die Urkunden und Akten des Klosters und des Oberamts Königsfelden')
  })

  it.skip('Check meta description', () => {
    cy.get('meta[name="description"]')
      .should('have.attr', 'content')
      .and('not.be.empty')
  })

  it.skip('Check meta url', () => {
    cy.get('link[rel="canonical"]')
      .invoke('attr', 'href')
      .then((href) => {
        expect(href.startsWith('https://koenigsfelden.sources-online.org/')).to.be.true
      })
  })


// Content tests

  it.skip('Document title is in the header', () => {
    cy.contains('h1', 'StAAG U.17/0755').should('be.visible')
  })


// Merging the text in the document with data from registers test

  it('Person of name Abletten is in register', () => {
    cy.get('div.register ul').eq(0)
      .contains('a', 'Abletten')
      .should('exist')
      .should('have.length', 1)
      .and('have.attr', 'href', '../../detail.html?ref=per017829')
      .click()
    cy.wait(10)
    cy.contains('h2', 'Konrad Abletten').should('be.visible')

  })

  it('Person of name Abletten is mentioned in the text', () => {
    cy.get('#edition')
    cy.contains('a', 'Abletten')
      .should('exist')
      .should('have.length', 1)
      .and('have.attr', 'href', '../../detail.html?ref=per017829')
 //   cy.get('[href$="per017829"]')
 //     .contains('Cuͦnrat Abletten')

 //   cy.contains('pb-popover', 'Abletten')
 //    .should('not.have.class', 'highlight')
  })


  it('should highlight selected person in edition', () => {
    // clicking name in register list
    cy.get('pb-popover[data-ref=per000342]')
      // checking highlight before
      .should('not.have.class', 'highlight')
   cy.get('li[data-ref=per000342]')
      .find('div#checkboxContainer')
      .click()
    // checking highlight after
    cy.get('#edition')
      .contains('pb-popover', 'Lùpolt')
      .should('have.class', 'highlight')
  })

// not common
  it('list of panels is not empty', () => {
    cy.get('pb-panel')
      .should('have.length', 3)
  })
})