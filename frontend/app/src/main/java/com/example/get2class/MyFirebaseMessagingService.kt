package com.example.get2class

import android.app.Notification
import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.PendingIntent
import android.content.Context
import android.content.Intent
import android.os.Build
import android.util.Log
import android.widget.RemoteViews
import android.widget.Toast
import androidx.core.app.NotificationCompat
import com.example.get2class.SettingsActivity.Companion
import com.google.android.gms.tasks.OnCompleteListener
import com.google.firebase.messaging.FirebaseMessaging
import com.google.firebase.messaging.FirebaseMessagingService
import com.google.firebase.messaging.RemoteMessage
import okhttp3.Call
import okhttp3.Callback
import okhttp3.Request
import okhttp3.RequestBody
import okhttp3.Response
import org.json.JSONObject
import java.io.IOException

const val channelId = "notification_channel"
const val channelName = "com.example.get2class"

class MyFirebaseMessagingService : FirebaseMessagingService() {

    companion object {
        private const val TAG = "MyFirebaseMessagingService"

        fun sendNewRegistrationToken() {
            FirebaseMessaging.getInstance().token.addOnCompleteListener(OnCompleteListener { task ->
                if (!task.isSuccessful) {
                    Log.w(TAG, "Fetching FCM registration token failed", task.exception)
                    return@OnCompleteListener
                }

                // Get new FCM registration token
                val token = task.result

                sendRegistrationToServer(token) { result ->
                    Log.d(TAG, "Sending registration token...")
                    Log.d(TAG, "$result")

                    val acknowledgement = result.getBoolean("acknowledged")
                    if (acknowledgement) {
                        Log.d(TAG, "Sent registration token to server")
                    } else {
                        Log.d(TAG, "An error has occurred")
                    }
                }
            })
        }

        private fun sendRegistrationToServer(token: String, callback: (JSONObject) -> Unit) {
            val jsonObject = JSONObject()
            jsonObject.put("sub", LoginActivity.GoogleIdTokenSub)
            jsonObject.put("registrationToken", token)

            // Create RequestBody and Request for OkHttp3
            val body = RequestBody.create(ApiService.JSON, jsonObject.toString())
            val request = Request.Builder().url(BuildConfig.BASE_API_URL + "/update_registration_token").put(body).build()

            ApiService.client.newCall(request).enqueue(object : Callback {
                override fun onFailure(call: Call, e: IOException) {
                    Log.d(TAG, "Error: $e")
                }

                override fun onResponse(call: Call, response: Response) {
                    val result = response.body()?.string()
                    if (result != null) {
                        try {
                            val goodJsonObject = JSONObject(result)
                            callback(goodJsonObject)
                        } catch (_: Exception) {
                            val badJsonObject = JSONObject()
                            callback(badJsonObject)
                        }
                    }
                }
            })
        }
    }

    override fun onNewToken(token: String) {
        Log.d(TAG, "Refreshed token: $token")

        // If you want to send messages to this application instance or
        // manage this apps subscriptions on the server side, send the
        // FCM registration token to your app server.
        sendRegistrationToServer(token) { result ->
            Log.d(TAG, "Sending registration token...")
            Log.d(TAG, "$result")

            val acknowledgement = result.getBoolean("acknowledged")
            if (acknowledgement) {
                Log.d(TAG, "Sent registration token to server")
            } else {
                Log.d(TAG, "An error has occurred")
            }
        }
    }

    override fun onMessageReceived(remoteMessage: RemoteMessage) {
        if (remoteMessage.getNotification() != null) {
            generateNotification(remoteMessage.notification!!.title!!, remoteMessage.notification!!.body!!)
        }
    }


    fun getRemoteView(title: String, message: String) : RemoteViews {
        val remoteView = RemoteViews("com.example.get2class", R.layout.notification)

        remoteView.setTextViewText(R.id.title, title)
        remoteView.setTextViewText(R.id.message, message)
        remoteView.setImageViewResource(R.id.app_logo, R.drawable.get2class)

        return remoteView
    }

    fun generateNotification(title: String, message: String) {

        val intent = Intent(this, MainActivity::class.java)
        intent.addFlags(Intent.FLAG_ACTIVITY_CLEAR_TOP)


        val pendingIntent = PendingIntent.getActivity(this, 0, intent,
            PendingIntent.FLAG_ONE_SHOT or PendingIntent.FLAG_IMMUTABLE)

        // channel id, channel name
        var builder: NotificationCompat.Builder = NotificationCompat.Builder(applicationContext, channelId)
            .setSmallIcon(R.drawable.get2class)
            .setAutoCancel(true)
            .setVibrate(longArrayOf(1000, 1000, 1000, 1000))
            .setOnlyAlertOnce(true)
            .setContentIntent(pendingIntent)

        builder = builder.setContent(getRemoteView(title, message))

        val notificationManager = getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager

        if(Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val notificationChannel = NotificationChannel(channelId, channelName, NotificationManager.IMPORTANCE_HIGH)
            notificationManager.createNotificationChannel(notificationChannel)
        }

        notificationManager.notify(0, builder.build())
    }
}