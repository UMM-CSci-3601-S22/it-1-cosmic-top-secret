  getPantryItemById(id: string): Observable<Pantry> {
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
  static testPantrys: Pantry[] = [
    {
      _id: 'apples_id',
      product: 'Granny Smith Apples',
      productId: 'apid',
      tags: ['apple','delicious']
    },
    {
      _id: 'steak_id',
      product: 'Serlion',
      productId: 'sid',
      tags: ['meat','cow']
    },
    {
      _id: 'bannana_id',
      product: 'Green banana',
      productId: 'bid',
      tags: ['perisable','fruit']
    }
  ];

  constructor() {
    super(null);
  }

  getPantrys(): Observable<Pantry[]> {
    // Just return the test pantrys regardless of what filters are passed in
    return of(MockPantryService.testPantrys);
  }

  getPantryById(id: string): Observable<Pantry> {
    // If the specified ID is for the first test Pantry,
    // return that Pantry, otherwise return `null` so
    // we can test illegal Pantry requests.
    if (id === MockPantryService.testPantrys[0]._id) {
      return of(MockPantryService.testPantrys[0]);
    } else {
      return of(null);
    }
  }

}
