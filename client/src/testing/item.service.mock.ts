import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { Item } from '../app/items/item';
import { ItemService } from '../app/items/item.service';

/**
 * A "mock" version of the `ItemService` that can be used to test components
 * without having to create an actual service.
 */
@Injectable()
export class MockItemService extends ItemService {
  static testItems: Item[] = [
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

  getItems(): Observable<Item[]> {
    // Just return the test items regardless of what filters are passed in
    return of(MockItemService.testItems);
  }

  getItemById(id: string): Observable<Item> {
    // If the specified ID is for the first test Item,
    // return that Item, otherwise return `null` so
    // we can test illegal Item requests.
    if (id === MockItemService.testItems[0]._id) {
      return of(MockItemService.testItems[0]);
    } else {
      return of(null);
    }
  }

}
