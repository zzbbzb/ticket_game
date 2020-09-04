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
  let whereObject = event.whereObject
  
  const { OPENID } = cloud.getWXContext()

  const db_database = db.collection(dataBaseName)

  return await db_database.where(whereObject).get()
}