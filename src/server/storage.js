const { Storage } = require("@google-cloud/storage");
const mime = require("mime-types");

const storage = new Storage({
  projectId: "selfmedic-project",
  keyFilename: "./serviceAccount.json",
});
const bucketName = "capstone-self-medic";

async function uploadFileToGCS(imageBuffer, imageName) {
  try {
    // Tentukan content type berdasarkan jenis file
    const contentType = mime.lookup(imageName);

    if (!contentType) {
      throw new Error("Unable to determine content type");
    }

    // Tentukan path file di bucket
    const filePath = `history/${imageName}`;

    // Unggah gambar ke Google Cloud Storage
    const bucket = storage.bucket(bucketName);
    const file = bucket.file(filePath);

    await file.save(imageBuffer, {
      metadata: { contentType: contentType },
    });

    console.log(`https://storage.googleapis.com/${bucketName}/${filePath}`);
    return `https://storage.googleapis.com/${bucketName}/${filePath}`;

  } catch (error) {
    console.error("Error:", error);
  }
}

module.exports = uploadFileToGCS;