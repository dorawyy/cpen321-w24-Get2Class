package com.example.get2class

import android.content.Intent
import android.net.Uri
import android.os.Bundle
import android.os.Parcelable
import kotlinx.parcelize.Parcelize
import android.util.Log
import androidx.activity.enableEdgeToEdge
import androidx.appcompat.app.AppCompatActivity
import androidx.core.view.ViewCompat
import androidx.core.view.WindowInsetsCompat
import okhttp3.Call
import okhttp3.Callback
import okhttp3.Request
import okhttp3.RequestBody
import okhttp3.Response
import org.apache.poi.ss.usermodel.WorkbookFactory
import org.json.JSONArray
import org.json.JSONException
import org.json.JSONObject
import java.io.IOException
import java.time.LocalDate
import java.time.format.DateTimeFormatter

@Parcelize
data class Course(
    val name: String,
    val days: List<Boolean>,
    val startTime: Pair<Int, Int>,
    val endTime: Pair<Int, Int>,
    val startDate: LocalDate,
    val endDate: LocalDate,
    val location: String,
    val credits: Double,
    val format: String
) : Parcelable

@Parcelize
data class Schedule(val courses: List<Course>) : Parcelable

class UploadScheduleActivity : AppCompatActivity() {

    private lateinit var schedule: Schedule

    companion object {
        private const val REQUEST_CODE = 100 // Define request code for file selection
        private const val TAG = "UploadScheduleActivity"
        private const val LISTING = 1
        private const val CREDITS = 2
        private const val FORMAT = 5
        private const val MODE = 6
        private const val PATTERN = 7
        private const val START_DATE = 10
        private const val END_DATE = 11
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()
        setContentView(R.layout.activity_upload_schedule)

        ViewCompat.setOnApplyWindowInsetsListener(findViewById(R.id.main)) { v, insets ->
            val systemBars = insets.getInsets(WindowInsetsCompat.Type.systemBars())
            v.setPadding(systemBars.left, systemBars.top, systemBars.right, systemBars.bottom)
            insets
        }

        Log.d(TAG, "Term: ${intent.getStringExtra("term")}")

        // Launch the file picker to select an .xlsx file
        val intent = Intent(Intent.ACTION_OPEN_DOCUMENT).apply {
            addCategory(Intent.CATEGORY_OPENABLE)
            type = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        }
        startActivityForResult(intent, REQUEST_CODE)
    }

    // Handle the result from the file picker
    override fun onActivityResult(requestCode: Int, resultCode: Int, data: Intent?) {
        super.onActivityResult(requestCode, resultCode, data)

        if (data == null || data.data == null) {
            Log.e(TAG, "No file selected")
            setResult(RESULT_CANCELED)
            finish()
            return
        }

        if (requestCode == REQUEST_CODE && resultCode == RESULT_OK) {
            data?.data?.let { uri ->
                schedule = readExcelFromUri(uri)
                val resultIntent = Intent().apply {
                    putExtra("schedule", schedule)
                }
                setResult(RESULT_OK, resultIntent) // Send result back to MainActivity
                finish() // Ensure the activity finishes after setting the result
            }
        } else {
            setResult(RESULT_CANCELED) // Handle case where user cancels selection
            finish()
        }
    }

