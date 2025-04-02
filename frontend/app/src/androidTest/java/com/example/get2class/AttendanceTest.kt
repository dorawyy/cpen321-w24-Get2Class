package com.example.get2class

import android.util.Log
import android.view.View
import androidx.test.espresso.Espresso.onView
import androidx.test.espresso.Espresso.pressBack
import androidx.test.espresso.NoMatchingViewException
import androidx.test.espresso.action.ViewActions.click
import androidx.test.espresso.assertion.ViewAssertions.matches
import androidx.test.espresso.matcher.ViewMatchers.isDisplayed
import androidx.test.espresso.matcher.ViewMatchers.withId
import androidx.test.espresso.matcher.ViewMatchers.withText
import androidx.test.ext.junit.rules.ActivityScenarioRule
import androidx.test.ext.junit.runners.AndroidJUnit4
import androidx.test.filters.LargeTest
import androidx.test.platform.app.InstrumentationRegistry
import androidx.test.uiautomator.UiDevice
import androidx.test.uiautomator.UiSelector
import junit.framework.TestCase.assertTrue
import org.hamcrest.Description
import org.hamcrest.Matcher
import org.hamcrest.TypeSafeMatcher
import org.junit.Rule
import org.junit.Test
import org.junit.runner.RunWith
import androidx.test.uiautomator.UiObjectNotFoundException
import org.junit.FixMethodOrder
import org.junit.runners.MethodSorters


private const val NAME = "Lucas"
private const val FILENAME = "View_My_Courses.xlsx"
private const val LAG: Long = 8000
private const val TAG = "AttendanceTest"

// Instrumented test, which will execute on the emulated Pixel 9.
@RunWith(AndroidJUnit4::class)
@LargeTest
@FixMethodOrder(MethodSorters.NAME_ASCENDING)
class AttendanceTest {

    @get:Rule
    val activityRule = ActivityScenarioRule(LoginActivity::class.java)

