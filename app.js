const config = require("./utils/config.js");
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
        // env: 'giftbox-fwj0j',
        traceUser: true,
      })
    }

    console.log("app.js config.DATA_BASE_NAME.MESSAGE= ", config.DATA_BASE_NAME.MESSAGE);

    await wx.cloud.callFunction({
      name: "getopenid",
    }).then(res => {
      console.log("成功", res.result.openid);
      this.globalData.openId = res.result.openid
          
      // 监听消息, 更新消息
      const db = wx.cloud.database()
      db.collection("Ticket_Game_Message")
      .where({
        // 填入当前用户 openid，或如果使用了安全规则，则 {openid} 即代表当前用户 openid
        'dataJsonSet.receipt_openId': this.globalData.openId,
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
                  this.GetCurrentPage().updateMessage(snapshot.docChanges[i].doc);
                }
              }
            }
          }
        },
        onError: (err) => {
          console.error('the watch closed because of error', err)
        }
      })

      db.collection("Ticket_Game_Message")
      .where({
        // 填入当前用户 openid，或如果使用了安全规则，则 {openid} 即代表当前用户 openid
        'dataJsonSet.send_openId': this.globalData.openId,
        'dataJsonSet.msg_receipt': 0,
        'dataJsonSet.new_type': 1
      })
      // 发起监听
      .watch({
        onChange: (snapshot) => {
          console.log('app snapshot openWatcherReceiptMessage', snapshot)
          if (snapshot.docChanges != undefined && snapshot.docChanges.length != 0) {
            if(snapshot.docChanges[0].dataType !== 'init')
            {
              let url = this.GetCurrentPageUrl() 
              let curPage = this.GetCurrentPage()
              console.log("url=", url)
              for(let i = 0; i < snapshot.docChanges.length; i++)
              {
                if(snapshot.docChanges[i].dataType === 'update'){
                  console.log('app snapshot docs', snapshot.docChanges[i].doc)
                  // 更改券ticket_use_state
                  let ticket_id = snapshot.docChanges[i].doc.dataJsonSet.ticket_id
                  let msg_receipt = snapshot.docChanges[i].doc.dataJsonSet.msg_receipt
                  
                  if(url === "pages/ticket/ticket" && msg_receipt !== 0){
                    // 在ticket 页面，手动改变page中tickets中的值  
                    if(msg_receipt === 1)
                    {
                      curPage.hUpdateTicketUseState(ticket_id)
                    }
                    else if(msg_receipt === 2) // 取消
                    {
                      curPage.hUpdateTicketState(ticket_id)
                    }
                  }  
                }
              }
            }
           
            //   {
            // if(snapshot.docChanges[0].dataType === 'init')
            // {
            //   this.globalData.messageNum = snapshot.docChanges.length
            //   this.UpdateListNum(this.globalData.messageNum);
            // }
            // else{
            //   let url = this.GetCurrentPageUrl() 
            //   for(let i = 0; i < snapshot.docChanges.length; i++)
            //   {
            //     console.log('app snapshot onShow', snapshot.docChanges[i].dataType)
                
            //     if(snapshot.docChanges[i].dataType === 'add' && url !== "pages/message/message"){
                  
            //       console.log('app snapshot docs', snapshot.docChanges[i].doc)
            //       this.globalData.messageNum = this.globalData.messageNum + 1
            //       this.UpdateListNum(this.globalData.messageNum);
            //     }
            //     else if(snapshot.docChanges[i].dataType === 'add' && url === "pages/message/message")
            //     {
            //       // 刷新页面
            //       this.GetCurrentPage().onShow();
            //     }
            //   }
            // }
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
    }else{
      wx.removeTabBarBadge({
        index: 2,
        text: ''
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
    messageNum: 0,
    counts: {
      addCount: 0,    // 添加新的券的次数
      // shareCount: 0   // 分享的次数
    }
  }
})