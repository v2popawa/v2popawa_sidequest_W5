/*
Week 5 — Example 1: Top-Down Camera Follow (Centered, No Bounds)

Course: GBDA302 | Instructors: Dr. Karen Cochrane & David Han
Date: Feb. 12, 2026

Move: WASD/Arrows

Goal:
- Keep player position in world space
- Compute a camera offset from the player (view state)
- Draw world using translate(-cam.x, -cam.y)
- Draw HUD in screen space (no translate)
*/
let player = { x: 400, y: 300, s: 3 };
let cam = { x: 0, y: 0 };

const WORLD_W = 4000;
const WORLD_H = 1600;
const VIEW_W = 800;
const VIEW_H = 480;

let fish = [];
let sharks = [];
let islands = [];
let jellyfishClusters = [];

function setup() {
  createCanvas(VIEW_W, VIEW_H);

  // ----- Fish -----
  for (let i = 0; i < 20; i++) {
    fish.push({
      x: random(0, WORLD_W),
      y: random(200, WORLD_H - 200),
      size: random(12, 20),
      vx: random(1.5, 2.5),
      phase: random(TWO_PI),
    });
  }

  // ----- Sharks -----
  for (let i = 0; i < 7; i++) {
    sharks.push({
      x: random(0, WORLD_W),
      y: random(900, WORLD_H - 100),
      size: random(40, 60),
      speed: random(1.5, 2.5),
    });
  }

  // ----- Islands (random positions to the right) -----
  for (let i = 0; i < 5; i++) {
    islands.push({
      x: random(900 + i * 400, 900 + i * 400 + 200),
      y: random(300, WORLD_H - 300),
      w: random(120, 200),
      h: random(70, 120),
    });
  }

  // ----- Jellyfish Clusters (to appear further right) -----
  for (let i = 0; i < 4; i++) {
    let clusterX = 1500 + i * 400;
    let cluster = [];
    for (let j = 0; j < 5; j++) {
      cluster.push({
        x: clusterX + random(-50, 50),
        y: random(400, WORLD_H - 200),
        size: random(40, 60),
        phase: random(TWO_PI),
      });
    }
    jellyfishClusters.push(cluster);
  }
}

function draw() {
  // ---------- Player Movement ----------
  const dx =
    (keyIsDown(RIGHT_ARROW) || keyIsDown(68)) -
    (keyIsDown(LEFT_ARROW) || keyIsDown(65));
  const dy =
    (keyIsDown(DOWN_ARROW) || keyIsDown(83)) -
    (keyIsDown(UP_ARROW) || keyIsDown(87));
  const len = max(1, abs(dx) + abs(dy));
  player.x += (dx / len) * player.s;
  player.y += (dy / len) * player.s;

  player.x = constrain(player.x, 0, WORLD_W);
  player.y = constrain(player.y, 0, WORLD_H);

  // ---------- Camera Follows Player ----------
  cam.x = player.x - width / 2;
  cam.y = player.y - height / 2;

  // ---------- Background Sky Gradient ----------
  for (let y = 0; y < height; y++) {
    let c = lerpColor(color(180, 210, 240), color(255, 190, 170), y / height);
    stroke(c);
    line(0, y, width, y);
  }

  push();
  translate(-cam.x, -cam.y);

  // ---------- Waves ----------
  stroke(70, 150, 200, 120);
  for (let y = 0; y < WORLD_H; y += 15) {
    for (let x = cam.x - 100; x < cam.x + width + 100; x += 40) {
      let wave = sin(x * 0.02 + y * 0.015 + frameCount * 0.05) * 5;
      line(x, y + wave, x + 30, y + wave);
    }
  }

  // ---------- Islands ----------
  for (let isl of islands) {
    if (player.x > isl.x - 400) {
      // appear when player approaches
      noStroke();
      fill(194, 178, 128);
      ellipse(isl.x, isl.y, isl.w, isl.h);

      fill(40, 120, 60);
      ellipse(isl.x, isl.y - isl.h * 0.3, isl.w * 0.5, isl.h * 0.5);

      fill(120, 80, 40);
      rect(isl.x - 5, isl.y - isl.h, 10, isl.h * 0.6);

      fill(30, 140, 70);
      ellipse(isl.x - 20, isl.y - isl.h, 60, 30);
      ellipse(isl.x + 20, isl.y - isl.h, 60, 30);
    }
  }

  // ---------- Jellyfish Clusters ----------
  for (let cluster of jellyfishClusters) {
    if (player.x > cluster[0].x - 400) {
      for (let jelly of cluster) {
        jelly.y += sin(frameCount * 0.04 + jelly.phase) * 0.5; // float

        fill(255, 150, 200, 180);
        noStroke();
        ellipse(jelly.x, jelly.y, jelly.size, jelly.size * 0.8);

        stroke(255, 150, 200, 180);
        for (let t = -15; t <= 15; t += 10) {
          line(
            jelly.x + t,
            jelly.y + jelly.size * 0.4,
            jelly.x + t + sin(frameCount * 0.1 + jelly.phase) * 5,
            jelly.y + jelly.size * 1.2,
          );
        }
      }
    }
  }

  // ---------- Sharks (appear anytime player moves down) ----------
  if (player.y > 800) {
    for (let i = 0; i < sharks.length; i++) {
      let s = sharks[i];

      s.x += s.speed;
      if (s.x > WORLD_W) s.x = 0;
      s.y += sin(frameCount * 0.03 + i) * 0.5;

      fill(120);
      noStroke();
      ellipse(s.x, s.y, s.size * 2, s.size);

      triangle(
        s.x - s.size,
        s.y,
        s.x - s.size * 1.8,
        s.y - s.size * 0.5,
        s.x - s.size * 1.8,
        s.y + s.size * 0.5,
      );

      triangle(
        s.x,
        s.y - s.size / 2,
        s.x + s.size / 2,
        s.y - s.size,
        s.x + s.size,
        s.y - s.size / 2,
      );
    }
  }

  // ---------- Fish ----------
  for (let f of fish) {
    f.x += f.vx; // forward
    f.y += sin(frameCount * 0.05 + f.phase) * 1;

    if (f.x > WORLD_W) f.x = 0;
    f.y = constrain(f.y, 50, WORLD_H - 50);

    if (
      f.x > cam.x - 50 &&
      f.x < cam.x + width + 50 &&
      f.y > cam.y - 50 &&
      f.y < cam.y + height + 50
    ) {
      let swimOffset = sin(frameCount * 0.05 + f.phase) * 3;
      push();
      translate(f.x + swimOffset, f.y);
      noStroke();
      fill(255, 220, 120);
      ellipse(0, 0, f.size * 1.5, f.size);
      fill(255, 180, 80);
      triangle(
        -f.size,
        0,
        -f.size * 1.5,
        -f.size * 0.4,
        -f.size * 1.5,
        f.size * 0.4,
      );
      pop();
    }
  }

  // ---------- Player Boat ----------
  fill(255, 100, 80);
  ellipse(player.x, player.y, 24, 12);
  triangle(
    player.x - 12,
    player.y,
    player.x - 20,
    player.y + 6,
    player.x - 20,
    player.y - 6,
  );

  pop();

  // ---------- HUD ----------
  fill(20);
  noStroke();
  text("Ocean Meditation — WASD/Arrows to move.", 12, 20);
}
