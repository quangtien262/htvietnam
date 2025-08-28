import { useState } from "react";
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
    tables = null,
    current = { id: 0, parent_id: 0 },
    content,
}: AdminProps) {
    const isMobile = window.innerWidth < 2000;
    const [spinning, setSpinning] = useState(false);

    let key = 1;

    const onClick = (e) => {
        setSpinning(true);
    };

    function getItems() {

        const itemsMenu: MenuItem[] = [
            {
                label: <Link href={route("dashboard")} className="a-logo"><img className="logo-header" src="/images/logo.png" /></Link>,
                key: 0,
                // icon: <HomeOutlined />,
            },
            {
                label: <a href={route("home")}><HomeOutlined /> Website</a>,
                key: 1,
                // icon: <HomeOutlined />,
            },
            {
                label: <a href={route("dashboard")}><DashboardOutlined /> Admin</a>,
                key: 2,
                // icon: <HomeOutlined />,
            },
        ];

        if (!tables) {
            return itemsMenu;
        }

        tables.forEach((table: any) => {
            let itemTmp: any = {};
            itemTmp.label = <Link href={table.parent.link === '' || table.parent.link == null ? route("data.index", [table.parent.id]) : table.parent.link}>{table.parent.display_name}</Link>;
            itemTmp.key = key++;
            if (table.sub.length > 0) {
                itemTmp.label = <>{table.parent.display_name} <DownOutlined /></>;
                let sub = [];
                for (let subData of table.sub) {
                    let submenu: any = {};
                    submenu.label = <Link href={subData.link === '' || subData.link === null ? route("data.index", [subData.id]) : subData.link}>{subData.display_name}</Link>;
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
                        {
                            !tables
                                ?
                                <Menu
                                    mode="horizontal"
                                    theme="light"
                                    className="slide menu-header"
                                    items={itemHome()}
                                    defaultSelectedKeys={[2]}
                                    defaultOpenKeys={[2]}
                                    onClick={onClick}
                                />
                                :
                                <Menu
                                    mode="horizontal"
                                    theme="light"
                                    className="slide menu-header"
                                    items={getItems()}
                                    // defaultSelectedKeys={[current.id.toString()]}
                                    // defaultOpenKeys={[current.parent_id.toString()]}
                                    onClick={onClick}
                                />
                        }

                    </Header>
                </div>

                {/* main-menu-header-right */}
                <div className="main-menu-header">
                    {/* <Button className="btn-thu-ngan" onClick={() => { window.open(route('hoaDon.create'), '_blank').focus(); }}>
                        <MoneyCollectFilled />
                        Thu ngân
                    </Button>

                    <a className="icon-header" href={route('admin.setting.menu')} target="new">
                        <SettingOutlined />
                    </a> */}

                    <Dropdown menu={{ items }} trigger={['click']}>
                        <a className="icon-header" onClick={(e) => e.preventDefault()}>
                            <UserOutlined />
                        </a>
                    </Dropdown>
                </div>
            </div>


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
        </Layout >
    );
}
