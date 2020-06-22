// pages/ticket/ticket.js
const app = getApp()
const config = require("../../utils/config.js");

Page({

  /**
   * 页面的初始数据
   */
  data: {
    tab_title: ["拥有的", "使用中", "已使用", "已完成", "已过期"],
    tabs: [],
    activeTab: 0,
    ticketList: [[],[],[],[],[]]
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    const tabs = this.data.tab_title.map(item => ({
      title: item
    }))

    let systemInfo = wx.getSystemInfoSync();
    let windowHeight = systemInfo.windowHeight;
    let pxToRpxScale = 750 / systemInfo.windowWidth;
    let statusBarHeight = systemInfo.statusBarHeight * pxToRpxScale

    let swiperHeight = windowHeight - statusBarHeight
    console.log(swiperHeight);

    this.setData({
      tabs: tabs,
      swiperHeight: swiperHeight
    });

    (async()=>{
      for(let i = 0; i < this.data.tab_title.length; i++){
        (async()=>{
          this.getTickets(i);
        })()
      }
    })()
    
  },

  async getTickets(state){

    await wx.cloud.callFunction({
      name: "queryData",
      data: {
        "dataBaseName": config.DATA_BASE_NAME.TICKET,
        "whereObject": {
          "_openid": app.globalData.openId,
          "dataJsonSet.ticket_state": state + 1
        },
      }
    }).then(res => {
      console.log("ticket getTickets=", res);
      const findList = res.result.data
      console.log("ticket getTickets=", findList);
      this.setTicketData(state, findList)
    })
  },

  setTicketData: function(state, findList){
    if(state === 0){
      this.setData({
        'ticketList[0]': findList
      })
    }
    else if(state === 1){
      this.setData({
        'ticketList[1]': findList
      })
    } else if(state === 2){
      this.setData({
        'ticketList[2]': findList
      })
    }else if(state === 3){
      this.setData({
        'ticketList[3]': findList
      })
    }
  },

  onChange(e) {
    const index = e.detail.index
    this.setData({
      activeTab: index
    })
    // this.getTickets(this.data.activeTab);
  },

  /* 使用 */
  tapUse: function(options){
    console.log("tapUse", options)
    let index = options.currentTarget.dataset.index

    // 创建时间
    let curTimeStamp = new Date().getTime();
    // 券id
    let msgId = app.globalData.openId + curTimeStamp;
    let msgInfo = app.globalData.userInfo.nickName + "要使用你送的" + this.data.ticketList[0][index].dataJsonSet.ticket_name 

    console.log("this.data.ticketList[0]=", this.data.ticketList[0]);
    
    console.log("index", index);

    console.log("index type", typeof(index));
    
    // 保存数据库(也就是发送消息)
     wx.cloud.callFunction({
        name: "addData",
        data: {
          "dataBaseName": config.DATA_BASE_NAME.MESSAGE,
          "dataJsonSet": {
            "msg_id": msgId,
            "msg_info": msgInfo,
            "create_time": curTimeStamp,
            "msg_receipt": 0,
            "send_openId": app.globalData.openId,
            "send_user_name": app.globalData.userInfo.nickName,
            "receipt_openId": this.data.ticketList[0][index].dataJsonSet.giving_openid,
            "receipt_user_name": this.data.ticketList[0][index].dataJsonSet.giving_name,
            "new_type": 0
          },
        }
      }).then(res => {
        console.log("tttt=", res);
              // 点击使用
        let hasTicketList = this.data.ticketList[0]
        let usingTicketList = this.data.ticketList[1]
        
        let useTicketId = hasTicketList[index].dataJsonSet.ticket_id
        usingTicketList.push(hasTicketList[index])
        console.log("usingTicketList before=", usingTicketList[usingTicketList.length - 1]);
        usingTicketList[usingTicketList.length - 1].dataJsonSet.ticket_state = 2
        // console.log("usingTicketList after=", usingTicketList[usingTicketList.length - 1]);
        
        hasTicketList.splice(index, 1)
        
        this.setData({
          'ticketList[0]': hasTicketList,
          'ticketList[1]': usingTicketList
        })

        // 更新券的 state
        wx.cloud.callFunction({
          name: "updateData",
          data: {
            "dataBaseName": config.DATA_BASE_NAME.TICKET,
            "whereObject": {
              "_openid": app.globalData.openId,
              "dataJsonSet.ticket_state": 1,
              "dataJsonSet.ticket_id": useTicketId
            },
            "updateData":{
              "dataJsonSet.ticket_state": 2
            }
          }
        }).then(res => {
          console.log("getTickets=", res);
          const findList = res.result.data
          console.log("getTickets=", findList);
        })
      })
  },

  triggerCountDownFinish: function(e)
  {
    console.log("ticket triggerCountDownFinish e=", e);
    // 记录到数据库设置ticket 类型已经完成
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

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})