let GSlider, m1Slider, m2Slider, vSlider, angleSlider, initialDistanceSlider;
let G, m1, m2, initialSpeed, initialAngle, initialDistance;
let planet;
let velocities = [];
let distances = [];
let previousMaxTime = 0;
let previousMinTime = 0;
let isPaused = false;
let startTime = 0; // 시뮬레이션 시작 시간

// 극대값과 극솟값을 저장하는 배열 추가
let maxValues = [];
let minValues = [];

function setup() {
  createCanvas(1620, 1000);

  createP("중력 상수 (G)");
  GSlider = createSlider(1, 20, 5, 0.1);

  createP("공전하는 행성의 질량 (m1)");
  m1Slider = createSlider(1, 500, 10, 1);

  createP("중심에 있는 행성의 질량 (m2)");
  m2Slider = createSlider(100, 5000, 500, 10);

  createP("초기 속도");
  vSlider = createSlider(0, 20, 5, 0.1);

  createP("초기 거리");
  initialDistanceSlider = createSlider(100, 600, 300, 10);

  createP("초기 각도");
  angleSlider = createSlider(0, 360, 90, 1);

  resetSimulation();
}

function draw() {
  background(0);

  if (!isPaused) {
    G = GSlider.value();
    m1 = m1Slider.value();
    m2 = m2Slider.value();
    initialSpeed = vSlider.value();
    initialAngle = radians(angleSlider.value());
    initialDistance = initialDistanceSlider.value();

    planet.update();

    velocities.push(planet.vel.mag());
    distances.push(planet.pos.mag());
  }

  fill(0, 0, 255);
  textSize(16);
  textAlign(LEFT);
  text(`초기 속도: ${nf(initialSpeed, 0, 2)}`, 10, height - 120);
  text(`현재 속도: ${nf(planet.vel.mag(), 0, 2)}`, 10, height - 100);
  text(`현재 거리: ${nf(planet.pos.mag(), 0, 2)}`, 10, height - 80);
  text(`초기 거리: ${nf(initialDistance, 0, 2)}`, 10, height - 60);
  text(`시간 차이: ${nf(previousMaxTime, 0, 2)} s`, 10, height - 40);

  plotGraphs();
  planet.show();
  displayRatio();
}

function keyPressed() {
  if (key === 'R' || key === 'r') {
    resetSimulation();
  }
  if (key === 'T' || key === 't') {
    isPaused = !isPaused;
  }
}

function resetSimulation() {
  velocities = [];
  distances = [];
  previousMaxTime = 0;
  previousMinTime = 0;
  maxValues = [];
  minValues = [];
  startTime = millis() / 1000;

  initialSpeed = vSlider.value();
  initialAngle = radians(angleSlider.value());
  initialDistance = initialDistanceSlider.value();

  let initialPos = createVector(initialDistance, 0);
  let initialVel = p5.Vector.fromAngle(initialAngle).mult(initialSpeed);
  planet = new Planet(initialPos, initialVel);
}

class Planet {
  constructor(pos, vel) {
    this.pos = pos;
    this.vel = vel;
    this.path = [];
  }

  update() {
    let r = this.pos.mag();
    let forceMag = (G * m1 * m2) / (r * r);
    let force = this.pos.copy().normalize().mult(-forceMag);
    let accel = force.div(m1);

    this.vel.add(accel);
    this.pos.add(this.vel);

    this.path.push(this.pos.copy());
    if (this.path.length > 1000) {
      this.path.splice(0, 1);
    }

    this.calculateTimeDifference();
  }

  calculateTimeDifference() {
    if (velocities.length >= 3 && distances.length >= 3) {
      let currentTime = millis() / 1000 - startTime; // 현재 시간

      if (velocities[velocities.length - 2] > velocities[velocities.length - 3] &&
          velocities[velocities.length - 2] > velocities[velocities.length - 1]) {
          
        let maxTime = currentTime;
        if (maxValues.length > 0) {
          previousMaxTime = maxTime - maxValues[maxValues.length - 1];
        }
        maxValues.push(maxTime);
      }
    }
  }

  show() {
    translate(width / 4, height * 3 / 5);
    fill(255);
    ellipse(0, 0, 20, 20);

    noFill();
    stroke(100, 100, 255);
    beginShape();
    for (let pos of this.path) {
      vertex(pos.x, pos.y);
    }
    endShape();

    fill(100, 100, 255);
    ellipse(this.pos.x, this.pos.y, 10, 10);
  }
}

