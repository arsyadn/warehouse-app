"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Button, Drawer, Avatar, Dropdown, MenuProps, Badge } from "antd";
import {
  MenuOutlined,
  BellOutlined,
  UserOutlined,
  LogoutOutlined,
} from "@ant-design/icons";
import { useMediaQuery } from "react-responsive";
import { usePathname, useRouter } from "next/navigation";

interface NavbarProps {
  logout: () => void;
}
export type UserType = {
  username: string;
  role: string;
  email: string;
};

const Navbar: React.FC<NavbarProps> = ({ logout }) => {
  const [open, setOpen] = useState(false);
  const [user, setUser] = useState<UserType | null>(null);
  const [hydrated, setHydrated] = useState(false);

  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    setHydrated(true);
    const userString = localStorage.getItem("user");
    const user: UserType | null = userString ? JSON.parse(userString) : null;
    setUser(user);

    if (pathname === "/report" && user?.role !== "Admin") {
      router.push("/");
    }
  }, []);

  const isLaptop = useMediaQuery({ query: "(min-width: 768px)" });

  const menuItems: MenuProps["items"] = [
    {
      key: "profile",
      label: (
        <div className="px-3 py-2">
          <div className="flex items-center gap-3">
            <Avatar src={"/avatar.jpg"} size={40} icon={<UserOutlined />} />
            <div>
              <p className="font-medium">{user?.username}</p>
              <p className="text-sm text-gray-500">{user?.email}</p>
            </div>
          </div>
        </div>
      ),
    },
    { type: "divider" },
    {
      key: "signout",
      label: (
        <div
          onClick={logout}
          className="flex items-center gap-2 text-red-500 hover:text-red-600 cursor-pointer px-3 py-2"
        >
          <LogoutOutlined />
          <span>Sign Out</span>
        </div>
      ),
    },
  ];

  const navItems = [
    { href: "/", label: "Home" },
    { href: "/report", label: "Report" },
  ];

  return (
    <header className="bg-white shadow-sm sticky top-0 z-10">
      <div className="max-w-7xl mx-auto px-6 flex justify-between items-center h-16">
        {/* Logo + Title */}
        <div className="flex items-center gap-3">
          <Image
            src="/logo-siloam.png"
            alt="Siloam Logo"
            width={40}
            height={40}
            className="object-contain"
          />
          <h1 className="text-lg font-semibold text-gray-800">
            Siloam Dashboard
          </h1>
        </div>

        {hydrated && (
          <>
            <nav className="hidden md:flex items-center gap-8 font-medium">
              {user?.role === "Admin" &&
                navItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`transition ${
                      pathname === item.href
                        ? "text-blue-500 underline"
                        : "text-gray-600 hover:text-blue-500"
                    }`}
                  >
                    {item.label}
                  </Link>
                ))}
            </nav>

            <div className="hidden md:flex items-center gap-5">
              <Badge>
                <BellOutlined className="text-xl text-gray-600 cursor-pointer hover:text-blue-500" />
              </Badge>

              <Dropdown
                menu={{ items: menuItems }}
                trigger={["click"]}
                placement="bottomRight"
                arrow
              >
                <div className="cursor-pointer">
                  <Avatar
                    src={"/avatar.jpg"}
                    size="large"
                    icon={<UserOutlined />}
                  />
                </div>
              </Dropdown>
            </div>

            {!isLaptop && (
              <Button
                type="text"
                icon={<MenuOutlined className="text-xl" />}
                onClick={() => setOpen(true)}
                className="block md:hidden"
              />
            )}
          </>
        )}
      </div>

      <Drawer
        title="Menu"
        placement="right"
        onClose={() => setOpen(false)}
        open={open}
      >
        {hydrated && (
          <>
            <nav className="flex flex-col gap-4 text-gray-700">
              {user?.role === "Admin" &&
                navItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setOpen(false)}
                    className={`transition ${
                      pathname === item.href
                        ? "text-blue-500"
                        : "text-gray-600 hover:text-blue-500"
                    }`}
                  >
                    {item.label}
                  </Link>
                ))}
            </nav>

            <div className="mt-6 border-t pt-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Avatar src={"/avatar.jpg"} size={40} icon={<UserOutlined />} />
                <div>
                  <p className="font-medium">{user?.username}</p>
                  <p className="text-sm text-gray-500">{user?.email}</p>
                </div>
              </div>
              <Button
                type="link"
                icon={<LogoutOutlined />}
                danger
                onClick={logout}
              >
                Sign Out
              </Button>
            </div>
          </>
        )}
      </Drawer>
    </header>
  );
};

export default Navbar;
