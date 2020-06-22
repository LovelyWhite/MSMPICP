import axios from "axios";
export interface Value {
  key: string;
  value: string;
}
// 返回一个字符串显示发送日期
//返回 昨天 前天 和日期
export function getTimeString(timestamp: number): string {
  let now = new Date(Date.now());
  let msg = new Date(timestamp);

  let nowDate = now.getDate();
  let msgDate = msg.getDate();
  let nowYear = now.getFullYear();
  let msgYear = msg.getFullYear();
  let nowMouth = now.getMonth() + 1;
  let msgMouth = msg.getMonth() + 1;
  let nowHours = now.getHours();
  let msgHours = msg.getHours();
  let nowMinutes = now.getMinutes();
  let msgMinutes = msg.getMinutes();
  let nowSeconds = now.getSeconds();
  let msgSeconds = msg.getSeconds();

  let h_s = msgHours < 10 ? "0" + msgHours : "" + msgHours;
  let m_s = msgMinutes < 10 ? "0" + msgMinutes : "" + msgMinutes;
  let s_s = msgSeconds < 10 ? "0" + msgSeconds : "" + msgSeconds;
  if (nowYear - msgYear === 0) {
    if (nowDate - msgDate === 0) {
      //今天

      return h_s + ":" + m_s + ":" + s_s;
    } else if (nowDate - msgDate === 1) {
      return "昨天 " + h_s + ":" + m_s;
      //昨天
    } else if (nowDate - msgDate === 2) {
      //前天
      return "前天 " + h_s + ":" + m_s;
    } else {
      return msgMouth + "-" + msgDate + " " + msgHours + ":" + msgMinutes;
    }
  } else {
    return (
      msgYear +
      "-" +
      msgMouth +
      "-" +
      msgDate +
      " " +
      msgHours +
      ":" +
      msgMinutes
    );
  }
}

export const URL = "https://suxitech.work";
export function pushData(
  url: string,
  values: any,
  timeout:number,
  onUploadProgress?: (progressEvent: any) => void
) {
  return axios.post(URL + url, values, {
    headers: {
      "Content-Type": "application/json",
    },
    timeout:timeout,
    onUploadProgress: onUploadProgress,
  });
}
