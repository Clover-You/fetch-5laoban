import CryptoJS from 'crypto-js'

const baseURL = 'https://www.5laoban.com/'
const appID = 'wxa0e84aff71320e3c'
const appVersion = '3.110.0'

type Params = { path: string, timestamp: number}

export function genAppletToken({ path, timestamp }: Params) {
  // 拼接必要信息
  const tokenString = `${baseURL}${appID}${appVersion}${path}${timestamp}${baseURL}`;

  // 使用 MD5 加密生成 token
  return CryptoJS.MD5(tokenString).toString();
}
