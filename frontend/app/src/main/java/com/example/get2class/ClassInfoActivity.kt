package com.example.get2class

import android.content.Intent
import android.content.pm.PackageManager
import android.os.Bundle
import android.util.Log
import android.widget.Button
import android.widget.TextView
import androidx.activity.enableEdgeToEdge
import androidx.appcompat.app.AppCompatActivity
import androidx.core.app.ActivityCompat
import androidx.core.view.ViewCompat
import androidx.core.view.WindowInsetsCompat
import com.google.android.gms.location.FusedLocationProviderClient
import com.google.android.gms.location.LocationServices
import java.time.LocalDateTime
import java.time.format.DateTimeFormatter
import android.Manifest
import android.location.Geocoder
import android.widget.Toast
import androidx.lifecycle.lifecycleScope
import kotlinx.coroutines.launch
import kotlinx.coroutines.tasks.await
import java.util.Locale
import kotlin.math.*
import android.content.Context
import android.location.Location
import android.location.LocationListener
import android.location.LocationManager
import androidx.activity.OnBackPressedCallback
import com.google.android.gms.location.Priority
import com.google.android.gms.tasks.CancellationTokenSource
import okhttp3.Call
import okhttp3.Callback
import okhttp3.Request
import okhttp3.RequestBody
import okhttp3.Response
import org.json.JSONObject
import java.io.IOException


class ClassInfoActivity : AppCompatActivity(), LocationListener {

    companion object {
        private const val TAG = "ClassInfoActivity"
        private const val MINUTES = 1.0/60.0

    }

    // for accessing the current location
    private lateinit var fusedLocationClient: FusedLocationProviderClient
    private val LOCATION_PERMISSION_REQUEST_CODE = 666
    private lateinit var locationManager: LocationManager
    private var current_location: Pair<Double, Double>? = null
    private var isOnCreate: Boolean = true

    private var current_time: String? = null
    private var class_latitude: Double? = null
    private var class_longitude: Double? = null

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()
        setContentView(R.layout.activity_class_info)
        ViewCompat.setOnApplyWindowInsetsListener(findViewById(R.id.main)) { v, insets ->
            val systemBars = insets.getInsets(WindowInsetsCompat.Type.systemBars())
            v.setPadding(systemBars.left, systemBars.top, systemBars.right, systemBars.bottom)
            insets
        }

        // Override Android back button
        onBackPressedDispatcher.addCallback(this, object : OnBackPressedCallback(true) {
            override fun handleOnBackPressed() {
                val intent = Intent(this@ClassInfoActivity, ViewScheduleActivity::class.java)
                startActivity(intent)
            }
        })

        val course: Course? = intent.getParcelableExtra("course")

        findViewById<TextView>(R.id.course_name).text = "${course?.name}"
        findViewById<TextView>(R.id.course_format).text = "${course?.format}"
        findViewById<TextView>(R.id.course_time).text = "${course?.startTime?.to12HourTime(false)} - ${course?.endTime?.to12HourTime(true)}"
        var days = ""
        var first = true
        if (course?.days?.get(0) == true) {
            days += "Mon"
            first = false
        }
        if (course?.days?.get(1) == true) {
            if (first) {
                days += "Tue"
                first = false
            } else {
                days += ", Tue"
            }
        }
        if (course?.days?.get(2) == true) {
            if (first) {
                days += "Wed"
                first = false
            } else {
                days += ", Wed"
            }
        }
        if (course?.days?.get(3) == true) {
            if (first) {
                days += "Thu"
                first = false
            } else {
                days += ", Thu"
            }
        }
        if (course?.days?.get(4) == true) {
            if (first) {
                days += "Fri"
            } else {
                days += ", Fri"
            }
        }
        findViewById<TextView>(R.id.course_days).text = days

        findViewById<TextView>(R.id.course_location).text = "Location: ${course?.location}"
        findViewById<TextView>(R.id.course_credits).text = "Credits: ${course?.credits}"

        fusedLocationClient = LocationServices.getFusedLocationProviderClient(this)
        locationManager = getSystemService(Context.LOCATION_SERVICE) as LocationManager

