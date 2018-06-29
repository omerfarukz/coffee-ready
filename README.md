# Coffee Ready!
This project goal is have knownledgement about when the coffe is ready to have.

## Motivation
We have a large team who uses a shared coffee machine, so there is many floors in our premise. I decided to get notified my colleagues and also myself.

## Solution
I did not want to modify or solder the existing machine(s). Using camera and computer vision thinks are complex solutions. My solution should be simple. 
Researched many ways to detection. Like a using computer vision, SCT sensors. Decided to contious tracking of power consuption of our devices for signal processing.

## How it works
- ACS712(Current sensor) is read to electrical current.
- AtTiny read the data from ACS712. Calculates amperage and sends by serial to ESP8266(Because ESP8266 does not have an analog input)
- ESP8266 receives amperage value from serial and transfer that to firebase(realtime database from google).
- One cloud function(from google firebase platform) handles changes on data node and sends notification email.
