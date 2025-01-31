describe('check pagination', () => { // check if the number of pages and number of documets on page give the total amount of documents.
    beforeEach('loads', () => {
        cy.visit('index.html')
            .wait(1000)
            .get('#paginate')
            .then(paginate => {
                const total = parseInt(paginate.attr('total'), 10)
                const perpage = parseInt(paginate.attr('per-page'), 10)
                const modulo = total % perpage

                cy.wrap(total).as('documentsAmount')
                cy.wrap(perpage).as('typicalPageDocumentsAmount')
                cy.wrap(modulo).as('lastPageDocumentsAmount')
                cy.wrap((total - modulo) / perpage + 1).as('pagesAmount')
            })
        })

    it('Check if declared total number of documents is equal to attribute total of pagination box', () => {
        cy.get('pb-paginate')
            .find('span.found[part="count"]')
            .invoke('text')
            .then((foundText) => {
                const foundNumber = parseInt(foundText.trim(), 10);
                cy.get('@documentsAmount').then((total) => {
                    expect(foundNumber).to.equal(total);
                })
            })
        })

    it('Check if number of document in the page is equal to attribute per-page of pagination box', () => {
        cy.get('@typicalPageDocumentsAmount').then((perpage) => {
            cy.get('.collection')
            .find('h5.tei-title1')
            .should('have.length', perpage);
        })
    });

    it('Check if number of document in the last page is equal to the modulo of number of documents and number of pages', () => {
        cy.get('iron-icon[icon="last-page"]').closest('span').click({ force: true });
        cy.wait(1000)
        .get('pb-paginate')
        .find('span.active')
        .invoke('text')
        .then((foundText) => {
            const foundNumber = parseInt(foundText.trim(), 10); 
            cy.get('@pagesAmount').then((pages) => {
                expect(foundNumber).to.equal(pages);
                })
            cy.get('@lastPageDocumentsAmount').then((modulo) => {
                cy.get('.collection')
                .find('h5.tei-title1').should('have.length', modulo);
            })
        })
    });
    
});

