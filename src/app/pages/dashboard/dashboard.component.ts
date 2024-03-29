import { Component, OnInit } from "@angular/core";
import Chart from 'chart.js';
import { ToastrService } from "ngx-toastr";
import { CustomersService } from "src/app/services/auth/customers.service";
import { InventoryService } from "src/app/services/dashboard/inventory.service";
// import { DatePipe } from '@angular/common';

@Component({
  selector: "app-dashboard",
  templateUrl: "dashboard.component.html"
})
export class DashboardComponent implements OnInit {
  public canvas: any;
  public ctx;
  public datasets: any;
  public data: any;
  public myChartData;
  public clicked: boolean = true;
  public clicked1: boolean = false;
  public clicked2: boolean = false;

  inventoryData = []
  salesData = []

  customersData = []
  custId = ""
  quantity = 0
  purchaseDate = ""
  paymentType = ""

  todaysSP = 0

  date = new Date()
  day = this.date.getDate()
  mon = this.date.getMonth() + 1
  year = this.date.getFullYear()

  stockPurchasePrice = 0
  stockSellingPrice = 0

  totalSaleQty = 0
  totalSaleAmt = 0
  totalPurchasePrice = 0

  totalOpenStock = 0
  totalCloseStock = 0

  setStockPurchasePrice(v) {
    this.stockPurchasePrice = v
  }

  setStockSellingPrice(v) {
    this.stockSellingPrice = v
  }
  setPaymentType(v){
    this.paymentType = v
  }


  todayDate = `${this.year}-${this.mon <= 9 ? '0' + this.mon : this.mon}-${this.day <= 9 ? '0' + this.day : this.day}`


  constructor(
    private _inventory: InventoryService,
    // private datePipe: DatePipe
    private toastr: ToastrService,
    private _cust: CustomersService
  ) { }

  async addStock() {


    if (this.quantity == 0 || this.stockPurchasePrice == 0 || this.purchaseDate == "")
      return this.showNotification('top', 'right', "All fields are required", false)

    await this._inventory.addStock({
      open_quantity: this.quantity,
      purchase_price: this.stockPurchasePrice,
      purchase_date: this.purchaseDate,
      added_by: sessionStorage.getItem("uid")
    }).subscribe((res: any) => {

      if (res.status) {
        this.showNotification('top', 'right', res.message, res.status)
        setTimeout(() => {
          window.location.reload()
        }, 2000)
      } else {
        this.showNotification('top', 'right', res.error, res.status)
      }
    })
  }

  async addSellingPrice() {
    if (this.stockSellingPrice == 0)
      return this.showNotification('top', 'right', "Selling Price are required", false)

    await this._inventory.addSellingPrice({
      selling_price: this.stockSellingPrice
    }).subscribe((res: any) => {

      if (res.status) {
        this.showNotification('top', 'right', res.message, res.status)
        setTimeout(() => {
          window.location.reload()
        }, 2000)
      } else {
        this.showNotification('top', 'right', res.error, res.status)
      }
    })
  }

  async addSale() {
    let body = {
      purchase_date: this.purchaseDate,
      c_id: this.custId,
      quantity: this.quantity,
      payment_type: this.paymentType
    }

    // return console.log(body);
    
    await this._inventory.addSale(body).subscribe((res: any) => {
      if (res.status) {
        this.showNotification('top', 'right', res.message, res.status)
        setTimeout(() => {
          window.location.reload()
        }, 2000)
      } else {
        this.showNotification('top', 'right', res.error, res.status)
      }
    })
  }

  setCustomer(e) {
    this.custId = e
  }
  setPruchaseDate(e) {
    this.purchaseDate = e
  }

