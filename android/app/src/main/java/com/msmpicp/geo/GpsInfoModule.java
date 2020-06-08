package com.msmpicp.geo;

import android.annotation.SuppressLint;
import android.content.ComponentName;
import android.content.Context;
import android.content.Intent;
import android.content.ServiceConnection;
import android.os.IBinder;
import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.modules.core.DeviceEventManagerModule;
import javax.annotation.Nullable;


public class GpsInfoModule extends ReactContextBaseJavaModule implements ServiceConnection {

    private final ReactApplicationContext reactContext;

    public GpsInfoModule(ReactApplicationContext reactContext) {
        super(reactContext);
        this.reactContext = reactContext;

    }

    @Nullable
    @Override
    public String getName() {
        return "GEO";
    }

    @SuppressLint("MissingPermission")
    @ReactMethod
    public void startListen(String provider,Double minTime, Float minDistance, Promise promise) {
       Intent intent =  new Intent(reactContext,MyNavigationService.class);
       intent.putExtra("provider",provider);
       intent.putExtra("minTime",minTime);
       intent.putExtra("minDistance",minDistance);
       reactContext.bindService(intent,this,Context.BIND_AUTO_CREATE);
       promise.resolve("success");
    } 
    @ReactMethod
    public void stopListen(Promise promise){
        reactContext.unbindService(this);
        promise.resolve("success");
    }

    private void sendEvent(ReactContext reactContext,
                           String eventName,
                           @Nullable Object params) {
        reactContext
                .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class)
                .emit(eventName, params);
    }

    @Override
    public void onServiceConnected(ComponentName componentName, IBinder iBinder) {
        MyNavigationService.Binder binder = (MyNavigationService.Binder)iBinder;
        MyNavigationService myNavigationService = binder.getService();
        myNavigationService.setCallback(map ->  {
            System.out.println(map.getString("provider"));
            sendEvent(reactContext,"onLocationChanged",map);
        });
    }

    @Override
    public void onServiceDisconnected(ComponentName componentName) {

    }
}
