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

// async function acneClassification(model, image) {
//     try {
//         const tensor = tf.node
//             .decodeImage(image)
//             .resizeNearestNeighbor([224, 224])
//             .expandDims()
//             .toFloat()
//             .div(tf.scalar(255.0));

//             return model.predict(tensor).data();

//         // const prediction = model.predict(tensor);
//         // const score = await prediction.data();

//         // let maxKey = null;
//         // let maxValue = -Infinity;

//         // for (const [key, value] of Object.entries(score)) {
//         //     if (value > maxValue) {
//         //         maxValue = value;
//         //         maxKey = key;
//         //     }
//         // }

//         // return maxKey;
//         // console.log("berhasil inference");
//         // return score;
//     } catch (error) {
//         throw new InputError(`Terjadi kesalahan input: ${error.message}`);
//     }
// }

async function acneClassification(model, image) {
    try {
        console.log("Starting image classification");
        
        const tensor = tf.node
            .decodeImage(image)
            .resizeNearestNeighbor([450, 450]) // Adjust the resize dimensions to 450x450
            .expandDims()
            .toFloat()
            .div(tf.scalar(255.0));
        
        console.log("Image processed to tensor");

        const prediction = model.predict(tensor);
        const score = await prediction.data();
        
        console.log("Prediction scores:", score);

        // Find the class with the highest probability
        let maxKey = null;
        let maxValue = -Infinity;

        for (let i = 0; i < score.length; i++) {
            if (score[i] > maxValue) {
                maxValue = score[i];
                maxKey = i;
            }
        }

        console.log("Highest probability class:", maxKey, "with confidence:", maxValue);
        return { maxKey, maxValue };
    } catch (error) {
        console.error("Error during classification:", error);
        throw new Error("Terjadi kesalahan dalam melakukan prediksi");
    }
}

module.exports = {scarClassification, acneClassification};