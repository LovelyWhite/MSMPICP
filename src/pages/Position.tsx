import React, { Component } from "react";
import {
  StatusBar,
  Text,
  View,
  SafeAreaView,
  Alert,
  StyleSheet,
  ScrollView,
  BackHandler,
  Dimensions,
} from "react-native";
import SplashScreen from "react-native-splash-screen";
import {
  VictoryChart,
  VictoryTheme,
  VictoryLine,
  VictoryZoomContainer,
  VictoryAxis,
  VictoryLabel,
  VictoryTooltip,
} from "victory-native";
import Slider from "@react-native-community/slider";
import * as Permissions from "expo-permissions";
import Loading from "../components/loading";
import { Table, Row, Rows } from "react-native-table-component";
import RNFS from "react-native-fs";
import DeviceInfo from "react-native-device-info";
import {
  Accelerometer,
  Barometer,
  Gyroscope,
  Magnetometer,
} from "expo-sensors";
import { Badge } from "react-native-elements";
import Feather from "react-native-vector-icons/Feather";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import FontAwesome from "react-native-vector-icons/FontAwesome";
import AntDesign from "react-native-vector-icons/AntDesign";
import Entypo from "react-native-vector-icons/Entypo";
import { getTimeString, pushData } from "../utils";
import {
  LocationData,
  startListen,
  LocationListener,
  stopListen,
} from "../modules/geo";
import { TouchableOpacity } from "react-native-gesture-handler";
import AsyncStorage from "@react-native-community/async-storage";
import { getSensorInfo } from "../modules/sensor";

interface Props {
  navigation: any;
  route: any;
}
interface States {
  timeInterval: number;
  data: LocationData[];
  running: boolean;
  realTimeUpload: boolean;
}

export default class PositionScreen extends Component<Props, States> {
  created: boolean;
  ScrollView: ScrollView;
  _unsubscribe: any;
  model: string;
  uniqueId: string;
  brand: string;
  sensorInfo: [];
  constructor(props: Readonly<Props>) {
    super(props);
    this.state = {
      realTimeUpload: true,
      data: [],
      timeInterval: 5,
      running: false,
    };
    this.Loading = null;
    this.created = false; //是否首次获取位置

    this.locationListener = new LocationListener(async (e) => {
      if (!this.created) {
        this.created = true;
        this.Loading.stopLoading();
      }
      let dItem: LocationData = e;
      dItem.timeString = getTimeString(e.location.time);
      let uploadData = {
        uniqueId: this.uniqueId,
        model: this.model,
        brand: this.brand,
        sensorInfo: this.sensorInfo,
        data: [dItem],
      };
      if (this.state.realTimeUpload) {
        pushData("/upload", uploadData, 1000);
      }
      let c_vect = this.state.data;
      c_vect.push(dItem);
      this.setState({
        data: c_vect,
      });
    });
    this._unsubscribe = this.props.navigation.addListener("focus", async () => {
      try {
        let s_v1 = await AsyncStorage.getItem("setting_realtime_upload");
        let v1 = JSON.parse(s_v1);
        if (v1) {
          if (v1.realTimeUpload != this.state.realTimeUpload) {
            this.setState({
              realTimeUpload: v1.realTimeUpload,
              data: [],
            });
          }
        } else {
          this.setState({
            realTimeUpload: true,
          });
        }
      } catch (e) {
        console.log(e);
      }
    });
    this.start = this.start.bind(this);
    this.stop = this.stop.bind(this);
    this.save = this.save.bind(this);
    this.clear = this.clear.bind(this);
    this.goSetting = this.goSetting.bind(this);
    this.onBackAndroid = this.onBackAndroid.bind(this);
  }
  Loading: Loading;
  locationListener: LocationListener;

