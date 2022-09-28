import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';



@Injectable({
  providedIn: 'root'
})
export class InventoryService {

  constructor(private _http: HttpClient) { }

   getInventory() {
    return  this._http.get(`${environment.apiUrl}/inventory/get-inventory`)
  }

  getSales(date, fromDate: any = "", toDate: any = "", cutomer_id: any = ""){

    let url = "/sales?"

    if(date)
      url += `date=${date}&`
    if(fromDate && toDate)
      url += `from_date=${fromDate}&to_date=${toDate}&`
    if(cutomer_id)
      url += `customer_id=${cutomer_id}&`

    return  this._http.get(`${environment.apiUrl}${url}`)
  }

  addSale(body){
    return this._http.post(`${environment.apiUrl}/sales`, body)
  }

  addStock(body){
    return this._http.post(`${environment.apiUrl}/inventory`, body)
  }

  addSellingPrice(body){
    return this._http.post(`${environment.apiUrl}/inventory/add-selling-price`, body)
  }
  
}
