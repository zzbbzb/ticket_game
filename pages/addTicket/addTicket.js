// pages/addTicket/addTicket.js
const app = getApp();
const config = require("../../utils/config.js");

Page({

  /**
   * 页面的初始数据
   */
  data: {
    showDialog: false,
    backDelta: 1,
    error: '',
    formData: {

    },
    rules: [{
      name: 'ticketName',
      rules: {
        required: true,
        message: '券名称必填'
      },
    }, {
      name: 'ticketDetail',
      rules: {
        required: true,
        message: '券详细信息必填'
      },
    }, {
      name: 'ticketUseCount',
      rules: {
        required: true,
        message: '使用次数'
      },
    }, {
      name: 'useTime',
      rules: {
        required: false,
        message: '耗时时间不能为空'
      },
    }],

    radio_items: [{
        name: '0',
        value: '计数券',
        checked: true
      },
      {
        name: '1',
        value: '时效券'
      }
    ],
    radioValue: 0,

    timeType: ["分", "秒", "时", "天"],
    timeTypeIndex: 0,

    startDate: "2015-01-01",
    endDate: "2015-01-01",

    validateFormState: false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let curDate = new Date();
    let year = curDate.getFullYear();
    let month = curDate.getMonth() + 1;
    let day = curDate.getDate();

    let curTime = year + "-" + this.prefixZero(month, 2) + "-" + this.prefixZero(day, 2);

    let startDateTimestamp = new Date(curTime + " 00:00:00").getTime();
    let endDateTimestamp = new Date(curTime + " 11:59:59").getTime();

    this.setData({
      startDate: curTime,
      endDate: curTime,
      [`formData.startDate`]: startDateTimestamp,
      [`formData.endDate`]: endDateTimestamp,
      [`formData.useTimeType`]: this.data.timeType[this.data.timeTypeIndex],
      [`formData.ticketType`]: this.data.radioValue

    })
  },

  // 给不足位的数字前面补0
  prefixZero: function (num, n) {
    return (Array(n).join(0) + num).slice(-n);
  },

  // 表单input输入内容
  formInputChange: function (e) {
    const {
      field
    } = e.currentTarget.dataset

    this.setData({
      [`formData.${field}`]: e.detail.value
    })

    console.log("formData=", this.data.formData)
  },

  // 表单textarea输入内容
  formTextAreaChange: function (e) {
    const {
      field
    } = e.currentTarget.dataset

    this.setData({
      [`formData.${field}`]: e.detail.value
    })
  },

  // 表单radio 输入内容
  radioChange: function (e) {
    console.log('radio发生change事件，携带value值为：', typeof (e.detail.value))

    let radioValue = parseInt(e.detail.value);

    console.log(this.data.rules)
    console.log(this.data.rules.length)
    if (radioValue === 1) {
      for (let i = 0; i < this.data.rules.length; i++) {
        console.log("this.data.rules[i]=", this.data.rules[i]);
        let rule = this.data.rules[i]
        console.log(rule.name)

        if (rule.name === "ticketUseCount") {
          let key = "rules[" + i + "].rules.required"
          this.setData({
            [key]: false,
          })
        }

        if (rule.name === "useTime") {
          let key = "rules[" + i + "].rules.required"
          this.setData({
            [key]: true,
          })
        }
      }
    } else if (radioValue === 0) {
      for (let i = 0; i < this.data.rules.length; i++) {
        let rule = this.data.rules[i]
        if (rule.name === "ticketUseCount") {
          let key = "rules[" + i + "].rules.required"
          this.setData({
            [key]: true,
          })
        }

        if (rule.name === "useTime") {
          let key = "rules[" + i + "].rules.required"
          this.setData({
            [key]: false,
          })
        }
      }
    }

    this.setData({
      radioValue: radioValue,
      [`formData.ticketType`]: radioValue
    })
  },

  // 表单 耗时类型 输入内容
  bindUseTimeTypeChange: function (e) {
    console.log('picker country 发生选择改变，携带值为', e.detail.value);

    this.setData({
      timeTypeIndex: e.detail.value,
      [`formData.useTimeType`]: this.data.timeType[e.detail.value]
    })

    console.log("formData=", this.data.formData)
  },

  //表单 日期 输入内容
  bindDateChange: function (e) {
    const {
      field
    } = e.currentTarget.dataset

    let date = e.detail.value;
    console.log("date=", date)

    if (field == "startDate") {
      this.setData({
        startDate: date
      })
      date += " 00:00:00";
    } else {
      this.setData({
        endDate: date
      })
      date += " 23:59:59";
    }

    
    let dateTimestamp = new Date(date).getTime()


    this.setData({
      [`formData.${field}`]: dateTimestamp
    })
  },

  // 提交表单
  async submitForm () {
    // 检验数据
    this.validateFormData();

    // 保存数据库
    if (this.data.validateFormState) {
      await this.upLoadFormDataAndReturn();
    }
  },

  // 更新表单数据并且返回主页面
  async upLoadFormDataAndReturn() {

      await this.uploadFormData();

      console.log("退出添加券")
  
      wx.navigateBack({
        delta: this.data.backDelta
      });
  },
  
  async updateAddCount(num)
  {
    await wx.cloud.callFunction({
      name: "updateData",
      data: {
        "dataBaseName": config.DATA_BASE_NAME.USER_EXTRA_INFO,
        "whereObject": {
          "_openid": app.globalData.openId
        },
        "updateData": {
          "dataJsonSet.add_count": num
        }
      }
    }).then(res => {
      console.log("成功保存,", res)
    })
  },

  // 更新form中的数据
  async uploadFormData() {

    // let coverImgPath = this.data.formData[this.data.coverPic];
    // 创建时间
    let curTimeStamp = new Date().getTime();
    // 券id
    let ticketId = app.globalData.openId + curTimeStamp;

    let use_count = 'ticketUseCount' in this.data.formData ?  this.data.formData["ticketUseCount"]: "0";
    let use_time = 'useTime' in this.data.formData ?  this.data.formData["useTime"]: "0";
    
    
    let nickName = ' '
    if(app.globalData.userInfo != null && "nickName" in app.globalData.userInfo)
    {
      nickName = app.globalData.userInfo.nickName
    }
    
    // 保存券进入数据库
    await wx.cloud.callFunction({
      name: "addData",
      data: {
        "dataBaseName": config.DATA_BASE_NAME.TICKET,
        "dataJsonSet": {
          "ticket_id": ticketId,
          "ticket_name": this.data.formData["ticketName"],
          "ticket_type": this.data.formData["ticketType"],
          "ticket_detail_info": this.data.formData["ticketDetail"],
          "create_time": curTimeStamp,
          "start_use_time": this.data.formData["startDate"],
          "end_use_time": this.data.formData["endDate"],
          "use_time_type": this.data.formData["useTimeType"],
          "use_count": use_count,
          "use_time": use_time,
          "ticket_state": 0,
          "giving_openid": app.globalData.openId,
          "giving_name": nickName,
          "ticket_use_state": 0
        },
        "waitFlag": true
      }
    }).then(res => {
      console.log("成功保存,", res)
    })
  },

  // 验证表单数据
  async validateFormData() {
    await this.selectComponent('#form').validate((valid, errors) => {
      console.log('valid', valid, errors)
      if (!valid) {
        const firstError = Object.keys(errors)
        if (firstError.length) {
          this.setData({
            error: errors[firstError[0]].message,
            validateFormState: false
          })
        }
      } else {

        // 检测结束时间不能小于开始时间
        console.log(this.data.formData["startDate"] )
        console.log(this.data.formData["endDate"] )
        
        const pages = getCurrentPages()
        const prevPage = pages[pages.length-2] // 上一页
         
        if (this.data.formData["startDate"] > this.data.formData["endDate"]) {
          this.setData({
            error: "结束时间不能小于开始时间",
            validateFormState: false
          })
        }
        else if(prevPage.data.addCount <= 0)
        {
          this.setData({
            error: "没有增加券的次数",
            validateFormState: false
          })
        }
        else
        {
            // 调用上一个页面的setData 方法，将数据存储
          prevPage.setData({
            addCount: prevPage.data.addCount - 1
          })
      
            // 更新用户增加次数
          this.updateAddCount(prevPage.data.addCount);
          // 校验通过
          this.setData({
            validateFormState: true
          })
        }
      }
    })
  },

  // 导航退回上一层
  goBack: function (e) {
    console.log("goBack = ", e);
    this.setData({
      showDialog: !this.data.showDialog,
      backDelta: e.detail.delta
    })
  },

  // 点击弹窗内的按钮
  tapDialogButton: function (e) {
    if (e.detail.index === 0) {
      // 取消, 停止创建新券
      this.setData({
        showDialog: !this.data.showDialog,
      })

      wx.navigateBack({
        delta: this.data.backDelta
      })
    } else {
      // 确认, 还继续创建新券
      this.setData({
        showDialog: !this.data.showDialog,
      })
    }
  }

})