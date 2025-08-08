import React, { useState } from "react";
import { Link } from "@inertiajs/react";
import axios from 'axios';
import {
    Layout, Menu, Button, Spin, Image, Dropdown, message,
    Modal, Row, Col
} from "antd";
import { router } from "@inertiajs/react";
import { callApi } from "../Function/api";
import {
    UserOutlined,
    SettingOutlined,
    BellOutlined,
    LockOutlined,
    LogoutOutlined,
    ArrowRightOutlined, MoneyCollectFilled
} from "@ant-design/icons";



//
const { Header, Content, Footer, Sider } = Layout;

export default function Admin({
    auth,
    header,
    tables = null,
    current = { id: 0, parent_id: 0 },
    content,
}) {
    const isMobile = window.innerWidth < 2000;
    const [spinning, setSpinning] = useState(false);
    // const menuItem = getItems(tables);
    const [isVisible, setIsVisible] = useState(!isMobile);

    const onClick = (e) => {
        setSpinning(true);
    };

    function getItems() {

        let result = [];
        for (let table of tables) {
            let itemTmp = [];
            itemTmp.label = <Link href={table.parent.link === '' || table.parent.link == null ? route("data.index", [table.parent.id]) : table.parent.link}>{table.parent.display_name}</Link>;
            itemTmp.key = table.parent.id;
            if (table.sub.length > 0) {
                itemTmp.label = table.parent.display_name;
                let sub = [];
                for (let subData of table.sub) {
                    let submenu = {};
                    submenu.label = <Link href={subData.link === '' || subData.link === null ? route("data.index", [subData.id]) : subData.link}>{subData.display_name}</Link>;
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

    function showNotification() {
        const [items, setItems] = useState([
            {
                key: '1',
                label: (<Spin />),
            },
        ]);

        function loadDrop(e) {
            e.preventDefault();
            axios.post(route("data.log_latest"))
                .then((response) => {
                    if (response.data.status_code == 200) {
                        const item = response.data.data.map((log) => {
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

        return <Dropdown menu={{ items }} trigger={['click']} placement="bottom" arrow>
            <a onClick={(e) => loadDrop(e)}>
                <BellOutlined className="Bell" />
            </a>
        </Dropdown>
    }


    return (
        <Layout>

            <div className="header01">
                <a href="/"><img className="logo-header" src="/images/logo.png" /></a>

                <div className="main-menu-header">
                    <Button className="btn-thu-ngan" onClick={() => { window.open(route('hoaDon.create'), '_blank').focus(); }}>
                        <MoneyCollectFilled />
                        Thu ngân
                    </Button>

                    <a className="icon-header" href={route('admin.setting.menu')} target="new">
                        <SettingOutlined />
                    </a>
                    <Dropdown menu={{ items }} trigger={['click']}>
                        <a className="icon-header" onClick={(e) => e.preventDefault()}>
                            <UserOutlined />
                        </a>
                    </Dropdown>
                </div>
            </div>
            <Header style={{ display: 'flex', alignItems: 'center' }}>
                <div className="demo-logo" />
                {
                    !tables
                        ?
                        ''
                        :
                        <Menu
                            mode="horizontal"
                            theme="light"
                            className="slide"
                            items={getItems()}
                            // defaultSelectedKeys={[current.id.toString()]}
                            // defaultOpenKeys={[current.parent_id.toString()]}
                            onClick={onClick}
                        />
                }

            </Header>

            <Content style={{ padding: '0 48px' }}>

                <br />
                <div className="main-content">
                    <Spin spinning={spinning} size="large">
                        <article>{content}</article>
                    </Spin>
                </div>
            </Content>

            <Footer style={{ textAlign: 'center' }}>
                HTVietNam ©{new Date().getFullYear()} Created by HT Việt Nam
            </Footer>
        </Layout>
    );
}
