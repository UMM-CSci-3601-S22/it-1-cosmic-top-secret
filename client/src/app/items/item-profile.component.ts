import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Item } from './item';
import { ItemService } from './item.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-item-profile',
  templateUrl: './item-profile.component.html',
  styleUrls: ['./item-profile.component.scss']
})
export class ItemProfileComponent implements OnInit, OnDestroy {

  item: Item;
  id: string;
  getItemSub: Subscription;

  constructor(private route: ActivatedRoute, private itemService: ItemService) { }

  ngOnInit(): void {
    // We subscribe to the parameter map here so we'll be notified whenever
    // that changes (i.e., when the URL changes) so this component will update
    // to display the newly requested Item.
    this.route.paramMap.subscribe((pmap) => {
      this.id = pmap.get('id');
      if (this.getItemSub) {
        this.getItemSub.unsubscribe();
      }
      this.getItemSub = this.itemService.getItemById(this.id).subscribe(item => this.item = item);
    });
  }

  ngOnDestroy(): void {
    if (this.getItemSub) {
      this.getItemSub.unsubscribe();
    }
  }

}
