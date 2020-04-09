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
import RNFS from "react-native-fs";

import DeviceInfo from "react-native-device-info";
import {
  Accelerometer,
  Barometer,
  Gyroscope,
  Magnetometer,
  BarometerMeasurement,
  ThreeAxisMeasurement,
} from "expo-sensors";
import { Badge } from "react-native-elements";
import Feather from "react-native-vector-icons/Feather";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import FontAwesome from "react-native-vector-icons/FontAwesome";
import AntDesign from "react-native-vector-icons/AntDesign";
import Entypo from "react-native-vector-icons/Entypo";
import { getTimeString } from "../utils";
import {
  LocationData,
  startListen,
  LocationListener,
  stopListen,
} from "../modules/geo";
import { TouchableOpacity } from "react-native-gesture-handler";

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
  data: ContextData[]; //缓存数据

  constructor(props: Readonly<Props>) {
    super(props);
    this.data = []; //展示的数据
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
    this.stop = this.stop.bind(this);
    this.save = this.save.bind(this);
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
    let enabled = await DeviceInfo.isLocationEnabled();
    if (!enabled) {
      Alert.alert("提示", "请打开GPS");
    } else {
      this.Loading.startLoading("正在寻找位置");
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
              this.setState({
                running: true,
              });
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
            this.setState({
              running: true,
            });
          })
          .catch((e) => {
            console.log(e);
            Alert.alert("错误", "" + e);
            this.Loading.stopLoading();
          });
      }
    }
  }
  async stop() {
    this.Loading.startLoading("正在停止");
    stopListen(this.locationListener)
      .then(() => {
        this.setState({
          running: false,
        });
        Accelerometer.removeAllListeners();
        Barometer.removeAllListeners();
        Gyroscope.removeAllListeners();
        Magnetometer.removeAllListeners();
        this.a = null;
        this.b = null;
        this.g = null;
        this.m = null;
        this.created = false;
      })
      .catch((e) => {
        console.log(e);
        Alert.alert("错误", "" + e);
      })
      .finally(() => {
        this.Loading.stopLoading();
      });
  }
  save() {
    if (!this.state.running) {
      if (this.state.data.length != 0) {
        this.Loading.startLoading("正在保存数据");

        //创建文件夹

        RNFS.mkdir(RNFS.DocumentDirectoryPath + "/storedata")
          .then(() => {
            //写文件
            RNFS.writeFile(
              RNFS.DocumentDirectoryPath + "/storedata/" + Date.now() + ".txt",
              JSON.stringify(this.state.data),
              "utf8"
            )
              .then(() => {
                Alert.alert("提示", "数据保存成功");
              })
              .catch((e) => {
                Alert.alert("错误", "" + e);
              })
              .finally(() => {
                this.Loading.stopLoading();
              });
          })
          .catch((e) => {
            Alert.alert("错误", "" + e);
          })
          .finally(() => {
            this.Loading.stopLoading();
          });
      } else {
        Alert.alert("提示", "数据为空");
      }
    } else {
      Alert.alert("提示", "请先停止数据收集");
    }
  }
  componentDidMount() {}
  render() {
    return (
      <View style={{ paddingTop: StatusBar.currentHeight, flex: 1 }}>
        <StatusBar
          translucent={true}
          backgroundColor={Platform.Version > 22 ? "#00000000" : "#c0c0c0"}
          barStyle="dark-content"
        />
        <Loading
          ref={(ref) => {
            this.Loading = ref;
          }}
        />
        <SafeAreaView style={{ flex: 1 }}>
          <View
            style={{
              height: 50,
              alignItems: "center",
              borderBottomWidth: 0.3333,
              borderBottomColor: "#00000011",
              flexDirection: "row",
            }}
          >
            <Text style={{ fontSize: 20, color: "#000", marginLeft: 20 }}>
              控制台
            </Text>
            {this.state.data.length > 0 && (
              <Badge
                textStyle={{ fontSize: 11 }}
                containerStyle={{ position: "relative", top: -4 }}
                value={this.state.data.length}
                status="error"
              />
            )}
            <Text style={{ fontSize: 10, marginLeft: 10 }}></Text>
            <View style={{ flex: 1 }}></View>
            <View style={{ marginRight: 20 }}>
              <TouchableOpacity onPress={this.save}>
                <AntDesign name="save" size={25} />
              </TouchableOpacity>
            </View>
            <View style={{ marginRight: 20 }}>
              <TouchableOpacity
                onPress={() => {
                  this.props.navigation.navigate("History");
                }}
              >
                <MaterialCommunityIcons name="history" size={25} />
              </TouchableOpacity>
            </View>
          </View>
          {this.state.data.length == 0 ? (
            <View
              style={{
                flex: 1,
                justifyContent: "center",
                alignItems: "center",
                flexDirection: "row",
              }}
            >
              <Text>请点击</Text>
              <Entypo name="controller-play" size={23} color="green" />
              <Text>启动数据收集</Text>
            </View>
          ) : (
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
                          <FontAwesome name="ban" />
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
                          <FontAwesome name="ban" />
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
                          <FontAwesome name="ban" />
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
                          <FontAwesome name="ban" />
                        )}
                      </View>
                    </View>
                  </View>
                );
              })}
            </ScrollView>
          )}
          <View
            style={{
              paddingHorizontal: 10,
              alignItems: "center",
              justifyContent: "space-around",
              flexDirection: "row",
              height: 40,
              borderTopWidth: 0.3333,
              borderTopColor: "#00000022",
            }}
          >
            {!this.state.running ? (
              <TouchableOpacity
                style={{
                  width: 30,
                  height: 30,
                  justifyContent: "center",
                  alignItems: "center",
                }}
                onPress={this.start}
              >
                <Entypo name="controller-play" size={23} color="green" />
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                style={{
                  width: 30,
                  height: 30,
                  justifyContent: "center",
                  alignItems: "center",
                }}
                onPress={this.stop}
              >
                <Entypo name="controller-paus" size={18} color="red" />
              </TouchableOpacity>
            )}

            <Slider
              style={{ flex: 1 }}
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
            <Text style={{ fontSize: 12, width: 30 }}>
              {this.state.timeInterval} s
            </Text>
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
    alignItems: "flex-end",
    justifyContent: "center",
  },
});
