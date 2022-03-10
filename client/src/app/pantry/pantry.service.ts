import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { PantryFilters } from './PantryFilters';
import { Pantry } from './pantry';
import { map } from 'rxjs/operators';

@Injectable()
export class PantryService {
  readonly pantryUrl: string = environment.apiUrl + 'pantry';

  constructor(private httpClient: HttpClient) {
  }

  getPantry(): Observable<Pantry[]> {
    const httpParams: HttpParams = new HttpParams();
    return this.httpClient.get<Pantry[]>(this.pantryUrl, {
      params: httpParams,
    });
  }

  getPantryItemById(id: string): Observable<Pantry> {
    return this.httpClient.get<Pantry>(this.pantryUrl + '/' + id);
  }

  addPantryItem(newPantryItem: Pantry): Observable<string> {
    // Send post request to add a new pantry product with the pantry product data as the body.
    return this.httpClient.post<{id: string}>(this.pantryUrl, newPantryItem).pipe(map(res => res.id));
  }

  filterPantryItems(pantryItems: Pantry[], filters: PantryFilters): Pantry[] {
    let filteredPantry = pantryItems;

    if (filters.product) {
      filters.product = filters.product.toLowerCase();

      filteredPantry = filteredPantry.filter(pantry => pantry.product.toLowerCase().indexOf(filters.product) >= 0);
    }

    return filteredPantry;
  }

}
