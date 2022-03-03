import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule, FormGroup, AbstractControl } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouterTestingModule } from '@angular/router/testing';
import { MockItemService } from 'src/testing/item.service.mock';
import { AddItemComponent } from './add-item.component';
import { ItemService } from './item.service';

describe('AddItemComponent', () => {
  let addItemComponent: AddItemComponent;
  let addItemForm: FormGroup;
  let fixture: ComponentFixture<AddItemComponent>;

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
      declarations: [AddItemComponent],
      providers: [{ provide: ItemService, useValue: new MockItemService() }]
    })
      .compileComponents().catch(error => {
        expect(error).toBeNull();
      });

    beforeEach(() => {
      fixture = TestBed.createComponent(AddItemComponent);
      addItemComponent = fixture.componentInstance;
      addItemComponent.ngOnInit();
      fixture.detectChanges();
      addItemForm = addItemComponent.addItemForm;
      expect(addItemForm).toBeDefined();
      expect(addItemForm.controls).toBeDefined();
    });

    it('should create the component and form', () => {
      expect(addItemComponent).toBeTruthy();
      expect(addItemForm).toBeTruthy();
    });

    // Confirms that an initial, empty form is *not* valid, so
    // people can't submit an empty form.
    it('form should be invalid when empty', () => {
      expect(addItemForm.valid).toBeFalsy();
    });

    describe('The name field', () => {
      let nameControl: AbstractControl;

      beforeEach(() => {
        nameControl = addItemComponent.addItemForm.controls.name;
      });

      it('should not allow empty names', () => {
        nameControl.setValue('');
        expect(nameControl.valid).toBeFalsy();
      });

      it('should be fine with "granny smith apples"', () => {
        nameControl.setValue('granny smith apples');
        expect(nameControl.valid).toBeTruthy();
      });

      it('should fail on single character names', () => {
        nameControl.setValue('x');
        expect(nameControl.valid).toBeFalsy();
        // Annoyingly, Angular uses lowercase 'l' here
        // when it's an upper case 'L' in `Validators.minLength(2)`.
        expect(nameControl.hasError('minlength')).toBeTruthy();
      });

      // In the real world, you'd want to be pretty careful about
      // setting upper limits on things like name lengths just
      // because there are people with really long names.
      it('should fail on really long names', () => {
        nameControl.setValue('x'.repeat(101));
        expect(nameControl.valid).toBeFalsy();
        // Annoyingly, Angular uses lowercase 'l' here
        // when it's an upper case 'L' in `Validators.maxLength(2)`.
        expect(nameControl.hasError('maxlength')).toBeTruthy();
      });
      it('should allow digits in the name', () => {
        nameControl.setValue('Bad2Th3B0ne');
        expect(nameControl.valid).toBeTruthy();
      });

    });
  });
});
