package com.example.get2class

import android.os.Bundle
import android.util.Log
import android.view.View
import android.widget.Button
import android.widget.EditText
import android.widget.Switch
import androidx.activity.enableEdgeToEdge
import androidx.appcompat.app.AppCompatActivity
import androidx.core.view.ViewCompat
import androidx.core.view.WindowInsetsCompat
import com.google.android.material.snackbar.Snackbar
import okhttp3.Call
import okhttp3.Callback
import okhttp3.Request
import okhttp3.RequestBody
import okhttp3.Response
import org.json.JSONObject
import java.io.IOException

class SettingsActivity : AppCompatActivity() {

    companion object {
        private const val TAG = "SettingsActivity"
    }
    lateinit var mainView: View

    private lateinit var notification_switch: Switch
    private lateinit var edit_minutes: EditText
    private lateinit var save_button: Button

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()
        setContentView(R.layout.activity_settings)
        ViewCompat.setOnApplyWindowInsetsListener(findViewById(R.id.settings)) { v, insets ->
            val systemBars = insets.getInsets(WindowInsetsCompat.Type.systemBars())
            v.setPadding(systemBars.left, systemBars.top, systemBars.right, systemBars.bottom)
            insets
        }
        mainView = findViewById<androidx.constraintlayout.widget.ConstraintLayout>(R.id.settings)

        notification_switch = findViewById(R.id.notifications_switch)
        edit_minutes = findViewById(R.id.edit_minutes)
        save_button = findViewById(R.id.save_settings_button)

        getNotificationSettings(BuildConfig.BASE_API_URL + "/notification_settings" + "?sub=" + LoginActivity.GoogleIdTokenSub) { result ->
            Log.d(TAG, "getNotificationSettings: $result")

            val notificationsEnabled = result.getBoolean("notificationsEnabled")
            val notificationTime = result.getString("notificationTime")

            runOnUiThread {
                notification_switch.setChecked(notificationsEnabled)
                edit_minutes.setText(notificationTime)
            }
        }

        save_button.setOnClickListener() {
            saveNotificationSettings(BuildConfig.BASE_API_URL + "/notification_settings") { result ->
                Log.d(TAG, "Saving notification settings...")
                Log.d(TAG, "$result")

                val acknowledgement = result.getBoolean("acknowledged")
                runOnUiThread {
                    if (acknowledgement) {
                        Snackbar.make(mainView, result.getString("message"), Snackbar.LENGTH_SHORT).show()
                    } else {
                        Snackbar.make(mainView, "An error has occurred", Snackbar.LENGTH_SHORT).show()
                    }
                }
            }
        }
    }

    fun getNotificationSettings(url: String, callback: (JSONObject) -> Unit) {
        // Create GET request for OkHttp3
        val request = Request.Builder().url(url).get().build()

        // Make call
        ApiService.client.newCall(request).enqueue(object : Callback {
            override fun onFailure(call: Call, e: IOException) {
                Log.d(TAG, "Error: $e")
            }

            override fun onResponse(call: Call, response: Response) {
                val result = response.body()?.string()
                if (result != null) {
                    try {
                        val jsonObject = JSONObject(result)
                        callback(jsonObject)
                    } catch (_: Exception) {
                        val badJsonObject = JSONObject()
                        callback(badJsonObject)
                    }
                }
            }
        })
    }

    fun saveNotificationSettings(url: String, callback: (JSONObject) -> Unit) {
        // Create JSONObject to send
        val jsonObject = JSONObject()
        jsonObject.put("sub", LoginActivity.GoogleIdTokenSub)
        jsonObject.put("notificationsEnabled", notification_switch.isChecked)
        jsonObject.put("notificationTime", edit_minutes.text.toString().toInt())

        // Create RequestBody and Request for OkHttp3
        val body = RequestBody.create(ApiService.JSON, jsonObject.toString())
        val request = Request.Builder().url(url).put(body).build()

        // Make call
        ApiService.client.newCall(request).enqueue(object : Callback {
            override fun onFailure(call: Call, e: IOException) {
                Log.d(TAG, "Error: $e")
            }

            override fun onResponse(call: Call, response: Response) {
                val result = response.body()?.string()
                if (result != null) {
                    try {
                        val jsonObject = JSONObject(result)
                        callback(jsonObject)
                    } catch (_: Exception) {
                        val badJsonObject = JSONObject()
                        callback(badJsonObject)
                    }
                }
            }
        })
    }
}