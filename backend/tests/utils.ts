// import { serverReady, cronResetAttendance } from '../../index';
// import { client } from '../../services';
// import { Server } from "http";

export interface User {
    email: string;
    sub: string;
    name: string;
    karma: number;
    notificationTime: number;
    notificationsEnabled: boolean;
}

export interface DBScheduleItem {
    email: string;
    sub: string;
    name: string;
    fallCourseList: Course[];
    winterCourseList: Course[];
    summerCourseList: Course[];
}

export interface Course {
    name: string;
    daysBool: string;  // Consider using `boolean[]` instead if storing actual boolean values
    startTime: string; // Consider using a tuple `[number, number]` if parsing (hours, minutes)
    endTime: string;   // Same as `startTime`
    startDate: string; // Consider `Date` type if parsing
    endDate: string;   // Same as `startDate`
    location: string;
    credits: number;
    format: string;
    attended: string;  // Consider using `boolean` if storing actual boolean values
}

export interface Schedule {
    courses: Course[];
}

export const myUser = {
    email: "asdfasdf@gmail.com",
    sub: "123",
    name: "asdfasdf",
    karma: 0,
    notificationTime: 15,
    notificationsEnabled: true
}

export const myDBScheduleItem = {
    email: myUser.email,
    sub: myUser.sub,
    name: myUser.name,
    fallCourseList: [],
    winterCourseList: [],
    summerCourseList: []
}
  
export const mySchedule = {
    courses: [
        {
            "name": "MATH 101",
            "daysBool": "[true, false, true, false, true]",
            "startTime": "(9, 30)",
            "endTime": "(10, 50)",
            "startDate": "2024-09-05",
            "endDate": "2024-12-10",
            "location": "BuildingA - Room 101",
            "credits": 3.0,
            "format": "Lecture",
            "attended": "false"
        }
    ]
}