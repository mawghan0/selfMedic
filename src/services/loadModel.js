const tf = require("@tensorflow/tfjs-node");

function loadModel(model) {
    return tf.loadGraphModel(model);
}

module.exports = loadModel;