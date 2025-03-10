package com.example.get2class

import androidx.test.espresso.Espresso.onView
import androidx.test.espresso.Espresso.pressBack
import androidx.test.espresso.NoMatchingViewException
import androidx.test.espresso.action.ViewActions.click
import androidx.test.espresso.assertion.ViewAssertions.doesNotExist
import androidx.test.espresso.matcher.ViewMatchers.isRoot
import androidx.test.espresso.matcher.ViewMatchers.withId
import androidx.test.espresso.matcher.ViewMatchers.withText
import androidx.test.espresso.util.TreeIterables
import androidx.test.ext.junit.rules.ActivityScenarioRule
import androidx.test.platform.app.InstrumentationRegistry
import androidx.test.ext.junit.runners.AndroidJUnit4
import androidx.test.filters.LargeTest
import androidx.test.uiautomator.UiDevice
import androidx.test.uiautomator.UiSelector
import org.junit.Test
import org.junit.runner.RunWith
import org.junit.Rule

/**
 * Instrumented test, which will execute on an Android device.
 */
@RunWith(AndroidJUnit4::class)
@LargeTest
class E2EEspressoTest {

    @get:Rule
    val activityRule = ActivityScenarioRule(LoginActivity::class.java)

    @Test fun uploadScheduleTest() {
        val lag = 8000.toLong()

        // Log in and navigate to schedules
        onView(withId(R.id.login_button)).perform(click())
        Thread.sleep(lag)
        ui_click("Lucas")
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