// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV,
  // env:'giftbox-fwj0j'
})

let db = cloud.database()
const _ = db.command

// 云函数入口函数
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  let curData = new Date().getTime()
  console.log("openid=", wxContext.OPENID)

  await db.collection("Ticket_Game_UserExtraInfo").where({
    "dataJsonSet.add_count": _.lte(0),
  }).update({
    data:{
      "dataJsonSet.add_count": 2
    }
  })

}