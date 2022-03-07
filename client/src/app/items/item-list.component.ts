import { Component, OnInit, OnDestroy } from '@angular/core';
import { Item } from './item';
import { ItemService } from './item.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-item-list-component',
  templateUrl: 'item-list.component.html',
  styleUrls: ['./item-list.component.scss'],
  providers: []
})

export class ItemListComponent implements OnInit, OnDestroy  {
  // These are public so that tests can reference them (.spec.ts)
  public serverFilteredItems: Item[];
  public filteredItems: Item[];

  public itemName: string;
  public viewType: 'card' | 'list' = 'card';
  getItemsSub: Subscription;


  // Inject the ItemService into this component.
  // That's what happens in the following constructor.
  //
  // We can call upon the service for interacting
  // with the server.

  constructor(private itemService: ItemService) {

  }

  getItemsFromServer(): void {
    this.unsub();
    this.getItemsSub = this.itemService.getItems().subscribe(returnedItems => {
      this.serverFilteredItems = returnedItems;
      /*this.updateFilter();*/
    }, err => {
      console.log(err);
    });
  }

/* Filtering
  public updateFilter(): void {
    this.filteredItems = this.itemService.filterItems(
      this.serverFilteredItems, { name: this.itemName });
  }
*/

  /**
   * Starts an asynchronous operation to update the items list
   *
   */
  ngOnInit(): void {
    this.getItemsFromServer();
  }

  ngOnDestroy(): void {
    this.unsub();
  }

  unsub(): void {
    if (this.getItemsSub) {
      this.getItemsSub.unsubscribe();
    }
  }
}
