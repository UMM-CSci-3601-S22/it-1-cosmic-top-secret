import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
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
    name: [
      { type: 'required', message: 'Name is required' },
      { type: 'minlength', message: 'Name must be at least 2 characters long' },
      { type: 'maxlength', message: 'Name cannot be more than 100 characters long' },
    ],
    threshold: [
      {  type: 'required', message: 'threshold is required' },
    ]
  };
  constructor(private fb: FormBuilder, private productService: ProductService, private snackBar: MatSnackBar, private router: Router) { }


  createForms() {

    // add user form validations
    this.addProductForm = this.fb.group({
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
    this.addProductForm = this.fb.group({
      threshold: new FormControl('', Validators.compose([
        Validators.required
      ]))
    });
  }
  ngOnInit() {
    this.createForms();
  }

  submitForm() {
    this.productService.addProduct(this.addProductForm.value).subscribe(newID => {
      this.snackBar.open('Added Product ' + this.addProductForm.value.name, null, {
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

