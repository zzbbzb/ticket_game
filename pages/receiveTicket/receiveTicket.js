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
    givingTicketId: ""
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    console.log("receiveTicket onLoad=", options)
    let givingTicketId = options.givingTicketId;
    let giving_openId = options.givingOpenId
    let selectedTicketList = options.selectedTicketList
    let curTimeStamp = options.curTimeStamp
    let givingTicketList = JSON.parse(selectedTicketList);

    console.log("givingTicketList=", givingTicketList)

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