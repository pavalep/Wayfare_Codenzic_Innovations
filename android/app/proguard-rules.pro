# Add project specific ProGuard rules here.
# By default, the flags in this file are appended to flags specified
# in /usr/local/Cellar/android-sdk/24.3.3/tools/proguard/proguard-android.txt
# You can edit the include path and order by changing the proguardFiles
# directive in build.gradle.
#
# For more details, see
#   http://developer.android.com/guide/developing/tools/proguard.html

# react-native-reanimated
-keep class com.swmansion.reanimated.** { *; }
-keep class com.facebook.react.turbomodule.** { *; }

# --- WorkManager's database -----------------------------------------
#
# WHY THIS IS NEEDED
#
# `react-native-maps` pulls in `androidx.work:work-runtime` for its
# tile cache, and WorkManager builds a Room database the moment the app
# starts: androidx.startup's `InitializationProvider` runs
# `WorkManagerInitializer` before the first Activity, and it is the
# database creation that fails.
#
# Room instantiates that database by NAME — it looks the generated
# implementation up with `Class.forName` — so R8 cannot see the
# reference and removes the generated class. The release build then
# dies on launch, before it draws anything, with:
#
#   Failed to create an instance of class
#   androidx.work.impl.WorkDatabase
#
# WorkManager's own consumer rules keep the Worker classes but not the
# database, so the keeps are added here.
#
# `-keep class * extends androidx.room.RoomDatabase` is the rule that
# matters: it keeps the name of the generated implementation, which is
# what Room looks up by string.
-keep class androidx.work.impl.** { *; }
-keep class androidx.work.impl.WorkDatabase_Impl { *; }
-keep class * extends androidx.room.RoomDatabase { <init>(); }
-keepclassmembers class * extends androidx.room.RoomDatabase { <init>(); }
-dontwarn androidx.room.paging.**
-dontwarn androidx.work.**

# Add any project specific keep options here:
