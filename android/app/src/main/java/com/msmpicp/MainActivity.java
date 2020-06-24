package com.msmpicp;

import android.content.Context;
import android.os.Bundle;
import android.os.PersistableBundle;
import android.os.PowerManager;

import com.facebook.react.ReactActivity;
import com.facebook.react.ReactActivityDelegate;
import com.facebook.react.ReactRootView;
import com.swmansion.gesturehandler.react.RNGestureHandlerEnabledRootView;

import org.devio.rn.splashscreen.SplashScreen;

public class MainActivity extends ReactActivity {

    PowerManager.WakeLock wakeLock;// CPU保存运行
    private void acquireWakeLock() {
        if (null == wakeLock) {
            PowerManager pm = (PowerManager) getSystemService(Context.POWER_SERVICE);
            wakeLock = pm.newWakeLock(PowerManager.PARTIAL_WAKE_LOCK
                    | PowerManager.ON_AFTER_RELEASE, getClass()
                    .getCanonicalName());
            if (null != wakeLock) {
                // Log.i(TAG, "call acquireWakeLock");
                wakeLock.acquire();
            }
        }
    }
    // 释放设备电源锁
    private void releaseWakeLock() {
        if (null != wakeLock && wakeLock.isHeld()) {
            //Log.i(TAG, "call releaseWakeLock");
            wakeLock.release();
            wakeLock = null;
        }
    }    /**
     * Returns the name of the main component registered from JavaScript.
     * This is used to schedule rendering of the component.
     */
    @Override
    protected String getMainComponentName() {
        return "MSMPICP";
    }

    @Override
    protected ReactActivityDelegate createReactActivityDelegate() {
        return new ReactActivityDelegate(this, getMainComponentName()) {
            @Override
            protected ReactRootView createRootView() {
                return new RNGestureHandlerEnabledRootView(MainActivity.this);
            }
        };
    }

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        SplashScreen.show(this,R.style.SplashScreenTheme);
        acquireWakeLock();
    }

    @Override
    protected void onDestroy() {
        super.onDestroy();
        releaseWakeLock();
    }
}
