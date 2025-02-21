package com.example.get2class

import android.content.Intent
import android.os.Bundle
import android.util.Log
import android.widget.Button
import androidx.activity.enableEdgeToEdge
import androidx.appcompat.app.AppCompatActivity
import androidx.core.view.ViewCompat
import androidx.core.view.WindowInsetsCompat

class ScheduleListActivity : AppCompatActivity() {

    companion object {
        private const val TAG = "ScheduleListActivity"
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()
        setContentView(R.layout.activity_schedule_list)
        ViewCompat.setOnApplyWindowInsetsListener(findViewById(R.id.schedule_list)) { v, insets ->
            val systemBars = insets.getInsets(WindowInsetsCompat.Type.systemBars())
            v.setPadding(systemBars.left, systemBars.top, systemBars.right, systemBars.bottom)
            insets
        }

        // test button for View Route
        findViewById<Button>(R.id.view_route_button).setOnClickListener(){
            val acronym = "LSK"
            val intent = Intent(this, RouteActivity::class.java)
            intent.putExtra("acronym", acronym)
            startActivity(intent)
        }

        findViewById<Button>(R.id.fall_sem_schedule).setOnClickListener() {
            Log.d(TAG, "Route to fall semester schedule")
        }

        findViewById<Button>(R.id.winter_sem_schedule).setOnClickListener() {
            Log.d(TAG, "Route to winter semester schedule")
        }

        findViewById<Button>(R.id.summer_sem_schedule).setOnClickListener() {
            Log.d(TAG, "Route to summer semester schedule")
        }
    }
}