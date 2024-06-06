const tf = require("@tensorflow/tfjs-node");

function loadModel(model) {
    return tf.loadLayersModel(model);
}

module.exports = loadModel;