const tf = require("@tensorflow/tfjs-node");

const loadModel = async (model) => {
    return tf.loadLayersModel(model);
}

const loadGModel = async (modelUrl) => {
    try {
        console.log(`Loading model from ${modelUrl}`);
        const response = await fetch(modelUrl, { timeout: 30000 });
        console.log(`Fetch response status: ${response.status}`);
        if (!response.ok) {
            throw new Error(`Failed to fetch model: ${response.statusText}`);
        }
        const model = await tf.loadGraphModel(modelUrl);
        console.log("Model loaded successfully");
        return model;
    } catch (error) {
        console.error(`Error loading model from ${modelUrl}:`, error);
        throw new Error("Failed to load model");
    }
};

module.exports = {loadModel, loadGModel};