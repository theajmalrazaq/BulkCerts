// ===== EVENT LISTENERS SETUP =====

// Image upload event listener
document
  .getElementById("imageUpload")
  .addEventListener("change", handleImageUpload);

// Confirm area selection button event listener
document.getElementById("confirmArea").addEventListener("click", confirmArea);

// CSV file upload event listener for names list
document
  .getElementById("csvUpload")
  .addEventListener("change", handleCSVUpload);

// Font file upload event listener
document
  .getElementById("fontUpload")
  .addEventListener("change", handleFontUpload);

// Save images button event listener
document.getElementById("saveImages").addEventListener("click", saveImages);

// ===== NAVIGATION BUTTON HANDLERS =====


// Back button from step 2 to step 1
document.getElementById("bck2").addEventListener("click", () => {
  document.getElementById("navbar").classList.remove("hidden");
  document.getElementById("st-1").style.display = "flex";
  document.getElementById("st-2").style.display = "none";
});



// ===== GLOBAL VARIABLES =====

// Theme preference from local storage
let currentTheme = localStorage.getItem("theme") || "dark";

// Core application variables
let uploadedImage; // Stores the uploaded certificate image
let selectedNames = ["Demo Name"]; // Array of names for certificates
let canvas, ctx, previewCanvas, previewCtx; // Canvas elements and contexts
let startX, startY, endX, endY; // Coordinates for area selection
let isDrawing = true; // Drawing state flag
let customFont = null; // Custom font for text
let customColor = "#ffffff"; // Text color (default: red)
let fontSize = 40; // Text font size (default: 30px)
let isDragging = false; // Text dragging state flag
let textX, textY; // Text position coordinates
let rectX, rectY; // Rectangle position coordinates
let textAlign = "left"; // Text alignment (default: left)

/**
 * Handles image upload when a file is selected
 * @param {Event} event - File input change event
 */
function handleImageUpload(event) {
  const file = event.target.files[0];
  const reader = new FileReader();

  // Process uploaded image once loaded
  reader.onload = function (e) {
    uploadedImage = new Image();
    uploadedImage.onload = function () {
      handleview(); // Display the image preview
      setUpCanvas(); // Initialize canvas with the image
    };
    uploadedImage.src = e.target.result;
  };

  reader.readAsDataURL(file);
}

/**
 * Displays the uploaded image in the view area
 */
handleview = () => {
  // Disable further uploads until current image is discarded
  document.getElementById("imageUpload").disabled = true;

  // Create and configure image preview element
  let viewimage = document.createElement("img");
  viewimage.className = "w-full h-full object-cover rounded-lg"; 
  viewimage.src = uploadedImage.src;

  // Add discard button to the view
  document.getElementById("view").innerHTML =
    "<button id='discard' class='absolute -top-2 -right-2 p-1 rounded-full bg-[#1B0702]  cursor-pointer'><i data-lucide='x' class='h-5 w-5 text-[#fe2e00]'onclick='handleDiscard()'></i></button>";
  console.log("handleImageUpload function called");

  // Show the view container and append the image
  document.getElementById("view").classList.remove("hidden");
  document.getElementById("view").appendChild(viewimage);
  document.getElementById("selectImageButton").style.display = "none";

  // Initialize Lucide icons
  lucide.createIcons();
};

/**
 * Handles discarding the currently uploaded image
 */
handleDiscard = () => {
  // Re-enable image upload
  document.getElementById("imageUpload").disabled = false;

  // Hide view container and restore select button
  document.getElementById("view").classList.add("hidden");
  document.getElementById("selectImageButton").style.display = "";

  // Clear input and reset image
  document.getElementById("imageUpload").value = "";
  uploadedImage = null;
};

/**
 * Sets up the canvas for drawing and editing
 */
function setUpCanvas() {
  // Set up the preview canvas
  previewCanvas = document.getElementById("previewCanvas");
  previewCanvas.width = uploadedImage.width;
  previewCanvas.height = uploadedImage.height;
  previewCtx = previewCanvas.getContext("2d");
  
  // Set up the main canvas for saving/exporting
  canvas = document.createElement("canvas"); // Create an off-screen canvas
  canvas.width = uploadedImage.width;
  canvas.height = uploadedImage.height;
  ctx = canvas.getContext("2d");
  
  // Draw the initial image on the preview canvas
  previewCtx.drawImage(uploadedImage, 0, 0);
}

/**
 * Confirms the selected area and advances to the text customization step
 */
handlepop = () => {
  document.getElementById("popup").classList.remove("hidden");
  document.getElementById("popup").classList.add("flex");
  document.getElementById("popup").classList.add("justify-center");
  document.getElementById("popup").classList.add("items-center");
};

