import { EventEmitter } from "react-native";
import {
    BarometerMeasurement,
    ThreeAxisMeasurement,
} from "expo-sensors";
export interface LocationData {
    timeString:string,
    location: {
        "latitude": number,
        "longitude": number,
        "provider": string,
        "time": number,
        "accuracy": number,
        "altitude": number
    },
    accelerometerData: ThreeAxisMeasurement | null;
    barometerData: BarometerMeasurement | null;
    gyroscopeData: ThreeAxisMeasurement | null;
    magnetometerData: ThreeAxisMeasurement | null;
}
export class LocationListener {
    onLocationChanged: (event: LocationData) => void
    constructor(onLocationChanged: (event: LocationData) => void);
}
export function startListen(provider: string, minTime: number, minDistance: number, locationListener: LocationListener): Promise<any>
export function stopListen(locationListener: LocationListener): Promise<any>
