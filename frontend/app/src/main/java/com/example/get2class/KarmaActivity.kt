package com.example.get2class

import android.os.Bundle
import android.util.Log
import android.widget.TextView
import androidx.activity.enableEdgeToEdge
import androidx.appcompat.app.AppCompatActivity
import androidx.core.view.ViewCompat
import androidx.core.view.WindowInsetsCompat
import okhttp3.Call
import okhttp3.Callback
import okhttp3.Request
import okhttp3.Response
import org.json.JSONObject
import java.io.IOException

class KarmaActivity : AppCompatActivity() {

    companion object {
        private const val TAG = "KarmaActivity"
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()
        setContentView(R.layout.activity_karma)
        ViewCompat.setOnApplyWindowInsetsListener(findViewById(R.id.karma)) { v, insets ->
            val systemBars = insets.getInsets(WindowInsetsCompat.Type.systemBars())
            v.setPadding(systemBars.left, systemBars.top, systemBars.right, systemBars.bottom)
            insets
        }

        val karma_text: TextView = findViewById(R.id.karma_points)

        getKarma(BuildConfig.BASE_API_URL + "/user?sub=" + LoginActivity.GoogleIdTokenSub) { result ->
            Log.d(TAG, "${result.getString("karma")}")
            val karmaPoints = result.getString("karma")
            runOnUiThread {
                karma_text.text = karmaPoints
            }
        }
    }

    fun getKarma(url: String, callback: (JSONObject) -> Unit) {
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
                        jsonObject.put("karma", JSONObject(result).getInt("karma"))
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