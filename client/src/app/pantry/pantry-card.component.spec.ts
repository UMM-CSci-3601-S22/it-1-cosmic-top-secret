import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { PantryCardComponent } from './pantry-card.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatCardModule } from '@angular/material/card';

describe('PantryCardComponent', () => {
  let component: PantryCardComponent;
  let fixture: ComponentFixture<PantryCardComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [
        BrowserAnimationsModule,
        MatCardModule
      ],
      declarations: [ PantryCardComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PantryCardComponent);
    component = fixture.componentInstance;
    component.pantry = {
      _id: 'OPEGOSH',
      productId: 'ApplesID',
      product: 'apple',
      tags: ['fruit','edible'],
    };
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
