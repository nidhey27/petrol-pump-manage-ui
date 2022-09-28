import { Component, OnInit } from '@angular/core';
import { ToastrService } from "ngx-toastr";
import { CustomersService } from 'src/app/services/auth/customers.service';
import { InventoryService } from 'src/app/services/dashboard/inventory.service';

@Component({
  selector: 'app-reports',
  templateUrl: './reports.component.html',
  styleUrls: ['./reports.component.scss']
})
export class ReportsComponent implements OnInit {
  salesData: any;
  totalSaleQty: any;
  totalPurchasePrice: number;
  date = new Date()
  day = this.date.getDate()
  mon = this.date.getMonth() + 1
  year = this.date.getFullYear()
  todayDate = `${this.year}-${this.mon <= 9 ? '0' + this.mon : this.mon}-${this.day <= 9 ? '0' + this.day : this.day}`
  customersData: any;
  custId: any = "";

  fromDate:any = ""
  toDate:any = ""


  constructor(
    private _inventory: InventoryService,
    // private datePipe: DatePipe
    private toastr: ToastrService,
    private _cust: CustomersService
  ) { }

  async ngOnInit() {
    this.getSales();
    (await this._cust.getAllCustomers()).subscribe((res: any) => {
      if (res.status) {
        // console.log(res);     
        this.customersData = res.data
      }


    })
  }
  setCustomer(e) {
    this.custId = e
  }
  setFromDate(e) {
    this.fromDate = e
    this.todayDate = ""
  }
  setToDate(e) {
    this.toDate = e
    this.todayDate = ""
  }
  setDate(e) {
    this.todayDate = e
    this.fromDate = ""
    this.toDate = ""
  }
  
  async getSales() {
    this.totalSaleQty = 0
    this.totalSaleQty = 0
    this.totalPurchasePrice = 0

    await this._inventory.getSales(this.todayDate, this.fromDate, this.toDate, this.custId).subscribe((res: any) => {
      this.salesData = res.data
      console.log(res);
      this.showNotification('top', 'right', "Sales data fetched", res.status)



      let salesValue = []
      let salesLabels = []

      salesValue.push(this.salesData.map(e => {
        this.totalSaleQty += e.quantity

        this.totalSaleQty += e.quantity * e.selling_price
        this.totalPurchasePrice += e.quantity * e.purchase_price
        return e.quantity
      }))

      salesLabels.push(this.salesData.map(e => {
        return e.customer_tbl.name
      }))
      console.warn(salesValue[0], salesLabels)




    })
  }

  showNotification(from, align, msg, status) {
    if (status) {
      this.toastr.success(`${msg}`, '', {
        disableTimeOut: false,
        closeButton: true,
        enableHtml: true,
        toastClass: "alert alert-success alert-with-icon",
        positionClass: 'toast-' + from + '-' + align
      });
    } else {
      this.toastr.warning(` ${msg}`, '', {
        disableTimeOut: false,
        closeButton: true,
        enableHtml: true,
        toastClass: "alert alert-warning alert-with-icon",
        positionClass: 'toast-' + from + '-' + align
      });
    }
  }
}
