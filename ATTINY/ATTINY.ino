#include <SoftwareSerial.h>
#include <Filters.h>

float testFrequency = 60;                 // test signal frequency (Hz)
float windowLength = 20.0/testFrequency;  // how long to average the signal, for statistist
int   sensorValue = 0;
float intercept = -0.0400;                // to be adjusted based on calibration testing
float slope = 0.0405;                     // to be adjusted based on calibration testing
float current_amps;                       // estimated actual current in amps

unsigned long printPeriod = 5000;         // in milliseconds
unsigned long previousMillis = 0;         // Track time in milliseconds since last reading 
 
SoftwareSerial mySerial(A3, A2);

void setup() {
  pinMode(A1, INPUT);
  analogRead(A1);
  mySerial.begin(9600);
}

void loop() {
  RunningStatistics inputStats;           // create statistics to look at the raw test signal
  inputStats.setWindowSecs( windowLength );
   
  while( true ) {   
    sensorValue = analogRead(A1);         // read the analog in value:
    inputStats.input(sensorValue);        // log to Stats function
        
    if((unsigned long)(millis() - previousMillis) >= printPeriod) {
      previousMillis = millis();          // update time
      current_amps = intercept + slope * inputStats.sigma();
      
      delay(300);
      mySerial.println(String(current_amps+0.1));
      delay(300);
    }
  }
}

