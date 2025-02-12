package com.example.get2class

import android.content.Intent
import android.os.Bundle
import android.util.Log
import android.widget.Button
import androidx.activity.enableEdgeToEdge
import androidx.activity.result.contract.ActivityResultContracts
import androidx.appcompat.app.AppCompatActivity
import androidx.core.view.ViewCompat
import androidx.core.view.WindowInsetsCompat

class MainActivity : AppCompatActivity() {

    companion object {
        private const val TAG = "MainActivity"
    }

    private val scheduleLauncher = registerForActivityResult(
        ActivityResultContracts.StartActivityForResult()
    ) { result ->
        if (result.resultCode == RESULT_OK) {
            val schedule: Schedule? = result.data?.getParcelableExtra("schedule")
            if (schedule != null) {
                Log.d(TAG, "Received schedule: $schedule")
                // TODO: Update UI with schedule data
            }
        }
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()
        setContentView(R.layout.activity_main)
        ViewCompat.setOnApplyWindowInsetsListener(findViewById(R.id.main)) { v, insets ->
            val systemBars = insets.getInsets(WindowInsetsCompat.Type.systemBars())
            v.setPadding(systemBars.left, systemBars.top, systemBars.right, systemBars.bottom)
            insets
        }

//        // Upload Schedule Button
//        findViewById<Button>(R.id.upload_schedule).setOnClickListener {
//            Log.d(TAG, "Upload schedule button clicked")
//            val intent = Intent(this, ScheduleUpload::class.java)
//            scheduleLauncher.launch(intent) // Start activity for result
//        }

        // Fall Schedule Button
        findViewById<Button>(R.id.fall_schedule).setOnClickListener {
            Log.d(TAG, "Fall schedule button clicked")
            val intent = Intent(this, ViewSchedule::class.java)
            //TODO: pass in value to indicate which schedule it is
            //TODO: move upload schedule button to schedule viewer
            //TODO: receive schedule object and display it using a schedule GUI
            startActivity(intent)
        }

        // Winter Schedule Button
        findViewById<Button>(R.id.winter_schedule).setOnClickListener {
            Log.d(TAG, "Winter schedule button clicked")
            val intent = Intent(this, ViewSchedule::class.java)
            startActivity(intent)        }

        // Summer Schedule Button
        findViewById<Button>(R.id.summer_schedule).setOnClickListener {
            Log.d(TAG, "Summer schedule button clicked")
            val intent = Intent(this, UploadSchedule::class.java)
            startActivity(intent)
        }
    }
}