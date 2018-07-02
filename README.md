# Coffee Ready!
This project goal is have acknowledgement about when the coffee is ready to have.

## Motivation
EWe have a large team who uses a shared coffee machine, so there is many floors in our premise. I decided to notify me and my colleagues.

## Solution
I did not want to modify or solder the existing machine(s). Using camera and computer vision thinks are complex solutions. My solution should be simple. 
Researched many ways to detection. Like a using computer vision, SCT sensors. Decided to contious tracking of power consuption of our devices for signal processing.

![](https://raw.githubusercontent.com/omerfarukz/coffee-ready/master/images/Screen%20Shot%202018-06-29%20at%2014.23.54.png)
![](https://raw.githubusercontent.com/omerfarukz/coffee-ready/master/images/Screen%20Shot%202018-06-29%20at%2014.23.34.png)
![](https://raw.githubusercontent.com/omerfarukz/coffee-ready/master/images/Screen%20Shot%202018-06-29%20at%2014.23.12.png)

## How it works
- One wire from electric hub is bypasses from ACS712. ACS712 is an electrical current sensor.
- AtTiny read the data from ACS712. Calculates amperage and sends by serial connection to the ESP8266(Because ESP8266 does not have an analog input)
- ESP8266 receives amperage value from serial connection and transfer that data to firebase(realtime database from google).
- A cloud function (Cloud Functions from google firebase platform) handles changes on data and sends notification email when coffee is ready to have.
