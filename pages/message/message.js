// pages/message/message.js
const app = getApp()
const config = require("../../utils/config.js");

Page({

  /**
   * 页面的初始数据
   */
  data: {
    messages: []
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
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

    if(app.globalData.messageNum != 0)
    {
      app.globalData.messageNum = 0;
      app.UpdateListNum(0);
    }

    // 获得所有消息
    this.getMessages()
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

  tapCancel: function()
  {

  },

  tapAgree: function()
  {

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