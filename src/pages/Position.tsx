import React, { Component } from "react";
import {
  StatusBar,
  Text,
  View,
  SafeAreaView,
  Alert,
  StyleSheet,
  ScrollView,
  Platform,
} from "react-native";
import Slider from "@react-native-community/slider";
import * as Permissions from "expo-permissions";
import Loading from "../components/loading";

import {
  Accelerometer,
  Barometer,
  Gyroscope,
  Magnetometer,
  BarometerMeasurement,
  ThreeAxisMeasurement,
} from "expo-sensors";
import Feather from "react-native-vector-icons/Feather";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import FontAwesome from "react-native-vector-icons/FontAwesome";
import Entypo from "react-native-vector-icons/Entypo";
import { getTimeString } from "../utils";
import {
  LocationData,
  startListen,
  LocationListener,
  stopListen,
} from "../modules/geo";
import { TouchableOpacity } from "react-native-gesture-handler";
import ThreeAxisSensor from "expo-sensors/build/ThreeAxisSensor";

interface Props {
  navigation: any;
}

interface ContextData {
  timeString: string;
  location: LocationData;
  accelerometerData: ThreeAxisMeasurement | null;
  barometerData: BarometerMeasurement | null;
  gyroscopeData: ThreeAxisMeasurement | null;
  magnetometerData: ThreeAxisMeasurement | null;
}
interface States {
  timeInterval: number;
  data: ContextData[];
  running: boolean;
}

export default class PositionScreen extends Component<Props, States> {
  created: boolean;
  ScrollView: ScrollView;

  constructor(props: Readonly<Props>) {
    super(props);
    this.state = {
      data: [],
      timeInterval: 5,
      running: false,
    };
    this.Loading = null;
    this.a = null;
    this.b = null;
    this.g = null;
    this.m = null;
    this.created = false; //是否首次获取位置
    this.locationListener = new LocationListener("app1", async (e) => {
      if (!this.created) {
        let p1 = new Promise(async (r, j) => {
          let a_is = await Accelerometer.isAvailableAsync();
          if (a_is) {
            Accelerometer.addListener((accelerometerData) => {
              this.a = accelerometerData;
              r("ok");
            });
          } else {
            r("ok");
          }
        });
        let p2 = new Promise(async (r, j) => {
          let b_is = await Barometer.isAvailableAsync();
          if (b_is) {
            Barometer.addListener((barometerData) => {
              this.b = barometerData;
              r("ok");
            });
          } else {
            r("ok");
          }
        });

        let p3 = new Promise(async (r, j) => {
          let g_is = await Gyroscope.isAvailableAsync();
          if (g_is) {
            Gyroscope.addListener((gyroscopeData) => {
              this.g = gyroscopeData;
              r("ok");
            });
          } else {
            r("ok");
          }
        });

        let p4 = new Promise(async (r, j) => {
          let m_is = await Magnetometer.isAvailableAsync();
          if (m_is) {
            Magnetometer.addListener((magnetometerData) => {
              this.m = magnetometerData;
              r("ok");
            });
          } else {
            r("ok");
          }
        });
        this.created = true;
        await Promise.all([p1, p2, p3, p4]);
        this.Loading.stopLoading();
      }
      let dItem: ContextData = {
        timeString: getTimeString(e.time),
        location: e,
        accelerometerData: this.a,
        barometerData: this.b,
        gyroscopeData: this.g,
        magnetometerData: this.m,
      };
      let c_vect = [dItem];
      c_vect = c_vect.concat(this.state.data);
      this.setState({
        data: c_vect,
      });
    });
    this._setSensorInterval = this._setSensorInterval.bind(this);
    this.start = this.start.bind(this);
  }
  a: ThreeAxisMeasurement;
  b: BarometerMeasurement;
  g: ThreeAxisMeasurement;
  m: ThreeAxisMeasurement;
  Loading: Loading;
  locationListener: LocationListener;

