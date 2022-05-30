import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';


@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor(private _http: HttpClient) { }

  async login(body: any) {
    return await this._http.post(`${environment.apiUrl}/admin/login-admin`, body)
  }
}
