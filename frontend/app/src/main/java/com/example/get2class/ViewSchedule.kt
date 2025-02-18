package com.example.get2class

import android.content.Intent
import android.os.Bundle
import android.util.Log
import android.widget.Button
import android.widget.TextView
import androidx.activity.enableEdgeToEdge
import androidx.activity.result.contract.ActivityResultContracts
import androidx.appcompat.app.AppCompatActivity
import androidx.core.view.ViewCompat
import androidx.core.view.WindowInsetsCompat
import androidx.recyclerview.widget.GridLayoutManager
import androidx.recyclerview.widget.RecyclerView

class ViewSchedule : AppCompatActivity() {

    companion object {
        private const val TAG = "ScheduleFeature"
    }

    private val scheduleLauncher = registerForActivityResult(
        ActivityResultContracts.StartActivityForResult()
    ) { result ->
        if (result.resultCode == RESULT_OK) {
            val schedule: Schedule? = result.data?.getParcelableExtra("schedule")
            if (schedule != null) {
                Log.d(TAG, "Received schedule: $schedule")

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
                Log.d(TAG, "cells: $cells")

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
                Log.d(TAG, "eventsMap: $eventsMap")


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

                // Disable scrolling (may need to use wrap_content or fixed size)
                //recyclerView.isNestedScrollingEnabled = false

                recyclerView.adapter = CalendarAdapter(cells, eventsMap)

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

        // Upload Schedule Button
        findViewById<Button>(R.id.upload_schedule_button).setOnClickListener {
            Log.d(TAG, "Upload schedule button clicked")
            val intent = Intent(this, UploadSchedule::class.java)
            intent.putExtra("term", term)
            scheduleLauncher.launch(intent) // Start activity for result
        }


    }

    fun indexToTime(index: Int): Pair<Int, Int> {
        // index 0 = 8:00, index 1 = 8:30, index 2 = 9:00 ...
        val baseHour = 8
        val hour = baseHour + (index / 2)
        val minute = if (index % 2 == 0) 0 else 30
        return hour to minute
    }

    fun timeToIndex(hour: Int, minute: Int): Int {
        // e.g. hour=8, minute=30 => (8-8)*2 + 1 = 1
        //      hour=9, minute=0 => (9-8)*2 + 0 = 2
        return (hour - 8) * 2 + (minute / 30)
    }
}