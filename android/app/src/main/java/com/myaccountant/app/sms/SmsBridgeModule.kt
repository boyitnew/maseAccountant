package com.myaccountant.app.sms

import com.facebook.react.bridge.*

class SmsBridgeModule(reactContext: ReactApplicationContext) :
    ReactContextBaseJavaModule(reactContext) {

    companion object {
        private var pendingSmsData: String? = null
        private var pendingSmsType: String? = null

        fun setPendingSms(data: String?, type: String?) {
            pendingSmsData = data
            pendingSmsType = type
        }
    }

    override fun getName(): String = "SmsBridge"

    @ReactMethod
    fun getPendingSmsData(promise: Promise) {
        if (pendingSmsData != null) {
            val map = Arguments.createMap()
            map.putString("data", pendingSmsData)
            map.putString("type", pendingSmsType)
            pendingSmsData = null
            pendingSmsType = null
            promise.resolve(map)
        } else {
            promise.resolve(null)
        }
    }

    @ReactMethod
    fun clearPendingSms() {
        pendingSmsData = null
        pendingSmsType = null
    }
}
