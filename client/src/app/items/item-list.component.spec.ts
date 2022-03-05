import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatOptionModule } from '@angular/material/core';
import { MatDividerModule } from '@angular/material/divider';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatListModule } from '@angular/material/list';
import { MatRadioModule } from '@angular/material/radio';
import { MatSelectModule } from '@angular/material/select';
import { MatTooltipModule } from '@angular/material/tooltip';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouterTestingModule } from '@angular/router/testing';
import { Observable } from 'rxjs';
import { MockItemService } from '../../testing/item.service.mock';
import { Item } from './item';
import { ItemCardComponent } from './item-card.component';
import { ItemListComponent } from './item-list.component';
import { ItemService } from './item.service';
import { MatIconModule } from '@angular/material/icon';

const COMMON_IMPORTS: any[] = [
  FormsModule,
  MatCardModule,
  MatFormFieldModule,
  MatSelectModule,
  MatOptionModule,
  MatButtonModule,
  MatInputModule,
  MatExpansionModule,
  MatTooltipModule,
  MatListModule,
  MatDividerModule,
  MatRadioModule,
  MatIconModule,
  BrowserAnimationsModule,
  RouterTestingModule,
];

describe('item list', () => {

  let itemList: ItemListComponent;
  let fixture: ComponentFixture<ItemListComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [COMMON_IMPORTS],
      declarations: [ItemListComponent, ItemCardComponent],
      // providers:    [ ItemService ]  // NO! Don't provide the real service!
      // Provide a test-double instead
      providers: [{ provide: ItemService, useValue: new MockItemService() }]
    });
  });

  beforeEach(waitForAsync(() => {
    TestBed.compileComponents().then(() => {
      fixture = TestBed.createComponent(ItemListComponent);
      itemList = fixture.componentInstance;
      fixture.detectChanges();
    });
  }));

  it('contains all the items', () => {
    expect(itemList.serverFilteredItems.length).toBe(3);
  });

  it('contains a item named \'Granny Smith Apples\'', () => {
    expect(itemList.serverFilteredItems.some((item: Item) => item.name === 'Granny Smith Apples')).toBe(true);
  });

  it('contains a item named \'Sirloin Steak\'', () => {
    expect(itemList.serverFilteredItems.some((item: Item) => item.name === 'Sirloin Steak')).toBe(true);
  });

  it('doesn\'t contain a item named \'Macadamia-Nut Cookies\'', () => {
    expect(itemList.serverFilteredItems.some((item: Item) => item.name === 'Macadamia-Nut Cookies')).toBe(false);
  });

});

describe('Misbehaving Item List', () => {
  let itemList: ItemListComponent;
  let fixture: ComponentFixture<ItemListComponent>;

  let itemServiceStub: {
    getItems: () => Observable<Item[]>;
    getItemsFiltered: () => Observable<Item[]>;
  };

  beforeEach(() => {
    // stub ItemService for test purposes
    itemServiceStub = {
      getItems: () => new Observable(observer => {
        observer.error('Error-prone observable');
      }),
      getItemsFiltered: () => new Observable(observer => {
        observer.error('Error-prone observable');
      })
    };

    TestBed.configureTestingModule({
      imports: [COMMON_IMPORTS],
      declarations: [ItemListComponent],
      // providers:    [ ItemService ]  // NO! Don't provide the real service!
      // Provide a test-double instead
      providers: [{ provide: ItemService, useValue: itemServiceStub }]
    });
  });

  beforeEach(waitForAsync(() => {
    TestBed.compileComponents().then(() => {
      fixture = TestBed.createComponent(ItemListComponent);
      itemList = fixture.componentInstance;
      fixture.detectChanges();
    });
  }));

  it('generates an error if we don\'t set up a ItemListService', () => {
    // Since the observer throws an error, we don't expect items to be defined.
    expect(itemList.serverFilteredItems).toBeUndefined();
  });
});
