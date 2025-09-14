// Select all images on the webpage
document.querySelectorAll("img:not(header img):not(footer img)").forEach((img) => {
    // Skip images that already have a button
    if (img.parentElement.querySelector(".try-on-button")) return;
  
    // Create a "Virtual Try On Clothes" button
    const button = document.createElement("button");
    button.innerText = "Virtual Try On Clothes";  // Button text
    button.className = "try-on-button";           // Add a class for styling
    button.style.position = "absolute";          // Position it over the image
    button.style.top = "10px";
    button.style.left = "10px";
    button.style.zIndex = "1000";
    button.style.backgroundColor = "#FF4500";    // Style the button
    button.style.color = "#fff";
    button.style.padding = "5px 10px";
    button.style.border = "none";
    button.style.borderRadius = "5px";
    button.style.cursor = "pointer";
  
    // Wrap the image in a relative container (for button positioning)
    const wrapper = document.createElement("div");
    wrapper.style.position = "relative";         // Relative positioning
    img.parentNode.insertBefore(wrapper, img);   // Insert wrapper before image
    wrapper.appendChild(img);                    // Move image into wrapper
    wrapper.appendChild(button);                 // Add button to wrapper
  
    // Add click event listener to the button
    button.addEventListener("click", () => {
      const input = document.createElement("input");
      input.type = "file";                       // File input for images/videos
      input.accept = "image/*,video/*";          // Accept both images and videos
      input.style.display = "none";             // Hide the input element
      document.body.appendChild(input);         // Add to document
      input.click();                            // Trigger the file dialog
  
      input.onchange = async () => {
        const file = input.files[0];
        if (file) {
          const reader = new FileReader();
          reader.onload = (e) => {
            const userImageData = e.target.result;  // Base64 image data
  
            // Display overlay with the uploaded image
            const overlay = document.createElement("div");
            overlay.style.position = "absolute";
            overlay.style.top = "0";
            overlay.style.left = "0";
            overlay.style.width = "100%";
            overlay.style.height = "100%";
            overlay.style.backgroundColor = "rgba(0, 0, 0, 0.7)";
            overlay.style.display = "flex";
            overlay.style.alignItems = "center";
            overlay.style.justifyContent = "center";
  
            const preview = document.createElement("img");
            preview.src = userImageData;          // Display uploaded image
            preview.style.maxWidth = "90%";
            preview.style.maxHeight = "90%";
  
            overlay.appendChild(preview);
            document.body.appendChild(overlay);
  
            // Remove overlay on click
            overlay.addEventListener("click", () => {
              document.body.removeChild(overlay);
            });
          };
  
          reader.readAsDataURL(file);             // Read file as Base64
        }
        document.body.removeChild(input);         // Cleanup file input
      };
    });
  });




// // Select all images on the webpage
// document.querySelectorAll("img:not(header img):not(footer img)").forEach((img) => {
//     // Skip images that already have a button
//     if (img.parentElement.querySelector(".try-on-button")) return;
  
//     // Function to check if image has clothing
//     async function checkImageForClothing(imageElement) {
//         try {
//             // Create FormData to send the image
//             const formData = new FormData();
//             formData.append('image', await fetchImageAsBlob(imageElement.src));
  
//             // Send request to clothing detection API
//             const response = await fetch('http://localhost:3001/api/detect-clothes', {
//                 method: 'POST',
//                 body: formData
//             });
  
//             // Parse the response
//             const result = await response.json();
  
//             // Return true if hasClothing is true
//             return result.hasClothing === true;
//         } catch (error) {
//             console.error('Clothing detection error:', error);
//             return false;
//         }
//     }
  
//     // Helper function to fetch image as Blob
//     async function fetchImageAsBlob(imageUrl) {
//         try {
//             const response = await fetch(imageUrl);
//             return await response.blob();
//         } catch (error) {
//             console.error('Image fetch error:', error);
//             return null;
//         }
//     }
  
//     // Async function to add button if clothing is detected
//     async function processImage() {
//         const hasClothing = await checkImageForClothing(img);
  
//         // Only add button if clothing is detected
//         if (hasClothing) {
//             // Create a "Virtual Try On Clothes" button
//             const button = document.createElement("button");
//             button.innerText = "Virtual Try On Clothes";  // Button text
//             button.className = "try-on-button";           // Add a class for styling
//             button.style.position = "absolute";          // Position it over the image
//             button.style.top = "10px";
//             button.style.left = "10px";
//             button.style.zIndex = "1000";
//             button.style.backgroundColor = "#FF4500";    // Style the button
//             button.style.color = "#fff";
//             button.style.padding = "5px 10px";
//             button.style.border = "none";
//             button.style.borderRadius = "5px";
//             button.style.cursor = "pointer";
  
//             // Wrap the image in a relative container (for button positioning)
//             const wrapper = document.createElement("div");
//             wrapper.style.position = "relative";         // Relative positioning
//             img.parentNode.insertBefore(wrapper, img);   // Insert wrapper before image
//             wrapper.appendChild(img);                    // Move image into wrapper
//             wrapper.appendChild(button);                 // Add button to wrapper
  
//             // Add click event listener to the button
//             button.addEventListener("click", () => {
//                 const input = document.createElement("input");
//                 input.type = "file";                       // File input for images/videos
//                 input.accept = "image/*,video/*";          // Accept both images and videos
//                 input.style.display = "none";             // Hide the input element
//                 document.body.appendChild(input);         // Add to document
//                 input.click();                            // Trigger the file dialog
  
//                 input.onchange = async () => {
//                     const file = input.files[0];
//                     if (file) {
//                         const reader = new FileReader();
//                         reader.onload = (e) => {
//                             const userImageData = e.target.result;  // Base64 image data
  
//                             // Display overlay with the uploaded image
//                             const overlay = document.createElement("div");
//                             overlay.style.position = "absolute";
//                             overlay.style.top = "0";
//                             overlay.style.left = "0";
//                             overlay.style.width = "100%";
//                             overlay.style.height = "100%";
//                             overlay.style.backgroundColor = "rgba(0, 0, 0, 0.7)";
//                             overlay.style.display = "flex";
//                             overlay.style.alignItems = "center";
//                             overlay.style.justifyContent = "center";
  
//                             const preview = document.createElement("img");
//                             preview.src = userImageData;          // Display uploaded image
//                             preview.style.maxWidth = "90%";
//                             preview.style.maxHeight = "90%";
  
//                             overlay.appendChild(preview);
//                             document.body.appendChild(overlay);
  
//                             // Remove overlay on click
//                             overlay.addEventListener("click", () => {
//                                 document.body.removeChild(overlay);
//                             });
//                         };
  
//                         reader.readAsDataURL(file);             // Read file as Base64
//                     }
//                     document.body.removeChild(input);         // Cleanup file input
//                 };
//             });
//         }
//     }
  
//     // Process the image
//     processImage();
// });
  