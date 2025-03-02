import { CronJob } from 'cron';
import { MongoClient } from "mongodb";
import { LocalDate } from 'js-joda';
import admin from 'firebase-admin'

interface Course {
    name: string;
    days: boolean[]; // Array of booleans for each day of the week (e.g., [true, false, true, ...] for days the course is held)
    startTime: [number, number]; // [hour, minute]
    endTime: [number, number]; // [hour, minute]
    startDate: LocalDate;
    endDate: LocalDate;
    location: string;
    credits: number;
    format: string;
}

type Season = "fallCourseList" | "winterCourseList" | "fallCourseList";

interface UserSchedules {
    [term: string]: CronJob[];
}

const APP_TITLE: string = "Get2Class"
  
// Firebase initialization
const userJobs: Record<string, UserSchedules> = {};

// Initialize Firebase Admin SDK (only once in your project)
if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.applicationDefault(),
    });
}

const messaging = admin.messaging(); // Get the messaging instance

export async function rescheduleAllNotifications(client: MongoClient, sub: any) {
    // this should be called after a user edits their notification time
    // precondtion: all new values should be updated in the db before calling this function
    ["fallCourseList", "winterCourseList", "summerCourseList"].forEach(term => {
        clearAndScheduleNotifications(client, sub, term);
    });
}

export async function rescheduleNotificationsByTerm(client: MongoClient, sub: any, term: string) {
    // this should be called after a user edits a schedule
    // precondition: new schedule values or notification time values have already been updated in the db
    clearAndScheduleNotifications(client, sub, term);
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

async function scheduleNotifications(client: MongoClient, sub: any, term: string) {
    // should only be called by clearAndScheduleNotifications()

    const data = await client.db("get2class").collection("schedules").findOne({ sub: sub });

    if (data != null) {
        const courses = data[term];
        courses.forEach((course: Course) => {
            const cronExpression = generateCronExpression(course.days, course.startTime);
            scheduleJob(
                sub,
                term,
                cronExpression,
                () => sendNotificationRequest(client, course.name, sub, course.startDate, course.endDate)
            );
        });
    } else {
        throw Error("data is null");
    }
}

async function sendNotificationRequest(client: MongoClient, className: string, sub: any, startDate: LocalDate, endDate: LocalDate) {
    let currentDate = LocalDate.now()
    if (currentDate >= startDate && currentDate <= endDate) {
        try {
            const data = await client.db("get2class").collection("users").findOne({ "sub": sub });
            
            // check if noticications are enabled
            if (data?.notificationsEnabled && data?.registrationToken) {
                
                // This registration token comes from the client FCM SDKs.
                const registrationToken = data.registrationToken;
                
                // make notification send request
                const message = {
                    notification: {
                        title: APP_TITLE,
                        body: "You need to leave for your class ${className} now"
                    },
                    token: registrationToken
                };
            
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
                    console.log("error retrieving user");
                } else if (data?.registrationToken) {
                    console.log("error retrieving registration token");
                }
            }
        } catch(err) {
            console.log(err);
        }
    }
}

function generateCronExpression(days: boolean[], startTime: [number, number]): string {
    const cronDays = ['0', '1', '2', '3', '4', '5', '6']; // Days of the week in cron (0 = Sunday, 1 = Monday, etc.)
    const cronString = days
      .map((isDayActive, index) => (isDayActive ? cronDays[index] : ''))
      .filter(day => day !== '')
      .join(',');
  
    // The cron expression format: minute hour day-of-month month day-of-week
    return `${startTime[1]} ${startTime[0]} * * ${cronString}`;
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
    if (userJobs[userId]?.[term]) {
        Object.values(userJobs[userId][term]).forEach((job) => job.stop());
        delete userJobs[userId][term];
    }
}