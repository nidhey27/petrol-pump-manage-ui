import { Component, OnInit } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { CustomersService } from 'src/app/services/auth/customers.service';

@Component({
  selector: 'app-customers',
  templateUrl: './customers.component.html',
  styleUrls: ['./customers.component.scss']
})
export class CustomersComponent implements OnInit {

  customers = []
  customerName = ""
  constructor(
    private _cust: CustomersService,
    private toastr: ToastrService
  ) { }

  async ngOnInit() {

    (await this._cust.getAllCustomers()).subscribe((res: any) => {
      this.customers = res.data
    })
    
  }

  async addCustomer(){
    // alert(this.customerName)
    await this._cust.addCustomer(this.customerName).subscribe((res: any) => {
      if(res.status){
        this.showNotification('top', 'right', res.message, res.status)

        setTimeout(() => {
          window.location.reload()
        }, 2000)
      }else{
        this.showNotification('top', 'right', res.message, res.status)
      }
    })
  }

  showNotification(from, align, msg, status){
    if(status){
      this.toastr.success(`${msg}`, '', {
        disableTimeOut: false,
        closeButton: true,
        enableHtml: true,
        toastClass: "alert alert-success alert-with-icon",
        positionClass: 'toast-' + from + '-' +  align
      });
    }else{
      this.toastr.warning(` ${msg}`, '', {
        disableTimeOut: false,
        closeButton: true,
        enableHtml: true,
        toastClass: "alert alert-warning alert-with-icon",
        positionClass: 'toast-' + from + '-' +  align
      });
    }
  }

  updateCustomerName(e){
    this.customerName = e 
  }

}
