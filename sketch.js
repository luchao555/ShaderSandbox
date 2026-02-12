// GLSL uniforms 
const uniforms = {
  toggles: {
    u_color_bg: { label: ["BW", "Color"], default: false, title: "Color BG", group: "background" },
    u_color_fg: { label: ["BW", "Color"], default: false, title: "Color FG", group: "foreground"  },
    u_show_fg: { label: ["Show", "Hide"], default: false, title: "Show FG", group: "foreground"  },
  },
  sliders: {
    // FG sliders
    u_grid_fg: { min: 5, max: 500, default: 100, step: 1, title: "Grid size FG", group: "foreground"  },
    u_mask_fg: { min: 0, max: 1, default: 0.5, step: 0.001, title: "Mask FG", group: "foreground" },
    // BG sliders
    u_grid_bg: { min: 5, max: 500, default: 200, step: 1, title: "Grid size BG", group: "background" },
    u_bright_bg: { min: 0, max: 2, default: 1, step: 0.001, title: "Brightness BG 1", group: "background" },
    u_bright_bg_2: { min: 0, max: 2, default: 1, step: 0.001, title: "Brightness BG 2", group: "background"  },
    u_bright_bg_final: { min: 0, max: 2, default: 1, step: 0.001, title: "Brightness BG post merge", group: "background"  },
    //u_merge_bg: { min: 0, max: 1, default: 0.5, step: 0.001, title: "Merge BG", group: "background"  },
    // u_position_x_fg: { min: 0, max: 1, default: 0.5, step: 0.001, title: "Position X FG", group: "foreground"  },
    // u_position_y_fg: { min: 0, max: 1, default: 0.5, step: 0.001, title: "Position Y FG", group: "foreground"  },
    // u_size_fg: { min: 0, max: 1, default: 1, step: 0.001, title: "Size FG", group: "foreground"  },
  },
  colors: {
    u_color_accent_bg: { default: "#f14f2b", title: "BG Color", group: "background" },
    u_color_accent_fg: { default: "#39f1ba", title: "FG Accent", group: "foreground" },
  }
};

// Dynamic states
const toggleStates = {};
const sliderValues = {};
const buttons = {};
const sliders = {};
const colorPickers = {};

const columns = {
  background: { x: 800, y: 10, label: "Background" },
  foreground: { x: 1000, y: 10, label: "Foreground" },
};

let exampleShader;
let cam;
let bg;
let bg2;
let video;

function hexToVec3(hex) {
  const r = parseInt(hex.substring(1, 3), 16) / 255;
  const g = parseInt(hex.substring(3, 5), 16) / 255;
  const b = parseInt(hex.substring(5, 7), 16) / 255;
  return [r, g, b];
}

function preload() {
  exampleShader = loadShader('example.vert', 'example.frag');
  bg = loadImage('img/bg4.jpg');
  bg2 = loadImage('img/bg2.jpg');
  collage = loadImage('img/col2.jpg');
  // video = createVideo(['mov/TrainBoost.mov']);
  // video.loop(); // Set the video to loop and start playing
  // video.hide();
}


function setup() {
  createCanvas(800, 800, WEBGL);

  // cam = createCapture(VIDEO);
  // cam.size(600, 600);
  // cam.hide(); // Hide the default HTML video element


   // Compteurs Y par colonne
  const yOffsets = {};
  for (const [key, col] of Object.entries(columns)) {
    yOffsets[key] = col.y;
    const header = createElement("h3", col.label);
    header.position(col.x, yOffsets[key]);
    header.style("color", "black");
    header.style("margin", "0");
    header.style("font-size", "14px");
    yOffsets[key] += 30;
  }
    // Colors
  for (const [name, config] of Object.entries(uniforms.colors)) {
    const col = columns[config.group];
    const y = yOffsets[config.group];

    const label = createP(config.title);
    label.position(col.x, y - 8);
    label.style("color", "black");
    label.style("margin", "0");
    label.style("font-size", "11px");

    colorPickers[name] = createElement("input");
    colorPickers[name].attribute("type", "color");
    colorPickers[name].attribute("value", config.default);
    colorPickers[name].position(col.x, y + 12);
    colorPickers[name].style("width", "60px");
    colorPickers[name].style("height", "30px");

    yOffsets[config.group] += 55;
  }

  // Toggles
  for (const [name, config] of Object.entries(uniforms.toggles)) {
    const col = columns[config.group];
    const y = yOffsets[config.group];

    // Titre
    const label = createP(config.title);
    label.position(col.x, y - 8);
    label.style("color", "black");
    label.style("margin", "0");
    label.style("font-size", "11px");

    // Bouton
    toggleStates[name] = config.default;
    buttons[name] = createButton(config.label[config.default ? 1 : 0]);
    buttons[name].position(col.x, y + 12);
    buttons[name].mousePressed(() => {
      toggleStates[name] = !toggleStates[name];
      buttons[name].html(config.label[toggleStates[name] ? 1 : 0]);
    });

    yOffsets[config.group] += 50;
  }

  // Sliders
  for (const [name, config] of Object.entries(uniforms.sliders)) {
    const col = columns[config.group];
    const y = yOffsets[config.group];

    // Titre
    const label = createP(config.title);
    label.position(col.x, y - 8);
    label.style("color", "black");
    label.style("margin", "0");
    label.style("font-size", "11px");

    // Slider
    sliders[name] = createSlider(config.min, config.max, config.default, config.step);
    sliders[name].position(col.x, y + 12);
    sliders[name].style("width", "180px");

    yOffsets[config.group] += 50;
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
  exampleShader.setUniform("u_bg_2", bg2);

  exampleShader.setUniform("u_img", collage);
  // exampleShader.setUniform('cam', cam);
  // exampleShader.setUniform('video', video);

  for (const name of Object.keys(uniforms.toggles)) {
    exampleShader.setUniform(name, toggleStates[name]);
  }
  for (const name of Object.keys(uniforms.sliders)) {
    exampleShader.setUniform(name, sliders[name].value());
  }
  for (const name of Object.keys(uniforms.colors)) {
    exampleShader.setUniform(name, hexToVec3(colorPickers[name].value()));
  }  

  // console.log(u_time);

  rect(-width/2, -height/2, width);
}
