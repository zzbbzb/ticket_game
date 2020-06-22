// components/m-ticket/m-ticket.js

const util = require("../../utils/util.js");

Component({

  options: {
    // pureDataPattern: /^dataJsonSet$/ // 将 timestamp 属性指定为纯数据字段
    multipleSlots: true
  },
  /**
   * 组件的属性列表
   */
  properties: {
    dataJsonSet: {  
      type: Object,
      value: {}
    },
    isShow: {
      type: Boolean,
      value: false
    }
  },

  attached: function(){
  },

  observers: {
    dataJsonSet: function () {
      // timestamp 被设置时，将它展示为可读时间字符串
      // 分钟倒计时
      let date_day = 0
      let date_time_hour = "00"
      let date_time_min = "00"
      let data_time_sec = "00"
      console.log("this.data.dataJsonSet=", this.data.dataJsonSet)

      if( this.data.dataJsonSet.ticket_type === 1){
        if(this.data.dataJsonSet.use_time_type === '天'){
          date_day = this.data.dataJsonSet.use_time
        }
        
        if(this.data.dataJsonSet.use_time_type === '时'){
          date_time_hour = util.formatNumber(this.data.dataJsonSet.use_time);
        }

        if(this.data.dataJsonSet.use_time_type === '分'){
          date_time_min = util.formatNumber(this.data.dataJsonSet.use_time);
        }

        if(this.data.dataJsonSet.use_time_type === '秒'){
          data_time_sec = util.formatNumber(this.data.dataJsonSet.use_time);
        }

      }

      // 设置开始时间和结束时间格式
      this.setData({
        'start_use_time': util.formatTime(this.data.dataJsonSet.start_use_time),
        'end_use_time': util.formatTime(this.data.dataJsonSet.end_use_time),
        'date_day': date_day,
        'date_time': date_time_hour + ':' + date_time_min + ':' + data_time_sec,
        'hour': parseInt(date_time_hour),
        'minute': parseInt(date_time_min),
        'second': parseInt(data_time_sec)
      })    
    }
  },

    /**
     * 组件的初始数据
     */
    data: {
      date_day: 0,
      isPause: true,
      hour: 0,
      minute: 0,
      second: 0
    },

    /**
     * 组件的方法列表
     */
    methods: {
      triggerCountDownFinsh: function(e)
      {
        console.log("triggerCountDownFinsh e=", e)

        this.triggerEvent('isCountDownFinsh',{isFinshed: e.detail.isFinshed}, {})
      }
    }
  })