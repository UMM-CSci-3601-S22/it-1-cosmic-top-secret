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
import { MockPantryService } from '../../testing/pantry.service.mock';
import { Pantry } from './pantry';
import { PantryCardComponent } from './pantry-card.component';
import { PantryListComponent } from './pantry-list.component';
import { PantryService } from './pantry.service';
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

describe('pantry list', () => {

  let pantryList: PantryListComponent;
  let fixture: ComponentFixture<PantryListComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [COMMON_IMPORTS],
      declarations: [PantryListComponent, PantryCardComponent],
      // providers:    [ PantryService ]  // NO! Don't provide the real service!
      // Provide a test-double instead
      providers: [{ provide: PantryService, useValue: new MockPantryService() }]
    });
  });

  beforeEach(waitForAsync(() => {
    TestBed.compileComponents().then(() => {
      fixture = TestBed.createComponent(PantryListComponent);
      pantryList = fixture.componentInstance;
      fixture.detectChanges();
    });
  }));


});

describe('Misbehaving Pantry List', () => {
  let pantryList: PantryListComponent;
  let fixture: ComponentFixture<PantryListComponent>;

  let pantryServiceStub: {
    getPantry: () => Observable<Pantry[]>;
    getPantryFiltered: () => Observable<Pantry[]>;
  };

  beforeEach(() => {
    // stub PantryService for test purposes
    pantryServiceStub = {
      getPantry: () => new Observable(observer => {
        observer.error('Error-prone observable');
      }),
      getPantryFiltered: () => new Observable(observer => {
        observer.error('Error-prone observable');
      })
    };

    TestBed.configureTestingModule({
      imports: [COMMON_IMPORTS],
      declarations: [PantryListComponent],
      // providers:    [ ProductService ]  // NO! Don't provide the real service!
      // Provide a test-double instead
      providers: [{ provide: PantryService, useValue: pantryServiceStub }]
    });
  });

  beforeEach(waitForAsync(() => {
    TestBed.compileComponents().then(() => {
      fixture = TestBed.createComponent(PantryListComponent);
      pantryList = fixture.componentInstance;
      fixture.detectChanges();
    });
  }));

  it('generates an error if we don\'t set up a PantryListService', () => {
    // Since the observer throws an error, we don't expect pantry items to be defined.
    expect(pantryList.serverFilteredPantry).toBeUndefined();
  });
});
