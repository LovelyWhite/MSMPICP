import React from "react";
import {
  View,
  SafeAreaView,
  StatusBar,
  Platform,
  Text,
  Alert,
} from "react-native";
import DeviceInfo from "react-native-device-info";
import { PERMISSIONS, request } from "react-native-permissions";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import Entypo from "react-native-vector-icons/Entypo";
import AntDesign from "react-native-vector-icons/AntDesign";
import Loading from "../components/loading";
import { TouchableOpacity, ScrollView } from "react-native-gesture-handler";
import RNFS, { uploadFiles } from "react-native-fs";
import { getTimeString, pushData } from "../utils";
import { getSensorInfo } from "../modules/sensor";
import { Parser } from "json2csv";
interface Props {
  navigation: any;
}
interface States {
  files: RNFS.ReadDirItem[];
}
export class HistoryScreen extends React.Component<Props, States> {
  Loading: Loading;
  _unsubscribe: any;
  constructor(props: Readonly<Props>) {
    super(props);
    this.state = {
      files: [],
    };
    this._unsubscribe = this.props.navigation.addListener("focus", () => {});
    this.readFiles = this.readFiles.bind(this);
  }
  readFiles() {
    RNFS.readDir(RNFS.DocumentDirectoryPath + "/storedata")
      .then((files) => {
        console.log(files)
        this.setState({
          files,
        });
      })
      .catch((e) => {});
  }
  upload(file: RNFS.ReadDirItem) {
    Alert.alert("提示", "确认上传", [
      {
        onPress: async () => {
          const model = DeviceInfo.getModel();
          const uniqueId = DeviceInfo.getUniqueId();
          const brand = DeviceInfo.getBrand();
          try {
            this.Loading.startLoading("正在上传 0%");
            let res = await RNFS.readFile(file.path, "utf8");

            let sensorInfo = await getSensorInfo();
            let uploadData = {
              uniqueId,
              model,
              brand,
              sensorInfo,
              data:JSON.parse(res),
            };
            let result = await pushData("/upload", uploadData, 0, (pe) => {
              this.Loading.setText(
                "正在上传 " + (((pe.loaded / pe.total) * 100) | 0) + "%"
              );
            });
            console.log(result);
            let msg = result.data;
            if (msg === "上传成功") {
              await this.deleteData(file.path);
              this.readFiles();
            }
            Alert.alert("提示", result.data);
          } catch (e) {
            console.log(e);
            Alert.alert("错误", "");
          } finally {
            this.Loading.stopLoading();
          }
        },
        text: "ok",
        style: "default",
      },
      {
        text: "cancel",
        style: "cancel",
      },
    ]);
  }
  async export(file: RNFS.ReadDirItem) {
    let rs = "denied";
    if (Platform.OS === "android") {
      rs = await request(PERMISSIONS.ANDROID.WRITE_EXTERNAL_STORAGE);
    }

    if (rs === "granted") {
      this.Loading.startLoading("正在导出数据");
      try {
        String.prototype.replaceAll = function(s1, s2) {
          return this.replace(new RegExp(s1, "gm"), s2);
      }
        //创建文件夹
        await RNFS.mkdir(RNFS.DownloadDirectoryPath + "/storedata");
        let r:string = await RNFS.readFile(file.path);
        r = r.replaceAll("magnetometerData", "磁力计");
        r = r.replaceAll("gyroscopeData", "陀螺仪");
        r = r.replaceAll("barometerData", "气压计");
        r = r.replaceAll("accelerometerData", "加速度计");
        r = r.replaceAll("relativeAltitude", "相对海拔");
        r = r.replaceAll("location", "位置");
        r = r.replaceAll("pressure", "气压");
        r = r.replaceAll("altitude", "海拔");
        r = r.replaceAll("accuracy", "精确度");
        r = r.replaceAll("longitude", "经度");
        r = r.replaceAll("latitude", "纬度");
        r = r.replaceAll("provider", "位置提供");
        const json2csvParser = new Parser();
        const csv = json2csvParser.parse(JSON.parse(r));
        console.log(csv);

        await RNFS.writeFile(
          RNFS.DownloadDirectoryPath +
            "/storedata/" +
            file.name.replace(".txt", ".csv"),
          csv
        );
        await RNFS.copyFile(
          file.path,
          RNFS.DownloadDirectoryPath +
            "/storedata/" +
            file.name.replace(".txt", ".json")
        );
        Alert.alert(
          "提示",
          "数据已成功导入至存储\nDownload/storedata/" +
            file.name.replace(".txt", "")
        );
      } catch (e) {
        Alert.alert("错误", e + "");
      } finally {
        this.Loading.stopLoading();
      }
    } else {
      Alert.alert("提示", "请允许存储权限");
    }
  }
  async deleteData(path: string) {
    try {
      let rs = await RNFS.unlink(path);
      return Promise.resolve(rs);
    } catch (e) {
      return Promise.reject(e);
    }
  }

