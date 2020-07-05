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
    ticket: {  
      type: Object,
      value: {}
    },
    isShow: {
      type: Boolean,
      value: false
    },
    isFinish: {
      type: Boolean,
      value: false
    },
    isShowExpireTime: {
      type: Boolean,
      value: false
    },
    isExpireTimeCanTap: {
      type: Boolean,
      value: false
    }
  },

  attached: function(){
  },

  observers: {
    ticket: function () {
      // timestamp 被设置时，将它展示为可读时间字符串
      // 分钟倒计时
      let date_day = 0
      let date_time_hour = "00"
      let date_time_min = "00"
      let data_time_sec = "00"

      console.log("this.data.ticket=", this.data.ticket)

      if( this.data.ticket.dataJsonSet.ticket_type === 1){
        if(this.data.ticket.dataJsonSet.use_time_type === '天'){
          date_day = this.data.ticket.dataJsonSet.use_time
        }
        
        if(this.data.ticket.dataJsonSet.use_time_type === '时'){
          date_time_hour = util.formatNumber(this.data.ticket.dataJsonSet.use_time);
        }

        if(this.data.ticket.dataJsonSet.use_time_type === '分'){
          date_time_min = util.formatNumber(this.data.ticket.dataJsonSet.use_time);
        }

        if(this.data.ticket.dataJsonSet.use_time_type === '秒'){
          data_time_sec = util.formatNumber(this.data.ticket.dataJsonSet.use_time);
        }

      }
      
      let start_use_time = "0000/00/00"
      let end_use_time = "0000/00/00"
      if(this.data.isExpireTimeCanTap == false)
      {
        start_use_time = util.formatTime(this.data.ticket.dataJsonSet.start_use_time)
        end_use_time = util.formatTime(this.data.ticket.dataJsonSet.end_use_time)
        this.setData({
          'start_use_time': start_use_time,
          'end_use_time': end_use_time
        })
      }
      else{
        if('useTime' in this.data.ticket)
        {
          if(this.data.ticket.useTime.start_use_time !== 0 
              || this.data.ticket.useTime.end_use_time !== 0){
            start_use_time = util.formatTime(this.data.ticket.useTime.start_use_time)
            end_use_time = util.formatTime(this.data.ticket.useTime.end_use_time)
          }
        }

        this.setData({
          'start_use_time': start_use_time,
          'end_use_time': end_use_time
        })
      }

      // 设置开始时间和结束时间格式
      this.setData({
        // 'start_use_time': start_use_time,
        // 'end_use_time': end_use_time,
        'date_day': date_day,
        'date_time': date_time_hour + ':' + date_time_min + ':' + data_time_sec,
        'hour': parseInt(date_time_hour),
        'minute': parseInt(date_time_min),
        'second': parseInt(data_time_sec)
      })    
    },
    isShowExpireTime: function (value) {
      console.log("isShowExpireTime=", value)
      if(value === false){
        this.setData({
          start_use_time: "0000/00/00",
          end_use_time: "0000/00/00"
        })
      }
    }
    //,
    // startDate: function (value){
    //   console.log("m-ticket startDate value=", value)
    //   if(value !== 0){
    //     let start_use_time = util.formatTime(value)
    //     console.log("m-ticket startDate start_use_time=", start_use_time)
    //     this.setData({
    //       start_use_time: start_use_time
    //     })
    //   }
    // }, 
    // endDate: function (value){
    //   console.log("m-ticket endDate value=", value)
    //   if(value !== 0){
    //     let end_use_time = util.formatTime(value)
    //     console.log("m-ticket endDate end_use_time=", end_use_time)
    //     this.setData({
    //       end_use_time: end_use_time
    //     })
    //   }
    // }
  },

    /**
     * 组件的初始数据
     */
    data: {
      date_day: 0,
      isPause: true,
      hour: 0,
      minute: 0,
      second: 0,
      dialogShow: false,
      formData: {
        startDate: "0000/00/00",
        endDate: "0000/00/00"
      },
      validateFormState: false,
      error: '',
    },

    /**
     * 组件的方法列表
     */
    methods: {

      triggerCountDownFinsh: function(e)
      {
        console.log("triggerCountDownFinsh e=", e)

        this.triggerEvent('isCountDownFinsh',{isFinshed: e.detail.isFinshed}, {})
      },

      tapUpdateUseTime: function(){
        this.setData({
          dialogShow: true,
          error:""
        })
      },

      bindDateChange: function (e) {
        const {
          field
        } = e.currentTarget.dataset
    
        let date = e.detail.value;
        console.log("date=", date)
    
        if (field == "startDate") {
          this.setData({
            start_use_time: date
          })
          date += " 00:00:00";
        } else {
          this.setData({
            end_use_time: date
          })
          date += " 23:59:59";
        }
    
        
        let dateTimestamp = new Date(date).getTime()
    
    
        this.setData({
          [`formData.${field}`]: dateTimestamp
        })
      },

      tapDialogButton: function(){
        this.validateFormData()
      },

      async validateFormData() {
        // 检测结束时间不能小于开始时间
        console.log(this.data.formData["startDate"] )
        console.log(this.data.formData["endDate"] )

        if(this.data.formData["startDate"] === "0000/00/00" || this.data.formData["endDate"] === "0000/00/00"){
          this.setData({
            error: "时间不能为 0000/00/00",
            validateFormState: false
          })
        }
        else if (this.data.formData["startDate"] > this.data.formData["endDate"]) {
          this.setData({
            error: "结束时间不能小于开始时间",
            validateFormState: false
          })
        } else {
          // 校验通过
          this.triggerEvent("updateTime", {
            start_use_time: this.data.formData["startDate"],
            end_use_time: this.data.formData["endDate"]
          }, {})
          this.setData({
            start_use_time: util.formatTime(this.data.formData["startDate"]),
            end_use_time: util.formatTime(this.data.formData["endDate"]),
            dialogShow: false,
            validateFormState: true
          })
        }
      },

      catchLongTap: function(){
        return false
      }
    }
  })