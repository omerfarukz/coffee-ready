#include <ESP8266WiFi.h>
#include <FirebaseArduino.h>

#define       FIREBASE_HOST             ""
#define       FIREBASE_AUTH             ""

const char    ssid[]                  = "";
const char    wifiPassword[]          = "";
const long    minuteMs                = 60000; // 60000 milliseconds in a minute
const float   minSensorDataTreshold   = 3.0;
const float   boilingPeriodInMinutes  = 2;

unsigned long boilingDetectedAt       = 0;
float         lastRead                = 0.0;
int           prediction              = 0;
unsigned long startTime               = 0;
int           state                   = 0;
int           skipSendCounter         = 0;

void setup() {
  startTime = millis();
  Serial.begin(9600);
  
  initWifi();
  initFirebase();
}

void loop() {
  updateStatus();

  if(state > 25) // Is boiling?
  {
    bool isImportant = false;
    if(prediction == 40)
      isImportant = true;
      
    sendData(isImportant);
=  }
  
  Serial.println("state: " + String(state));
              
  delay(500);
}

void updateStatus() {
  // read sensor data from serial (or AtTiny)
  if(Serial.available() > -1) {
    float value = Serial.parseFloat();
    if(value != 0.00)
      lastRead = value;
  }
  
  prediction = 10; // idle
  // check if the data greater then treshold (it is using for prediction)
  if(lastRead > minSensorDataTreshold) {
    if(boilingDetectedAt == 0) {
      boilingDetectedAt = millis();
      state = 20; // boiling started
    }
    else
    {
      state = 25; // stil boiling
      unsigned long differenceInMs = millis() - boilingDetectedAt;
      if(differenceInMs > minuteMs * boilingPeriodInMinutes) {
        state = 30; // boiling in [2] minutes
      }
    }
  }
  else {
    // now, sensor data is below the treshold. checking for is it happens after boiling.
    if(state == 30) { // if the previous state is boiling in [boilingPeriodInMinutes] minutes
      int counter = 0;
      while(counter++ < 6) {
        if(counter <= 2)
        {
          prediction = 40; // done
        }
        else
        {
          prediction = 30; // done, ready to have
        }
        
        sendData(true);
      }
    }
    state = 10;
    boilingDetectedAt = 0;
  }
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

void initFirebase() {
  Firebase.begin(FIREBASE_HOST, FIREBASE_AUTH);
}


void sendData(bool important) {
  float secondsInBoiling = 0;
  if(boilingDetectedAt > 0)
    secondsInBoiling = ((millis() - boilingDetectedAt) / 1000.0);

  // create json for firebase
  String data = "{"
                  "\"lastRead\":\""   + String(lastRead)  + "\", " 
                  "\"step\":\""       + state             + "\", " 
                  "\"boilingIn\":\""  + secondsInBoiling  + "\", " 
                  "\"prediction\":\"" + prediction        + 
                "\"}";

  StaticJsonBuffer<300> jsonBuffer;
  JsonVariant jsonData = jsonBuffer.parse(data);
  
  Serial.println(data);
  // try many times to send data if it is important.
  int tryCount = important ? 1 : 10;
  while((tryCount--)>0) {
    initFirebase();
    Firebase.set("state", jsonData);
    // handle error
    if (Firebase.failed()) {
        Serial.print("Failed to send data ");
        Serial.println(Firebase.error());
        initFirebase();
        continue;
    }

    Serial.println("Data sent.");
    break;
  }
}