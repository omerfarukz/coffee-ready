// (BETA) This skecth is not ready to use.
#include <ESP8266WiFi.h>
#include <FirebaseArduino.h>

#define     FIREBASE_HOST               ""
#define     FIREBASE_AUTH               ""

const char    firebaseRootPath[]        = "machines/office";

const char    ssid[]                    = "";
const char    wifiPassword[]            = "";

const float   currentTreshold           = 3.0;  // amperage
const float   secondsTresholdOverCurrent= 180;  // seconds

float         sensorValue               = 0.0;
int           currentTresholdExceededAt = 0;    // time from startup in milliseconds

void setup() {
  Serial.begin(9600);
  initWifi();
  initFirebase();
}

void loop() {
  updateStatus();
  delay(2000); // Minimum daily load is 4320
}

void updateStatus() {
  // read sensor data from serial (or AtTiny)
  if(Serial.available() > -1) {
    float value = Serial.parseFloat();
    if(value != 0.00)
      sensorValue = value;
  }

  float secondsOverTreshold = 0;
  if(currentTresholdExceededAt > 0)
    secondsOverTreshold = (millis() - currentTresholdExceededAt) / 1000.0;

  if(sensorValue > currentTreshold) {
    // We have current.
    if(currentTresholdExceededAt == 0) {
      currentTresholdExceededAt = millis();
    }
  }
  else {
    if(secondsOverTreshold > secondsTresholdOverCurrent) {
      // In this case boiling is not started yet or stopped just now.
      sendComplationSignal(secondsTresholdOverCurrent);
    } 
    currentTresholdExceededAt = 0;
  }
  
  Serial.println("sensorValue: " + String(sensorValue));
  Serial.println("secondsOverTreshold: " + String(secondsOverTreshold));
  Serial.println();

  trySendCurrent(sensorValue, secondsOverTreshold);
}

void trySendCurrent(float sensorValue, float durationInSeconds) {
  String path = String(firebaseRootPath) + "/current";
  String data = "{\"sensorValue\":" + String(sensorValue) + ",\"durationInSeconds\":" + String(durationInSeconds) + "}";

  sendToFirebase(path, data, false);
}

void sendComplationSignal(float durationInSeconds) {
  String path = String(firebaseRootPath) + "/latest";
  String data = "{\"durationInSeconds\":" + String(durationInSeconds) + "}";
  
  sendToFirebase(path, data, true);
}

bool sendToFirebase(String path, String data, bool important) {
  StaticJsonBuffer<300> jsonBuffer;
  JsonObject& jsonObject = jsonBuffer.parse(data);

  // add timestamp
  JsonObject& timeStampObject = jsonObject.createNestedObject("updatedAt");
  timeStampObject[".sv"] = "timestamp";

  Serial.print("Trying to send data: ");
  Serial.println(data);
  
  // try many times to send data if it is important.
  int tryCount = important ? 1 : 10;
  while( (tryCount--) > 0) {
    Firebase.set(path, jsonObject);
    // handle error
    if (Firebase.failed()) {
        Serial.print("Failed to send data ");
        Serial.println(Firebase.error());
        delay(10000); // wait for ten seconds
        initFirebase();
        continue;
    }
    else
    {
      Serial.println("data sent");
      return true;
    }
  }

  return false;
}

void initFirebase() {
  Firebase.begin(FIREBASE_HOST, FIREBASE_AUTH);
  delay(2000); // with my respect
}

void initWifi() {
  WiFi.begin(ssid, wifiPassword);   //WiFi connection
 
  while (WiFi.status() != WL_CONNECTED) {  //Wait for the WiFI connection completion
    delay(1000);
    Serial.println("Waiting for connection");
  }
  
  Serial.print("Connection establised ");
  Serial.println(WiFi.localIP());
}