setTimeout(function(){
  document.getElementById("bgvid").play();
}, 5000);

//controls the fade in
var el = document.querySelector('#bgvid');
setTimeout(function(){
  if (el.classList.contains('is-paused')){
    el.classList.remove('is-paused');
  }
}, 5000);

var countDiv = document.getElementById('countdown');
var count = 4;

var interval = setInterval(function(){ 
  if(count > 0) {
    countDiv.innerHTML = count;
    count--;
  } else {
    countDiv.innerHTML = "Get It!";
    clearInterval(interval);
  }
}, 1000);

var playButton = document.getElementById('playButton');
playButton.addEventListener("click", function() {
  document.getElementById("bgvid").play();
});
