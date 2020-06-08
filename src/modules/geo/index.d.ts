import { EventEmitter } from "react-native";
export interface LocationData{ "latitude": number, "longitude": number, "provider": string, "time": number,"accuracy":number,"altitude":number }
export class LocationListener{
    onLocationChanged:(event: LocationData) => void
    constructor(onLocationChanged:(event: LocationData) => void);
}
export function startListen(provider: string, minTime: number, minDistance: number,locationListener:LocationListener): Promise<any>
export function stopListen(locationListener:LocationListener): Promise<any>
