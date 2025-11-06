

import express from "express";
import upload from "../config/multerConfig.js"; // memory storage config
import { verifyAccessToken } from "../middlewares/auth.middleware.js";
import { DeleteObjectCommand, PutObjectCommand } from "@aws-sdk/client-s3";
import s3 from "../config/s3.js";

const router = express.Router();




router.post("/upload-proxy", upload.single("file"), async (req, res) => {
  try {
    const formData = new FormData();
    formData.append("file", req.file.buffer, req.file.originalname);

    // Send to actual API
    const response = await axios.post(
      "https://api.onlyraps.com/api/v1/upload/single",
      formData,
      { headers: formData.getHeaders() }
    );

    // Return API response to frontend
    res.json(response.data);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: err.message });
  }
});


router.post("/single", verifyAccessToken, upload.single("file"), async (req, res) => {
  try {
    const file = req.file;
    if (!file) return res.status(400).json({ error: "No file uploaded" });

    // ✅ Get folder name from body or query, fallback to 'default'
    const folder = req.body.folder || req.query.folder || "default";
    console.log("Folder name:", folder);

    // ✅ Generate random 5-digit number
    const randomNumber = Math.floor(10000 + Math.random() * 90000); // 5-digit random

    // ✅ Optional: custom base name from user or original file name (without spaces)
    // const baseName =
    //   req.body.name?.replace(/\s+/g, "_") || file.originalname.split(".")[0];

    // ✅ Construct final key — stored inside folder
    const key = `${folder}/${randomNumber}`;

    // ✅ Upload to DigitalOcean Spaces
    const command = new PutObjectCommand({
      Bucket: process.env.DO_SPACES_NAME,

      Key: key,
      Body: file.buffer,
      ContentType: file.mimetype,
      ACL: "public-read",
    });

    await s3.send(command);

    // ✅ Construct the public URL
    const fileUrl = `https://${process.env.DO_SPACES_NAME}.blr1.cdn.digitaloceanspaces.com/${key}`;

    // ✅ Response
    res.json({
      message: "File uploaded successfully",
      url: fileUrl,
      key: key, // full folder + filename
    });

  } catch (err) {
    console.error("Single upload error:", err);
    res.status(500).json({ error: err.message });
  }
});



router.delete("/delete/:key", verifyAccessToken, async (req, res) => {
  try {
    // capture the full key (supports slashes, e.g. courses/3245435)
    const key = req.params.key;

    console.log("Deleting file with key:", key);

    if (!key) {
      return res.status(400).json({ error: "No key provided" });
    }

    const command = new DeleteObjectCommand({
      Bucket: process.env.DO_SPACES_NAME,
      Key: key,
    });

    await s3.send(command);

    res.json({ message: "File deleted successfully", key });
  } catch (err) {
    console.error("File delete error:", err);
    res.status(500).json({ error: err.message });
  }
});


router.post("/multiple", verifyAccessToken, upload.array("files", 5), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: "No files uploaded" });
    }

    const folder = req.body.folder || req.query.folder || "";
    const uploadedFiles = [];

    for (const file of req.files) {
      const fileName = `${Date.now()}-${file.originalname}`;
      const key = buildKey(folder, fileName);

      const command = new PutObjectCommand({
        Bucket: process.env.DO_SPACES_NAME,
        Key: key,
        Body: file.buffer,
        ContentType: file.mimetype,
        ACL: "public-read",
      });

      await s3.send(command);

      const fileUrl = `https://${process.env.DO_SPACES_NAME}.blr1.digitaloceanspaces.com/${key}`;
      uploadedFiles.push({ name: file.originalname, url: fileUrl });
    }

    res.json({
      message: "Files uploaded successfully",
      files: uploadedFiles,
    });
  } catch (err) {
    console.error("Multiple upload error:", err);
    res.status(500).json({ error: err.message });
  }
});

export default router;