function confirmArea() {
  if (document.getElementById("imageUpload").value == "") {
    let notification = document.createElement("div");
    notification.className =
      "fixed bottom-4 right-4 bg-black border border-white/10 text-white px-6 py-3 rounded-lg shadow-lg transform transition-all duration-300 translate-y-0 z-50 flex items-center gap-2";
    notification.innerHTML = `
    <i data-lucide="alert-circle" class="h-5 w-5"></i>
    <span>Please upload a Image First</span>
  `;
    document.body.appendChild(notification);
    lucide.createIcons();
    setTimeout(() => {
      notification.classList.add("translate-y-full", "opacity-0");
      setTimeout(() => {
        notification.remove();
      }, 300);
    }, 3000);
    return;
  }

  document.getElementById("navbar").classList.add("hidden");
  // Advance to step 2
  document.getElementById("st-1").style.display = "none";
  document.getElementById("st-2").style.display = "flex";

  // Show text customization controls
  document.getElementById("csvUpload").style.display = "block";
  document.getElementById("fontUpload").style.display = "block";
  document.getElementById("colorPicker").style.display = "block";
  document.getElementById("fontSize").style.display = "block";

  // Update preview
  showPreview();

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

/**
 * Handles CSV file upload to load names
 * @param {Event} event - File input change event
 */
function handleCSVUpload(event) {
  const file = event.target.files[0];
  const reader = new FileReader();

  reader.onload = function (e) {
    // Parse names from the CSV file (simple line-by-line parsing)
    const lines = e.target.result.split("\n");
    selectedNames = lines.map((line) => line.trim());
    showPreview();
  };
  reader.readAsText(file);
}

/**
 * Handles font file upload for custom text font
 * @param {Event} event - File input change event
 */
function handleFontUpload(event) {
  const file = event.target.files[0];
  const reader = new FileReader();

  reader.onload = (e) => {
    // Create and load a custom font
    const font = new FontFace("customFont", e.target.result);
    font.load().then((loadedFont) => {
      document.fonts.add(loadedFont);
      customFont = "customFont";
      showPreview();
    });
  };
  reader.readAsArrayBuffer(file);
}

/**
 * Handles color selection for text
 * @param {Event} event - Color input change event
 */
function handleColorChange(event) {
  customColor = event.target.value;
  showPreview();
}

/**
 * Handles font size changes
 * @param {Event} event - Font size input change event
 */
function handleFontSizeChange(event) {
  fontSize = event.target.value;
  showPreview();
}

/**
 * Updates the preview canvas with current settings
 */
function showPreview() {
  // Clear canvas and redraw base image
  previewCtx.clearRect(0, 0, previewCanvas.width, previewCanvas.height);
  previewCtx.drawImage(uploadedImage, 0, 0);

  // Configure text properties
  previewCtx.font = `${fontSize}px ${customFont || "Arial"}`;
  previewCtx.fillStyle = customColor;

  // Draw the preview text (first name in the array)
  previewCtx.fillText(
    selectedNames[0],
    textX || rectX + 50,
    textY || rectY + 500,
  );

  // Add mouse and touch event listeners for text positioning
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

/**
 * Starts text dragging with mouse
 * @param {MouseEvent} event - Mouse down event
 */
function startDrag(event) {
  previewCanvas.style.cursor = "grab";
  const rect = previewCanvas.getBoundingClientRect();

  // Calculate text position based on click coordinates
  textX = (event.clientX - rect.left) * (previewCanvas.width / rect.width);
  textY = (event.clientY - rect.top) * (previewCanvas.height / rect.height);
  isDragging = true;
}

/**
 * Starts text dragging with touch
 * @param {TouchEvent} event - Touch start event
 */
function startDragTouch(event) {
  event.preventDefault();
  const rect = previewCanvas.getBoundingClientRect();
  const touch = event.touches[0];

  // Calculate text position based on touch coordinates
  textX = (touch.clientX - rect.left) * (previewCanvas.width / rect.width);
  textY = (touch.clientY - rect.top) * (previewCanvas.height / rect.height);
  isDragging = true;
}

/**
 * Updates text position during mouse drag
 * @param {MouseEvent} event - Mouse move event
 */
function dragText(event) {
  if (!isDragging) return;

  const rect = previewCanvas.getBoundingClientRect();
  textX = (event.clientX - rect.left) * (previewCanvas.width / rect.width);
  textY = (event.clientY - rect.top) * (previewCanvas.height / rect.height);

  showPreview();
}

/**
 * Updates text position during touch drag
 * @param {TouchEvent} event - Touch move event
 */
function dragTextTouch(event) {
  if (!isDragging) return;
  event.preventDefault();

  const rect = previewCanvas.getBoundingClientRect();
  const touch = event.touches[0];
  textX = (touch.clientX - rect.left) * (previewCanvas.width / rect.width);
  textY = (touch.clientY - rect.top) * (previewCanvas.height / rect.height);

  showPreview();
}

/**
 * Ends text dragging with mouse
 * @param {MouseEvent} event - Mouse up event
 */
function stopDrag(event) {
  isDragging = false;
}

/**
 * Ends text dragging with touch
 * @param {TouchEvent} event - Touch end event
 */
function stopDragTouch(event) {
  isDragging = false;
}

/**
 * Generates and saves individual certificate images
 */
function saveImages() {
  // Validate that names are loaded
  if (document.getElementById("csvUpload").value == "") {
   let notification = document.createElement("div");
    notification.className =
      "fixed bottom-4 right-4 bg-black border border-white/10 text-white px-6 py-3 rounded-lg shadow-lg transform transition-all duration-300 translate-y-0 z-50 flex items-center gap-2";
    notification.innerHTML = `
    <i data-lucide="alert-circle" class="h-5 w-5"></i>
    <span>Please upload Name List First</span>
  `;
    document.body.appendChild(notification);
    lucide.createIcons();
    setTimeout(() => {
      notification.classList.add("translate-y-full", "opacity-0");
      setTimeout(() => {
        notification.remove();
      }, 300);
    }, 3000);
    return;
  }

  // Generate a certificate for each name
  selectedNames.forEach((name, index) => {
    // Clear canvas and draw base image
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(uploadedImage, 0, 0);

    // Configure text properties and draw name
    ctx.font = `${fontSize}px ${customFont || "Arial"}`;
    ctx.fillStyle = customColor;
    ctx.fillText(name, textX || rectX + 10, textY || rectY + 30);

    // Create download link for the image
    const link = document.createElement("a");
    link.download = `${name}.png`;
    link.href = canvas.toDataURL();
    link.click();
  });
}

/**
 * Exports certificates as a PDF file
 */
function exportAsPDF() {
  // Check if jsPDF library is loaded
  if (typeof jspdf === "undefined") {
    console.error("jsPDF library not loaded");
    return;
  }

  if (selectedNames.length === 0) {
    let notification = document.createElement("div");
    notification.className =
      "fixed bottom-4 right-4 bg-red-500 text-white px-6 py-3 rounded-lg shadow-lg transform transition-all duration-300 translate-y-0 z-50 flex items-center gap-2";
    notification.innerHTML = `
    <i data-lucide="alert-circle" class="h-5 w-5"></i>
    <span>Please upload a name list first</span>
  `;
    document.body.appendChild(notification);
    lucide.createIcons();
    setTimeout(() => {
      notification.classList.add("translate-y-full", "opacity-0");
      setTimeout(() => {
        notification.remove();
      }, 300);
    }, 3000);

    return;
  }

  // Initialize PDF with landscape orientation and canvas dimensions
  const { jsPDF } = jspdf;
  const pdf = new jsPDF("l", "px", [canvas.width, canvas.height]);

  // Add a page for each certificate
  selectedNames.forEach((name, index) => {
    if (index > 0) pdf.addPage();

    // Clear canvas and draw base image
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(uploadedImage, 0, 0);

    // Configure text properties
    ctx.font = `${fontSize}px ${customFont || "Arial"}`;
    ctx.fillStyle = customColor;
    ctx.textAlign = textAlign;

    // Calculate x position based on text alignment
    let x = textX;
    if (textAlign === "center") {
      x = canvas.width / 2;
    } else if (textAlign === "right") {
      x = canvas.width - textX;
    }

    // Draw name text
    ctx.fillText(name, x, textY);

    // Add image to PDF
    const imgData = canvas.toDataURL("image/png");
    pdf.addImage(imgData, "PNG", 0, 0, canvas.width, canvas.height);
  });

  // Save the PDF file
  pdf.save("certificates.pdf");
}

/**
 * Opens a print dialog with certificate images
 */
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
    "<style>@media print { @page { size: landscape; } body { margin: 0; } img { max-width: 100%; height: auto; page-break-after: always; } }</style>",
  );
  printWindow.document.write("</head><body>");

  selectedNames.forEach((name, index) => {
    const tempCanvas = document.createElement("canvas");
    tempCanvas.width = uploadedImage.width;
    tempCanvas.height = uploadedImage.height;
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
      `<img src="${imgData}" style="width: 100%; page-break-after: always;">`,
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
