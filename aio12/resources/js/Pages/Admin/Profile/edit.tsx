import { useState} from 'react';
import AdminLayout from '@/Layouts/AdminLayout';
import { Col, Row, Card, Button, Form, Space, Upload, message } from 'antd';
import { FormOutlined, UploadOutlined } from '@ant-design/icons';
import { router } from '@inertiajs/react';
import ImgCrop from 'antd-img-crop';
import axios from 'axios';
import '../../../../css/form.css';
import { showData, checkRule } from '../../../Function/data';
import dayjs from "dayjs";

export default function EditUser(props) {
    const [data, setData] = useState(props.data);
    const [submitRedirect, setSubmitRedirect] = useState("detail"); // detail, list
    const [loadingBtn, setLoadingBtn] = useState(false);
    const [isStopSubmit, setIsStopSubmit] = useState(false);
    const [fileList, setFileList] = useState(props.imagesData);
    //modal cham cong
    const [formData] = Form.useForm();
    const [tinyImageName, setTinyImageName] = useState([]);


    const DATE_FORMAT = "YYYY-MM-DD";

    const onFinish = (values) => {
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
                // đổi sang sun
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



    function initTinyMCE() {
        return {
            file_picker_callback: function (callback, value, meta) {
                callbackImage(callback, value, meta);
            },
            selector: 'textarea',
            images_upload_handler: function (blobInfo, success, failure, progress) {
                console.log('blobInfo', blobInfo);
                console.log('success', success);
            },
            init_instance_callback: 'insert_contents',
            plugins: 'preview importcss searchreplace autolink autosave save directionality code visualblocks visualchars fullscreen image link media template codesample table charmap pagebreak nonbreaking anchor insertdatetime advlist lists wordcount help charmap quickbars emoticons',
            imagetools_cors_hosts: ['picsum.photos'],
            menubar: 'file edit view insert format tools table help',
            toolbar: 'undo redo | bold italic underline strikethrough | fontselect fontsizeselect formatselect | alignleft aligncenter alignright alignjustify | outdent indent |  numlist bullist | forecolor backcolor removeformat | pagebreak | charmap emoticons | fullscreen  preview save print | insertfile image media template link anchor codesample | ltr rtl',
            toolbar_sticky: true,
            autosave_ask_before_unload: true,
            autosave_interval: '30s',
            autosave_prefix: '{path}{query}-{id}-',
            autosave_restore_when_empty: false,
            autosave_retention: '2m',
            image_advtab: true,
            link_list: [
                { title: 'My page 1', value: 'https://www.tiny.cloud' },
                { title: 'My page 2', value: 'http://www.moxiecode.com' }
            ],
            image_list: [
                { title: 'My page 1', value: 'https://www.tiny.cloud' },
                { title: 'My page 2', value: 'http://www.moxiecode.com' }
            ],
            image_class_list: [
                { title: 'None', value: '' },
                { title: 'Some class', value: 'class-name' }
            ],
            importcss_append: true,

            file_picker_types: 'image',
            templates: [
                    { title: 'New Table', description: 'creates a new table', content: '<div class="mceTmpl"><table width="98%%"  border="0" cellspacing="0" cellpadding="0"><tr><th scope="col"> </th><th scope="col"> </th></tr><tr><td> </td><td> </td></tr></table></div>' },
                    { title: 'Starting my story', description: 'A cure for writers block', content: 'Once upon a time...' },
                    { title: 'New list with dates', description: 'New List with dates', content: '<div class="mceTmpl"><span class="cdate">cdate</span><br /><span class="mdate">mdate</span><h2>My List</h2><ul><li></li><li></li></ul></div>' }
            ],
            template_cdate_format: '[Date Created (CDATE): %m/%d/%Y : %H:%M:%S]',
            template_mdate_format: '[Date Modified (MDATE): %m/%d/%Y : %H:%M:%S]',
            height: 600,
            image_caption: true,
            quickbars_selection_toolbar: 'bold italic | quicklink h2 h3 blockquote quickimage quicktable',
            // noneditable_noneditable_class: 'mceNonEditable',
            toolbar_mode: 'sliding',
            contextmenu: 'link image table',
            skin: 'oxide', //oxide-dark
            content_css: 'default', // dark
            content_style: 'body { font-family:Helvetica,Arial,sans-serif; font-size:14px }'
        };
    }


    function showDataImages(col) {
        const data = props.data;
        let result;
        const typeEdit = col.type_edit;
        if (col.edit !== 1) {
            return false;
        }
        switch (typeEdit) {
            case "images_crop":
            case "image_crop":
                result = (
                    <Row>
                        <Col key={col.name}>
                            <Form.Item
                                name={col.name}
                                rules={checkRule(col)}
                                label={col.display_name}
                            >
                                <ImgCrop
                                    aspect={col.ratio_crop}
                                    aspectSlider={true}
                                    rotationSlider={true}
                                    showGrid={true}
                                    showReset={true}
                                >
                                    <Upload
                                        action={route("data.upload_image")}
                                        listType="picture-card"
                                        fileList={fileList}
                                        onChange={onChangeImage}
                                        onPreview={onPreviewImage}
                                        onRemove={onRemoveImage}
                                    >
                                        {fileList.length < props.countImage &&
                                            "+ Upload"}
                                    </Upload>
                                </ImgCrop>
                            </Form.Item>
                        </Col>
                    </Row>
                );
                break;
            case "image":
            case "images":
                result = (
                    <Row>
                        <Col key={col.name}>
                            <Form.Item
                                name={col.name}
                                rules={checkRule(col)}
                                label={col.display_name}
                            >
                                <Space
                                    direction="vertical"
                                    style={{ width: "100%" }}
                                    size="large"
                                >
                                    <Upload
                                        action={route("data.upload_image")}
                                        listType="picture"
                                        maxCount={props.countImage}
                                        fileList={fileList}
                                        onChange={onChangeImage}
                                        onPreview={onPreviewImage}
                                        onRemove={onRemoveImage}
                                        multiple
                                    >
                                        <Button icon={<UploadOutlined />}>
                                            Upload (Tối đa: {props.countImage})
                                        </Button>
                                    </Upload>
                                </Space>

                            </Form.Item>
                        </Col>
                    </Row>
                );
                break;
        }

        return result;
    }

    const listItems = props.columns.map((col) => {
        if(['name', 'email','bank', 'note', 'phone', 'cmtnd', 'dob', 'ngay_cap', 'noi_cap', 'hktt', 'username', 'password'].includes(col.name)) {
            return showData(col, props);
        }
        return <div className='_hidden'>{showData(col, props)}</div>
    });

    const imageItems = props.columns.map((col) => {
        if (["image", "images", "image_crop", "images_crop"].includes(col.type_edit)) {
            return showDataImages(col);
        }
    });

    const listItemsLg = props.columns.map((col) => {
        if (col.type_edit === "tiny") {
            // đổi sang sun
        }
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
            tables={props.tables}
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
                            title='Sửa thông tin cá nhân'
                        >
                            <Row>{listItems}</Row>
                            <Row>{imageItems}</Row>
                            <Row>{listItemsLg}</Row>

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
