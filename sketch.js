let excerpts = [
  "your letters are no small portion of my spiritual food, and help to keep my soul alive",
  "I have been musing and dreaming about a thousand things, with every one of which, I do believe, some nearer or remoter thought of you was intermingled.",
  "I wish it were possible to convey them directly into your heart, with the warmth of mine still lingering in them.",
  "peace overflows from your heart into mine.",
  "my heart longed to drink your thoughts and feelings, as a parched throat for cold water.",
  "our hearts here draw towards one another so unusually—that we have not cultivated our friendship, but let it grow,—that we have thrown ourselves upon one another with such perfect trust",
  "I yearn for you, and my heart heaves when I think of you",
  "My heart yearns to communicate to you",
  "We are married!",
  "I am a machine, and am surrounded by hundreds of similar machines",
  "How much of life we waste!",
  "Every letter of yours is as fresh and new as if you had never written a preceding one"
];

let visibleExcerpts = [];
let excerptIndex = 0;

let heartbeat = [180, 850];
let beatPhase = 0;
let nextBeatTime = 0;

let lastClickTime = 0;
let lastClickedItem = null;
let doubleClickDelay = 350;

function setup() {
  createCanvas(windowWidth, windowHeight);

  background(0);
  textFont("Georgia");
  textAlign(LEFT, TOP);

  nextBeatTime = millis() + 500;
}

function draw() {
  background(0);

  // Novos excertos aparecem ao ritmo do coração
  if (millis() >= nextBeatTime) {
    heartbeatBeat();

    nextBeatTime = millis() + heartbeat[beatPhase];

    beatPhase++;

    if (beatPhase >= heartbeat.length) {
      beatPhase = 0;
    }
  }

  // Atualizar e desenhar os excertos
  for (let item of visibleExcerpts) {

    if (item.erased) continue;

    let hovering =
      mouseX >= item.x &&
      mouseX <= item.x + item.width &&
      mouseY >= item.y &&
      mouseY <= item.y + item.height;

    // O cursor apaga progressivamente o texto
    if (hovering && !item.fixed) {
      item.opacity -= 12;
    }

    if (item.opacity <= 0) {
      item.erased = true;
      continue;
    }

    fill(255, item.opacity);
    noStroke();
    textSize(item.size);

    text(item.content, item.x, item.y, item.width);
  }
}

function heartbeatBeat() {
  let content = excerpts[excerptIndex];

  let size = random(15, 29);
  let x = random(15, max(16, width - 180));
  let y = random(15, max(16, height - 100));
  let boxWidth = random(width * 0.18, width * 0.48);

  textSize(size);

  let words = content.split(" ");
  let line = "";
  let lines = 1;

  for (let word of words) {
    let testLine = line + word + " ";

    if (textWidth(testLine) > boxWidth && line !== "") {
      lines++;
      line = word + " ";
    } else {
      line = testLine;
    }
  }

  let heightText = lines * (textAscent() + textDescent()) * 1.25;

  visibleExcerpts.push({
    content: content,
    x: x,
    y: y,
    size: size,
    width: boxWidth,
    height: heightText,
    opacity: 255,
    erased: false,
    fixed: false
  });

  excerptIndex++;

  if (excerptIndex >= excerpts.length) {
    excerptIndex = 0;
  }
}

// Dois cliques fixam o excerto
function doubleClicked(item) {
  item.fixed = true;
}

// Detetar dois cliques no mesmo excerto
function mousePressed() {
  let now = millis();
  let clickedItem = null;

  for (let i = visibleExcerpts.length - 1; i >= 0; i--) {
    let item = visibleExcerpts[i];

    if (item.erased) continue;

    let hovering =
      mouseX >= item.x &&
      mouseX <= item.x + item.width &&
      mouseY >= item.y &&
      mouseY <= item.y + item.height;

    if (hovering) {
      clickedItem = item;
      break;
    }
  }

  if (clickedItem) {
    if (
      clickedItem === lastClickedItem &&
      now - lastClickTime < doubleClickDelay
    ) {
      doubleClicked(clickedItem);
      lastClickedItem = null;
      lastClickTime = 0;
    } else {
      lastClickedItem = clickedItem;
      lastClickTime = now;
    }
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}