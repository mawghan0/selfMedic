const tf = require("@tensorflow/tfjs-node");
const path = require("path");

const loadModel = async () => {
  const modelPath = path.resolve(__dirname, "../model/model.json");
  const fileURL = `file://${modelPath}`;
  console.log("Loading model from:", fileURL);

  try {
    const model = await tf.loadGraphModel(fileURL);
    return model;
  } catch (error) {
    throw error;
  }
};

module.exports = loadModel;
