import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { ProductFilters } from './ProductFilters';
import { Product } from './product';
import { map } from 'rxjs/operators';

@Injectable()
export class ProductService {
  readonly productUrl: string = environment.apiUrl + 'products';

  constructor(private httpClient: HttpClient) {
  }

  getProducts(): Observable<Product[]> {
    const httpParams: HttpParams = new HttpParams();
    return this.httpClient.get<Product[]>(this.productUrl, {
      params: httpParams,
    });
  }

  getProductById(id: string): Observable<Product> {
    return this.httpClient.get<Product>(this.productUrl + '/' + id);
  }

  addProduct(newProduct: Product): Observable<string> {
    // Send post request to add a new product with the product data as the body.
    return this.httpClient.post<{id: string}>(this.productUrl, newProduct).pipe(map(res => res.id));
  }

  filterProducts(products: Product[], filters: ProductFilters): Product[] {
    let filteredProducts = products;

    if (filters.productName) {
      filters.productName = filters.productName.toLowerCase();

      filteredProducts = filteredProducts.filter(product => product.productName.toLowerCase().indexOf(filters.productName) >= 0);
    }

    if (filters.threshold) {
      filteredProducts = filteredProducts.filter(product => product.threshold === filters.threshold);
    }

    return filteredProducts;
  }

}
