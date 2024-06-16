const tf = require("@tensorflow/tfjs-node");
const InputError = require("../exceptions/InputError");

async function scarClassification(model, image) {
    try {
        const tensor = tf.node
            .decodeImage(image)
            .resizeNearestNeighbor([224, 224])
            .expandDims()
            .toFloat()
            .div(tf.scalar(255.0));

        const prediction = model.predict(tensor);
        const score = await prediction.data();
        // const confidenceScore = Math.max(...score) * 100;

        // const label = confidenceScore >= 0.5 ? "Cancer" : "Non-cancer";

        // const suggestion =
        //     label === "Cancer" ? "Segera periksa ke dokter!" : "Anda sehat!";

        // const threshold = 0.5;
        // const result = {};

        // for (const [key, value] of Object.entries(score)) {
        //     result[key] = value > threshold;
        // }

        let maxKey = null;
        let maxValue = -Infinity;

        for (const [key, value] of Object.entries(score)) {
            if (value > maxValue) {
                maxValue = value;
                maxKey = key;
            }
        }

        return maxKey;
    } catch (error) {
        throw new InputError(`Terjadi kesalahan input: ${error.message}`);
    }
}

module.exports = scarClassification;