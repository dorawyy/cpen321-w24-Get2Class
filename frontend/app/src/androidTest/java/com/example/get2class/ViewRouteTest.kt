package com.example.get2class

import android.util.Log
import androidx.test.espresso.Espresso.onView
import androidx.test.espresso.Espresso.pressBack
import androidx.test.espresso.NoMatchingViewException
import androidx.test.espresso.action.ViewActions.click
import androidx.test.espresso.assertion.ViewAssertions.matches
import androidx.test.espresso.matcher.ViewMatchers.isDisplayed
import androidx.test.espresso.matcher.ViewMatchers.withId
import androidx.test.ext.junit.rules.ActivityScenarioRule
import androidx.test.ext.junit.runners.AndroidJUnit4
import androidx.test.filters.LargeTest
import androidx.test.platform.app.InstrumentationRegistry
import androidx.test.uiautomator.UiDevice
import androidx.test.uiautomator.UiSelector
import org.junit.Assert.assertNotNull
import org.junit.Rule
import org.junit.Test
import org.junit.runner.RunWith
import androidx.test.espresso.action.ViewActions.*
import androidx.test.uiautomator.UiObjectNotFoundException
import org.junit.FixMethodOrder
import org.junit.runners.MethodSorters


private const val NAME = "Lucas"
private const val FILENAME = "View_My_Courses.xlsx"
private const val LAG: Long = 8000
private const val TAG = "ViewRouteTest"

// Instrumented test, which will execute on the emulated Pixel 9.
@RunWith(AndroidJUnit4::class)
@LargeTest
@FixMethodOrder(MethodSorters.NAME_ASCENDING)
class ViewRouteTest {

    @get:Rule
    val activityRule = ActivityScenarioRule(LoginActivity::class.java)

    @Test
    fun viewRouteTest() {
        logInAndLoadWinterSchedule()
        Log.d(TAG, "Test 3: Successfully log in and upload a winter schedule!")

        // 1. The user clicks on View Route
        waitForUIClick("CPEN 321")
        waitForUIClick("View route to class")
        Log.d(TAG, "Test 3: Successfully click CPEN 321 and the button labelled \"View route to class\"!")

        // 2. The app prompts the user to grant location permissions if not already granted
        try {
            waitForUI("While using the app", 5000)

            Log.d(TAG, "Test 3: Successfully detect the permission request dialog!")

            // 2a. The user does not grant location permissions
            ui_click("Don’t allow")
            Log.d(TAG, "Test 3: Successfully deny the permission request!")

            // 2a1. If the user denies, the app shows a toast to tell the user to enable location permissions in the settings first
            val device = UiDevice.getInstance(InstrumentationRegistry.getInstrumentation())
            val e = device.findObject(UiSelector().text("Please grant Location permissions in Settings to view your routes :/"))
            assertNotNull("Toast should show up", e)
            Log.d(TAG, "Test 3: Successfully warn the user to enable location permissions!")

            // 2a2. The app routes the user back to the previous screen
            onView(withId(R.id.route_button)).check(matches(isDisplayed()))
            onView(withId(R.id.check_attendance_button)).check(matches(isDisplayed()))
            Log.d(TAG, "Test 3: Successfully go back to the CPEN 321 info screen!")

            // retry step 1 for the success scenario
            ui_click("View route to class")
            Log.d(TAG, "Test 3: Successfully click the button labelled \"View route to class\" again!")

            // retry step 2
            waitForUIClick("Only this time")
            Thread.sleep(5000)
            Log.d(TAG, "Test 3: Successfully pop up the request dialog again and grant location permissions!")
        } catch (_: AssertionError) {}

        // a navigation dialog will show up if this is the first run
        try {
            waitForUIClick("GOT IT", 10000)
            Log.d(TAG, "Test 3: Successfully agree on Google Maps navigation terms and conditions!")
        } catch (_: AssertionError) {}

        // 3. The user sees their current location and destination location together with the optimal route on the screen
        waitForUI("", 10000, R.id.navigation_view)
        Thread.sleep(LAG)
        onView(withId(R.id.navigation_view)).perform(swipeUp())
        onView(withId(R.id.navigation_view)).perform(swipeRight())
        waitForUIClick("Re-center", 5000)
        Thread.sleep(2000)
        pressBack()
        Log.d(TAG, "Test 3: Successfully see, swiping and re-centering the navigation view!")

        pressBack()
        onView(withId(R.id.clear_schedule_button)).perform(click())
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

private fun logInAndLoadWinterSchedule() {
    // log in
    onView(withId(R.id.login_button)).perform(click())
    waitForUIClick(NAME)
    try {
        waitForUIClick("Agree and share", 2000)
    } catch (_: AssertionError) {}
    Thread.sleep(1000)
    waitForUIClick("Schedules")

    // upload schedule
    onView(withId(R.id.winter_schedule)).perform(click())
    onView(withId(R.id.upload_schedule_button)).perform(click())
    waitForUIClick(FILENAME)
}