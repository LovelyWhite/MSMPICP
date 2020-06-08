package com.msmpicp.geo;

import android.annotation.SuppressLint;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.Service;
import android.content.Context;
import android.content.Intent;
import android.content.ServiceConnection;
import android.location.Location;
import android.location.LocationListener;
import android.location.LocationManager;
import android.os.Build;
import android.os.Bundle;
import android.os.IBinder;

import androidx.annotation.Nullable;
import androidx.core.app.NotificationCompat;

import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.WritableMap;
import com.msmpicp.R;

public class MyNavigationService extends Service {
    private Callback callback;
    LocationListener locationListener;
    LocationManager locationManager;
    @SuppressLint("MissingPermission")
    @Nullable
    @Override
    public IBinder onBind(Intent intent) {
        String provider = intent.getStringExtra("provider");
        double minTime =  intent.getDoubleExtra("minTime",5000.0);
        float minDistance =  intent.getFloatExtra("minDistance",10.0f);
        locationManager.requestLocationUpdates(provider,(long) minTime,minDistance,this.locationListener);
        createNotificationChannel();
        setForegroundService();
        return new Binder();
    }

    @Override
    public void onCreate() {
        locationManager = (LocationManager) getSystemService(Context.LOCATION_SERVICE);
        this.locationListener = new LocationListener() {
            @Override
            public void onLocationChanged(Location location) {
                WritableMap map = Arguments.createMap();
                map.putString("provider",location.getProvider());
                map.putDouble("latitude",location.getLatitude());
                map.putDouble("longitude",location.getLongitude());
                map.putDouble("accuracy",location.getAccuracy());
                map.putDouble("altitude",location.getAltitude());
                map.putDouble("time",location.getTime());
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
