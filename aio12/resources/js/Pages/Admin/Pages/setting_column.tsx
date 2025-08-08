import { useState } from "react";
import AdminLayout from "@/Layouts/AdminLayout";
import {
    Button,
    message,
    Form,
    Input,
    Select,
    Card,
    Tree
} from "antd";
import { Link } from "@inertiajs/react";
import axios from "axios";
import { onDrop, formatGdata_column } from "../../../Function/common";

export default function formTable(props) {
    const [loadingBtn, setLoadingBtn] = useState(false);
    const [table, setTable] = useState(props.table);
    const [gData, setGData] = useState(props.columnData);
    const [messageApi, contextHolder] = message.useMessage();

    function onDropData(info) {
        const result = onDrop(info, gData);
        setGData(result);
        axios
            .post(route("column.update_sort_order"), {
                data: JSON.stringify(result),
            })
            .then((response) => {
                setLoadingBtn(false);
                message.success("Cập nhật thứ tự thành công");
            })
            .catch((error) => {
                message.error("Cập nhật thứ tự thất bại");
            });
    }

    return (
        <AdminLayout
            auth={props.auth}
            header={"Cài đặt bảng"}
            tables={props.tables}
            content={
                <div>
                    {contextHolder}

                    {/* sort order */}
                    <Card
                        type="inner"
                        title={
                            <span>
                                Cài đặt <b>"{table.display_name}"</b>
                            </span>
                        }
                        extra={
                            <div>
                                <Button
                                    loading={loadingBtn}
                                    type="default"
                                    htmlType="button"
                                >
                                    <Link href={route("admin.setting.menu")}>
                                        Quay lại
                                    </Link>
                                </Button>
                            </div>
                        }
                    >
                        <Tree
                            className="draggable-tree"
                            draggable
                            blockNode
                            onDrop={(info) => onDropData(info)}
                            treeData={formatGdata_column(gData)}
                        />
                    </Card>
                </div>
            }
        />
    );
}
