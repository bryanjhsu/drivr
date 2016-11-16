var library = [];

function fillLibrary()
{
  for (var r = 0; r < table.getRowCount(); r++)
  {
    var newClip = new Clip
    newClip.setId(table.getString(r,0));
    newClip.setDirection(table.getString(r,1));
    newClip.setSpecial(table.getString(r,2));
    newClip.setSpeed(table.getString(r,3));
    newClip.setFileName(table.getString(r,4));
    newClip.setMovie(table.getString(r,5));
    newClip.setYear(table.getString(r,6));
    newClip.setIsDaytime(table.getString(r,7));

    library.push(newClip);
  }

  createVideos();
}

function createVideos()
{
  for(var i = 0 ; i < library.length; i++)
  {
    var vid = createVideo("clips/"+library[i].fileName);
    vid.size(1080, 720);
    vid.hide();
    vids.push(vid);
  }

  vidsSize = vids.length-1;
}

function Clip()
{
  this.id = "";
  this.direction = "";
  this.special = "";
  this.speed = "";
  this.fileName = "";
  this.movie = "";
  this.year = "";
  this.isDayTime = "";

  this.setId = function(id)
  {
    this.id = id;
  }

  this.setDirection = function(direction)
  {
    this.direction = direction;
  }

  this.setSpecial = function(special)
  {
    this.special = special;
  }

  this.setSpeed = function(speed)
  {
    this.speed = speed;
  }

  this.setFileName = function(fileName)
  {
    this.fileName = fileName;
  }

  this.setMovie = function(movie)
  {
    this.movie = movie;
  }

  this.setYear = function(year)
  {
    this.year = year;
  }

  this.setIsDaytime = function(isDayTime)
  {
    this.isDayTime = isDayTime;
  }
}

/**
if param not needed, leave blank
@param {String} id unique id of specific video
@param {String} direction "left", "right", "straight"
@param {String} speedCategory 0, 1, 2, 3, 4, 5
@param {String} special special words separated by commas
@param {String} movie movie title
@param {String} isDayTime true or false
*/

//get random index. if vid at index fits params, go. otherwise, try again.
//might need to optimize
function getMovieWithParams(id, direction, speedCategory, special, movie, isDaytime)
{
  var randomIndex = Math.floor(Math.random() * (library.length + 1));

  var randomVid = library[randomIndex];

  if((id !== "" || randomVid.id == id) &&
  (direction !== "" || randomVid.direction == direction) &&
  (speedCategory !== "" || randomVid.speedCategory == speedCategory) &&
  // (id !== "" || randomVid.id == id) &&
  (movie !== "" || randomVid.movie == movie) &&
  (isDaytime !== "" || randomVid.id == isDaytime))
  {
    return randomVid;
  }
  else {
    return getMoviesWithParams(id, direction, speedCategory, special, movie, isDaytime);
  }


}
