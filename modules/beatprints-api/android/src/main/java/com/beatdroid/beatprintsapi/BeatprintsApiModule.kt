package com.beatdroid.beatprintsapi

import android.widget.Toast
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition
import java.net.URL
import com.chaquo.python.Python
import com.chaquo.python.android.AndroidPlatform

class BeatprintsApiModule : Module() {
  // Each module class must implement the definition function. The definition consists of components
  // that describes the module's functionality and behavior.
  // See https://docs.expo.dev/modules/module-api for more details about available components.
  override fun definition() = ModuleDefinition {
    // Sets the name of the module that JavaScript code will use to refer to the module. Takes a string as an argument.
    // Can be inferred from module's class name, but it's recommended to set it explicitly for clarity.
    // The module will be accessible from `requireNativeModule('BeatprintsApi')` in JavaScript.
    Name("BeatprintsApi")

    // Sets constant properties on the module. Can take a dictionary or a closure that returns a dictionary.
    Constants(
      "PI" to Math.PI
    )

    // Defines event names that the module can send to JavaScript.
    Events("onChange")

    // Defines a JavaScript synchronous function that runs the native code on the JavaScript thread.
    Function("hello") {
      try {
        // Initialize Python if not already initialized
        if (!Python.isStarted()) {
          Python.start(AndroidPlatform(appContext.reactContext!!))
        }
        
        // Get Python instance and execute Python code to get version
        val python = Python.getInstance()
        val sys = python.getModule("sys")
        val version = sys["version"].toString()
        
        Toast.makeText(appContext.reactContext, "Python version: $version", Toast.LENGTH_LONG).show()

        "Python version: $version 🐍"
      } catch (e: Exception) {
        "Error getting Python version: ${e.message} ❌"
      }
    }

    // Defines a JavaScript function that always returns a Promise and whose native code
    // is by default dispatched on the different thread than the JavaScript runtime runs on.
    AsyncFunction("setValueAsync") { value: String ->
      // Send an event to JavaScript.
      sendEvent("onChange", mapOf(
        "value" to value
      ))
    }

    // Enables the module to be used as a native view. Definition components that are accepted as part of
    // the view definition: Prop, Events.
    View(BeatprintsApiView::class) {
      // Defines a setter for the `url` prop.
      Prop("url") { view: BeatprintsApiView, url: URL ->
        view.webView.loadUrl(url.toString())
      }
      // Defines an event that the view can send to JavaScript.
      Events("onLoad")
    }
  }
}
