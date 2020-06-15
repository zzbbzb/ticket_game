// pages/message/message.js
const app = getApp()
const config = require("../../utils/config.js");

Page({

  /**
   * 页面的初始数据
   */
  data: {

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

    app.globalData.messageNum = 0;

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