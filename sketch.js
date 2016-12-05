var vids = [];
var frameRate;

var table;

var speedRate = 1;

var currI = 0;
var currJ = 0;
var currK = 0;

var speedometer;
var engineStart;
var engineStall;
var engineFinish;

var right = "right";
var left = "left";
var neutral = "default";

var gasVal = 0;
var brakeVal = 0;
var ignitionVal = 0;

var power = 0;
var velocity = 0;
var speed = 0;
var direction = "default";
var drag = 0.992;
var acceleration;

function preload() {
  setupIgnition();
  table = loadTable("library.csv", "csv", "header");
  console.log("finished preload");

}

function setupIgnition()
{
	engineStart = loadSound("/engine_sounds/enginestart.wav");
  engineStall = loadSound("/engine_sounds/enginestall.wav");
  engineFinish = loadSound("/engine_sounds/enginefinish.wav");
}

function setup() {
  noCanvas();
  serialSetup();


  initLibs();
  fillLibrary();

  console.log("library finished");

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



function serialEvent() {
  var inString = serial.readLine();
  if (inString.includes(",")) {
		var values = inString.split(",");

    var gasVal = parseFloat(values[0]);
    var brakeVal = parseFloat(values[1]);

    if (speedRate < 3) {
      speedRate += 0.20*gasVal;
      movieLib[currI][currJ][currK].speed(speedRate);
    }

    if (speedRate >= 0) {
      speedRate -= 0.35*brakeVal;
      movieLib[currI][currJ][currK].speed(speedRate);
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
      direction = "right";
      turnWheel();
    } else if (inString === left) {
      direction = "left";
      turnWheel();
    } else if (inString === neutral) {
      direction = "straight";
    }
  }
}

function printList(portList) {
  for (var i = 0; i < portList.length; i++) {
    // Display the list the console:
    println(i + " " + portList[i]);
  }
}


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
  speed = roundedVelocity
}

function keyPressed() {

  // print(direction);
  if (keyCode === LEFT_ARROW) {
    direction = "left";
    turnWheel();
  } else if (keyCode === RIGHT_ARROW) {
    direction = "right";
    turnWheel();
  } else if (keyCode === UP_ARROW) {
    power+=0.001;
    if (speedRate < 3) {
      speedRate += 0.10;
      movieLib[currI][currJ][currK].speed(speedRate);
    }
  } else if (keyCode === DOWN_ARROW) {
    velocity *= 0.9;
    if (speedRate >= 0) {
      speedRate -= 0.10;
      movieLib[currI][currJ][currK].speed(speedRate);
    }
  } else if (keyCode === ENTER)
  {
    start();
  }
}


function turnWheel() // true if left, false if right
{
  print("i: " + currI);
  print("j: " + currJ);
  print("k: " + currK);
  print(movieLib[currI].length);
  movieLib[currI][currJ][currK].pause();
  movieLib[currI][currJ][currK].hide();
  getNewIndices();
  movieLib[currI][currJ][currK].speed(speedRate);
  movieLib[currI][currJ][currK].show();
  movieLib[currI][currJ][currK].loop();
}

function velocityIntoCategory()
{
  if(speed >= 0 && speed < 15)
  {
    return 0;
  }
  else if(speed >= 15 && speed < 40)
  {
    return 1;
  }
  else if(speed >= 40 && speed < 90)
  {
    return 2;
  }
  else if(speed >= 90 && speed < 150)
  {
    return 3;
  }
  else if(speed >= 150)
  {
    return 3;
  }

}

function getNewIndices()
{
  currI = velocityIntoCategory();
  println("current i: " + currI);
  println(direction);
  currJ = directionToInt(direction);
  println("current j: " + currJ);

  var currLib = movieLib[currI][currJ];
  var currLibLength = currLib.length;

  currK = getRandomInt(0, currLibLength-1);
  println("current K: " + currK);

}

function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
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
    movieLib[currI][currJ][currK].hide();
    movieLib[currI][currJ][currK].pause();
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
  movieLib[currI][currJ][currK].show();
  movieLib[currI][currJ][currK].loop();
}

function stop()
{
 	movieLib[currI][currJ][currK].pause();
  movieLib[currI][currJ][currK].hide();
}