        // Route to class Button
        findViewById<Button>(R.id.route_button).setOnClickListener {
            Log.d(TAG, "Route to class button clicked")

            Log.d(TAG, "Building: ${course?.location?.split("-")?.get(0)?.trim()}")
            val intent = Intent(this, RouteActivity::class.java)
            intent.putExtra("building", course?.location?.split("-")?.get(0)?.trim())
            startActivity(intent)
        }

        // Check attendance Button
        findViewById<Button>(R.id.check_attendance_button).setOnClickListener {
            Log.d(TAG, "Check attendance button clicked")

            if(ActivityCompat.checkSelfPermission(
                    this,
                    Manifest.permission.ACCESS_FINE_LOCATION
                ) == PackageManager.PERMISSION_GRANTED){
                locationManager.requestLocationUpdates(
                    LocationManager.GPS_PROVIDER,
                    1_000,
                    0f,
                    this
                )
                Log.d(
                    TAG,
                    "OnCreate: Location updates requested"
                )
            }else {
                ActivityCompat.requestPermissions(
                    this,
                    arrayOf(Manifest.permission.ACCESS_FINE_LOCATION),
                    LOCATION_PERMISSION_REQUEST_CODE
                )
            }

            val clientDate = getCurrentTime()?.split(" ") // day of week, hour, minute
            val clientDay = clientDate?.get(0)?.toInt()
            val clientTime = clientDate?.get(1)?.toDouble()?.plus(clientDate[2].toDouble()/60)
            val classStartTime = (course?.startTime?.second?.toDouble()?.div(60))?.let { it1 ->
                course.startTime.first.toDouble().plus(
                    it1
                )
            }
            var classEndTime = (course?.endTime?.second?.toDouble()?.div(60))?.let { it1 ->
                course.endTime.first.toDouble().plus(
                    it1
                )
            }
            classEndTime = classEndTime?.minus(10 * MINUTES)

            // Perform null checking
            if (clientDay == null || clientTime == null || classStartTime == null || classEndTime == null) {
                Toast.makeText(
                    this,
                    "Could not get date data",
                    Toast.LENGTH_SHORT
                ).show()
                return@setOnClickListener
            }
            Log.d(TAG, "Start: $classStartTime, end: $classEndTime, client: $clientTime")


            //TODO: check if the course is this term

            // Check if the course is today
            if (clientDay < 1 || clientDay > 5 || !course.days[clientDay - 1]) {
                Log.d(TAG, "You don't have this class today")
                Toast.makeText(
                    this,
                    "You don't have this class today",
                    Toast.LENGTH_SHORT
                ).show()
                return@setOnClickListener
            }

            // Check if the course has been attended yet
            if (course.attended) {
                Log.d(TAG, "You already checked into this class today!")
                Toast.makeText(this, "You already checked into this class today!", Toast.LENGTH_SHORT).show()
                return@setOnClickListener
            }

            // Check if it's too early
            if (clientTime < classStartTime - 10 * MINUTES) {
                Log.d(TAG, "You are too early to check into this class!")
                Toast.makeText(this, "You are too early to check into this class!", Toast.LENGTH_SHORT).show()
                return@setOnClickListener
            }

            // Check if it's too late
            if (classEndTime <= clientTime) {
                Log.d(TAG, "You missed your class!")
                Toast.makeText(this, "You missed your class!", Toast.LENGTH_SHORT).show()
                return@setOnClickListener
            }

            lifecycleScope.launch {
                val clientLocation = requestCurrentLocation()
                val classLocation = getClassLocation("UBC " + course.location.split("-")[0].trim())

                if (clientLocation.first == null || clientLocation.second == null || classLocation.first == null || classLocation.second == null) {
                    Toast.makeText(this@ClassInfoActivity, "Location data not available", Toast.LENGTH_SHORT).show()
                    return@launch
                }

                if (coordinatesToDistance(clientLocation, classLocation) > 75) {
                    Log.d(TAG, "You're too far from your class!")
                    Toast.makeText(this@ClassInfoActivity, "You're too far from your class!", Toast.LENGTH_SHORT).show()
                    return@launch
                }

                // Check if you're late
                if (classStartTime < clientTime - 2 * MINUTES) {
                    val lateness = clientTime - classStartTime
                    Log.d(TAG, "You were late by ${(lateness * 60).toInt()} minutes!")
                    Toast.makeText(this@ClassInfoActivity, "You were late by ${(lateness * 60).toInt()} minutes!", Toast.LENGTH_SHORT).show()
                    val classLength = classEndTime - classStartTime
                    val karma = (10 * (1 - lateness / classLength) * (course.credits + 1)).toInt()
                    updateKarma(BuildConfig.BASE_API_URL + "/karma", karma) {result ->
                        Log.d(TAG, "${result}")
                    }
                    updateAttendance(BuildConfig.BASE_API_URL + "/attendance", course.name, course.format) { result ->
                        Log.d(TAG, "${result}")
                        course.attended = true
                    }
                    Log.d(TAG, "You gained $karma Karma!")
                    Toast.makeText(this@ClassInfoActivity, "You gained $karma Karma!", Toast.LENGTH_SHORT).show()
                    return@launch
                }

                Log.d(TAG, "All checks passed")

                val karma = (15 * (course.credits + 1)).toInt()
                updateKarma(BuildConfig.BASE_API_URL + "/karma", karma) { result ->
                    Log.d(TAG, "${result}")
                }
                updateAttendance(BuildConfig.BASE_API_URL + "/attendance", course.name, course.format) { result ->
                    Log.d(TAG, "${result}")
                    course.attended = true
                }
                Log.d(TAG, "You gained $karma Karma!")
            }
        }

    }

    private fun getClassLocation(classAddress: String): Pair<Double?, Double?> {
        val geocoder = Geocoder(this, Locale.getDefault())
        var addresses = geocoder.getFromLocationName(classAddress, 1)
        if (!addresses.isNullOrEmpty()) {
            val location = addresses[0]
            class_latitude = location.latitude
            class_longitude = location.longitude
            Log.d(
                TAG,
                "getClassLocation: class location ($classAddress) is : ($class_latitude, $class_longitude)"
            )
            return class_latitude to class_longitude
        } else {
            // if no address found, set class to ubc book store
            addresses = geocoder.getFromLocationName("UBC Bookstore", 1)
            val location = addresses?.get(0)
            class_latitude = location?.latitude
            class_longitude = location?.longitude
            Log.d(
                TAG,
                "getClassLocation: class address not found"
            )
            Log.d(
                TAG,
                "getClassLocation: using UBC Bookstore : ($class_latitude, $class_longitude)"
            )
            return class_latitude to class_longitude
        }
    }

    private suspend fun requestCurrentLocation(): Pair<Double?, Double?> {
        return if (ActivityCompat.checkSelfPermission(
                this,
                Manifest.permission.ACCESS_FINE_LOCATION
            )
            == PackageManager.PERMISSION_GRANTED
        ) {
            getLastLocation()
        } else {
            ActivityCompat.requestPermissions(
                this,
                arrayOf(Manifest.permission.ACCESS_FINE_LOCATION),
                LOCATION_PERMISSION_REQUEST_CODE
            )
            Log.d(TAG, "requestCurrentLocation: Permission requested, returning null until granted")
            Pair(null, null) // Cannot proceed until user grants permission
        }
    }

    private suspend fun getLastLocation(): Pair<Double?, Double?> {
        return if (ActivityCompat.checkSelfPermission(this, Manifest.permission.ACCESS_FINE_LOCATION)
            == PackageManager.PERMISSION_GRANTED
        ) {
            try {
                var location: Location? = null

                // call getCurrentLocation() for the first time, and use the updated location afterwards
                if(isOnCreate){
                    val cancellationTokenSource = CancellationTokenSource()
                    // request the current location with high accuracy
                    location = fusedLocationClient.getCurrentLocation(
                        Priority.PRIORITY_HIGH_ACCURACY,
                        cancellationTokenSource.token
                    ).await()
                    isOnCreate= false
                }else{
                    location = Location("gps")
                    location.latitude = current_location?.first!!
                    location.longitude = current_location?.second!!
                }

                if (location != null) {
                    val latitude = location.latitude
                    val longitude = location.longitude
                    Log.d(TAG, "getLastLocation: lastLocation is ($latitude, $longitude)")
                    Pair(latitude, longitude)
                } else {
                    Log.d(TAG, "getLastLocation: lastLocation is null")
                    Pair(null, null)
                }
            } catch (e: Exception) {
                Log.e(TAG, "getLastLocation: Failed to get location", e)
                Pair(null, null)
            }
        } else {
            Log.d(TAG, "getLastLocation: Permission denied")
            Pair(null, null)
        }
    }

    private fun getCurrentTime(): String? {
        val currentTime = LocalDateTime.now()
        val dayOfWeek = currentTime.dayOfWeek.value // 1 = Monday, ..., 7 = Sunday
        val formatter = DateTimeFormatter.ofPattern("HH mm")
        current_time = "$dayOfWeek ${currentTime.format(formatter)}"

        Log.d(TAG, "getCurrentTime: $current_time")
        return current_time
    }

    override fun onRequestPermissionsResult(
        requestCode: Int, permissions: Array<out String>, grantResults: IntArray
    ) {
        super.onRequestPermissionsResult(requestCode, permissions, grantResults) // Keep this at the beginning

        if (requestCode == LOCATION_PERMISSION_REQUEST_CODE && grantResults.isNotEmpty() &&
            grantResults[0] == PackageManager.PERMISSION_GRANTED
        ) {
            if (ActivityCompat.checkSelfPermission(
                    this,
                    Manifest.permission.ACCESS_FINE_LOCATION
                ) == PackageManager.PERMISSION_GRANTED
            ) {
                locationManager.requestLocationUpdates(
                    LocationManager.GPS_PROVIDER,
                    1_000,
                    0f,
                    this
                )
                Log.d(
                    TAG,
                    "onRequestPermissionsResult: Location updates requested"
                )
            }

            lifecycleScope.launch {
                val location = getLastLocation()
                Log.d(TAG, "onRequestPermissionsResult: Location received: $location")
            }
        } else {
            Log.d(TAG, "onRequestPermissionsResult: Permission denied")
        }
    }

    override fun onLocationChanged(p0: Location) {
        current_location = p0.latitude to p0.longitude
    }

    fun Pair<Int, Int>.to12HourTime(end: Boolean): String {
        var (hour, minute) = this
        if (end) {
            if (minute == 30) minute = 20
            else {
                minute = 50
                hour--
            }
        }
        val amPm = if (hour < 12) "AM" else "PM"
        val hour12 = when (hour % 12) {
            0 -> 12  // 12-hour format should show 12 instead of 0 for AM/PM
            else -> hour % 12
        }
        return String.format("%d:%02d %s", hour12, minute, amPm)
    }

    fun coordinatesToDistance(coord1: Pair<Double?, Double?>, coord2: Pair<Double?, Double?>): Double {
        val R = 6378.137 // Radius of Earth in km
        val lat1 = coord1.first
        val lon1 = coord1.second
        val lat2 = coord2.first
        val lon2 = coord2.second

        if (lat1 == null || lon1 == null || lat2 == null || lon2 == null) {
            return -1.0
        }

        val dLat = Math.toRadians(lat2 - lat1)
        val dLon = Math.toRadians(lon2 - lon1)

        val a = sin(dLat / 2).pow(2) +
                cos(Math.toRadians(lat1)) * cos(Math.toRadians(lat2)) *
                sin(dLon / 2).pow(2)

        val c = 2 * atan2(sqrt(a), sqrt(1 - a))
        val distance = R * c * 1000 // Convert km to meters

        Log.d(TAG, "Distance from you to the class: $distance")

        return distance
    }

    fun updateKarma(url: String, karma: Int, callback: (JSONObject) -> Unit) {
        // Create JSONObject to send
        val jsonObject = JSONObject()
        jsonObject.put("sub", LoginActivity.GoogleIdTokenSub)
        jsonObject.put("karma", karma)

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

    fun updateAttendance(url: String, className: String, classFormat: String, callback: (JSONObject) -> Unit) {
        // Create JSONObject to send
        val jsonObject = JSONObject()
        jsonObject.put("sub", LoginActivity.GoogleIdTokenSub)
        jsonObject.put("className", className)
        jsonObject.put("classFormat", classFormat)
        jsonObject.put("term", ScheduleListActivity.term)

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