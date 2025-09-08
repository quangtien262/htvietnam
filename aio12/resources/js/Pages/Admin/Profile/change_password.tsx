import { useState, useRef  } from 'react';
import AdminLayout from '@/layouts/AdminLayout';
import { Select, Col, Row, Card, Button, Input, Form, Space, DatePicker,message } from 'antd';
import { FormOutlined } from '@ant-design/icons';
import { router } from '@inertiajs/react';
import axios from 'axios';
import '../../../../css/form.css';
import { showData } from '../../../Function/data';
import dayjs from "dayjs";
import { itemMenu } from "../../../Function/config_route";
export default function changePassword(props) {
    const [data, setData] = useState(props.data);

    const [submitRedirect, setSubmitRedirect] = useState("detail"); // detail, list
    const [loadingBtn, setLoadingBtn] = useState(false);
    const [isStopSubmit, setIsStopSubmit] = useState(false);
    const [fileList, setFileList] = useState(props.imagesData);
    //modal cham cong
    const [formData] = Form.useForm();
    // editor
    const tinyRefs = useRef([]);
    const [tinyImageName, setTinyImageName] = useState([]);


    const DATE_FORMAT = "YYYY-MM-DD";

    const onFinish = (values) => {
        console.log('dd');
        setIsStopSubmit(false);
        if (fileList && fileList.length > 0) {
            let images = fileList.map((file) => {
                if (!file.status) {
                    return false;
                }
                if (file.status === "uploading") {
                    setIsStopSubmit(true);
                    return false;
                }

                if (file.status === "OK") {
                    return {
                        name: file.name,
                        status: file.status,
                        url: file.url,
                    };
                }
                if (file.status === "done") {
                    return {
                        name: file.response.data.fileName,
                        status: file.status,
                        url: file.response.data.filePath,
                    };
                }
            });

            values.images = images;
            values.image = images;
        } else {
            values.images = "";
            values.image = "";
        }

        if (isStopSubmit) {
            message.error("Lưu thất bại, vui lòng chờ tải xong hình ảnh");
            return false;
        }

        for (const [key, col] of Object.entries(props.columns)) {
            if (col.type_edit === "tiny") {
                values[col.name] = tinyRefs.current[col.name].getContent();
            }
        }

        values.tiny_images = tinyImageName;
        values.submit_edirect = submitRedirect;
        values["datepicker"] = values["datepicker"] ? values["datepicker"].format(DATE_FORMAT) : "";

        axios.post(route("data.update", [props.table.id, data.id]), values)
            .then((response) => {
                message.success("Cập nhật thành công");
                router.get(route('admin_user.index'));
            })
            .catch((error) => {
                message.error("Sửa thông tin cá nhân thất bại");
            });
    };

    const onFinishFailed = (errorInfo) => {};

    function checkRequired(is_required, name) {
        return [
            {
                required: is_required,
                message: '"' + name + '" Không được để trống',
            },
        ];
    }

    const onChangeImage = ({ fileList: newFileList }) => {
        setFileList(newFileList);
    };

    const onPreviewImage = async (file) => {
        let src = file.url;
        if (!src) {
            src = await new Promise((resolve) => {
                const reader = new FileReader();
                reader.readAsDataURL(file.originFileObj);
                reader.onload = () => resolve(reader.result);
            });
        }
        const image = new Image();
        image.src = src;
        const imgWindow = window.open(src);
        imgWindow?.document.write(image.outerHTML);
    };

    const onRemoveImage = (file) => {
        const updatedFileList = fileList.filter((f) => f.uid !== file.uid);
        setFileList(updatedFileList);
    };

    const optiondata = () => {
        props.selectData[col.name];
    };

    function callbackImage(callback, value, meta) {
        const input = document.createElement("input");
        input.setAttribute("type", "file");
        input.setAttribute("accept", "image/*");
        input.addEventListener("change", (e) => {
            const file = e.target.files[0];

            const reader = new FileReader();
            reader.addEventListener("load", () => {
                const id = "blobid" + new Date().getTime();
                const blobCache = tinymce.activeEditor.editorUpload.blobCache;
                const base64 = reader.result.split(",")[1];

                axios
                    .post(route("data.tiny_upload_image"), {
                        file: reader.result,
                    })
                    .then((response) => {
                        if (response.data.status_code == 200) {
                            callback(response.data.data.filePath, {
                                title: "",
                            });
                            let tinyImageName_tmp = tinyImageName;
                            tinyImageName_tmp.push(response.data.data.fileName);
                            setTinyImageName(tinyImageName_tmp);

                            message.success("Đã thêm hình ảnh thành công");
                        } else {
                            message.error("Thêm hình ảnh thất bại");
                        }
                    })
                    .catch((error) => {
                        message.error("Thêm hình ảnh thất bại");
                    });
            });
            reader.readAsDataURL(file);
        });

        input.click();
    }

    const listItems = props.columns.map((col) => {
        if(['password'].includes(col.name)) {
            return showData(col, props);
        }
        return <div className='_hidden'>{showData(col, props)}</div>
    });

    function initialValuesForm() {
        if (props.dataId === 0) {
            return props.request;
        }
        let data_tmp = props.data;
        props.columns.map((col) => {
            if (col.type_edit === "date" && data_tmp[col.name]) {
                data_tmp[col.name] = dayjs(data_tmp[col.name], DATE_FORMAT);
            }
            if (col.type_edit === "selects" && data_tmp[col.name]) {
                let selects;
                try {
                    selects = JSON.parse(data_tmp[col.name]).map((select) => {
                        return +select;
                    });
                } catch (error) {
                    selects = [];
                }
                data_tmp[col.name] = selects;
            }
        });
        return data_tmp;
    }

    return (
        <AdminLayout
            auth={props.auth}
            header={props.table.display_name}
            tables={itemMenu(props.table.name)}
            current={props.table}
            content={
                <div>
                    <Form
                        name="basic"
                        layout="vertical"
                        form={formData}
                        onFinish={onFinish}
                        onFinishFailed={onFinishFailed}
                        autoComplete="off"
                        initialValues={initialValuesForm()}
                    >
                        <Card
                            type="inner"
                            title='Đổi mật khẩu'
                        >
                            <Row>{listItems}</Row>

                            <div>
                                <br/>
                                <Space>
                                    <Button type="primary" htmlType="submit" loading={loadingBtn}>
                                        <FormOutlined />
                                        Cập nhật
                                    </Button>
                                </Space>
                            </div>
                        </Card>
                    </Form>
                </div>
            }
        />
    );
}
