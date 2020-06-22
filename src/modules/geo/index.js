import { NativeModules, NativeEventEmitter } from "react-native";

const { GEO } = NativeModules;
export class LocationListener {
  constructor(onLocationChanged) {
    this.onLocationChanged = onLocationChanged;
    this.eventListener = null;
  }
}
function addListener(locationListener) {
  let eventEmitter = new NativeEventEmitter(GEO);
  return eventEmitter.addListener(
    "onLocationChanged",
    locationListener.onLocationChanged
  );
}
export async function startListen(
  provider,
  minTime,
  minDistance,
  locationListener
) {
  try {
    let res = await GEO.startListen(
      provider,
      minTime,
      minDistance
    );
    let eventListener = addListener(locationListener);
    locationListener.eventListener = eventListener;
    return Promise.resolve(res);
  } catch (e) {
    return Promise.reject(e);
  }
}
export async function stopListen(locationListener) {
  try {
    let res = await GEO.stopListen();
    locationListener.eventListener.remove();
    return Promise.resolve(res);
  } catch (e) {
    return Promise.reject(e);
  }
}