  async start() {
    let enabled = await DeviceInfo.isLocationEnabled();
    if (!enabled) {
      Alert.alert("提示", "请打开GPS");
    } else {
      this.Loading.startLoading("正在寻找位置");
      const { status } = await Permissions.askAsync(Permissions.LOCATION);
      if (status === "granted") {
        startListen(
          "gps",
          this.state.timeInterval * 1000,
          0,
          this.locationListener
        )
          .then(() => {
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
        this.created = false;
        if (this.state.realTimeUpload) {
          this.setState({
            data: [],
          });
        }
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
                this.setState({
                  data: [],
                });
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
  clear() {
    Alert.alert("提示", "确定清空当前数据？", [
      {
        text: "ok",
        onPress: () => {
          this.setState({
            data: [],
          });
        },
        style: "default",
      },
      {
        text: "cancel",
        style: "cancel",
      },
    ]);
  }
  async componentDidMount() {
    this.model = DeviceInfo.getModel();
    this.uniqueId = DeviceInfo.getUniqueId();
    this.brand = DeviceInfo.getBrand();
    this.sensorInfo = await getSensorInfo();
    let gyroscope = await Gyroscope.isAvailableAsync();
    let accelerometer = await Accelerometer.isAvailableAsync();
    let barometer = await Barometer.isAvailableAsync();
    let magnetometer = await Magnetometer.isAvailableAsync();
    SplashScreen.hide();
    Alert.alert(
      "传感器状态",
      "GPS:" +
        (gyroscope ? "可用" : "不可用") +
        "\n" +
        "加速度计:" +
        (accelerometer ? "可用" : "不可用") +
        "\n" +
        "气压计:" +
        (barometer ? "可用" : "不可用") +
        "\n" +
        "磁力计:" +
        (magnetometer ? "可用" : "不可用") +
        "\n"
    );
  }
  componentWillUnmount() {
    this._unsubscribe && this._unsubscribe();
    BackHandler.removeEventListener("hardwareBackPress", this.onBackAndroid);
  }
  componentWillMount() {
    BackHandler.addEventListener("hardwareBackPress", this.onBackAndroid);
  }
  goSetting() {
    if (!this.state.running) {
      this.props.navigation.navigate("Setting");
    } else {
      Alert.alert("提示", "请先停止数据收集");
    }
  }
  onBackAndroid() {
    if (this.props.route.name == "Position") {
      Alert.alert("退出", "确认退出程序？", [
        {
          text: "ok",
          onPress: () => {
            BackHandler.exitApp();
          },
          style: "default",
        },
        {
          text: "cancel",
          style: "cancel",
        },
      ]);
      return true;
    } else {
      return false;
    }
  }
  render() {
    return (
      <View style={{ paddingTop: StatusBar.currentHeight, flex: 1 }}>
        <Loading
          ref={(ref) => {
            this.Loading = ref;
          }}
        />
        <StatusBar
          translucent={true}
          backgroundColor="#00000000"
          barStyle="dark-content"
        />
        <SafeAreaView style={{ flex: 1 }}>
          <View
            style={{
              height: 50,
              alignItems: "center",
              flexDirection: "row",
              elevation: 1,
            }}
          >
            <Text
              style={{
                fontSize: 15,
                color: "#000",
                marginLeft: 10,
                maxWidth: 120,
              }}
              numberOfLines={2}
            >
              多源传感器智能终端信息平台
            </Text>
            {this.state.data.length > 0 && (
              <Badge
                textStyle={{ fontSize: 11 }}
                containerStyle={{ position: "relative", top: -4, zIndex: -1 }}
                value={this.state.data.length}
                status="error"
              />
            )}
            {this.state.realTimeUpload ? (
              <Text
                style={{ fontSize: 9, position: "relative", left: 8, top: 6 }}
              >
                实时上传
              </Text>
            ) : (
              <Text
                style={{ fontSize: 9, position: "relative", left: 8, top: 6 }}
              >
                存储上传
              </Text>
            )}
            <Text style={{ fontSize: 10, marginLeft: 10 }}></Text>
            <View style={{ flex: 1 }}></View>
            {/* <View style={{ marginRight: 5 }}>
              <TouchableOpacity style={{ padding: 5 }} onPress={this.clear}>
                <MaterialIcons name="clear" size={20} />
              </TouchableOpacity>
            </View> */}
            <View style={{ marginRight: 5 }}>
              <TouchableOpacity style={{ padding: 5 }} onPress={this.save}>
                <AntDesign name="save" size={20} />
              </TouchableOpacity>
            </View>
            <View style={{ marginRight: 5 }}>
              <TouchableOpacity
                style={{ padding: 5.5 }}
                onPress={this.goSetting}
              >
                <AntDesign name="setting" size={19} />
              </TouchableOpacity>
            </View>
            <View style={{ marginRight: 15 }}>
              <TouchableOpacity
                style={{ padding: 5 }}
                onPress={() => {
                  if (!this.state.running) {
                    this.props.navigation.navigate("History");
                  } else {
                    Alert.alert("提示", "请先停止数据收集");
                  }
                }}
              >
                <MaterialCommunityIcons name="history" size={20} />
              </TouchableOpacity>
            </View>
          </View>
          <View style={{ flex: 1, paddingTop: 10 }}>
            <View style={{ flexDirection: "row", marginHorizontal: 10 }}>
              <ScrollView
                style={{
                  width: 90,
                  height: Dimensions.get("window").height / 2,
                  paddingRight: 10,
                }}
              >
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
                      {this.state.data[
                        this.state.data.length - 1
                      ]?.location.longitude.toFixed(2)}
                    </Text>
                    <Text style={styles.data}>
                      {this.state.data[
                        this.state.data.length - 1
                      ]?.location.latitude.toFixed(2)}
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
                    {this.state.data[this.state.data.length - 1]
                      ?.accelerometerData != null ? (
                      <>
                        <Text style={styles.data}>
                          {this.state.data[
                            this.state.data.length - 1
                          ]?.accelerometerData.x.toFixed(2)}
                        </Text>
                        <Text style={styles.data}>
                          {this.state.data[
                            this.state.data.length - 1
                          ]?.accelerometerData.y.toFixed(2)}
                        </Text>
                        <Text style={styles.data}>
                          {this.state.data[
                            this.state.data.length - 1
                          ]?.accelerometerData.z.toFixed(2)}
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
                    {this.state.data[this.state.data.length - 1]
                      ?.gyroscopeData != null ? (
                      <>
                        <Text style={styles.data}>
                          {this.state.data[
                            this.state.data.length - 1
                          ]?.gyroscopeData.x.toFixed(2)}
                        </Text>
                        <Text style={styles.data}>
                          {this.state.data[
                            this.state.data.length - 1
                          ]?.gyroscopeData.y.toFixed(2)}
                        </Text>
                        <Text style={styles.data}>
                          {this.state.data[
                            this.state.data.length - 1
                          ]?.gyroscopeData.z.toFixed(2)}
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
                    {this.state.data[this.state.data.length - 1]
                      ?.magnetometerData != null ? (
                      <>
                        <Text style={styles.data}>
                          {this.state.data[
                            this.state.data.length - 1
                          ]?.magnetometerData.x.toFixed(2)}
                        </Text>
                        <Text style={styles.data}>
                          {this.state.data[
                            this.state.data.length - 1
                          ]?.magnetometerData.y.toFixed(2)}
                        </Text>
                        <Text style={styles.data}>
                          {this.state.data[
                            this.state.data.length - 1
                          ]?.magnetometerData.z.toFixed(2)}
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
                    {this.state.data[this.state.data.length - 1]
                      ?.barometerData != null ? (
                      <Text style={styles.data}>
                        {this.state.data[
                          this.state.data.length - 1
                        ]?.barometerData.pressure.toFixed(2)}
                      </Text>
                    ) : (
                      <FontAwesome name="ban" />
                    )}
                  </View>
                </View>
                <View style={{ marginTop: 10 }}>
                  <Text style={{ fontSize: 12 }}>卫星时间</Text>
                  <Text
                    style={{
                      fontSize: 12,
                      borderWidth: 0.33333,
                      marginTop: 5,
                      lineHeight: 30,
                      textAlign: "center",
                      backgroundColor: "#ddd",
                      borderColor: "#aaa",
                      height: 30,
                      fontWeight: "700",
                    }}
                  >
                    {this.state.data[this.state.data.length - 1]?.timeString}
                  </Text>
                </View>
                <View style={{ marginTop: 10, justifyContent: "center" }}>
                  {!this.state.running ? (
                    <TouchableOpacity
                      style={{
                        justifyContent: "center",
                        alignItems: "center",
                      }}
                      onPress={this.start}
                    >
                      <Entypo name="controller-play" size={34} color="green" />
                      <Text style={{ fontSize: 8 }} numberOfLines={1}>
                        开始按钮
                      </Text>
                    </TouchableOpacity>
                  ) : (
                    <TouchableOpacity
                      style={{
                        justifyContent: "center",
                        alignItems: "center",
                      }}
                      onPress={this.stop}
                    >
                      <Entypo
                        name="controller-paus"
                        size={34}
                        color="#d75c49"
                      />
                      <Text style={{ fontSize: 8 }} numberOfLines={1}>
                        暂停按钮
                      </Text>
                    </TouchableOpacity>
                  )}
                </View>
              </ScrollView>

              <VictoryChart
                maxDomain={{ y: 150 }}
                minDomain={{ y: -150 }}
                padding={{ right: 10, left: 30, top: 6, bottom: 20 }}
                width={Dimensions.get("window").width - 110}
                height={Dimensions.get("window").height / 2}
                theme={VictoryTheme.material}
                style={{
                  background: {},
                }}
              >
                <VictoryLabel
                  style={{ fill: "#aaa" }}
                  x={50}
                  y={20}
                  text="历史动态曲线(相对)"
                />
                <VictoryLabel
                  style={{ fill: "#aaa", fontSize: 10 }}
                  x={10}
                  y={15}
                  text="高"
                />
                <VictoryLabel
                  style={{ fill: "#aaa", fontSize: 10 }}
                  x={10}
                  y={Dimensions.get("window").height / 2 - 20}
                  text="低"
                />
                <VictoryAxis
                  crossAxis
                  theme={VictoryTheme.material}
                  offsetY={20}
                  tickValues={[1, 2, 3, 4, 5, 6, 7, 8, 9]}
                  style={{ tickLabels: { fontSize: 10, padding: 2 } }}
                  standalone={false}
                />
                <VictoryAxis
                  dependentAxis
                  crossAxis
                  tickCount={20}
                  style={{
                    tickLabels: { fontSize: 10, padding: 2, display: "none" },
                  }}
                  standalone={false}
                />
                <VictoryLine
                  interpolation="natural"
                  style={{ data: { stroke: "#606266" } }}
                  data={this.state.data
                    .slice(-10)
                    .map(({ magnetometerData }, i) => {
                      if (magnetometerData) {
                        return {
                          // x: i.toFixed(0),
                          y: magnetometerData.x,
                        };
                      } else {
                        return {
                          // x: i,
                          y: 0,
                        };
                      }
                    })}
                  y="y"
                />
                <VictoryLine
                  interpolation="natural"
                  style={{ data: { stroke: "#F56C6C" } }}
                  data={this.state.data
                    .slice(-10)
                    .map(({ accelerometerData }, i) => {
                      if (accelerometerData) {
                        return {
                          y: accelerometerData.x * 10,
                        };
                      } else {
                        return {
                          y: 0,
                        };
                      }
                    })}
                  y="y"
                />
                <VictoryLine
                  interpolation="natural"
                  style={{ data: { stroke: "#ffa83b" } }}
                  data={this.state.data.slice(-10).map(({ barometerData }) => {
                    if (barometerData) {
                      return {
                        y: barometerData.pressure / 10,
                      };
                    } else {
                      return {
                        y: 0,
                      };
                    }
                  })}
                  y="y"
                />
                <VictoryLine
                  interpolation="natural"
                  style={{ data: { stroke: "#67C23A" } }}
                  data={this.state.data.slice(-10).map(({ gyroscopeData }) => {
                    if (gyroscopeData) {
                      return {
                        y: gyroscopeData.x * 100,
                      };
                    } else {
                      return {
                        y: 0,
                      };
                    }
                  })}
                  y="y"
                />
              </VictoryChart>
            </View>
            <View style={{ margin: 5, flex: 1, backgroundColor: "#f1f8ff" }}>
              <ScrollView>
                <Table
                  widthArr={[100, 100, 100, 100, 100]}
                  borderStyle={{ borderWidth: 1, borderColor: "#c8e1ff" }}
                >
                  <Row
                    style={{ height: 30, backgroundColor: "#f1f8ff" }}
                    textStyle={{ textAlign: "center", fontSize: 12 }}
                    data={["时间", "坐标", "陀螺仪", "加速度", "磁力", "气压"]}
                  ></Row>
                  <Rows
                    data={this.state.data
                      .slice(-10)
                      .reverse()
                      .map((e) => {
                        return [
                          e.timeString,
                          e.location.longitude + "\n" + e?.location.latitude,
                          e.gyroscopeData?.x +
                            "\n" +
                            e.gyroscopeData?.y +
                            "\n" +
                            e.gyroscopeData?.z +
                            "\n",
                          e.accelerometerData?.x +
                            "\n" +
                            e.accelerometerData?.y +
                            "\n" +
                            e.accelerometerData?.z,
                          e.magnetometerData?.x +
                            "\n" +
                            e.magnetometerData?.y +
                            "\n" +
                            e.magnetometerData?.z,
                          e.barometerData?.pressure,
                        ];
                      })}
                    textStyle={{ textAlign: "center", fontSize: 8 }}
                  />
                </Table>
              </ScrollView>
            </View>
          </View>
          <View
            style={{
              paddingHorizontal: 10,
              alignItems: "center",
              backgroundColor: "#fff",
              justifyContent: "space-around",
              flexDirection: "row",
              height: 50,
            }}
          >
            <Text>采集时间间隔</Text>
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
