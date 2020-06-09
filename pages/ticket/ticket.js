// pages/ticket/ticket.js
const app = getApp()
const config = require("../../utils/config.js");

Page({

  /**
   * 页面的初始数据
   */
  data: {
    tab_title: ["拥有的", "使用中", "已使用", "已过期"],
    tabs: [],
    activeTab: 0,
    ticketList: []
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
    console.log(swiperHeight)

    this.setData({
      tabs: tabs,
      swiperHeight: swiperHeight
    })

    this.getTickets(0);
    
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
      console.log("ticket getTickets=", res)
      const findList = res.result.data
      console.log("ticket getTickets=", findList)
      this.setData({
        ticketList: findList
      })
    })
  },

  onChange(e) {
    const index = e.detail.index
    this.setData({
      activeTab: index
    })
    this.getTickets(this.data.activeTab);
  },

  /* 使用 */
  tapUse: function(){
    console.log("tapUse")
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