declare namespace Cypress {
    interface Chainable {
      getCell(address: string): Chainable<JQuery<HTMLElement>>
      enterFormula(address: string, formula: string): void
    }
  }
  
  Cypress.Commands.add('getCell', (address: string) => {
    return cy.get(`[data-cell-id="${address}"]`)
  })
  
  Cypress.Commands.add('enterFormula', (address: string, formula: string) => {
    cy.getCell(address).click()
    cy.get('.formula-bar').type(formula + '{enter}')
  })