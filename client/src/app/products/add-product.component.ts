import { Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { Product } from './product';
import { ProductService } from './product.service';
@Component({
  selector: 'app-add-product',
  templateUrl: './add-product.component.html',
  styleUrls: ['./add-product.component.scss']
})
export class AddProductComponent implements OnInit {

  addProductForm: FormGroup;

  product: Product;
  addProductValidationMessages = {
    productName: [
      { type: 'required', message: 'Name is required' },
      { type: 'minlength', message: 'Name must be at least 2 characters long' },
      { type: 'maxlength', message: 'Name cannot be longer than 100 characters long' },
    ],
    threshold: [
      {  type: 'min', message: 'Minimum quantity can not be less than 0' },
      {  type: 'pattern', message: 'Age must be a whole number'},
    ],
    tags: [
      { type:  'minlength', message: 'Tag must be at least 2 characters long.'},
      { type: 'maxlength', message: 'Tag cannot be longer than 100 characters'}
    ]
  };
  constructor(private fb: FormBuilder, private productService: ProductService, private snackBar: MatSnackBar, private router: Router) { }

  get tags() {
    return this.addProductForm.controls.tags as FormArray;
  }

  createForms() {

    // add user form validations
    this.addProductForm = this.fb.group({
      // We allow alphanumeric input and limit the length for name.
      productName: new FormControl('', Validators.compose([
        Validators.required,
        Validators.minLength(2),
        // In the real world you'd want to be very careful about having
        // an upper limit like this because people can sometimes have
        // very long names. This demonstrates that it's possible, though,
        // to have maximum length limits.
        Validators.maxLength(100),
      ])),
      threshold: new FormControl('', Validators.compose([
        Validators.min(0),
        Validators.pattern('^[0-9]+$')
      ])),
      tags: this.fb.array([])
    });
  }
  ngOnInit() {
    this.createForms();
  }

  addTag() {
   const tagForm = this.fb.group({
     tag: new FormControl('', Validators.compose([
       Validators.min(2),
       Validators.max(100)
     ])),
   });

   this.tags.push(tagForm);
  }

  deleteTag(tagIndex: number) {
    this.tags.removeAt(tagIndex);
  }

  submitForm() {
    console.log(this.addProductForm.value);
    this.productService.addProduct(this.addProductForm.value).subscribe(newID => {
      this.snackBar.open('Added Product ' + this.addProductForm.value.productName, null, {
        duration: 2000,
      });
      this.router.navigate(['/products/', newID]);
    }, err => {
      this.snackBar.open('Failed to add the product', 'OK', {
        duration: 5000,
      });
    });
  }

}

