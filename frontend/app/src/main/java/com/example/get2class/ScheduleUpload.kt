package com.example.get2class

import android.content.Context
import android.content.Intent
import android.net.Uri
import android.os.Bundle
import androidx.activity.enableEdgeToEdge
import androidx.appcompat.app.AppCompatActivity
import androidx.core.view.ViewCompat
import androidx.core.view.WindowInsetsCompat
import org.apache.poi.ss.usermodel.WorkbookFactory

class ScheduleUpload : AppCompatActivity() {

    companion object {
        private const val REQUEST_CODE = 100 // Define request code for file selection
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()
        setContentView(R.layout.activity_schedule_upload)

        ViewCompat.setOnApplyWindowInsetsListener(findViewById(R.id.main)) { v, insets ->
            val systemBars = insets.getInsets(WindowInsetsCompat.Type.systemBars())
            v.setPadding(systemBars.left, systemBars.top, systemBars.right, systemBars.bottom)
            insets
        }

        // Step 1: Launch the file picker to select an .xlsx file
        val intent = Intent(Intent.ACTION_OPEN_DOCUMENT).apply {
            addCategory(Intent.CATEGORY_OPENABLE)
            type = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        }
        startActivityForResult(intent, REQUEST_CODE)
    }

    // Step 2: Handle the result from the file picker
    override fun onActivityResult(requestCode: Int, resultCode: Int, data: Intent?) {
        super.onActivityResult(requestCode, resultCode, data)

        if (requestCode == REQUEST_CODE && resultCode == RESULT_OK) {
            data?.data?.let { uri ->
                readExcelFromUri(uri) // Step 3: Read the file
            }
        }
    }

    // Step 3: Read the Excel file and process its data
    private fun readExcelFromUri(uri: Uri) {
        try {
            contentResolver.openInputStream(uri)?.use { inputStream ->
                val workbook = WorkbookFactory.create(inputStream)
                val sheet = workbook.getSheetAt(0)

                for (row in sheet) {
                    for (cell in row) {
                        println(cell.toString()) // Print the cell data (Replace with actual processing)
                    }
                }

                workbook.close()
            }
        } catch (e: Exception) {
            e.printStackTrace()
        }
    }
}