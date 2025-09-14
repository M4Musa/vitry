const tf = require('@tensorflow/tfjs');
require('@tensorflow/tfjs-backend-cpu');
const cocossd = require('@tensorflow-models/coco-ssd');
const sharp = require('sharp');

let model;
let modelLoaded = false;

// Load and warm up the model
cocossd.load().then((loadedModel) => {
  model = loadedModel;
  modelLoaded = true;
  console.log('COCO-SSD model loaded successfully');
}).catch(error => {
  console.error('Failed to load COCO-SSD model:', error);
});

// Image classification function
async function classifyImage(req, res) {
  let imageTensor;
  console.log("FILE RECEIVED: ", req.file);
  try {
    console.log('Starting image classification process');
    if (!modelLoaded) {
      throw new Error('COCO-SSD model not loaded yet');
    }

    if (!req.file) {
      throw new Error('No file uploaded');
    }

    const imageBuffer = req.file.buffer;
    console.log('Image buffer size:', imageBuffer.length);

    // Convert image to tensor
    imageTensor = await processImage(imageBuffer);
    console.log('Image tensor created with shape:', imageTensor.shape);

    // Classify the image
    const predictions = await model.detect(imageTensor);
    console.log('Predictions:', predictions);

    // Define clothing-related classes
    const clothingClasses = [
      'person','clothing', 'shirt', 'pants', 'shorts', 'skirt', 'dress', 'jacket', 'coat',
    ];

    // Check for clothing categories in predictions
    const hasClothing = predictions.some(prediction =>
      clothingClasses.some(clothClass =>
        prediction.class.toLowerCase().includes(clothClass)
      )
    );

    const matchedClasses = predictions
      .filter(prediction =>
        clothingClasses.some(clothClass =>
          prediction.class.toLowerCase().includes(clothClass)
        )
      )
      .map(prediction => prediction.class);

    console.log('Has Clothing:', hasClothing);
    console.log('Matched Classes:', matchedClasses);

    // Respond with results
    res.json({
      hasClothing,
      predictions,
      matchedClasses
    });

  } catch (error) {
    console.error('Error during classification:', error);
    res.status(500).json({ error: 'Error in processing the image', details: error.message });
  } finally {
    if (imageTensor) {
      imageTensor.dispose();
      console.log('Image tensor disposed');
    }
  }
}

// Function to process image and convert to tensor
async function processImage(imageBuffer) {
  try {
    console.log('Processing image for tensor conversion');

    // Resize and normalize the image
    const resizedImage = await sharp(imageBuffer)
      .resize(224, 224).raw().toBuffer({resolveWithObject: true });

    console.log('Resized image dimensions:', resizedImage.info);

    // Convert to RGB tensor
    const imageTensor = tf.tensor3d(new Uint8Array(resizedImage.data), [224, 224, 3]);

    console.log('Image tensor created successfully');
    return imageTensor;
  } catch (error) {
    console.error('Error during image processing:', error);
    throw error;
  }
}

module.exports = { classifyImage };
