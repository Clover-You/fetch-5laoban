import dayjs from 'dayjs'
import fetch, { FormData } from 'node-fetch'

import { genAppletToken } from './token'
import { Area, City, Resp, Store } from './type'

import cacheJson from '../data.json'

import fs from 'fs/promises'

const BASE_URL = 'https://api.5laoban.com'
async function getStoreList() {
  const URI = '/store/list'
  const timestamp = new Date().getTime()

  const appletToken = genAppletToken({ path: URI, timestamp })

  const formData = new FormData()

  formData.set('timestamp_private', timestamp)

  const resp = await fetch(BASE_URL + URI, {
    method: 'POST',
    headers: {
      'applet-token': appletToken,
      'wxappid': 'wxa0e84aff71320e3c',
      'version': '3.110.0'
    },
    body: formData
  })

  return await resp.json() as Resp<{
    city: City[]
    list: Store[]
  }>
}

async function getAreaList(sid: number) {
  const URI = '/area/getplace4scene'
  const timestamp = new Date().getTime()

  const appletToken = genAppletToken({ path: URI, timestamp })

  const formData = new FormData()

  formData.set('timestamp_private', timestamp)
  formData.set('store', sid)

  const resp = await fetch(BASE_URL + URI, {
    method: 'POST',
    headers: {
      'applet-token': appletToken,
      'wxappid': 'wxa0e84aff71320e3c',
      'version': '3.110.0'
    },
    body: formData
  })

  return await resp.json() as Resp<{
    area: Area[]
  }>
}

interface PlaceRes {
  sid: number
  pid: number
  aid: number
  price: number
  title: string
  sale_text: Record<string, string>
  content: Record<string, string>
  timeline: Record<string, Record<number, boolean>>
}

interface AreaRes {
  aid: number
  title: string
  tips: Record<string, string[]>
  place: Record<number, PlaceRes>
}

interface StoreRes {
  sid: number
  name: string
  address: string
  telephone: string
  area: Record<number, AreaRes>
}

// {
//   9242: {
//     "sid": 9242,
//     "name": "粤麻自助棋牌室（广州店）",
//     "address": "广州市白云区京溪街道云景商务大厦409",
//     telephone: 232,
//     area: {
//       17599: {
//         "aid": 17599,
//         "title": "包厢",
//         "tips": {
//           "2024-11-14 32:32": ["24小时营业，可提前6天预约，2小时起约"]
//         },
//         place: {
//           157219: {
//             "sid": 9242,
//             "pid": 157219,
//             "aid": 17599,
//             "price": 1950,
//             content: {
//               "2024-11-14 32:32": "①累计消费满500元可享受会员折扣\n②先充值，后订房\n③充值就送，多充多送！",
//             },
//             timeline: {
//               "2024-11-14 32:32": { 13: true }
//             }
//           }
//         }
//       }
//     }
//   }
// }

(async function () {
  const collect: Record<number, StoreRes> = cacheJson ?? {}

  const { result } = await getStoreList()

  const areaResultAll = await Promise.all(result.list.map(async ({ sid, address, name, telephone }) => {
    collect[sid] ??= { address, name, sid, telephone, area: {} }
    const result = await getAreaList(sid)
    return [sid, result] as const
  }))

  const nowDateTime = dayjs().format('YYYY-MM-DD hh:mm')

  const areaAll = areaResultAll.filter(([_, { code }]) => code == 100)
    .map(([sid, { result }]) => [sid, result.area] as const)

  areaAll.forEach(([sid, area]) => {
    const item = collect[sid].area
    area.forEach(({ aid, place, tips, title }) => {
      item[aid] ??= { aid, tips: {}, title, place: {} }
      item[aid].tips[nowDateTime] = tips

      place.forEach(({ aid, content, pid, price, sale_text, sid, timeline, title }) => {
        item[aid].place[pid] ??= { aid, content: {}, pid, price, sid, timeline: {}, title, sale_text: {} }
        item[aid].place[pid].content ??= {}
        item[aid].place[pid].sale_text ??= {}
        
        item[aid].place[pid].content[nowDateTime] = content
        item[aid].place[pid].sale_text[nowDateTime] = sale_text

        let today = dayjs().format('YYYY-MM-DD')

        timeline.forEach(it => {
          if (it.key === '次') {
            today = dayjs().add(1, 'days').format('YYYY-MM-DD')
            return
          }

          if (!it.val) return

          item[aid].place[pid].timeline[today] ??= {}
          item[aid].place[pid].timeline[today][it.key] = it.val
        })
      })
    })
  })


  // areaAll.forEach(({ place }) => {
  //   place
  //   collect[]

  // })

  fs.writeFile(
    'data.json',
    JSON.stringify(collect,
      null,
      2
    )
  )
})()
