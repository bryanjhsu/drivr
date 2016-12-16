
var speedometer;
var engineStart;
var engineStall;
var engineFinish;

var isEngineOn = false;
function startCar(iVal)//iVal serial value from 0-100
{
  if(iVal == 0)
  {
    //do nothing
    isEngineTurningOn = false;
    isEngineOn = false;
    stop();
  }
  else if(iVal == 1)
  {
    if(!isEngineOn)
    {
     	isEngineOn = true;
      engineFinish.play();
      start();
      //play engine finish on
    }
  }
}