    // Step 3: Read the Excel file and process its data
    private fun readExcelFromUri(uri: Uri): Schedule {
        val courses: MutableList<Course> = mutableListOf()
        val coursesAsNotCourseObject: MutableList<JSONObject> = mutableListOf()
        try {
            contentResolver.openInputStream(uri)?.use { inputStream ->
                val workbook = WorkbookFactory.create(inputStream)
                val sheet = workbook.getSheetAt(0)

                var rowNum = 0
                for (row in sheet) {
                    // Ignore classes that aren't in person
                    if (row.getCell(MODE).toString() != "In Person Learning") {
                        rowNum++
                        continue
                    }

                    if (rowNum > 2) {
                        // Create the full name value
                        val listing = row.getCell(LISTING).toString()
                        val fullName = listing.substringBefore('_') + ' ' + listing.substringAfter(' ')
                        Log.d(TAG, "Full name: $fullName")

                        // Get the credits
                        val credits = row.getCell(CREDITS).toString().toDouble()
                        Log.d(TAG, "Credits: $credits")

                        // Create the start date and end date
                        val dateFormatter = DateTimeFormatter.ofPattern("dd-MMM-yyyy")
                        val startDate = LocalDate.parse(row.getCell(START_DATE).toString(), dateFormatter)
                        Log.d(TAG, "Start Date: $startDate")
                        val endDate = LocalDate.parse(row.getCell(END_DATE).toString(), dateFormatter)
                        Log.d(TAG, "End Date: $endDate")

                        // Get the meeting pattern
                        val pattern = row.getCell(PATTERN).toString()
                        if (pattern != "") {
                            val patternList = pattern.split("|")

                            // Create the days list
                            val days = patternList[1].split(" ")
                            val daysBool = mutableListOf(false, false, false, false, false)
                            if (days.contains("Mon")) daysBool[0] = true
                            if (days.contains("Tue")) daysBool[1] = true
                            if (days.contains("Wed")) daysBool[2] = true
                            if (days.contains("Thu")) daysBool[3] = true
                            if (days.contains("Fri")) daysBool[4] = true
                            Log.d(TAG, "Days: $daysBool")

                            // Create the start time
                            val times = patternList[2].split("-")
                            val startTimeParts = times[0].split("[ :]".toRegex())
                            Log.d(TAG, "Start time parts: $startTimeParts")
                            var startTime = startTimeParts[1].toInt() to startTimeParts[2].toInt()
                            if (startTime.first != 12 && startTimeParts[3] == "p.m.") {
                                startTime = startTime.first + 12 to startTime.second
                            }
                            Log.d(TAG, "Start time: $startTime")

                            // Create the end time
                            val endTimeParts = times[1].split("[ :]".toRegex())
                            var endTime = endTimeParts[1].toInt() to endTimeParts[2].toInt()
                            if (endTime.first != 12 && endTimeParts[3] == "p.m.") {
                                endTime = endTime.first + 12 to endTime.second
                            }
                            Log.d(TAG, "End time: $endTime")

                            // Get the building code
                            val locationList = patternList[3].split("[-\n]".toRegex())
                            val location = "${locationList[0].trim()} - ${locationList[2].trim()}"
                            Log.d(TAG, "Location: $location")

                            // Get the format
                            val format = row.getCell(FORMAT).toString()
                            Log.d(TAG, "Format: $format")

                            // Make the course object
                            courses.add(Course(fullName, daysBool, startTime, endTime, startDate, endDate, location, credits, format))
                            coursesAsNotCourseObject.add(JSONObject()
                                .put("name", fullName)
                                .put("daysBool", daysBool)
                                .put("startTime", startTime)
                                .put("endTime", endTime)
                                .put("startDate", startDate)
                                .put("endDate", endDate)
                                .put("location", location)
                                .put("credits", credits)
                                .put("format", format)
                            )
                        }

                    }
                    Log.d(TAG, "---------------------------------------------------------------------------")
                    rowNum++
                }
                Log.d(TAG, "Courses object: $courses")
                storeSchedule(BuildConfig.BASE_API_URL + "/schedule", coursesAsNotCourseObject) { result ->
                    Log.d(TAG, "$result")
                }

                workbook.close()
            }
        } catch (e: Exception) {
            e.printStackTrace()
        }
        return Schedule(courses)
    }

    fun storeSchedule(url: String, courses: MutableList<JSONObject>, callback: (JSONObject) -> Unit) {
        Log.d(TAG, "Storing schedule to database")

        // Create JSONObject to send
        val jsonObject = JSONObject()
        jsonObject.put("sub", LoginActivity.GoogleIdTokenSub)
        jsonObject.put(ScheduleListActivity.term, JSONArray(courses))

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