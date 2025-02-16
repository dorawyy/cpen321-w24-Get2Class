import java.util.Properties

plugins {
    alias(libs.plugins.android.application)
    alias(libs.plugins.kotlin.android)
}

android {
    namespace = "com.example.get2class"
    compileSdk = 35

    val file = rootProject.file("local.properties")
    val properties = Properties()
    properties.load(file.inputStream())

    defaultConfig {
        applicationId = "com.example.get2class"
        minSdk = 31
        targetSdk = 35
        versionCode = 1
        versionName = "1.0"

        testInstrumentationRunner = "androidx.test.runner.AndroidJUnitRunner"
    }

    buildTypes {
        release {
            isMinifyEnabled = false
            proguardFiles(
                getDefaultProguardFile("proguard-android-optimize.txt"),
                "proguard-rules.pro"
            )
            buildConfigField("String", "BASE_API_URL", "\"http://10.0.2.2:3000\"")

            // For this BuildConfig field, add your Google Sign In WEB_CLIENT_ID following the tutorial by creating a new project called Get2Class in your Google Cloud Console
            buildConfigField("String", "WEB_CLIENT_ID", "\"\"")
        }
        debug {
            buildConfigField("String", "BASE_API_URL", "\"http://10.0.2.2:3000\"")

            // For this BuildConfig field, add your Google Sign In WEB_CLIENT_ID following the tutorial by creating a new project called Get2Class in your Google Cloud Console
            buildConfigField("String", "WEB_CLIENT_ID", "\"\"")
        }
    }
    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_11
        targetCompatibility = JavaVersion.VERSION_11
    }
    kotlinOptions {
        jvmTarget = "11"
    }
    buildFeatures {
        viewBinding = true
        buildConfig = true
    }
}

dependencies {

    implementation(libs.androidx.core.ktx)
    implementation(libs.androidx.appcompat)
    implementation(libs.material)
    implementation(libs.androidx.activity)
    implementation(libs.androidx.constraintlayout)
    implementation(libs.googleid)
    testImplementation(libs.junit)
    androidTestImplementation(libs.androidx.junit)
    androidTestImplementation(libs.androidx.espresso.core)

    implementation("com.squareup.okhttp3:okhttp:3.8.1")

    // optional - needed for credentials support from play services, for devices running Android 13 and below.
    implementation("androidx.credentials:credentials-play-services-auth:1.3.0")
    implementation("androidx.credentials:credentials:1.3.0")
}