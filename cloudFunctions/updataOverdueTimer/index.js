// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({
  env:'test-qjl9w',
})

let db = cloud.database()


// 云函数入口函数
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  let curData = new Date().getTime()
  await db.collection("Ticket").where({
    "_openid": wxContext.OPENID,
    "dataJsonSet.ticket_state": 1
  }).get().then(res=>{
    console.log("res=", res)
    let findList = res.data
    for(let i = 0; i < findList.length; i++)
    {
      if(findList[i].dataJsonSet.end_use_time < curData)
      {
        (async()=>{
          await db.collection("Ticket").where({
            "dataJsonSet.ticket_id": findList[i].dataJsonSet.ticket_id
          }).update({
            data:{
              "dataJsonSet.ticket_state": 4
            }
          })
        })()
        
      }
    }
  })
  
}