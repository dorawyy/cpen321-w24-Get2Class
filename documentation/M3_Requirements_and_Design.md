# M3 - Requirements and Design

## 1. Change History
1. Updated section 3.1, on February 28. 
    - Updated the Use-Case Diagram to use verbs in accordance with M3 feedback.
    - Changed includes to extends to accurately depict relationships.
2. Updated section 3.3, 2, on February 28.
    - Removed create schedule use case since this is now done automatically upon account creation.
    - Added language to describe Fall, Winter, Summer schedule format.
    - Changed **import** to **upload** and **delete** to **clear** to accurately depict actions.
    - Changed **csv** to **xlsx** since Workday no longer allows csv download.
    - Removed failure scenario for clear schedule in accordance with M3 feedback.
3. Updated section 3.3, 3, on February 28.
    - Removed attendance checking as that is a separate feature.
4. Updated section 3.5, 3, on February 28.
    - Added further justification to NFRs 1 and 2 in accordance with M3 feedback.
    - Removed NFR 3 as it was extraneous and not justifiable.
5. Updated section 4, on February 28.
    - Changed **username** to **sub** (subject) in many places as this is the unique identifier provided by Google Authentication that we are using to identify user data in our data bases.

## 2. Project Description
Get2Class is a gamified calendar to help students get to class on time. The main target audience for this app will be UBC students and professors. The main problem we are trying to solve is simplifying the Workday Student calendar as it is unintuitive and difficult to use. We will make it easy to set up your calendar using data from Workday. It can be difficult, especially for first-year’s, to find your classes using the building acronym on Workday. We will provide maps and walking routes. Additionally, we want to help motivate students to be punctual and attend their classes. Our application aims to solve this by implementing a notification and points system that helps and motivates users to go to classes and provides best routes to reach their next class.

## 3. Requirements Specification
### **3.1. Use-Case Diagram**
![Get2Class Use-Case Diagram](./images/CPEN321_Use_Case_Diagram_Image.webp)

### **3.2. Actors Description**
1. **User**: The User is a student/professor which utilizes the application to help get them to their next class.
2. **Google Maps API**: The Google Maps API is the actor which will display locations and routes for the user. Additionally, this API will be utilized by the "View Route" and "Check Attendance" use case.
3. **Google Sign In API**: The Google Sign In API is the actor which authenticates users into the application. Additionally, this API will be utilized by the "User Login and Authentication" use case.

### **3.3. Functional Requirements**
<a name="fr1"></a>

1. **User Login and Authentication** 
    - **Overview**:
        1. Sign In to Account: System must allow user to utilize external authentication to login to the app
        2. Log Out of Account: System must allow user to log out of the app (which utilizes the external authentication)     
    - **Detailed Flow for Each Independent Scenario**: 
        1. **Sign In to Account**<a name="fr1_1"></a>:
            - **Description**: The user will utilize an external authentication API such as Google Sign In API to log themselves into the app with their credentials as a user.
            - **Primary actor(s)**: User, Google Sign In API
            - **Main success scenario**:
                1. User will click on the Google Sign In button
                2. A popup/rerouting of the page will occur providing the user a screen to enter their Google credentials into a box
                3. Once the user hits the Login button they will then be routed to the home page of the application
            - **Failure scenario(s)**:
                - 2a. The user enters invalid credentials
                    - 2a1. The app routes the user back to log in screen
                    - 2a2. An error message is displayed telling the user of the error (e.g. error getting credentials)
                    - 2a3. The app prompts the user to try to log in again
        2. **Log Out of Account**<a name="fr1_2"></a>:
            - **Description**: The user will utilize the external authentication API such as Google Sign In API to log themselves out of the app
            - **Primary actor(s)**: User, Google Sign In API
            - **Main success scenario**:
                1. User will click on the Log Out button
                2. A rerouting of the page will occur which brings the user back to the login page of the app
            - **Failure scenario(s)**:
                - N/A
    
