export async function isConnect() {
    let timeOut;
    let f = fetch('https://google.com/');
    let t = new Promise((res, rej) => {
        timeOut = () => rej("Time Out")
    })
    setTimeout(timeOut, 3000);
    return Promise.race([f, t])
}