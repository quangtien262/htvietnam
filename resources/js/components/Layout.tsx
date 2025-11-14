import React, { useEffect, useState } from "react";
import { Link } from 'react-router-dom';
import { useSearchParams } from "react-router-dom";

import {
    Layout, Menu, Button, Spin, Dropdown,
    Drawer, Row,
    Col
} from "antd";
import {
    UserOutlined, MenuOutlined,
    LockOutlined,
    LogoutOutlined,
    BellOutlined,
    SettingOutlined,
} from "@ant-design/icons";

import API from '../common/api';
import ROUTE from "../common/route";
import MENU from "../common/menu";
import NotificationDropdown from "./NotificationDropdown";

const { Header, Content, Sider, Footer } = Layout;

interface MenuItem {
    label: React.ReactNode;
    key: string | number;
    children?: MenuItem[];
}

interface AdminProps {
    auth: any;
    tables?: any[] | null;
    current?: { id: number; parent_id: number };
    content: React.ReactNode;
}

const userMenuItems = [
    {
        label: <Link to={'/'}>Trang cá nhân</Link>,
        key: 'profile',
        icon: <UserOutlined />,
    },
    {
        label: <Link to={'/'}>Đổi mật khẩu</Link>,
        key: 'change-password',
        icon: <LockOutlined />,
    },
    {
        type: 'divider' as const,
    },
    {
        label: <Link to={'/'}>Đăng xuất</Link>,
        key: 'logout',
        icon: <LogoutOutlined />,
        danger: true,
    },
];

const AppLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [searchParams] = useSearchParams();
    const p = searchParams.get("p");
    if (!p) { window.location.href = `${ROUTE.dashboard}?p=home`; }

    const isMobile = window.innerWidth < 768;
    const [spinning, setSpinning] = useState(false);
    const [showMobileMenu, setShowMobileMenu] = useState(false);
    const params = new URLSearchParams(window.location.search);


    let menus: any = MENU[p];
    return (
        <Layout>
            {/* Top Header - Logo & Settings */}
            <div className="top-header" style={{
                background: '#fff',
                borderBottom: '1px solid #f0f0f0',
                padding: '0 24px',
                height: '64px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                position: 'sticky',
                top: 0,
                zIndex: 1000,
            }}>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                    <img
                        className="logo-header"
                        src="/images/logo.png"
                        style={{ height: '40px', cursor: 'pointer' }}
                        alt="Logo"
                    />
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    {/* Notification Bell */}
                    <NotificationDropdown />

                    {/* Settings */}
                    <Dropdown
                        menu={{
                            items: [
                                {
                                    key: 'settings',
                                    label: <Link to={'/'}>Cài đặt</Link>,
                                    icon: <SettingOutlined />,
                                }
                            ]
                        }}
                        trigger={['click']}
                        placement="bottomRight"
                    >
                        <Button
                            type="text"
                            icon={<SettingOutlined style={{ fontSize: '18px' }} />}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}
                        />
                    </Dropdown>

                    {/* User Account */}
                    <Dropdown
                        menu={{ items: userMenuItems }}
                        trigger={['click']}
                        placement="bottomRight"
                    >
                        <Button
                            type="text"
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                height: '40px',
                                padding: '0 12px'
                            }}
                        >
                            <UserOutlined style={{ fontSize: '18px' }} />
                            {!isMobile && <span>Tài khoản</span>}
                        </Button>
                    </Dropdown>
                </div>
            </div>

            {/* Navigation Menu */}
            <div style={{
                background: '#fff',
                borderBottom: '1px solid #f0f0f0',
                position: 'sticky',
                top: '64px',
                zIndex: 999,
            }}>
                <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
                    {isMobile ? (
                        <div style={{ padding: '12px 24px' }}>
                            <Button
                                type="text"
                                icon={<MenuOutlined style={{ fontSize: 20 }} />}
                                onClick={() => setShowMobileMenu(true)}
                                style={{ width: '100%', textAlign: 'left' }}
                            >
                                Menu
                            </Button>
                            <Drawer
                                title="Menu"
                                placement="left"
                                onClose={() => setShowMobileMenu(false)}
                                open={showMobileMenu}
                                width={280}
                            >
                                <Menu
                                    mode="vertical"
                                    theme="light"
                                    items={menus}
                                    onClick={() => setShowMobileMenu(false)}
                                />
                            </Drawer>
                        </div>
                    ) : (
                        <Menu
                            mode="horizontal"
                            theme="light"
                            items={menus}
                            style={{
                                border: 'none',
                                padding: '0 24px'
                            }}
                        />
                    )}
                </div>
            </div>
            <Layout>
                <Content>
                    <br />
                    <div className="main-content">
                        <Spin spinning={spinning} size="large">
                            <article>{children}</article>
                        </Spin>
                    </div>
                </Content>
            </Layout>
            <Footer style={{ textAlign: 'center' }}>
                HTVietNam ©{new Date().getFullYear()} Created by HT Việt Nam
            </Footer>
        </Layout>
    );
};

export default AppLayout;
