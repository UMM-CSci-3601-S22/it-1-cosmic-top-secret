import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { MatCardModule } from '@angular/material/card';
import { ActivatedRoute } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { ActivatedRouteStub } from '../../testing/activated-route-stub';
import { MockItemService } from '../../testing/item.service.mock';
import { Item } from './item';
import { ItemCardComponent } from './item-card.component';
import { ItemProfileComponent } from './item-profile.component';
import { ItemService } from './item.service';

describe('ItemProfileComponent', () => {
  let component: ItemProfileComponent;
  let fixture: ComponentFixture<ItemProfileComponent>;
  const activatedRoute: ActivatedRouteStub = new ActivatedRouteStub();

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [
        RouterTestingModule,
        MatCardModule
      ],
      declarations: [ItemProfileComponent, ItemCardComponent],
      providers: [
        { provide: ItemService, useValue: new MockItemService() },
        { provide: ActivatedRoute, useValue: activatedRoute }
      ]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ItemProfileComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should navigate to a specific item profile', () => {
    const expectedItem: Item = MockItemService.testItems[0];
    // Setting this should cause anyone subscribing to the paramMap
    // to update. Our `ItemProfileComponent` subscribes to that, so
    // it should update right away.
    activatedRoute.setParamMap({ id: expectedItem._id });

    expect(component.id).toEqual(expectedItem._id);
    expect(component.item).toEqual(expectedItem);
  });

  it('should navigate to correct item when the id parameter changes', () => {
    let expectedItem: Item = MockItemService.testItems[0];
    // Setting this should cause anyone subscribing to the paramMap
    // to update. Our `ItemProfileComponent` subscribes to that, so
    // it should update right away.
    activatedRoute.setParamMap({ id: expectedItem._id });

    expect(component.id).toEqual(expectedItem._id);

    // Changing the paramMap should update the displayed item profile.
    expectedItem = MockItemService.testItems[1];
    activatedRoute.setParamMap({ id: expectedItem._id });

    expect(component.id).toEqual(expectedItem._id);
  });

  it('should have `null` for the item for a bad ID', () => {
    activatedRoute.setParamMap({ id: 'badID' });

    // If the given ID doesn't map to a Item, we expect the service
    // to return `null`, so we would expect the component's item
    // to also be `null`.
    expect(component.id).toEqual('badID');
    expect(component.item).toBeNull();
  });
});
