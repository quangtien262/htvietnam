import { useState } from "react";
import AdminLayout from "@/layouts/AdminLayout";
import {
    Row, Col,
} from "antd";

import { routeWeb } from "../../../Function/config_route";

export default function Dashboard(props: { auth: unknown; table: { id: number; parent_id: number; } | undefined; landingpages: readonly any[] | undefined; }) {
    return (
        <div>
            <AdminLayout
                auth={props.auth}
                header={'Cài đặt trang Landingpage'}
                menus={props.menus}
                menuParentID = {props.p}
                current={props.table}
                content={
                    <div>
                        <Row>
                            <Col sm={{ span: 24 }}>
                                <h1>Cài đặt {props.menu?.name}</h1>
                                <p>Đây là trình cài đặt website landingpage</p>
                                <p>Vui lòng click chọn nút màu đỏ để <b>`sửa nội dung`</b> hoặc <b>`cài đặt`</b> ở các khối tương ứng</p>
                                <p>Click <a onClick={() => window.open(props.link, '_blank')}>vào đây</a> để có thể cài đặt nhanh ở phía bên ngoài website</p>
                            </Col>
                            <Col sm={{ span: 24 }}>
                                <iframe
                                    src={props.link}
                                    width="100%"
                                    height="1000"
                                    style={{ border: 'none' }}
                                    title="Demo iframe"
                                />
                            </Col>
                        </Row>

                    </div>
                }
            />
        </div>
    );
}
