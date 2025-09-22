import React, { useState, useRef } from "react";
import AdminLayout from "@/layouts/AdminLayout";
import dayjs from "dayjs";
import {
    Button,
    Table,
    message,
    Modal,
    Form,
    Input,
    InputNumber,
    Popconfirm,
    Select,
    Row, Col,
    Space,
    Tree,
    notification,
    Divider,
    Image,
    Upload,
    Dropdown, Tabs
} from "antd";

import { DndContext, PointerSensor, useSensor } from '@dnd-kit/core';
import {
    arrayMove,
    SortableContext,
    useSortable,
    verticalListSortingStrategy,
} from '@dnd-kit/sortable';

import {
    ArrowRightOutlined,
    FormOutlined,
    SearchOutlined,
    PlusCircleOutlined,
    DeleteOutlined,
    EditOutlined,
    EyeOutlined,
    CopyOutlined,
    CloseSquareOutlined,
    UploadOutlined,
    CaretRightOutlined, SettingOutlined
} from "@ant-design/icons";

import { Link, router } from "@inertiajs/react";
import axios from "axios";
import "../../css/form.css";
import "../../css/popconfirm_hidden_btn.css";
import { inArray, parseJson, numberFormat, showsettingMenu, formatGdata_column, onDrop } from "../Function/common";
import { DATE_FORMAT, DATE_TIME_FORMAT, DATE_SHOW, DATE_TIME_SHOW } from '../Function/constant';
import { showLog, loadDataLanguage } from '../Function/auto_load';

import ImgCrop from 'antd-img-crop';

import {
    HTSelect,
    HTSelects,
    HTTextarea,
    HTNumber,
    HTDate,
    HTDateTime,
    HTPassword,
    HTInput,
    HTTime, HTColor, HTCascaderTable, smartSearch02, smartSearch, showDataSearch, showDataSearch02
} from "../Function/input";

import { checkRule, showData, showDataSelectTable } from '../Function/data';

// SunEditor
import SunEditor from 'suneditor-react';
import 'suneditor/dist/css/suneditor.min.css';
import { optionSunEditor } from '../Function/sun_config';

import { showSelects, showSelect } from '../Function/selects_table';
import { callApi } from '../Function/api';


