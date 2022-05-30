import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class CustomersService {

  constructor(private _http: HttpClient) { }


  async getAllCustomers() {
    return await this._http.get(`${environment.apiUrl}/customer`)
  }

   addCustomer(name) {
    return  this._http.post(`${environment.apiUrl}/customer`, { name })
  }

}
