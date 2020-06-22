import React from "react";
import {
  View,
  SafeAreaView,
  StatusBar,
  Platform,
  Text,
  Alert,
  YellowBox
} from "react-native";
import AsyncStorage from "@react-native-community/async-storage";
import DeviceInfo from "react-native-device-info";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import Entypo from "react-native-vector-icons/Entypo";
import AntDesign from "react-native-vector-icons/AntDesign";
import Loading from "../components/loading";
import { useFocusEffect } from "@react-navigation/native";
import { TouchableOpacity, ScrollView, Switch } from "react-native-gesture-handler";
import RNFS, { uploadFiles } from "react-native-fs";
import { getTimeString, pushData } from "../utils";
import { promise } from "ping";
import LinkItem from "../components/linkitem";
interface Props {
  navigation: any;
}
interface States {
  realTimeUpload: boolean
}
export class SettingScreen extends React.Component<Props, States> {
  Loading: Loading;
  _unsubscribe: any;
  constructor(props: Readonly<Props>) {
    super(props);
    this.state = {
      realTimeUpload: true
    };
    this._unsubscribe = this.props.navigation.addListener("focus", () => {
    
    });
    this.onRealSwitch = this.onRealSwitch.bind(this);
  }
  async onRealSwitch(value: boolean) {
    try {
      await AsyncStorage.setItem("setting_realtime_upload", JSON.stringify({
        realTimeUpload: value
      }))
      this.setState({
        realTimeUpload: value
      })
    } catch (e) {
      Alert.alert("错误", "" + e);
    }
  }
  async componentDidMount() {
    try {
      let s_v1 = await AsyncStorage.getItem("setting_realtime_upload");
      let v1 = JSON.parse(s_v1)
      if(v1){
        this.setState({
         realTimeUpload:v1.realTimeUpload
        })
      }
      else{
        this.setState({
          realTimeUpload:true
         })
      }
    }catch(e){
      console.log(e);
    }
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
              设置
            </Text>
            <View style={{ flex: 1 }}></View>
          </View>
          <View style={{ paddingTop: 10 }}>
            <View
              style={{
                minHeight: 60,
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
                paddingHorizontal: 25,
              }}
            >
              <View>
                <Text style={{ fontSize: 17, color: "#000", fontWeight: "700" }}>
                  实时上传
                </Text>
                <View style={{ marginBottom: 4 }} />
                <Text style={{ fontSize: 12, color: "#666" }}>
                  修改此项将会清空已收集到的数据
                  </Text>
              </View>
              <Switch onValueChange={this.onRealSwitch} value={this.state.realTimeUpload}></Switch>
            </View>
            <View style={{ marginTop: 5 }}></View>
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
              onPress={() => { }}
            />
            <View style={{ marginTop: 5 }}></View>
            <LinkItem
              title="作者"
              description="lovelywhite.cn"
              onPress={() => { }}
            />
          </View>
        </SafeAreaView>
      </View>
    );
  }
}
