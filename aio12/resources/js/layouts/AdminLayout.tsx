import React, { useEffect, useState } from "react";
import { Drawer } from "antd";
import { MenuOutlined } from "@ant-design/icons";
import { Link } from "@inertiajs/react";
import {
    Layout, Menu, Button, Spin, Image, Dropdown, message
} from "antd";
import {
    UserOutlined, DownOutlined,
    DashboardOutlined,
    UnorderedListOutlined,
    LockOutlined,
    LogoutOutlined,
    HomeOutlined
} from "@ant-design/icons";

import axios from "axios";
import { get } from "lodash";

//
const { Header, Content, Footer } = Layout;

interface MenuItem {
    label: React.ReactNode;
    key: string | number;
    children?: MenuItem[];
}

interface AdminProps {
    auth: any;
    header: React.ReactNode;
    tables?: any[] | null;
    current?: { id: number; parent_id: number };
    content: React.ReactNode;
}

export default function Admin({
    auth,
    header,
    current = { id: 0, parent_id: 0 },
    content,
}: AdminProps) {
    const isMobile = window.innerWidth < 768;
    const [spinning, setSpinning] = useState(false);
    const [showMobileMenu, setShowMobileMenu] = useState(false);
    let key = 1;
    const [menus, setMenus] = useState([]);

    const params = new URLSearchParams(window.location.search);
    const p = params.get('p'); // sẽ là string hoặc null
    
    useEffect(() => {
        axios.post(route('getMenus', { p: p }))
            .then((res) => {
                setMenus(res.data.data);
            })
            .catch((err) => console.error(err));
    }, []);

    const onClick = (e) => {
        setSpinning(true);
    };

    function getLinkRoute(menu: any) {
        if (menu.route && menu.route === 'data.tblName') {
            return route(menu.route, { p: p });
        }

        // đôi với route task.list thì format này có thể áp dụng cho trường hợp là QL công việc, quy trình sale, cskh ...
        if(menu.route === 'task.list') {  
            return route(menu.route, {parentName:menu.table_name, p: p});
        }
        return route(menu.route, { p: p });
    }

    function getLinkMenu(menu: any) {
        let href = '';
        if (menu.route) {
            href = getLinkRoute(menu);
        }

        if (menu.link) {
            href = menu.link;
        }
        
        return href;
    }

    function getItems() {

        const itemsMenu: MenuItem[] = [
            {
                label: <Link href={route("dashboard")} className="a-logo"><img className="logo-header" src="/images/logo.png" /></Link>,
                key: 0,
                // icon: <HomeOutlined />,
            },
            {
                label: <a href={route("home")}><HomeOutlined /> Website</a>,
                key: '-1',
                // icon: <HomeOutlined />,
            },
            {
                label: <a href={route("dashboard")}><DashboardOutlined /> Admin</a>,
                key: '-2',
                // icon: <HomeOutlined />,
            },
        ];

        if (!menus) {
            return itemsMenu;
        }

        menus.forEach((menu: any) => {
            let link = getLinkMenu(menu.parent);

            let itemTmp: any = {};
            itemTmp.label = <Link href={link}>{menu.parent.display_name}</Link>;
            itemTmp.key = key++;
            if (menu.children.length > 0) {
                itemTmp.label = <>{menu.parent.display_name} <DownOutlined /></>;
                let sub = [];
                for (let subData of menu.children) {
                    let subLink = getLinkMenu(subData);
                    let submenu: any = {};
                    submenu.label = <Link href={subLink}>{subData.display_name}</Link>;
                    submenu.key = key++;
                    sub.push(submenu);
                }
                itemTmp.children = sub;
            }
            itemsMenu.push(itemTmp);
        });
        return itemsMenu;
    }

    const items = [
        {
            label: <Link href={route("admin_user.index")}>Trang cá nhân</Link>,
            key: key++,
            icon: <UserOutlined />,
        },
        {
            label: <Link href={route("admin_user.edit")}>Đổi mật khẩu</Link>,
            key: key++,
            icon: <LockOutlined />,
        },
        {
            label: <a href={route("admin_user.logout")}>Thoát</a>,
            key: key++,
            icon: <LogoutOutlined />,
            danger: false,
        },
    ];

    function itemHome() {
        const result = [
            {
                label: <a href="/"><img className="logo-header" src="/images/logo.png" /></a>,
                key: key++
            },
            {
                label: <a href="/" className="menu-item-active" target="new"><HomeOutlined /> Website</a>,
                key: key++
            },
            {
                label: <Link href={route("dashboard")}><DashboardOutlined /> Admin</Link>,
                key: key++
            },

        ]
        return result;
    }

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
                                        items={menus ? getItems() : itemHome()}
                                        onClick={() => setShowMobileMenu(false)}
                                    />
                                </Drawer>
                            </>
                        ) : (
                            menus ? (
                                <Menu
                                    mode="horizontal"
                                    theme="light"
                                    className="slide menu-header"
                                    items={getItems()}
                                    onClick={onClick}
                                />
                            ) : (
                                <Menu
                                    mode="horizontal"
                                    theme="light"
                                    className="slide menu-header"
                                    items={itemHome()}
                                    defaultSelectedKeys={[2]}
                                    defaultOpenKeys={[2]}
                                    onClick={onClick}
                                />
                            )
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
                            <article>{content}</article>
                        </Spin>
                    </div>
                </Content>
            </Layout>
            <Footer style={{ textAlign: 'center' }}>
                HTVietNam ©{new Date().getFullYear()} Created by HT Việt Nam
            </Footer>
        </Layout>
    );
}
