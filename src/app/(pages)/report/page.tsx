"use client";

import React, { useEffect, useState } from "react";
import { Table, message, Spin, Tag, Layout } from "antd";
import type { ColumnsType, TablePaginationConfig } from "antd/es/table";
import authAxios from "../../../lib/authAxios";
import dayjs from "dayjs";
import Navbar from "../../../components/Navbar";
import { Content } from "antd/es/layout/layout";
import { useRouter } from "next/navigation";

type Movement = {
  id: number;
  type: "IN" | "ADJUSTMENT" | "DELETE" | "OUT";
  quantity: number;
  created_at: string;
  item_name: string | null;
  user_name: string | null;
  warehouse_name: string | null;
  warehouse_location: string | null;
};

type PaginationInfo = {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

export default function StockMovementPage() {
  const [movements, setMovements] = useState<Movement[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState<PaginationInfo>({
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 0,
  });

  const router = useRouter();

  const fetchData = async (page = 1, limit = 10) => {
    try {
      setLoading(true);
      const res = await authAxios.get("/api/stock-movements", {
        params: { page, limit },
      });

      setMovements(res.data.data);
      setPagination(res.data.pagination);
    } catch {
      message.error("Failed to load stock movements");
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
    fetchData(pagination.page, pagination.limit);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleTableChange = (p: TablePaginationConfig) => {
    const currentPage = p.current || 1;
    setPagination((prev) => ({ ...prev, page: currentPage }));
    fetchData(currentPage, pagination.limit);
  };

  const columns: ColumnsType<Movement> = [
    {
      title: "No",
      key: "index",
      render: (_: unknown, __: Movement, index: number) => (
        <span className="font-medium">
          {index + 1 + (pagination.page - 1) * pagination.limit}
        </span>
      ),
    },
    {
      title: "Item",
      dataIndex: "item_name",
      key: "item_name",
      render: (name: string | null) => (
        <span className="font-medium">{name ?? "-"}</span>
      ),
    },
    {
      title: "Warehouse",
      key: "warehouse",
      render: (_: unknown, record: Movement) => (
        <div>
          <div className="font-semibold">{record.warehouse_name}</div>
          <div className="text-gray-500 text-xs">
            {record.warehouse_location}
          </div>
        </div>
      ),
    },
    {
      title: "Type",
      dataIndex: "type",
      key: "type",
      render: (type) => {
        const color =
          type === "IN" ? "green" : type === "ADJUSTMENT" ? "blue" : "red";
        return <Tag color={color}>{type}</Tag>;
      },
    },
    {
      title: "Quantity",
      dataIndex: "quantity",
      key: "quantity",
      render: (qty) => <span className="font-semibold">{qty}</span>,
    },
    {
      title: "User",
      dataIndex: "user_name",
      key: "user_name",
      render: (user: string | null) => <span>{user ?? "-"}</span>,
    },
    {
      title: "Date",
      dataIndex: "created_at",
      key: "created_at",
      render: (val: string) => dayjs(val).format("YYYY-MM-DD HH:mm:ss"),
    },
  ];

  return (
    <Layout className="min-h-screen bg-gray-50">
      <Navbar logout={logout} />

      <Content className="w-full max-w-full md:max-w-6xl mx-auto p-4 sm:p-6 space-y-8">
        <div>
          <div className="flex flex-col md:flex-row justify-between items-center mb-4 gap-3">
            <h1 className="text-xl md:text-2xl font-semibold">
              Stock Movements
            </h1>
          </div>

          {loading ? (
            <div className="flex justify-center items-center h-40">
              <Spin size="large" />
            </div>
          ) : (
            <div className="bg-white p-3 md:p-4 rounded-2xl shadow">
              <Table<Movement>
                dataSource={movements}
                rowKey="id"
                columns={columns}
                pagination={{
                  current: pagination.page,
                  pageSize: pagination.limit,
                  total: pagination.total,
                  showSizeChanger: false,
                }}
                onChange={handleTableChange}
                scroll={{ x: 800 }}
              />
            </div>
          )}
        </div>
      </Content>
    </Layout>
  );
}
