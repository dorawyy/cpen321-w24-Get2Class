import { CronJob } from 'cron';
import { MongoClient } from "mongodb";
import { LocalDate } from 'js-joda';
import admin from 'firebase-admin'

interface Course {
    name: string;
    daysBool: boolean[]; // Array of booleans for each day of the week (e.g., [true, false, true, ...] for days the course is held)
    startTime: [number, number]; // [hour, minute]
    endTime: [number, number]; // [hour, minute]
    startDate: LocalDate;
    endDate: LocalDate;
    location: string;
    credits: number;
    format: string;
}

const APP_TITLE: string = "Get2Class";
const DEBUG = true;

// type Season = "fallCourseList" | "winterCourseList" | "fallCourseList";

interface UserSchedules {
    [term: string]: CronJob[];
}

// Firebase initialization
const userJobs: Record<string, UserSchedules> = {};


// Initialize Firebase Admin SDK (only once in your project)
var serviceAccount = require("./.service-account.json");

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
});

const messaging = admin.messaging(); // Get the messaging instance

export async function rescheduleAllNotifications(client: MongoClient, sub: any) {
    debugNS("Rescheduling all notifications...");

    // this should be called after a user edits their notification time
    // precondtion: all new values should be updated in the db before calling this function
    ["fallCourseList", "winterCourseList", "summerCourseList"].forEach(term => {
        clearAndScheduleNotifications(client, sub, term);
    });
}

export async function rescheduleNotificationsByTerm(client: MongoClient, sub: any, term: string) {
    debugNS(`Rescheduling notifications for ${term}`);
    
    // this should be called after a user edits a schedule
    // precondition: new schedule values or notification time values have already been updated in the db
    clearAndScheduleNotifications(client, sub, term);
}

export async function clearNotificationsByTerm(client: MongoClient, sub: any, term: string) {
    debugNS(`Rescheduling notifications for ${term}`);
    
    clearNotifications(sub, term);
}

async function clearAndScheduleNotifications(client: MongoClient, sub: any, term: string) {
    if (!["fallCourseList", "winterCourseList", "summerCourseList"].includes(term)) {
        throw new Error("unrecognized term specifier");
    }

    clearNotifications(sub, term);
    scheduleNotifications(client, sub, term);
}

async function clearNotifications(sub: any, term: string) {
    // should only be called by clearAndScheduleNotifications()
    cancelJobsBySeason(sub, term);
}

async function scheduleNotifications(client: MongoClient, sub: any, term: string) { // TODO: add time before notification
    // should only be called by clearAndScheduleNotifications()
    debugNS(`\nScheduling notifications for ${term}`);

    const data = await client.db("get2class").collection("schedules").findOne({ sub: sub });

    if (data != null) {
        const courses = data[term];
        debugNS(`retrieved courses (length ${courses.length})`);
        courses.forEach((courseUnparsed: any) => {
            let course: Course = parseCourse(courseUnparsed);
            const cronExpression = generateCronExpression(course.daysBool, course.startTime);
            scheduleJob(
                sub,
                term,
                cronExpression,
                () => sendNotificationRequest(client, course.name, sub, course.startDate, course.endDate)
            );
        });

        sendNotifReqRightNow(sub, client);

        printJobs();
    } else {
        throw Error("data is null");
    }
}

async function sendNotificationRequest(client: MongoClient, className: string, sub: any, startDate: LocalDate, endDate: LocalDate) {
    let currentDate = LocalDate.now()
    if (currentDate >= startDate && currentDate <= endDate) {
        try {
            debugNS("Sending message request");
            const data = await client.db("get2class").collection("users").findOne({ "sub": sub });
            debugNS("db response:");
            debugNS(data);
            
            // check if noticications are enabled
            if (data?.notificationsEnabled && data?.registrationToken) {
                debugNS("notifications enabled");
                
                // This registration token comes from the client FCM SDKs.
                const registrationToken = data.registrationToken;
                
                // make notification send request
                const message = {
                    notification: {
                        title: APP_TITLE,
                        body: `You need to leave for your class ${className} now`
                    },
                    token: registrationToken
                };
                debugNS("Message:");
                debugNS(message);
            
                // Send a message to the device corresponding to the provided
                // registration token.
                messaging.send(message)
                    .then((response) => {
                        // Response is a message ID string.
                        console.log('Successfully sent message:', response);
                    })
                    .catch((error) => {
                        console.log('Error sending message:', error);
                    });
            } else {
                if (data == null) {
                    console.log("Unable to retrieve user");
                } else if (data?.registrationToken) {
                    console.log("Unable to retrieve registration token");
                }
            }
        } catch(err) {
            console.log(err);
        }
    }
}

