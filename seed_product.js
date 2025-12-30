import mongoose from "mongoose";
import dotenv from "dotenv";
import Product from "./models/Product.js";
import fs from "fs";

dotenv.config();

const addProduct = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB Connected");

    // Read the image file and convert to Base64
    const imagePath = "C:/Users/aathi/.gemini/antigravity/brain/a88385b8-af1e-4581-bfe9-3f30cc92a81e/formal_shirt_1767075188658.png";
    const imageBitmap = fs.readFileSync(imagePath);
    const base64Image = "data:image/png;base64," + imageBitmap.toString("base64");

    const newProduct = new Product({
      name: "Classic Formal Shirt",
      price: 1899,
      image: base64Image,
      brand: "Prestige",
      category: "Formal Wear"
    });

    await newProduct.save();
    console.log("Product Added Successfully!");
    
    mongoose.connection.close();
  } catch (error) {
    console.error("Error adding product:", error);
    process.exit(1);
  }
};

addProduct();
