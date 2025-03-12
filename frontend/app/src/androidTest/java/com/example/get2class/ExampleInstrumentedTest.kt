package com.example.get2class

import android.util.Log
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
import org.junit.Assert.assertNotNull
import org.junit.Before
import org.junit.Rule
import org.junit.Test
import org.junit.runner.RunWith


val userName = "Hardy Huang"

/**
 * Instrumented test, which will execute on an Android device.
 */
@RunWith(AndroidJUnit4::class)
@LargeTest
class E2EEspressoTest {

    // reset location permissions for testing both success and failure scenarios
    @Before
    fun setUp() {
        revokeLocationPermission()
        Thread.sleep(1000)
    }

    @get:Rule
    val activityRule = ActivityScenarioRule(LoginActivity::class.java)

    @Test fun uploadScheduleTest() {
        val lag = 8000.toLong()

        // Log in and navigate to schedules
        onView(withId(R.id.login_button)).perform(click())
        Thread.sleep(lag)
        ui_click(userName)
        Thread.sleep(lag)
        onView(withId(R.id.schedules_button)).perform(click())

        // Test that uploading to the wrong term returns an empty schedule
        onView(withId(R.id.fall_schedule)).perform(click())
        onView(withId(R.id.upload_schedule_button)).perform(click())
        Thread.sleep(lag)
        ui_click("View_My_Courses.xlsx")
        testScheduleLoaded(false)

        pressBack()

        // Test that uploading to the right term works
        onView(withId(R.id.winter_schedule)).perform(click())
        onView(withId(R.id.upload_schedule_button)).perform(click())
        Thread.sleep(lag)
        ui_click("View_My_Courses.xlsx")
        Thread.sleep(lag)
        testScheduleLoaded(true)

        pressBack()

        // Test that the schedule is loaded when returning to the page
        onView(withId(R.id.winter_schedule)).perform(click())
        testScheduleLoaded(true)

        // Test that clearing the schedule works
        onView(withId(R.id.clear_schedule_button)).perform(click())
        testScheduleLoaded(false)
    }

    @Test fun viewRouteTest(){
        logInAndLoadWinterSchedule()

        // 1. The user clicks on View Route
        ui_click("CPEN 321")
        Thread.sleep(2000)
        ui_click("View route to class")
        Thread.sleep(2000)

        // 2. The app prompts the user to grant location permissions if not already granted
        assertTrue("Permission dialog should pop up", uiExistWithText("While using the app"))

        // 2a. The user does not grant location permissions
        ui_click("Don’t allow")
        Thread.sleep(1000)

        // 2a1. If the user denies twice, the app shows a toast to tell the user to enable location permissions in the settings first
        val device = UiDevice.getInstance(InstrumentationRegistry.getInstrumentation())
        val e = device.findObject(UiSelector().text("Please grant Location permissions in Settings to view your routes :/"))
        assertNotNull("Toast should show up", e)

        // 2a2. The app routes the user back to the previous screen
        onView(withId(R.id.route_button)).check(matches(isDisplayed()))
        onView(withId(R.id.check_attendance_button)).check(matches(isDisplayed()))

        // retry step 1 for the success scenario
        ui_click("View route to class")
        Thread.sleep(3000)

        // retry step 2
        assertTrue("Permission dialog should pop up again", uiExistWithText("Don’t allow"))
        ui_click("Only this time")
        Thread.sleep(2000)

        // a navigation dialog will show up if this is the first run
        if(uiExistWithText("Welcome to Google Maps navigation")){
            ui_click("GOT IT")
        }

        Thread.sleep(6000)

        // 3. The user sees their current location and destination location together with the optimal route on the screen
        onView(withId(R.id.navigation_view)).check(matches(isDisplayed()))
    }
}

private fun uiExistWithText(text: String): Boolean{
    // get UI element with the given text
    val device = UiDevice.getInstance(InstrumentationRegistry.getInstrumentation())
    val e = device.findObject(UiSelector().text(text))

    return e.exists()
}

private fun logInAndLoadWinterSchedule(){
    // log in
    onView(withId(R.id.login_button)).perform(click())
    Thread.sleep(3000)
    ui_click(userName)
    Thread.sleep(3000)
    onView(withId(R.id.schedules_button)).perform(click())

    // upload schedule
    onView(withId(R.id.winter_schedule)).perform(click())
    onView(withId(R.id.upload_schedule_button)).perform(click())
    Thread.sleep(3000)
    ui_click("View_My_Courses.xlsx")
    Thread.sleep(3000)
}

private fun revokeLocationPermission(){
    val uiAutomation = InstrumentationRegistry.getInstrumentation().uiAutomation

    uiAutomation.executeShellCommand("pm revoke com.example.get2class android.permission.ACCESS_FINE_LOCATION")
    uiAutomation.executeShellCommand("pm revoke com.example.get2class android.permission.ACCESS_COARSE_LOCATION")
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

fun countOccurrences(text: String, expectedCount: Int) {
    var actualCount = 0
    try {
        // Iterate over all views on the screen
        onView(isRoot()).check { view, _ ->
            // Use TreeIterables to get all views in the hierarchy
            val views = TreeIterables.breadthFirstViewTraversal(view)
            actualCount = views.count { it is android.widget.TextView && it.text == text }
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
    } else {
        onView(withText("CPSC 320")).check(doesNotExist())
        onView(withText("CPEN 321")).check(doesNotExist())
        onView(withText("CPSC 322")).check(doesNotExist())
        onView(withText("Lecture")).check(doesNotExist())
        onView(withText("Laboratory")).check(doesNotExist())
        onView(withText("Discussion")).check(doesNotExist())
    }
}