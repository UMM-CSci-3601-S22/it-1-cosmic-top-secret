import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { Item } from './item';
import { ItemService } from './item.service';
@Component({
  selector: 'app-add-item',
  templateUrl: './add-item.component.html',
  styleUrls: ['./add-item.component.scss']
})
export class AddItemComponent implements OnInit {

  addItemForm: FormGroup;

  item: Item;
  addItemValidationMessages = {
    name: [
      { type: 'required', message: 'Name is required' },
      { type: 'minlength', message: 'Name must be at least 2 characters long' },
      { type: 'maxlength', message: 'Name cannot be more than 100 characters long' },
    ],
  };
  constructor(private fb: FormBuilder, private itemService: ItemService, private snackBar: MatSnackBar, private router: Router) { }


  createForms() {

    // add user form validations
    this.addItemForm = this.fb.group({
      // We allow alphanumeric input and limit the length for name.
      name: new FormControl('', Validators.compose([
        Validators.required,
        Validators.minLength(2),
        // In the real world you'd want to be very careful about having
        // an upper limit like this because people can sometimes have
        // very long names. This demonstrates that it's possible, though,
        // to have maximum length limits.
        Validators.maxLength(100),
      ])),

    });
  }
  ngOnInit() {
    this.createForms();
  }

  submitForm() {
    this.itemService.addItem(this.addItemForm.value).subscribe(newID => {
      this.snackBar.open('Added Item ' + this.addItemForm.value.name, null, {
        duration: 2000,
      });
      this.router.navigate(['/items/', newID]);
    }, err => {
      this.snackBar.open('Failed to add the item', 'OK', {
        duration: 5000,
      });
    });
  }

}

