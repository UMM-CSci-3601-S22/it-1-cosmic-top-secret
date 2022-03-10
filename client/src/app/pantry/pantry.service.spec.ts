import { HttpClient } from '@angular/common/http';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { Pantry } from './pantry';
import { PantryService } from './pantry.service';

describe('Pantry service: ', () => {
  // A small collection of test Pantry products
  const testPantry: Pantry[] = [
    {
      _id: '529634',
      productId: '67384990',
    },
    {
      _id: '527834',
      productId: '67384990',
    },
    {
      _id: '029994',
      productId: '83675493',
    }
  ];
  let pantryService: PantryService;
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
    pantryService = new PantryService(httpClient);
  });

  afterEach(() => {
    // After every test, assert that there are no more pending requests.
    httpTestingController.verify();
  });

  it('getPantryItems() calls api/pantry', () => {
    // Assert that the pantry products we get from this call to getPantryItems()
    // should be our set of test pantry products. Because we're subscribing
    // to the result of getPantryItems(), this won't actually get
    // checked until the mocked HTTP request 'returns' a response.
    // This happens when we call req.flush(testItems) a few lines
    // down.
    pantryService.getPantry().subscribe(
      pantryItems => expect(pantryItems).toBe(testPantry)
    );

    // Specify that (exactly) one request will be made to the specified URL.
    const req = httpTestingController.expectOne(pantryService.pantryUrl);
    // Check that the request made to that URL was a GET request.
    expect(req.request.method).toEqual('GET');
    // Specify the content of the response to that request. This
    // triggers the subscribe above, which leads to that check
    // actually being performed.
    req.flush(testPantry);
  });

  it('getPantryItemById() calls api/Pantry/id', () => {
    const targetPantryItem: Pantry = testPantry[1];
    const targetId: string = targetPantryItem._id;
    pantryService.getPantryItemById(targetId).subscribe(
      productId => expect(productId).toBe(targetPantryItem)
    );

    const expectedUrl: string = pantryService.pantryUrl + '/' + targetId;
    const req = httpTestingController.expectOne(expectedUrl);
    expect(req.request.method).toEqual('GET');
    req.flush(targetPantryItem);
  });

  it('addPantryItem() posts to api/pantry', () => {

    pantryService.addPantryItem(testPantry[1]).subscribe();
    const req = httpTestingController.expectOne(pantryService.pantryUrl);

    expect(req.request.method).toEqual('POST');
    expect(req.request.body).toEqual(testPantry[1]);
  });
});
