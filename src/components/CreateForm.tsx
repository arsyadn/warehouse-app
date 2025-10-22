"use client";
import React, { useEffect, useState } from "react";
import { InboxOutlined, PlusOutlined } from "@ant-design/icons";
import {
  Button,
  Card,
  Col,
  Form,
  Input,
  InputNumber,
  Row,
  Select,
  message,
} from "antd";
import authAxios from "../lib/authAxios";

interface CreateFormProps {
  fetchItems: () => void;
}

type Warehouse = {
  id: number;
  name: string;
  location: string;
};

type CreateItemFormValues = {
  name: string;
  currentStock: number;
  description?: string;
  warehouseId: number;
};

const CreateForm: React.FC<CreateFormProps> = ({ fetchItems }) => {
  const [form] = Form.useForm();
  const [warehouseLocation, setWarehouseLocation] = useState<Warehouse[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchWarehouse = async () => {
    try {
      setLoading(true);
      const res = await authAxios.get("/api/warehouses");
      setWarehouseLocation(res.data);
    } catch (err) {
      console.error(err);
      message.error("Failed to load warehouses.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWarehouse();
  }, []);

  const createItem = async (values: CreateItemFormValues) => {
    try {
      setLoading(true);
      await authAxios.post("/api/items", {
        name: values.name,
        currentStock: values.currentStock,
        description: values.description,
        warehouseId: values.warehouseId,
      });
      message.success("Item created successfully!");
      form.resetFields();
      fetchItems();
    } catch (err) {
      console.error(err);
      message.error("Failed to create item.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="mb-8">
      <Card
        title={
          <div className="flex items-center gap-2 text-lg font-semibold">
            <InboxOutlined /> Create New Item
          </div>
        }
        className="shadow-md rounded-lg"
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={createItem}
          className="flex flex-col gap-4"
        >
          <Row gutter={[16, 16]}>
            <Col xs={24} sm={12} md={6}>
              <Form.Item
                label="Item Name"
                name="name"
                className="w-full"
                rules={[{ required: true, message: "Please enter item name" }]}
              >
                <Input placeholder="Enter item name" className="w-full" />
              </Form.Item>
            </Col>

            <Col xs={24} sm={12} md={6}>
              <Form.Item
                label="Current Stock"
                name="currentStock"
                className="w-full"
                rules={[
                  { required: true, message: "Please enter current stock" },
                ]}
              >
                <InputNumber
                  placeholder="Enter stock"
                  min={0}
                  className="w-full"
                  style={{ width: "100%" }}
                />
              </Form.Item>
            </Col>

            <Col xs={24} sm={12} md={6}>
              <Form.Item
                label="Description"
                name="description"
                className="w-full"
              >
                <Input placeholder="Enter description" className="w-full" />
              </Form.Item>
            </Col>

            <Col xs={24} sm={12} md={6}>
              <Form.Item
                label="Warehouse"
                name="warehouseId"
                className="w-full"
                rules={[{ required: true, message: "Please select warehouse" }]}
              >
                <Select
                  placeholder="Select Warehouse"
                  loading={loading}
                  className="w-full"
                  options={warehouseLocation.map((wh) => ({
                    value: wh.id,
                    label: `${wh.location} - ${wh.name}`,
                  }))}
                />
              </Form.Item>
            </Col>
          </Row>

          <div className="flex justify-end">
            <Button
              type="primary"
              htmlType="submit"
              icon={<PlusOutlined />}
              loading={loading}
              className="bg-blue-600 hover:bg-blue-700 text-white rounded-md flex items-center"
            >
              Create Item
            </Button>
          </div>
        </Form>
      </Card>
    </section>
  );
};

export default CreateForm;
