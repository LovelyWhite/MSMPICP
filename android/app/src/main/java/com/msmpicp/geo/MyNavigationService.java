package com.msmpicp.geo;

import android.annotation.SuppressLint;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.Service;
import android.content.Context;
import android.content.Intent;
import android.content.IntentFilter;
import android.content.ServiceConnection;
import android.hardware.Sensor;
import android.hardware.SensorEvent;
import android.hardware.SensorEventListener;
import android.hardware.SensorManager;
import android.location.Location;
import android.location.LocationListener;
import android.location.LocationManager;
import android.os.Build;
import android.os.Bundle;
import android.os.IBinder;
import android.os.PowerManager;

import androidx.annotation.Nullable;
import androidx.core.app.NotificationCompat;

import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.WritableMap;
import com.msmpicp.R;

public class MyNavigationService extends Service {
    class ThreeAxisMeasurement{
        public float x;
        public float y;
        public float z;

        public ThreeAxisMeasurement() {
            this.x = 0;
            this.y = 0;
            this.z = 0;
        }
    }
    class BarometerMeasurement{
        public float pressure;
        public float relativeAltitude;

        public BarometerMeasurement() {
            this.pressure = 0;
            this.relativeAltitude = 0;
        }
    }
    private Callback callback;
    LocationListener locationListener;
    SensorEventListener sensorEventListener;
    LocationManager locationManager;
    SensorManager sensorManager;
    ThreeAxisMeasurement mS1 = new ThreeAxisMeasurement(),mS3 =new ThreeAxisMeasurement() ,mS4 =new ThreeAxisMeasurement();
    BarometerMeasurement mS2 = new BarometerMeasurement();

    @SuppressLint("MissingPermission")
    @Nullable
    @Override
    public IBinder onBind(Intent intent) {
        String provider = intent.getStringExtra("provider");
        double minTime =  intent.getDoubleExtra("minTime",5000.0);
        float minDistance =  intent.getFloatExtra("minDistance",10.0f);
        locationManager.requestLocationUpdates(provider,(long) minTime,minDistance,this.locationListener);
        Sensor s1 =  sensorManager.getDefaultSensor(Sensor.TYPE_ACCELEROMETER);
        Sensor s2 =  sensorManager.getDefaultSensor(Sensor.TYPE_PRESSURE);
        Sensor s3 =  sensorManager.getDefaultSensor(Sensor.TYPE_GYROSCOPE);
        Sensor s4 =  sensorManager.getDefaultSensor(Sensor.TYPE_MAGNETIC_FIELD);
        if(s1!=null) sensorManager.registerListener(sensorEventListener,s1,SensorManager.SENSOR_DELAY_NORMAL);
        if(s2!=null) sensorManager.registerListener(sensorEventListener,s2,SensorManager.SENSOR_DELAY_NORMAL);
        if(s3!=null) sensorManager.registerListener(sensorEventListener,s3,SensorManager.SENSOR_DELAY_NORMAL);
        if(s4!=null) sensorManager.registerListener(sensorEventListener,s4,SensorManager.SENSOR_DELAY_NORMAL);
        createNotificationChannel();
        setForegroundService();
        return new Binder();
    }

