import { useState } from "react";
import AdminLayout from "@/layouts/AdminLayout";
import {
    Select,
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
    Checkbox,
    Popover,
    Divider,
    Table,
    Spin,
    Row,
    Image,
    Radio,
    Col,
    Breadcrumb,
} from "antd";
import {
    FormOutlined,
    CopyOutlined,
    UploadOutlined,
    CloseSquareOutlined,
    EditOutlined,
    FolderOpenTwoTone,
    FileZipTwoTone,
    FileWordTwoTone,
    FolderAddTwoTone,
    FileUnknownTwoTone,
    FilePptTwoTone,
    FilePdfTwoTone,
    FileImageTwoTone,
    FileExcelTwoTone,
    FileTwoTone,
    VideoCameraTwoTone,
    DeleteTwoTone,
    InboxOutlined,
    RightCircleTwoTone,
    DeleteFilled,
    PieChartTwoTone,
    EyeTwoTone,
    DatabaseTwoTone,
    InfoCircleFilled,
    GoldenFilled,
} from "@ant-design/icons";
import { Link, router } from "@inertiajs/react";
import axios from "axios";
import cloneDeep from "lodash/cloneDeep";
import { inArray } from "../../../Function/common";
import "../../../../css/file.css";

const { Dragger } = Upload;

