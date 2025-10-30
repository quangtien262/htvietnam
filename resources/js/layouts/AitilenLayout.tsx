import React, { useState } from "react";
import { Link } from "@inertiajs/react";
import { Layout, Menu, Button, Spin, Image, Dropdown, Space } from "antd";
import { router } from "@inertiajs/react";
import {
    MenuFoldOutlined,
    MenuUnfoldOutlined,
    AuditOutlined,
    MailOutlined,
    UserOutlined,ProfileOutlined,
    SettingOutlined,
    QuestionCircleOutlined,
    BellOutlined,
    DownOutlined,CommentOutlined,SafetyCertificateOutlined,
    RobotOutlined,
    LogoutOutlined,FileTextOutlined,CloudUploadOutlined,
    HomeOutlined, GlobalOutlined, IeOutlined,
} from "@ant-design/icons";

import '../../css/user/aitilen.css';

const { Header, Content, Footer, Sider } = Layout;

export default  function AitilenLayout({ current = {id:0, parent_id:0}, content }) {
    const isMobile = window.innerWidth < 1000;
    const [spinning, setSpinning] = useState(false);
    const [isVisible, setIsVisible] = useState(!isMobile);


    const onClick = (e) => {
        setSpinning(true);
    };

    const onClickMenuHeader = (e) => {
        setSpinning(true);
        return  router.get(route('gmail'));
    };

    function getItem(label: React.ReactNode, key: React.Key, icon?: React.ReactNode, children?: any, type?: any) {
        return {
          key,
          icon,
          children,
          label,
          type,
        };
    }
    let keyMenu = 1;
    const items = [
        getItem(<Link href={route('user.index')}>Aitilen</Link>, '', <HomeOutlined />),
        getItem(<Link href={route('home')}>Hóa đơn</Link>, '', <FileTextOutlined />),
        getItem(<Link href={route('home')}>Hợp đồng</Link>, '', <AuditOutlined />),
        getItem(<Link href={route('home')}>Gửi yêu cầu</Link>, '', <CommentOutlined />),
        getItem('Cài đặt', 'sub-profile', <SettingOutlined />, [
            getItem(<Link  href={''}>Thông tin cá nhân</Link>,keyMenu++, <UserOutlined />),
            getItem(<Link href={''}>Đổi mật khẩu</Link>,keyMenu++, <ProfileOutlined />),
            getItem(<a href={route('user.logout')}>Đăng xuất</a>, 'sub', <LogoutOutlined />),
        ]),


    ];


    const account = {
        items: [
            getItem(<Link href={route('home')}>Trang cá nhân</Link>, '', <UserOutlined />),
            getItem(<Link href={route('home')}>Đổi mật khẩu</Link>, '', <ProfileOutlined />),
            getItem(<a href={route('user.logout')}>Thoát</a>, '', <LogoutOutlined />)
        ]
    };

    return (
        <Layout>
            {isVisible && (
                <Sider width={250}>
                    <img
                        className="logo_slidebar"
                        src="/layouts/Aitilen/images/logo.jpg"
                    />
                    <Menu mode="inline" theme="light"  className='slide' items={items} defaultSelectedKeys={[current]}  defaultOpenKeys={['sub-service']} onClick={onClick}/>
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
                            <a className="item-header" target="new" href="/"><HomeOutlined /> TRANG CHỦ AITILEN</a>
                        </div>

                        <div className="account">
                            <div>
                                <BellOutlined className="Bell" />
                            </div>
                            <div className="user_name">
                                <div className="name_account">
                                    <Dropdown menu={account}>
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
                                <SettingOutlined className="setting" />
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
                        margin: "0px 0px 0px  1px",
                        padding: 24,
                        minHeight: 280,
                    }}
                >
                    <Spin spinning={spinning} size="large">
                        <article>{content}</article>
                    </Spin>
                </Content>
                <Footer style={{ textAlign: "center" }}>
                    ©2017 Created by Aitilen
                </Footer>
            </Layout>
        </Layout>
    );
}
