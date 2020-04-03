export function getTimeString(timestamp: number): string {
  let msg = new Date(timestamp);
  let h = msg.getHours();
  let h_s = h < 10 ? "0" + h : "" + h;
  let m = msg.getMinutes();
  let m_s = m < 10 ? "0" + m : "" + m;
  let s = msg.getSeconds();
  let s_s = s < 10 ? "0" + s : "" + s;
  return h_s + ":" + m_s + ":" + s_s;
}
