"use client";
import React, { useEffect, useState } from "react";
import { ArrowLeftOutlined, SaveOutlined } from "@ant-design/icons";
import { Button, Card, Form, Input, InputNumber, Spin, message } from "antd";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import authAxios from "../../../../../../lib/authAxios";
import { UserType } from "../../../../../../components/Navbar";

type Item = {
  id: number;
  name: string;
  current_stock: number;
  description?: string;
  warehouse_id: number;
};

export default function EditItemPage() {
  const router = useRouter();
  const params = useParams();
  const { id } = params;

  const [form] = Form.useForm<Item>();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [warehouse_id, setWarehouseId] = useState<number | null>(null);

  const onFinish = async (values: Item) => {
    try {
      setSaving(true);
      await authAxios.put(`/api/items/${id}`, {
        name: values.name,
        currentStock: values.current_stock,
        description: values.description,
        warehouseId: warehouse_id,
      });
      message.success("Item updated successfully!");
      router.push("/");
    } catch (err) {
      console.error(err);
      message.error("Failed to update item.");
    } finally {
      setSaving(false);
    }
  };

  useEffect(() => {
    async function fetchItem() {
      try {
        const res = await authAxios.get(`/api/items/${id}`);
        const data: Item = res.data;
        form.setFieldsValue({
          name: data.name,
          current_stock: data.current_stock,
          description: data.description,
        });
        setWarehouseId(data.warehouse_id);
      } catch (err) {
        console.error(err);
        message.error("Failed to load item.");
      } finally {
        setLoading(false);
      }
    }
    fetchItem();
  }, [id, form]);

  useEffect(() => {
    const userString = localStorage.getItem("user");
    const user: UserType | null = userString ? JSON.parse(userString) : null;

    if (user?.role !== "Admin") {
      router.push("/");
    }
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <Spin size="large" />
      </div>
    );
  } else {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-2xl">
          <Card
            title={
              <div className="flex justify-between items-center">
                <h2 className="text-lg md:text-xl font-semibold text-gray-800">
                  Edit Item
                </h2>
                <Link
                  href="/"
                  className="flex items-center gap-1 text-blue-600 hover:text-blue-700 text-sm md:text-base"
                >
                  <ArrowLeftOutlined /> Back
                </Link>
              </div>
            }
            className="shadow-md rounded-lg"
          >
            <Form
              form={form}
              layout="vertical"
              onFinish={onFinish}
              className="flex flex-col gap-4"
            >
              <Form.Item
                label="Item Name"
                name="name"
                rules={[
                  { required: true, message: "Please enter the item name" },
                ]}
              >
                <Input
                  placeholder="Enter item name"
                  className="rounded-md py-2"
                />
              </Form.Item>

              <Form.Item
                label="Current Stock"
                name="current_stock"
                rules={[
                  { required: true, message: "Please enter current stock" },
                ]}
              >
                <InputNumber
                  placeholder="Enter current stock"
                  className="w-full rounded-md py-2"
                  min={0}
                />
              </Form.Item>

              <Form.Item label="Description" name="description">
                <Input.TextArea
                  rows={3}
                  placeholder="Enter description"
                  className="rounded-md py-2"
                />
              </Form.Item>

              <div className="flex justify-end">
                <Button
                  type="primary"
                  htmlType="submit"
                  icon={<SaveOutlined />}
                  loading={saving}
                  className="bg-blue-600 hover:bg-blue-700 text-white flex items-center"
                >
                  Save Changes
                </Button>
              </div>
            </Form>
          </Card>
        </div>
      </div>
    );
  }
}
