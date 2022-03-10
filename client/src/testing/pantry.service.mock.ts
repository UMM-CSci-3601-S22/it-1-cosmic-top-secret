import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { Pantry } from '../app/pantry/pantry';
import { PantryService } from '../app/pantry/pantry.service';

/**
 * A "mock" version of the `PantryService` that can be used to test components
 * without having to create an actual service.
 */
@Injectable()
export class MockPantryService extends PantryService {
  static testPantry: Pantry[] = [
    {
      _id: '23480764',
      productId: 'apples_id'
    },
    {
      _id: '54673459',
      productId: 'steak_id'
    },
    {
      _id: '54673194',
      productId: 'scone_id'
    }
  ];

  constructor() {
    super(null);
  }

  getPantryItems(): Observable<Pantry[]> {
    // Just return the test pantry items regardless of what filters are passed in
    return of(MockPantryService.testPantry);
  }

  getPantryItemById(id: string): Observable<Pantry> {
    // If the specified ID is for the first test Pantry item,
    // return that Pantry item, otherwise return `null` so
    // we can test illegal pantry item requests.
    if (id === MockPantryService.testPantry[0]._id) {
      return of(MockPantryService.testPantry[0]);
    } else {
      return of(null);
    }
  }

}
