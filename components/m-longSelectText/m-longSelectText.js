// components/m-longSelectText/m-longSelectText.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    buttons:{
      type: Array,
      value: ['删除']
    },
    scrollOffset: {
      type: Number,
      value:0
    },
    index: {
      type: Number,
      value: -1
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    show: false,
    top: 0,
    left: 0,
    dialogShow: false
  },

  /**
   * 组件的方法列表
   */
  methods: {
    handlelongTap: function(e){
      console.log("handlelongTap = ", e)

      let systemInfo = wx.getSystemInfoSync();
      let delta = systemInfo.windowWidth / 750
      let deletBtnWidth = (200 * delta).toFixed(0)
      let deletBtnHeight = (80 * delta).toFixed(0)
      console.log("handlelongTap systemInfo=", systemInfo)
      console.log("handlelongTap deletBtnWidth=", deletBtnWidth)
      console.log("handlelongTap windowWidth=", systemInfo.windowWidth)
      console.log("handlelongTap windowHeight=", systemInfo.windowHeight)

      
      let left = e.touches[0].clientX
      let top = e.touches[0].clientY
      console.log("handlelongTap e.touches[0].clientX=", e.touches[0].clientX)
      console.log("handlelongTap (left + deletBtnWidth)=",(parseInt(left) + parseInt(deletBtnWidth)))
      if((parseInt(left) + parseInt(deletBtnWidth)) >= systemInfo.windowWidth){
        left = left - deletBtnWidth
      }

      console.log("handlelongTap e.touches[0].clientY=", e.touches[0].clientY)
      console.log("handlelongTap (top + deletBtnHeight)=", (parseInt(top) + parseInt(deletBtnHeight)))
      
      if((parseInt(top) + parseInt(deletBtnHeight)) >= systemInfo.windowHeight){
        top = top - deletBtnHeight
      }

      console.log("handlelongTap top=", top)
      

      this.setData({
        show: true,
        top: top + this.data.scrollOffset,
        left: left
      })
    },

    tapButton: function(){
      console.log("tapButton")

      this.setData({
        dialogShow: true,
        show:false
      })
    },

    tapDialogButton: function(e){
      console.log("tapDialogButton e=", e)
      if(e.detail.index === 1) // 确认
      {
        if(this.data.index !== -1)
        {
          this.triggerEvent("deleteTicket", {index: this.data.index}, {})
        }
      }

      this.setData({
        dialogShow: false
      })
    },

    popouttouchmove: function(){
      console.log("popouttouchmove")
    //   this.setData({
    //     show:false
    //   })
    },

    btntouchmove: function(){
      console.log("btntouchmove")
      // this.setData({
      //   show:false
      // })
      return false
    },

    cancelSelect: function(){
      console.log("cancelSelect")
      this.setData({
        show: false
      })
    }
  }
})