2. **Manage Schedules**
    - **Overview**:
        1. Upload Schedule: The system must allow the user to upload their schedule from Workday as an xlsx file
        2. View Schedule: The system must allow the user to view their schedule in a clear and understandable format
        3. Clear Schedule: The system must allow the user to clear an existing schedule
    - **Detailed Flow for Each Independent Scenario**:
        1. **Upload Schedule**<a name="fr2_2"></a>:
            - **Description**: The user can upload their own schedule from Workday as a xlsx file to one of their three schedules: Fall, Winter, and Summer
            - **Primary actor(s)**: User
            - **Main success scenario**:
                1. The user chooses which schedule they want to set
                2. The user will then click on the Upload Schedule button
                3. A popup or page reroute will occur requesting the user to upload a (valid) .xlsx file (from Workday)
                4. Once the user successfully uploads an .xlsx file of their schedule, the blank schedule will become populated with the users uploaded schedule 
            - **Failure scenario(s)**:
                - 3a. The user uploads a non-valid or non .xlsx file
                    - 3a1. An error message is displayed telling the user that the uploaded file is not valid
                    - 3a2. The app will prompt the user to upload a valid schedule again
        2. **View Schedule**<a name="fr2_3"></a>:
            - **Description**: The user can view their schedules and a particular schedule
            - **Primary actor(s)**: User
            - **Main success scenario**:
                1. The user selects (clicks on) one schedule
                2. The app opens up the schedule for the user to view
            - **Failure scenario(s)**:
                - N/A
        3. **Clear Schedule**<a name="fr2_4"></a>:
            - **Description**: The user can clear their existing schedules
            - **Primary actor(s)**: User
            - **Main success scenario**:
                1. The user selects one schedule (Fall, Winter, or Summer)
                2. The app pops up a warning message for deleting the selected schedule
                3. If the user hits Confirm, the app clears the schedule and the warning is dismissed
            - **Failure scenario(s)**:
                - N/A

3. **View Map/Route**
    - **Overview**:
        1. View Route: The system must display to the user a route to their next class
    - **Detailed Flow for Each Independent Scenario**:
        1. **View Route**<a name="fr3_1"></a>:
            - **Description**: The user can view the optimal route to the next class based on their schedule and the current location
            - **Primary actor(s)**: User, Google Maps API
            - **Main success scenario**:
                1. The user clicks on View Route
                2. The app prompts the user to grant location permissions if not already granted
                3. The user sees their current location and destination location together with the optimal route on the screen
            - **Failure scenario(s)**:
                - 2a. The user does not grant location permissions
                    - 2a1. The app prompts the user for permissions again with rationale
                    - 2a2. If the user denies twice, the app shows a dialog to tell the user to enable location permissions in the settings first
                    - 2a3. The app routes the user back to the previous screen

4. **Manage User Settings**
    - **Overview**:
        1. View Profile and Settings: The system must allow the user to view their profile and settings
        2. Update Notifications: The system must allow the user to manage their notification settings
    - **Detailed Flow for Each Independent Scenario**:
        1. **View Profile and Settings**<a name="fr4_1"></a>:
            - **Description**: The user can view their profile and accumulated points (karma)
            - **Primary actor(s)**: User
            - **Main success scenario**:
                1. The user clicks on their profile
                2. The app routes them to their profile page
            - **Failure scenario(s)**:
                - N/A
        2. **Update Settings**<a name="fr4_2"></a>:
            - **Description**: The user can change their notification preferences
            - **Primary Actor(s)**: User
            - **Main success scenario**:
                1. The user clicks on the notification settings
                2. The apps routes them to the notification settings screen
                3. The app prompts the user to grant notifications permissions if not already granted
                3. The user can toggle the Notifications option on or off
            - **Failure scenario(s)**:
                - 3a. The user does not grant notifications permissions
                    - 3a1. The app prompts the user for permissions again with rationale
                    - 3a2. If the user denies twice, the app shows a dialog to tell the user to enable notifications permissions in the settings first
                    - 3a3. The app routes the user back to the previous screen

5. **Check Attendance**
    - **Overview**:
        1. Check Attendance: The system must allow the user to check themselves into the class to obtain their points (karma)
    - **Detailed Flow for Each Independent Scenario**:
        1. **Check Attendance**<a name="fr5_1"></a>:
            - **Description**: The user can check themselves in when they arrive at the classroom and the system will provide to the user points (karma)
            - **Primary actor(s)**: User, Google Maps API
            - **Main success scenario**:
                1. User clicks on the Check In button
                2. System will check that the user is in the right location within the allotted/right time
                3. System grants user points (karma)
            - **Failure scenario(s)**:
                - 2a. User is not in right location but within the allotted time
                    - 2a1. A popup message will occur notifying the user that they are not in the right location of their class location
                - 2b. User is in the right location but not within the allotted time
                    - 2b1. A popup message will occur notifying the user that they are not within the right location neither are they within the allotted time
                - 2c. User is not in the right location neither are they within the allotted time
                    - 2c1. A popup message will occur notifying the user that they are not within the right location neither are they within the allotted time

