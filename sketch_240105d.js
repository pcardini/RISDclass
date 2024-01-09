let shapes = [];
let currentPoints = [];
let isClosed = false;
let closePoint;
let apiUrl = "https://quotesondesign.com/wp-json/wp/v2/posts/?orderby=rand";
let currentQuote = "";
let quoteUrl; // Global variable for the quote URL
let fillColor;

function setup() {
  createCanvas(800, 600);
  textSize(20); // Increase font size for better resolution
  textAlign(CENTER, CENTER);
  currentPoints = [];
  isClosed = false;
  loadRandomQuote(); // Load the first random quote
}

function draw() {
  background(0);
  shapes.forEach(shape => {
    shape.display(); // Display all stored shapes
  });
  if (isClosed) {
    fillShape();
    displayQuote();
  } else {
    drawLines();
  }
}

function mousePressed() {
  let newPoint = createVector(mouseX, mouseY);

  if (isClosed) {
    shapes.push(new Shape(currentPoints, fillColor)); // Store the completed shape
    currentPoints = [];
    isClosed = false;
    loadRandomQuote(); // Load a new random quote
  } else if (currentPoints.length > 0 && newPoint.dist(currentPoints[0]) < 10) {
    isClosed = true;
    closePoint = currentPoints[0];
    fillColor = color(random(255), random(255), random(255), 150); // Assign a random color
  } else {
    currentPoints.push(newPoint);
  }
}

function drawLines() {
  stroke(255);
  strokeWeight(2);
  noFill();
  beginShape();
  currentPoints.forEach(p => {
    vertex(p.x, p.y);
  });
  if (!isClosed && currentPoints.length > 0) {
    vertex(mouseX, mouseY); // Draw line to current mouse position
  }
  endShape();
}

function fillShape() {
  fill(fillColor);
  beginShape();
  currentPoints.forEach(p => {
    vertex(p.x, p.y);
  });
  endShape(CLOSE);
}

function displayQuote() {
  if (currentQuote !== "") {
    // Set text properties
    fill(0); // Black text

    // Calculate the width of the text and split into lines if necessary
    let words = currentQuote.split(" ");
    let lines = [];
    let currentLine = "";

    words.forEach(word => {
      if (textWidth(currentLine + word) < width - 100) { // 100 pixels padding for safety
        currentLine += word + " ";
      } else {
        lines.push(currentLine);
        currentLine = word + " ";
      }
    });
    lines.push(currentLine); // Add the last line

    // Calculate the position for the text
    let x = width / 2;
    let startY = height / 2 - (lines.length * (textAscent() + textDescent() + 5)) / 2; // Adjust Y start position based on the number of lines

    lines.forEach((line, i) => {
      let y = startY + i * (textAscent() + textDescent() + 5); // Position for this line

      // Calculate the size for the background highlight for this line
      let w = textWidth(line) + 20; // 20 pixels padding
      let h = textAscent() + textDescent() + 5; // Height for one line

      // Draw white background highlight for this line
      fill(255);
      rectMode(CENTER);
      rect(x, y, w, h);

      // Draw the text for this line
      fill(0); // Black text
      text(line, x, y);
    });
  }
}

function loadRandomQuote() {
  // Add a unique cache-buster parameter to the URL with an ampersand (&)
  quoteUrl = apiUrl + "&cb=" + Date.now();
  fetchQuote(); // Fetch the quote
}

// Function to fetch and update the quote
async function fetchQuote() {
  try {
    let response = await fetch(quoteUrl);
    if (!response.ok) throw new Error('Response not okay');
    let data = await response.json();
    if (data.length > 0) {
      let firstPost = data[0];
      let content = firstPost.content.rendered.replace(/<[^>]*>/g, ""); // Remove HTML tags
      content = decodeHtmlEntities(content); // Decode HTML entities

      let author = "";
      if (firstPost.title && firstPost.title.rendered) {
        author = firstPost.title.rendered.trim();
        author = decodeHtmlEntities(author); // Decode HTML entities in the author's name
      }

      // Combine the quote and the author
      currentQuote = content.trim() + (author === "" ? "" : " - " + author);
    }
  } catch (e) {
    console.error("Error fetching quote:", e.message);
  }
}

// Function to replace common HTML entities with their respective characters
function decodeHtmlEntities(input) {
  let textarea = document.createElement('textarea');
  textarea.innerHTML = input;
  return textarea.value;
}

// Shape class
class Shape {
  constructor(points, fillColor) {
    this.points = points.slice(); // Create a copy of the points array
    this.fillColor = fillColor;
  }

  display() {
    fill(this.fillColor);
    beginShape();
    this.points.forEach(p => {
      vertex(p.x, p.y);
    });
    endShape(CLOSE);
  }
}
