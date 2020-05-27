//index.js
//获取应用实例
const app = getApp()

Page({
  data: {
    motto: 'Hello World',
    userInfo: {},
    hasUserInfo: false
  },

  onLoad: function () {
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
  },

  // 点击转发
  tapShare: function()
  {
    console.log("index/tapShare")
  },

  // 点击添加券
  tapAddTicket: function()
  {
    console.log("index/tapAddTicket")
    wx.navigateTo({
      url: '/pages/addTicket/addTicket',
    })
  },

  // 更新玩家信息和其它信息
  updataUserInfoAndGetOtherInfo: function() {
    app.globalData.hasUserInfo = true;
    console.log("app.globalData.hasUserInfo=", app.globalData.hasUserInfo)
    this.setData({
      hasUserInfo: app.globalData.hasUserInfo,
      userInfo: app.globalData.userInfo
    })
  },

  getUserInfo: function(e) {
    console.log("index/getUserInfo e =", e)
    app.globalData.userInfo = e.detail.userInfo
    this.updataUserInfoAndGetOtherInfo();
    var pages = getCurrentPages();
    console.log(pages)
  }
})
