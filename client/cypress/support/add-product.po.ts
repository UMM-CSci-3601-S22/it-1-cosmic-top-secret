import {Product} from 'src/app/products/product';

export class AddProductPage {
  navigateTo() {
    return cy.visit('/products/new');
  }

  getTitle() {
    return cy.get('.add-product-title');
  }

  addProductButton() {
    return cy.get('[data-test=confirmAddProductButton]');
  }

  selectMatSelectValue(select: Cypress.Chainable, value: string) {
    // Find and click the drop down
    return select.click()
      // Select and click the desired value from the resulting menu
      .get(`mat-option[value="${value}"]`).click();
  }

  getFormField(fieldName: string) {
    return cy.get(`mat-form-field [formcontrolname=${fieldName}]`);
  }

  addProduct(newProduct: Product) {
    this.getFormField('productName').type(newProduct.productName);
    if (newProduct.threshold) {
      this.getFormField('threshold').type(newProduct.threshold.toString());
    }
    return this.addProductButton().click();
  }
}
