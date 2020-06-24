// pages/message/message.js
const app = getApp()
const config = require("../../utils/config.js");

Page({

  /**
   * 页面的初始数据
   */
  data: {
    messages: [],
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    (async()=>{
      await this.updateMessageNewType()
    })()
    

    if(app.globalData.messageNum != 0)
    {
      app.globalData.messageNum = 0;
      app.UpdateListNum(0);
    }

    // 获得所有消息
    this.getMessages()
  },

  updateMessageNewType: function(){
     // 修改数据库
     wx.cloud.callFunction({
      name: "updateData",
      data: {
        "dataBaseName": config.DATA_BASE_NAME.MESSAGE,
        "whereObject": {
          "dataJsonSet.receipt_openId": app.globalData.openId,
          "dataJsonSet.new_type": 0
        },
        "updateData":{
          "dataJsonSet.new_type": 1
        }
      }
    }).then(res => {
      console.log("message onLoad=", res);
      const findList = res.result.data
      console.log("message onLoad=", findList);
    })
  },

  async getMessages(){

    await wx.cloud.callFunction({
      name: "queryData",
      data: {
        "dataBaseName": config.DATA_BASE_NAME.MESSAGE,
        "whereObject": {
          "dataJsonSet.receipt_openId": app.globalData.openId
        },
      }
    }).then(res => {
      console.log("message getMessages=", res);
      const findList = res.result.data
      console.log("message getMessages=", findList);
      this.setData({
        messages: findList
      })
    })
  },

  tapCancel: function(e)
  {
    // 把消息里显示同意印章
    let index = e.currentTarget.dataset.index
    console.log(index)
    console.log(this.data.messages)
    let message = "messages[" + index + "].dataJsonSet.msg_receipt"
    // 把消息里显示同意印章
    this.setData({
      [message] : 2
    })

    // 设置message中 msg_receipt
    this.updateMessageReceipt(2, index)
    // 设置ticket中 ticket_state
    this.updateTicketReceipt(2, index, 1) 
  },

  tapAgree: function(e)
  {
    // 把消息里显示同意印章
    let index = e.currentTarget.dataset.index
    console.log(index)
    console.log(this.data.messages)
    let message = "messages[" + index + "].dataJsonSet.msg_receipt"
    // 把消息里显示同意印章
    this.setData({
      [message] : 1
    })
    console.log(this.data.messages)
    // 设置message中 msg_receipt
    this.updateMessageReceipt(1, index)
    // 设置ticket中 ticket_state
    this.updateTicketReceipt(1, index)
  },

  updateMessageReceipt: function(msg_receipt, index)
  {
    // 更新msg_receipt
    wx.cloud.callFunction({
      name: "updateData",
      data: {
        "dataBaseName": config.DATA_BASE_NAME.MESSAGE,
        "whereObject": {
          "dataJsonSet.receipt_openId": app.globalData.openId,
          "dataJsonSet.msg_receipt": 0,
          "dataJsonSet.ticket_id": this.data.messages[index].dataJsonSet.ticket_id
        },
        "updateData":{
          "dataJsonSet.msg_receipt": msg_receipt
        }
      }
    }).then(res => {
      console.log("getTickets=", res);
      const findList = res.result.data
      console.log("getTickets=", findList);
    })
  },

  updateTicketReceipt: function(ticket_use_state, index, ticket_state)
  {
    let updateData = {
      "dataJsonSet.ticket_use_state": ticket_use_state
    }
    if(ticket_state === 1)
    {
      updateData = {
        "dataJsonSet.ticket_state": ticket_state
      }
    }
        // 更新券的 state
    wx.cloud.callFunction({
      name: "updateData",
      data: {
        "dataBaseName": config.DATA_BASE_NAME.TICKET,
        "whereObject": {
          "dataJsonSet.ticket_state": 2,
          "dataJsonSet.ticket_id": this.data.messages[index].dataJsonSet.ticket_id
        },
        "updateData":updateData
      }
    }).then(res => {
      console.log("getTickets=", res);
      const findList = res.result.data
      console.log("getTickets=", findList);
    })
  },
  
  updateMessage: function(message){
    (async()=>{
      await this.updateMessageNewType()
      let messages = this.data.messages
      messages.push(message)
      this.setData({
        messages: messages
      })
    })()
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