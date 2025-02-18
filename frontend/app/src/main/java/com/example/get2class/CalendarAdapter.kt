package com.example.get2class

import android.content.Context
import android.graphics.Color
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.TextView
import androidx.recyclerview.widget.RecyclerView

class CalendarAdapter(
    private val cells: List<Pair<Int, Int>>,  // (day, halfHourIndex)
    private val eventsMap: Map<Pair<Int, Int>, Course?>
) : RecyclerView.Adapter<CalendarCellViewHolder>() {

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): CalendarCellViewHolder {
        val view = LayoutInflater.from(parent.context).inflate(R.layout.calendar_cell, parent, false)
        view.layoutParams.height = 30.dpToPx(parent.context) // Enforce a fixed height
        return CalendarCellViewHolder(view)
    }

    private fun Int.dpToPx(context: Context): Int {
        return (this * context.resources.displayMetrics.density).toInt()
    }

    override fun onBindViewHolder(holder: CalendarCellViewHolder, position: Int) {
        val (dayOfWeek, halfHourIndex) = cells[position]
        val course = eventsMap[dayOfWeek to halfHourIndex]

        if (course != null) {
            holder.cellText.text = course.name.substringBefore("-")
            if (position > 0) {
                val prevCourse = eventsMap[dayOfWeek to halfHourIndex - 1]
                if (prevCourse != null && prevCourse.name == course.name && prevCourse.format == course.format) {
                    holder.cellText.text = course.format
                    if (position > 1) {
                        val prevPrevCourse = eventsMap[dayOfWeek to halfHourIndex - 2]
                        if (prevPrevCourse != null && prevPrevCourse.name == course.name && prevPrevCourse.format == course.format) {
                            holder.cellText.text = ""
                        }
                    }
                }
            }
            holder.cellFrame.setBackgroundColor(Color.parseColor("#B2FF59"))
            holder.bottomBorder.visibility = View.GONE
            holder.cellFrame.setOnClickListener {
                // TODO: handle click, e.g. open detail screen
            }
        } else {
            holder.cellText.text = ""
            holder.cellFrame.setBackgroundColor(Color.WHITE)
            holder.cellFrame.setOnClickListener(null)
        }
    }

    override fun getItemCount() = cells.size

    fun timeToIndex(hour: Int, minute: Int): Int {
        // e.g. hour=8, minute=30 => (8-8)*2 + 1 = 1
        //      hour=9, minute=0 => (9-8)*2 + 0 = 2
        return (hour - 8) * 2 + (minute / 30)
    }
}

class CalendarCellViewHolder(itemView: View) : RecyclerView.ViewHolder(itemView) {
    val cellText: TextView = itemView.findViewById(R.id.cellTextView)
    val cellFrame: View = itemView.findViewById(R.id.cellFrame) // Added this line
    val bottomBorder: View = itemView.findViewById(R.id.bottomBorder) // Added border reference
}