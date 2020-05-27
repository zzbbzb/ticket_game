// pages/addTicket/addTicket.js
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
      name: 'foodName',
      rules: {
        required: true,
        message: '菜品名称必填'
      },
    }, {
      name: 'foodPrice',
      rules: [{
        required: true,
        message: '菜品价格必填'
      }, {
        isNum: true,
        message: '菜品价格要是数字'
      }],
    }],

    radio_items: [
      {name: '0', value: '计数券', checked: true},
      {name: '1', value: '时效券'}
    ],
    radioValue: 0,

    timeType: ["分", "秒", "时", "天"],
    timeTypeIndex: 0,

    startDate: "2015-01-01",
    endDate: "2015-01-01",
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let curDate = new Date();
    let year = curDate.getFullYear();
    let month = curDate.getMonth() + 1;
    let day = curDate.getDate();
    console.log(month)
    console.log(this.prefixZero(month, 2))
    let curTime = year + "-" + this.prefixZero(month, 2) + "-" + this.prefixZero(day, 2);
    this.setData({
      startDate: curTime,
      endDate: curTime
    })
  },

  // 给不足位的数字前面补0
  prefixZero: function(num, n) {
    return (Array(n).join(0) + num).slice(-n);
  },

  bindDateChange: function (e) {
    this.setData({
        startDate: e.detail.value,
        [`formData.date`]: e.detail.value
    })
  },

  radioChange: function (e) {
    console.log('radio发生change事件，携带value值为：', typeof(e.detail.value))

    let radioValue = parseInt(e.detail.value);

    this.setData({
      radioValue: radioValue
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
    }
    else
    {
      // 确认, 还继续创建新券
      this.setData({
        showDialog: !this.data.showDialog,
      })
    }
  }

})