function plotGraphs() {
  push();
  translate(width / 2 + 200, 0);

  stroke(255, 0, 0);
  beginShape();
  for (let i = 1; i < velocities.length - 1; i++) {
    let x = map(i, 0, velocities.length - 1, 0, 300);
    let y = map(velocities[i], 0, 20, height - 900, height - 600);

    if (velocities[i] > velocities[i - 1] && velocities[i] > velocities[i + 1]) {
      fill(255, 0, 0);
      ellipse(x, y, 5, 5);
      text(`극댓값 (속도): ${nf(velocities[i], 0, 2)}`, x, y - 5);
      fill(0); 
      noStroke(); 
      rect(460, 20, 470, 20); 
      fill(255, 0, 0);
      text(`극댓값 속도: ${nf(velocities[i], 0, 2)}`, 465, 40);
    }
    if (velocities[i] < velocities[i - 1] && velocities[i] < velocities[i + 1]) {
      fill(0); 
      noStroke(); 
      rect(460, 42, 470, 42);
      fill(255, 0, 0);
      ellipse(x, y, 5, 5);
      text(`극솟값 (속도): ${nf(velocities[i], 0, 2)}`, x, y + 15);
      text(`극솟값 속도: ${nf(velocities[i])}`, 465, 60);
    }

    vertex(x, y);
  }
  endShape();

  stroke(0, 255, 0);
  beginShape();
  for (let i = 1; i < distances.length - 1; i++) {
    let x = map(i, 0, distances.length - 1, 0, 300);
    let y = map(distances[i], 0, 600, height - 500, height - 100);

    if (distances[i] > distances[i - 1] && distances[i] > distances[i + 1]) {
      fill(0);
      noStroke();
      rect(460, 80, 470, 85);

      fill(0, 255, 0);
      ellipse(x, y, 5, 5);
      text(`극댓값 (거리): ${nf(distances[i], 0, 2)}`, x, y - 5);
      text(`극댓값 거리: ${nf(distances[i], 0, 2)}`, 465, 100);
    }
    if (distances[i] < distances[i - 1] && distances[i] < distances[i + 1]) {
      fill(0, 255, 0);
      ellipse(x, y, 5, 5);
      text(`극솟값 (거리):${nf(distances[i], 0, 2)}`, x, y + 15);
      text(`극솟값 (거리): ${nf(distances[i], 0, 2)}`, 465, 120);
    }

    vertex(x, y);
  }
  endShape();

  pop();

  // 극대값과 극솟값 간의 시간 차이를 표로 나타내기
  fill(255);
  textSize(16);
  textAlign(LEFT); 
  let tableX = width / 2 + 500;
  text("공전 주기", tableX, height - 160);
  
  //text("시간 차이 (극솟값)", tableX, height - 140);
  for (let i = 0; i < maxValues.length; i++) {
    text(nf(maxValues[i], 0, 2), tableX + 150, height - 160 - i * 20);
  }
  //for (let i = 0; i < minValues.length; i++) {
   //text(nf(minValues[i], 0, 2), tableX + 150, height - 140 - i * 20);
  //}
  fill(255);
  textSize(16);
  textAlign(RIGHT);
  text("극댓값/극솟값", 1590, 20);
  //text(`극댓값 속도: ${velocities.length > 0 ? nf(max(velocities), 0, 2) : 'N/A'}`, 1590, 40);
  //text(`극솟값 속도: ${velocities.length > 0 ? nf(min(velocities), 0, 2) : 'N/A'}`, 1590,60);
  //text(`극솟값 거리: ${distances.length > 0 ? nf(min(distances), 0, 2) : 'N/A'}`, 1590,  100);
}

function displayRatio() {
  for (let i = 1; i < distances.length - 1; i++) {
    if (distances[i] > distances[i - 1] && distances[i] > distances[i + 1]) {
      let maxDistance = distances[i];
      let deltaTime = maxValues[maxValues.length - 1] - maxValues[maxValues.length - 2];
      let ratio = (deltaTime ** 2) * 1000000 / (maxDistance ** 3);
      let q = deltaTime;
      let w = maxDistance;

      fill(0); // 이전 텍스트를 덮어씀
      noStroke();
      rect(0, -580, 600, 100); // 텍스트를 덮어쓸 영역에 사각형 그리기

      fill(255);
      textSize(16);
      textAlign(LEFT);
      text(`주기 제곱 / 거리 세제곱: ${nf(ratio, 0, 6)}`, 0, -500);
      text(`주기: ${nf(q, 0, 6)}`, 0, -550);
      text(`거리: ${nf(w, 50, 6)}`, 0, -530);
    }
  }
}



