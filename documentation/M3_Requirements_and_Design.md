# M3 - Requirements and Design

## 1. Change History
<!-- Leave blank for M3 -->

## 2. Project Description
Get2Class is a gamified calendar to help students get to class on time. The main target audience for this app will be UBC students and professors. The main problem we are trying to solve is simplifying the Workday Student calendar as it is unintuitive and difficult to use. We will make it easy to set up your calendar using data from Workday. It can be difficult, especially for first-year’s, to find your classes using the building acronym on Workday. We will provide maps and walking routes. Additionally, we want to help motivate students to be punctual and attend their classes. Our application aims to solve this by implementing a notification and points system that helps and motivates users to go to classes and provides best routes to reach their next class.

## 3. Requirements Specification
### **3.1. Use-Case Diagram**
![Get2Class Use-Case Diagram](./images/CPEN321_Use_Case_Diagram_Image.webp)

### **3.2. Actors Description**
1. **User**: The User is a student/professor which utilizes the application to help get them to their next class.
2. **Workday API**: The Workday API is the actor which will integrate the user's course schedule into the app. Additionally, this API will be utilized by the "Import and View Schedule" use case.
3. **Google Maps API**: The Google Maps API is the actor which will display locations and routes for the user. Additionally, this API will be utilized by the "Display Route to Class" use case.

### **3.3. Functional Requirements**
<a name="fr1"></a>

1. **User Login and Authentication** 
    - **Overview**:
        1. Sign In to Account: System will allow user to utilize external authentication to login to the app 
    
    - **Detailed Flow for Each Independent Scenario**: 
        1. **Sign In to Account**:
            - **Description**: The user will utilize an external authentication API such as Google Signin API to log themselves into the app with their credentials as a user.
            - **Primary actor(s)**: User (Student/Professor) 
            - **Main success scenario**:
                1. Use will click on the Google Signin button
                2. A popup/rerouting of the page will occur providing the user a screen to enter their Google credentials
                3. Once the user hits the Login button they will then be routed to the home page of the application
            - **Failure scenario(s)**:
                - 2a. The user enters invalid credentials
                    - 2a1. The app routes the user back to log in screen
                    - 2a2. An error message is displayed telling the user of the error
                    - 2a3. The app prompts the user to try log in again

        2. ...
    
2. **Import and View Schedule**
    - **Overview**:
        1. Create Schedule: The system must allow the user to generate a blank schedule
        2. Update Schedule: The system must allow the user to import their schedule from Workday
        3. View Schedule: The system must allow the user to view their schedule in a clear and understandable format
        4. Delete Schedule: The system must allow the user to delete an existing schedule
    
    - **Detailed Flow for Each Independent Scenario**:
        1. **Create Schedule**:
            - **Description**: The user can create a blank schedule with a name
            - **Primary actor(s)**: User (Student/Professor)
            - **Main success scenario**:
                1. The user clicks on the Add Schedule button
                2. The app prompts the user to enter a name for the new schedule
                3. Once the user enters the name and hit the Create button, the newly created schdule shows up on the screen
            - **Failure scenario(s)**:
                - 2a. The user enters nothing for the name
                    - 2a2. An error message is displayed telling the user that name cannot be empty
                    - 2a3. The app prompts the user to enter the name again
                - 2b. The user enters a name that conflicts with an existing schedule
                    - 2a2. An error message is displayed telling the user that the name has been used previously
                    - 2a3. The app prompts the user to enter a new name
        2. **Update Schedule**:
            - **Description**: The user can import their own schdule from Workday
            - **Primary actor(s)**: User (Student/Professor) and Workday API
            - **Main success scenario**:
                1. The user clicks on the Import Schedule button
                2. The app prompts the user to enter a name for the new schedule
                3. Once the user enters the name and hit the Import button, the imported schdule shows up on the screen
            - **Failure scenario(s)**:
                - 2a. The user enters nothing for the name
                    - 2a2. An error message is displayed telling the user that name cannot be empty
                    - 2a3. The app prompts the user to enter the name again
                - 2b. The user enters a name that conflicts with an existing schedule
                    - 2a2. An error message is displayed telling the user that the name has been used previously
                    - 2a3. The app prompts the user to enter a new name
        3. **View Schedule**:
            - **Description**: The user can view their schedules
            - **Primary actor(s)**: User (Student/Professor) 
            - **Main success scenario**:
                1. The user selects (click on) one schedule
                2. The app opens up the schedule
            - **Failure scenario(s)**:
                - ...
        4. **Delete Schedule**:
            - **Description**: The user can delete their existing schedules
            - **Primary actor(s)**: User (Student/Professor) 
            - **Main success scenario**:
                1. The user selects (e.g. swipe or long press on) one schedule
                2. The app pops up a warning messaage for deleting the selected schedule
                3. If the user hits Confirm, the app deletes the schedule and the warning is dismissed
            - **Failure scenario(s)**:
                - 3a. The user hits Cancel or elsewhere
                    - 3a1. The warning message is dismissed
                    - 3a2. The app routes the user back to the original screen and does not delete the schedule

