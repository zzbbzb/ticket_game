// components/m-longSelectText/m-longSelectText.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    buttons:{
      type: Array,
      value: ['编辑', '删除']
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    show: false,
  },

  /**
   * 组件的方法列表
   */
  methods: {
    handlelongTap: function(e){
      console.log("handlelongTap = ", e)
      this.setData({
        show: true
      })
    },

    tapButton: function(){
      console.log("tapButton")
    },

    cancelSelect: function(){
      console.log("cancelSelect")
      this.setData({
        show: false
      })
    }
  }
})
