// pages/receiveTicket/receiveTicket.js

const app = getApp()
const config = require("../../utils/config.js");

Page({

  /**
   * 页面的初始数据
   */
  data: {
    statusBarHeight: 0,
    receiveState: 1,
    givingTicketId: "",
    hasUserInfo: false,
    showDialog: false,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    console.log("receiveTicket onLoad=", options)
    
    wx.hideHomeButton();
    
    let givingTicketId = options.givingTicketId;
    let giving_openId = options.givingOpenId
    let selectedTicketList = options.selectedTicketList
    let curTimeStamp = options.curTimeStamp
    let givingTicketList = JSON.parse(selectedTicketList);

    console.log("givingTicketList=", givingTicketList)

    if (!app.globalData.userInfo) {
      console.log("onLoad app.globalData.userInfo")
      app.userInfoReadyCallback = res => {
        console.log("userInfoReadyCallback res=", res)
        // let flag = 'scope.userInfo' in res.authSetting? false: true;
        app.globalData.hasUserInfo = res;
        this.setData({
          hasUserInfo: app.globalData.hasUserInfo
        })
        console.log("receiveTicket app.globalData.hasUserInfo=", app.globalData.hasUserInfo)
      }
    }
    else{
      this.setData({
        hasUserInfo: app.globalData.hasUserInfo
      })
    } 

          
    if(!app.globalData.hasAddCount)
    {
      app.userExtraInfoCallBack = res => {
        console.log("userExtraInfoCallBack res=", res)
        if("data" in res.result)
        {
          app.globalData.counts.addCount = res.result.data[0].dataJsonSet.add_count;
          app.globalData.counts.shareCount = res.result.data[0].dataJsonSet.share_count;
        }
        else{
          app.globalData.counts.addCount = config.POINT.DEFAULT_ADD_COUNT;
          app.globalData.counts.shareCount = config.POINT.DEFAULT_SHARE_COUNT;
        }
        
        app.globalData.hasAddCount = true;
      }
    }

    // 获得逻辑
    let systemInfo = wx.getSystemInfoSync();
    let windowHeight = systemInfo.windowHeight;
    let pxToRpxScale = 750 / systemInfo.windowWidth;
    let statusBarHeight = systemInfo.statusBarHeight * pxToRpxScale

    let ticketContainerHeight = windowHeight - statusBarHeight
    console.log(ticketContainerHeight)
    
    this.setData({
      ticketContainerHeight: ticketContainerHeight,
      statusBarHeight: statusBarHeight,
      ticketList: givingTicketList,
      givingTicketId: givingTicketId
    })

    console.log("this.data.ticketList=", this.data.ticketList)

    // 检测是否存在这个givingTicketId
    let ticketOptions = {
      givingTicketId: givingTicketId,
      givingTicketList: givingTicketList,
      curTimeStamp: curTimeStamp,
      givingOpenId: giving_openId
    }
    this.hadSelectedTickets(givingTicketId, ticketOptions);

  },

  showLogin:function()
  {
    console.log("showLogin=", this.data.showDialog)
    this.setData({
      showDialog: true
    })
  },

   // 获得玩家信息
   getUserInfo: function (e) {
    this.getUserInfoOperate(e)
  },

  // 获得玩家信息的操作
  async getUserInfoOperate(e) {
    console.log("index getUserInfo e=", e)
    if ('userInfo' in e.detail.detail) {
      wx.showLoading({
        title: '加载中',
        mask: true
      })
      app.globalData.userInfo = e.detail.detail.userInfo;
      // this.updataUserInfoAndGetOtherInfo();

      console.log("写入数据库 UserInfo")
      // 更新数据库 UserInfo
      await this.addUserInfo();

      // 更新Ticket中的UserName
      await this.updataUserTicket();

      app.globalData.hasUserInfo = true
      this.setData({
        showDialog: false,
        hasUserInfo: app.globalData.hasUserInfo,
        userInfo: app.globalData.userInfo
      })
      wx.hideLoading()
      // await this.getTickets();
    }
  },

  async updataUserTicket()
  {
    console.log("updataUserTicket userinfo=", app.globalData.userInfo )
    await wx.cloud.callFunction({
      name: "updateData",
      data: {
        "dataBaseName": config.DATA_BASE_NAME.TICKET,
        "whereObject": {
          "_openid": app.globalData.openId,
          "dataJsonSet.giving_openid":app.globalData.openId
        },
        "updateData": {
          "dataJsonSet.giving_name": app.globalData.userInfo.nickName
        }
      }
    }).then((res)=>{
      console.log(res)
    })
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

  async addGivingTicketInfo(options){
    await wx.cloud.callFunction({
      name: "addData",
      data: {
        "dataBaseName": config.DATA_BASE_NAME.GIVING_TICKET,
        "dataJsonSet": {
          "giving_ticket_id":options.givingTicketId,
          "giving_openId": options.givingOpenId,
          "giving_tickets_lists": options.givingTicketList,
          "create_time": options.curTimeStamp,
          "receive_openId":app.globalData.openId,
          "receive_state": 0,
        }
      }
    }).then(res => {
      console.log("addGivingTicketInfo=", res)
      const hasRes = res.result.data
      console.log("addGivingTicketInfo=", hasRes)
    })
  },

  async hadSelectedTickets(givingTicketId, options){
    console.log("givingTicketId=", givingTicketId)
    await wx.cloud.callFunction({
      name: "queryData",
      data: {
        "dataBaseName": config.DATA_BASE_NAME.GIVING_TICKET,
        "whereObject": {
          "dataJsonSet.giving_ticket_id": givingTicketId,
          "_openid": app.globalData.openId
        },
      }
    }).then(res => {
      console.log("hadSelectedTickets=", res)
      const hasRes = res.result.data
      console.log("hadSelectedTickets=", hasRes)
      if(hasRes.length === 0){
        // 不存在,保存数据
        this.addGivingTicketInfo(options)
        console.log("hadSelectedTickets app.globalData.openId=", app.globalData.openId)
        console.log("hadSelectedTickets options.givingOpenId=", options.givingOpenId)
        if(app.globalData.openId != options.givingOpenId){
          this.setData({
            receiveState: 0
          })
        }
        
      }else{
        console.log("hadSelectedTickets app.globalData.openId=", app.globalData.openId)
        console.log("hadSelectedTickets options.givingOpenId=", options.givingOpenId)
        if(app.globalData.openId != options.givingOpenId){
          this.setData({
            receiveState: hasRes[0].dataJsonSet.receive_state
          })
        }
      }
    })
  },

  receiveTickets: function(){
    this.receiveTicketsDetail();
  },

  async receiveTicketsDetail(){
    
    this.setData({
      receiveState: 1
    })
    // 设置当前GivingTicket中状态可领取
    await this.updateGivingTicket();
    // 把所有券保存入当前用户
    for(let i = 0; i < this.data.ticketList.length; i++)
    {
      (async()=>{
        await this.addTicket(this.data.ticketList[i]);
      })();
    } 
    console.log("receiveTicketsDetail")
    wx.reLaunch({
      url: '/pages/index/index',
    })
    // wx.showHomeButton()
  },

  async updateGivingTicket(){
    this.data.givingTicketId
    await wx.cloud.callFunction({
      name: "updateData",
      data: {
        "dataBaseName": config.DATA_BASE_NAME.GIVING_TICKET,
        "whereObject": {
          'dataJsonSet.giving_ticket_id': this.data.givingTicketId
        },
        "updateData": {
          "dataJsonSet.receive_state": 1
        }
      }
    }).then((res)=>{
      console.log(res)
    })
    
  },

  async addTicket(dataJsonSet){
    
    console.log("receiveTicket addTicket=", dataJsonSet.dataJsonSet.ticket_state)
    dataJsonSet.dataJsonSet.ticket_state = 1
    console.log("receiveTicket addTicket=", dataJsonSet.dataJsonSet.ticket_state)

    await wx.cloud.callFunction({
      name: "addData",
      data: {
        "dataBaseName": config.DATA_BASE_NAME.TICKET,
        "dataJsonSet": dataJsonSet.dataJsonSet,
        "waitFlag": true
      }
    }).then(res => {
      console.log("成功保存,", res)
    })
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

})