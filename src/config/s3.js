import { S3Client } from "@aws-sdk/client-s3";
export const s3 = new S3Client({
  region: process.env.DO_SPACES_REGION, 
  endpoint: process.env.DO_SPACES_ENDPOINT, 
  forcePathStyle: false, // important for DO Spaces
  credentials: {
    accessKeyId: process.env.DO_SPACES_KEY,
    secretAccessKey: process.env.DO_SPACES_SECRET,
  },
});

export default s3;
