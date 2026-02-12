// GLSL uniforms 
const uniforms = {
  toggles: {
    u_color_bg: { label: ["BW", "Color"], default: false },
    u_color_fg: { label: ["BW", "Color"], default: false },
  },
  sliders: {
    u_grid_bg: { min: 5, max: 500, default: 50, step: 1 },
    u_grid_fg: { min: 5, max: 500, default: 50, step: 1 },
    u_bright_bg: { min: 0, max: 1, default: 0.5, step: 0.001 },
    u_merge_bg: { min: 0, max: 1, default: 0.5, step: 0.001 },
  }
};

// Dynamic states
const toggleStates = {};
const sliderValues = {};
const buttons = {};
const sliders = {};

let exampleShader;
let cam;
let bg;
let bg2;
let slider;
let slider2;
let toggle = false;
let toggle2 = false;
let button;
let button2;
let video;



function preload() {
  exampleShader = loadShader('example.vert', 'example.frag');
  bg = loadImage('img/backgrounds/bg7.jpg');
  bg2 = loadImage('img/backgrounds/bg1.jpg');
  collage = loadImage('img/collage/col2.jpg');
  // video = createVideo(['mov/TrainBoost.mov']);
  // video.loop(); // Set the video to loop and start playing
  // video.hide();
}


function setup() {
  createCanvas(800, 800, WEBGL);

  // cam = createCapture(VIDEO);
  // cam.size(600, 600);
  // cam.hide(); // Hide the default HTML video element


  let yOffset = 10;
  // Toggles auto creation
  for (const [name, config] of Object.entries(uniforms.toggles)) {
    toggleStates[name] = config.default;
    buttons[name] = createButton(config.label[config.default ? 1 : 0]);
    buttons[name].position(800, yOffset);
    buttons[name].mousePressed(() => {
      toggleStates[name] = !toggleStates[name];
      buttons[name].html(config.label[toggleStates[name] ? 1 : 0]);
    });
    yOffset += 30;
  }

  // Sliders auto creation
  for (const [name, config] of Object.entries(uniforms.sliders)) {
    sliderValues[name] = config.default;
    sliders[name] = createSlider(config.min, config.max, config.default, config.step);
    sliders[name].position(800, yOffset);
    yOffset += 30;
  }

  noStroke();
}

function draw() {
  shader(exampleShader);

  exampleShader.setUniform("u_resolution", [width, height]);
  exampleShader.setUniform("u_time", millis());
  exampleShader.setUniform("u_mouse", [mouseX / width, mouseY / height]);

  // Images for digital collage
  exampleShader.setUniform("u_bg", bg);
  exampleShader.setUniform("u_bg2", bg2);

  exampleShader.setUniform("u_img", collage);
  // exampleShader.setUniform('cam', cam);
  // // exampleShader.setUniform('video', video);

  for (const name of Object.keys(uniforms.toggles)) {
    exampleShader.setUniform(name, toggleStates[name]);
  }
  for (const name of Object.keys(uniforms.sliders)) {
    exampleShader.setUniform(name, sliders[name].value());
  }


  // console.log(u_time);

  rect(-width/2, -height/2, width);
}
