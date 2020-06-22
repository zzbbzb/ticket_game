// components/m-countdown/m-countdown.js

const util = require("../../utils/util.js");

Component({
  /**
   * 组件的属性列表
   */
  properties: {
    date_time: {
      type: String,
      value: "00:00:00"
    },
    date_day: {
      type: Number,
      value: 0
    },
    isShow: {
      type: Boolean,
      value: false
    },
    isPause: {
      type: Boolean,
      value: false
    }, 
    hour: {
      type: Number,
      value: 0
    },
    minute: {
      type:Number,
      value: 0
    },
    second: {
      type: Number,
      value: 0
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    timer: null,

     //输入的倒计时
    //  hour:1,
    //  minute:0,
    //  second:5,
 
     //格式化的倒计时
     hour_format:'00',
     minute_format:'00',
     second_format:'00'
  },

  /**
   * 组件的方法列表
   */
  methods: {
    tapPlay: function()
    {
      if(!this.data.isShow)
      {
        return 
      }

      this.setData({
        isPause: !this.data.isPause
      })

      if(this.data.timer === null){
        this.data.timer = setInterval(() => {
          this.countDown()
          this.formatting()
          this.setData({
            date_time: this.data.hour_format + ":" + this.data.minute_format + ":" + this.data.second_format
          })
        }, 1000)
      }
    },

    tapPause: function(){
      clearInterval(this.data.timer);
      this.setData({
        isPause: !this.data.isPause,
        timer: null
      })
    },

    countDown: function(){
      this.setData({
        second: this.data.second-1
      })
      
      if (this.data.second <= 0) {
        if (this.data.minute === 0) {
          if (this.data.hour === 0) {
            if( this.data.date_day === 0 ){
              clearInterval(this.data.timer)
              this.setData({
                timer: null,
                isPause: true,
                isShow: false,
                isFinish: true
              })

              this.triggerEvent('isCountDownFinsh', {isFinshed: this.data.isFinish}, {})
            }
            else{
               //day不等于0, 小时, 分和秒都等于0时
              this.setData({
                second: 59,
                minute: 59,
                hour: 23,
                date_day: this.data.date_day - 1
              })
            }
          }
          else {
            //小时不等于0，分和秒都等于0时
            this.setData({
              second: 59,
              minute: 59,
              hour: this.data.hour - 1
            })
          }
        }
        else {
          //秒等于0，分不等于0
          this.setData({
            second: 59,
            minute: this.data.minute - 1
          })
        }
      }
    },

    formatting:function(){
      this.setData({
        hour_format: util.formatNumber(this.data.hour),
        minute_format: util.formatNumber(this.data.minute),
        second_format: util.formatNumber(this.data.second),
      })
    },

  }
})
