const tfjs = require("@tensorflow/tfjs-node");

const scarClassification = (model, image) => {
    const tensor = tfjs.node
        .decodeImage(image)
        .resizeNearestNeighbor([224, 224])
        .expandDims()
        .toFloat();

    return model.predict(tensor).data();
    
}

module.exports = scarClassification;