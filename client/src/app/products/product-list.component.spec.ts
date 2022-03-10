import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatOptionModule } from '@angular/material/core';
import { MatDividerModule } from '@angular/material/divider';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatListModule } from '@angular/material/list';
import { MatRadioModule } from '@angular/material/radio';
import { MatSelectModule } from '@angular/material/select';
import { MatTooltipModule } from '@angular/material/tooltip';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouterTestingModule } from '@angular/router/testing';
import { Observable } from 'rxjs';
import { MockProductService } from '../../testing/product.service.mock';
import { Product } from './product';
import { ProductCardComponent } from './product-card.component';
import { ProductListComponent } from './product-list.component';
import { ProductService } from './product.service';
import { MatIconModule } from '@angular/material/icon';

const COMMON_IMPORTS: any[] = [
  FormsModule,
  MatCardModule,
  MatFormFieldModule,
  MatSelectModule,
  MatOptionModule,
  MatButtonModule,
  MatInputModule,
  MatExpansionModule,
  MatTooltipModule,
  MatListModule,
  MatDividerModule,
  MatRadioModule,
  MatIconModule,
  BrowserAnimationsModule,
  RouterTestingModule,
];

describe('product list', () => {

  let productList: ProductListComponent;
  let fixture: ComponentFixture<ProductListComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [COMMON_IMPORTS],
      declarations: [ProductListComponent, ProductCardComponent],
      // providers:    [ ProductService ]  // NO! Don't provide the real service!
      // Provide a test-double instead
      providers: [{ provide: ProductService, useValue: new MockProductService() }]
    });
  });

  beforeEach(waitForAsync(() => {
    TestBed.compileComponents().then(() => {
      fixture = TestBed.createComponent(ProductListComponent);
      productList = fixture.componentInstance;
      fixture.detectChanges();
    });
  }));

  it('contains all the products', () => {
    expect(productList.serverFilteredProducts.length).toBe(3);
  });

  it('contains a product named \'Granny Smith Apples\'', () => {
    expect(productList.serverFilteredProducts.some((product: Product) => product.productName === 'Granny Smith Apples')).toBe(true);
  });

  it('contains a product named \'Sirloin Steak\'', () => {
    expect(productList.serverFilteredProducts.some((product: Product) => product.productName === 'Sirloin Steak')).toBe(true);
  });

  it('doesn\'t contain a product named \'Macadamia-Nut Cookies\'', () => {
    expect(productList.serverFilteredProducts.some((product: Product) => product.productName === 'Macadamia-Nut Cookies')).toBe(false);
  });

});

describe('Misbehaving Product List', () => {
  let productList: ProductListComponent;
  let fixture: ComponentFixture<ProductListComponent>;

  let productServiceStub: {
    getProducts: () => Observable<Product[]>;
    getProductsFiltered: () => Observable<Product[]>;
  };

  beforeEach(() => {
    // stub ProductService for test purposes
    productServiceStub = {
      getProducts: () => new Observable(observer => {
        observer.error('Error-prone observable');
      }),
      getProductsFiltered: () => new Observable(observer => {
        observer.error('Error-prone observable');
      })
    };

    TestBed.configureTestingModule({
      imports: [COMMON_IMPORTS],
      declarations: [ProductListComponent],
      // providers:    [ ProductService ]  // NO! Don't provide the real service!
      // Provide a test-double instead
      providers: [{ provide: ProductService, useValue: productServiceStub }]
    });
  });

  beforeEach(waitForAsync(() => {
    TestBed.compileComponents().then(() => {
      fixture = TestBed.createComponent(ProductListComponent);
      productList = fixture.componentInstance;
      fixture.detectChanges();
    });
  }));

  it('generates an error if we don\'t set up a ProductListService', () => {
    // Since the observer throws an error, we don't expect products to be defined.
    expect(productList.serverFilteredProducts).toBeUndefined();
  });
});
