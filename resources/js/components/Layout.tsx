import React, { useEffect, useState } from "react";
import { Link, useLocation } from 'react-router-dom';
import axios from "axios";

// Lấy token từ meta tag
const token = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
if (token) {
    axios.defaults.headers.common['X-CSRF-TOKEN'] = token;
}
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

const AppLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {

    const isMobile = window.innerWidth < 768;
    const [spinning, setSpinning] = useState(false);
    const [showMobileMenu, setShowMobileMenu] = useState(false);
    const params = new URLSearchParams(window.location.search);
    const p = params.get('p'); // sẽ là string hoặc null

    const onClick = (e) => {
        // setSpinning(true);
    };

    function getItems() {
        const menus = MENU[p as string];
        const itemsMenu: MenuItem[] = [
            {
                label: <Link to="/" className="a-logo"><img className="logo-header" src="/images/logo.png" /></Link>,
                key: 0,
                // icon: <HomeOutlined />,
            },
            // {
            //     label: <a href={route("home")}><HomeOutlined /> Website</a>,
            //     key: '-1',
            //     // icon: <HomeOutlined />,
            // },
            // {
            //     label: <a href={route("dashboard")}><DashboardOutlined /> Admin</a>,
            //     key: '-2',
            //     // icon: <HomeOutlined />,
            // },
        ];

        if (!menus) {
            return itemsMenu;
        }

        // menus.forEach((menu: any) => {

        //     let itemTmp: any = {};
        //     itemTmp.label = <Link href={menu.link}>{menu.parent.display_name}</Link>;
        //     itemTmp.key = key++;
        //     if (menu.children.length > 0) {
        //         itemTmp.label = <>{menu.parent.display_name} <DownOutlined /></>;
        //         let sub = [];
        //         for (let subData of menu.children) {
        //             let submenu: any = {};
        //             submenu.label = <Link to={'/'}>{subData.display_name}</Link>;
        //             submenu.key = key++;
        //             sub.push(submenu);
        //         }
        //         itemTmp.children = sub;
        //     }
        //     itemsMenu.push(itemTmp);
        // });
        return itemsMenu;
    }

    let key = 1;
    const items = [
        {
            label: <Link to={'/'}>Trang cá nhân</Link>,
            key: key++,
            icon: <UserOutlined />,
        },
        {
            label: <Link to={'/'}>Đổi mật khẩu</Link>,
            key: key++,
            icon: <LockOutlined />,
        },
        {
            label: <Link to={'/'}>Thoát</Link>,
            key: key++,
            icon: <LogoutOutlined />,
            danger: false,
        },
    ];

    const menus = MENU[p as string];
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
                                onClick={onClick}
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
