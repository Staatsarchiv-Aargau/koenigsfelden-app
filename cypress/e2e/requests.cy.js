

describe('check error messages on opening every document from every volume in collection', () => {
    before('loads', () => {
        cy.visit('index.html', {
            // to force error messages in english
            onBeforeLoad(win) {
                Object.defineProperty(win.navigator, 'languages', {
                    value: ['en'],
                });
            }
        })
    })

    it('check status != 200', () => {
        let urls = [];

        cy.visit('index.html')
            .get('#paginate')
            .wait(1000)
            .invoke('attr', 'total')
            .then(totalText => {
                const total = parseInt(totalText, 10);
                cy.get('#paginate').invoke('attr', 'per-page').then(offsetText => {
                    const offset = parseInt(offsetText, 10);

                    //calculating the number of pages based on offset 
                    for (let i = 1; i <= Math.ceil(total / offset); i++) {
                        // for (let i = 1; i <= 2; i++) {
                        cy.get('#paginate')
                            .shadow()
                            .contains("span", i.toString())
                            .first()
                            .click()
                            .wait(500)
                            .get('div.header-short > a')
                            .each((link) => {
                                urls.push(link.attr('href'))
                            })
                    }
                })
                    .then(obj => {
                        cy.wrap(urls).should('have.length', total)
                        urls.forEach(url => {
                            console.log(url)
                            cy.request(url)
                                .its('status')
                                .should('eq', 200)
                            cy.visit(url)
                                .contains('The request to the server failed')
                                .should('not.exist')
                            cy.visit(url)
                                .contains('Die Anfrage an den Server schlug fehl')
                                .should('not.exist')
                        })
                    })
            })
    })

})