
import multer from "multer";

const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  if (
    file.mimetype.includes("image") ||
    file.mimetype.includes("pdf") ||
    file.mimetype.includes("mp4") ||
    file.mimetype.includes("mp3") ||
    file.mimetype.includes("wav") || 
    file.mimetype.includes("mpeg") || 
    file.mimetype.includes("zip") ||
    file.mimetype.includes("flac") 
  ) {
    cb(null, true);
  } else {
    cb(new Error("Only images, PDFs, MP4, MP3 or WAV allowed"), false);
  }
};

// const upload = multer({ storage, fileFilter });
const upload = multer({ 
    storage, 
    fileFilter, 
    limits: { fileSize: 50 * 1024 * 1024 } // 50 MB
});


export default upload;