    @Override
    public void onCreate() {
        locationManager = (LocationManager) getSystemService(Context.LOCATION_SERVICE);
        sensorManager = (SensorManager) getSystemService(ReactApplicationContext.SENSOR_SERVICE);
        this.locationListener = new LocationListener() {
            @Override
            public void onLocationChanged(Location location) {
                WritableMap map = Arguments.createMap();
                WritableMap l = Arguments.createMap();
                WritableMap s1 = Arguments.createMap();//加速计accelerometerData
                WritableMap s2 = Arguments.createMap();//气压barometerData
                WritableMap s3 = Arguments.createMap();//陀螺仪gyroscopeData
                WritableMap s4 = Arguments.createMap();//磁力magnetometerData
                l.putString("provider",location.getProvider());
                l.putDouble("latitude",location.getLatitude());
                l.putDouble("longitude",location.getLongitude());
                l.putDouble("accuracy",location.getAccuracy());
                l.putDouble("altitude",location.getAltitude());
                l.putDouble("time",location.getTime());
                map.putMap("location",l);
                s1.putDouble("x",mS1.x);
                s1.putDouble("y",mS1.y);
                s1.putDouble("z",mS1.z);

                s2.putDouble("pressure",mS2.pressure);
                s2.putDouble("relativeAltitude",mS2.relativeAltitude);

                s3.putDouble("x",mS3.x);
                s3.putDouble("y",mS3.y);
                s3.putDouble("z",mS3.z);


                s4.putDouble("x",mS4.x);
                s4.putDouble("y",mS4.y);
                s4.putDouble("z",mS4.z);

                map.putMap("accelerometerData",s1);
                map.putMap("barometerData",s2);
                map.putMap("gyroscopeData",s3);
                map.putMap("magnetometerData",s4);
                if(callback!=null){
                    callback.onDataChange(map);
                }
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
        this.sensorEventListener = new SensorEventListener() {
            @Override
            public void onSensorChanged(SensorEvent sensorEvent) {
                switch (sensorEvent.sensor.getType()){
                    case Sensor.TYPE_ACCELEROMETER:
                        mS1.x =sensorEvent.values[0];
                        mS1.y =sensorEvent.values[1];
                        mS1.z =sensorEvent.values[2];
                        break;
                    case Sensor.TYPE_PRESSURE:
                        mS2.pressure =sensorEvent.values[0];
                        mS2.relativeAltitude =sensorEvent.accuracy;
                        break;
                    case Sensor.TYPE_GYROSCOPE:
                        mS3.x =sensorEvent.values[0];
                        mS3.y =sensorEvent.values[1];
                        mS3.z =sensorEvent.values[2];
                        break;
                    case Sensor.TYPE_MAGNETIC_FIELD:
                        mS4.x =sensorEvent.values[0];
                        mS4.y =sensorEvent.values[1];
                        mS4.z =sensorEvent.values[2];
                        break;
                }
            }

            @Override
            public void onAccuracyChanged(Sensor sensor, int i) {

            }
        };
        super.onCreate();
    }

    public class Binder extends android.os.Binder {
        public MyNavigationService getService() {
            return MyNavigationService.this;
        }
    }


    @Override
    public boolean onUnbind(Intent intent) {
        if(this.locationManager!=null&&this.locationListener!=null){
            locationManager.removeUpdates(locationListener);
            locationListener = null;
        }
        return super.onUnbind(intent);
    }

    public void setCallback(Callback callback) {
        this.callback = callback;
    }
    //Channel ID 必须保证唯一
    private static final String CHANNEL_ID = "com.msmpicp.notification.channel";

    private void createNotificationChannel() {
        // 在API>=26的时候创建通知渠道
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            //设定的通知渠道名称
            String channelName = "msmpicp";
            //设置通知的重要程度
            int importance = NotificationManager.IMPORTANCE_HIGH;
            //构建通知渠道
            NotificationChannel channel = new NotificationChannel(CHANNEL_ID, channelName, importance);
            channel.setDescription("用于多源信息采集后台获取信息");
            //向系统注册通知渠道，注册后不能改变重要性以及其他通知行为
            NotificationManager notificationManager = getSystemService(NotificationManager.class);
            notificationManager.createNotificationChannel(channel);
        }
    }

    public void  setForegroundService()
    {
        //在创建的通知渠道上发送通知
        NotificationCompat.Builder builder = new NotificationCompat.Builder(this, CHANNEL_ID);
        builder.setSmallIcon(R.mipmap.ic_launcher) //设置通知图标
                .setContentTitle("通知")//设置通知标题
                .setContentText("正在在后台持续获取定位")//设置通知内容
                .setOngoing(true);//设置处于运行状态
        //将服务置于启动状态 NOTIFICATION_ID指的是创建的通知的ID
        startForeground(1,builder.build());
    }
    public interface Callback{
        void onDataChange(WritableMap map);
    }
}
