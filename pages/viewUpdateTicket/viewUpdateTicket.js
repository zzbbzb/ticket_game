// pages/viewUpdateTicket/viewUpdateTicket.js
const util = require("../../utils/util.js");

Page({

  /**
   * 页面的初始数据
   */
  data: {
    isShowExpireTime: false,
    ticket: {}, 
    isDisabled: true,
    radio_items: [{
      name: '0',
      value: '计数券',
      checked: true
    },
    {
      name: '1',
      value: '时效券'
    }],
    radioValue: 0,
    timeType: ["分", "秒", "时", "天"],
    timeTypeIndex: 0,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    console.log("viewUpdateTicket onLoad=", options)
    let ticket = options.ticket
    let isShowExpireTime = options.isShowExpireTime == "false" ? false: true;
    ticket = JSON.parse(ticket);
    console.log("viewUpdateTicket ticket=", ticket)
    console.log("viewUpdateTicket isShowExpireTime=", isShowExpireTime)
    console.log("viewUpdateTicket isShowExpireTime=", typeof(isShowExpireTime))
    ticket.dataJsonSet.start_use_time = util.formatTime(ticket.dataJsonSet.start_use_time)
    ticket.dataJsonSet.end_use_time = util.formatTime(ticket.dataJsonSet.end_use_time)

    let radio_items = this.data.radio_items
    if(ticket.dataJsonSet.ticket_type === 0)
    {
      radio_items[0].checked = true;
      radio_items[1].checked = false;
    }
    else if(ticket.dataJsonSet.ticket_type === 1)
    {
      radio_items[0].checked = false;
      radio_items[1].checked = true;
    }
    let timeTypeIndex = 0;
    for(let i = 0; i < this.data.timeType.length; i++)
    {
      if(this.data.timeType[i] === ticket.dataJsonSet.use_time_type)
      {
        timeTypeIndex = i
      }
    }

    this.setData({
      ticket: ticket,
      isShowExpireTime: isShowExpireTime,
      radioValue: ticket.dataJsonSet.ticket_type,
      radio_items: radio_items,
      timeTypeIndex: timeTypeIndex
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

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})