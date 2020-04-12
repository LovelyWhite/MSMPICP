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
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import Entypo from "react-native-vector-icons/Entypo";
import AntDesign from "react-native-vector-icons/AntDesign";
import Loading from "../components/loading";
import { TouchableOpacity, ScrollView } from "react-native-gesture-handler";
import RNFS, { uploadFiles } from "react-native-fs";
import { getTimeString, pushData } from "../utils";
interface Props {
  navigation: any;
}
interface States {
  files: RNFS.ReadDirItem[];
}
export class HistoryScreen extends React.Component<Props, States> {
  Loading: Loading;
  constructor(props: Readonly<Props>) {
    super(props);
    this.state = {
      files: [],
    };
    this.readFiles = this.readFiles.bind(this);
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
  componentDidMount() {
    this.readFiles();
  }
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
            <View style={{ marginLeft: 20 }}>
              <TouchableOpacity
                onPress={() => {
                  this.props.navigation.goBack();
                }}
              >
                <MaterialIcons name="arrow-back" size={25} />
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
            <ScrollView style={{ flex: 1 }}>
              {this.state.files.map((file, index) => {
                return (
                  <View
                    style={{
                      height: 50,
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
                      onPress={() => {
                        this.upload(file);
                      }}
                    >
                      <MaterialIcons
                        name="file-upload"
                        size={24}
                        color="green"
                      />
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => {
                        Alert.alert("提示", "确认删除", [
                          {
                            onPress: () => {
                              RNFS.unlink(file.path).then(() => {
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
                      <MaterialIcons name="delete" size={24} color="red" />
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
