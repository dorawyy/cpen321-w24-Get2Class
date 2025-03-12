package com.example.get2class

import android.os.IBinder
import android.util.Log
import android.view.View
import android.view.WindowManager
import androidx.test.espresso.Espresso
import androidx.test.espresso.Espresso.onView
import androidx.test.espresso.Espresso.pressBack
import androidx.test.espresso.NoMatchingViewException
import androidx.test.espresso.Root
import androidx.test.espresso.action.ViewActions.click
import androidx.test.espresso.assertion.ViewAssertions.doesNotExist
import androidx.test.espresso.assertion.ViewAssertions.matches
import androidx.test.espresso.matcher.RootMatchers.withDecorView
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
import org.hamcrest.Description
import org.hamcrest.Matcher
import org.hamcrest.TypeSafeMatcher
import org.junit.Rule
import org.junit.Test
import org.junit.runner.RunWith

import org.hamcrest.Matchers.not


/**
 * Instrumented test, which will execute on an Android device.
 */
@RunWith(AndroidJUnit4::class)
@LargeTest
class E2EEspressoTest {

    @get:Rule
    val activityRule = ActivityScenarioRule(LoginActivity::class.java)

    companion object {
        private const val NAME = "Lucas"
        private const val FILENAME = "View_My_Courses.xlsx"
        private const val LAG = 7000.toLong()
    }

    @Test
    fun uploadScheduleTest() {

        // Log in and navigate to schedules
        onView(withId(R.id.login_button)).perform(click())
        Thread.sleep(LAG)
        ui_click(NAME)
        Thread.sleep(LAG)
        onView(withId(R.id.schedules_button)).perform(click())

        // Test that uploading to the wrong term returns an empty schedule
        onView(withId(R.id.fall_schedule)).perform(click())
        onView(withId(R.id.upload_schedule_button)).perform(click())
        Thread.sleep(LAG)
        ui_click(FILENAME)
        testScheduleLoaded(false)

        pressBack()

        // Test that uploading to the right term works
        onView(withId(R.id.winter_schedule)).perform(click())
        onView(withId(R.id.upload_schedule_button)).perform(click())
        Thread.sleep(LAG)
        ui_click(FILENAME)
        Thread.sleep(LAG)
        testScheduleLoaded(true)

        pressBack()

        // Test that the schedule is loaded when returning to the page
        onView(withId(R.id.winter_schedule)).perform(click())
        testScheduleLoaded(true)

        // Test that clearing the schedule works
        onView(withId(R.id.clear_schedule_button)).perform(click())
        testScheduleLoaded(false)
    }


    @Test
    fun attendanceTest() {
        // Log in and navigate to winter schedule
        onView(withId(R.id.login_button)).perform(click())
        Thread.sleep(LAG)
        ui_click(NAME)
        Thread.sleep(LAG)
        onView(withId(R.id.schedules_button)).perform(click())
        onView(withId(R.id.winter_schedule)).perform(click())

        // Upload the schedule
        onView(withId(R.id.upload_schedule_button)).perform(click())
        Thread.sleep(LAG)
        ui_click(FILENAME)

        onView(withIndex(withText("CPSC 320"), 0)).perform(click())

        // Case where year is wrong
        incrementMonth(-3, 1)
        onView(withId(R.id.check_attendance_button)).perform(click())
        grantLocationPermissions()
        onView(withText("You don't have this class this term")).check(matches(isDisplayed()))

        // Case where term is wrong
        incrementMonth(5, 1)
        onView(withId(R.id.check_attendance_button)).perform(click())
        onView(withText("You don't have this class this term")).check(matches(isDisplayed()))

        // Case where day is wrong
        incrementMonth(-2, 4)
        onView(withId(R.id.check_attendance_button)).perform(click())
        onView(withText("You don't have this class today")).check(matches(isDisplayed()))

        // Case where too early
        incrementMonth(0, 10)
        setTime(9, 45, "AM")
        onView(withId(R.id.check_attendance_button)).perform(click())
        onView(withText("You are too early to check into this class!")).check(matches(isDisplayed()))

        // Case where too late
        setTime(10, 55, "AM")
        onView(withId(R.id.check_attendance_button)).perform(click())
        onView(withText("You missed your class!")).check(matches(isDisplayed()))

        // Case where everything is right
        setTime(9, 55, "AM")
        onView(withId(R.id.check_attendance_button)).perform(click())
        onView(withText("You gained 60 Karma!")).check(matches(isDisplayed()))

        // Case where you've already signed in
        onView(withId(R.id.check_attendance_button)).perform(click())
        onView(withText("You already checked into this class today!")).check(matches(isDisplayed()))

        pressBack()

        // Case where you were late
        onView(withIndex(withText("CPEN 321"), 1)).perform(click())
        setTime(3, 55, "PM")
        onView(withId(R.id.check_attendance_button)).perform(click())
        Thread.sleep(1000)
        Espresso.onIdle()
        onView(withId(R.id.error_message)).check(matches(withText("You gained 34 Karma!")))
        pressBack()

        // Case where location is wrong
        onView(withIndex(withText("CPSC 322"), 0)).perform(click())
        incrementMonth(0, 11)
        setTime(4, 55, "PM")
        onView(withId(R.id.check_attendance_button)).perform(click())
        Thread.sleep(1000)
        onView(withText("You're too far from your class!")).check(matches(isDisplayed()))
    }
}

