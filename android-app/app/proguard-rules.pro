# Add project specific ProGuard rules here
-keep class dz.vet.vetdz.** { *; }
-keepclassmembers class * {
    @android.webkit.JavascriptInterface <methods>;
}
-keepattributes JavascriptInterface
-keepattributes *Annotation*
-dontwarn android.webkit.**
-keep class android.webkit.** { *; }