### **3.4. Screen Mockups**
N/A

### **3.5. Non-Functional Requirements**

1. **Schedule Usability** <a name="nfr1"></a>
    - **Description**: All schedules operations (upload, view, clear) should be processed and reflected on the screen within 3 seconds of the user action
    - **Justification**: Quick schedule display avoids user dissatisfaction and saves time for busy professors and students to check the time and location for their upcoming classes. According to https://think.storage.googleapis.com/docs/mobile-page-speed-new-industry-benchmarks.pdf, as page load time goes from 1s to 3s, the probability of bounce increases 32%.
2. **Location Accuracy** <a name="nfr2"></a>
    - **Description**: The user's location should be track within a radius of 50 meters from the actual location
    - **Justification**: Accurate location tracking helps provide the optimal route, which is important for professors and students to get to class on time. This also ensures fairness for awarding and deducting points (karma). Our testing found that inside buildings on campus you can be up to 50m away from the building's google maps location, so we need precise location data to keep the valid radius small.


## 4. Designs Specification
### **4.1. Main Components**
1. **Schedule**
    - **Purpose**: Manages schedule data and interacts with the schedule database/collection
    - **Interfaces**:
        1. List\<Schedule> getAllSchedules()
            - **Purpose**: Retrieves all the user's schedules as a list
        2. Schedule getSpecificSchedule(String id)
            - **Purpose**: Retrieves a specific schedule of the user given the schedule id and returns back a schedule to the user
        3. void addSchedule(String name)
            - **Purpose**: Creates a blank schedule with a given name
        4. void removeSchedule(String id)
            - **Purpose**: Removes a schedule with a given id
        5. void importSchedule(File xlsxFile, String id)
            - **Purpose**: Import a Workday schedule as a xlsx file onto a newly created blank schedule by the user
2. **User**
    - **Purpose**: Manages the user settings and provides communication to user database/collection which stores the username, sub, points (karma), and settings of a particular user
    - **Interfaces**:
        1. void createNewUser()
            - **Purpose**: Creates a new user entry into the database if a newly logged in user does not exist in the database
        2. String findExistingUser(String sub)
            - **Purpose**: Checks if a logged in user exists in the database already
        3. int getKarma(String sub)
            - **Purpose**: Fetches the points (karma) of a given user
        4. void updateKarma(String sub, int karma)
            - **Purpose**: This increases or decreases the points (karma) of a user based on the location and time
        5. List\<NotificationSetting> getNotificationSettings(String sub)
            - **Purpose**: Retrieves all notification settings of a specific user
        6. void updateSettings(String sub, bool toggleNotification, int remindInMins)
            - **Purpose**: Updates the settings of a particular user (e.g. turning "On"/"Off" notifications and setting how much time before a class a user wants to be notified)
3. **Notifications**
    - **Purpose**: Schedules push notifications based of the schedules according to the users settings to remind them to leave for class
    - **Interfaces**:
        1. TODO
4. **Additional Component (not back end related) For Reference: Front End**
    - **Purpose**: Manages front end interactions with all other back end components of the app
    - **Interfaces**:
        1. void routeToSchedule()
            - **Purpose**: This routes the user to the Schedule page and allows the user to view their schedules
        2. void routeToProfileAndSettings()
            - **Purpose**: This routes the user to the Profile and Settings page and allows the user to view their profile and Karma points, as well as their current user settings
        3. void signIn()
            - **Purpose**: Wrapper function that calls the Google sign in API. It allows the user to sign in with their Google account
        4. void signOut()
            - **Purpose**: Wrapper function that calls the Google sign in API. It allows the user to log out of their account
        5. String checkAttendance(String sub, List\<double> userCoordinates, double userTime, String id)
            - **Purpose**: Checks if the user is in class based on the sub, user current location, the current time of the class, and the schedule ID that the user is interacting with


### **4.2. Databases**
1. **Schedule**
    - **Purpose**: Stores the schedules of a user along with each of the schedule's classes
2. **User**
    - **Purpose**: Stores all user information (e.g. username, sub, points (karma), and settings)

### **4.3. External Modules**
1. **Google Sign In API** 
    - **Purpose**: This API is utilized to authenticate a user and log a user out
2. **Google Maps API**
    - **Purpose**: This API is used to display the map and determine the best route to the next class
3. **Firebase Cloud Messaging API**
    - **Purpose**: Provides push notifications within the application for users

### **4.4. Frameworks**
1. **Amazon Web Services (AWS) EC2**
    - **Purpose**: Used to host the application's server back end so that the front end application can communicate and exchange data with the APIs and database
    - **Reason**: We need a running EC2 instance (computer) in order to support our client-server architecture 

2. **Amazon Web Services (AWS) API Gateway**
    - **Purpose**: Used to link our EC2 server routes to a central API that the client (front end application) can call
    - **Reason**: AWS API Gateway will help our front end application call the routes on our EC2 through HTTPS rather than HTTP

3. **Docker**
    - **Purpose**: Synchronize our back end server and database to launch and connect together simultaneously
    - **Reason**: Simplifies the process of managing our EC2 instance which hosts all of our back end related technology (e.g. Express and MongoDB)

4. **MongoDB**
    - **Purpose**: Stores our model (persistence) layer related to Schedule and User data
    - **Reason**: MongoDB was used in Milestone 1 and will be simple to organize our data in a format that we are already familiar with

5. **Firebase Cloud Messaging API**
    - **Purpose**: Provides push notifications for users for when they should leave for their classes 
    - **Reason**: Firebase Cloud Messaging (FCM) already has existing integrations with Android applications, so this will simplify the implementation process for notifications

### **4.5. Dependencies Diagram**
![Get2Class Dependency Diagram](./images/CPEN321_Dependency_Diagram_Image.webp)

