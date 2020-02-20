import React, { Component } from 'react';
import { StatusBar, StyleSheet, Text, Alert, Button } from 'react-native';
import MapView, { PROVIDER_GOOGLE } from 'react-native-maps';
import * as Location from 'expo-location';
import * as Permissions from 'expo-permissions';
import { isConnect } from '../utils';
export default class PositionScreen extends Component {
    state = {
        text: 'None',
        region: {
            latitude: 39.9093,
            longitude: 116.3964,
            latitudeDelta: 0.015,
            longitudeDelta: 0.0121,
        }
    }
    MapView: MapView;

    async componentDidMount() {
        let { status } = await Permissions.askAsync(Permissions.LOCATION);
        isConnect().then(() => {
            if (status !== 'granted') {
                console.log('Permission to access location was denied')
            }
            else {
                Location.watchPositionAsync({
                    accuracy: Location.Accuracy.Highest,
                    timeInterval: 3000,
                    distanceInterval: 0,

                }, (location) => {
                    console.log(location)
                    this.setState({
                        text: JSON.stringify(location)
                    })
                    this.setState({
                        region: {
                            longitude: location.coords.longitude,
                            latitude: location.coords.latitude,
                            longitudeDelta: 0.04,
                            latitudeDelta: 0.05
                        }
                    })
                })
            }
        }).catch(() => {
            Alert.alert("警告", "Google地图服务连接超时", [{ text: "知道了" }])
        })
    }
    render() {
        return (
            <>
                <StatusBar translucent={true} backgroundColor="#aaaaaa77" barStyle="light-content" />
                <MapView
                    ref={ref => this.MapView = ref}
                    // @ts-ignore
                    style={styles.map}
                    mapType={'hybrid'}
                    provider={PROVIDER_GOOGLE}
                    showsUserLocation={true}
                    followsUserLocation={true}
                    showsIndoors={true}
                    region={this.state.region}
                >
                </MapView>
                <Text style={{ marginTop: StatusBar.currentHeight }} >{this.state.text} </Text>
                <Button title="link" onPress={() => { this.props.navigation.navigate('Data') }} ></Button>
            </>
        );
    }
}
const styles = StyleSheet.create({
    map: {
        ...StyleSheet.absoluteFillObject,
    },
});