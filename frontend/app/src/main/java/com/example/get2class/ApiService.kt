package com.example.get2class

import android.util.Log
import okhttp3.Call
import okhttp3.Callback
import okhttp3.MediaType
import okhttp3.OkHttpClient
import okhttp3.Request
import okhttp3.RequestBody
import okhttp3.Response
import org.json.JSONObject
import java.io.IOException


object ApiService {

    val JSON: MediaType? = MediaType.parse("application/json")
    private const val TAG = "ApiService"
    const val BASE_API_URL = "http://10.0.2.2:3000"
    val client = OkHttpClient()

    // GET API
    fun GetAPI(path: String, callback: (JSONObject) -> Unit) {
        val request = Request.Builder().url(BASE_API_URL + path).get().build()
        client.newCall(request).enqueue(object : Callback {
            override fun onFailure(call: Call, e: IOException) {
                Log.d(TAG, "Error: $e")
            }

            override fun onResponse(call: Call, response: Response) {
                val result = response.body()?.string()
                if (result != null) {
                    val jsonObject = JSONObject(result)
                    Log.d(TAG, "On response: ${jsonObject}")
                    callback(jsonObject)
                }
            }
        })
    }

    // POST API
    fun PostAPI(jsonObject: JSONObject, path: String, callback: (JSONObject) -> Unit) {
        val body = RequestBody.create(JSON, jsonObject.toString())
        val request = Request.Builder().url(BASE_API_URL + path).post(body).build()
        client.newCall(request).enqueue(object : Callback {
            override fun onFailure(call: Call, e: IOException) {
                Log.d(TAG, "Error: $e")
            }

            override fun onResponse(call: Call, response: Response) {
                val result = response.body()?.string()
                if(result != null) {
                    val jsonObject = JSONObject(result)
                    Log.d(TAG, "On response: ${jsonObject}")
                    callback(jsonObject)
                }
            }
        })
    }
}