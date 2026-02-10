let exampleShader;
let cam;
let backgroundImage;
let slider;
let toggle = false;
let button;

function toggleState() {
  toggle = !toggle; // Toggle boolean
  if (toggle) {
    button.html('Color'); // Update label
  } else {
    button.html('BW'); // Update label
  }
}


function preload() {
  exampleShader = loadShader('example.vert', 'example.frag');
  backgroundImage = loadImage('img/7.jpg');
}


function setup() {
  createCanvas(800, 800, WEBGL);

  slider = createSlider(0, 255);
  slider.position(10, 10);
  slider.size(80);

  button = createButton('BW'); // Initial state text
  button.position(10, 30);
  button.mousePressed(toggleState); // Attach callback function


  // cam = createCapture(VIDEO);
  // cam.size(600, 600);
  // cam.hide(); // Hide the default HTML video element

  noStroke();
}

function draw() {
  shader(exampleShader);

  exampleShader.setUniform("u_resolution", [width, height]);
  exampleShader.setUniform("background", backgroundImage);
  exampleShader.setUniform("u_time", millis());
  exampleShader.setUniform("u_mouse", [mouseX / width, mouseY / height]);
  exampleShader.setUniform("u_scale", slider.value());
  // exampleShader.setUniform('cam', cam);
  exampleShader.setUniform('toggle', toggle);



  // console.log(u_time);

  rect(-width/2, -height/2, width);
}
