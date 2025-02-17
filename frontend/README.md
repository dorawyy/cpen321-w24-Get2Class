# Front End (Kotlin)

## Front End Setup (Local)
1. Visit the `local.properties` file in the root directory of the application and add `BASE_API_URL=http://10.0.2.2:3000`

## Google Authentication API Setup
1. Follow the steps similar to that of the tutorial or similar to what you did in Milestone 1
    1. Visit https://developer.android.com/identity/sign-in/credential-manager-siwg
    2. Access the Google Cloud Console and add a new project called `Get2Class`
    3. From here, follow the steps from Android Tutorial 4 Sign In to obtain the `WEB_CLIENT_ID` and add the SHA-1 of the application to the new project
2. Add the `WEB_CLIENT_ID` to the `local.properties` file in the root directory of the application
    