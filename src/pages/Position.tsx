import React, { Component } from "react";
import { StatusBar,Text,View ,SafeAreaView} from "react-native";
import * as Location from "expo-location";
import * as Permissions from "expo-permissions";
import Loading from "../components/loading";
import { LocationData } from "expo-location";
import { Slider } from "react-native-elements";

import {
  Accelerometer,
  Barometer,
  Gyroscope,
  Magnetometer,
  BarometerMeasurement,
  ThreeAxisMeasurement
} from "expo-sensors";
import { ScrollView } from "react-native-gesture-handler";
import { getTimeString } from "../utils";

interface Props {
  navigation: any;
}

interface ContextData {
  timeString: string;
  location: LocationData;
  accelerometerData: ThreeAxisMeasurement;
  barometerData: BarometerMeasurement;
  gyroscopeData: ThreeAxisMeasurement;
  magnetometerData: ThreeAxisMeasurement;
}
interface States {
  locationText: string; //当前坐标文本
  timeInterval: number;
  data: ContextData[];
}

export default class PositionScreen extends Component<Props, States> {
  static num = 1;
  constructor(props: Readonly<Props>) {
    super(props);
    this.state = {
      data: [],
      locationText: "",
      timeInterval: 20,
    };
    this.Loading = null;
    this.MapRemove = null;
    this.startLocation = this.startLocation.bind(this);
    this.locationCallback = this.locationCallback.bind(this);
    this.start = this.start.bind(this);
  }

  Loading: Loading;
  MapRemove: () => void;
  async startLocation(
    options: Location.LocationOptions,
    callback: (data: LocationData) => any
  ): Promise<{
    remove(): void;
  }> {
    try {
      let { status } = await Permissions.askAsync(Permissions.LOCATION);
      if (status !== "granted") {
        console.log("Permission to access location was denied");
        return Promise.reject("permisson reject");
      } else {
        return Location.watchPositionAsync(options, callback);
      }
    } catch (e) {
      console.log(e);
      return Promise.reject("Error");
    }
  }

  locationCallback(
    location: LocationData,
    a: ThreeAxisMeasurement,
    b: BarometerMeasurement,
    g: ThreeAxisMeasurement,
    m: ThreeAxisMeasurement
  ) {
    let contextData: ContextData = {
      location: {
        coords: {
          speed: -1,
          longitude: -1,
          latitude: -1,
          accuracy: -1,
          heading: -1,
          altitude: -1,
        },
        timestamp:0,
      },
      accelerometerData:null,
      barometerData:null,
      gyroscopeData:null,
      magnetometerData:null,
      timeString:""
    };
    contextData.location = location;
    contextData.timeString = getTimeString(location.timestamp);
    contextData.accelerometerData = a;
    contextData.barometerData = b;
    contextData.gyroscopeData = g;
    contextData.magnetometerData = m;
    console.log(contextData)
    let data = this.state.data;
    data.push(contextData);
    this.Loading.stopLoading();
    this.setState({
      data
    });

    // this.setState({
    //     region: {
    //         longitude: location.coords.longitude,
    //         latitude: location.coords.latitude,
    //         longitudeDelta: 0.04,
    //         latitudeDelta: 0.05
    //     }
    // })
  }
  locationReslove(remove: () => void) {
    this.MapRemove = remove;
  }
  start() {
    this.Loading.startLoading("正在寻找位置");
    Accelerometer.setUpdateInterval(this.state.timeInterval * 1000);
    Barometer.setUpdateInterval(this.state.timeInterval * 1000);
    Gyroscope.setUpdateInterval(this.state.timeInterval * 1000);
    Magnetometer.setUpdateInterval(this.state.timeInterval * 1000);
    let a: ThreeAxisMeasurement,
      b: BarometerMeasurement,
      g: ThreeAxisMeasurement,
      m: ThreeAxisMeasurement;
    Accelerometer.addListener(accelerometerData => {
      a = accelerometerData;
    });
    Barometer.addListener(barometerData => {
      b = barometerData;
    });
    Gyroscope.addListener(gyroscopeData => {
      g = gyroscopeData;
    });
    Magnetometer.addListener(magnetometerData => {
      m = magnetometerData;
    });
    this.startLocation(
      {
        accuracy: Location.Accuracy.Highest,
        timeInterval: this.state.timeInterval * 1000,
        distanceInterval: 0,
        mayShowUserSettingsDialog: false
      },
      location => {
        this.locationCallback(location, a, b, g, m);
      }
    ).then(({ remove }) => {
      this.locationReslove(remove);
    });
  }
  stop() {}
  componentDidMount() {
    this.start();
  }
  render() {
    return (
      <>
        <StatusBar
          translucent={true}
          backgroundColor="#00000000"
          barStyle="dark-content"
        />
        <SafeAreaView style={{ flex: 1, backgroundColor: "#fff" }}>
          <Loading
            ref={ref => {
              this.Loading = ref;
            }}
          />
          <ScrollView style={{ flex: 1}}>
            {this.state.data.map(dataValue => {
              <View style={{ backgroundColor: "#444444",height:20,borderBottomWidth:0.9 }}>
                <Text>{JSON.stringify(dataValue)}</Text>
              </View>;
            })}
          </ScrollView>
          <View style={{ alignItems: "center" }}>
            <View style={{ width: "70%" }}>
              <Slider
                thumbTintColor="#343434"
                minimumValue={0.5}
                maximumValue={60}
                step={0.5}
                value={this.state.timeInterval}
                onValueChange={timeInterval => this.setState({ timeInterval })}
              />
            </View>
          </View>
        </SafeAreaView>
      </>
    );
  }
}
