document
  .getElementById("imageUpload")
  .addEventListener("change", handleImageUpload);

document.getElementById("confirmArea").addEventListener("click", confirmArea);

document
  .getElementById("csvUpload")
  .addEventListener("change", handleCSVUpload);

document
  .getElementById("fontUpload")
  .addEventListener("change", handleFontUpload);

document.getElementById("saveImages").addEventListener("click", saveImages);
document.getElementById("generate").addEventListener("click", () => {
  document.getElementById("home").style.display = "none";
  document.getElementById("st-1").style.display = "flex";
});
document.getElementById("bck1").addEventListener("click", () => {
  document.getElementById("home").style.display = "";
  document.getElementById("st-1").style.display = "none";
});
document.getElementById("bck2").addEventListener("click", () => {
  document.getElementById("st-1").style.display = "flex";
  document.getElementById("st-2").style.display = "none";
});
document.getElementById("reset").addEventListener("click", () => {
  document.getElementById("home").style.display = "";
  document.getElementById("st-1").style.display = "none";
  document.getElementById("st-2").style.display = "none";
});
let currentTheme = "dark";
let uploadedImage;
let selectedNames = ["Demo Name"];
let canvas, ctx, previewCanvas, previewCtx;
let startX, startY, endX, endY;
let isDrawing = true;
let customFont = null;
let customColor = "#ff0000";
let fontSize = 30;
let isDragging = false;
let textX, textY;
let rectX, rectY;
let textAlign = "left"; // Default text alignment
function handleImageUpload(event) {
  const file = event.target.files[0];
  const reader = new FileReader();
  reader.onload = function (e) {
    uploadedImage = new Image();
    uploadedImage.onload = function () {
      setUpCanvas();
    };
    uploadedImage.src = e.target.result;
  };
  reader.readAsDataURL(file);
}

function setUpCanvas() {
  canvas = document.getElementById("imageCanvas");
  canvas.width = uploadedImage.width;
  rectX = uploadedImage.width / 2;
  rectY = uploadedImage.height / 2;
  canvas.style.width = "100%";
  canvas.height = uploadedImage.height;
  canvas.style.height = "100%";
  ctx = canvas.getContext("2d");
  ctx.drawImage(uploadedImage, 0, 0);

  previewCanvas = document.getElementById("previewCanvas");
  previewCanvas.width = uploadedImage.width;
  previewCanvas.style.width = "100%";
  previewCanvas.height = uploadedImage.height;
  previewCanvas.style.height = "100%";
  previewCtx = previewCanvas.getContext("2d");
}

function confirmArea() {
  if (document.getElementById("imageUpload").value == "") {
    UIkit.notification({
      message: "Upload Certificate First",
      status: "danger",
    });
    return;
  }
  document.getElementById("st-1").style.display = "none";
  document.getElementById("st-2").style.display = "flex";

  document.getElementById("csvUpload").style.display = "block";
  document.getElementById("fontUpload").style.display = "block";
  document.getElementById("colorPicker").style.display = "block";
  document.getElementById("fontSize").style.display = "block";
  showPreview();

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(uploadedImage, 0, 0);

  document
    .getElementById("csvUpload")
    .addEventListener("change", handleCSVUpload);
  document
    .getElementById("fontUpload")
    .addEventListener("change", handleFontUpload);
  document
    .getElementById("colorPicker")
    .addEventListener("input", handleColorChange);
  document
    .getElementById("fontSize")
    .addEventListener("input", handleFontSizeChange);
}

function handleCSVUpload(event) {
  const file = event.target.files[0];
  const reader = new FileReader();

  reader.onload = function (e) {
    const lines = e.target.result.split("\n");
    selectedNames = lines.map((line) => line.trim());
    showPreview();
  };
  reader.readAsText(file);
}

function handleFontUpload(event) {
  const file = event.target.files[0];
  const reader = new FileReader();
  reader.onload = (e) => {
    const font = new FontFace("customFont", e.target.result);
    font.load().then((loadedFont) => {
      document.fonts.add(loadedFont);
      customFont = "customFont";
      showPreview();
    });
  };
  reader.readAsArrayBuffer(file);
}

function handleColorChange(event) {
  customColor = event.target.value;
  showPreview();
}

function handleFontSizeChange(event) {
  fontSize = event.target.value;
  showPreview();
}

