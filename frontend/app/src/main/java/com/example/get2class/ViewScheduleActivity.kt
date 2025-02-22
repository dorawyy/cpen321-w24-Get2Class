package com.example.get2class

import android.content.Intent
import android.os.Bundle
import android.util.Log
import android.widget.Button
import android.widget.TextView
import android.widget.Toast
import androidx.activity.enableEdgeToEdge
import androidx.activity.result.contract.ActivityResultContracts
import androidx.appcompat.app.AppCompatActivity
import androidx.core.view.ViewCompat
import androidx.core.view.WindowInsetsCompat
import androidx.recyclerview.widget.GridLayoutManager
import androidx.recyclerview.widget.RecyclerView
import okhttp3.Call
import okhttp3.Callback
import okhttp3.Request
import okhttp3.Response
import org.json.JSONArray
import org.json.JSONObject
import java.io.IOException
import java.time.LocalDate
import java.time.format.DateTimeFormatter

class ViewScheduleActivity : AppCompatActivity() {

    companion object {
        private const val TAG = "ViewScheduleActivity"
    }

    private val scheduleLauncher = registerForActivityResult(
        ActivityResultContracts.StartActivityForResult()
    ) { result ->
        if (result.resultCode == RESULT_OK) {
            val schedule: Schedule? = result.data?.getParcelableExtra("schedule")
            if (schedule != null) {
                Log.d(TAG, "Received schedule: $schedule")

                loadCalendar(schedule)

                Toast.makeText(this, "Successfully uploaded schedule", Toast.LENGTH_SHORT).show()
            }
        }
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()
        setContentView(R.layout.activity_view_schedule)
        ViewCompat.setOnApplyWindowInsetsListener(findViewById(R.id.main)) { v, insets ->
            val systemBars = insets.getInsets(WindowInsetsCompat.Type.systemBars())
            v.setPadding(systemBars.left, systemBars.top, systemBars.right, systemBars.bottom)
            insets
        }

        val term = intent.getStringExtra("term")
        val scheduleName = findViewById<TextView>(R.id.schedule_name)
        scheduleName.text = "$term Schedule: "

        getSchedule(BuildConfig.BASE_API_URL + "/get_schedule?sub=" + LoginActivity.GoogleIdTokenSub + "&term=" + ScheduleListActivity.term) { result ->
            Log.d(TAG, "$result")

            runOnUiThread {
                try {
                    Log.d(TAG, "${result.getJSONArray("courseList")}")
                    Log.d(TAG, "${result.getJSONArray("courseList")::class.qualifiedName}")

                    Log.d(TAG, "${jsonArrayToCourseList(result.getJSONArray("courseList"))}")

                    Log.d(TAG, "${jsonArrayToCourseList(result.getJSONArray("courseList"))?.let {
                        Schedule(
                            it
                        )
                    }}")

                    jsonArrayToCourseList(result.getJSONArray("courseList"))?.let { Schedule(it) }
                        ?.let { loadCalendar(it) }
                } catch (e: Exception) {
                    loadCalendar()
                }
            }
        }

        // Upload Schedule Button
        findViewById<Button>(R.id.upload_schedule_button).setOnClickListener {
            Log.d(TAG, "Upload schedule button clicked")
            try {
                val intent = Intent(this, UploadScheduleActivity::class.java)
                intent.putExtra("term", term)
                scheduleLauncher.launch(intent) // Start activity for result
            } catch (e: Exception) {
                Toast.makeText(this, "An error has occurred", Toast.LENGTH_SHORT).show()
            }
        }

        // Clear Schedule Button
        findViewById<Button>(R.id.clear_schedule_button).setOnClickListener {
            Log.d(TAG, "Clear schedule button clicked")
            loadCalendar()
        }


    }

    fun timeToIndex(hour: Int, minute: Int): Int {
        // e.g. hour=8, minute=30 => (8-8)*2 + 1 = 1
        //      hour=9, minute=0 => (9-8)*2 + 0 = 2
        return (hour - 8) * 2 + (minute / 30)
    }

    fun loadCalendar(schedule: Schedule = Schedule(mutableListOf())) {
        val cells = mutableListOf<Pair<Int, Int>>()  // (dayOfWeek, halfHourIndex)
        for (day in 0..5) {  // 0 represents the header row, 1-5 are weekdays
            cells.add(day to -1) // -1 represents a header cell
        }
        // dayOfWeek: 1..5 (Mon=1, Tue=2, etc.)
        // halfHourIndex: 0..27 (0=8:00, 1=8:30, 2=9:00, etc.)
        for (index in 0 until 28) {
            cells.add(0 to index)
            for (day in 1..5) {
                cells.add(day to index)
            }
        }

        val eventsMap = mutableMapOf<Pair<Int, Int>, Course?>()
        // Initialize all cells to null
        for (day in 1..5) {
            for (index in 0 until 28) {
                eventsMap[day to index] = null
            }
        }

        // Fill the map
        for (course in schedule.courses) {
            val startIndex = timeToIndex(course.startTime.first, course.startTime.second)
            val endIndex = timeToIndex(course.endTime.first, course.endTime.second)
            for (day in 1..5) {
                if (course.days[day-1]) {
                    for (i in startIndex until endIndex) {
                        eventsMap[day to i] = course
                    }
                }
            }
        }

        // Create the calendar view
        val recyclerView = findViewById<RecyclerView>(R.id.calendarRecyclerView)
        val layoutManager = GridLayoutManager(this, 17, GridLayoutManager.VERTICAL, false)

        layoutManager.spanSizeLookup = object : GridLayoutManager.SpanSizeLookup() {
            override fun getSpanSize(position: Int): Int {
                val (day, index) = cells[position]
                return when {
                    day == 0 -> 2  // Time labels (narrower)
                    else -> 3  // Regular calendar cells (wider)
                }
            }
        }
        recyclerView.layoutManager = layoutManager
        recyclerView.setHasFixedSize(true)
        recyclerView.itemAnimator = null
        recyclerView.adapter = CalendarAdapter(cells, eventsMap)
    }

    fun getSchedule(url: String, callback: (JSONObject) -> Unit) {
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

    fun jsonArrayToCourseList(jsonArray: JSONArray): MutableList<Course>? {
        val list = mutableListOf<Course>()
        for (i in 0 until jsonArray.length()) {
            val obj = jsonArray.getJSONObject(i)
            try {
                list.add(
                    Course(
                        obj.getString("name"),
                        parseBooleanList(obj.getString("daysBool")),
                        parsePair(obj.getString("startTime")),
                        parsePair(obj.getString("endTime")),
                        parseLocalDate(obj.getString("startDate")),
                        parseLocalDate(obj.getString("endDate")),
                        obj.getString("building"),
                        obj.getDouble("credits"),
                        obj.getString("format")
                    )
                )
            } catch (e: Exception) {
                return null
            }
        }

        return list
    }

    fun parsePair(input: String): Pair<Int, Int> {
        val numbers = input.removeSurrounding("(", ")").split(", ").map { it.toInt() }
        return Pair(numbers[0], numbers[1])
    }

    fun parseLocalDate(dateString: String): LocalDate {
        return LocalDate.parse(dateString, DateTimeFormatter.ISO_LOCAL_DATE)
    }

    fun parseBooleanList(list: String): List<Boolean> {
        val jsonArray = JSONArray(list)
        return List(jsonArray.length()) { jsonArray.getBoolean(it) }
    }
}