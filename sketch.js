let exampleShader;
let cam;
let backgroundImage;
let slider;
let slider2;
let toggle = false;
let toggle2 = false;
let button;
let button2;
let video;

function toggleState() {
  toggle = !toggle; // Toggle boolean
  if (toggle) {
    button.html('Color'); // Update label
  } else {
    button.html('BW'); // Update label
  }
}
function toggleState2() {
  toggle2 = !toggle2; // Toggle boolean
  if (toggle2) {
    button.html('Color'); // Update label
  } else {
    button.html('BW'); // Update label
  }
}


function preload() {
  exampleShader = loadShader('example.vert', 'example.frag');
  backgroundImage = loadImage('img/backgrounds/bg4.jpg');
  collage = loadImage('img/collage/col2.jpg');
  // video = createVideo(['mov/TrainBoost.mov']);
  // video.loop(); // Set the video to loop and start playing
  // video.hide();
}


function setup() {
  createCanvas(800, 800, WEBGL);

  slider = createSlider(0, 1000);
  slider.position(810, 10);
  slider.size(80);
  slider2 = createSlider(0, 1000);
  slider2.position(900, 10);
  slider2.size(80);

  button = createButton('BW'); // Initial state text
  button.position(810, 30);
  button.mousePressed(toggleState); // Attach callback function

  button2 = createButton('BW'); // Initial state text
  button2.position(900, 30);
  button2.mousePressed(toggleState2); // Attach callback function
  // cam = createCapture(VIDEO);
  // cam.size(600, 600);
  // cam.hide(); // Hide the default HTML video element


  noStroke();
}

function draw() {
  shader(exampleShader);

  exampleShader.setUniform("u_resolution", [width, height]);
  exampleShader.setUniform("u_bg", backgroundImage);
  exampleShader.setUniform("u_img", collage);
  exampleShader.setUniform("u_time", millis());
  exampleShader.setUniform("u_mouse", [mouseX / width, mouseY / height]);
  exampleShader.setUniform("u_grid", slider.value());
  exampleShader.setUniform("u_grid2", slider2.value());
  // exampleShader.setUniform('cam', cam);
  // exampleShader.setUniform('video', video);
  exampleShader.setUniform('u_toggle', toggle);
  exampleShader.setUniform('u_toggle2', toggle2);



  // console.log(u_time);

  rect(-width/2, -height/2, width);
}
