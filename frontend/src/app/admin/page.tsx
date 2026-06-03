"use client";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import AddProductModal from "@Components/ui/AddProductModal"; // Correct import path
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
  CardImage,
} from "@Components/ui/card";
import { axiosInstance } from "../utils/api";

// Define types for the product object
interface Product {
  id: number;
  title: string;
  description: string;
  rating: number;
  price: number;
  img: string | null;
}

interface UserRow {
  id: number;
  username: string;
  email: string;
  role: string;
}

const ProductsPage = () => {
  const router = useRouter();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("newest");
  const [users, setUsers] = useState<UserRow[]>([]);
  const [usersLoading, setUsersLoading] = useState(true);

  useEffect(() => {
    const role = localStorage.getItem("role");
    const token = localStorage.getItem("access_token");
    if (!token || role !== "admin") {
      router.push("/LoginPage");
      return;
    }

    async function fetchProducts() {
      try {
        const response = await axiosInstance.get("/product/all");
        setProducts(response.data || []);
      } catch (error: any) {
        console.error("Failed to fetch products:", {
          message: error?.message,
          status: error?.response?.status,
          data: error?.response?.data,
          url: error?.config?.url
        });
      }
    }

    async function fetchUsers() {
      try {
        setUsersLoading(true);
        const response = await axiosInstance.get("/user/all");
        setUsers(response.data || []);
      } catch (error: any) {
        console.error("Failed to fetch users:", {
          message: error?.message,
          status: error?.response?.status,
          data: error?.response?.data,
          url: error?.config?.url
        });
        setUsers([]);
      } finally {
        setUsersLoading(false);
      }
    }

    fetchProducts();
    fetchUsers();
  }, [router]);

  async function deleteProduct(productId: number) {
    const productToDelete = products.find((item) => item.id === productId);
    if (!productToDelete) {
      return;
    }
    try {
      await axiosInstance.delete(`/product/delete/${productToDelete.id}`);
      setProducts((prev) => prev.filter((item) => item.id !== productToDelete.id));
    } catch (error) {
      console.error("Failed to delete product", error);
    }
  }

  function editProduct(productId: number) {
    router.push(`/admin/products/${productId}`);
  }

  const filteredProducts = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();
    const searched = normalizedSearch
      ? products.filter(
          (product) =>
            product.title.toLowerCase().includes(normalizedSearch) ||
            product.description.toLowerCase().includes(normalizedSearch),
        )
      : products;

    const sorted = [...searched];
    if (sortBy === "price-asc") {
      sorted.sort((a, b) => a.price - b.price);
    } else if (sortBy === "price-desc") {
      sorted.sort((a, b) => b.price - a.price);
    } else if (sortBy === "rating") {
      sorted.sort((a, b) => b.rating - a.rating);
    }

    return sorted;
  }, [products, searchTerm, sortBy]);

  const stats = useMemo(() => {
    if (!products.length) {
      return { count: 0, averagePrice: 0, topRating: 0 };
    }
    const totalPrice = products.reduce((sum, product) => sum + product.price, 0);
    const topRating = Math.max(...products.map((product) => product.rating));
    return {
      count: products.length,
      averagePrice: Math.round(totalPrice / products.length),
      topRating,
    };
  }, [products]);

  const orderStats = useMemo(() => {
    return { totalOrders: 0, pending: 0, completed: 0 };
  }, []);

  return (
    <div className="container mx-xs px-4 py-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-8">
        <div>
          <h1 className="text-3xl font-semibold">Admin Products</h1>
          <p className="text-gray-400">Manage inventory, pricing, and media assets.</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          <input
            className="bg-transparent border border-gray-600 px-4 py-2 rounded-lg text-white"
            placeholder="Search products"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <select
            className="bg-transparent border border-gray-600 px-4 py-2 rounded-lg text-white"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
          >
            <option value="newest">Newest</option>
            <option value="price-asc">Price: Low to High</option>
            <option value="price-desc">Price: High to Low</option>
            <option value="rating">Top Rated</option>
          </select>
          <button
            className="bg-BrightOrange text-white px-6 py-2 rounded-lg hover:bg-orange-600 transition"
            onClick={() => setIsAddModalOpen((prev) => !prev)}
          >
            Add Product
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <div className="bg-HeaderWalaBlack/80 rounded-xl p-4">
          <p className="text-gray-400">Total Products</p>
          <p className="text-2xl font-semibold">{stats.count}</p>
        </div>
        <div className="bg-HeaderWalaBlack/80 rounded-xl p-4">
          <p className="text-gray-400">Average Price</p>
          <p className="text-2xl font-semibold">Rs {stats.averagePrice}</p>
        </div>
        <div className="bg-HeaderWalaBlack/80 rounded-xl p-4">
          <p className="text-gray-400">Top Rating</p>
          <p className="text-2xl font-semibold">{stats.topRating} ⭐</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <div className="bg-HeaderWalaBlack/80 rounded-xl p-4">
          <p className="text-gray-400">Total Orders</p>
          <p className="text-2xl font-semibold">{orderStats.totalOrders}</p>
        </div>
        <div className="bg-HeaderWalaBlack/80 rounded-xl p-4">
          <p className="text-gray-400">Pending Orders</p>
          <p className="text-2xl font-semibold">{orderStats.pending}</p>
        </div>
        <div className="bg-HeaderWalaBlack/80 rounded-xl p-4">
          <p className="text-gray-400">Completed Orders</p>
          <p className="text-2xl font-semibold">{orderStats.completed}</p>
        </div>
      </div>

      {!filteredProducts.length ? (
        <h2 className="text-center text-xl mt-10">No Products Available</h2>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
          {filteredProducts.map((product) => {
            return (
            <Card
              key={product.id}
              className="shadow-lg hover:shadow-xl rounded-md overflow-hidden max-w-sm mx-auto bg-HeaderWalaBlack/70"
            >
              <CardHeader className="bg-transparent p-4">
                {/* Optional: Add a title or any additional content in the header */}
              </CardHeader>
              <CardImage
                src={product.img ?? ""}
                alt={product.title}
                className="w-full h-48 object-cover rounded-t-md"
              />
              <CardContent className="p-4">
                <CardTitle className="text-lg text-BrightOrange font-semibold">
                  {product.title}
                </CardTitle>
                <CardDescription className="text-gray-400 text-sm">
                  {product.description}
                </CardDescription>
                <p className="text-White font-bold mt-2 text-sm">
                  Price: Rs {product.price}
                </p>
                <p className="text-yellow-500 mt-1 text-sm">
                  Rating: {product.rating} ⭐
                </p>
              </CardContent>
              <CardFooter className="flex justify-between items-center p-4 bg-transparent">
                <button
                  className="border border-BrightOrange text-white px-4 py-2 rounded-lg hover:bg-yellow-600 transition"
                  onClick={() => editProduct(product.id)}
                >
                  Edit
                </button>
                <button
                  className="bg-red-500 text-black px-4 py-2 rounded-lg hover:bg-red-600 transition"
                  onClick={() => deleteProduct(product.id)}
                >
                  Delete
                </button>
              </CardFooter>
            </Card>
          );
          })}
        </div>
      )}

      <AddProductModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        setProducts={setProducts}
      />

      <div className="mt-12">
        <h2 className="text-2xl font-semibold mb-4">Users</h2>
        <div className="bg-HeaderWalaBlack/80 rounded-xl p-4">
          {usersLoading ? (
            <p className="text-gray-400">Loading users...</p>
          ) : users.length === 0 ? (
            <p className="text-gray-400">No users found.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left text-gray-300">
                <thead className="text-xs uppercase text-gray-400 border-b border-gray-700">
                  <tr>
                    <th className="py-2 pr-4">ID</th>
                    <th className="py-2 pr-4">Username</th>
                    <th className="py-2 pr-4">Email</th>
                    <th className="py-2 pr-4">Role</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr key={user.id} className="border-b border-gray-800">
                      <td className="py-2 pr-4">{user.id}</td>
                      <td className="py-2 pr-4">{user.username}</td>
                      <td className="py-2 pr-4">{user.email}</td>
                      <td className="py-2 pr-4 capitalize">{user.role}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductsPage;
