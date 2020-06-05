//index.js
//获取应用实例
const app = getApp()
const config = require("../../utils/config.js");
const db = wx.cloud.database()
let watcher = null

Page({
  data: {
    motto: 'Hello World',
    userInfo: {},
    hasUserInfo: false,
    ticketList: [],
    selectedTicketIndexList: [],
    isShowGiving: false
  },

  onLoad: function () {
    if (app.globalData.userInfo) {
      console.log("onLoad app.globalData.userInfo")
      this.updataUserInfoAndGetOtherInfo()
    } 
    // else {
    //   // 由于 getUserInfo 是网络请求，可能会在 Page.onLoad 之后才返回
    //   // 所以此处加入 callback 以防止这种情况
    //   console.log("app.userInfoReadyCallback")
    //   console.log("app", app.globalData.userInfo)

    //   app.userInfoReadyCallback = res => {
    //     this.updataUserInfoAndGetOtherInfo()
    //   }
    // }
    console.log("index onlauch")
    // 隐藏右上角分享
    // wx.hideShareMenu()
  },

  onShow: function() {
    console.log("index onShow")
    if(watcher == null){
      watcher = db.collection("Ticket")
      .where({
        // 填入当前用户 openid，或如果使用了安全规则，则 {openid} 即代表当前用户 openid
        _openid: app.globalData.open_id,
        'dataJsonSet.giving_openid': app.globalData.open_id
      })
      // 发起监听
      .watch({
        onChange: (snapshot) => {
          console.log('app snapshot onShow', snapshot)
          if (snapshot.docChanges != undefined && snapshot.docChanges.length != 0) {
            for(let i = 0; i < snapshot.docChanges.length; i++)
            {
              console.log('app snapshot onShow', snapshot.docChanges[i].dataType)
              if(snapshot.docChanges[i].dataType === 'add'){
                let tmpList = this.data.ticketList;
                console.log('app snapshot docs', snapshot.docChanges[i].doc)

                tmpList.push(snapshot.docChanges[i].doc);
                this.setData({
                  ticketList: tmpList
                })
                console.log("this.data.ticketList=", this.data.ticketList)
              }else if(snapshot.docChanges[i].dataType === 'remove')
              {
                let newList = this.data.ticketList
                for(let i = 0; i < this.data.ticketList.length; i++)
                {
                  if(this.data.ticketList[i]._id === snapshot.docChanges[i].doc._id)
                  {
                    newList.splice(i,1);
                    break;
                  }
                }

                this.setData({
                  ticketList: newList
                })
                
              }
            }
            
            // let url = this.GetCurrentPageUrl() //当前页面url
            // console.log("app onshow url=", url);
            // let dataType = snapshot.docChanges[0].dataType;
            // console.log('app dataType', dataType)
            // let data = snapshot.docChanges[0].doc.red_dots;
            // this.UpdateListNum(data.list_num);
            // this.globalData.red_dots.list_num = data.list_num
            // if(url === "pages/list/list" && data.list_num != 0)
            // {
            //   console.log("app refresh list onshow");
            //   this.globalData.currentPage = url;
            //   this.GetCurrentPage().onShow();
              // if(this.RefreshListPage)
              // {
              //   this.RefreshListPage(url);
              // }
            // }
          }
        },
        onError: (err) => {
          console.error('the watch closed because of error', err)
        }
      })
    }
   
  },

  checkboxChange: function(e){
    console.log('checkbox发生change事件，携带value值为：', e.detail)
    
    this.setData({
      selectedTicketIndexList: e.detail.value,
      isShowGiving: e.detail.value.length > 0 ? true : false
    })
  },

  async getTickets() {
    await wx.cloud.callFunction({
      name: "queryData",
      data: {
        "dataBaseName": config.DATA_BASE_NAME.TICKET,
        "whereObject": {
          "_openid": app.globalData.openId,
          "dataJsonSet.giving_openid": app.globalData.openId
        },
      }
    }).then(res => {
      console.log("getTickets=", res)
      const findList = res.result.data
      console.log("getTickets=", findList)
      this.setData({
        ticketList: findList
      })
      console.log(this.data.ticketList)
    })
  },

  async getUserName(openId, name) {
    await wx.cloud.callFunction({
      name: "queryData",
      data: {
        "dataBaseName": config.DATA_BASE_NAME.USER_INFO,
        "whereObject": {
          "_openid": openId,
        },
      }
    }).then(res => {
      const findList = res.result.data
      if(findList.length > 0){
        name = findList[0].dataJsonSet.nickName
      }
    })
  },

  // 点击添加券
  tapAddTicket: function()
  {
    console.log("index/tapAddTicket")
    wx.navigateTo({
      url: '/pages/addTicket/addTicket',
    })
  },

  // 更新玩家信息和其它信息
  async updataUserInfoAndGetOtherInfo() {
    app.globalData.hasUserInfo = true;
    console.log("app.globalData.hasUserInfo=", app.globalData.hasUserInfo)
    this.setData({
      hasUserInfo: app.globalData.hasUserInfo,
      userInfo: app.globalData.userInfo
    })

    await this.getTickets();
  },

  // 获得玩家信息
  getUserInfo: function (e) {
    console.log("getUserInfo")
    console.log(e)
    this.getUserInfoOperate(e)

  },

  // 获得玩家信息的操作
  async getUserInfoOperate(e) {
    if ('userInfo' in e.detail) {
      app.globalData.userInfo = e.detail.userInfo;
      this.updataUserInfoAndGetOtherInfo();

      console.log("写入数据库 UserInfo")
      // 写入数据库 UserInfo
      await this.addUserInfo();

      await this.getTickets();
    }
  },
  
  // 写入userInfo数据库
  async addUserInfo() {
    await wx.cloud.callFunction({
      name: "addData",
      data: {
        "dataBaseName": config.DATA_BASE_NAME.USER_INFO,
        "dataJsonSet": {
          "userInfo": app.globalData.userInfo
        },
        "delBeforeAdd": true
      }
    }).then(res => {
      console.log(res)
    })
  },

  // 转发
  onShareAppMessage:function(res){
    if (res.from === 'button') {
      // 来自页面内转发按钮
      console.log("res.target=", res.target)
    }

    let givingTicketId = "";
    let curTimeStamp = 0;
    let selectedTicketList = [];
    if(this.data.selectedTicketIndexList.length != 0)
    {
      curTimeStamp = new Date().getTime();
      // 券id
      givingTicketId = app.globalData.openId + curTimeStamp;
      
      for(let i = 0; i < this.data.selectedTicketIndexList.length; i++)
      {
        selectedTicketList.push(this.data.ticketList[this.data.selectedTicketIndexList[i]])
      }

    }
    console.log("givingTicketId=", givingTicketId)
    console.log("curTimeStamp=", curTimeStamp)
    console.log("selectedTicketList=", JSON.stringify(selectedTicketList))

    return {
      title: '自定义转发标题',
      path: '/pages/receiveTicket/receiveTicket?givingOpenId='+ app.globalData.openId + "&givingTicketId=" + givingTicketId + "&curTimeStamp=" + curTimeStamp + "&selectedTicketList=" + JSON.stringify(selectedTicketList)

      } 
  }

})