    @Test
    fun attendanceTest() {
        logInAndLoadWinterSchedule()

        // Select CPSC 320
        onView(withIndex(withText("CPSC 320"), 0)).perform(click())

        // Case where year is wrong
        incrementMonth(-4, 1)
        onView(withId(R.id.check_attendance_button)).perform(click())
        onView(withText("You don't have this class this year")).check(matches(isDisplayed()))
        Log.d(TAG, "Test 2: Successfully detect that the user tries to check in in a wrong year!")

        // Case where term is wrong
        incrementMonth(5, 1)
        onView(withId(R.id.check_attendance_button)).perform(click())
        onView(withText("You don't have this class this term")).check(matches(isDisplayed()))
        Log.d(TAG, "Test 2: Successfully detect that the user tries to check in in a wrong term!")

        // Case where day is wrong
        incrementMonth(-1, 1)
        onView(withId(R.id.check_attendance_button)).perform(click())
        onView(withText("You don't have this class today")).check(matches(isDisplayed()))
        Log.d(TAG, "Test 2: Successfully detect that the user tries to check in in a wrong day!")

        // Case where too early
        incrementMonth(0, 2)
        setTime(9, 45, "AM")
        onView(withId(R.id.check_attendance_button)).perform(click())
        onView(withText("You are too early to check into this class!")).check(matches(isDisplayed()))
        Log.d(TAG, "Test 2: Successfully detect that the user tries to check in when it is too early!")

        // Case where too late
        setTime(10, 55, "AM")
        onView(withId(R.id.check_attendance_button)).perform(click())
        onView(withText("You missed your class!")).check(matches(isDisplayed()))
        Log.d(TAG, "Test 2: Successfully detect that the user tries to check in when it is too late!")

        // Case where everything is right
        setTime(9, 55, "AM")
        onView(withId(R.id.check_attendance_button)).perform(click())
        grantLocationPermissions()
        waitForUI("You gained 60 Karma!")
        Log.d(TAG, "Test 2: Successfully check the user in and award appropriate amount of points when everything is right!")

        // Case where you've already signed in
        onView(withId(R.id.check_attendance_button)).perform(click())
        onView(withText("You already checked into this class today!")).check(matches(isDisplayed()))
        Log.d(TAG, "Test 2: Successfully detect that the user tries to check in more than once!")

        pressBack()

        // Case where you were late
        onView(withIndex(withText("CPEN 321"), 1)).perform(click())
        setTime(3, 55, "PM")
        val t1  = System.currentTimeMillis()
        onView(withId(R.id.check_attendance_button)).perform(click())
        waitForUI("You were late by 24 minutes!")
        val t2  = System.currentTimeMillis()
        assertTrue("Attendance check took more than 4s", t2 - t1 < 4000)
        waitForUI("You gained 34 Karma!")
        pressBack()
        Log.d(TAG, "Test 2: Successfully check the user in when they are late and award appropriate amount of points in ${t2 - t1}ms!")

        // Case where location is wrong
        onView(withIndex(withText("CPSC 322"), 0)).perform(click())
        incrementMonth(0, 1)
        setTime(4, 55, "PM")
        onView(withId(R.id.check_attendance_button)).perform(click())
        waitForUI("You're too far from your class!")
        Log.d(TAG, "Test 2: Successfully detect that the user tries to check in when they are too far away from the class!")

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

// Custom Matcher
private fun withIndex(matcher: Matcher<View>, index: Int): Matcher<View> {
    return object : TypeSafeMatcher<View>() {
        var currentIndex = 0
        override fun describeTo(description: Description) {
            description.appendText("with index: $index ")
            matcher.describeTo(description)
        }

        override fun matchesSafely(view: View): Boolean {
            return matcher.matches(view) && currentIndex++ == index
        }
    }
}

private fun incrementMonth(months: Int, day: Int) {
    val device = UiDevice.getInstance(InstrumentationRegistry.getInstrumentation())
    device.pressHome() // Ensure we're starting from the home screen
    device.findObject(UiSelector().text("Settings")).click()

    // Navigate to "Date & time"
    for (i in 0..5) {
        try {
            waitForUIClick("System", 1000)
            break
        } catch (e: AssertionError) {
            device.swipe(
                device.displayWidth / 2,      // Start X: middle of screen
                device.displayHeight * 3 / 4, // Start Y: 3/4 down the screen
                device.displayWidth / 2,      // End X: same horizontal position
                device.displayHeight / 4,     // End Y: 1/4 down the screen
                4                           // Steps: controls speed/smoothness
            )
        }
    }

    device.findObject(UiSelector().text("Date & time")).click()
    device.findObject(UiSelector().text("Date")).click()
    if (months < 0) {
        val leftArrow = device.findObject(UiSelector().resourceId("android:id/prev"))
        for (i in 1..-months) {
            leftArrow.click()
        }
        device.findObject(UiSelector().text(day.toString())).click()
        device.findObject(UiSelector().text("OK")).click()
    } else {
        val rightArrow = device.findObject(UiSelector().resourceId("android:id/next"))
        for (i in 1..months) {
            rightArrow.click()
        }
        device.findObject(UiSelector().text(day.toString())).click()
        device.findObject(UiSelector().text("OK")).click()
    }

    device.pressRecentApps()
    device.pressRecentApps()
    waitForUI("Check in to class")
}

private fun setTime(hour: Int, minute: Int, specifier: String) {
    val device = UiDevice.getInstance(InstrumentationRegistry.getInstrumentation())
    device.pressHome() // Ensure we're starting from the home screen
    device.findObject(UiSelector().text("Settings")).click()

    // Navigate to "Date & time"
    for (i in 0..5) {
        try {
            waitForUIClick("System", 1000)
            break
        } catch (e: AssertionError) {
            device.swipe(
                device.displayWidth / 2,      // Start X: middle of screen
                device.displayHeight * 3 / 4, // Start Y: 3/4 down the screen
                device.displayWidth / 2,      // End X: same horizontal position
                device.displayHeight / 4,     // End Y: 1/4 down the screen
                4                           // Steps: controls speed/smoothness
            )
        }
    }
    device.findObject(UiSelector().text("Date & time")).click()
    device.findObject(UiSelector().text("Time")).click()
    Thread.sleep(250)
    Log.d("test", "setting time")
    if (hour == 9) {
        device.click(300, 1261)
    } else if (hour == 10) {
        device.click(334, 1139)
    } else if (hour == 3) {
        device.click(780, 1255)
    } else if (hour == 4) {
        device.click(736, 1377)
    }
    Thread.sleep(250)
    if (minute == 45) {
        device.click(300, 1261)
    } else if (minute == 55) {
        device.click(419, 1057)
    } else if (minute == 25) {
        device.click(658, 1465)
    }

    device.findObject(UiSelector().text(specifier)).click()
    device.findObject(UiSelector().text("OK")).click()

    device.pressRecentApps()
    device.pressRecentApps()
    waitForUI("Check in to class")
}

private fun grantLocationPermissions() {
    val device = UiDevice.getInstance(InstrumentationRegistry.getInstrumentation())
    try {
        waitForUI("Only this time", 4000)
        device.findObject(UiSelector().text("Only this time")).click()
        onView(withId(R.id.check_attendance_button)).perform(click())
    } catch (e: AssertionError) {
        // Pass
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