export function formData(dataAction, props, onSuccess) {
    const [formEdit] = Form.useForm();
    const [fileList, setFileList] = useState([]);
    const [currentFile, setCurrentFile] = useState('');
    const editor = useRef([]);

    const onChange = ({ fileList: newFileList }) => {
        setFileList(newFileList);
    };

    // Chỉ cho phép file ảnh
    const beforeUpload = (file) => {
        const isImage = file.type.startsWith('image/');
        if (!isImage) {
            message.error('Chỉ được upload file hình ảnh!');
        }
        return isImage;
    };


    const sensor = useSensor(PointerSensor, {
        activationConstraint: {
            distance: 10,
        },
    });



    const onDragEnd = ({ active, over }) => {
        if (active.id !== over?.id) {
            setFileList((prev) => {
                const activeIndex = prev.findIndex((i) => i.uid === active.id);
                const overIndex = prev.findIndex((i) => i.uid === over?.id);
                return arrayMove(prev, activeIndex, overIndex);
            });
        }
    };

    // const listItems = dataAction.columns.map((col) => {
    //     return showData(col);
    // });

    // const imageItems = dataAction.columns.map((col) => {
    //     if (["image", "images", "image_crop", "images_crop"].includes(col.type_edit)) {
    //         return showDataImages(col);
    //     }
    // });



    const listItemsLg = dataAction.columns.map((col) => {
        return showItemsLg(col);
    });

    const imageItems = dataAction.columns.map((col) => {

        if (["image", "images", "image_crop", "images_crop"].includes(col.type_edit)) {
            if (checkConfig(col)) {
                return showDataImages(col);
            }
        }

    });

    const listItems = dataAction.columns.map((col) => {
        if (col.block_type == null || col.block_type == '') {
            if (checkConfig(col) === true) {
                return showData(col, dataAction);
            }
        }
    });



    function tabData() {
        return dataAction.tabs.map((tab) => {
            return {
                key: tab.id,
                label: tab.display_name,
                children: contentTab(tab),
            }
        });
    }


    function contentTab(tab) {
        let have_block = false;

        const content_block = dataAction.blocks.map((block) => {
            if (block.parent_id === tab.id) {
                if (!have_block) {
                    have_block = true;
                }
                return <div key={block.id}>
                    <Divider orientation="left">{block.display_name}</Divider>
                    {contentBlock(block)}
                </div>

            }
        });

        if (have_block) {
            return content_block;
        }

        return contentBlock(tab)

    }


    function contentBlock(block) {
        let content = [],
            contentImage = [],
            contentLong = [];
        for (const [key, col] of Object.entries(dataAction.columns)) {
            if (col.parent_id !== block.id || !checkConfig(col)) {
                continue;
            }

            // check config_show_data

            if (["block_basic"].includes(col.block_type)) {
                content = dataAction.columns.map((subCol) => {
                    if (subCol.parent_id === col.id) {
                        return showData(subCol, dataAction);
                    }
                });
                continue;
            }

            if (["image", "images", "image_crop", "images_crop"].includes(col.type_edit)) {
                contentImage.push(showDataImages(col));
                continue;
            }

            if (["tiny", "calendar_cham_cong", "permission_list", "selects_table"].includes(col.type_edit)) {
                contentLong.push(showItemsLg(col));
                continue;
            }

            if (["file"].includes(col.type_edit)) {
                content.push(showDataFile(col));
                continue;
            }

            content.push(showData(col, dataAction));
        }


        return <Row>
            {content}
            {contentImage}
            {contentLong}
        </Row>
    }

    function checkShowData() {

        if (dataAction.tabs.length > 0) {
            return <Tabs defaultActiveKey="1" items={tabData()} />
        }

        if (dataAction.blocks.length > 0) {
            return dataAction.blocks.map((block) => {
                if (checkConfig(block)) {
                    return <Row>
                        <Divider orientation="left">{block.display_name}</Divider>
                        {contentBlock(block)}
                    </Row>
                }
            });
        }

        return <Row>
            {listItems}
            {imageItems}
            {listItemsLg}
        </Row>
    }

    function handleAddImage(col) {
        const name = Date.now();
        let imageItem = {
            uid: name,
            name: name,
            status: 'OK',
            url: currentFile
        };
        let newFileList = [...fileList];
        if (col.conditions && +col.conditions > 0) {
            if (newFileList.length >= +col.conditions) {
                message.error("Chỉ được phép thêm tối đa " + col.conditions + " hình ảnh");
                return false;
            }
        }
        newFileList = [...newFileList, imageItem];
        setFileList(newFileList);
        setCurrentFile('');
    }



    function showDataImages(col) {
        const data = dataAction.data;
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
                            <Divider orientation='left'>
                                {col.display_name}
                                <span> | </span>
                                <Popconfirm
                                    title={
                                        <div>
                                            <span>Nhập Link hình ảnh bạn muốn thêm</span><br />
                                            <Input value={currentFile} onChange={(e) => setCurrentFile(e.target.value)} />
                                        </div>
                                    }
                                    onConfirm={() => handleAddImage(col)}
                                    okText="Thêm ảnh"
                                    cancelText="Hủy"
                                >
                                    <a><PlusCircleOutlined /></a>
                                </Popconfirm>
                            </Divider>
                            <DndContext sensors={[sensor]} onDragEnd={onDragEnd}>
                                <SortableContext items={fileList.map((i) => i.uid)} strategy={verticalListSortingStrategy}>
                                    <ImgCrop
                                        aspect={col.ratio_crop}
                                        aspectSlider={true}
                                        rotationSlider={true}
                                        showGrid={true}
                                        showReset={true}
                                    >
                                        <Upload multiple
                                            action={route("data.upload_image")}
                                            listType="picture-card" // picture-card
                                            fileList={fileList}
                                            accept="image/*"
                                            maxCount={+col.conditions}
                                            beforeUpload={beforeUpload}
                                            onChange={onChange}
                                            itemRender={(originNode, file) => (
                                                <DraggableUploadListItem originNode={originNode} file={file} />
                                            )}
                                            headers={{
                                                'X-CSRF-TOKEN': dataAction.token,
                                            }}
                                        >

                                            <Button icon={<UploadOutlined />}>Upload({+col.conditions})</Button>
                                        </Upload>
                                    </ImgCrop>
                                </SortableContext>
                            </DndContext>
                        </Col>
                    </Row>
                );
                break;
            case "image":
            case "images":
                result = (
                    <Row>
                        <Divider orientation='left'>{col.display_name}</Divider>
                        <Col key={col.name}>
                            <Divider orientation='left'>
                                {col.display_name}
                                <span> | </span>
                                <Popconfirm
                                    title={
                                        <div>
                                            <span>Nhập Link hình ảnh bạn muốn thêm</span><br />
                                            <Input value={currentFile} onChange={(e) => setCurrentFile(e.target.value)} />
                                        </div>
                                    }
                                    onConfirm={() => handleAddImage(col)}
                                    okText="Thêm ảnh"
                                    cancelText="Hủy"
                                >
                                    <a><PlusCircleOutlined /></a>
                                </Popconfirm>
                            </Divider>
                            <DndContext sensors={[sensor]} onDragEnd={onDragEnd}>
                                <SortableContext items={fileList.map((i) => i.uid)} strategy={verticalListSortingStrategy}>
                                    <Upload multiple
                                        action={route("data.upload_image")}
                                        listType="picture-card" // picture-card
                                        fileList={fileList}
                                        maxCount={dataAction.countImage}
                                        onChange={onChange}
                                        accept="image/*"
                                        beforeUpload={beforeUpload}
                                        itemRender={(originNode, file) => (
                                            <DraggableUploadListItem originNode={originNode} file={file} />
                                        )}
                                        headers={{
                                            'X-CSRF-TOKEN': dataAction.token,
                                        }}
                                    >
                                        <Button icon={<UploadOutlined />}>Upload (Tối đa: {dataAction.countImage})</Button>
                                    </Upload>
                                </SortableContext>
                            </DndContext>
                        </Col>
                    </Row>
                );
                break;
        }

        return result;
    }

    function checkConfig(col) {
        let result = true;
        if (props.request?.type && props.table.config_show_data && !props.table.config_show_data.config[props.request.type].includes(col.name)) {
            result = false;
        }
        return result;
    }

    function handleImageUpload(targetImgElement: any, index: any, state: any, imageInfo: any, remainingFilesCount: any) {
        console.log(targetImgElement, index, state, imageInfo, remainingFilesCount)
    }
    function handleImageUploadError(errorMessage: any, result: any) {
        console.log(errorMessage, result)
    }
    function handleOnResizeEditor(height: any, prevHeight: any) {
        console.log(height, prevHeight)
    }
    function imageUploadHandler(xmlHttpRequest: { response: any; }, info: any, core: any, colName: string) {
        const result = parseJson(xmlHttpRequest.response);
        for (const [key, val] of Object.entries(result.data)) {
            editor.current[colName].insertHTML('<img key="' + key + '" src="' + val.url + '">', true, true);
        }
    }

    function showItemsLg(col) {
        if (!checkConfig(col)) {
            return false;
        }

        if (col.type_edit === "tiny") {
            let config = optionSunEditor;
            config.imageUploadHeader = {
                'X-CSRF-TOKEN': props.token
            };
            return (
                <Row key={col.id} layout="vertical" className="main-tiny01">
                    <Col key={col.id} label={col.display_name} className="main-tiny02">
                        <Divider orientation="left">{col.display_name}</Divider>
                        <SunEditor key={col.id}
                            getSunEditorInstance={(sunEditor) => { editor.current[col.name] = sunEditor }}
                            setContents={dataAction.data[col.name]}
                            onImageUpload={handleImageUpload}
                            onImageUploadError={handleImageUploadError}
                            onResizeEditor={handleOnResizeEditor}
                            imageUploadHandler={(xmlHttpRequest, info, core) => imageUploadHandler(xmlHttpRequest, info, core, col.name)}
                            setOptions={optionSunEditor}
                        />
                    </Col>
                </Row>
            );
        }

        if (col.type_edit === "calendar_cham_cong") {
            return (
                <div>
                    {/* Tạm pending, do fai truyền thêm data chấm công */}
                    {/* <Button onClick={()=>{chamCongCurentUser(data.id)}} loading={loadingBtn}>Chấm công lại từ đầu</Button> */}
                    <Calendar
                        mode="month"
                        locale="vi_VN"
                        value={dayjs(data.year + "-" + numberFormat02(data.month, 2) + "-01")}
                        key={col.name}
                        dateCellRender={cellRender}
                        onSelect={onSelectCalendarChamCong}
                    />
                </div>
            );
        }

        if (col.edit === 1 && col.type_edit === "selects_table") {
            return showDataSelectTable(props, col);
        }

        if (col.type_edit === "permission_list") {
            return permission();
        }
    }

    function checkShowDataLanguage() {
        if (dataAction.table.is_multiple_language !== 1) {
            return '';
        }
        return (
            <div>
                <Divider orientation="left">
                    Form nhập nội dung theo ngôn ngữ
                </Divider>
                <Tabs defaultActiveKey="1" items={tabDataLanguage()} />
            </div>
        )
    }
    function tabDataLanguage() {
        console.log('lang tabDataLanguage', dataAction);

        return dataAction.language.map((lang: any) => {
            return {
                key: lang.id,
                label: lang.name,
                children: contentTabLanguage(lang),
            }
        });
    }

    function contentTabLanguage(lang: any) {
        console.log('langlanglanglang', lang);

        let content = [],
            contentImage = [],
            contentLong = [];
        for (const [key, col] of Object.entries(dataAction.columnsLanguage)) {

            if (["image", "images", "image_crop", "images_crop"].includes(col.type_edit)) {
                contentImage.push(showDataImages(col));
                continue;
            }
            // xu ly tini cho lang
            if (["tiny"].includes(col.type_edit)) {
                const nameTiny = 'lang_' + lang.id + '_' + col.name;
                let config = optionSunEditor;
                config.imageUploadHeader = {
                    'X-CSRF-TOKEN': dataAction.token
                };
                contentLong.push(
                    (
                        <Row layout="vertical" className="main-tiny01">
                            <Col label={col.display_name} className="main-tiny02">
                                <Divider orientation="left">{col.display_name}</Divider>
                                <Form.Item rules={checkRule(col)} label={col.display_name} className="main-tiny03">
                                    <SunEditor key={col.id}
                                        getSunEditorInstance={(sunEditor) => { editor.current[nameTiny] = sunEditor }}
                                        setContents={dataAction.data[nameTiny]}
                                        onImageUpload={handleImageUpload}
                                        onImageUploadError={handleImageUploadError}
                                        onResizeEditor={handleOnResizeEditor}
                                        imageUploadHandler={(xmlHttpRequest, info, core) => imageUploadHandler(xmlHttpRequest, info, core, nameTiny)}
                                        setOptions={optionSunEditor}
                                    />
                                </Form.Item>
                            </Col>
                        </Row>
                    )
                );
                continue;
            }

            console.log('lang.idlang.id', lang.id);

            content.push(showData(col, lang.id));
        }

        return <Row>
            {content}
            {contentImage}
            {contentLong}
        </Row>

    }

    function handleAddImage(col) {
        const name = Date.now();
        let imageItem = {
            uid: name,
            name: name,
            status: 'OK',
            url: currentFile
        };
        let newFileList = [...fileList];
        if (col.conditions && +col.conditions > 0) {
            if (newFileList.length >= +col.conditions) {
                message.error("Chỉ được phép thêm tối đa " + col.conditions + " hình ảnh");
                return false;
            }
        }
        newFileList = [...newFileList, imageItem];
        setFileList(newFileList);
        setCurrentFile('');
    }

    const DraggableUploadListItem = ({ originNode, file }) => {
        const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
            id: file.uid,
        });
        // const style = {
        //     transform: CSS.Transform.toString(transform),
        //     transition,
        //     cursor: 'move',
        // };
        return (
            <div
                ref={setNodeRef}
                // style={style}
                // prevent preview event when drag end
                className={isDragging ? 'is-dragging' : ''}
                {...attributes}
                {...listeners}
            >
                {/* hide error tooltip when dragging */}
                {file.status === 'error' && isDragging ? originNode.props.children : originNode}
            </div>
        );
    };

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
                            <Divider orientation='left'>
                                {col.display_name}
                                <span> | </span>
                                <Popconfirm
                                    title={
                                        <div>
                                            <span>Nhập Link hình ảnh bạn muốn thêm</span><br />
                                            <Input value={currentFile} onChange={(e) => setCurrentFile(e.target.value)} />
                                        </div>
                                    }
                                    onConfirm={() => handleAddImage(col)}
                                    okText="Thêm ảnh"
                                    cancelText="Hủy"
                                >
                                    <a><PlusCircleOutlined /></a>
                                </Popconfirm>
                            </Divider>
                            <DndContext sensors={[sensor]} onDragEnd={onDragEnd}>
                                <SortableContext items={fileList.map((i) => i.uid)} strategy={verticalListSortingStrategy}>
                                    <ImgCrop
                                        aspect={col.ratio_crop}
                                        aspectSlider={true}
                                        rotationSlider={true}
                                        showGrid={true}
                                        showReset={true}
                                    >
                                        <Upload multiple
                                            action={route("data.upload_image")}
                                            listType="picture-card" // picture-card
                                            fileList={fileList}
                                            accept="image/*"
                                            maxCount={+col.conditions}
                                            beforeUpload={beforeUpload}
                                            onChange={onChange}
                                            itemRender={(originNode, file) => (
                                                <DraggableUploadListItem originNode={originNode} file={file} />
                                            )}
                                            headers={{
                                                'X-CSRF-TOKEN': props.token,
                                            }}
                                        >

                                            <Button icon={<UploadOutlined />}>Upload({+col.conditions})</Button>
                                        </Upload>
                                    </ImgCrop>
                                </SortableContext>
                            </DndContext>
                        </Col>
                    </Row>
                );
                break;
            case "image":
            case "images":
                result = (
                    <Row>
                        <Divider orientation='left'>{col.display_name}</Divider>
                        <Col key={col.name}>
                            <Divider orientation='left'>
                                {col.display_name}
                                <span> | </span>
                                <Popconfirm
                                    title={
                                        <div>
                                            <span>Nhập Link hình ảnh bạn muốn thêm</span><br />
                                            <Input value={currentFile} onChange={(e) => setCurrentFile(e.target.value)} />
                                        </div>
                                    }
                                    onConfirm={() => handleAddImage(col)}
                                    okText="Thêm ảnh"
                                    cancelText="Hủy"
                                >
                                    <a><PlusCircleOutlined /></a>
                                </Popconfirm>
                            </Divider>
                            <DndContext sensors={[sensor]} onDragEnd={onDragEnd}>
                                <SortableContext items={fileList.map((i) => i.uid)} strategy={verticalListSortingStrategy}>
                                    <Upload multiple
                                        action={route("data.upload_image")}
                                        listType="picture-card" // picture-card
                                        fileList={fileList}
                                        maxCount={props.countImage}
                                        onChange={onChange}
                                        accept="image/*"
                                        beforeUpload={beforeUpload}
                                        itemRender={(originNode, file) => (
                                            <DraggableUploadListItem originNode={originNode} file={file} />
                                        )}
                                        headers={{
                                            'X-CSRF-TOKEN': props.token,
                                        }}
                                    >
                                        <Button icon={<UploadOutlined />}>Upload (Tối đa: {props.countImage})</Button>
                                    </Upload>
                                </SortableContext>
                            </DndContext>
                        </Col>
                    </Row>
                );
                break;
        }

        return result;
    }

    const onFinishFormEdit = (values: any) => {
        setIsStopSubmit(false);
        values.id = idAction;
        for (const [key, val] of Object.entries(formEdit.getFieldValue())) {
            if (!values[key]) {
                values[key] = val;
            }
        }

        // return
        if (isStopSubmit) {
            message.error("Vui lòng chờ tải xong hình ảnh");
            return false;
        }

        values = formatValueForm(props.columns, values);

        console.log('va', values);
        // values.tiny_images = tinyImageName;
        values.submit_edirect = 'api';
        let link;
        if (idAction === 0) {
            link = route("data.store", [props.table.id]);
        } else {
            link = route("data.update", [props.table.id, idAction]);
        }

        setLoadingTable(true);
        setIsOpenFormEdit(false);
        axios.post(link, values).then((response) => {
            console.log('res', response);
            if (response.data.status_code === 200) {
                message.success("Đã lưu dữ liệu thành công");
                location.reload();
            } else {
                message.error("Đã lưu dữ liệu thất bại");
            }

            setLoadingTable(false);
        }).catch((error) => {
            message.error("Lưu dữ liệu thất bại");
        });
    };

    function formatValueForm(columns, values) {
        for (const [key, col] of Object.entries(columns)) {
            if (col.edit !== 1) {
                values[col.name] = '';
                continue;
            }
            if (col.type_edit === "tiny" && editor.current[col.name]) {
                values[col.name] = editor.current[col.name].getContents();
            }
            if (col.type_edit === "permission_list") {
                values[col.name] = isCheckAllPermission
                    ? props.permissionList_all
                    : permissionList;
            }
            if (col.type_edit === "date") {
                values[col.name] = !values[col.name] ? '' : values[col.name].format(DATE_FORMAT);
            }
            if (col.type_edit === "datetime") {
                values[col.name] = !values[col.name] ? '' : values[col.name].format(DATE_TIME_FORMAT);
            }
            if (col.type_edit === "time") {
                values[col.name] = !values[col.name] ? '' : values[col.name].format(TIME_FORMAT);
            }
            // if (col.type_edit === "selects_table") {
            //     values[col.name] = dataSourceSelectTbl[col.name].datas.dataSource;
            // }
            if (col.type_edit === "color") {
                values[col.name] = values[col.name].toHexString();
            }

            if (['images', 'image', 'image_crop', 'images_crop'].includes(col.type_edit)) {
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

                    // values.images = JSON.stringify(images);
                    values[col.name] = images;
                } else {
                    values[col.name] = "";
                    values[col.name] = "";
                }
            }

        }
        return values;
    }

    return <>
        <Form
            name="basic"
            layout="vertical"
            form={formEdit}
            onFinish={onFinishFormEdit}
            autoComplete="off"
        // initialValues={formChamCong}
        >
            <Row>

                <Row>

                    {/* show form */}
                    {checkShowData()}

                    {/* language */}
                    {checkShowDataLanguage()}
                    {/* {listItemsLg} */}
                </Row>

                <Col span={24} className="main-btn-popup">
                    <Button className="btn-popup" >
                        <CloseSquareOutlined />
                        Hủy
                    </Button>
                    <span> </span>
                    <Button className="btn-popup" type="primary" htmlType="submit">
                        <CopyOutlined />
                        Lưu
                    </Button>
                </Col>
            </Row>
        </Form>
    </>
}