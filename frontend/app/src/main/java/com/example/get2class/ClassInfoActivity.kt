package com.example.get2class

import android.content.Intent
import android.os.Bundle
import android.util.Log
import android.widget.Button
import android.widget.TextView
import androidx.activity.enableEdgeToEdge
import androidx.appcompat.app.AppCompatActivity
import androidx.core.view.ViewCompat
import androidx.core.view.WindowInsetsCompat

class ClassInfoActivity : AppCompatActivity() {

    companion object {
        private const val TAG = "ClassInfoActivity"
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()
        setContentView(R.layout.activity_class_info)
        ViewCompat.setOnApplyWindowInsetsListener(findViewById(R.id.main)) { v, insets ->
            val systemBars = insets.getInsets(WindowInsetsCompat.Type.systemBars())
            v.setPadding(systemBars.left, systemBars.top, systemBars.right, systemBars.bottom)
            insets
        }

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

            TODO("this will call a back end API route that awards karma to a user")
        }

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
}