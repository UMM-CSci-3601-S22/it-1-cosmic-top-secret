import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { Item} from '../app/items/item';
import { ItemService } from '../app/items/item.service';

/**
 * A "mock" version of the `ItemService` that can be used to test components
 * without having to create an actual service.
 */
@Injectable()
export class MockItemService extends ItemService {
  static testItems: Item[] = [
    {
      _id: '22',
      name: 'apples'
    },
    {
      _id: '23',
      name: 'bannanas'
    },
    {
      _id:'24',
      name: 'pop-tarts'
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
    // If the specified ID is for the first test item,
    // return that item, otherwise return `null` so
    // we can test illegal item requests.
    if (id === MockItemService.testItems[0]._id) {
      return of(MockItemService.testItems[0]);
    } else {
      return of(null);
    }
  }

}
