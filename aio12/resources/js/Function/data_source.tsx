import React, { useState } from "react";
import {
    Select,
    Col,
    Row,
    Badge,
    Descriptions,
    Card,
    Button,
    Input,
    InputNumber,
    Form,
    Space,
    DatePicker,
    Upload,
    message,
    Tabs,
    Calendar,
    Modal,
    Dropdown,
    Radio,
    Popconfirm,
    notification,
    Divider,
    Spin,
    Typography,
    Table,Image
} from "antd";
import { useForm, router, Link } from "@inertiajs/react";
import { PlusCircleOutlined, ArrowRightOutlined, ReadOutlined } from "@ant-design/icons";
import {
    HTSelect,
    HTSelects,
    HTTextarea,
    HTNumber,
    HTDate,
    HTDateTime,
    HTPassword,
    HTInput,
    HTTags,
    HTSelectModal,
} from "./input";
import { inArray, parseJson, nl2br, numberFormat } from "./common";
import axios from "axios";
import dayjs from "dayjs";
const { TextArea } = Input;
const { Option } = Select;
const { Text } = Typography;

const DATE_FORMAT_SHOW = "DD/MM/YYYY";

export function loadDataSource() {
    
    const [loadingBtnAdd, setLoadingBtnAdd] = useState(false);
    const [isOpenAddSelectTable, setIsOpenAddSelectTable] = useState(false);
    const [formSelectTable] = Form.useForm();
    const [dataSourceSelectTbl, setDataSourceSelectTbl] = useState(null);

    const EditableCell = ({
        editing,
        dataIndex,
        title,
        inputType,
        record,
        index,
        children,
        ...restProps
    }) => {
        let inputNode;
        return <td {...restProps}>{children}</td>;
    };

    function contentFormSelectTbl(colName, dataSelectTbl) {
        formSelectTable.setFieldsValue({ col_name: colName });

        const listItems = dataSelectTbl.columns.map((column) => {
            if (
                column.edit === 1 &&
                ["image", "image_crop", "images", "images_crop"].includes(
                    column.type_edit
                )
            ) {
                return showDataImages_addExpress(column);
            }
            if (column.block_type === null || column.block_type == "") {
                return showDataPopup(column, dataSelectTbl);
            }
        });
        return listItems;
    }

    const onOkModalSelectTbl = () => {};

    const onCancelModalSelectTbl = () => {};

    const onFinishFormSelectTable = (values) => {
        const idx = selectTableIndex - 1;
        setSelectTableIndex(idx);

        values["key"] = idx;
        values["action"] = idx;
        values["index"] = idx;

        setDataSourceSelectTbl([...dataSourceSelectTbl, values]);
        setIsOpenAddSelectTable(false);
        message.success("Đã thêm thành công");
    };

    function openModalAddSelectTbl() {}

    function configColumnData(column) {
        let result = column
            .filter(function (col) {
                if (col.show_in_list === 0) {
                    return false;
                }
                return true;
            })
            .map((col) => {
                if (col.is_view_detail === 1) {
                    return {
                        title: col.display_name,
                        dataIndex: col.name,
                        key: col.dataIndex,
                        render: (_, record) => {
                            // <Link href={route('data.detail', [col.table_id, record.key])}></Link>
                            return record[col.name];
                        },
                    };
                }

                if (["image", "image_crop"].includes(col.type_edit)) {
                    return {
                        title: col.display_name,
                        dataIndex: col.name,
                        key: col.dataIndex,
                        render: (_, record) => {
                            return <Image src={record[col.name]}></Image>;
                        },
                    };
                }

                if (["select"].includes(col.type_edit)) {
                    return {
                        title: col.display_name,
                        dataIndex: col.name,
                        key: col.dataIndex,
                        render: (_, record) => {
                            return <span>xxx</span>;
                            // return <span>{dataSourceSelectTbl[selectColName].select.selectData[col.name][record[col.name]] }</span>;
                        },
                    };
                }

                // if(col.edit === 1) {
                return {
                    title: col.display_name,
                    dataIndex: col.name,
                    key: col.id,
                };
                // }
            });

        if (prop.table.is_show_btn_edit === 1) {
            result.push({
                title: "#",
                dataIndex: "operation",
                fixed: "right",
                width: 50,
                render: (_, record) => {
                    // return <a onClick={deleteTableSelect(column)}><EditOutlined /> Xoá</a>;
                    return (
                        <Popconfirm
                            title="Bạn muốn xóa?"
                            onConfirm={() => {
                                onDeleteItemSelectTable(record, selectColName);
                            }}
                            cancelText="Dừng"
                            okText="XÓA"
                        >
                            <Button type="default" htmlType="button">
                                Xóa
                            </Button>
                        </Popconfirm>
                    );
                },
            });
        }
        return result;
    }

    axios.post(route("data.selectTable"), { table_id: col.table_id })
        .then((response) => {
            console.log("response", response);
            if (response.data.status_code == 200) {
                message.success("Đã xóa");
                // SetDataSourceSelectTbl
            } else {
                message.error("Xóa thất bại");
            }
        })
        .catch((error) => {
            message.error("Có lỗi xảy ra");
        });

    return (
        <Row>
            <Modal
                title={col.display_name}
                open={isOpenAddSelectTable}
                onOk={onOkModalSelectTbl}
                onCancel={onCancelModalSelectTbl}
                confirmLoading={loadingBtnAdd}
            >
                <Form
                    name="basic"
                    layout="vertical"
                    form={formSelectTable}
                    onFinish={onFinishFormSelectTable}
                    autoComplete="off"
                    className="form-modal"
                >
                    {/* content form select */}
                    {/* {contentFormSelectTbl(
                        col.name,
                        dataSourceSelectTbl[col.name].dataSelectTbl
                    )} */}

                    {/* hidden */}
                    <Form.Item name="col_name" className="_hidden"></Form.Item>
                </Form>
            </Modal>

            <Divider orientation="left">{col.display_name}</Divider>
            <div>
                <Button
                    type="primary"
                    onClick={() => openModalAddSelectTbl(col)}
                >
                    Thêm
                </Button>
            </div>
            <Table
                size="small"
                // scroll={{ x: '100%', y: 7000 }}
                scroll={{ x: "100%" }}
                components={{
                    body: {
                        cell: EditableCell,
                    },
                }}
                // loading={loadingTable}
                dataSource={dataSourceSelectTbl}
                dataSource={null}
                columns={configColumnData(
                    prop.selectTbl[col.name].dataSelectTbl.columns
                )}
                rowClassName="editable-row"
                className="table-index"
            />
        </Row>
    );
}
 