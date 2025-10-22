"use client";
import React, { useState } from "react";
import { X, Loader2, Trash, Save } from "lucide-react";
import authAxios from "../lib/authAxios";
import Link from "next/link";

type Item = {
  id: number;
  name: string;
  current_stock: number;
  description?: string | null;
};

export function ItemDetailModal({
  item,
  onClose,
}: {
  item: Item | null;
  onClose: () => void;
}) {
  const [formData, setFormData] = useState({
    name: item?.name || "",
    current_stock: item?.current_stock || 0,
    description: item?.description || "",
  });
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this item?")) return;
    setLoading(true);
    try {
      await authAxios.delete(`/api/items/${item?.id}`);
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 flex justify-center items-center bg-black bg-opacity-40 z-50">
      <div className="bg-white p-6 rounded-2xl shadow-lg w-[400px] relative">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-500 hover:text-black"
        >
          <X size={20} />
        </button>
        <h2 className="text-xl font-semibold mb-4">
          {item ? "Edit Item" : "Add Item"}
        </h2>

        <div className="space-y-3">
          <div>
            <label className="block text-sm text-gray-600 mb-1">Name</label>
            <input
              className="w-full border p-2 rounded-lg"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
            />
          </div>

          <div>
            <label className="block text-sm text-gray-600 mb-1">
              Current Stock
            </label>
            <input
              type="number"
              className="w-full border p-2 rounded-lg"
              value={formData.current_stock}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  current_stock: Number(e.target.value),
                })
              }
            />
          </div>

          <div>
            <label className="block text-sm text-gray-600 mb-1">
              Description
            </label>
            <textarea
              className="w-full border p-2 rounded-lg"
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
            />
          </div>

          <div className="flex justify-end gap-3 mt-4">
            <Link href="/dashboard">
              <button className="">Cancel</button>
            </Link>
            {item && (
              <button
                onClick={handleDelete}
                disabled={loading}
                className="flex items-center gap-2 bg-red-500 text-white px-3 py-2 rounded-lg hover:bg-red-600"
              >
                <Trash size={16} />
                {loading ? "Deleting..." : "Delete"}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
