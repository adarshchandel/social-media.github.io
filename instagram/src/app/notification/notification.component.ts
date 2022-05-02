import { Component, OnInit } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import {ApiService} from '../api.service'

@Component({
  selector: 'app-notification',
  templateUrl: './notification.component.html',
  styleUrls: ['./notification.component.scss']
})
export class NotificationComponent implements OnInit {
  userData: any;
  notificationList: any;
  imgUrl = 'http://localhost:8000/static/'
  constructor( private service : ApiService , private toastr : ToastrService) { }

  ngOnInit(): void {
    this.userData = JSON.parse( localStorage.getItem('userData') )
    this.notiList()
  }

  notiList(){
    this.service.userNotification({ userId : this.userData._id , isActive : true}).subscribe((res)=>{
      if(res['success']){
        this.notificationList = res['data']
      }else{
        this.toastr.warning(res['data'])
      }
      console.log('res==>',res)
    },()=>{ this.toastr.error('Server error !! try again') })
  }
}
