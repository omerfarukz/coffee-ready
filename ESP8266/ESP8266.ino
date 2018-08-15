#include "configuration.h"

#include <ESP8266WiFi.h>
#include <ESP8266WebServer.h>
#include <ESP8266mDNS.h>
#include <WiFiClient.h>

#include <FirebaseArduino.h>
#include <Pushover.h>

ESP8266WebServer  server(80);

float             current         = 0.0;
float             previousCurrent = 0.0;

void updateStatus() {
  // read sensor data from serial (or AtTiny)
  if(Serial.available() > -1) {
    float value = Serial.parseFloat();
    if(value != 0.00)
      current = value;

    if(isStateChanged()) {
      bool  previousState = (previousCurrent > treshold);
      stateChanged(previousState);
    }

    previousCurrent = current;
  }
}

bool isStateChanged() {
  return (
      (current > treshold && previousCurrent < treshold) || // started
      (current < treshold && previousCurrent > treshold)    // stopped
  );
}

void stateChanged(bool state) {
  String data = "{\"state\":" + String(state) + "}";
  
  sendNotification(data);
  sendDataToFirebase(true, data);
}

void initWifi() {
  if(WiFi.status() == WL_CONNECTED)
    return;
  
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
  while (WiFi.status() != WL_CONNECTED) {  //Wait for the WiFI connection completion
    delay(1000);
    Serial.println("Waiting for connection");
  }
  
  Serial.print("Connection establised ");
  Serial.println(WiFi.localIP());
  
  server.on("/", []() {
    String data = "{"
                "\"rnd\":\""       +  String(millis()) + "\", "
                "\"amperage\":\""  +  String(current)  + "\"  "
              "}";
    server.send(200, "application/json", data);
  });
  server.begin();
}

void initFirebase() {
  Firebase.begin(FIREBASE_HOST, FIREBASE_AUTH);
}

void sendDataToFirebase(bool important, String data) {
  initWifi();
  initFirebase();

  StaticJsonBuffer<300> jsonBuffer;
  JsonObject& jsonObject = jsonBuffer.parse(data);
  jsonObject["age"] = millis();
  
  // add timestamp
  JsonObject& timeStampObject = jsonObject.createNestedObject("at");
  timeStampObject[".sv"] = "timestamp";
  
  Serial.println(data);
  // try many times to send data if it is important.
  int tryCount = important ? 10 : 1;
  while((tryCount--)>0) {
    initFirebase();
    Firebase.set("current", jsonObject);
    // handle error
    if (Firebase.failed()) {
        Serial.print("Failed to send data ");
        Serial.println(Firebase.error());

        delay(1000);
        continue;
    }

    Serial.println("Data sent.");
    break;
  }
}

void sendNotification(String message) {
  if(USE_PUSHOVER) {
    Pushover po = Pushover(PUSHOVER_APP_KEY, PUSHOVER_USER_KEY); // TODO:
    po.setMessage(message);
    po.setSound("intermission");
    po.send();
  }
}

void setup() {
  Serial.begin(9600);
  initWifi();
  initFirebase();
}

void loop() {
  server.handleClient();
  updateStatus();
              
  delay(500);
}
