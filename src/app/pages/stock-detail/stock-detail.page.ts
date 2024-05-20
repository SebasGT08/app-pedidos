import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Product } from 'src/app/models/product.model';

@Component({
  selector: 'app-stock-detail',
  templateUrl: './stock-detail.page.html',
  styleUrls: ['./stock-detail.page.scss'],
})
export class StockDetailPage implements OnInit {

  product: Product | undefined;

  constructor(private route: ActivatedRoute) { }

  ngOnInit() {
    // Obtén los parámetros de la URL
    this.route.queryParams.subscribe(params => {
      if (params && params['product']) {
        // Parsea el producto desde la cadena JSON
        this.product = JSON.parse(params['product']);
        console.log(this.product); // Haz algo con el producto, como mostrarlo en la página
      }
    });
  }

}
