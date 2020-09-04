// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV,
  // env:'giftbox-fwj0j'
})

let db = cloud.database()


// 云函数入口函数
exports.main = async (event, context) => {
  let dataBaseName = event.dataBaseName
  let updateData = event.updateData
  let whereObject = event.whereObject

  return await db.collection(dataBaseName).where(whereObject).update({
    data:updateData
  })
}