// pages/receiveTicket/receiveTicket.js

const app = getApp()
const config = require("../../utils/config.js");
const db = wx.cloud.database()

Page({

  /**
   * 页面的初始数据
   */
  data: {
    statusBarHeight: 0,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    console.log("receiveTicket onLoad=", options)
    let givingTicketId = options.givingTicketId;
    // 获得逻辑
    let systemInfo = wx.getSystemInfoSync()
    let pxToRpxScale = 750 / systemInfo.windowWidth;
    console.log(systemInfo.statusBarHeight)
    this.setData({
      statusBarHeight: systemInfo.statusBarHeight * pxToRpxScale
    })
    this.getSelectedTickets(givingTicketId);
  },

  async getSelectedTickets(givingTicketId){
    await db.collection(config.DATA_BASE_NAME.GIVING_TICKET).aggregate()
    .match({
      'dataJsonSet.giving_ticket_id': givingTicketId
    }).lookup({
        from: config.DATA_BASE_NAME.TICKET,
        localField: 'dataJsonSet.giving_tickets_id_list',
        foreignField: 'ticket_id',
        as: 'ticketDetailInfo',
      })
      .end()
      .then(res => console.log(res))
      .catch(err => console.error(err))
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