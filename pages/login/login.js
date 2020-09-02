// pages/login/login.js

const app = getApp()
const config = require("../../utils/config.js");

Page({

  /**
   * 页面的初始数据
   */
  data: {
    userInfo: {},
    hasUserInfo: false,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    if (app.globalData.userInfo) {
      console.log("onLoad app.globalData.userInfo")
      this.updataUserInfoAndGetOtherInfo()
    } else {
      // 由于 getUserInfo 是网络请求，可能会在 Page.onLoad 之后才返回
      // 所以此处加入 callback 以防止这种情况
      console.log("app.userInfoReadyCallback")
      console.log("app", app.globalData.userInfo)

      app.userInfoReadyCallback = res => {
        this.updataUserInfoAndGetOtherInfo()
      }
    }
    console.log("index onlauch")
  },

  updataUserInfoAndGetOtherInfo: function() {
    app.globalData.hasUserInfo = true;
    console.log("app.globalData.hasUserInfo=", app.globalData.hasUserInfo)
    this.setData({
      hasUserInfo: app.globalData.hasUserInfo,
      userInfo: app.globalData.userInfo
    })

    // 读取分享增加的次数
    this.getUserExtraInfoOperator()

  },

  async getUserExtraInfoOperator()
  {
    await this.getUserExtraInfo();
  },

    // 写入userInfo数据库
  async getUserExtraInfo() {
    console.log("_openid", app.globalData.openId)
    await wx.cloud.callFunction({
      name: "queryData",
      data: {
        "dataBaseName": config.DATA_BASE_NAME.USER_EXTRA_INFO,
        "whereObject": {
          "_openid": app.globalData.openId
        }
      }
    }).then(res => {
      if(res.result.data.length == 0)
      {
        this.addUserExtraInfo();
      }
      else
      {
        app.globalData.counts.addCount = res.result.data[0].dataJsonSet.add_count;
        app.globalData.counts.shareCount = res.result.data[0].dataJsonSet.share_count;

        //跳转页面到index
        wx.switchTab({      //关闭当前页面，跳转到应用内的某个页面（这个跳转有个坑，就是跳转页面后页面会闪烁一下，完全影响了我自己的操作体验，太缺德了。）
          url:"/pages/index/index"
        })
      }
      console.log("getUserExtraInfo",res)
    })
  },

  async addUserExtraInfo() {
    console.log("_openid", app.globalData.openId)
    await wx.cloud.callFunction({
      name: "addData",
      data: {
        "dataBaseName": config.DATA_BASE_NAME.USER_EXTRA_INFO,
        "dataJsonSet": {
          "add_count": config.POINT.DEFAULT_ADD_COUNT,
          "share_count": config.POINT.DEFAULT_SHARE_COUNT
        }
      }
    }).then(res => {
      console.log(res)
      app.globalData.counts.addCount = config.POINT.DEFAULT_ADD_COUNT;
      app.globalData.counts.shareCount = config.POINT.DEFAULT_SHARE_COUNT;
      
      //跳转页面到index
      wx.switchTab({      //关闭当前页面，跳转到应用内的某个页面（这个跳转有个坑，就是跳转页面后页面会闪烁一下，完全影响了我自己的操作体验，太缺德了。）
        url:"/pages/index/index"
      })
    })
  },

  getUserInfo: function (e) {
    console.log("getUserInfo")
    console.log(e)
    this.getUserInfoOperate(e)

  },

  // 获得玩家信息的操作
  async getUserInfoOperate(e) {
    if ('userInfo' in e.detail) {
      app.globalData.userInfo = e.detail.userInfo;
      this.updataUserInfoAndGetOtherInfo();

      console.log("写入数据库 UserInfo")
      // 写入数据库 UserInfo
      await this.addUserInfo();
    }
  },

  // 写入userInfo数据库
  async addUserInfo() {

    console.log("addUserInfo userInfo =", app.globalData.userInfo)

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