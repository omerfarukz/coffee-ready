# Coffee Ready!
This project  a fun project about having notification from my coffee machine like 'your coffee is ready to have' :)

## Motivation
In my office, we have a single filter coffee machine. I we usually brew for five or more people but it is very hard to inform people who would like to have. So, I decided to build unharmful(for machine) way to send notifications automatically.


## Solution
I did not want to modify or solder the existing machine(s). My solution should be simple. 
I have research for different ways of detection tecniques like a using computer vision, SCT sensors. They are so complex or less effective. My choice was observing power consumption of the device for signal processing.

![](https://raw.githubusercontent.com/omerfarukz/coffee-ready/master/images/Screen%20Shot%202018-06-29%20at%2014.23.54.png)
![](https://raw.githubusercontent.com/omerfarukz/coffee-ready/master/images/Screen%20Shot%202018-06-29%20at%2014.23.34.png)
![](https://raw.githubusercontent.com/omerfarukz/coffee-ready/master/images/Screen%20Shot%202018-06-29%20at%2014.23.12.png)

## How it works
- One wire from power plug is bridged by ACS712. ACS712 is an electrical current sensor.
- ATTiny works like a analog to digital converter from ACS712 to ESP8266. It proces data of amperage and send by serial connection to the ESP8266(Because ESP8266 does not have an analog input)
- ESP8266 receives amperage value from serial connection and transfer that data to firebase(realtime database from google).
- A cloud function (google firebase platform) has triggers for changes on data and send notification(via different channels) when coffee is ready to have.

### Articles
- https://medium.com/@ulrozremo/monitoring-coffee-machine-783486bd395d
- https://hackaday.com/2018/08/24/tracking-the-office-coffee-machines-using-current-draw/

## Wiring 
Potantiometer is demonstrated as a ACS712.

![Potantiometer is used as a sensor](https://raw.githubusercontent.com/omerfarukz/coffee-ready/master/images/Screen%20Shot%202018-07-25%20at%2013.30.21.png)



