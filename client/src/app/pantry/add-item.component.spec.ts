import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule, FormGroup, AbstractControl } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ActivatedRoute } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { MockPantryService } from 'src/testing/pantry.service.mock';
import { MockProductService } from 'src/testing/product.service.mock';
import { ProductService } from '../products/product.service';

import { AddItemComponent } from './add-item.component';
import { PantryService } from './pantry.service';

describe('AddItemComponent', () => {
  let addItemComponent: AddItemComponent;
  let addPantryForm: FormGroup;
  let fixture: ComponentFixture<AddItemComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [
        FormsModule,
        ReactiveFormsModule,
        MatSnackBarModule,
        MatCardModule,
        MatFormFieldModule,
        MatInputModule,
        MatSelectModule,
        BrowserAnimationsModule,
        RouterTestingModule
      ],
      declarations: [AddItemComponent],
      providers: [{ provide: PantryService, useValue: new MockPantryService() },
                  { provide: ProductService, useValue: new MockProductService()},
                  { provide: ActivatedRoute, useValue: new ActivatedRoute() }]
    }).compileComponents().catch(error => {
      expect(error).toBeNull();
    });
  }));
  beforeEach(() => {
    fixture = TestBed.createComponent(AddItemComponent);
    addItemComponent = fixture.componentInstance;
    addItemComponent.ngOnInit();
    fixture.detectChanges();
    addPantryForm = addItemComponent.addPantryForm;
    expect(addPantryForm).toBeDefined();
    expect(addPantryForm.controls).toBeDefined();
  });

  it('should create the component and form', () => {
    expect(addItemComponent).toBeTruthy();
    expect(addPantryForm).toBeTruthy();
  });

  it('should have an invalid form when empty', () => {
    expect(addPantryForm.valid).toBeFalsy();
  });

  describe('The product field', () => {
    let productControl: AbstractControl;

    beforeEach(() => {
      productControl = addItemComponent.addPantryForm.controls.product;
    });
    it('should be fine with "Granny Smith Apples"', () => {
      productControl.setValue('Granny Smith Apples');
      expect(productControl.valid).toBeTruthy();
    });
    it('should not be fine with "g s apples"', () => {
      productControl.setValue('g s apples');
      expect(productControl.valid).toBeFalsy();
    });
    it('should be fine with "granny smith apples"', () => {
      productControl.setValue('granny smith apples');
      expect(productControl.valid).toBeTruthy();
    });
    it('should be fine with "gRAnnY sMith APPLES"', () => {
      productControl.setValue('gRAnnY sMith APPLES');
      expect(productControl.valid).toBeTruthy();
    });
  });
});
