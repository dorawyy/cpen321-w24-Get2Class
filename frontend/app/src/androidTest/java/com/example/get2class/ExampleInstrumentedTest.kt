package com.example.get2class

import android.util.Log
import android.view.View
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
import org.hamcrest.Description
import org.hamcrest.Matcher
import org.hamcrest.TypeSafeMatcher
import org.junit.Rule
import org.junit.Test
import org.junit.runner.RunWith
import androidx.test.espresso.action.ViewActions.*
import org.junit.FixMethodOrder
import org.junit.runners.MethodSorters


private const val NAME = "Lucas"
private const val FILENAME = "View_My_Courses.xlsx"
private const val LAG = 5000.toLong()

/**
 * Instrumented test, which will execute on an Android device.
 */
@RunWith(AndroidJUnit4::class)
@LargeTest
@FixMethodOrder(MethodSorters.NAME_ASCENDING)
class E2EEspressoTest {

    @get:Rule
    val activityRule = ActivityScenarioRule(LoginActivity::class.java)

    @Test
    fun t1_uploadScheduleTest() {

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
    fun t2_attendanceTest() {
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

        // Select CPSC 320
        onView(withIndex(withText("CPSC 320"), 0)).perform(click())

        // Case where year is wrong
        incrementMonth(-3, 1)
        onView(withId(R.id.check_attendance_button)).perform(click())
        onView(withText("You don't have this class this year")).check(matches(isDisplayed()))

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
        grantLocationPermissions()
        onView(withId(R.id.check_attendance_button)).perform(click())
        Thread.sleep(4000)
        onView(withText("You gained 60 Karma!")).check(matches(isDisplayed()))

        // Case where you've already signed in
        onView(withId(R.id.check_attendance_button)).perform(click())
        onView(withText("You already checked into this class today!")).check(matches(isDisplayed()))

        pressBack()

        // Case where you were late
        onView(withIndex(withText("CPEN 321"), 1)).perform(click())
        setTime(3, 55, "PM")
        onView(withId(R.id.check_attendance_button)).perform(click())
        Thread.sleep(LAG)
        onView(withText("You gained 34 Karma!")).check(matches(isDisplayed()))
        pressBack()

        // Case where location is wrong
        onView(withIndex(withText("CPSC 322"), 0)).perform(click())
        incrementMonth(0, 11)
        setTime(4, 55, "PM")
        onView(withId(R.id.check_attendance_button)).perform(click())
        Thread.sleep(1000)
        onView(withText("You're too far from your class!")).check(matches(isDisplayed()))
    }

    @Test fun t3_viewRouteTest(){
        logInAndLoadWinterSchedule()

        // 1. The user clicks on View Route
        ui_click("CPEN 321")
        Thread.sleep(2000)
        ui_click("View route to class")
        Thread.sleep(3000)

        // 2. The app prompts the user to grant location permissions if not already granted
        if(uiExistWithText("While using the app")){
            // 2a. The user does not grant location permissions
            ui_click("Don’t allow")
            Thread.sleep(2000)

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
        }

        // a navigation dialog will show up if this is the first run
        if(uiExistWithText("Welcome to Google Maps navigation")){
            ui_click("GOT IT")
        }

        Thread.sleep(12000)

        // 3. The user sees their current location and destination location together with the optimal route on the screen
        onView(withId(R.id.navigation_view)).check(matches(isDisplayed()))
        onView(withId(R.id.navigation_view)).perform(swipeUp()).perform(swipeRight())
        Thread.sleep(2000)
        onView(withText("Re-center")).check(matches(isDisplayed()))
        ui_click("Re-center")
        Thread.sleep(2000)
        pressBack()
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
    ui_click(NAME)
    Thread.sleep(5000)
    onView(withId(R.id.schedules_button)).perform(click())

    // upload schedule
    onView(withId(R.id.winter_schedule)).perform(click())
    onView(withId(R.id.upload_schedule_button)).perform(click())
    Thread.sleep(3000)
    ui_click("View_My_Courses.xlsx")
    Thread.sleep(3000)
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
