import { Product } from 'src/app/products/product';
import { AddProductPage } from '../support/add-product.po';

describe('Add product', () => {
  const page = new AddProductPage();

  beforeEach(() => {
    page.navigateTo();
  });

  it('Should have the correct title', () => {
    page.getTitle().should('have.text', 'New Product');
  });

  it('Should enable and disable the add product button', () => {
    // ADD USER button should be disabled until all the necessary fields
    // are filled. Once the last (`#emailField`) is filled, then the button should
    // become enabled.
    page.addProductButton().should('be.disabled');
    page.getFormField('productName').type('test');
    page.addProductButton().should('be.enabled');
  });

  it('Should show error messages for invalid inputs', () => {
    // Before doing anything there shouldn't be an error
    cy.get('[data-test=productNameError]').should('not.exist');
    // Just clicking the productName field without entering anything should cause an error message
    page.getFormField('productName').click().blur();
    cy.get('[data-test=productNameError]').should('exist').and('be.visible');
    // Some more tests for various invalid productName inputs
    page.getFormField('productName').type('J').blur();
    cy.get('[data-test=productNameError]').should('exist').and('be.visible');
    page.getFormField('productName').clear().type('This is a very long name that goes beyond the 100 character limit'.repeat(3)).blur();
    cy.get('[data-test=productNameError]').should('exist').and('be.visible');
    // Entering a valid productName should remove the error.
    page.getFormField('productName').clear().type('Granny Smith Apples').blur();
    cy.get('[data-test=productNameError]').should('not.exist');

    // Before doing anything there shouldn't be an error
    cy.get('[data-test=thresholdError]').should('not.exist');
    // Some more tests for various invalid threshold inputs
    page.getFormField('threshold').type('-5').blur();
    cy.get('[data-test=thresholdError]').should('exist').and('be.visible');
    page.getFormField('threshold').clear().type('asd').blur();
    cy.get('[data-test=thresholdError]').should('exist').and('be.visible');
    // Entering a valid threshold should remove the error.
    page.getFormField('threshold').clear().type('25').blur();
    cy.get('[data-test=thresholdError]').should('not.exist');
  });

  describe('Adding a new product', () => {

    beforeEach(() => {
      cy.task('seed:database');
    });

    it('Should go to the right page, and have the right info', () => {
      const product: Product = {
        _id: null,
        productName: 'Test Product',
        threshold: 30,
      };

      page.addProduct(product);

      // New URL should end in the 24 hex character Mongo ID of the newly added product
      cy.url()
        .should('match', /\/products\/[0-9a-fA-F]{24}$/)
        .should('not.match', /\/products\/new$/);

      // The new product should have all the same attributes as we entered
      cy.get('.product-card-productName').should('have.text', product.productName);

      // We should see the confirmation message at the bottom of the screen
      cy.get('.mat-simple-snackbar').should('contain', `Added Product ${product.productName}`);
    });

  });

});
