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
      name: 'Granny Smith Apples',
    },
    {
      _id: 'steak_id',
      name: 'Sirloin Steak',
    },
    {
      _id: 'scone_id',
      name: 'Plain Scones',
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
