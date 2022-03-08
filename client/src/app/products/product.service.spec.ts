import { HttpClient } from '@angular/common/http';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { Product } from './product';
import { ProductService } from './product.service';

describe('Product service: ', () => {
  // A small collection of test Products
  const testProducts: Product[] = [
    {
      _id: '529634',
      name: 'Granny Smith Apples'
    },
    {
      _id:'675846',
      name: '12-grain Dakota Style Bread'
    },
    {
      _id:'65702934',
      name: 'Canned Tomatoes'
    }
  ];
  let productService: ProductService;
  // These are used to mock the HTTP requests so that we (a) don't have to
  // have the server running and (b) we can check exactly which HTTP
  // requests were made to ensure that we're making the correct requests.
  let httpClient: HttpClient;
  let httpTestingController: HttpTestingController;

  beforeEach(() => {
    // Set up the mock handling of the HTTP requests
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule]
    });
    httpClient = TestBed.inject(HttpClient);
    httpTestingController = TestBed.inject(HttpTestingController);
    // Construct an instance of the service with the mock
    // HTTP client.
    productService = new ProductService(httpClient);
  });

  afterEach(() => {
    // After every test, assert that there are no more pending requests.
    httpTestingController.verify();
  });

  it('getProducts() calls api/products', () => {
    // Assert that the products we get from this call to getProducts()
    // should be our set of test products. Because we're subscribing
    // to the result of getProducts(), this won't actually get
    // checked until the mocked HTTP request 'returns' a response.
    // This happens when we call req.flush(testProducts) a few lines
    // down.
    productService.getProducts().subscribe(
      products => expect(products).toBe(testProducts)
    );

    // Specify that (exactly) one request will be made to the specified URL.
    const req = httpTestingController.expectOne(productService.productUrl);
    // Check that the request made to that URL was a GET request.
    expect(req.request.method).toEqual('GET');
    // Specify the content of the response to that request. This
    // triggers the subscribe above, which leads to that check
    // actually being performed.
    req.flush(testProducts);
  });

  it('getProductById() calls api/Products/id', () => {
    const targetProduct: Product = testProducts[1];
    const targetId: string = targetProduct._id;
    productService.getProductById(targetId).subscribe(
      product => expect(product).toBe(targetProduct)
    );

    const expectedUrl: string = productService.productUrl + '/' + targetId;
    const req = httpTestingController.expectOne(expectedUrl);
    expect(req.request.method).toEqual('GET');
    req.flush(targetProduct);
  });

  it('addProduct() posts to api/products', () => {

    productService.addProduct(testProducts[1]).subscribe();
    const req = httpTestingController.expectOne(productService.productUrl);

    expect(req.request.method).toEqual('POST');
    expect(req.request.body).toEqual(testProducts[1]);
  });
});
