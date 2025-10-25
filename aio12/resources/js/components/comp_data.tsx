import React, { useState, useRef } from "react";
import AdminLayout from "@/layouts/AdminLayout";
import dayjs from "dayjs";
import {
    Button,
    message,
    Form,
    Input, ColorPicker,
    Popconfirm,
    Row, Col,
    Divider,
    Upload, Tabs, Spin
} from "antd";

import { DndContext, PointerSensor, useSensor } from '@dnd-kit/core';
import {
    arrayMove,
    SortableContext,
    useSortable,
    verticalListSortingStrategy,
} from '@dnd-kit/sortable';

import {
    PlusCircleOutlined,
    CopyOutlined,
    CloseSquareOutlined,
    UploadOutlined,
} from "@ant-design/icons";

import axios from "axios";
import "../../css/form.css";
import { parseJson } from "../Function/common";
import { DATE_FORMAT, DATE_TIME_FORMAT, TIME_FORMAT } from '../Function/constant';

import ImgCrop from 'antd-img-crop';


import { checkRule, showData02, showDataSelectTable } from '../Function/data';

// SunEditor
import SunEditor from 'suneditor-react';
import 'suneditor/dist/css/suneditor.min.css';
import { optionSunEditor } from '../Function/sun_config';
import { a } from "node_modules/framer-motion/dist/types.d-Cjd591yU";
import { log } from "console";

const { TextArea } = Input;