function generateCronExpression(days: boolean[], startTime: [number, number]): string {
    // debugNS("\nCreating cron expression...");

    const cronDays = ['1', '2', '3', '4', '5']; // Days of the week in cron (0 = Sunday, 1 = Monday, etc.)
    const cronString = days
      .map((isDayActive, index) => (isDayActive ? cronDays[index] : ''))
      .filter(day => day !== '')
      .join(',');
  
    // The cron expression format: minute hour day-of-month month day-of-week
    let expression = `${startTime[1]} ${startTime[0]} * * ${cronString}`;
    // debugNS(`expression: ${expression} from days and startTime: ${days}, ${startTime}`);
    return expression;
}

function parseCourse(course: any): Course {
    return {
        name: course.name,
        // Convert daysBool string to a boolean array
        daysBool: JSON.parse(course.daysBool),
        // Convert startTime and endTime strings to [number, number]
        startTime: course.startTime
            .slice(1, -1)  // Remove the parentheses (e.g., '(10, 0)' -> '10, 0')
            .split(',')    // Split the string by comma (e.g., '10, 0' -> ['10', '0'])
            .map(Number),  // Convert each item to a number (e.g., ['10', '0'] -> [10, 0])
        endTime: course.endTime
            .slice(1, -1)
            .split(',')
            .map(Number),
        // Convert startDate and endDate string to LocalDate
        startDate: LocalDate.parse(course.startDate),
        endDate: LocalDate.parse(course.endDate),
        location: course.location,
        credits: Number(course.credits),  // Ensure credits is a number
        format: course.format
    };
}

function scheduleJob(
    userId: string,
    term: string,
    cronExpression: string,
    task: () => void
): void {
    if (!userJobs[userId]) {
        userJobs[userId] = {};
    }
    
    if (!userJobs[userId][term]) {
        userJobs[userId][term] = [];
    }
    
    // Schedule the job
    const job = new CronJob(cronExpression, task);
    job.start();
    userJobs[userId][term].push(job);
}

function cancelJobsBySeason(userId: string, term: string): void {
    debugNS(`\nCancelling jobs for ${term}...`);
    debugNS("Current jobs:");
    printJobs();

    if (userJobs[userId]?.[term]) {
        Object.values(userJobs[userId][term]).forEach((job) => job.stop());
        delete userJobs[userId][term];
    }

    printJobs();
}

function printJobs() {
    Object.values(userJobs).forEach(userSchedules => {
        Object.values(userSchedules).forEach(cronJobs => {
            cronJobs.forEach(cronJob => {
                debugNS(cronJob);
            });
        });
    });
}

// function scheduleBedtimeJob(sub: string, client: any): void {
//     // Define course and other parameters
//     let name = "Bedtime";
//     let startDate = LocalDate.parse('2025-01-01');
//     let endDate = LocalDate.parse('2025-12-01');

//     // const sub = "110468492086813700650";

//     // Cron expression for 9:20 PM every Sunday
//     const cronExpression = '31 21 * * 0'; // 9:20 PM on Sunday

//     // Task to be executed
//     const task = () => {
//         sendNotificationRequest(client, name, sub, startDate, endDate);
//     };

//     // Assuming `userId` and `term` are defined
//     const userId = 'someUserId'; // Replace with actual user ID
//     const term = 'Spring 2025'; // Replace with actual term

//     // Call the scheduleJob function to schedule the task
//     scheduleJob(userId, term, cronExpression, task);
// }

function sendNotifReqRightNow(sub: string, client: any): void {
    let name = "Bedtime";
    let startDate = LocalDate.parse('2025-01-01');
    let endDate = LocalDate.parse('2025-12-01');

    sendNotificationRequest(client, name, sub, startDate, endDate);
}


function debugNS(message: any): void {
    if (DEBUG) {
        console.log(message);
    }
}