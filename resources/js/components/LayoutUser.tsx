import React, { useEffect, useState } from "react";
import { Link } from 'react-router-dom';
import { useSearchParams } from "react-router-dom";

import { Layout, Menu, theme } from 'antd';
import { FileProtectOutlined, BookOutlined, IssuesCloseOutlined, IdcardFilled, HomeFilled } from '@ant-design/icons';

import API from '../common/api';
import ROUTE_ROUTE from "../common/route_user";



const { Header, Content, Footer, Sider } = Layout;

const items = [
    {
        key: '0',
        icon: <HomeFilled />,
        label: <Link to={ROUTE_ROUTE.dashboard}>Trang chủ</Link>,
    },
    {
        key: '1',
        icon: <FileProtectOutlined />,
        label: <Link to={ROUTE_ROUTE.invoices}>Hóa đơn</Link>,
    },
    {
        key: '2',
        icon: <BookOutlined />,
        label: <Link to={ROUTE_ROUTE.contracts}>Hợp đồng</Link>,
    },
    {
        key: '3',
        icon: <IssuesCloseOutlined />,
        label: <Link to={ROUTE_ROUTE.support}>Hỗ trợ</Link>,
    },
    {
        key: '4',
        icon: <IdcardFilled />,
        label: <Link to={ROUTE_ROUTE.profile}>Tài khoản</Link>,
    },
    {
        key: '5',
        icon: <IdcardFilled />,
        label: <a href={ROUTE_ROUTE.logoutUser}>Thoát</a>,
    },
]

const LayoutUser: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [searchParams] = useSearchParams();
    // const p = searchParams.get("p");

    const isMobile = window.innerWidth < 768;
    const [spinning, setSpinning] = useState(false);
    const [showMobileMenu, setShowMobileMenu] = useState(false);
    const params = new URLSearchParams(window.location.search);

    const {
        token: { colorBgContainer, borderRadiusLG },
    } = theme.useToken();

    return (
        <Layout>
            <Sider
                breakpoint="lg"
                collapsedWidth="0"
                onBreakpoint={(broken) => {
                    console.log(broken);
                }}
                onCollapse={(collapsed, type) => {
                    console.log(collapsed, type);
                }}
            >
                {/* <div className="demo-logo-vertical" /> */}
                {/* <img id="logo26" src="/images/logo.png" /> */}
                <img id="logo26" src="/images/logo/Aitilen.webp" />
                <Menu theme="light" mode="inline" items={items} />
            </Sider>
            <Layout>
                <Header style={{ padding: 0, background: colorBgContainer }} />
                <Content style={{ margin: '24px 16px 0' }}>
                    <div
                        style={{
                            padding: 24,
                            minHeight: 360,
                            background: colorBgContainer,
                            borderRadius: borderRadiusLG,
                        }}
                    >
                        {children}
                    </div>
                </Content>
                <Footer style={{ textAlign: 'center' }}>
                    Aitilen Design ©{new Date().getFullYear()} Created by Aitilen Group
                </Footer>
            </Layout>
        </Layout>
    );
};

export default LayoutUser;
