import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ItemProfileComponent } from './item-profile.component';

describe('ItemProfileComponent', () => {
  let component: ItemProfileComponent;
  let fixture: ComponentFixture<ItemProfileComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ItemProfileComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ItemProfileComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
