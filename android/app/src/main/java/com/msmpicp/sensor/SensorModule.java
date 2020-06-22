package com.msmpicp.sensor;

import android.hardware.Sensor;
import android.hardware.SensorManager;

import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.WritableArray;

import java.util.List;

import javax.annotation.Nullable;


public class SensorModule extends ReactContextBaseJavaModule{
    SensorManager sm;
    private final ReactApplicationContext reactContext;

    public SensorModule(ReactApplicationContext reactContext) {
        super(reactContext);
        this.reactContext = reactContext;

    }

    @Nullable
    @Override
    public String getName() {
        return "Sensor";
    }

    @ReactMethod
    public void getSensorInfo(Promise promise){
      sm = (SensorManager) reactContext.getSystemService(ReactApplicationContext.SENSOR_SERVICE);
        List<Sensor> sensors =  sm.getSensorList(Sensor.TYPE_ALL);
        WritableArray array = Arguments.createArray();
        sensors.forEach(e->{
            array.pushString(e.toString());
        });
        promise.resolve(array);
    }
}
