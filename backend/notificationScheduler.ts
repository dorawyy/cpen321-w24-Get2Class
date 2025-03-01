import { MongoClient } from "mongodb";

export async function rescheduleNotifications(client: MongoClient, sub: any, term: String) {
    // clear all scheduled notification request jobs for this calendar

    // reschedule notification request jobs for this calendar
}

export async function sendNotificationRequest(client: MongoClient, body: any) {
    // check if noticications are enabled

    // obtain registration token

    // make notification send request
}