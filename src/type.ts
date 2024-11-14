export interface Resp<D> {
  code: number,
  msg: string,
  result: D
}

export interface City {
  id: number
  name: string
  province: string
  lng: string
  lat: string
  city_code: number
  code: string
  location: string
}

export interface Store {
  sid: number
  name: string
  address: string
  lat: number
  lng: number
  city_code: number
  status: number
  facade_img: string
  logo: string
  open_time: [string, string]
  telephone: string
  dist: number
  enable: number
}

export interface Area {
  aid: number
  title: string
  tips: string[]
  place: AreaPlace[]
}

export interface AreaPlace {
  sid: number
  pid: number
  aid: number
  title: string
  price: number
  content: string
  sale_text: string
  tags: string
  date_title: string
  timeline: { key: number | '次', val: boolean }[]
}
