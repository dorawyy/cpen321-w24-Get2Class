# Front End (Kotlin)
Please ensure that Android Studio is installed on your machine to access and view the front end code

## Front End Setup (Local)
1. Visit the `local.properties` file in the root directory of the application and add `BASE_API_URL=http://10.0.2.2:3000`

## Google Authentication API Setup
1. Follow the steps similar to that of the tutorial or similar to what you did in Milestone 1
    1. Visit https://developer.android.com/identity/sign-in/credential-manager-siwg
    2. Access the Google Cloud Console and add a new project called `Get2Class`
    3. From here, follow the steps from Android Tutorial 4 Sign In to obtain the `WEB_CLIENT_ID` and add the SHA-1 of the application to the new project
2. Add the `WEB_CLIENT_ID` to the `local.properties` file in the root directory of the application

## Google Maps API Setup
1. Follow the steps similar to that of the tutorial or similar to what you did in Milestone 1
    1. In the [Cloud Console](https://console.cloud.google.com/), click the project drop-down menu and select the project that you want to use for this project
    2. Enable the Google Maps Platform APIs and SDKs required for this project in the [Google Cloud Marketplace](https://console.cloud.google.com/marketplace)
        1. Search for "Maps SDK for Android" and click on the "Enable" button
        2. Repeat this process for the "Places API"
        3. Repeat this process for the "Navigation SDK"
    3. Generate an API key in the [Credentials](https://console.cloud.google.com/apis/credentials) page of Cloud Console. You can follow the steps in the quickstart section in [Getting started with Google Maps Platform](https://developers.google.com/maps/get-started#api-key)
2. Open the `local.properties` file in your top-level directory and type in `MAPS_API_KEY=YOUR_API_KEY`, and then replace YOUR_API_KEY with your API key