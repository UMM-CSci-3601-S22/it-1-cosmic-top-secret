import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators, AbstractControl, ValidatorFn } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { Pantry } from './pantry';
import { PantryService } from './pantry.service';
import { ProductService } from '../products/product.service';
import { Product } from '../products/product';


@Component({
  selector: 'app-add-item',
  templateUrl: './add-item.component.html',
  styleUrls: ['./add-item.component.scss']
})
export class AddItemComponent implements OnInit {
  addPantryForm: FormGroup;
  validProducts: string[];
  pantry: Pantry;
  addPantryValidationMessages = {
    product: [
      { type: 'required', message: 'Product is Required' },
      { type: 'product validity', message: 'Product needs to be valid' }
    ],
  };

  constructor(private fb: FormBuilder, private productService: ProductService,
     private pantryService: PantryService, private snackBar: MatSnackBar, private router: Router) {
    this.validProducts = this.getAllOfMyProductsForMePlease();
  }

  inputValidator(val) {
    return (control: AbstractControl): { [key: string]: boolean } | null => {
      if (
        control.value !== null && !val.includes(control.value)
      ) {
        return { inputValidator: true };
      }
      return null;
    };
  }
  getAllOfMyProductsForMePlease(): string[] {
    let products: Product[];
    this.productService.getProducts().subscribe(returnedProducts => {
      products = returnedProducts;});
    let productNames: string[];
    for (const prod of products){
      productNames.push(prod.productName);
    }
    return productNames;
  }
  createForms() {
    this.addPantryForm = this.fb.group({
      product: new FormControl('', Validators.compose([
        Validators.required,
        this.inputValidator(this.validProducts) // shamelessly yoinked from https://stackoverflow.com/questions/65229504/
      ]))
    });
  }
  ngOnInit(): void {
    this.createForms();
  }
  submitForm() {
    this.pantryService.addPantryItem(this.addPantryForm.value).subscribe(newID => {
      this.snackBar.open('Added Item ' + this.addPantryForm.value.name, null, {
        duration: 2000,
      });
      this.router.navigate(['/pantry/', newID]);
    }, err => {
      this.snackBar.open('Failed to Add the item', 'OK', {
        duration: 5000,
      });
    });
  }
}