function showPreview() {
  previewCtx.clearRect(0, 0, previewCanvas.width, previewCanvas.height);
  previewCtx.drawImage(uploadedImage, 0, 0);

  previewCtx.font = `${fontSize}px ${customFont || "Arial"}`;
  previewCtx.fillStyle = customColor;
  previewCtx.fillText(
    selectedNames[0],
    textX || rectX + 10,
    textY || rectY + 30
  );

  previewCanvas.addEventListener("mousedown", startDrag);
  previewCanvas.addEventListener("mousemove", dragText);
  previewCanvas.addEventListener("mouseup", stopDrag);
  previewCanvas.addEventListener("touchstart", startDragTouch, {
    passive: false,
  });
  previewCanvas.addEventListener("touchmove", dragTextTouch, {
    passive: false,
  });
  previewCanvas.addEventListener("touchend", stopDragTouch);
}

function startDrag(event) {
  previewCanvas.style.cursor = "grab";
  const rect = previewCanvas.getBoundingClientRect();
  textX = (event.clientX - rect.left) * (previewCanvas.width / rect.width);
  textY = (event.clientY - rect.top) * (previewCanvas.height / rect.height);
  isDragging = true;
}

function startDragTouch(event) {
  event.preventDefault();
  const rect = previewCanvas.getBoundingClientRect();
  const touch = event.touches[0];
  textX = (touch.clientX - rect.left) * (previewCanvas.width / rect.width);
  textY = (touch.clientY - rect.top) * (previewCanvas.height / rect.height);
  isDragging = true;
}

function dragText(event) {
  if (!isDragging) return;

  const rect = previewCanvas.getBoundingClientRect();
  textX = (event.clientX - rect.left) * (previewCanvas.width / rect.width);
  textY = (event.clientY - rect.top) * (previewCanvas.height / rect.height);

  showPreview();
}

function dragTextTouch(event) {
  if (!isDragging) return;
  event.preventDefault();

  const rect = previewCanvas.getBoundingClientRect();
  const touch = event.touches[0];
  textX = (touch.clientX - rect.left) * (previewCanvas.width / rect.width);
  textY = (event.clientY - rect.top) * (previewCanvas.height / rect.height);

  showPreview();
}

function stopDrag(event) {
  isDragging = false;
}

function stopDragTouch(event) {
  isDragging = false;
}

function saveImages() {
  if (document.getElementById("csvUpload").value == "") {
    UIkit.notification({
      message: "Upload Name list CSV/TXT",
      status: "danger",
    });
    return;
  }
  selectedNames.forEach((name, index) => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(uploadedImage, 0, 0);

    ctx.font = `${fontSize}px ${customFont || "Arial"}`;
    ctx.fillStyle = customColor;
    ctx.fillText(name, textX || rectX + 10, textY || rectY + 30);

    const link = document.createElement("a");
    link.download = `${name}.png`;
    link.href = canvas.toDataURL();
    link.click();
  });
}
function exportAsPDF() {
  if (typeof jspdf === "undefined") {
    console.error("jsPDF library not loaded");
    return;
  }

  if (selectedNames.length === 0) {
    UIkit.notification({
      message: "Please upload a name list first",
      status: "danger",
    });
    return;
  }

  const { jsPDF } = jspdf;
  const pdf = new jsPDF("l", "px", [canvas.width, canvas.height]);

  selectedNames.forEach((name, index) => {
    if (index > 0) pdf.addPage();

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(uploadedImage, 0, 0);

    ctx.font = `${fontSize}px ${customFont || "Arial"}`;
    ctx.fillStyle = customColor;
    ctx.textAlign = textAlign;

    let x = textX;
    if (textAlign === "center") {
      x = canvas.width / 2;
    } else if (textAlign === "right") {
      x = canvas.width - textX;
    }

    ctx.fillText(name, x, textY);

    const imgData = canvas.toDataURL("image/png");
    pdf.addImage(imgData, "PNG", 0, 0, canvas.width, canvas.height);
  });

  pdf.save("certificates.pdf");
}

