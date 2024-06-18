const tf = require("@tensorflow/tfjs-node");

const loadModel = async (model) => {
    return tf.loadLayersModel(model);
}

const loadGModel = async (modelPath) => {
    try {
        const model = await tf.loadGraphModel(modelPath);
        console.log("Model loaded successfully");
        return model;
    } catch (error) {
        console.error("Error loading model:", error);
        throw new Error("Failed to load model");
    }
};

module.exports = {loadModel, loadGModel};