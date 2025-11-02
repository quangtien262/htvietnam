import React, { useEffect, useState } from "react";
import { Link, useNavigate } from 'react-router-dom';
import { useSearchParams } from "react-router-dom";

import {
    Layout, Menu, Button, Spin, Image, Dropdown, message,
    Drawer
} from "antd";
import {
    UserOutlined, DownOutlined,
    DashboardOutlined,
    UnorderedListOutlined,
    LockOutlined,
    LogoutOutlined,
    HomeOutlined
} from "@ant-design/icons";

import API from '../common/api';
import ROUTE from "../common/route";
import MENU from "../common/menu";

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

const items = [
    {
        label: <Link to={'/'}>Trang cá nhân</Link>,
        key: '1',
        icon: <UserOutlined />,
    },
    {
        label: <Link to={'/'}>Đổi mật khẩu</Link>,
        key: '2',
        icon: <LockOutlined />,
    },
    {
        label: <Link to={'/'}>Thoát</Link>,
        key: '3',
        icon: <LogoutOutlined />,
        danger: false,
    },
];

const AppLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [searchParams] = useSearchParams();
    const p = searchParams.get("p");
    // const navigate = useNavigate();
    // if (!p) { navigate(`${ROUTE.dashboard}?p=home`); }
    if (!p) { window.location.href = `${ROUTE.dashboard}?p=home`; }

    const isMobile = window.innerWidth < 768;
    const [spinning, setSpinning] = useState(false);
    const [showMobileMenu, setShowMobileMenu] = useState(false);
    const params = new URLSearchParams(window.location.search);


    let menus: any = MENU[p];
    console.log(menus);
    return (
        <Layout>
            <div className="header01">
                <div className="main-menu-header-letf">
                    <Header style={{ display: 'flex', alignItems: 'center' }}>
                        <div className="demo-logo" />
                        {isMobile ? (
                            <>
                                <Button
                                    type="text"
                                    icon={<MenuOutlined style={{ fontSize: 24 }} />}
                                    onClick={() => setShowMobileMenu(true)}
                                    style={{ marginRight: 16 }}
                                />
                                <Drawer
                                    title="Menu"
                                    placement="left"
                                    onClose={() => setShowMobileMenu(false)}
                                    open={showMobileMenu}
                                >
                                    <Menu
                                        mode="vertical"
                                        theme="light"
                                        items={menus}
                                        onClick={() => setShowMobileMenu(false)}
                                    />
                                </Drawer>
                            </>
                        ) : (
                            <Menu
                                mode="horizontal"
                                theme="light"
                                className="slide menu-header"
                                items={menus}
                            />
                        )}
                    </Header>
                </div>
                <div className="main-menu-header">
                    <Dropdown menu={{ items }} trigger={['click']}>
                        <a className="icon-header" onClick={(e) => e.preventDefault()}>
                            <UserOutlined />
                        </a>
                    </Dropdown>
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
