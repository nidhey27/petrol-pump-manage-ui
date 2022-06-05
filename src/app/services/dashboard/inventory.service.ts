import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';



@Injectable({
  providedIn: 'root'
})
export class InventoryService {

  constructor(private _http: HttpClient) { }

   getInventory(date) {
    return  this._http.get(`${environment.apiUrl}/inventory?date=${date}`)
  }

  getSales(date){
    return  this._http.get(`${environment.apiUrl}/sales?date=${date}`)
  }

  addSale(body){
    return this._http.post(`${environment.apiUrl}/sales`, body)
  }

  addStock(body){
    return this._http.post(`${environment.apiUrl}/inventory`, body)
  }
  
}
