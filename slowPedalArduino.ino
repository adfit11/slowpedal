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