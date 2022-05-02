import { Component, OnInit } from '@angular/core';
import { ApiService } from "../api.service";
import { ActivatedRoute, Router } from '@angular/router'
import { ToastrService } from 'ngx-toastr';
import { NgxSpinnerService } from 'ngx-spinner';
import { SocketService } from '../socket.service'
import { io } from 'socket.io-client'
import { FormBuilder, FormGroup, Validators } from '@angular/forms'
import * as moment from 'moment';
@Component({
  selector: 'app-feed',
  templateUrl: './feed.component.html',
  styleUrls: ['./feed.component.scss']
})
export class FeedComponent implements OnInit {
  addComment: FormGroup
  isUser: any;
  allPosts: any = [];
  user: any;
  currentUser:any
  imgUrl = 'http://localhost:8000/static/';
  userId: any;
  isPosts: any;
  loggedInUserId: string;
  postIndex: any
  postData: any;
  page: number = 1;
  scrollDistance = 5
  throttle = 600;
  constructor(
    private api: ApiService,
    private route: ActivatedRoute,
    private router: Router,
    private toastr: ToastrService,
    private spineer: NgxSpinnerService,
    private socketService: SocketService,
    private fb: FormBuilder,
    // private snack :MatSnackBar
  ) { }

  ngOnInit(): void {
    this.loggedInUserId = localStorage.getItem('userId')
    this.route.params.subscribe((res) => {
      this.userId = res.id

    })
    this.addComment = this.fb.group({
      comment: ['', Validators.required]
    })
    
    this.isUser = localStorage.getItem('token')
    this.currentUser =JSON.parse( localStorage.getItem('userData'))
    this.checkUser()
    
    
  }
  
  passIndex(i) {
    this.postIndex = i
  }
  
  
  
  checkUser() {
    if (this.isUser) {
      window.scroll(0,0)
      this.getPosts()
    } else {
      this.router.navigate([''])
    }
  }
  onScroll() {
    this.page++
    if(this.allPosts.length < this.isPosts) this.getPosts()
  }

  getPosts() {
    this.spineer.show()
    this.api.getallPosts({ page: this.page, count: 20, userId: this.loggedInUserId }).subscribe((res) => {
      if (res['success']) {
        this.allPosts.push(...res['data'].data)
        this.isPosts = res['data'].count
        this.spineer.hide()
        console.log('this.allPosts', this.allPosts)
      }
      else {
        this.spineer.hide()
      }
    },()=>{ this.toastr.error('Server error !! try again') })
  }


  likePost(post, i) {
    let data = {
      postId: post._id,
      likedBy: this.loggedInUserId,
      isLiked: post.isLiked ? false : true,
      postUserId : post.postedBy._id,
      userName : this.currentUser.userName,
      time : new Date( moment( new Date() ).utc().format())

    }

    console.log('data=>',data)
    // return
    this.spineer.show()
    this.api.likePost(data).subscribe((res) => {
      if (res['success'] == true) {

        this.allPosts[i].isLiked = !post.isLiked
        if (this.allPosts[i].isLiked) {
          this.allPosts[i].likes++
        } else {
          this.allPosts[i].likes--
        }
        this.spineer.hide()
      } else {
        this.toastr.warning(res['data'])
        this.spineer.hide()
      }
    },()=>{ this.toastr.error('Server error !! try again') })
  }
  submit(id, i) {
    let data = {
      postId: id,
      comment: this.addComment.value.comment,
      commentBy: this.loggedInUserId
    }
    this.api.commentOnPost(data).subscribe((res) => {
      if (res['success'] == true) {
        this.addComment.reset()
        this.allPosts[i].comments++
      }
    },()=>{ this.toastr.error('Server error !! try again') })
  }

}
