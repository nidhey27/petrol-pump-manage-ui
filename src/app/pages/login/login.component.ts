import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/services/auth/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {


  loginForm: any;
  msgState: boolean = false
  responseMsg = ""

  constructor(
    private formBuilder: FormBuilder,
    public router: Router,
    private _auth: AuthService
  ) { }

  ngOnInit(): void {

    this.loginForm = this.formBuilder.group({
      email: ['', [Validators.required]],
      password: ['', [Validators.required]]

    });
  }
  get f() { return this.loginForm.controls; }

  async onSubmit() {
    if (this.loginForm.invalid) {
      return 1;
    }

    // console.log(this.loginForm.value);

    (await this._auth.login(this.loginForm.value)).subscribe((res: any) => {
      console.log(res);
      if(!res.status){
        this.msgState = false
        this.responseMsg = res.message
        return 1
      }

      sessionStorage.setItem('auth-token', res.token)
      sessionStorage.setItem('uid', res.data.id)
      sessionStorage.setItem('uname', res.data.name)
      sessionStorage.setItem('uemail', res.data.email)

      this.msgState = true
      this.responseMsg = res.message


      setTimeout(() => {
        return this.router.navigateByUrl('/dashboard')
      }, 2000)

      // return this.router.navigateByUrl('/dashboard')
      
    })
    
  }

}