  setQuantity(e) {
    this.quantity = e
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


  async fetchData(e) {
    // alert(this.todayDate)
    this.todayDate = e
    this.totalOpenStock = 0
    this.totalCloseStock = 0

    await this._inventory.getInventory().subscribe((res: any) => {


      if (res.status) {
        this.inventoryData = res.data

        this.inventoryData.forEach(e => {
          this.totalOpenStock += e.open_quantity
          this.totalCloseStock += e.close_quantity
        })
        this.todaysSP = res.selling_price
        this.showNotification('top', 'right', "Todays Sales Data Loaded", res.status)
      }

      // else if (res.data.length == 0) {
      //   this.inventoryData = res
      //   this.showNotification('top', 'right', res.message, false)
      // }




    });

    (await this._cust.getAllCustomers()).subscribe((res: any) => {
      if (res.status) {
        // console.log(res);     
        this.customersData = res.data
      }


    })




  }

  async getSales(date: String) {
    this.totalSaleQty = 0
    this.totalSaleAmt = 0
    this.totalPurchasePrice = 0

    await this._inventory.getSales(date ? date : this.todayDate).subscribe((res: any) => {
      this.salesData = res.data
      console.log(res);
      this.showNotification('top', 'right', "Sales data fetched", res.status)

      this.canvas = document.getElementById("CountryChart");
      this.ctx = this.canvas.getContext("2d");
      var gradientStroke = this.ctx.createLinearGradient(0, 230, 0, 50);

      gradientStroke.addColorStop(1, 'rgba(29,140,248,0.2)');
      gradientStroke.addColorStop(0.4, 'rgba(29,140,248,0.0)');
      gradientStroke.addColorStop(0, 'rgba(29,140,248,0)'); //blue colors


      let salesValue = []
      let salesLabels = []

      salesValue.push(this.salesData.map(e => {
        this.totalSaleQty += e.quantity

        this.totalSaleAmt += e.quantity * e.selling_price
        this.totalPurchasePrice += e.quantity * e.purchase_price
        return e.quantity
      }))

      salesLabels.push(this.salesData.map(e => {
        return e.customer_tbl.name
      }))
      console.warn(salesValue[0], salesLabels)

      var gradientBarChartConfiguration: any = {
        maintainAspectRatio: false,
        legend: {
          display: false
        },

        tooltips: {
          backgroundColor: '#f5f5f5',
          titleFontColor: '#333',
          bodyFontColor: '#666',
          bodySpacing: 4,
          xPadding: 12,
          mode: "nearest",
          intersect: 0,
          position: "nearest"
        },
        responsive: true,
        scales: {
          yAxes: [{

            gridLines: {
              drawBorder: false,
              color: 'rgba(29,140,248,0.1)',
              zeroLineColor: "transparent",
            },
            ticks: {
              suggestedMin: 60,
              suggestedMax: 120,
              padding: 20,
              fontColor: "#9e9e9e"
            }
          }],

          xAxes: [{

            gridLines: {
              drawBorder: false,
              color: 'rgba(29,140,248,0.1)',
              zeroLineColor: "transparent",
            },
            ticks: {
              padding: 20,
              fontColor: "#9e9e9e"
            }
          }]
        }
      };

      var myChart = new Chart(this.ctx, {
        type: 'bar',
        responsive: true,
        legend: {
          display: false
        },
        data: {
          labels: salesLabels[0],
          datasets: [{
            label: "Customers",
            fill: true,
            backgroundColor: gradientStroke,
            hoverBackgroundColor: gradientStroke,
            borderColor: '#1f8ef1',
            borderWidth: 2,
            borderDash: [],
            borderDashOffset: 0.0,
            data: salesValue[0],
          }]
        },
        options: gradientBarChartConfiguration
      });

      this.updateOptions()
    })
  }
  async ngOnInit() {
    // alert(this.todayDate)

    this.fetchData(this.todayDate)
    this.getSales(this.todayDate)

    setInterval(() => {
      this.fetchData(this.todayDate)
    }, 60 * 1000)


    var gradientChartOptionsConfigurationWithTooltipBlue: any = {
      maintainAspectRatio: false,
      legend: {
        display: false
      },

      tooltips: {
        backgroundColor: '#f5f5f5',
        titleFontColor: '#333',
        bodyFontColor: '#666',
        bodySpacing: 4,
        xPadding: 12,
        mode: "nearest",
        intersect: 0,
        position: "nearest"
      },
      responsive: true,
      scales: {
        yAxes: [{
          barPercentage: 1.6,
          gridLines: {
            drawBorder: false,
            color: 'rgba(29,140,248,0.0)',
            zeroLineColor: "transparent",
          },
          ticks: {
            suggestedMin: 60,
            suggestedMax: 125,
            padding: 20,
            fontColor: "#2380f7"
          }
        }],

        xAxes: [{
          barPercentage: 1.6,
          gridLines: {
            drawBorder: false,
            color: 'rgba(29,140,248,0.1)',
            zeroLineColor: "transparent",
          },
          ticks: {
            padding: 20,
            fontColor: "#2380f7"
          }
        }]
      }
    };

    var gradientChartOptionsConfigurationWithTooltipPurple: any = {
      maintainAspectRatio: false,
      legend: {
        display: false
      },

      tooltips: {
        backgroundColor: '#f5f5f5',
        titleFontColor: '#333',
        bodyFontColor: '#666',
        bodySpacing: 4,
        xPadding: 12,
        mode: "nearest",
        intersect: 0,
        position: "nearest"
      },
      responsive: true,
      scales: {
        yAxes: [{
          barPercentage: 1.6,
          gridLines: {
            drawBorder: false,
            color: 'rgba(29,140,248,0.0)',
            zeroLineColor: "transparent",
          },
          ticks: {
            suggestedMin: 60,
            suggestedMax: 125,
            padding: 20,
            fontColor: "#9a9a9a"
          }
        }],

        xAxes: [{
          barPercentage: 1.6,
          gridLines: {
            drawBorder: false,
            color: 'rgba(225,78,202,0.1)',
            zeroLineColor: "transparent",
          },
          ticks: {
            padding: 20,
            fontColor: "#9a9a9a"
          }
        }]
      }
    };

    var gradientChartOptionsConfigurationWithTooltipRed: any = {
      maintainAspectRatio: false,
      legend: {
        display: false
      },

      tooltips: {
        backgroundColor: '#f5f5f5',
        titleFontColor: '#333',
        bodyFontColor: '#666',
        bodySpacing: 4,
        xPadding: 12,
        mode: "nearest",
        intersect: 0,
        position: "nearest"
      },
      responsive: true,
      scales: {
        yAxes: [{
          barPercentage: 1.6,
          gridLines: {
            drawBorder: false,
            color: 'rgba(29,140,248,0.0)',
            zeroLineColor: "transparent",
          },
          ticks: {
            suggestedMin: 60,
            suggestedMax: 125,
            padding: 20,
            fontColor: "#9a9a9a"
          }
        }],

        xAxes: [{
          barPercentage: 1.6,
          gridLines: {
            drawBorder: false,
            color: 'rgba(233,32,16,0.1)',
            zeroLineColor: "transparent",
          },
          ticks: {
            padding: 20,
            fontColor: "#9a9a9a"
          }
        }]
      }
    };

    var gradientChartOptionsConfigurationWithTooltipOrange: any = {
      maintainAspectRatio: false,
      legend: {
        display: false
      },

      tooltips: {
        backgroundColor: '#f5f5f5',
        titleFontColor: '#333',
        bodyFontColor: '#666',
        bodySpacing: 4,
        xPadding: 12,
        mode: "nearest",
        intersect: 0,
        position: "nearest"
      },
      responsive: true,
      scales: {
        yAxes: [{
          barPercentage: 1.6,
          gridLines: {
            drawBorder: false,
            color: 'rgba(29,140,248,0.0)',
            zeroLineColor: "transparent",
          },
          ticks: {
            suggestedMin: 50,
            suggestedMax: 110,
            padding: 20,
            fontColor: "#ff8a76"
          }
        }],

        xAxes: [{
          barPercentage: 1.6,
          gridLines: {
            drawBorder: false,
            color: 'rgba(220,53,69,0.1)',
            zeroLineColor: "transparent",
          },
          ticks: {
            padding: 20,
            fontColor: "#ff8a76"
          }
        }]
      }
    };

    var gradientChartOptionsConfigurationWithTooltipGreen: any = {
      maintainAspectRatio: false,
      legend: {
        display: false
      },

      tooltips: {
        backgroundColor: '#f5f5f5',
        titleFontColor: '#333',
        bodyFontColor: '#666',
        bodySpacing: 4,
        xPadding: 12,
        mode: "nearest",
        intersect: 0,
        position: "nearest"
      },
      responsive: true,
      scales: {
        yAxes: [{
          barPercentage: 1.6,
          gridLines: {
            drawBorder: false,
            color: 'rgba(29,140,248,0.0)',
            zeroLineColor: "transparent",
          },
          ticks: {
            suggestedMin: 50,
            suggestedMax: 125,
            padding: 20,
            fontColor: "#9e9e9e"
          }
        }],

        xAxes: [{
          barPercentage: 1.6,
          gridLines: {
            drawBorder: false,
            color: 'rgba(0,242,195,0.1)',
            zeroLineColor: "transparent",
          },
          ticks: {
            padding: 20,
            fontColor: "#9e9e9e"
          }
        }]
      }
    };


    var gradientBarChartConfiguration: any = {
      maintainAspectRatio: false,
      legend: {
        display: false
      },

      tooltips: {
        backgroundColor: '#f5f5f5',
        titleFontColor: '#333',
        bodyFontColor: '#666',
        bodySpacing: 4,
        xPadding: 12,
        mode: "nearest",
        intersect: 0,
        position: "nearest"
      },
      responsive: true,
      scales: {
        yAxes: [{

          gridLines: {
            drawBorder: false,
            color: 'rgba(29,140,248,0.1)',
            zeroLineColor: "transparent",
          },
          ticks: {
            suggestedMin: 60,
            suggestedMax: 120,
            padding: 20,
            fontColor: "#9e9e9e"
          }
        }],

        xAxes: [{

          gridLines: {
            drawBorder: false,
            color: 'rgba(29,140,248,0.1)',
            zeroLineColor: "transparent",
          },
          ticks: {
            padding: 20,
            fontColor: "#9e9e9e"
          }
        }]
      }
    };

    // this.canvas = document.getElementById("chartLineRed");
    // this.ctx = this.canvas.getContext("2d");

    // var gradientStroke = this.ctx.createLinearGradient(0, 230, 0, 50);

    // gradientStroke.addColorStop(1, 'rgba(233,32,16,0.2)');
    // gradientStroke.addColorStop(0.4, 'rgba(233,32,16,0.0)');
    // gradientStroke.addColorStop(0, 'rgba(233,32,16,0)'); //red colors

    // var data = {
    //   labels: ['JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'],
    //   datasets: [{
    //     label: "Data",
    //     fill: true,
    //     backgroundColor: gradientStroke,
    //     borderColor: '#ec250d',
    //     borderWidth: 2,
    //     borderDash: [],
    //     borderDashOffset: 0.0,
    //     pointBackgroundColor: '#ec250d',
    //     pointBorderColor: 'rgba(255,255,255,0)',
    //     pointHoverBackgroundColor: '#ec250d',
    //     pointBorderWidth: 20,
    //     pointHoverRadius: 4,
    //     pointHoverBorderWidth: 15,
    //     pointRadius: 4,
    //     data: [80, 100, 70, 80, 120, 80],
    //   }]
    // };

    // var myChart = new Chart(this.ctx, {
    //   type: 'line',
    //   data: data,
    //   options: gradientChartOptionsConfigurationWithTooltipRed
    // });


    // this.canvas = document.getElementById("chartLineGreen");
    // this.ctx = this.canvas.getContext("2d");


    // var gradientStroke = this.ctx.createLinearGradient(0, 230, 0, 50);

    // gradientStroke.addColorStop(1, 'rgba(66,134,121,0.15)');
    // gradientStroke.addColorStop(0.4, 'rgba(66,134,121,0.0)'); //green colors
    // gradientStroke.addColorStop(0, 'rgba(66,134,121,0)'); //green colors

    // var data = {
    //   labels: ['JUL', 'AUG', 'SEP', 'OCT', 'NOV'],
    //   datasets: [{
    //     label: "My First dataset",
    //     fill: true,
    //     backgroundColor: gradientStroke,
    //     borderColor: '#00d6b4',
    //     borderWidth: 2,
    //     borderDash: [],
    //     borderDashOffset: 0.0,
    //     pointBackgroundColor: '#00d6b4',
    //     pointBorderColor: 'rgba(255,255,255,0)',
    //     pointHoverBackgroundColor: '#00d6b4',
    //     pointBorderWidth: 20,
    //     pointHoverRadius: 4,
    //     pointHoverBorderWidth: 15,
    //     pointRadius: 4,
    //     data: [90, 27, 60, 12, 80],
    //   }]
    // };

    // var myChart = new Chart(this.ctx, {
    //   type: 'line',
    //   data: data,
    //   options: gradientChartOptionsConfigurationWithTooltipGreen

    // });



    // var chart_labels = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
    // this.datasets = [
    //   [100, 70, 90, 70, 85, 60, 75, 60, 90, 80, 110, 100],
    //   [80, 120, 105, 110, 95, 105, 90, 100, 80, 95, 70, 120],
    //   [60, 80, 65, 130, 80, 105, 90, 130, 70, 115, 60, 130]
    // ];
    // this.data = this.datasets[0];



    // this.canvas = document.getElementById("chartBig1");
    // this.ctx = this.canvas.getContext("2d");

    // var gradientStroke = this.ctx.createLinearGradient(0, 230, 0, 50);

    // gradientStroke.addColorStop(1, 'rgba(233,32,16,0.2)');
    // gradientStroke.addColorStop(0.4, 'rgba(233,32,16,0.0)');
    // gradientStroke.addColorStop(0, 'rgba(233,32,16,0)'); //red colors

    // var config = {
    //   type: 'line',
    //   data: {
    //     labels: chart_labels,
    //     datasets: [{
    //       label: "My First dataset",
    //       fill: true,
    //       backgroundColor: gradientStroke,
    //       borderColor: '#ec250d',
    //       borderWidth: 2,
    //       borderDash: [],
    //       borderDashOffset: 0.0,
    //       pointBackgroundColor: '#ec250d',
    //       pointBorderColor: 'rgba(255,255,255,0)',
    //       pointHoverBackgroundColor: '#ec250d',
    //       pointBorderWidth: 20,
    //       pointHoverRadius: 4,
    //       pointHoverBorderWidth: 15,
    //       pointRadius: 4,
    //       data: this.data,
    //     }]
    //   },
    //   options: gradientChartOptionsConfigurationWithTooltipRed
    // };
    // this.myChartData = new Chart(this.ctx, config);



  }
  public updateOptions() {
    this.myChartData.data.datasets[0].data = this.data;
    this.myChartData.update();
  }
}
