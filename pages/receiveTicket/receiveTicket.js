// pages/receiveTicket/receiveTicket.js

const app = getApp()
const config = require("../../utils/config.js");

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

    let selectedTicketList = options.selectedTicketList
    selectedTicketList = selectedTicketList.trim()
    console.log("options.selectedTicketList=",selectedTicketList)

    let givingTicketList = JSON.parse(selectedTicketList);
    console.log("givingTicketList=", givingTicketList)

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
    console.log("givingTicketId=", givingTicketId)
    await wx.cloud.callFunction({
      name: "queryData",
      data: {
        "dataBaseName": config.DATA_BASE_NAME.GIVING_TICKET,
        "whereObject": {
          "dataJsonSet.giving_ticket_id": givingTicketId
        },
      }
    }).then(res => {
      console.log("getTickets=", res)
      const findList = res.result.data
      console.log("getTickets=", findList)
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