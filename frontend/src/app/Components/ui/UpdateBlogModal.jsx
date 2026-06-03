"use client";
import { useEffect, useState } from "react";
import Modal from "./Modal";
import { axiosInstance } from "../../utils/api";

const EditProductModal = ({
  isOpen,
  onClose,
  setProducts,
  ProductId,
  ProductTitle,
  ProductDesc,
  ProductIndex,
  ProductRating,
  ProductPrice,
  ProductImage,
}) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [rating, setRating] = useState("");
  const [price, setPrice] = useState("");
  const [image, setImage] = useState(null);
  const [error, setError] = useState("");

  // Set default values when the modal opens
  useEffect(() => {
    setTitle(ProductTitle);
    setDescription(ProductDesc);
    setRating(ProductRating);
    setPrice(ProductPrice);
    setImage(null);
  }, [ProductTitle, ProductDesc, ProductRating, ProductPrice]);

  // Handle form submission
  async function onSubmit(e) {
    e.preventDefault();

    if (!ProductId) {
      setError("Missing product ID");
      return;
    }

    const formData = new FormData();
    formData.append("title", title);
    formData.append("description", description);
    formData.append("rating", rating);
    formData.append("price", price);
    if (image) {
      formData.append("image", image); // Add image only if it's provided
    }

    try {
      const response = await axiosInstance.put(
        `/product/update/${ProductId}`,
        formData,
      );

      const updatedProduct = response.data;

      setProducts((prev) =>
        prev.map((product, index) =>
          index === ProductIndex ? updatedProduct : product
        )
      );

      onClose(); // Close the modal after update
      resetForm(); // Reset form values
    } catch (err) {
      setError("An error occurred while updating the product");
      console.error("Error:", err);
    }
  }

  // Reset form fields
  function resetForm() {
    setTitle("");
    setDescription("");
    setPrice("");
    setRating("");
    setImage(null);
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <h1>Update Product</h1>
      {error && <p className="text-red-500">{error}</p>}
      <form onSubmit={onSubmit} className="flex flex-col">
        <label htmlFor="title">Title</label>
        <input
          type="text"
          placeholder="Enter title"
          id="title"
          className="border-black text-black"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />

        <label htmlFor="description">Description</label>
        <textarea
          id="description"
          className="border-black text-black"
          placeholder="Enter Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        ></textarea>

        <label htmlFor="rating">Rating</label>
        <input
          type="number"
          id="rating"
          placeholder="Enter rating"
          className="border text-black border-black p-2"
          value={rating}
          onChange={(e) => setRating(e.target.value)}
        />

        <label htmlFor="price">Price</label>
        <input
          type="number"
          id="price"
          placeholder="Enter price"
          className="border text-black border-black p-2"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
        />

        <label htmlFor="image">Image</label>
        <input
          type="file"
          id="image"
          className="border  border-white p-2"
          onChange={(e) => setImage(e.target.files[0])}
        />

        <button type="submit" className="bg-black text-white mt-4">
          Update Product
        </button>
      </form>
    </Modal>
  );
};

export default EditProductModal;
