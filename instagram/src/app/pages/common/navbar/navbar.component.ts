import { Component, OnInit } from '@angular/core';
import {Router,ActivatedRoute} from '@angular/router';
import { title } from 'process';
import {ApiService} from '../../../api.service'
import { SocketService } from '../../../socket.service'
@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss']
})
export class NavbarComponent implements OnInit {
 
  isLoggedIn:any;
  token:any;
  loggedin:any;
  displayElement:any;
  user: any={};
  userId: any;
  userData: any=[];
  imgUrl = 'http://localhost:8000/static/';
  isNewNoti: boolean;
  constructor(
    private router:Router,
    private api :ApiService,
    private route:ActivatedRoute,
    private socketService : SocketService
  ) { }

  ngOnInit(): void {

    this.userId=localStorage.getItem('userId')
    this.fun()
    this.getUser()
    
  }
  fun(){
    const isLoggedIn =  localStorage.getItem('token')
    if(isLoggedIn){
      this.displayElement=true;
      console.log(`user logged in `)
      
      this.router.navigate['/feed']
     
    }else{
      this.displayElement=false;
      console.log('user is not logged in')
    }
  }

  getUser() {
    let data={
      id:this.userId
    }
    this.api.getUserById(data).subscribe((res: any) => {
      this.userData=res['data']
      this.setConnection(this.userData)

    })

    this.api.setProfileData().subscribe(res=>{
      if(res && res['data']){
        // this.getNotify()
        this.userData=res['data']
        console.log('this.userData',this.userData)
      }
      })
  }

  setConnection(user){
    this.socketService.setConnection(user)
    this.requestPermission()
    setTimeout(() => {
      this.getNotify()
    }, 1500);
  }

  

  logOut(){
    localStorage.clear()
    let isAcive= localStorage.getItem('token')
    if(!isAcive){
      this.router.navigate(['login'])
      this.socketService.disconnect(this.userId)
    }
  }

  requestPermission(){
    Notification.requestPermission().then( (perm)=>{
      console.log('perm',perm)
      
    })
  }



  getNotify(){
    this.socketService.getNotification().subscribe((res)=>{
      console.log('res==>',res)
      this.isNewNoti = Object.keys(res).length ? true : false
      new Notification(res.title,{ body : res.message, icon : "https://facebookbrand.com/wp-content/uploads/2021/03/Instagram_AppIcon_Aug2017.png?w=150&h=150" })
    })
  }
  

}