export default function Dashboard(props) {
    const [parentId, setParentId] = useState(0);
    const [formFolder] = Form.useForm();
    const [loadingBtnCreate, setLoadingBtnCreate] = useState(false);
    const [datas, setDatas] = useState(props.datas);
    const [ids, setIds] = useState(props.ids);
    const [parent, setParent] = useState(props.parent);
    const [cardLoading, setCardLoading] = useState(false);
    const [disableBtnCreateFolder, setDisableBtnCreateFolder] = useState(false);
    const [disableBtnUpload, setDisableBtnUpload] = useState(false);
    const [uploadType, setUploadType] = useState('my'); // all, share
    const textHome = {
        my:'Tài liệu của tôi',
        share:'Tài liệu được chia sẻ',
        all:'Tài liệu chung'
    };
    const [breadcrumb, setBreadcrumb] = useState([{ idx: 0, id: 0, title: <a href="">{textHome[uploadType]}</a> }]);

    function showFileIcon(data) {
        const type = data.type;
        let result = "";
        switch (type) {
            case "png":
            case "gif":
            case "jpg":
            case "jpeg":
                result = <Image width={200} src={data.url} />;
                break;
            case "pdf":
                result = <FilePdfTwoTone />;
                break;
            case "zip":
                result = <FileZipTwoTone />;
                break;
            case "doc":
            case "docx":
                result = <FileWordTwoTone />;
                break;
            case "ppt":
            case "pptx":
                result = <FilePptTwoTone />;
                break;
            case "txt":
                result = <FilePptTwoTone />;
                break;
            case "folder":
                result = <FolderOpenTwoTone />;
                break;
            case "":
                result = <FileUnknownTwoTone />;
                break;
            case "sql":
                result = <DatabaseTwoTone />;
                break;
            default:
                result = <FileTwoTone />;
                break;
        }
        return result;
    }

    function onClickFile(e, data) {
        console.log("eee", e);
        if (data.type === "folder") {
            openFolder(data);
        }
    }

    function handleClick(e, data) {
        console.log("e.nativeEvent.button", data);
        e.preventDefault();
        if (e.nativeEvent.button === 0) {
            e, data;
        } else if (e.nativeEvent.button === 2) {
            console.log("Right click");
            ids[data.id] = true;
            let ids_tmp = cloneDeep(ids);
            setIds(ids_tmp);
        }
    }

    function handleOpenChange(e, data) {
        ids[data.id] = false;
        let ids_tmp = cloneDeep(ids);
        setIds(ids_tmp);
    }

    function openFile(data) {
        return router.get(route("file.download", [data.id]));
    }

    function openFolder(data) {
        console.log('uploadType', uploadType);
        setCardLoading(true);
        console.log('data.id', data.id);
        axios
            .post(route("folder.open"), {
                id: data.id,
                uploadType: uploadType
            })
            .then((response) => {
                console.log("response", response);
                if (response.data.status_code === 400) {
                    message.error(
                        "Mở thư mục thất bại, " + response.data.message
                    );
                } else {
                    setParentId(data.id);
                    // set data
                    setDatas(response.data.data.datas);

                    // set breadcrumb
                    let breadcrumb_tmp = [
                        { idx: 0, id: 0, title: <a onClick={() => {
                            openFolder({id:0}, 0);
                        }}>{textHome[uploadType]}</a> },
                    ];
                    response.data.data.parent.forEach((item, idx) => {
                        console.log("item", item);
                        breadcrumb_tmp.push({
                            id: item.id,
                            title: (
                                <a
                                    onClick={() => {
                                        openFolder(item, idx);
                                    }}
                                >
                                    {item.name}
                                </a>
                            ),
                        });
                    });
                    setBreadcrumb(breadcrumb_tmp);
                    message.success("Mở thư mục thành công");
                    setCardLoading(false);
                }
            })
            .catch((error) => {
                console.log(error);
                message.error("Mở thư mục thất bại");
                setCardLoading(false);
            });
    }

    function backFolder(data, index) {
        axios
            .post(route("folder.open"), {
                id: data.id,
            })
            .then((response) => {
                console.log("response", response);
                if (response.data.status_code === 400) {
                    message.error(
                        "Mở thư mục thất bại, " + response.data.message
                    );
                } else {
                    // set parent
                    setParentId(data.id);

                    // set data
                    setDatas(response.data.data.datas);
                    message.success("Mở thư mục thành công");

                    // set breadcrumb
                    let breadcrumb_tmp = [];
                    console.log("breadcrumb", breadcrumb);
                    breadcrumb.forEach((item, idx) => {
                        if (idx <= index) {
                            breadcrumb_tmp.push({
                                idx: idx,
                                id: item.id,
                                title: (
                                    <a
                                        onClick={() => {
                                            backFolder(item);
                                        }}
                                    >
                                        {item.title}
                                    </a>
                                ),
                            });
                        }
                    });
                    setBreadcrumb(breadcrumb_tmp);
                }
            })
            .catch((error) => {
                console.log(error);
                message.error("Tạo thư mục thất bại");
            });
    }

    function submitShare(e, data) {
        axios
            .post(route("file.share"), {
                user_ids: e,
                id: data.id,
            })
            .then((response) => {
                console.log("response", response);
                if (response.data.status_code === 400) {
                    message.error(
                        "Chia sẻ thất bại, " + response.data.message
                    );
                } else {
                    message.success("Đã chia sẻ file thành công");
                }
            })
            .catch((error) => {
                console.log(error);
                message.error("Chia sẻ không thành công");
                setCardLoading(false);
            });
    }

    function formShare(data) {
        // return '';
        return (
            <Select
                showSearch
                mode="multiple"
                style={{ width: "100%" }}
                placeholder="Search to Select"
                optionFilterProp="children"
                defaultValue={data.share}
                onChange={(e) => submitShare(e, data)}
                filterOption={(input, option) =>
                    (option?.label ?? "")
                        .toLowerCase()
                        .includes(input.toLowerCase())
                }
                options={props.adminUser}
            />
        );
    }

    function fileInfo(data) {
        return (
            <div>
                <ul className="popup">
                    <li>
                        {data.type === "folder" ? (
                            <a
                                onClick={() => {
                                    openFolder(data);
                                }}
                            >
                                <RightCircleTwoTone /> Open
                            </a>
                        ) : (
                            <a
                                onClick={() => {
                                    openFile(data);
                                }}
                            >
                                <RightCircleTwoTone /> Download
                            </a>
                        )}
                    </li>
                    <li>
                        <Popover
                            title={
                                <div>
                                    <InfoCircleFilled /> Nhập tên người muốn
                                    chia sẻ
                                </div>
                            }
                            trigger="click"
                            placement="right"
                            content={formShare(data)}
                        >
                            <a>
                                <GoldenFilled /> Share
                            </a>
                        </Popover>
                    </li>
                    <li>
                        <EyeTwoTone /> Size: {data.size / 1000000}MB
                    </li>
                    <li>
                        <PieChartTwoTone /> Type: {data.type}
                    </li>
                    <li>
                        {" "}
                        <a
                            onClick={() => {
                                deleteFile(data);
                            }}
                        >
                            <DeleteFilled /> Delete
                        </a>{" "}
                    </li>
                </ul>
            </div>
        );
    }

    function deleteFile(data) {
        axios
            .post(route("file.delete"), {
                id: data.id,
                parent_id: parentId,
            })
            .then((response) => {
                console.log("response", response);
                if (response.data.status_code === 400) {
                    message.error("Xóa thất bại, " + response.data.message);
                } else {
                    message.success("Đã xóa thành công");
                    setDatas(response.data.data);
                }
            })
            .catch((error) => {
                console.log(error);
                message.error("Xóa thất bại");
                setCardLoading(false);
            });
    }

    function showData() {
        return datas.map((data) => {
            return (
                <Col
                    key={data.id}
                    className="row-file"
                    sm={{ span: 12 }}
                    md={{ span: 24 }}
                    lg={{ span: 4 }}
                >
                    <Popover
                        title={
                            <div>
                                <InfoCircleFilled /> INFO
                            </div>
                        }
                        trigger="click"
                        placement="right"
                        open={ids[data.id]}
                        onOpenChange={(e) => {
                            handleOpenChange(e, data);
                        }}
                        content={fileInfo(data)}
                    >
                        <div
                            onClick={(e) => {
                                onClickFile(e, data);
                            }}
                            onContextMenu={(e) => {
                                handleClick(e, data);
                            }}
                            className="file-item"
                        >
                            {showFileIcon(data)}
                            <p className="file-name">
                                {data.type === "folder" ? (
                                    <b>{data.name}</b>
                                ) : (
                                    data.name
                                )}
                            </p>
                        </div>
                    </Popover>
                </Col>
            );
        });
    }

    const dataUpload = {
        name: "file",
        multiple: true,
        action: route("file.upload"),
        data: {
            _token: props.token,
            parent_id: parentId,
            uploadType: uploadType
        },
        onChange(info) {
            const { status, response } = info.file;
            console.log(info);
            if (status !== "uploading") {
                console.log(info.file, info.fileList);
            }
            if (status === "done") {
                if (response.status_code && response.status_code === 400) {
                    message.error(
                        `${info.file.name} upload thất bại, ${response.message}.`
                    );
                } else {
                    datas.push(response.data);
                    let datas_tmp = cloneDeep(datas);
                    setDatas(datas_tmp);
                    message.success(`${info.file.name} Đã upload thành công.`);
                }
            } else if (status === "error") {
                message.error(
                    `${info.file.name} upload thất bại, file đã tồn tại hoặc do lỗi đường truyền mạng.`
                );
            }
        },
        onDrop(e) {
            console.log("Dropped files", e.dataTransfer.files);
        },
    };

    const createFolder = (e) => {
        formFolder.submit();
    };

    const onFinish = (values) => {
        axios
            .post(route("folder.create", [props.tableId]), {
                name: values.name,
                parent_id: parentId,
                uploadType: uploadType
            })
            .then((response) => {
                if (response.data.status_code === 400) {
                    message.error(
                        "Tạo thư mục thất bại, " + response.data.message
                    );
                } else {
                    datas.push(response.data.data);
                    let datas_tmp = cloneDeep(datas);
                    setDatas(datas_tmp);
                    formFolder.resetFields();
                    message.success("Tạo thư mục thành công");
                }
            })
            .catch((error) => {
                message.error("Tạo thư mục thất bại");
            });
    };

    const onFinishFailed = (errorInfo) => {
        console.log("Failed:", errorInfo);
    };

    function extra() {
        return (
            <div>
                <Popover
                    trigger="click"
                    title="Nhập tên thư mục"
                    content={
                        <Form
                            name="basic"
                            onFinish={onFinish}
                            form={formFolder}
                            // onFinishFailed={onFinishFailed}
                            autoComplete="off"
                        >
                            <Form.Item
                                label=""
                                name="name"
                                rules={[
                                    {
                                        required: true,
                                        message: "Vui lòng nhập tên thư mục",
                                    },
                                ]}
                            >
                                <Input />
                            </Form.Item>
                            <Button
                                type="primary"
                                htmlType="submit"
                                loading={loadingBtnCreate}
                            >
                                Tạo
                            </Button>
                        </Form>
                    }
                    onConfirm={createFolder}
                    onOpenChange={() => console.log("open change")}
                >
                    <Button type="primary" disabled={disableBtnCreateFolder}>Tạo thư mục</Button>
                </Popover>
            </div>
        );
    }

    function showDocument(e) {
        setCardLoading(true);
        const value = e.target.value;
        setUploadType(value);
        if(value === 'share') {
            setDisableBtnCreateFolder(true);
            setDisableBtnUpload(true);
        } else {
            setUploadType(value);
            setDisableBtnCreateFolder(false);
            setDisableBtnUpload(false);
        }
        axios
            .post(route("file.show", [value]))
            .then((response) => {
                console.log("response", response);
                if (response.data.status_code === 400) {
                    message.error(
                        "Mở thất bại, " + response.data.message
                    );
                } else {
                    setDatas(response.data.data);
                }
                setBreadcrumb([{ idx: 0, id: 0, title: <a href="">{textHome[value]}</a> }]);
                setCardLoading(false);
            })
            .catch((error) => {
                console.log(error);
                message.error("Mở thư mục thất bại");
                setCardLoading(false);
            });
    }

    return (
        <AdminLayout
            auth={props.auth}
            header="Trang chủ"
            tables={props.tables}
            current={props.table}
            content={
                <div>
                    <Radio.Group
                        defaultValue="my"
                        buttonStyle="solid"
                        onChange={(e) => showDocument(e)}
                    >
                        <Radio.Button value="my">{textHome.my}</Radio.Button>
                        <Radio.Button value="share">{textHome.share}</Radio.Button>
                        <Radio.Button value="all">{textHome.all}</Radio.Button>
                    </Radio.Group>

                    <Dragger {...dataUpload} disabled={disableBtnUpload}>
                        <p className="ant-upload-drag-icon">
                            <InboxOutlined />
                        </p>
                        <p className="ant-upload-text">
                            Nhấp hoặc kéo tệp vào khu vực này để tải lên
                        </p>
                        <p className="ant-upload-hint">
                            Hỗ trợ tải lên một lần hoặc hàng loạt nhiều file
                        </p>
                    </Dragger>

                    <Card
                        loading={cardLoading}
                        title={<Breadcrumb items={breadcrumb} />}
                        extra={extra()}
                    >
                        <Row>{showData()}</Row>
                    </Card>
                </div>
            }
        />
    );
}
