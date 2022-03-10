import { Component, OnInit, OnDestroy } from '@angular/core';
import { Pantry } from './pantry';
import { PantryService } from './pantry.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-pantry-list-component',
  templateUrl: 'pantry-list.component.html',
  styleUrls: ['./pantry-list.component.scss'],
  providers: []
})

export class PantryListComponent implements OnInit, OnDestroy  {
  // These are public so that tests can reference them (.spec.ts)
  public serverFilteredPantry: Pantry[];
  public filteredPantry: Pantry[];

  public productId: string;
  public viewType: 'card' | 'list' = 'card';
  getPantrySub: Subscription;


  // Inject the PantryService into this component.
  // That's what happens in the following constructor.
  //
  // We can call upon the service for interacting
  // with the server.

  constructor(private pantryService: PantryService) {

  }

  getPantryFromServer(): void {
    this.unsub();
    this.getPantrySub = this.pantryService.getPantry().subscribe(returnedPantry => {
      this.serverFilteredPantry = returnedPantry;
      this.updateFilter();
    }, err => {
      console.log(err);
    });
  }


  public updateFilter(): void {
    this.filteredPantry = this.pantryService.filterPantryItems(
      this.serverFilteredPantry, { productId: this.productId });
  }


  /**
   * Starts an asynchronous operation to update the pantry products list
   *
   */
  ngOnInit(): void {
    this.getPantryFromServer();
  }

  ngOnDestroy(): void {
    this.unsub();
  }

  unsub(): void {
    if (this.getPantrySub) {
      this.getPantrySub.unsubscribe();
    }
  }
}
