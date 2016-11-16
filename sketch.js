var vids = [];
var vidsSize;
var frameRate;

var table;
function preload() {
  createVideos();
  setupIgnition();

  table = loadTable("library.csv", "csv", "header");
}

var engineStart;
var engineStall;
var engineFinish;
function setupIgnition()
{
	engineStart = loadSound("/engine_sounds/enginestart.wav");
  engineStall = loadSound("/engine_sounds/enginestall.wav");
  engineFinish = loadSound("/engine_sounds/enginefinish.wav");
}

var speedometer;
function setup() {
  noCanvas();

  serialSetup();
  fillLibrary();

  speedometer = select("#speedometer");
  speedometer.value(0);
}


function serialSetup() {
  serial = new p5.SerialPort(); // make a new instance of  serialport library
  serial.on('list', printList); // callback function for serialport list event
  serial.on('data', serialEvent); // callback for new data coming in
  serial.list(); // list the serial ports
  serial.open("/dev/cu.usbmodemFD131"); // open a port
}

var right = "RIGHT";
var left = "LEFT";
var neutral = "DEFAULT";

var gasVal = 0;
var brakeVal = 0;
var ignitionVal = 0;

var power = 0;
var velocity = 0;
var drag = 0.992;
var acceleration;

function serialEvent() {
  var inString = serial.readLine();
  if (inString.includes(",")) {
		var values = inString.split(",");

    var gasVal = parseFloat(values[0]);
    var brakeVal = parseFloat(values[1]);

    if (speedRate < 3) {
      speedRate += 0.20*gasVal;
      vids[currIndex].speed(speedRate);
    }

    if (speedRate >= 0) {
      speedRate -= 0.35*brakeVal;
      vids[currIndex].speed(speedRate);
    }
    // console.log(vids[currIndex].speed());
  }
  else if (inString.includes("i:"))
  {
    var vals = inString.split(":");
    ignitionVal = vals[1];

    startCar(ignitionVal);
  }
  else if (inString.length > 0) {
    if (inString === right) {
      turnWheelLeft(false);
    } else if (inString === left) {
      turnWheelLeft(true);
    } else if (inString === neutral) {

    }
  }
}

function printList(portList) {
  for (var i = 0; i < portList.length; i++) {
    // Display the list the console:
    println(i + " " + portList[i]);
  }
}


var currIndex = 0;
var speedRate = 1;

function draw()
{
  updateSpeed();
}

function updateSpeed()
{
  if(keyIsDown(UP_ARROW))
  {
    if(power < 0.1)
    {
      power+=0.0005;
    }
    velocity += power;
  }
  else {
    power *= 0.95;
    velocity*=drag;
  }

  if(keyIsDown(DOWN_ARROW))
  {
    velocity *= 0.95;
  }

  var roundedVelocity = Math.round(velocity);
  speedometer.html(roundedVelocity + " MPH");
}

function keyPressed() {
  if (keyCode === LEFT_ARROW) {
    // turnWheelLeft(true);
  } else if (keyCode === RIGHT_ARROW) {
    turnWheelLeft(false);
  } else if (keyCode === UP_ARROW) {
    power+=0.001;

    if (speedRate < 3) {
      speedRate += 0.10;
      vids[currIndex].speed(speedRate);
    }
  } else if (keyCode === DOWN_ARROW) {
    velocity *= 0.9;
    if (speedRate >= 0) {
      speedRate -= 0.10;
      vids[currIndex].speed(speedRate);
    }
  }
}


function turnWheelLeft(left) // true if left, false if right
{
  vids[currIndex].pause();
  vids[currIndex].hide();
  if (!left) {
    if (currIndex === vidsSize) {
      currIndex = 0;
    } else {
      currIndex++;
    }
  } else {
    if (currIndex === 0) {
      currIndex = vidsSize;
    } else {
      currIndex--;
    }
  }
  vids[currIndex].speed(speedRate);
  vids[currIndex].show();
  vids[currIndex].loop();
}


var isEngineOn = false;
var isEngineTurningOn = false;
function startCar(iVal)//iVal serial value from 0-100
{
  if(iVal <= 10)
  {
    //do nothing
    isEngineTurningOn = false;
    isEngineOn = false;
    vids[currIndex].hide();
    vids[currIndex].pause();
  }
  else if(iVal >10 && iVal<=80)
  {
    if(!isEngineOn) //if engine on already, don't start engine
    {
      if(!isEngineTurningOn)
      {
        //play start engine sound
        engineStart.play();
        isEngineTurningOn = true;
      }
      else
      {
        if(!engineStart.isPlaying())
        {
          if(!engineStall.isPlaying())
          {
          	engineStall.play();
          }
        }
      }
    }
  }
  else if(iVal>80)
  {
    if(!isEngineOn)
    {
      isEngineTurningOn = false;
     	isEngineOn = true;
      engineFinish.play();
      start();
      //play engine finish on
    }
  }
}

function start()
{
  vids[currIndex].show();
  vids[currIndex].play();
}

function stop()
{
 	vids[currIndex].pause();
  vids[currIndex].hide();
}
