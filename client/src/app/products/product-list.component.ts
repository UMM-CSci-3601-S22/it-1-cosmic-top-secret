import { Component, OnInit, OnDestroy } from '@angular/core';
import { Product } from './product';
import { ProductService } from './product.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-product-list-component',
  templateUrl: 'product-list.component.html',
  styleUrls: ['./product-list.component.scss'],
  providers: []
})

export class ProductListComponent implements OnInit, OnDestroy  {
  // These are public so that tests can reference them (.spec.ts)
  public serverFilteredProducts: Product[];
  public filteredProducts: Product[];

  public productName: string;
  public viewType: 'card' | 'list' = 'card';
  getProductsSub: Subscription;


  // Inject the ProductService into this component.
  // That's what happens in the following constructor.
  //
  // We can call upon the service for interacting
  // with the server.

  constructor(private productService: ProductService) {

  }

  getProductsFromServer(): void {
    this.unsub();
    this.getProductsSub = this.productService.getProducts().subscribe(returnedProducts => {
      this.serverFilteredProducts = returnedProducts;
      /*this.updateFilter();*/
    }, err => {
      console.log(err);
    });
  }

/* Filtering
  public updateFilter(): void {
    this.filteredProducts = this.productService.filterProducts(
      this.serverFilteredProducts, { name: this.productName });
  }
*/

  /**
   * Starts an asynchronous operation to update the products list
   *
   */
  ngOnInit(): void {
    this.getProductsFromServer();
  }

  ngOnDestroy(): void {
    this.unsub();
  }

  unsub(): void {
    if (this.getProductsSub) {
      this.getProductsSub.unsubscribe();
    }
  }
}
