//app.js
App({
  async onLaunch() {
    // 展示本地存储能力
    var logs = wx.getStorageSync('logs') || []
    logs.unshift(Date.now())
    wx.setStorageSync('logs', logs)

    if (!wx.cloud) {
      console.error('请使用 2.2.3 或以上的基础库以使用云能力')
    } else {
      wx.cloud.init({
        // env 参数说明：
        //   env 参数决定接下来小程序发起的云开发调用（wx.cloud.xxx）会默认请求到哪个云环境的资源
        //   此处请填入环境 ID, 环境 ID 可打开云控制台查看
        //   如不填则使用默认环境（第一个创建的环境）
        // env: 'my-env-id',
        env: 'test-qjl9w',
        traceUser: true,
      })
    }

    await wx.cloud.callFunction({
      name: "getopenid",
    }).then(res => {
      console.log("成功", res.result.openid);
      this.globalData.openId = res.result.openid
          
      // 监听消息, 更新消息
      const db = wx.cloud.database()
      let watcher = db.collection("Message")
      .where({
        // 填入当前用户 openid，或如果使用了安全规则，则 {openid} 即代表当前用户 openid
        'dataJsonSet.receipt_openId': db.command.eq(this.globalData.openId),
        'dataJsonSet.new_type': 0
      })
      // 发起监听
      .watch({
        onChange: (snapshot) => {
          console.log('app snapshot onShow3333', snapshot)
          if (snapshot.docChanges != undefined && snapshot.docChanges.length != 0) {
            if(snapshot.docChanges[0].dataType === 'init')
            {
              this.globalData.messageNum = snapshot.docChanges.length
              this.UpdateListNum(this.globalData.messageNum);
            }
            else{
              let url = this.GetCurrentPageUrl() 
              for(let i = 0; i < snapshot.docChanges.length; i++)
              {
                console.log('app snapshot onShow', snapshot.docChanges[i].dataType)
                
                if(snapshot.docChanges[i].dataType === 'add' && url !== "pages/message/message"){
                  
                  console.log('app snapshot docs', snapshot.docChanges[i].doc)
                  this.globalData.messageNum = this.globalData.messageNum + 1
                  this.UpdateListNum(this.globalData.messageNum);
                }
                else if(snapshot.docChanges[i].dataType === 'add' && url === "pages/message/message")
                {
                  // 刷新页面
                  this.GetCurrentPage().onShow();
                }
              }
            }
          }
        },
        onError: (err) => {
          console.error('the watch closed because of error', err)
        }
      })
    }).catch(res => {
      console.log("失败", res);
    });
    console.log("getUserOpenId")


    // 获取用户信息
    wx.getSetting({
      success: res => {
        if (res.authSetting['scope.userInfo']) {
          // 已经授权，可以直接调用 getUserInfo 获取头像昵称，不会弹框
          wx.getUserInfo({
            success: res => {
              // 可以将 res 发送给后台解码出 unionId
              this.globalData.userInfo = res.userInfo

              if (this.globalData.userInfo != null) {
                this.globalData.hasUserInfo = true;
              }

              // 由于 getUserInfo 是网络请求，可能会在 Page.onLoad 之后才返回
              // 所以此处加入 callback 以防止这种情况
              if (this.userInfoReadyCallback) {
                this.userInfoReadyCallback(res)
              }
            }
          })
        }
      }
    })
  },

  UpdateListNum: function(num)
  { 
    if (num != 0)
    {
      wx.setTabBarBadge({
        index: 2,
        text: num.toString()
      })
    }
  },

  GetCurrentPage: function()
  {
    let pages = getCurrentPages() //获取加载的页面
    let currentPage = pages[pages.length - 1] //获取当前页面的对象
    return currentPage;
  },
  GetCurrentPageUrl: function()
  {
    let currentPage = this.GetCurrentPage() //获取当前页面的对象
    console.log("currentPage=", currentPage)
    let url = currentPage.route //当前页面url
    console.log("GetCurrentPageUrl url=", url);
    return url;
  },

  globalData: {
    userInfo: null,
    hasUserInfo: false,
    openId: "",
    messageNum: 0
  }
})