var table;

var speedRate = 1;

var currI = 0; // speed
var currJ = 0; // direction
var currK = 0; // random video

var right = "RIGHT";
var left = "LEFT";
var neutral = "DEFAULT";

var gasVal = 0;
var brakeVal = 0;
var ignitionVal = 0;

var power = 0;
var velocity = 0;
var speed = 0;
var direction = "default";
var drag = 0.995;
var acceleration;

var songs = [];
var song;

var song1;
var song2;
var song3;
var song4;

var staticNoise;

function preload() {
  setupIgnition();
  loadSongs();
  table = loadTable("libraryV2.csv", "csv", "header");
  console.log("finished preload");
}

function loadSongs()
{
  song = loadSound("/assets/1.mp3");

  song1 = loadSound("/assets/1.mp3");
  song2 = loadSound("/assets/2.mp3");
  song3 = loadSound("/assets/3.mp3");
  song4 = loadSound("/assets/4.mp3");

  staticNoise = loadSound("/assets/static.wav");

  songs = [song1, song2, song3, song4];
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

  speedometer = select("#speedometer");
  speedometer.hide();
  createCanvas(displayWidth, displayHeight);
  preStart();
}

function serialSetup() {
  serial = new p5.SerialPort(); // make a new instance of  serialport library
  serial.on('list', printList); // callback function for serialport list event
  serial.on('data', serialEvent); // callback for new data coming in
  serial.list(); // list the serial ports
  serial.open("/dev/cu.usbmodem1411"); // open a port
}


function printList(portList) {
  for (var i = 0; i < portList.length; i++) {
    println(i + " " + portList[i]);
  }
}

var gasVal = 0;
var brakeVal = 0;
var radioVal = 0;
function serialEvent() {
  var inString = serial.readLine();
  if (inString.includes(",") && isEngineOn) {
		var values = inString.split(",");

    gasVal = parseFloat(values[0]);
    brakeVal = parseFloat(values[1]);
    // print("gasVal: "+ gasVal);
    // print("brakeVal: "+ brakeVal);
  }
  else if (inString.includes("i:"))
  {
    var vals = inString.split(":");
    ignitionVal = vals[1];

    startCar(ignitionVal);
  }
  else if (inString.includes("r:") && isEngineOn)
  {
    var vals = inString.split(":");
    radioVal = vals[1];

    changeRadioStation(radioVal);
  }
  else if (inString.includes("static") && isEngineOn)
  {
    if(inString.includes("off"))
    {
      pauseRadioStatic();
    }
    else {
      playRadioStatic();
    }
  }
  else if (inString.length > 0) {
    if (inString === right) {
      direction = "right";
      updateCarStatus();
    } else if (inString === left) {
      direction = "left";
      updateCarStatus();
    } else if (inString === neutral) {
      direction = "straight";
    }
  }
}

function draw()
{
  background(0);
  updateSpeedWithPedal();
  if(playingSong != null)
    playingSong.setVolume(0.8);
  // updateSpeed();
}

function updateSpeed()
{

  if(!keyIsPressed)
  {
    direction = "straight";
  }
  if(keyIsDown(UP_ARROW))
  {
    if(power < 0.1)
    {
      power+=0.0005;
    }
    velocity += power;
    if (speedRate < 3) {
      speedRate += 0.001;
    }
    else {
      {
        speedRate = 3;
      }
    }
  }
  else {
    power *= 0.99;
    velocity*=drag;
    if(speedRate >= 1)
    {
      speedRate -= 0.002;
    }
  }

  if(keyIsDown(DOWN_ARROW))
  {
    velocity *= 0.95;
    if(speedRate>1)
    {
      speedRate -= 0.02;
    }
  }

  movieLib[currI][currJ][currK].speed(speedRate);
  if(playingSong!=null)
    playingSong.rate(0.75+speedRate/3);

  var roundedVelocity = Math.round(velocity);
  speedometer.html(roundedVelocity + " MPH"); ///
  speed = roundedVelocity;
}

function updateSpeedWithPedal()
{
  if(gasVal > 300)
  {
    if(gasVal > 900)
    gasVal*1.5;
    var gasMultiplier = 1 + gasVal / 200;

    if(power < 0.1)
    {
      power+=0.0002 * gasMultiplier;
    }

    velocity += power;

    if (speedRate < 2.5) {
      speedRate += 0.001 * gasMultiplier;
    }
    else {
      {
        speedRate = 2.5;
      }
    }
  }
  else
  {
    power *= 0.98;
    velocity*=drag;

    if(speedRate >= 0.80)
    {
      speedRate -= 0.005;
    }
  }

  if(brakeVal > 400)
  {
    var brakeMultiplier = 1+brakeVal/1023
    velocity *= 0.96*brakeMultiplier;
    if(speedRate>0.25)
    {
      speedRate -= 0.01;
    }
  }
  else
  {
    if(speedRate < 1)
    {
      speedRate += 0.003;
    }
  }

  if(velocity >= 200)
  {
    velocity = 200;
  }

  movieLib[currI][currJ][currK].speed(speedRate);
  if(playingSong!=null)
  {
    playingSong.rate(0.7+speedRate/3);
  }

  var roundedVelocity = Math.round(velocity);
  speedometer.html(roundedVelocity + " MPH");
  speed = roundedVelocity;

  // print("speedRate: "+speedRate);
}

function keyPressed() {

  // print(direction);
  if (keyCode === LEFT_ARROW) {
    direction = "left";
    updateCarStatus();
  } else if (keyCode === RIGHT_ARROW) {
    direction = "right";
    updateCarStatus();
  } else if (keyCode === ENTER)
  {
    startCar(100);
  }else if (keyCode === DELETE)
  {
    stop();
  }

}

function updateCarStatus() // true if left, false if right
{
  var tempI = currI;
  var tempJ = currJ;
  var tempK = currK;
  getNewIndices();
  // movieLib[currI][currJ][currK].speed(speedRate);

  movieLib[tempI][tempJ][tempK].stop();
  movieLib[tempI][tempJ][tempK].hide();
  movieLib[currI][currJ][currK].show();
  movieLib[currI][currJ][currK].volume(0.8);
  movieLib[currI][currJ][currK].play();
  movieLib[currI][currJ][currK].onended(playNext);

}

function playNext()
{
  updateCarStatus();
}

function velocityIntoCategory()
{
  // if(speed >= 0 && speed < 5)
  // {
  //   return 0;
  // }
  // else if(speed >= 5 && speed < 45)
  // {
  //   return 1;
  // }
  // else if(speed >= 45)
  // {
  //   return 2;
  // }
  return 2;
}

function getNewIndices()
{
  currI = velocityIntoCategory();
  // println("current i: " + currI);

  currJ = directionToInt(direction);
  // println("current j: " + currJ);

  var currLib = movieLib[currI][currJ];
  var currLibLength = currLib.length;
  var randomIndex = getRandomInt(0, currLibLength-1);

  while(currK != randomIndex)
  {
    currK = getRandomInt(0, currLibLength-1);
  }
  // println("current K: " + currK);
}

function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}


function start()
{
  movieLib[0][1][5].pause();//tom cruise
  movieLib[0][1][5].hide();
  movieLib[currI][currJ][currK].show();
  movieLib[currI][currJ][currK].play();
  movieLib[currI][currJ][currK].onended(playNext);
}

function preStart()
{
  currSong = songs[0];
  movieLib[0][1][5].show();
  movieLib[0][1][5].loop();
}

function stop()
{
  playingSong.pause();
 	movieLib[currI][currJ][currK].pause();
  movieLib[currI][currJ][currK].hide();
  preStart();
}
