package com.msmpicp.geo;

import android.annotation.SuppressLint;
import android.content.Context;
import android.location.Location;
import android.location.LocationListener;
import android.location.LocationManager;
import android.os.Bundle;

import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.WritableArray;
import com.facebook.react.bridge.WritableMap;
import com.facebook.react.modules.core.DeviceEventManagerModule;

import org.json.JSONObject;

import java.util.HashMap;
import java.util.Map;

import javax.annotation.Nullable;


public class GpsInfoModule extends ReactContextBaseJavaModule {
    Map<String,LocationListener> locationListeneries = new HashMap<>();
    private final ReactApplicationContext reactContext;
    LocationManager locationManager;
    public GpsInfoModule(ReactApplicationContext reactContext) {
        super(reactContext);
        this.reactContext = reactContext;
        locationManager = (LocationManager) reactContext.getSystemService(Context.LOCATION_SERVICE);
    }

    @Nullable
    @Override
    public String getName() {
        return "GEO";
    }

    @ReactMethod
    public void getAllProviders(Promise promise) {
        WritableArray array = Arguments.fromList(locationManager.getAllProviders());
        promise.resolve(array);
    }
    @SuppressLint("MissingPermission")

    @ReactMethod
    public void isListening(Promise promise){
        int size =locationListeneries.size();
        if(size== 0){
            promise.resolve(false);
        }
        else{
            promise.resolve(size);
        }
    }
    @SuppressLint("MissingPermission")
    @ReactMethod
    public void startListen(String provider,String name, Double minTime, Float minDistance, Promise promise) {
        try {

            if(locationListeneries.containsKey(name)){
                promise.reject("-1",name+" is exist");
            }
            else
            {
                LocationListener temp = new LocationListener() {
                    @Override
                    public void onLocationChanged(Location location) {
                        WritableMap map = Arguments.createMap();
                        map.putString("provider",location.getProvider());
                        map.putDouble("latitude",location.getLatitude());
                        map.putDouble("longitude",location.getLongitude());
                        map.putDouble("accuracy",location.getAccuracy());
                        map.putDouble("altitude",location.getAltitude());
                        map.putDouble("time",location.getTime());
                        sendEvent(reactContext,"onLocationChanged",map);
                    }

                    @Override
                    public void onStatusChanged(String provider, int status, Bundle extras) {

                    }

                    @Override
                    public void onProviderEnabled(String provider) {

                    }

                    @Override
                    public void onProviderDisabled(String provider) {

                    }
                };
                locationListeneries.put(name,temp);
                locationManager.requestLocationUpdates(provider,minTime.longValue(),minDistance,temp);
                JSONObject r = new JSONObject();
                r.put("name",name);
                r.put("size",locationListeneries.size());
                promise.resolve(r.toString());
            }
        } catch (Exception e) {
            e.printStackTrace();
            promise.reject("-1","1");
        }
    } 
    @ReactMethod
    public void stopListen(String name,Promise promise){
        if(locationListeneries.size()==0){
            promise.reject("-1","no listening");
        }
        else
        {
            LocationListener temp = locationListeneries.get(name);
            if(temp == null){
                promise.reject("-1","no this name");
            }
            else
            {
                locationManager.removeUpdates(temp);
                locationListeneries.remove(name);
                promise.resolve("listen "+name+" is removed");
            }
        }

    }

    private void sendEvent(ReactContext reactContext,
                           String eventName,
                           @Nullable Object params) {
        reactContext
                .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class)
                .emit(eventName, params);
    }

}
