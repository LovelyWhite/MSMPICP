import React from "react";
import { TouchableOpacity } from "react-native-gesture-handler";
import { View, Text } from "react-native";
import AntDesign from "react-native-vector-icons/AntDesign";

export default class LinkItem extends React.Component<{
  title: string;
  description?: string;
  onPress?: () => void;
  showArrow?: boolean;
}> {
  render() {
    return (
      <TouchableOpacity
        activeOpacity={0.5}
        style={{
          minHeight: 60,
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          paddingHorizontal: 25,
        }}
        onPress={this.props.onPress}
      >
        <View>
          <Text style={{ fontSize: 17, color: "#000", fontWeight: "700" }}>
            {this.props.title}
          </Text>
          <View style={{ marginBottom: 4 }} />
          {this.props.description ? (
            <Text style={{ fontSize: 12, color: "#666" }}>
              {this.props.description}
            </Text>
          ) : (
            <></>
          )}
        </View>
        {this.props.showArrow ? (
          <AntDesign name="arrowright" size={20} />
        ) : (
          <></>
        )}
      </TouchableOpacity>
    );
  }
}
