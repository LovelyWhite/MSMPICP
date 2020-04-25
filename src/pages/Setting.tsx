import React from "react";
import {
  View,
  SafeAreaView,
  StatusBar,
  Platform,
  Text,
  Alert,
  YellowBox,
} from "react-native";

import DeviceInfo from "react-native-device-info";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import Entypo from "react-native-vector-icons/Entypo";
import AntDesign from "react-native-vector-icons/AntDesign";
import Loading from "../components/loading";
import { useFocusEffect } from "@react-navigation/native";
import { TouchableOpacity, ScrollView } from "react-native-gesture-handler";
import RNFS, { uploadFiles } from "react-native-fs";
import { getTimeString, pushData } from "../utils";
import { promise } from "ping";
import LinkItem from "../components/linkitem";
interface Props {
  navigation: any;
}
interface States {}
export class SettingScreen extends React.Component<Props, States> {
  Loading: Loading;
  _unsubscribe: any;
  constructor(props: Readonly<Props>) {
    super(props);
    this.state = {};
    this._unsubscribe = this.props.navigation.addListener("focus", () => {
      StatusBar.setBackgroundColor("#00000000");
      StatusBar.setTranslucent(true);
      StatusBar.setBarStyle("dark-content");
    });
  }
  componentDidMount() {}
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
              设置
            </Text>
            <View style={{ flex: 1 }}></View>
          </View>
          <View style={{ paddingTop: 10 }}>
            <LinkItem
              title="设备"
              description={DeviceInfo.getBrand() + " " + DeviceInfo.getModel()}
            />
            <View style={{ marginTop: 5 }}></View>
            <LinkItem
              title="本机唯一码"
              description={DeviceInfo.getUniqueId()}
            />
            <View style={{ marginTop: 5 }}></View>
            <LinkItem
              title="版本"
              description="Version 0.0.1"
              onPress={() => {}}
            />
            <View style={{ marginTop: 5 }}></View>
            <LinkItem
              title="关于"
              description="唯一码将作为服务器识别设备的凭据上传到服务器"
            />
            <View style={{ marginTop: 5 }}></View>
            <LinkItem
              title="作者"
              description="lovelywhite.cn"
              onPress={() => {}}
            />
          </View>
        </SafeAreaView>
      </View>
    );
  }
}
