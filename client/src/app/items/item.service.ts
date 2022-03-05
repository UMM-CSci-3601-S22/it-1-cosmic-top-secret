import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Item } from './item';
import { map } from 'rxjs/operators';

@Injectable()
export class ItemService {
  readonly itemUrl: string = environment.apiUrl + 'items';

  constructor(private httpClient: HttpClient) {
  }

  getItems(): Observable<Item[]> {
    const httpParams: HttpParams = new HttpParams();
    return this.httpClient.get<Item[]>(this.itemUrl, {
      params: httpParams,
    });
  }

  getItemById(id: string): Observable<Item> {
    return this.httpClient.get<Item>(this.itemUrl + '/' + id);
  }

  addItem(newItem: Item): Observable<string> {
    // Send post request to add a new item with the item data as the body.
    return this.httpClient.post<{id: string}>(this.itemUrl, newItem).pipe(map(res => res.id));
  }
}
