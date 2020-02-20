import React, { Component } from 'react';
import {
  Accelerometer,
  Barometer,
  Gyroscope,
  Magnetometer,
} from 'expo-sensors';
import { View, Text, Button, StatusBar } from 'react-native';
export default class DataScreen extends Component {
  constructor(props: any) {
    super(props)
    this.start = this.start.bind(this)
  }
  state = {
    accelerometerData: null,
    barometerData: null,
    gyroscopeData: null,
    magnetometerData: null
  }
  start() {
    Accelerometer.setUpdateInterval(1000)
    Barometer.setUpdateInterval(1000)
    Gyroscope.setUpdateInterval(1000)
    Magnetometer.setUpdateInterval(1000)
    Accelerometer.addListener(accelerometerData => {
      this.setState({ accelerometerData });
    });
    Barometer.addListener(barometerData => {
      this.setState({ barometerData });
    });
    Gyroscope.addListener(gyroscopeData => {
      this.setState({ gyroscopeData });
    });
    Magnetometer.addListener(magnetometerData => {
      this.setState({ magnetometerData });
    });
  }
  stop() {

  }
  changeRate() {

  }
  render() {
    return (
      <>
        <StatusBar translucent={true} backgroundColor="#aaaaaa00" barStyle="dark-content" />
        <View style={{ marginTop: StatusBar.currentHeight }}>
          <Button title="开始" onPress={this.start}></Button>
          <View>
            <Text>{JSON.stringify(this.state.accelerometerData)}</Text>
          </View>
          <View>
            <Text>{JSON.stringify(this.state.barometerData)}</Text>
          </View>
          <View>
            <Text>{JSON.stringify(this.state.gyroscopeData)}</Text>
          </View>
          <View>
            <Text>{JSON.stringify(this.state.magnetometerData)}</Text>
          </View>
        </View>
      </>
    );
  }
}