### **4.6. Functional Requirements Sequence Diagram**
1. [**Sign In to Account**](#fr1_1)\
![Sign In Sequence Diagram](./images/CPEN321_SignIn_Seq_Diagram_Image.webp)
2. [**Log Out of Account**](#fr1_2)\
![Sign Out Sequence Diagram](./images/CPEN321_SignOut_Seq_Diagram_Image.webp)
3. [**Create Schedule**](#fr2_1)\
![Create Schedule Sequence Diagram](./images/CPEN321_CreateSchedule_Seq_Diagram_Image.webp)
4. [**Import Schedule**](#fr2_2)\
![Import Schedule Sequence Diagram](./images/CPEN321_ImportSchedule_Seq_Diagram_Image.webp)
5. [**View Schedule**](#fr2_3)\
![View Schedule Sequence Diagram](./images/CPEN321_ViewSchedule_Seq_Diagram_Image.webp)
6. [**Delete Schedule**](#fr2_4)\
![Delete Schedule Sequence Diagram](./images/CPEN321_DeleteSchedule_Seq_Diagram_Image.webp)
7. [**View Route**](#fr3_1)\
![View Route Sequence Diagram](./images/CPEN321_ViewRoute_Seq_Diagram_Image.webp)
8. [**View Profile and Settings**](#fr4_1)\
![View Profile and Settings Sequence Diagram](./images/CPEN321_ViewProfileAndSettings_Seq_Diagram_Image.webp)
9. [**Update Settings**](#fr4_2)\
![Update Settings Sequence Diagram](./images/CPEN321_UpdateSettings_Seq_Diagram_Image.webp)
10. [**Check Attendance**](#fr5_1)\
![Check Attendance Sequence Diagram](./images/CPEN321_CheckAttendance_Seq_Diagram_Image.webp)

### **4.7. Non-Functional Requirements Design**
1. [**Schedule Usability**](#nfr1)
    - **Validation**: We can set up a stopwatch and time how long each operation on the schedule takes. Then we check if the response time is less than 3 seconds.
2. [**Location Accuracy**](#nfr2)
    - **Validation**: We can open the app and check the attendance at different distance (e.g. 50m, 80m, 120m, 150m etc.) away from the location of the next class. Then by checking the attendance and Karma points, we know the location accuracy


### **4.8. Main Project Complexity Design**
**Check Attendance**
- **Description**: Check whether a user is in the correct class location at the correct time and manages the karma score of the user accordingly.
- **Why complex?**: This is complex because we have to synchronize all back end components of the app along with the front end Google Maps API. We must utilize the location of the user, the location of the classroom, the time the class starts (obtained from the Schedule DB), the time of the user, and adjust the karma score to give to the user based on several cases.
- **Design**:
    - **Input**: The client's sub, the client's current location as GPS coordinates, the client's current time, and the schedule ID the user is interacting with. 
    - **Output**: A message will be provided back to the front end for the client. The back end will update the karma based on the conditions.
    - **Main computational logic**:
        - Determining the class which the user is checking into: If a class is currently taking place or starting in less than 10 minutes, we will select this as the class that the user wants to check into. Otherwise, we will select whichever class is closest in time.
        - Conditional cases for determining which check in status to provide for the user:
            - If the class has already been marked as attended, notify the user
            - If it is before the class by more than 10 minutes, they are too early
            - If it is after the class, they are too late
            - If they are more than 50 meters from the class location, they are marked as in the wrong location
            - If it is mid way through the class, they are late. Mark the class as attended and add less karma according to how late they are
            - Otherwise, they are considered on time for up to 10 minutes and they will be marked as attended and will be awarded the full number of karma 
        - Class attendance will reset at the end of every day
    - **Pseudo-code**:
        ```
        String checkAttendance(course, term, sub):
            requestLocationUpdates()
            clientTime = getCurrentTime()
            clientDate = getCurrentDate()
            clientLocation = requestCurrentLocation()
            if(!checkTermAndYear(course, term)):
                return "You don't have this class this term"
            if (clientDate < 1 || clientDate > 5 || !course.days[clientDate - 1])
                return "You don't have this class today"
            if (course.attended):
                return "You already signed in to this class today!"
            elif (clientTime < course.startTime - 10):
                return "You are too early!"
            elif (course.endTime <= clientTime):
                return "You missed class!"
            elif (75 < coordinatesToDistance(clientLocation, course.location)):
                return "You are not in the correct location!"
            elif (course.startTime < clientTime):
                int lateness = clientTime - course.startTime
                int classLength = course.endTime - course.startTime
                int karma = (10 * (1 - lateness / classLength) * (course.credits + 1))
                updateKarma(sub, karma)
                updateAttendance(sub, course, true)
                return "You were late to class!"
            else:
                updateKarma(sub, 15 * (course.credits + 1))
                updateAttendance(sub, course, true)
                return "Welcome to class!"

        
            cron.schedule('0 0 * * *', async () => {
                try {
                    const allSchedules = await client.db("get2class").collection("schedules").find().toArray();
                    console.log(allSchedules);
                    for (let i = 0; i < allSchedules.length; i++) {
                        if (allSchedules[i]["fallCourseList"].length != 0) {
                            for (let j = 0; j < allSchedules[i]["fallCourseList"].length; j++) {
                                allSchedules[i]["fallCourseList"][j]["attended"] = false;
                            }
                        }
                        if (allSchedules[i]["winterCourseList"].length != 0) {
                            for (let j = 0; j < allSchedules[i]["winterCourseList"].length; j++) {
                                allSchedules[i]["winterCourseList"][j]["attended"] = false;
                            }
                        }
                        if (allSchedules[i]["summerCourseList"].length != 0) {
                            for (let j = 0; j < allSchedules[i]["summerCourseList"].length; j++) {
                                allSchedules[i]["summerCourseList"][j]["attended"] = false;
                            }
                        }
                    }

                    for (let i = 0; i < allSchedules.length; i++) {
                        const filter = {
                            sub: allSchedules[i]["sub"]
                        };

                        const document = {
                            $set: {
                                fallCourseList: allSchedules[i]["fallCourseList"],
                                winterCourseList: allSchedules[i]["winterCourseList"],
                                summerCourseList: allSchedules[i]["summerCourseList"]
                            }
                        };

                        const updatedData = await client.db("get2class").collection("schedules").updateOne(filter, document);
                    }
                } catch (err) {
                    console.error(err);
                }
            }, {
                timezone: "America/Los_Angeles"
            });
        ```


## 5. Contributions
- Trevor Dang
    - Worked on all sections for 3 and all sections for 4. Helped ensure consistency in diagrams, created functional requirements, and ensure main components and interfaces align with scope of project.
    - Time spent: ~16 hours
- Yuanyan Hardy Huang
    - Co-drafted sections 2, 3.3, 3.5, 4.1 ~ 4.3 and M3 reflections
    - Time spent: ~7 hours
- Lucas Beitel
    - Drafted sections 4.1, 4.5, 4.6, 4.8. Helped with planning, finalizing, and proofreading
    - Time spent: ~11 hours
- Luke Matson
    - Drafted sequence diagrams, helped with general problem solving, design decisions, and proof-reading. Created slide deck
    - Time spent: ~7 hours
