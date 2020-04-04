import { NativeModules, NativeEventEmitter } from 'react-native';

const { GEO } = NativeModules;
export class LocationListener {
  constructor(name, onLocationChanged) {
    this.onLocationChanged = onLocationChanged;
    this.name = name;
  }
}
function addListener(locationListener){
 let eventEmitter = new NativeEventEmitter(GEO);
 locationListener.eventListener = eventEmitter.addListener(
    'onLocationChanged',
    locationListener.onLocationChanged,
  );
};
export function startListen(provider, minTime, minDistance, locationListener) {
  addListener(locationListener);
  return GEO.startListen(provider, locationListener.name, minTime, minDistance);
}
export function stopListen(locationListener) {
  locationListener.eventListener.remove()
  return GEO.stopListen(locationListener.name);
}
export function isListening() {
  return GEO.isListening();
}
export function getAllProviders() {
  return GEO.getAllProviders();
}
