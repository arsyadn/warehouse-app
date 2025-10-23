"use client";
import React, { useEffect, useState } from "react";
import {
  EditOutlined,
  DeleteOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import { Button, Card, Layout, Table, Tag, message, Input } from "antd";
import Link from "next/link";
import { useRouter } from "next/navigation";
import authAxios from "../lib/authAxios";
import CreateForm from "../components/CreateForm";
import ModalConfirmation from "../components/ModalConfirmation";
import Navbar, { UserType } from "../components/Navbar";

const { Content } = Layout;

type Item = {
  id: number;
  name: string;
  current_stock: number;
  description?: string;
  warehouse_id: number;
};

type Pagination = {
  page: number;
  limit: number;
  totalCount: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
};

type SelectedValue = { id: number; warehouse_id: number };

export default function DashboardPage() {
  const [items, setItems] = useState<Item[]>([]);
  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    limit: 5,
    totalCount: 0,
    totalPages: 0,
    hasNext: false,
    hasPrev: false,
  });
  const [fetching, setFetching] = useState(true);
  const [user, setUser] = useState<UserType | null>(null);
  const [isMounted, setIsMounted] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedValue, setSelectedValue] = useState<SelectedValue | null>(
    null
  );
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  const router = useRouter();

  const fetchItems = async (page = 1, limit = 5, search = "") => {
    setFetching(true);
    try {
      const res = await authAxios.get(
        `/api/items?page=${page}&limit=${limit}&search=${encodeURIComponent(
          search
        )}`
      );
      setItems(res.data.items);
      setPagination(res.data.pagination);
    } catch (err) {
      console.error(err);
      message.error("Failed to load items.");
    } finally {
      setFetching(false);
    }
  };

  const handleDelete = async (id: number, warehouseId: number) => {
    setLoading(true);
    try {
      await authAxios.delete(`/api/items/${id}?warehouse=${warehouseId}`);
      message.success("Item deleted successfully.");
      fetchItems(pagination.page, pagination.limit, debouncedSearch);
    } catch (err) {
      console.error(err);
      message.error("Failed to delete item.");
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    router.push("/login");
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    const userString = localStorage.getItem("user");
    const user: UserType | null = userString ? JSON.parse(userString) : null;
    setUser(user);

    setIsMounted(true);

    if (!token) {
      router.push("/login");
    }
  }, []);

  useEffect(() => {
    if (isMounted)
      fetchItems(pagination.page, pagination.limit, debouncedSearch);
    // eslint-disable-next-line
  }, [isMounted, debouncedSearch]);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchTerm);
    }, 500); // 0.5s
    return () => clearTimeout(handler);
  }, [searchTerm]);

  if (!isMounted) {
    return (
      <div className="flex items-center justify-center h-screen text-gray-500">
        <span className="animate-pulse">Loading...</span>
      </div>
    );
  }

  const columns = [
    {
      title: "ID",
      dataIndex: "id",
      key: "id",
      width: 70,
      render: (id: number) => <span className="text-gray-700">{id}</span>,
    },
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
      render: (text: string) => <span className="font-medium">{text}</span>,
    },
    {
      title: "Stock",
      dataIndex: "current_stock",
      key: "current_stock",
      render: (stock: number) => (
        <Tag color={stock > 10 ? "green" : "volcano"}>{stock}</Tag>
      ),
    },
    {
      title: "Description",
      dataIndex: "description",
      key: "description",
      render: (desc?: string) => desc || "-",
    },
    ...(user?.role === "Admin"
      ? [
          {
            title: "Actions",
            key: "actions",
            render: (_: null, record: Item) => (
              <div className="flex gap-2">
                <Link href={`/dashboard/items/${record.id}/edit`}>
                  <Button
                    type="default"
                    icon={<EditOutlined />}
                    size="small"
                    className="border-blue-500 text-blue-600 hover:bg-blue-50"
                  >
                    Edit
                  </Button>
                </Link>

                <Button
                  type="default"
                  danger
                  icon={<DeleteOutlined />}
                  size="small"
                  onClick={() => {
                    setSelectedValue({
                      id: record.id,
                      warehouse_id: record.warehouse_id,
                    });
                    setIsModalOpen(true);
                  }}
                >
                  Delete
                </Button>
              </div>
            ),
          },
        ]
      : []),
  ];

  return (
    <Layout className="min-h-screen bg-gray-50">
      <Navbar logout={logout} />

      <Content className="w-full max-w-full md:max-w-6xl mx-auto p-4 sm:p-6 space-y-8">
        <CreateForm
          fetchItems={() =>
            fetchItems(pagination.page, pagination.limit, debouncedSearch)
          }
        />

        <Card
          title={
            <div className="flex justify-between items-center">
              <span className="text-lg font-medium">Items List</span>
              <Input
                placeholder="Search items..."
                prefix={<SearchOutlined />}
                allowClear
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{ width: 200 }}
              />
            </div>
          }
          className="shadow-md rounded-lg"
        >
          <Table
            dataSource={items}
            columns={columns}
            loading={fetching}
            rowKey="id"
            pagination={{
              current: pagination.page,
              total: pagination.totalCount,
              pageSize: pagination.limit,
              showSizeChanger: false,
              onChange: (page) =>
                fetchItems(page, pagination.limit, debouncedSearch),
            }}
            className="overflow-x-auto"
          />
        </Card>
      </Content>

      {isModalOpen && selectedValue && (
        <ModalConfirmation
          isModalOpen={isModalOpen}
          handleOk={async () => {
            await handleDelete(selectedValue.id, selectedValue.warehouse_id);
            setIsModalOpen(false);
            setSelectedValue(null);
          }}
          handleCancel={() => {
            setIsModalOpen(false);
            setSelectedValue(null);
          }}
          loading={loading}
          text="Are you sure you want to delete this item?"
        />
      )}
    </Layout>
  );
}
