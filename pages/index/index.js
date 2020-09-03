//index.js
//获取应用实例
const app = getApp()
const config = require("../../utils/config.js");
const db = wx.cloud.database()
let watcher = null

Page({
  data: {
    motto: 'Hello World',
    userInfo: {},
    hasUserInfo: false,
    ticketList: [],
    isShowGiving: false,
    // selectUseTime: {},
    canShareNum: 0,
    canShare: false,
    error: "",
    scrollOffset: 0,
    addCount: 0,
    // shareCount: 0
  },

  onLoad: function () {
    if (app.globalData.userInfo) {
      console.log("onLoad app.globalData.userInfo")
      this.updataUserInfoAndGetOtherInfo()
    }
    // else {
    //   // 由于 getUserInfo 是网络请求，可能会在 Page.onLoad 之后才返回
    //   // 所以此处加入 callback 以防止这种情况
    //   console.log("app.userInfoReadyCallback")
    //   console.log("app", app.globalData.userInfo)

    //   app.userInfoReadyCallback = res => {
    //     this.updataUserInfoAndGetOtherInfo()
    //   }
    // }
    console.log("index onlauch")
    this.setData({
      addCount: app.globalData.counts.addCount, 
      // shareCount: app.globalData.counts.shareCount
    })

    // for (let i = 0, lenI = ticketList.length; i < lenI; ++i) {
    //   ticketList[i].checked = false
    // }
    // 隐藏右上角分享
    // wx.hideShareMenu()
  },

  onShow: function () {
    console.log("index onShow")
    if (watcher == null) {
      watcher = db.collection("Ticket")
        .where({
          // 填入当前用户 openid，或如果使用了安全规则，则 {openid} 即代表当前用户 openid
          _openid: app.globalData.open_id,
          'dataJsonSet.giving_openid': app.globalData.open_id
        })
        // 发起监听
        .watch({
          onChange: (snapshot) => {
            console.log('app snapshot onShow', snapshot)
            if (snapshot.docChanges != undefined && snapshot.docChanges.length != 0) {
              for (let i = 0; i < snapshot.docChanges.length; i++) {
                console.log('app snapshot onShow', snapshot.docChanges[i].dataType)
                if (snapshot.docChanges[i].dataType === 'add') {
                  let tmpList = this.data.ticketList;
                  console.log('app snapshot docs', snapshot.docChanges[i].doc)

                  tmpList.push(snapshot.docChanges[i].doc);
                  this.setData({
                    ticketList: tmpList
                  })
                  console.log("this.data.ticketList=", this.data.ticketList)
                } else if (snapshot.docChanges[i].dataType === 'remove') {
                  let newList = this.data.ticketList
                  let canShareNum = this.data.canShareNum
                  let shareFlag = this.data.isShowGiving
                  let canShare = this.data.canShare
                  let selectCount = 0
                  let deleteIndex = -1
                  for (let j = 0; j < newList.length; j++) {
                    if('checked' in newList[j] && newList[j].checked === true){
                      selectCount ++
                    }
                    if (newList[j]._id === snapshot.docChanges[i].doc._id) {   
                      if('checked' in newList[j] && newList[j].checked === true){
                        selectCount = selectCount - 1
                        if('changeTime' in newList[j] && newList[j].changeTime === true){
                          canShareNum = canShareNum - 1
                        }
                      }
                      deleteIndex = j;
                    }
                  }

                  if(deleteIndex !== -1){
                    newList.splice(deleteIndex, 1);
                  }
                  console.log("ticket=", newList)

                  if (selectCount > 0) {
                    shareFlag = true
                  } else {
                    shareFlag = false
                  }

                  if (canShareNum === selectCount) {
                    canShare = true
                  }else{
                    canShare = false
                  }

                  console.log("deleteTicket canShareNum=", canShareNum)
                  console.log("deleteTicket selectCount=", selectCount)

                  this.setData({
                    ticketList: newList,
                    isShowGiving: shareFlag,
                    canShareNum: canShareNum,
                    canShare: canShare
                  })
                }
              }
            }
          },
          onError: (err) => {
            console.error('the watch closed because of error', err)
          }
        })
    }

  },

  checkboxChange: function (e) {
    console.log('checkbox发生change事件，携带value值为：', e.detail)

    let ticketList = this.data.ticketList
    let values = e.detail.value

    let preValues = []
    for(let i = 0, lenI = ticketList.length; i < lenI; ++i){
      if('checked' in ticketList[i] && ticketList[i].checked === true){
        preValues.push(i)
      }
    }

    console.log("preValues = ", preValues)
    console.log("values = ", values)

    let selectTicketIndex = -1
    let preValuesLength = preValues.length
    console.log("preValuesLength=", preValues.length)
    let canShareNum = this.data.canShareNum

    if (values.length > preValuesLength) // 增加
    {
      for (let i = 0, lenI = ticketList.length; i < lenI; ++i) {
        for (let j = 0, lenJ = values.length; j < lenJ; ++j) {
          if (i === parseInt(values[j]) && ticketList[i].checked !== true) {
            ticketList[i].checked = true
            ticketList[i].changeTime = false
            selectTicketIndex = i
            break
          }
        }
      }
    } else { // 减少
      for (let i = 0, lenI = preValuesLength; i < lenI; i++) {
        let findflag = false;
        for (let j = 0, lenJ = values.length; j < lenJ; j++) {
          if (parseInt(values[j]) === preValues[i]) {
            findflag = true
            break
          }
        }
        if (findflag === false) {
          selectTicketIndex = parseInt(preValues[i])
          console.log("min selectTicketIndex= ", selectTicketIndex)
          ticketList[selectTicketIndex].checked = false
          if (ticketList[selectTicketIndex].changeTime) {
            canShareNum = canShareNum - 1

            let useTime = {
              start_use_time: 0,
              end_use_time: 0
            }
            ticketList[selectTicketIndex].useTime = useTime  
          }
          ticketList[selectTicketIndex].changeTime = false
          break
        }
      }
    }

    console.log("checkboxChange ticketList=", ticketList)

    console.log("selectTicketIndex =", selectTicketIndex)

    let selectTicket = null

    if (selectTicketIndex !== -1) {
      selectTicket = "ticketList[" + selectTicketIndex + "]"
    }

    console.log(selectTicket)

    let canShare = false
    if (canShareNum === e.detail.value.length) {
      canShare = true
    }

    console.log("canShareNum=", canShareNum)
    console.log("e.detail.value.length=", e.detail.value.length)
    console.log("e.detail.value=", e.detail.value)
    console.log("canShare=", canShare)


    if (selectTicket !== null) {
      this.setData({
        canShare: canShare,
        canShareNum: canShareNum,
        [selectTicket]: ticketList[selectTicketIndex],
        isShowGiving: e.detail.value.length > 0 ? true : false
      })
    }

    console.log("ticketList = ", this.data.ticketList)

  },

  /* 获得index中所有券 */
  async getTickets() {
    await wx.cloud.callFunction({
      name: "queryData",
      data: {
        "dataBaseName": config.DATA_BASE_NAME.TICKET,
        "whereObject": {
          "_openid": app.globalData.openId,
          "dataJsonSet.giving_openid": app.globalData.openId
        },
      }
    }).then(res => {
      console.log("getTickets=", res)
      const findList = res.result.data
      console.log("getTickets=", findList)
      this.setData({
        ticketList: findList
      })
      console.log(this.data.ticketList)
    })
  },

  async getUserName(openId, name) {
    await wx.cloud.callFunction({
      name: "queryData",
      data: {
        "dataBaseName": config.DATA_BASE_NAME.USER_INFO,
        "whereObject": {
          "_openid": openId,
        },
      }
    }).then(res => {
      const findList = res.result.data
      if (findList.length > 0) {
        name = findList[0].dataJsonSet.nickName
      }
    })
  },

  // 点击添加券
  tapAddTicket: function () {
    console.log("index/tapAddTicket")

    if(this.data.shareCount > 0)
    {
      wx.navigateTo({
        url: '/pages/addTicket/addTicket',
      })
    }
    else
    {
      this.setData({
        error: "新建券次数为0"
      })
    }
    
  },

  // 更新玩家信息和其它信息
  async updataUserInfoAndGetOtherInfo() {
    app.globalData.hasUserInfo = true;
    console.log("app.globalData.hasUserInfo=", app.globalData.hasUserInfo)
    this.setData({
      hasUserInfo: app.globalData.hasUserInfo,
      userInfo: app.globalData.userInfo
    })

    await this.getTickets();
  },

  // 获得玩家信息
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
      // 更新数据库 UserInfo
      await this.updateUserInfo();

      await this.getTickets();
    }
  },

  async updateUserInfo() {
    await wx.cloud.callFunction({
      name: "updateData",
      data: {
        "dataBaseName": config.DATA_BASE_NAME.USER_INFO,
        "whereObject": {
          "_openid": app.globalData.openId
        },
        "updateData": {
          "dataJsonSet.userInfo": app.globalData.userInfo
        }
      }
    }).then((res)=>{
      console.log(res)
    })
  },

  // 写入userInfo数据库
  async addUserInfo() {
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

  handleShareError: function () {
    console.log("catch handleShareError")
    // this.setData({
    //   error: "分享券可用时间不能为0000/00/00"
    // })

    let errorMsg = ""
    if(!this.data.canShare)
    {
      errorMsg = "分享券可用时间不能为0000/00/00"
    }

    if(errorMsg != "")
    {
      this.setData({
        error: errorMsg
      })
    }
   
  },

  handleShareCount:function()
  {
    console.log("handleShareCount")
    this.setData({
      shareCount: this.data.shareCount - 1
    })
    
  },

  // 转发
  onShareAppMessage: function (res) {
    console.log("bind onShareAppMessage")
    if (res.from === 'button') {
      // 来自页面内转发按钮
      console.log("res.target=", res.target)
    }

    let givingTicketId = "";
    let curTimeStamp = 0;
    let selectedTicketList = [];
    let selectCount = 0
    let ticketList = this.data.ticketList
    for(let i = 0, lenI = ticketList.length; i < lenI; ++i){
      if('checked' in ticketList[i] && ticketList[i].checked === true){
        selectCount = selectCount + 1
      }
    }
    
    if (selectCount != 0) {
      curTimeStamp = new Date().getTime();
      // 券id
      givingTicketId = app.globalData.openId + curTimeStamp;

      for (let i = 0; i < this.data.ticketList.length; i++) {
        if('checked' in this.data.ticketList[i] && this.data.ticketList[i].checked === true){
          let selectTicket = this.data.ticketList[i]
          selectTicket.dataJsonSet.start_use_time = selectTicket.useTime.start_use_time
          selectTicket.dataJsonSet.end_use_time = selectTicket.useTime.end_use_time
          selectedTicketList.push(selectTicket)
        }
      }

    }
    console.log("givingTicketId=", givingTicketId)
    console.log("curTimeStamp=", curTimeStamp)
    console.log("selectedTicketList=", JSON.stringify(selectedTicketList))

    return {
      title: '自定义转发标题',
      path: '/pages/receiveTicket/receiveTicket?givingOpenId=' + app.globalData.openId + "&givingTicketId=" + givingTicketId + "&curTimeStamp=" + curTimeStamp + "&selectedTicketList=" + JSON.stringify(selectedTicketList)
    }
  },

  changeTicketTime: function (options) {
    console.log("changeTicketTime options=", options)
    const index = options.currentTarget.dataset.index
    const start_use_time = options.detail.start_use_time
    const end_use_time = options.detail.end_use_time
    
    let ticketList = this.data.ticketList

    let selectCount = 0
    for(let i = 0, lenI = ticketList.length; i < lenI; ++i){
      if('checked' in ticketList[i] && ticketList[i].checked === true){
        selectCount = selectCount + 1
      }
    }
    
    let useTime = {
      start_use_time: start_use_time,
      end_use_time: end_use_time
    }

    let changeTime = "ticketList[" + index + "].changeTime"
    let ticketUseTime = "ticketList[" + index +"].useTime"
    // ticket.useTime = useTime
    let canShare = false

    if (this.data.canShareNum + 1 === selectCount) {
      canShare = true
    }

    this.setData({
      canShare: canShare,
      // [uIndex]: useTime[index],
      [ticketUseTime]: useTime,
      [changeTime]: true,
      canShareNum: this.data.canShareNum + 1
    })

    console.log("changeTicketTime ticketList=", this.data.ticketList)
  },

  onPageScroll: function (res) {
    // console.log("onPageScroll res =", res);
    this.setData({
      scrollOffset: res.scrollTop
    })
  },

  deleteTicket: function (e) {
    console.log("deleteTicket e=", e)

    const index = e.detail.index

    const id = this.data.ticketList[index]._id
    console.log("deleteTicket id=", id)

    // 数据库删除
    this.deleteTicketInDB(id)
  },

  async deleteTicketInDB(id) {
    await wx.cloud.callFunction({
      name: "deleteData",
      data: {
        "dataBaseName": config.DATA_BASE_NAME.TICKET,
        "whereObject": {
          "_id": id,
        },
      }
    }).then(res => {
      console.log(res)
    })
  },

  catchTap: function()
  {
    console.log("catchTap")
    return false;
  }

})