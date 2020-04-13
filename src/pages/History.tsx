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
import { promise } from "ping";
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
    this.readFiles = this.readFiles.bind(this);
    this.goSetting = this.goSetting.bind(this);
  }
  readFiles() {
    RNFS.readDir(RNFS.DocumentDirectoryPath + "/storedata")
      .then((files) => {
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
            let uploadData = {
              uniqueId,
              model,
              brand,
              data: JSON.parse(res),
            };
            let result = await pushData("/upload", uploadData, (pe) => {
              this.Loading.setText(
                "正在上传 " + (((pe.loaded / pe.total) * 100) | 0) + "%"
              );
            });
            let msg = result.data;
            if (msg === "上传成功") {
              await this.deleteData(file.path);
            }
            Alert.alert("提示", result.data);
          } catch (e) {
            console.log(e);
            Alert.alert("错误", "" + e);
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
      //创建文件夹
      RNFS.mkdir(RNFS.DownloadDirectoryPath + "/storedata")
        .then(() => {
          //写文件
          RNFS.copyFile(
            file.path,
            RNFS.DownloadDirectoryPath + "/storedata/" + file.name
          )
            .then(() => {
              Alert.alert(
                "提示",
                "数据已成功导入至存储\nDownload/storedata文件夹"
              );
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
    this._unsubscribe = this.props.navigation.addListener("focus", () => {
      StatusBar.setBackgroundColor("#00000000");
      StatusBar.setTranslucent(true);
    });
    this.readFiles();
  }
  componentWillUnmount() {
    this._unsubscribe && this._unsubscribe();
  }
  goSetting() {
    this.props.navigation.navigate("Setting");
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
            <View style={{ marginRight: 15 }}>
              <TouchableOpacity style={{ padding: 5 }} onPress={this.goSetting}>
                <AntDesign name="setting" size={17} />
              </TouchableOpacity>
            </View>
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