  _setSensorInterval(timeInterval: number) {
    Accelerometer.setUpdateInterval(timeInterval * 1000);
    Barometer.setUpdateInterval(timeInterval * 1000);
    Gyroscope.setUpdateInterval(timeInterval * 1000);
    Magnetometer.setUpdateInterval(timeInterval * 1000);
  }
  async start() {
    this.Loading.startLoading("正在寻找位置");
    this.setState({
      running: true,
    });

    if (Platform.Version > 22) {
      const { status } = await Permissions.askAsync(Permissions.LOCATION);
      if (status === "granted") {
        startListen(
          "gps",
          this.state.timeInterval * 1000,
          0,
          this.locationListener
        )
          .then(() => {
            this._setSensorInterval(this.state.timeInterval);
          })
          .catch((e) => {
            console.log(e);
            Alert.alert("错误", "" + e);
            this.Loading.stopLoading();
          });
      } else {
        Alert.alert("提示", "权限被拒绝");
        this.Loading.stopLoading();
      }
    } else {
      startListen(
        "gps",
        this.state.timeInterval * 1000,
        0,
        this.locationListener
      )
        .then(() => {
          this._setSensorInterval(this.state.timeInterval);
        })
        .catch((e) => {
          console.log(e);
          Alert.alert("错误", "" + e);
          this.Loading.stopLoading();
        });
    }
  }
  stop(): Promise<any> {
    Accelerometer.removeAllListeners();
    Barometer.removeAllListeners();
    Gyroscope.removeAllListeners();
    Magnetometer.removeAllListeners();
    this.a = null;
    this.b = null;
    this.g = null;
    this.m = null;
    this.created = false;
    return stopListen(this.locationListener);
  }
  componentDidMount() {}
  render() {
    return (
      <View style={{ paddingTop: StatusBar.currentHeight, flex: 1 }}>
        <StatusBar
          translucent={true}
          backgroundColor="#00000000"
          barStyle="dark-content"
        />
        <Loading
          ref={(ref) => {
            this.Loading = ref;
          }}
        />
        <SafeAreaView style={{ flex: 1 }}>
          <ScrollView
            style={{ flex: 1 }}
            ref={(ref) => (this.ScrollView = ref)}
          >
            {this.state.data.map((dataValue, index) => {
              return (
                <View
                  key={index}
                  style={{
                    paddingHorizontal: 20,
                    paddingTop: 5,
                  }}
                >
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      opacity: 0.8,
                    }}
                  >
                    <Feather name="clock" size={10} color="#000" />
                    <Text
                      style={{
                        fontSize: 10,
                        paddingHorizontal: 5,
                        fontWeight: "700",
                        color: "#000",
                      }}
                    >
                      {dataValue.timeString}
                    </Text>
                  </View>
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                    }}
                  >
                    <View style={styles.icon}>
                      <Feather name="navigation" size={16} color="#409EFF" />
                      <Text
                        style={{
                          fontSize: 8,
                          textAlign: "center",
                          color: "#409EFF",
                        }}
                      >
                        坐标(lng,lat)
                      </Text>
                    </View>
                    <View style={styles.dataContainer}>
                      <Text style={styles.data}>
                        {dataValue.location.longitude}
                      </Text>
                      <Text style={styles.data}>
                        {dataValue.location.latitude}
                      </Text>
                      <Text
                        style={{
                          fontSize: 8,
                          opacity: 0.7,
                          alignSelf: "flex-end",
                        }}
                      >
                        精度:{dataValue.location.accuracy}
                      </Text>
                    </View>
                  </View>

                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                    }}
                  >
                    <View style={styles.icon}>
                      <MaterialCommunityIcons
                        name="alpha"
                        size={16}
                        color="#F56C6C"
                      />
                      <Text
                        style={{
                          fontSize: 8,
                          textAlign: "center",
                          color: "#F56C6C",
                        }}
                      >
                        加速度(x,y,z)
                      </Text>
                    </View>

