import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule, FormGroup, AbstractControl } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouterTestingModule } from '@angular/router/testing';
import { MockProductService } from 'src/testing/product.service.mock';
import { AddProductComponent } from './add-product.component';
import { ProductService } from './product.service';

describe('AddProductComponent', () => {
  let addProductComponent: AddProductComponent;
  let addProductForm: FormGroup;
  let fixture: ComponentFixture<AddProductComponent>;

  beforeEach(async () => {
    TestBed.configureTestingModule({
      imports: [
        FormsModule,
        ReactiveFormsModule,
        MatSnackBarModule,
        MatCardModule,
        MatFormFieldModule,
        MatSelectModule,
        MatInputModule,
        BrowserAnimationsModule,
        RouterTestingModule
      ],
      declarations: [AddProductComponent],
      providers: [{ provide: ProductService, useValue: new MockProductService() }]
    })
      .compileComponents().catch(error => {
        expect(error).toBeNull();
      });

    beforeEach(() => {
      fixture = TestBed.createComponent(AddProductComponent);
      addProductComponent = fixture.componentInstance;
      addProductComponent.ngOnInit();
      fixture.detectChanges();
      addProductForm = addProductComponent.addProductForm;
      expect(addProductForm).toBeDefined();
      expect(addProductForm.controls).toBeDefined();
    });

    it('should create the component and form', () => {
      expect(addProductComponent).toBeTruthy();
      expect(addProductForm).toBeTruthy();
    });

    // Confirms that an initial, empty form is *not* valid, so
    // people can't submit an empty form.
    it('form should be invalid when empty', () => {
      expect(addProductForm.valid).toBeFalsy();
    });

    describe('The productName field', () => {
      let productNameControl: AbstractControl;

      beforeEach(() => {
        productNameControl = addProductComponent.addProductForm.controls.productName;
      });

      it('should not allow empty productNames', () => {
        productNameControl.setValue('');
        expect(productNameControl.valid).toBeFalsy();
      });

      it('should be fine with "granny smith apples"', () => {
        productNameControl.setValue('granny smith apples');
        expect(productNameControl.valid).toBeTruthy();
      });

      it('should fail on single character productNames', () => {
        productNameControl.setValue('x');
        expect(productNameControl.valid).toBeFalsy();
        // Annoyingly, Angular uses lowercase 'l' here
        // when it's an upper case 'L' in `Validators.minLength(2)`.
        expect(productNameControl.hasError('minlength')).toBeTruthy();
      });

      // In the real world, you'd want to be pretty careful about
      // setting upper limits on things like productName lengths just
      // because there are products with really long names.
      it('should fail on really long productNames', () => {
        productNameControl.setValue('x'.repeat(101));
        expect(productNameControl.valid).toBeFalsy();
        // Annoyingly, Angular uses lowercase 'l' here
        // when it's an upper case 'L' in `Validators.maxLength(2)`.
        expect(productNameControl.hasError('maxlength')).toBeTruthy();
      });
      it('should allow digits in the productName', () => {
        productNameControl.setValue('Bad2Th3B0ne');
        expect(productNameControl.valid).toBeTruthy();
      });

    });
    describe('The threshold field', () => {
      let thresholdControl: AbstractControl;

      beforeEach(() => {
        thresholdControl = addProductComponent.addProductForm.controls.threshold;
      });

      it('should not allow empty thresholds', () => {
        thresholdControl.setValue('');
        expect(thresholdControl.valid).toBeFalsy();
      });

      it('should be fine with "7"', () => {
        thresholdControl.setValue(7);
        expect(thresholdControl.valid).toBeTruthy();
      });
    });
  });
});