// Use UIAutomator to click on the file in the system file picker
private fun ui_click(elementText: String) {
    val device = UiDevice.getInstance(InstrumentationRegistry.getInstrumentation())
    val element = device.findObject(UiSelector().text(elementText))
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

// Custom Matcher
fun withIndex(matcher: Matcher<View>, index: Int): Matcher<View> {
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
    Thread.sleep(2000)
    device.swipe(device.displayWidth / 2,      // Start X: middle of screen
        device.displayHeight * 3 / 4, // Start Y: 3/4 down the screen
        device.displayWidth / 2,      // End X: same horizontal position
        device.displayHeight / 4,     // End Y: 1/4 down the screen
        4                           // Steps: controls speed/smoothness
    )
    device.findObject(UiSelector().text("System")).click()
    device.findObject(UiSelector().text("Date & time")).click()

    if (months < 0) {
        device.findObject(UiSelector().text("Date")).click()
        val leftArrow = device.findObject(UiSelector().resourceId("android:id/prev"))
        for (i in 1..-months) {
            leftArrow.click()
        }
        device.findObject(UiSelector().text(day.toString())).click()
        device.findObject(UiSelector().text("OK")).click()
    } else {
        device.findObject(UiSelector().text("Date")).click()
        val rightArrow = device.findObject(UiSelector().resourceId("android:id/next"))
        for (i in 1..months) {
            rightArrow.click()
        }
        device.findObject(UiSelector().text(day.toString())).click()
        device.findObject(UiSelector().text("OK")).click()
    }

    device.pressRecentApps()
    device.pressRecentApps()
    Thread.sleep(3000)
}

private fun setTime(hour: Int, minute: Int, specifier: String) {
    val device = UiDevice.getInstance(InstrumentationRegistry.getInstrumentation())
    device.pressHome() // Ensure we're starting from the home screen
    device.findObject(UiSelector().text("Settings")).click()

    // Navigate to "Date & time"
    Thread.sleep(2000)
    device.swipe(device.displayWidth / 2,      // Start X: middle of screen
        device.displayHeight * 3 / 4, // Start Y: 3/4 down the screen
        device.displayWidth / 2,      // End X: same horizontal position
        device.displayHeight / 4,     // End Y: 1/4 down the screen
        4                           // Steps: controls speed/smoothness
    )

    device.findObject(UiSelector().text("System")).click()
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
    Thread.sleep(3000)
}

private fun grantLocationPermissions() {
    val device = UiDevice.getInstance(InstrumentationRegistry.getInstrumentation())
    Thread.sleep(1000)
    if (device.findObject(UiSelector().text("While using the app")).exists()) {
        device.findObject(UiSelector().text("While using the app")).click()
    }
}