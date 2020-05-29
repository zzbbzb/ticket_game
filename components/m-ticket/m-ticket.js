// components/m-ticket/m-ticket.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    dataJsonSet: {
      type: Object,
      value: {}
    }
  },

  observers: {
    dataJsonSet: function () {
      // timestamp 被设置时，将它展示为可读时间字符串
      console.log("m-ticket dataJsonSet=", this.data.dataJsonSet)
      // 设置开始时间和结束时间格式

      // 分钟倒计时

      // 获取玩家名字
    }
  },

    /**
     * 组件的初始数据
     */
    data: {

    },

    /**
     * 组件的方法列表
     */
    methods: {

    }
  })