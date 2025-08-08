import React, { useState } from "react";
import { Link } from "@inertiajs/react";
import { Layout, Menu, Button, Spin, Image, Dropdown, Space } from "antd";
import { router } from "@inertiajs/react";
import {
    MenuFoldOutlined,
    MenuUnfoldOutlined,
    AppstoreOutlined,
    MailOutlined,
    UserOutlined,ProfileOutlined,
    SettingOutlined,
    QuestionCircleOutlined,
    BellOutlined,
    DownOutlined,UsergroupAddOutlined,SafetyCertificateOutlined,
    RobotOutlined,
    LogoutOutlined,CloudServerOutlined,CloudUploadOutlined,
    HomeOutlined, GlobalOutlined, IeOutlined,
} from "@ant-design/icons";

const { Header, Content, Footer, Sider } = Layout;

export default  function UserLayout({ auth, header, current = {id:0, parent_id:0}, content }) {
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

    function getItem(label, key, icon, children, type) {
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
        getItem(<a target="new" href={route('home')}>Trang chủ HT</a>, '', <HomeOutlined />),
        getItem('Dịch vụ của bạn', 'sub-service', <AppstoreOutlined />, [
            getItem(<Link href={route('user.domain')}>Tên miền</Link>,keyMenu++, <IeOutlined />),
            getItem(<Link href={route('user.hosting')}>Hosting</Link>,keyMenu++, <CloudUploadOutlined />),
            getItem(<Link href={route('user.vps')}>VPS</Link>,keyMenu++, <CloudServerOutlined />),
            getItem(<Link href={route('user.server')}>Server</Link>,keyMenu++, <CloudServerOutlined />),
            getItem(<Link href={route('user.webExpress')}>Web Express</Link>,keyMenu++, <GlobalOutlined />),
            getItem(<Link href={route('user.website')}>TK Website theo YC</Link>,keyMenu++, <GlobalOutlined />),
            getItem(<Link href={route('user.emailGoogle')}>Email Google</Link>,keyMenu++, <MailOutlined />),
            getItem(<Link href={route('user.emailServer')}>Email Server</Link>,keyMenu++, <MailOutlined />),
            getItem(<Link href={route('user.ads')}>DV chạy quảng cáo</Link>,keyMenu++, <MailOutlined />),
        ]),
        getItem('Cá nhân', 'sub-profile', <SettingOutlined />, [
            getItem(<Link href={route('user.profile')}>Thông tin cá nhân</Link>,keyMenu++, <UserOutlined />),
            getItem(<Link href={route('user.history')}>Lịch sử mua hàng</Link>,keyMenu++, <ProfileOutlined />),
        ]),
        getItem('Hỗ trợ 24/24', 'sub-support', <RobotOutlined />, [
            getItem(<Link href={route('request.index', [{send_request: 1}])}>Gửi yêu cầu</Link>,keyMenu++, <UsergroupAddOutlined />),
            getItem(<Link href={route('request.index')}>Danh sách yêu cầu</Link>,keyMenu++, <SafetyCertificateOutlined />)
        ]),
        getItem(<a href={route('user.logout')}>Đăng xuất</a>, 'sub', <LogoutOutlined />),
    ];


    const account = {items};

      const handleMenuClick = () => {

      }

    return (
        <Layout>
            {isVisible && (
                <Sider width={250}>
                    <img
                        className="logo_slidebar"
                        src="/images/logo/logo_media_noslogan.png"
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
                            <Link className="item-header active" href={route('user.profile')}>Trang cá nhân</Link>
                            <span>|</span>
                            <a className="item-header" target="new" href="/">Trang chủ HT Việt Nam</a>
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
                    ©2017 Created by HT VietNam
                </Footer>
            </Layout>
        </Layout>
    );
}