  componentDidMount() {
    this.readFiles();
  }
  componentWillUnmount() {
    this._unsubscribe && this._unsubscribe();
  }
  render() {
    return (
      <View style={{ paddingTop: StatusBar.currentHeight, flex: 1 }}>
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
              flexDirection: "row",
            }}
          >
            <View style={{ marginLeft: 15 }}>
              <TouchableOpacity
                style={{ padding: 5 }}
                onPress={() => {
                  this.props.navigation.goBack();
                }}
              >
                <MaterialIcons name="arrow-back" size={20} />
              </TouchableOpacity>
            </View>
            <Text style={{ fontSize: 20, color: "#000", marginLeft: 20 }}>
              历史记录
            </Text>
            <View style={{ flex: 1 }}></View>
          </View>
          {this.state.files.length == 0 ? (
            <View
              style={{
                flex: 1,
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <Entypo name="dropbox" size={30} />
              <Text>无数据</Text>
            </View>
          ) : (
            <ScrollView style={{ flex: 1, paddingTop: 10 }}>
              {this.state.files.map((file, index) => {
                return (
                  <View
                    style={{
                      height: 55,
                      flexDirection: "row",
                      alignItems: "center",
                      paddingHorizontal: 20,
                    }}
                    key={index}
                  >
                    <AntDesign
                      name="file1"
                      size={24}
                      style={{ paddingRight: 10 }}
                    />
                    <View>
                      <Text>
                        Size:
                        {(Number.parseInt(file.size, 10) / 1024).toFixed(2)}KB
                      </Text>
                      <Text>
                        保存时间:{getTimeString(file.mtime.getTime())}
                      </Text>
                    </View>
                    <View style={{ flex: 1 }}></View>
                    <TouchableOpacity
                      style={{ padding: 5 }}
                      onPress={() => {
                        this.export(file);
                      }}
                    >
                      <AntDesign name="save" size={20} />
                    </TouchableOpacity>
                    <View style={{ marginRight: 5 }}></View>
                    <TouchableOpacity
                      style={{ padding: 5 }}
                      onPress={() => {
                        this.upload(file);
                      }}
                    >
                      <MaterialIcons
                        name="file-upload"
                        size={20}
                        color="green"
                      />
                    </TouchableOpacity>
                    <View style={{ marginRight: 5 }}></View>
                    <TouchableOpacity
                      style={{ padding: 5 }}
                      onPress={() => {
                        Alert.alert("提示", "确认删除", [
                          {
                            onPress: () => {
                              this.deleteData(file.path).then(() => {
                                Alert.alert("提示", "删除成功");
                                this.readFiles();
                              });
                            },
                            text: "ok",
                            style: "default",
                          },
                          {
                            text: "cancel",
                            style: "cancel",
                          },
                        ]);
                      }}
                    >
                      <MaterialIcons name="delete" size={20} color="red" />
                    </TouchableOpacity>
                  </View>
                );
              })}
            </ScrollView>
          )}
        </SafeAreaView>
      </View>
    );
  }
}
