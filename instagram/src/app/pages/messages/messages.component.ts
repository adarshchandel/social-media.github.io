import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { ApiService } from '../../api.service';
import { SocketService } from '../../socket.service'
import { ActivatedRoute, Router } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { interval, observable, Observable } from 'rxjs';
import { PeerConnectOption, PeerJSOption } from 'peerjs'
import * as moment from 'moment';

@Component({
  selector: 'app-messages',
  templateUrl: './messages.component.html',
  styleUrls: ['./messages.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class MessagesComponent implements OnInit {
  user: any;
  myUser: any = [];
  userId: any;
  userList: any
  message: any

  imgUrl = 'http://localhost:8000/static/';
  receiver: any;
  element: HTMLLIElement;
  isUserTyping: any;
  messageList: any = [];
  eleArr: any = [];
  scrollUpDistance = 100
  scrollDistance = 100
  throttle = 100;
  page: any = 1;
  totalMessageCount: boolean = true;
  pushMsg: any = [];


  constructor(
    private service: ApiService,
    private route: ActivatedRoute,
    private router: Router,
    private socketService: SocketService,
    private spinner: NgxSpinnerService

  ) { }

  params = {
    sender: localStorage.getItem('userId')

  }
  ngOnInit(): void {

    this.userId = localStorage.getItem('userId')
    this.checkUser()
    this.allUser()

    // this.setupSocketConnection()
    // this.checkOut()
    setTimeout(() => {
      this.setConnection()
      this.addVideo

    }, 2000);


  }
  onScroll() {
    console.log('hey', this.totalMessageCount)
    this.page = this.page + 1
    if (this.totalMessageCount) {
      setTimeout(() => {
        this.messages()
      }, 100);
    }
  }

  checkUser() {
    this.userId = localStorage.getItem('userId')
    if (this.userId) {
      this.getUser()
    } else {
      this.router.navigate([''])
    }
  }

  getUser() {
    let data = {
      id: this.userId
    }
    this.spinner.show()
    this.service.getUserById(data).subscribe((res) => {
      if (res['success'] == true) {
        this.myUser = res['data']
        this.spinner.hide()

      } else {
        this.spinner.hide()
      }
    })
  }

  allUser() {
    this.service.MyfrindsList(this.userId).subscribe((res: any) => {
      if (res.success == true) {
        this.userList = res['data']
        window.scroll(0, 0)
      }
    })
  }

  setConnection() {
    this.newMessage()
    // this.allUser()
  }

  newMessage() {
    this.socketService.getMessage().subscribe((res) => {
      console.log('res==================>',res)
      this.messageList.push(res)
      this.scroll()
      // this.element = document.createElement('li');
      // this.eleArr.push(this.element)
      // this.element.innerHTML = ` ${res.message} <small>${new Date(res.time).toLocaleTimeString('en-US', { hour12: true, hour: 'numeric', minute: 'numeric' })}</small>`
      // this.element.classList.add('msg_incomming')
      // document.getElementById('message-list')?.appendChild(this.element)
    })
  }
  SendMessage() {
    let data = {
      receiver: this.receiver,
      message: this.message,
      sender: this.userId,
      time: Date.now()
    }
    this.socketService.sendMessage(data)
    this.messageList.push(data)
    this.message = ''
    this.scroll()
    return
    this.element = document.createElement('li');
    this.eleArr.push(this.element)
    this.element.innerHTML = `<small>${new Date(Date.now()).toLocaleTimeString('en-US', { hour12: true, hour: 'numeric', minute: 'numeric' })}</small> ${this.message}`
    this.element.classList.add('msg_outgoing')
    document.getElementById('message-list').appendChild(this.element)
  }

  getChatUser(id) {
    this.receiver = id
    let data = {
      id: id
    }
    if (this.user && this.user._id == id) return
    this.service.getUserById(data).subscribe((res: any) => {
      if (res['success'] == true) {
        this.user = res.data
        this.messageList = []
        this.page = 1
        this.messages()
      }
    })
  }

  messages() {
    let data = {
      receiver: this.receiver,
      sender: this.userId,
      page: this.page,
      count: 50
    }
    this.service.getConvo(data).subscribe((res) => {
      if (res['success'] == true) {
        if (this.page == 1) {
          setTimeout(() => {
            this.scroll()
          }, 100);
        }
        this.messageList.push(...res['data'])

        console.log('messageList', this.messageList)
      }
    })
  }

  getMessageTime(time){
    return moment(time).format('LT')
  }

  groupMessages( messageTime , previousTime ){
   return moment( messageTime ).format('DD-MM-YYYY') != moment(previousTime).format('DD-MM-YYYY') ? moment(messageTime).format('YYYY-MM-DD') : null
  }

  scroll() {
    let objDiv = document.getElementById("messages_cus");
    objDiv.scrollTop = objDiv.scrollHeight;
  }

  voiceCall(id) {
    console.log(id)
    let myVideo = document.createElement('video') // Create a new video tag to show our video
    myVideo.muted = true
    navigator.mediaDevices.getUserMedia({ video: true, audio: true }).then((stream) => {
      this.socketService.outgoingVoiceCall({ receiver: id, caller: this.userId })
      console.log('stream==>', stream)
      // myVideo = (stream)
      // myVideo = stream
      // this.addVideo(myVideo , stream)
    })
  }

  addVideo() {
    this.socketService.incomingVoiceCall().subscribe((res) => {
      console.log('res==>>', res)
    })

  }




  //   navigator.mediaDevices.getUserMedia({
  //     video: true,
  //     audio: true
  // }).then(stream => {
  //     addVideoStream(myVideo, stream) // Display our video to ourselves

  //     myPeer.on('call', call => { // When we join someone's room we will receive a call from them
  //         call.answer(stream) // Stream them our video/audio
  //         const video = document.createElement('video') // Create a video tag for them
  //         call.on('stream', userVideoStream => { // When we recieve their stream
  //             addVideoStream(video, userVideoStream) // Display their video to ourselves
  //         })
  //     })

  //     socket.on('user-connected', userId => { // If a new user connect
  //         connectToNewUser(userId, stream) 
  //     })
  // })

}
