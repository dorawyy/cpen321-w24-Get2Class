package com.example.get2class

import android.util.Log
import android.widget.TextView
import androidx.test.espresso.Espresso.onView
import androidx.test.espresso.Espresso.pressBack
import androidx.test.espresso.NoMatchingViewException
import androidx.test.espresso.action.ViewActions.click
import androidx.test.espresso.assertion.ViewAssertions.doesNotExist
import androidx.test.espresso.assertion.ViewAssertions.matches
import androidx.test.espresso.matcher.ViewMatchers.isDisplayed
import androidx.test.espresso.matcher.ViewMatchers.isRoot
import androidx.test.espresso.matcher.ViewMatchers.withId
import androidx.test.espresso.matcher.ViewMatchers.withText
import androidx.test.espresso.util.TreeIterables
import androidx.test.ext.junit.rules.ActivityScenarioRule
import androidx.test.ext.junit.runners.AndroidJUnit4
import androidx.test.filters.LargeTest
import androidx.test.platform.app.InstrumentationRegistry
import androidx.test.uiautomator.UiDevice
import androidx.test.uiautomator.UiSelector
import junit.framework.TestCase.assertTrue
import org.junit.Rule
import org.junit.Test
import org.junit.runner.RunWith
import androidx.test.uiautomator.UiObjectNotFoundException
import org.junit.FixMethodOrder
import org.junit.runners.MethodSorters


private const val NAME = "Lucas"
private const val FILENAME = "View_My_Courses.xlsx"
private const val LAG: Long = 8000
private const val TAG = "UploadScheduleTest"

// Instrumented test, which will execute on the emulated Pixel 9.
@RunWith(AndroidJUnit4::class)
@LargeTest
@FixMethodOrder(MethodSorters.NAME_ASCENDING)
class UploadScheduleTest {

    @get:Rule
    val activityRule = ActivityScenarioRule(LoginActivity::class.java)

    @Test
    fun uploadScheduleTest() {
        // Log in and navigate to schedules
        onView(withId(R.id.login_button)).perform(click())
        waitForUIClick(NAME)
        try {
            waitForUIClick("Agree and share", 2000)
        } catch (_: AssertionError) {}
        Thread.sleep(1000)
        waitForUIClick("Schedules")
        Log.d(TAG, "Test 1: Successfully log in and navigate to the schedule list!")

        // Test that uploading to the wrong term returns an empty schedule
        onView(withId(R.id.fall_schedule)).perform(click())
        onView(withId(R.id.upload_schedule_button)).perform(click())
        waitForUIClick(FILENAME)
        testScheduleLoaded(false)
        onView(withText("This schedule is not for this term!")).check(matches(isDisplayed()))
        Log.d(TAG, "Test 1: Successfully get an empty schedule after uploading a winter schedule to the fall schedule!")

        pressBack()

        // Test that uploading to the right term works
        onView(withId(R.id.winter_schedule)).perform(click())
        onView(withId(R.id.upload_schedule_button)).perform(click())
        waitForUI(FILENAME)
        val t1  = System.currentTimeMillis()
        ui_click(FILENAME)
        waitForUI("CPSC 320")
        testScheduleLoaded(true)
        onView(withText("Successfully uploaded schedule!")).check(matches(isDisplayed()))
        val t2  = System.currentTimeMillis()
        assertTrue("Schedule upload took more than 4s", t2 - t1 < 4000)
        Log.d(TAG, "Test 1: Successfully upload a winter schedule in ${t2 - t1}ms!")

        pressBack()

        // Test that the schedule is loaded when returning to the page
        onView(withId(R.id.winter_schedule)).perform(click())
        testScheduleLoaded(true)
        Log.d(TAG, "Test 1: Successfully load the winter schedule after pressing back and clicking Winter Schedule again!")

        // Test that clearing the schedule works
        onView(withId(R.id.clear_schedule_button)).perform(click())
        testScheduleLoaded(false)
        onView(withText("Successfully cleared schedule!")).check(matches(isDisplayed()))
        Log.d(TAG, "Test 1: Successfully clear the winter schedule!")
    }
    

}

// Waits for expectedText to appear, then clicks on it
private fun waitForUIClick(expectedText: String, timeout: Long = LAG) {
    val startTime = System.currentTimeMillis()
    while (System.currentTimeMillis() - startTime < timeout) {
        try {
            ui_click(expectedText)
            return // Exit if click succeeded
        } catch (e: AssertionError) {
            Thread.sleep(100) // Wait and retry
        } catch (e: UiObjectNotFoundException) {
            Thread.sleep(100) // Wait and retry
        }
    }
    throw AssertionError("Text was not found within timeout")
}

// Waits for expectedText to appear
private fun waitForUI(expectedText: String, timeout: Long = LAG, expectedId: Int? = null) {
    val startTime = System.currentTimeMillis()
    while (System.currentTimeMillis() - startTime < timeout) {
        if (expectedId != null) {
            try {
                onView(withId(expectedId)).check(matches(isDisplayed()))
                return
            } catch (e: NoMatchingViewException) {
                Thread.sleep(100)
            }
        } else {
            if (uiExistWithText(expectedText)) {
                return // Exit if found
            } else {
                Thread.sleep(100) // Wait and retry
            }
        }
    }
    throw AssertionError("Text was not found within timeout")
}

// Check if expectedText exists
private fun uiExistWithText(expectedText: String): Boolean {
    // get UI element with the given text
    val device = UiDevice.getInstance(InstrumentationRegistry.getInstrumentation())
    val e = device.findObject(UiSelector().text(expectedText))

    return e.exists()
}

// Use UIAutomator to click on the file in the system file picker
private fun ui_click(elementText: String) {
    val device = UiDevice.getInstance(InstrumentationRegistry.getInstrumentation())
    val element = device.findObject(UiSelector().text(elementText))
    Log.d(
        "ui_click on $elementText",
        "ui_click: exist - ${element.exists()}; enable - ${element.isEnabled}"
    )
    if (element.exists() && element.isEnabled) {
        element.click()
    } else {
        throw AssertionError("Element $elementText not found in file picker")
    }
}

private fun countOccurrences(text: String, expectedCount: Int) {
    var actualCount = 0
    try {
        // Iterate over all views on the screen
        onView(isRoot()).check { view, _ ->
            // Use TreeIterables to get all views in the hierarchy
            val views = TreeIterables.breadthFirstViewTraversal(view)
            actualCount = views.count { it is TextView && it.text == text }
        }
    } catch (e: NoMatchingViewException) {
        actualCount = 0 // No matching views found
    }

    // Compare the count and throw an error if it doesn't match the expected count
    if (actualCount != expectedCount) {
        throw AssertionError("Expected '$text' to appear $expectedCount times, but found $actualCount")
    }
}

private fun testScheduleLoaded(loaded: Boolean) {
    if (loaded) {
        countOccurrences("CPSC 320", 4)
        countOccurrences("CPEN 321", 3)
        countOccurrences("CPSC 322", 2)
        countOccurrences("Lecture", 7)
        countOccurrences("Laboratory", 1)
        countOccurrences("Discussion", 1)
        onView(withText("APSC 450")).check(doesNotExist())
    } else {
        onView(withText("CPSC 320")).check(doesNotExist())
        onView(withText("CPEN 321")).check(doesNotExist())
        onView(withText("CPSC 322")).check(doesNotExist())
        onView(withText("APSC 450")).check(doesNotExist())
        onView(withText("Lecture")).check(doesNotExist())
        onView(withText("Laboratory")).check(doesNotExist())
        onView(withText("Discussion")).check(doesNotExist())
    }
}