describe('Spreadsheet E2E Tests', () => {
  beforeEach(() => {
    cy.visit('/')
  })

  it('should edit cell contents', () => {
    cy.getCell('A1').click()
    cy.get('.formula-bar').type('Hello World{enter}')
    cy.getCell('A1').should('have.text', 'Hello World')
  })

  it('should calculate basic formulas', () => {
    cy.enterFormula('A1', '=2+2')
    cy.getCell('A1').should('have.text', '4')
  })

  it('should handle cell references', () => {
    cy.enterFormula('A1', '=42')
    cy.enterFormula('A2', '=REF(A1)')
    cy.getCell('A2').should('have.text', '42')
  })

  it('should calculate range functions', () => {
    cy.enterFormula('A1', '=1')
    cy.enterFormula('A2', '=2')
    cy.enterFormula('A3', '=3')
    cy.enterFormula('A4', '=SUM(A1:A3)')
    cy.getCell('A4').should('have.text', '6')
  })

  it('should handle column operations', () => {
    cy.enterFormula('A1', '=1')
    cy.enterFormula('B1', '=2')
    
    // Test insert column
    cy.contains('button', 'Insert Column').click()
    cy.getCell('C1').should('have.text', '2')
    
    // Test delete column
    cy.contains('button', 'Delete Column').click()
    cy.getCell('B1').should('have.text', '2')
  })

  it('should handle row operations', () => {
    cy.enterFormula('A1', '=1')
    cy.enterFormula('A2', '=2')
    
    // Test insert row
    cy.contains('button', 'Insert Row').click()
    cy.getCell('A3').should('have.text', '2')
    
    // Test delete row
    cy.contains('button', 'Delete Row').click()
    cy.getCell('A2').should('have.text', '2')
  })
});