function printCertificates() {
  console.log("printCertificates function called");

  if (selectedNames.length === 0) {
    console.log("No names selected");
    UIkit.notification({
      message: "Please upload a name list first",
      status: "danger",
    });
    return;
  }

  const printWindow = window.open("", "_blank");
  printWindow.document.write("<html><head><title>Print Certificates</title>");
  printWindow.document.write(
    "<style>@media print { @page { size: landscape; } body { margin: 0; } img { max-width: 100%; height: auto; page-break-after: always; } }</style>"
  );
  printWindow.document.write("</head><body>");

  selectedNames.forEach((name, index) => {
    const tempCanvas = document.createElement("canvas");
    tempCanvas.width = canvas.width;
    tempCanvas.height = canvas.height;
    const tempCtx = tempCanvas.getContext("2d");

    tempCtx.drawImage(uploadedImage, 0, 0, tempCanvas.width, tempCanvas.height);

    tempCtx.font = `${fontSize}px ${customFont || "Arial"}`;
    tempCtx.fillStyle = customColor;
    const currentTextAlign = textAlign || "left";
    tempCtx.textAlign = currentTextAlign;

    let x = textX || tempCanvas.width / 2;
    if (currentTextAlign === "center") {
      x = tempCanvas.width / 2;
    } else if (currentTextAlign === "right") {
      x = tempCanvas.width - (textX || 0);
    }

    tempCtx.fillText(name, x, textY || tempCanvas.height / 2);

    const imgData = tempCanvas.toDataURL("image/png");
    printWindow.document.write(
      `<img src="${imgData}" style="width: 100%; page-break-after: always;">`
    );
  });

  printWindow.document.write("</body></html>");
  printWindow.document.close();

  printWindow.onload = function () {
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
      printWindow.onafterprint = function () {
        printWindow.close();
      };
    }, 250);
  };
}

// Event listeners
document.addEventListener("DOMContentLoaded", function () {
  const exportPDFButton = document.getElementById("exportPDF");
  const printButton = document.getElementById("printButton");

  if (exportPDFButton) {
    exportPDFButton.addEventListener("click", exportAsPDF);
  } else {
    console.error("Export PDF button not found in the DOM");
  }

  if (printButton) {
    printButton.addEventListener("click", printCertificates);
  } else {
    console.error("Print button not found in the DOM");
  }
});

document
  .getElementById("selectImageButton")
  .addEventListener("click", function () {
    document.getElementById("imageUpload").click();
  });
document.addEventListener("DOMContentLoaded", function () {
  const themeToggle = document.getElementById("themeToggle");

  // Check local storage for the saved theme, default to 'dark' if not set // Default to 'dark' theme
  let e = document.getElementById("favicon");
  let e2 = document.getElementById("favicon2");
  let e3 = document.getElementById("git");
  let e4 = document.getElementById("mode");
  let nav = document.getElementById("navcolor");
  let star = document.getElementById("starlogo");
  let box = document.getElementsByClassName("box1");
  let child = document.getElementsByClassName("box2");
  let lettter = document.getElementsByClassName("letter");
  let up=document.getElementsByClassName("up")
  // Apply the current theme
  applyTheme(currentTheme);

  // Function to apply the theme based on the given theme
  function applyTheme(theme) {
    if (theme === "dark") {
      document.body.style.backgroundColor = "black"; // Set dark background
      document.body.style.color = "white";
      // Adjust favicon or any other elements if needed
      e.classList.remove("invert-svg");
      e2.classList.remove("invert-svg");
      e3.style.color = "hsl(var(--foreground) / .6)";
      e4.src = "./assest/brightness (1).png";
      star.style.color = "hsl(var(--foreground) / .6)";
      themeToggle.style.backgroundColor = "#1c1c1e";
      nav.style.backgroundColor = "black";
     
      for (let i = 0; i < box.length; i++) {
        box[i].style.backgroundColor = "#1e1e1e"; // Set background color for light theme
      }
      for (let i = 0; i < child.length; i++) {
        child[i].style.backgroundColor = "#292b2c"; // Set background color for light theme
      }
      for (let j = 0; j < lettter.length; j++) {
        lettter[j].style.color = "white";
        lettter[j].style.backgroundColor = "#1c1c1e";
      }
      for(let i=0;i<up.length;i++){
        up[i].style.color='#bfbfbf'
      }
  
    } else {
      document.body.style.backgroundColor = "white"; // Set light background
      document.body.style.color = "black"; // Set text color for light theme
      e.classList.add("invert-svg");
      e2.classList.add("invert-svg");
      e3.style.color = "black";
      e4.src = "./assest/night-mode.png";
      star.style.color = "black";
      themeToggle.style.backgroundColor = "white";
      nav.style.backgroundColor = "white";
  
      for (let i = 0; i < box.length; i++) {
        box[i].style.backgroundColor = "#e6e6e6"; // Set background color for light theme
      }
      for (let i = 0; i < child.length; i++) {
        child[i].style.backgroundColor = "white"; // Set background color for light theme
      }
      for (let j = 0; j < lettter.length; j++) {
        lettter[j].style.color = "black";
        lettter[j].style.backgroundColor = "white";
      }
      for(let i=0;i<up.length;i++){
        up[i].style.color='black'
      }
     
    }
  }

  // Add click event to the toggle button
  themeToggle.addEventListener("click", () => {
    currentTheme = currentTheme === "dark" ? "light" : "dark"; // Toggle theme
    applyTheme(currentTheme); // Apply the new theme
  });
});
