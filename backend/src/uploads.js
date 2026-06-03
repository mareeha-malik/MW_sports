import formidable from "formidable";
import { promises as fs } from "fs";
import path from "path";

export const config = {
  api: {
    bodyParser: false, // Disable default body parsing for file uploads
  },
};

export default async function handler(req, res) {
  if (req.method === "POST") {
    const form = formidable({ multiples: false, uploadDir: "./public/uploads" });

    try {
      const uploadDir = path.join(process.cwd(), "public/uploads");
      await fs.mkdir(uploadDir, { recursive: true }); // Ensure the upload directory exists

      form.uploadDir = uploadDir; // Set upload directory
      form.keepExtensions = true; // Preserve file extensions

      form.parse(req, (err, fields, files) => {
        if (err) {
          console.error(err);
          return res.status(500).json({ error: "File upload failed" });
        }

        const { title, description, rating, price } = fields;
        const image = files.image.newFilename;

        const product = { title, description, rating, price, image }; // Simulate database save

        res.status(200).json(product);
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Internal server error" });
    }
  } else {
    res.setHeader("Allow", ["POST"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
