import React from "react";
import { View, Text, ActivityIndicator, Platform, StatusBar, Animated } from "react-native";


interface Props {}
interface States {
  disabled: boolean;
  text?: string;
}
export default class Loading extends React.Component<Props, States> {
  constructor(props: Readonly<Props>) {
    super(props);
    this.state = {
      disabled: true,
      text: ""
    };
  }
  startLoading(text: string) {
    this.setState({
      disabled: false,
      text
    });
  }
  stopLoading() {
    this.setState({
      disabled: true
    });
  }
  render() {
    return (
      <>
        {this.state.disabled ? (
          <></>
        ) : (
          <View
            style={{
              position: "absolute",
              left: 0,
              top: 0,
              right: 0,
              bottom: 0,
              backgroundColor: "#68696b77",
              zIndex: 99999
            }}
          >
            <Animated.View
              style={{
                backgroundColor: "#68696bAA",
                width: "90%",
                height: 30,
                justifyContent: "center",
                alignSelf: "center",
                flexDirection: "row",
                marginTop:30,
                borderRadius: 5
              }}
            >
              <ActivityIndicator color="#FFFFFFEE" size={14} />
              <Text
                style={{
                  paddingHorizontal: 10,
                  lineHeight:30,
                  fontSize: 12,
                  color: "#FFFFFFee",
                  textAlign: "center"
                }}
              >
                {this.state.text}
              </Text>
            </Animated.View>
          </View>
        )}
      </>
    );
  }
}
