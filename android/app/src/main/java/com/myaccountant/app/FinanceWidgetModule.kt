package com.myaccountant.app

import android.appwidget.AppWidgetManager
import android.content.ComponentName
import android.content.Context
import android.content.SharedPreferences
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.bridge.ReadableMap

class FinanceWidgetModule(reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext) {

    override fun getName(): String = "FinanceWidget"

    @ReactMethod
    fun updateWidget(data: ReadableMap) {
        val context = reactApplicationContext
        val prefs: SharedPreferences = context.getSharedPreferences("finance_widget", Context.MODE_PRIVATE)
        val editor = prefs.edit()
        editor.putString("balance", data.getString("balance") ?: "0 تومان")
        editor.putString("income", data.getString("income") ?: "0")
        editor.putString("expense", data.getString("expense") ?: "0")
        editor.apply()

        val appWidgetManager = AppWidgetManager.getInstance(context)
        val widgetComponent = ComponentName(context, FinanceWidgetProvider::class.java)
        val appWidgetIds = appWidgetManager.getAppWidgetIds(widgetComponent)
        appWidgetManager.notifyAppWidgetViewDataChanged(appWidgetIds, R.id.widget_balance)

        for (appWidgetId in appWidgetIds) {
            FinanceWidgetProvider.updateAppWidget(context, appWidgetManager, appWidgetId)
        }
    }
}
