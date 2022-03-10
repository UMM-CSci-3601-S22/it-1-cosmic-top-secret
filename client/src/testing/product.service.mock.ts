import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { Product } from '../app/products/product';
import { ProductService } from '../app/products/product.service';

/**
 * A "mock" version of the `ProductService` that can be used to test components
 * without having to create an actual service.
 */
@Injectable()
export class MockProductService extends ProductService {
  static testProducts: Product[] = [
    {
      _id: 'apples_id',
      productName: 'Granny Smith Apples',
      threshold: 3
    },
    {
      _id: 'steak_id',
      productName: 'Sirloin Steak',
      threshold: 3
    },
    {
      _id: 'scone_id',
      productName: 'Plain Scones',
      threshold: 3
    }
  ];

  constructor() {
    super(null);
  }

  getProducts(): Observable<Product[]> {
    // Just return the test products regardless of what filters are passed in
    return of(MockProductService.testProducts);
  }

  getProductById(id: string): Observable<Product> {
    // If the specified ID is for the first test Product,
    // return that Product, otherwise return `null` so
    // we can test illegal Product requests.
    if (id === MockProductService.testProducts[0]._id) {
      return of(MockProductService.testProducts[0]);
    } else {
      return of(null);
    }
  }

}