3. **Display Route to Class**
    - **Overview**:
        1. View Route: The system must display to the user a route to their next class
    
    - **Detailed Flow for Each Independent Scenario**:
        1. **View Route**:
            - **Description**: The user can view the optimal route to the next class based on their schedule and the current location
            - **Primary actor(s)**: User (Student/Professor) and Google Map API
            - **Main success scenario**:
                1. The user clicks on View Route
                2. The app prompts the user to grant location permissions if not already granted
                3. The user sees the current and destination locations together with the optimal route on the screen
                4. When the user arrives (or their next class happens at their current location), the user gets or lose points based on their punctuality
            - **Failure scenario(s)**:
                - 2a. The user does not grant location permissions
                    - 2a1. The app prompts the user for permissions again with rationale
                    - 2a2. If the user denies twice, the app shows a dialog to tell the user to enable location permissions in the settings first
                    - 2a3. The app routes the user back to the previous screen

4. **Manage User Profile and Notifications**
    - **Overview**:
        1. View Profile and Settings: The system must allow the user to view their profile and settings
        2. Update Notifications: The system must allow the user to manage their notification settings

    - **Detailed Flow for Each Independent Scenario**:
        1. **View Profile and Settings**:
            - **Description**: The user can view their profile and accumulated points
            - **Primary Actor(s)**: User (Student/Professor)
            - **Main success scenario**:
                1. The user clicks on their profile
                2. The app routes them to their profile page
            - **Failure scenario(s)**:
                - 1a. ...
                    - 1a1. ...
                    - 1a2. ...
        2. **Update Notifications**:
            - **Description**: The user can change whether they want to turn on or off the notifications
            - **Primary Actor(s)**: User (Student/Professor)
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

5. **View and Add Friends**
    - **Overview**:
        1. View Friends: The system must allow the user to view the friends they have added 
        2. Add Friends: The system must allow the user to add friends
        3. Delete Friends: The system must allow the user to delete friends
    
    - **Detailed Flow for Each Independent Scenario**:
        1. **View Friends**:
            - **Description**: The user can see their friends with their points
            - **Primary Actor(s)**: User (Student/Professor)
            - **Main success scenario**:
                1. The user clicks on their Friend List
                2. The app displays all friends of the user on the screen together with their points
            - **Failure scenario(s)**:
                - 2a. The user has no friends
                    - 2a1. The app display a message to encourage the user to add more friends and compete with them
        2. **Add Friends**:
            - **Description**: The user can add new friends to their Friend List
            - **Primary Actor(s)**: User (Student/Professor)
            - **Main success scenario**:
                1. The user clicks on the Add Friend button
                2. The app prompts the user to enter the user name of the new friend
                3. Once the user enters the user name and hit the Add button, the new friend will be added to and shown in the Friend List
            - **Failure scenario(s)**:
                - 2a. The user enters nothing for the user name
                    - 2a2. An error message is displayed telling the user that the user name cannot be empty
                    - 2a3. The app prompts the user to enter the user name again
                - 2b. The user enters a user name that does not exist
                    - 2a2. An error message is displayed telling the user that the user name does not exist
                    - 2a3. The app prompts the user to check the spellingand re-enter the user name
        3. **Delete Friends**:
            - **Description**: The user can delete their friends from the Friend List
            - **Primary Actor(s)**: User (Student/Professor)
            - **Main success scenario**:
                1. The user selects (e.g. swipe or long press on) one friend
                2. The app pops up a warning messaage for deleting the selected friend
                3. If the user hits Confirm, the app removes the friend from the Friend List and the warning is dismissed
            - **Failure scenario(s)**:
                - 3a. The user hits Cancel or elsewhere
                    - 3a1. The warning message is dismissed
                    - 3a2. The app routes the user back to the original screen and does not delete the friend


### **3.4. Screen Mockups**


### **3.5. Non-Functional Requirements**
<a name="nfr1"></a>

1. **[WRITE_NAME_HERE]**
    - **Description**: ...
    - **Justification**: ...
2. ...


## 4. Designs Specification
### **4.1. Main Components**
1. **[WRITE_NAME_HERE]**
    - **Purpose**: ...
    - **Interfaces**: 
        1. ...
            - **Purpose**: ...
        2. ...
2. ...


### **4.2. Databases**
1. **[WRITE_NAME_HERE]**
    - **Purpose**: ...
2. ...


### **4.3. External Modules**
1. **[WRITE_NAME_HERE]** 
    - **Purpose**: ...
2. ...


### **4.4. Frameworks**
1. **[WRITE_NAME_HERE]**
    - **Purpose**: ...
    - **Reason**: ...
2. ...


### **4.5. Dependencies Diagram**


### **4.6. Functional Requirements Sequence Diagram**
1. [**[WRITE_NAME_HERE]**](#fr1)\
[SEQUENCE_DIAGRAM_HERE]
2. ...


### **4.7. Non-Functional Requirements Design**
1. [**[WRITE_NAME_HERE]**](#nfr1)
    - **Validation**: ...
2. ...


### **4.8. Main Project Complexity Design**
**[WRITE_NAME_HERE]**
- **Description**: ...
- **Why complex?**: ...
- **Design**:
    - **Input**: ...
    - **Output**: ...
    - **Main computational logic**: ...
    - **Pseudo-code**: ...
        ```
        
        ```


## 5. Contributions
- ...
- ...
- ...
- ...