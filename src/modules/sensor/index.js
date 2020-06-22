import { NativeModules } from "react-native";

const { Sensor } = NativeModules;

export function getSensorInfo(){
   return Sensor.getSensorInfo();
}