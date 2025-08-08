import React, { useState, useEffect } from "react";
import { Link } from "@inertiajs/react";
import axios from 'axios';
import { Layout, Menu, Button, Spin, Image, Dropdown, Space, message } from "antd";
import { router } from "@inertiajs/react";
import {
    MenuFoldOutlined,
    MenuUnfoldOutlined,
    AppstoreOutlined,
    ContainerOutlined,
    DesktopOutlined,
    MailOutlined,
    PieChartOutlined,
    UserOutlined,
    SettingOutlined,
    QuestionCircleOutlined,
    BellOutlined,
    DownOutlined,
    LockOutlined,
    LogoutOutlined,
    FolderOpenOutlined,
    FileOutlined,ArrowRightOutlined
} from "@ant-design/icons";

//
const { Header, Content, Footer, Sider } = Layout;

export default function Admin({
    auth,
    header,
    tables,
    current = { id: 0, parent_id: 0 },
    content,
}) {
    const isMobile = window.innerWidth < 500;
    const [spinning, setSpinning] = useState(false);
    const menuItem = getItems(tables);
    const [isVisible, setIsVisible] = useState(!isMobile);
    const [user, setUser] = useState(null);

    const listItems = tables.map((table) =>
        table.sub.length === 0 ? (
            <Menu.Item key={table.parent.id}>
                <Link href={route("data.index", [table.parent.id])}>
                    {table.parent.display_name}
                </Link>
            </Menu.Item>
        ) : (
            <Menu.SubMenu
                key={table.parent.id}
                title={table.parent.display_name}
            >
                {table["sub"].map((sub) => (
                    <Menu.Item key={sub.id}>
                        <Link href={route("data.index", [sub.id])}>
                            {sub.display_name}
                        </Link>
                    </Menu.Item>
                ))}
            </Menu.SubMenu>
        )
    );

    const onClick = (e) => {
        setSpinning(true);
    };

    const onClickMenuHeader = (e) => {
        setSpinning(true);
        return router.get(route("gmail"));
    };

    function getItems(tables) {
        
        let result = [];
        for (let table of tables) {
            let itemTmp = [];
            itemTmp.label = <Link href={ table.parent.link === '' || table.parent.link == null ? route("data.index", [table.parent.id]) : table.parent.link  }>{table.parent.display_name}</Link>;
            itemTmp.key = table.parent.id;
            if (table.sub.length > 0) {
                itemTmp.label = table.parent.display_name;
                let sub = [];
                for (let subData of table.sub) {
                    let submenu = {};
                    submenu.label = <Link href={subData.link === '' || subData.link === null ?  route("data.index", [subData.id]) : subData.link }>{subData.display_name}</Link>;
                    submenu.key = subData.id;
                    sub.push(submenu);
                }
                itemTmp.children = sub;
            }
            result.push(itemTmp);
        }
        return result;
    }

    const items = [
        {
            label: <Link href={route("admin_user.index")}>Trang cá nhân</Link>,
            key: "1",
            icon: <UserOutlined />,
        },
        {
            label: <Link href={route("admin_user.edit")}>Đổi mật khẩu</Link>,
            key: "2",
            icon: <LockOutlined />,
        },
        {
            label: <a href={route("admin_user.logout")}>Thoát</a>,
            key: "3",
            icon: <LogoutOutlined />,
            danger: false,
        },
    ];

    const menuProps = {
        items,
    };

    

    function showNotification() {
        const [items, setItems] = useState([
            {
              key: '1',
              label: (<Spin/>),
            },
        ]);

        function loadDrop(e) {
            e.preventDefault();
            axios.post(route("data.log_latest"))
            .then((response) => {
                if (response.data.status_code == 200) {
                    const item = response.data.data.map((log)=> {
                        return {
                            label: <Link href={route("data.detail", [log.table_id, log.data_id])}>{log.name}</Link>,
                            key: log.id,
                            icon: <ArrowRightOutlined />
                        };
                    });
                    setItems(item);
                } else {
                    message.error("Tải thông báo thất bại");
                }
            })
            .catch((error) => {
                message.error("Tải thông báo thất bại");
            });
        }
        
        return <Dropdown menu={{items}} trigger={['click']} placement="bottom" arrow>
                    <a onClick={(e) => loadDrop(e)}>
                        <BellOutlined className="Bell" />
                    </a>
                </Dropdown>
    }


    return (
        <Layout>
            {isVisible && (
                <Sider width={250}>
                    <img
                        className="logo_slidebar"
                        src="/images/logo/logo.png"
                    />
                    <Menu
                        // mode="inline"
                        mode="horizontal"
                        theme="light"
                        className="slide"
                        items={menuItem}
                        defaultSelectedKeys={[current.id.toString()]}
                        defaultOpenKeys={[current.parent_id.toString()]}
                        onClick={onClick}
                    />
                </Sider>
            )}

            <Layout className="site-layout">
                <Header
                    className="site-layout-background aitilen-header"
                    style={{ padding: 0 }}
                >
                    <div className="header__content">
                        <div className="header-left">
                            {React.createElement(
                                isVisible
                                    ? MenuFoldOutlined
                                    : MenuUnfoldOutlined,
                                {
                                    className: "trigger",
                                    onClick: () => setIsVisible(!isVisible),
                                }
                            )}
                            <Link className="item-header active" href={route('dashboard')}>Admin</Link>
                            <span>|</span>
                            <a className="item-header" target="new" href="/">Trang chủ</a>
                        </div>

                        <div className="account">
                            <div>
                                {showNotification()}
                            </div>
                            <div className="user_name">
                                <div className="name_account">
                                    <Dropdown menu={menuProps}>
                                        <Button>
                                            <Space>
                                                Tài khoản
                                                <DownOutlined />
                                            </Space>
                                        </Button>
                                    </Dropdown>
                                </div>
                            </div>

                            <div>
                                <Link href={route("admin.setting.menu")}>
                                    <SettingOutlined className="setting" />
                                </Link>
                            </div>
                            <div>
                                <QuestionCircleOutlined className="Circle" />
                            </div>
                        </div>
                    </div>
                </Header>

                <Content
                    className="site-layout-background"
                    style={{
                        margin: "24px 16px",
                        padding: 24,
                        minHeight: 280,
                    }}
                >
                    <Spin spinning={spinning} size="large">
                        <article>{content}</article>
                    </Spin>
                </Content>
                <Footer style={{ textAlign: "center" }}>
                    HT Việt Nam ©2018 Created by HT Việt Nam
                </Footer>
            </Layout>
        </Layout>
    );
}
