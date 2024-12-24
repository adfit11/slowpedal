# Slow Pedal
Build your own alternative to Vidami for guitar practice, for around $25. See below for parts list and build plans.  

<img width="600" alt="pedalShot" src="https://github.com/user-attachments/assets/905d09ac-739b-4970-bcf2-d438a7cbeae1" />. 

__Features:__

Control YouTube or local videos with a foot pedal. Actually offers a few more features than Vidami does

- _Play / pause_
- _Speed up / Slow down_
- _Set / Release a Loop_
- _Lengthen / Shorten the Loop_
- _Shift the Loop Forward / Back_

No browser plug-ins required. The pedal works by replicating keystrokes that are programmed to control features on the site below.   


## Website

The pedal is designed to work with one particular website only.   
[slowpedal.com](https://slowpedal.com/)  
  
You can reach the same site directly here:  
[https://adfit11.github.io/slowpedal/](https://adfit11.github.io/slowpedal/)  


The code for this app is open source, and available at:  
[https://github.com/adfit11/slowpedal](https://github.com/adfit11/slowpedal)  

you may download it to run locally if you wish.  


## Hardware - Parts List

<img width="180" alt="devboard" src="https://github.com/user-attachments/assets/388ead9b-0cfe-45c7-ae1e-c2cd89f17879" />  
 

1 x [ATmega32U4 Pro Micro Development Board (USBC)](https://www.aliexpress.com/w/wholesale-ATmega32U4-Pro-Micro.html?spm=a2g0o.home.search.0)  
  
__You can use what you like for the rest, but here's what I used:__  
1 x [Enclosure 114x200x40mm](https://www.auselectronicsdirect.com.au/114x200x40mm-abs-grey-instrument-case)  
1 x [Prototyping board](https://www.aliexpress.com/w/wholesale-prototyping-board.html?spm=a2g0o.home.search.0) trimmed to 97x192mm in mine  
8 x [Momentary buttons (Normally Open)](https://www.aliexpress.com/item/4000638162034.html), in colours to match the app (1BLK, 1BLU, 2RED, 2GRN, 2YEL)  
8 X [10K OHM 1/2W Resistors](https://www.jaycar.com.au/10k-ohm-0-5-watt-metal-film-resistors-pack-of-8/p/RR0596)  
Shielded Wire  
Bare Wire  
Long _USB-C to your-computer_ cable

## Hardware - Assembly

Wire according to the following schematic:  

<img width="400" alt="schematic" src="https://github.com/user-attachments/assets/e85aacf6-1c17-48f9-a26d-224eadeca069" />  

-------------------  
  
It will look something like this. My switches have NO/NC options. NO is the centre. NC is soldered to nothing, just to hold it in place:  

Nice side (switches to contol pins):  
<img width="400" alt="nice" src="https://github.com/user-attachments/assets/ea8327d2-1f28-41ba-8fd6-edd320ab2d60" />  
  
Ugly side! (all to ground):  
<img width="400" alt="ugly" src="https://github.com/user-attachments/assets/fddb5e23-9dc8-4674-bab0-36d85c7d827e" />  
  
With all this done ensure you have holes drilled in your casing to accomodate the buttons. There will be no need to affix the prototyping board to the case, as the button mounts will do that.

I have the USB cable plugged direcrly into the Dev Board, so I have a hole in the side of the casing for that.  

<img width="400" alt="outhole" src="https://github.com/user-attachments/assets/69fe82a1-5934-4472-9d55-59c738bffd80" />

## Programming the Dev Board

The ATmega32U4 Pro Micro can be programmed using the Arduino IDE ([download here](https://www.arduino.cc/en/software)) and will emulate a keyboard if you just call on the libraries to do so.  
  
With the IDE downloaded and installed, connect the ATmega32U4 to the computer, ensuring it is recognised by the software. It'll probably be identified as ___Arduino 'Something'___  
  
[Select the device](https://support.arduino.cc/hc/en-us/articles/4406856349970-Select-board-and-port-in-Arduino-IDE) and "Upload" ➡ the following code to the Dev board :

```
#include <Keyboard.h>                               //Including the keyboard library
#include <Mouse.h>                                  //Including the mouse library

int pin2_PlayPause_Space = 2;                     //Declaring variables for the pins
int pin3_Slower_A = 3;
int pin4_Faster_S = 4;
int pin5_Loop_J = 5;
int pin6_Back_D = 6;
int pin7_Forward_F = 7;
int pin8_Longer_G = 8;
int pin9_Shorter_H = 9;

void setup() {
  pinMode(pin2_PlayPause_Space, INPUT_PULLUP);                 //Set up the internal pull-ups resistors
  pinMode(pin3_Slower_A, INPUT_PULLUP);
  pinMode(pin4_Faster_S, INPUT_PULLUP);
  pinMode(pin5_Loop_J, INPUT_PULLUP);
  pinMode(pin6_Back_D, INPUT_PULLUP);
  pinMode(pin7_Forward_F, INPUT_PULLUP);
  pinMode(pin8_Longer_G, INPUT_PULLUP);
  pinMode(pin9_Shorter_H, INPUT_PULLUP);
}

void loop() {

  if (digitalRead(pin2_PlayPause_Space) == LOW)                     //Checking which switch has been pressed
  {
    Keyboard.write(' ');
    delay(200);
  }

  if (digitalRead(pin3_Slower_A) == LOW)
  {
    Keyboard.write('a');
    delay(200);
  }

  if (digitalRead(pin4_Faster_S) == LOW)
  {
    Keyboard.write('s');
    delay(200);
  }

  if (digitalRead(pin5_Loop_J) == LOW)
  {
    Keyboard.write('j');
    delay(200);
  }

  if (digitalRead(pin6_Back_D) == LOW)
  {
    Keyboard.write('d');
    delay(200);
  }
  if (digitalRead(pin7_Forward_F) == LOW)
  {
    Keyboard.write('f');
    delay(200);
  }

  if (digitalRead(pin8_Longer_G) == LOW)
  {
    Keyboard.write('g'); 
    delay(200);
  }
  
  if (digitalRead(pin9_Shorter_H) == LOW)
  {
    Keyboard.write('h'); 
    delay(200);
  }
}
```

## That should be it!
As you can see in the code, a successfully programmed pedal will effectively be an 8 key wired keyboard (try it in a text editor). Your actual keyboard can controll the site using those keys as well.  

Have fun!  

# 🤘 🎸

