var currSong;
var playingSong;

function changeRadioStation(rVal)
{
  // print(rVal);
  currSong = songs[rVal];
  if(playingSong != null)
  {
    if(playingSong != currSong)
    {
      pauseAllSongs();
      playingSong = currSong;
      playingSong.loop();
    }
  }
  else {
    playingSong = currSong;
    playingSong.loop();
  }
}

function playRadioStatic()
{
  if(!staticNoise.isPlaying())
    staticNoise.play();
}
function pauseRadioStatic()
{
  if(staticNoise.isPlaying())
    staticNoise.pause();
}

function pauseAllSongs()
{
  for(var i = 0; i < songs.length; i++)
  {
    songs[i].pause();
  }

}