                    <View style={styles.dataContainer}>
                      {dataValue.accelerometerData != null ? (
                        <>
                          <Text style={styles.data}>
                            {dataValue.accelerometerData.x}
                          </Text>
                          <Text style={styles.data}>
                            {dataValue.accelerometerData.y}
                          </Text>
                          <Text style={styles.data}>
                            {dataValue.accelerometerData.z}
                          </Text>
                        </>
                      ) : (
                        <Text>null</Text>
                      )}
                    </View>
                  </View>
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                    }}
                  >
                    <View style={styles.icon}>
                      <MaterialCommunityIcons
                        name="axis-arrow"
                        size={16}
                        color="#67C23A"
                      />
                      <Text
                        style={{
                          fontSize: 8,
                          textAlign: "center",
                          color: "#67C23A",
                        }}
                      >
                        陀螺仪(x,y,z)
                      </Text>
                    </View>
                    <View style={styles.dataContainer}>
                      {dataValue.gyroscopeData != null ? (
                        <>
                          <Text style={styles.data}>
                            {dataValue.gyroscopeData.x}
                          </Text>
                          <Text style={styles.data}>
                            {dataValue.gyroscopeData.y}
                          </Text>
                          <Text style={styles.data}>
                            {dataValue.gyroscopeData.z}
                          </Text>
                        </>
                      ) : (
                        <Text>无数据</Text>
                      )}
                    </View>
                  </View>

                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                    }}
                  >
                    <View style={styles.icon}>
                      <FontAwesome name="magnet" size={15} color="#606266" />
                      <Text
                        style={{
                          fontSize: 8,
                          textAlign: "center",
                          color: "#606266",
                        }}
                      >
                        磁力计(x,y,z)
                      </Text>
                    </View>
                    <View style={styles.dataContainer}>
                      {dataValue.magnetometerData != null ? (
                        <>
                          <Text style={styles.data}>
                            {dataValue.magnetometerData.x}
                          </Text>
                          <Text style={styles.data}>
                            {dataValue.magnetometerData.y}
                          </Text>
                          <Text style={styles.data}>
                            {dataValue.magnetometerData.z}
                          </Text>
                        </>
                      ) : (
                        <Text>null</Text>
                      )}
                    </View>
                  </View>
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                    }}
                  >
                    <View style={styles.icon}>
                      <MaterialCommunityIcons
                        name="weather-cloudy"
                        size={15}
                        color="#ffa83b"
                      />
                      <Text
                        style={{
                          fontSize: 8,
                          textAlign: "center",
                          color: "#ffa83b",
                        }}
                      >
                        气压计
                      </Text>
                    </View>
                    <View style={styles.dataContainer}>
                      {dataValue.barometerData != null ? (
                        <Text style={styles.data}>
                          {dataValue.barometerData.pressure}
                        </Text>
                      ) : (
                        <Text>null</Text>
                      )}
                    </View>
                  </View>
                </View>
              );
            })}
          </ScrollView>
          <View
            style={{
              alignItems: "center",
              justifyContent: "space-evenly",
              flexDirection: "row",
              paddingBottom: 10,
            }}
          >
            <View>
              <Text style={{ fontSize: 12 }}>
                数据量:{this.state.data.length}
              </Text>
            </View>
            {!this.state.running ? (
              <View>
                <TouchableOpacity
                  onPress={() => {
                    this.start();
                  }}
                >
                  <View>
                    <Entypo name="controller-play" size={23} color="green" />
                  </View>
                </TouchableOpacity>
              </View>
            ) : (
              <View>
                <TouchableOpacity
                  onPress={() => {
                    this.stop().finally(() => {
                      this.setState({
                        running: false,
                      });
                    });
                  }}
                >
                  <View>
                    <Entypo name="controller-paus" size={18} color="red" />
                  </View>
                </TouchableOpacity>
              </View>
            )}
            <View style={{ width: 200 }}>
              <Text style={{ fontSize: 12, width: 80, alignSelf: "flex-end" }}>
                间隔:{this.state.timeInterval}s
              </Text>
              <Slider
                minimumValue={1}
                maximumValue={60}
                step={1}
                value={this.state.timeInterval}
                minimumTrackTintColor="#111"
                thumbTintColor="#111"
                onValueChange={(timeInterval) => {
                  this.setState({ timeInterval });
                }}
                disabled={this.state.running}
              />
            </View>
          </View>
        </SafeAreaView>
      </View>
    );
  }
}
const styles = StyleSheet.create({
  icon: {
    alignItems: "center",
    justifyContent: "space-between",
    marginRight: 4,
    width: 30,
  },
  data: {
    fontSize: 10,
  },
  dataContainer: {
    flex: 1,
    minHeight: 40,
    borderBottomWidth: 0.2,
    alignItems: "flex-end",
    justifyContent: "center",
  },
});
