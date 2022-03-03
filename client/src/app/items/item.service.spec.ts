import { HttpClient } from '@angular/common/http';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { Item } from './item';
import { ItemService } from './item.service';

describe('Item service: ', () => {
  // A small collection of test Items
  const testItems: Item[] = [
    {
      name: 'Granny Smith Apples'
    },
    {
      name: '12-grain Dakota Style Bread'
    },
    {
      name: 'Canned Tomatoes'
    }
  ];
  let itemService: ItemService;
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
    itemService = new ItemService(httpClient);
  });

  afterEach(() => {
    // After every test, assert that there are no more pending requests.
    httpTestingController.verify();
  });

  it('getItems() calls api/items', () => {
    // Assert that the items we get from this call to getItems()
    // should be our set of test items. Because we're subscribing
    // to the result of getItems(), this won't actually get
    // checked until the mocked HTTP request 'returns' a response.
    // This happens when we call req.flush(testItems) a few lines
    // down.
    itemService.getItems().subscribe(
      items => expect(items).toBe(testItems)
    );

    // Specify that (exactly) one request will be made to the specified URL.
    const req = httpTestingController.expectOne(itemService.itemUrl);
    // Check that the request made to that URL was a GET request.
    expect(req.request.method).toEqual('GET');
    // Specify the content of the response to that request. This
    // triggers the subscribe above, which leads to that check
    // actually being performed.
    req.flush(testItems);
  });

  it('addItem() posts to api/items', () => {

    itemService.addItem(testItems[1]).subscribe();
    const req = httpTestingController.expectOne(itemService.itemUrl);

    expect(req.request.method).toEqual('POST');
    expect(req.request.body).toEqual(testItems[1]);
  });
});
