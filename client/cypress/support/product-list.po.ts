export class ProductListPage {
  navigateTo() {
    return cy.visit('/products');
  }

  getProductCards() {
    return cy.get('.product-cards-container app-product-card');
  }

  getProductListItems() {
    return cy.get('.product-nav-list .product-list-item');
  }

  /**
   * Clicks the "view profile" button for the given product card.
   * Requires being in the "card" view.
   *
   * @param card The product card
   */
  clickViewProfile(card: Cypress.Chainable<JQuery<HTMLElement>>) {
    return card.find<HTMLButtonElement>('[data-test=viewProfileButton]').click();
  }

  /**
   * Change the view of products.
   *
   * @param viewType Which view type to change to: "card" or "list".
   */
  changeView(viewType: 'card' | 'list') {
    return cy.get(`[data-test=viewTypeRadio] .mat-radio-button[value="${viewType}"]`).click();
  }

  addProductButton() {
    return cy.get('[data-test=addProductButton]');
  }
}