export function contentFormData(dataAction: any, imagesData: any[], onSuccess: any) {
    // All hooks must be called unconditionally at the top
    const [formEdit] = Form.useForm();
    const [fileList, setFileList] = useState(imagesData);
    const [currentFile, setCurrentFile] = useState('');
    const editor = useRef([]);
    const [loadingSubmit, setLoadingSubmit] = useState(false);
    const [isStopSubmit, setIsStopSubmit] = useState(false);
    const sensor = useSensor(PointerSensor, {
        activationConstraint: {
            distance: 10,
        },
    });

    console.log('dataAction', dataAction);
    // Chỉ cho phép file ảnh
    const beforeUpload = (file: any) => {
        const isImage = file.type.startsWith('image/');
        if (!isImage) {
            message.error('Chỉ được upload file hình ảnh!');
        }
        return isImage;
    };

    // Xử lý khi upload file thay đổi
    React.useEffect(() => {
        console.log('useEffect imagesData', imagesData);
        setFileList(imagesData);
    }, [imagesData]);

    // Chỉ set giá trị form khi dataAction.data thay đổi
    React.useEffect(() => {
        formEdit.resetFields();
        if (dataAction && dataAction.data) {
            let data_tmp = dataAction.data;
            dataAction.columns.map((col) => {
                if (col.type_edit === "date" && data_tmp[col.name]) {
                    formEdit.setFieldValue(col.name, dayjs(data_tmp[col.name], DATE_FORMAT));
                }
                if (col.type_edit === "datetime" && data_tmp[col.name]) {
                    const zone = Number(new Date().toLocaleTimeString('en-us', { timeZoneName: 'short' }).split('GMT')[1]);
                    data_tmp[col.name] = dayjs(data_tmp[col.name], DATE_TIME_FORMAT).add(zone, 'hour');

                    formEdit.setFieldValue(col.name, dayjs(data_tmp[col.name], DATE_TIME_FORMAT).add(zone, 'hour'));
                }
                if (col.type_edit === "time" && data_tmp[col.name]) {
                    formEdit.setFieldValue(col.name, dayjs(data_tmp[col.name], TIME_FORMAT));
                }

                if (col.type_edit === "selects" && data_tmp[col.name]) {
                    let selects = null;
                    try {
                        selects = JSON.parse(data_tmp[col.name]).map((select) => {
                            return +select;
                        });
                    } catch (error) {
                        selects = [];
                    }
                    formEdit.setFieldValue(col.name, selects);
                }

                if (col.type_edit === "select" && data_tmp[col.name]) {
                    console.log('col.name', col.name, data_tmp[col.name]);

                    formEdit.setFieldValue(col.name, data_tmp[col.name].id);
                }
            });
        }
        if (dataAction && dataAction.dataLanguage) {
            Object.entries(dataAction.dataLanguage).forEach(([langId, value1]: [string, any]) => {
                Object.entries(value1).forEach(([colName, value2]: [string, any]) => {
                    const name = 'lang_' + langId + '_' + colName;
                    formEdit.setFieldValue(name, value2);
                })
            });
        }
    }, [dataAction.data, dataAction.dataLanguage, formEdit]);

    // Early return for empty dataAction, after all hooks
    if (dataAction && Object.keys(dataAction).length === 0) {
        return <Spin tip="Loading" size="large">Loading...</Spin>;
    }


    const onDragEnd = ({ active, over }: { active: { id: string }, over: { id: string } | null }) => {
        if (active.id !== over?.id) {
            setFileList((prev: any[]) => {
                const activeIndex = prev.findIndex((i) => i.uid === active.id);
                const overIndex = prev.findIndex((i) => i.uid === over?.id);
                return arrayMove(prev, activeIndex, overIndex);
            });
        }
    };

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
                return showData02(col, dataAction);
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


    function contentTab(tab: any) {
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
                        return showData02(subCol, dataAction);
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

            content.push(showData02(col, dataAction));
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
        let fileList_tmp = fileList;
        fileList_tmp[col.name] = [...fileList_tmp[col.name], imageItem];
        if (col.conditions && +col.conditions > 0) {
            if (fileList_tmp[col.name].length > +col.conditions) {
                message.error("Chỉ được phép thêm tối đa " + col.conditions + " hình ảnh, vui lòng xóa bớt hình ảnh trước khi thêm mới.");
                return false;
            }
        }

        console.log('handleAddImage-newFileList', fileList_tmp);

        setFileList(fileList_tmp);
        setCurrentFile('');
    }

    function onChangeImage({ fileList: newFileList }, colName) {
        console.log('onChangeImage-newFileList', newFileList);
        console.log('onChangeImage-colName', colName);
        // setFileList(newFileList);
        // setFilesList theo colName
        setFileList((prev) => ({
            ...prev,
            [colName]: newFileList
        }));
    }

    function showDataImages(col) {
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
                                <SortableContext items={(fileList[col.name] || []).map((i) => i.uid)} strategy={verticalListSortingStrategy}>
                                    <ImgCrop
                                        aspect={col.ratio_crop}
                                        aspectSlider={true}
                                        rotationSlider={true}
                                        showGrid={true}
                                        showReset={true}
                                    >
                                        <Upload
                                            multiple
                                            action={route("data.upload_image")}
                                            listType="picture-card" // picture-card
                                            fileList={fileList[col.name] || []}
                                            accept="image/*"
                                            maxCount={+col.conditions}
                                            beforeUpload={beforeUpload}
                                            onChange={(fileList) => onChangeImage(fileList, col.name)}
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
                                <SortableContext items={(fileList[col.name] || []).map((i) => i.uid)} strategy={verticalListSortingStrategy}>
                                    <Upload multiple
                                        action={route("data.upload_image")}
                                        listType="picture-card" // picture-card
                                        fileList={fileList[col.name] || []}
                                        maxCount={+col.conditions}
                                        onChange={(fileList) => onChangeImage(fileList, col.name)}
                                        accept="image/*"
                                        beforeUpload={beforeUpload}
                                        itemRender={(originNode, file) => (
                                            <DraggableUploadListItem originNode={originNode} file={file} />
                                        )}
                                        headers={{
                                            'X-CSRF-TOKEN': dataAction.token,
                                        }}
                                    >
                                        <Button icon={<UploadOutlined />}>Upload (Tối đa: {+col.conditions})</Button>
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
        if (dataAction.request?.type && dataAction.table.config_show_data && !dataAction.table.config_show_data.config[dataAction.request.type].includes(col.name)) {
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

    function showItemsLg(col: any) {
        if (!checkConfig(col)) {
            return false;
        }

        if (col.type_edit === "tiny") {
            let config = optionSunEditor;
            config.imageUploadHeader = {
                'X-CSRF-TOKEN': dataAction.token
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
            return showDataSelectTable(dataAction, col);
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
        return dataAction.language.map((lang: any) => {
            return {
                key: lang.id,
                label: lang.name,
                children: contentTabLanguage(lang),
            }
        });
    }

    function contentTabLanguage(lang: any) {
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

            content.push(showData02(col, dataAction, lang.id));
        }

        return <Row>
            {content}
            {contentImage}
            {contentLong}
        </Row>

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

    const onFinishFormEdit = (values: any) => {

        // setLoadingSubmit(true);s

        for (const [key, val] of Object.entries(formEdit.getFieldValue())) {
            if (!values[key]) {
                values[key] = val;
            }
        }

        // return
        if (isStopSubmit) {
            message.error("Vui lòng chờ tải xong hình ảnh");
            setLoadingSubmit(false);
            return false;
        }

        values = formatValueForm(dataAction.columns, values);

        values.id = dataAction.data.id;

        // console.log('va', values);
        // return;
        // values.tiny_images = tinyImageName;


        if (dataAction.table.is_multiple_language === 1) {
            let nameLang;
            for (const [key, col] of Object.entries(dataAction.columnsLanguage)) {
                if (col.type_edit === "tiny") {
                    for (const [keyLang, lang] of Object.entries(dataAction.language)) {
                        nameLang = 'lang' + '_' + lang.id + '_' + col.name;
                        if (editor.current[nameLang]) {
                            values[nameLang] = editor.current[nameLang].getContents();
                        }
                    }
                }
            }
        }

        values.submit_edirect = 'api';
        let link;
        if (dataAction.data.id === 0 || dataAction.data.id === "") {
            link = route("data.store", [dataAction.table.id]);
        } else {
            link = route("data.update", [dataAction.table.id, dataAction.data.id]);
        }
        // return true;
        axios.post(link, values).then((response) => {
            setLoadingSubmit(false);
            if (response.data.status_code === 200) {
                if (dataAction.table.type_show === 1) {
                    // reload page if drag and drop
                    window.location.reload();
                }
                console.log('response.data.data', response.data.data);
                message.success("Đã lưu dữ liệu thành công");
                onSuccess(response.data.data);
            } else {
                message.error("Đã lưu dữ liệu thất bại");
            }
        }).catch((error) => {
            setLoadingSubmit(false);
            message.error("Lưu dữ liệu thất bại");
        });
    };

    function formatValueForm(columns: any, values: any) {
        for (const [key, col] of Object.entries(columns) as [string, any][]) {
            if (col.edit !== 1) {
                values[col.name] = '';
                continue;
            }
            if (col.type_edit === "tiny" && editor.current[col.name]) {
                values[col.name] = editor.current[col.name].getContents();
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

            // images
            if (['image', 'image_crop', 'images', 'images_crop'].includes((col as any).type_edit)) {
                values[(col as any).name] = fileList[(col as any).name];
            }

        }
        return values;
    }

    let initValues = {};
    dataAction.columns.map((col) => {
        if (col.type_edit === "date" && dataAction.data[col.name]) {
            initValues[col.name] = dayjs(dataAction.data[col.name], DATE_FORMAT);
            return;
        }
        if (col.type_edit === "datetime" && dataAction.data[col.name]) {
            initValues[col.name] = dayjs(dataAction.data[col.name], DATE_TIME_FORMAT);
            return;
        }
        if (col.type_edit === "time" && dataAction.data[col.name]) {
            initValues[col.name] = dayjs(dataAction.data[col.name], TIME_FORMAT);
            return;
        }
        // todo: info selects
        if (col.type_edit === "select" && dataAction.data[col.name]) {
            initValues[col.name] = dataAction.data[col.name].id;
            return;
        }
        initValues[col.name] = dataAction.data[col.name];
        console.log(col.name, dataAction.data[col.name]);

    });
    formEdit.setFieldsValue(initValues);

    return <>
        <Form
            name="basic"
            layout="vertical"
            form={formEdit}
            onFinish={onFinishFormEdit}
            autoComplete="off"
        // initialValues={initialValues}
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
                    {/* <Button className="btn-popup" >
                        <CloseSquareOutlined />
                        Hủy
                    </Button>
                    <span> </span> */}
                    <Button className="btn-popup" type="primary" htmlType="submit" loading={loadingSubmit}>
                        <CopyOutlined />
                        Lưu dữ liệu
                    </Button>
                </Col>
            </Row>
        </Form>
    </>
}


type DisplayName = {
    name?: string;
    description?: string;
    color?: string;
};
/**
 * Form thêm nhanh dữ liệu cho các bảng đơn giản
 * @param tableName
 * @param displayName
 * @param route
 * @param onSuccess
 * @returns
 */
export function formAddExpress(tableName: string, displayName: DisplayName = {}, route: string, onSuccess: any) {
    const [formExpress] = Form.useForm();
    console.log('route', route);

    let name = 'Tiêu đề';
    let description = 'Mô tả';
    let color = 'Màu đánh dấu';
    if (displayName.name) {
        name = displayName.name;
    }
    if (displayName.description) {
        description = displayName.description;
    }
    if (displayName.color) {
        color = displayName.color;
    }
    const onfinish = (values: any) => {
        axios.post(route, values).then((response) => {
            console.log('Success:', response.data);
            onSuccess(response.data.data);
        }).catch((error) => {
            console.error('Error:', error);
        });
    }
    return (
        <>
            <Form layout="vertical" onFinish={onfinish} form={formExpress}>
                <Form.Item label={name} name="name" rules={[{ required: true, message: 'Vui lòng nhập ' + name }]}>
                    <Input />
                </Form.Item>
                <Form.Item label='Mô tả' name="description">
                    <TextArea />
                </Form.Item>
                <Form.Item label='Màu nền' name="background">
                    <ColorPicker showText />
                </Form.Item>
                <Form.Item label='Màu chữ' name="color">
                    <ColorPicker showText />
                </Form.Item>

                <Button type="primary" htmlType="submit">
                    <CopyOutlined />
                    Thêm mới
                </Button>
            </Form>
        </>
    )
}
