import { ProductListPage } from '../support/product-list.po';

const page = new ProductListPage();

describe('Product list', () => {

  before(() => {
    cy.task('seed:database');
  });

  beforeEach(() => {
    page.navigateTo();
  });

  it('Should show 10 products in both card and list view', () => {
    page.getProductCards().should('have.length', 10);
    page.changeView('list');
    page.getProductListItems().should('have.length', 10);
  });

  it('Should change the view', () => {
    // Choose the view type "List"
    page.changeView('list');

    // We should not see any cards
    // There should be list items
    page.getProductCards().should('not.exist');
    page.getProductListItems().should('exist');

    // Choose the view type "Card"
    page.changeView('card');

    // There should be cards
    // We should not see any list items
    page.getProductCards().should('exist');
    page.getProductListItems().should('not.exist');
  });

  it('Should click view profile on a product and go to the right URL', () => {
    page.getProductCards().first().then((card) => {
      const firstProductName = card.find('.product-card-name').text();

      // When the view profile button on the first product card is clicked, the URL should have a valid mongo ID
      page.clickViewProfile(page.getProductCards().first());

      // The URL should be '/products/' followed by a mongo ID
      cy.url().should('match', /\/products\/[0-9a-fA-F]{24}$/);

      // On this profile page we were sent to, the name and company should be correct
      cy.get('.product-card-name').first().should('have.text', firstProductName);
    });
   });

  it('Should click add product and go to the right URL', () => {
    // Click on the button for adding a new product
    page.addProductButton().click();

    // The URL should end with '/products/new'
    cy.url().should(url => expect(url.endsWith('/products/new')).to.be.true);

    // On the page we were sent to, We should see the right title
    cy.get('.add-product-title').should('have.text', 'New Product');
  });

});
