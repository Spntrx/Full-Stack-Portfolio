describe('Portfolio End-to-End User Workflow', () => {
  it('navigates sections, loads live projects from MongoDB, and submits the contact form', () => {
    cy.visit('/')
    cy.contains(/Designing for/i, { timeout: 15000 }).should('be.visible')

    // Navigate to Projects and verify cloud-hosted records render
    cy.contains('a', 'Projects').click()
    cy.contains('Full-Stack Portfolio', { timeout: 25000 }).should('be.visible')

    // Navigate to Education & Services sections
    cy.contains('a', 'Education').click()
    cy.wait(400)
    cy.contains('a', 'Services').click()
    cy.wait(400)

    // Navigate to Contact and fill every input in the Contact form
    cy.contains('a', 'Contact').click()
    cy.get('textarea').first().closest('form').within(() => {
      cy.get('input').each(($input, index) => {
        const type = $input.attr('type') || 'text'
        if (type === 'email') {
          cy.wrap($input).clear().type('cypress.e2e@example.com')
        } else if (type === 'tel') {
          cy.wrap($input).clear().type('4165550199')
        } else {
          cy.wrap($input).clear().type(index === 0 ? 'Cypress' : 'Tester')
        }
      })
      cy.get('textarea').clear().type('Automated end-to-end workflow verification for Assignment 4.')
      cy.get('button[type="submit"]').click()
    })

    // Verify UI confirms submission
    cy.contains(/thank|sent|received|submitted|message/i, { timeout: 30000 }).should('be.visible')
  })
})