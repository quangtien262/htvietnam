import React, { useState, useEffect, useRef  } from 'react';
import AdminLayout from '@/Layouts/AdminLayout';
import { Select, Col, Row, Descriptions, Card, Button, Input, InputNumber, Form, Image,
    Space, DatePicker, Upload, message, Tabs, Calendar, Modal, Checkbox, Radio, Popconfirm,
    Divider, Table, Spin, List, Typography, Flex, Tag   } from 'antd';

import { DndContext, PointerSensor, useSensor } from '@dnd-kit/core';
import {
    arrayMove,
    SortableContext,
    useSortable,
    verticalListSortingStrategy,
} from '@dnd-kit/sortable';

import { 
    FormOutlined, CopyOutlined, UploadOutlined, PlusSquareOutlined, EditOutlined, RollbackOutlined, DeleteOutlined,
    PayCircleOutlined,
    PercentageOutlined,
    FileDoneOutlined,
    TransactionOutlined,
    ArrowRightOutlined
} from '@ant-design/icons';
import { CSS } from '@dnd-kit/utilities';
import {  router, Link } from '@inertiajs/react';

import cloneDeep from 'lodash/cloneDeep';
import ImgCrop from 'antd-img-crop';
import axios from 'axios';
import '../../../../css/form.css';
import { checkRule, showData, showDataPopup } from '../../../Function/data';
import { parseJson, intval } from '../../../Function/common';
// import { sltTable_ShowSelect, sltTable_ShowSelects } from '../../../Function/selects_table';
import {  showSelect } from '../../../Function/selects_table';
import {numberFormatBycount, numberFormat} from '../../../Function/common';
// himalaya function
import { setTotalHoaDon } from '../../../Function/himalaya';

// css
import '../../../../css/form.css';

// dayjs
import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";
import weekday from "dayjs/plugin/weekday";
import localeData from "dayjs/plugin/localeData";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import TextArea from 'antd/es/input/TextArea';


dayjs.extend(weekday);
dayjs.extend(localeData);
dayjs.extend(customParseFormat);
dayjs.extend(utc);
dayjs.extend(timezone);

export default function Dashboard(props) {

    const [data, setData] = useState(props.data);
    const [submitRedirect, setSubmitRedirect] = useState("detail"); // detail, list
    const [loading, setLoading] = useState(false);
    const [loadingBtn, setLoadingBtn] = useState(false);
    const [isStopSubmit, setIsStopSubmit] = useState(false);
    const [fileList, setFileList] = useState(props.imagesData.length == 0 ? [] : props.imagesData.map((item) => {
            return {
                name: item.name,
                status: item.status,
                url: item.url
            }
        }
    ));
    const [fileListExpress, setFileListExpress] = useState([]);

    const [error, setError] = useState('');

    //permission
    const [permissionList, setPermissionList] = useState(props.userPermission);
    const [isCheckAllPermission, setIsCheckAllPermission] = useState(false);

    const [formData] = Form.useForm();
    // editor
    const tinyRefs = useRef([]);
    const [tinyImageName, setTinyImageName] = useState([]);

    // select table
    const [dataSourceSelectTbl] = useState(props.selectTbl);

    // himalaya
    const [card, setCard] = useState([]);
    const [theGT, setTheGT] = useState(props.selectData.card_gt ? props.selectData.card_gt : []);
    const [theLT, setTheLT] = useState(props.selectData.card_tl ? props.selectData.card_tl: []);
    const [tienTheGT, setTienTheGT] = useState(0);
    const [allService, setAllService] = useState([]);
    const [service, setService] = useState([]);
    const [theLan_nvThucHien, setTheLan_nvThucHien] = useState([]);
    // trường hợp hóa đơn thẻ liệu trình
    

    function getTotalHoaDon(prop) {
        if(prop.table.name !== 'hoa_don') {
            return [];
        }
        let tong_tien = prop.data.tong_tien ? numberFormat(prop.data.tong_tien) : 0,
            giam_gia = prop.data.giam_gia ? numberFormat(prop.data.giam_gia) : 0,
            vat_money = prop.data.vat_money ? numberFormat(prop.data.vat_money) : 0,
            thanh_toan = prop.data.thanh_toan ? numberFormat(prop.data.thanh_toan) : 0;
        const content = [
            {
                title: <b>Tổng Thanh Toán</b>,
                value: tong_tien,
                icon: <PayCircleOutlined />
            },
            {
                title: <b>Giảm Giá</b>,
                value: giam_gia,
                icon: <PercentageOutlined />
            },
            {
                title: <b>Thuế</b>,
                value: vat_money,
                icon: <FileDoneOutlined />
            },
            {
                title: <b>Tiền trong thẻ</b>,
                value: tienTheGT,
                icon: <TransactionOutlined />
            },
            {
                title: <b>Khách Thanh Toán</b>,
                value: thanh_toan,
                icon: <TransactionOutlined />
            },
        ];
        return {
            content: content,
            param: {
                tong_tien:tong_tien,
                vat_money:vat_money,
                thanh_toan:thanh_toan,
                giam_gia:giam_gia
            }
        };
    }

    const [himalayaTotalHoaDon, setHimalayaTotalHoaDon] = useState(getTotalHoaDon(props));
    

    const DATE_FORMAT = "YYYY-MM-DD";
    const DATE_TIME_FORMAT = "YYYY-MM-DD HH:mm:ss";
    const TIME_FORMAT = "HH:mm:ss";

    if(!sessionStorage.getItem('time') || (sessionStorage.getItem('time') && sessionStorage.getItem('time') !== props.time.toString())) {
        sessionStorage.clear();
        sessionStorage.setItem('time', props.time.toString());
    }

    const onFinish = (values) => {
        console.log('sss', submitRedirect);
        console.log('theLan_nvThucHien', theLan_nvThucHien);
        // return;
        if(submitRedirect === 'huy_hoa_don') {
            axios.post(route('data.delete',[props.table.id]),{ids:[props.data.id]}).then(response => {
                if (response.data.status_code == 200) {
                    message.success('Đã xóa (' + response.data.data + ')');
                    router.get(route('data.index', [props.table.id]));
                } else {
                    message.error('Xóa thất bại');
                }
            })
            .catch(error => {
                message.error('Có lỗi xảy ra');
            });
        }



        // return;
        setLoading(true);
        setIsStopSubmit(false);
        values = formData.getFieldValue();
        for (const [key, val] of Object.entries(formData.getFieldValue())) {
            if(!values[key]) {
                values[key] = val;
            }
        }

        // return
        if (isStopSubmit) {
            message.error("Vui lòng chờ tải xong hình ảnh");
            return false;
        }

        // console.log('values', values);
        // return;

        values = formatValueForm(props.columns, values);
        // return '';
        if(props.table.name === 'hoa_don' && submitRedirect === 'thanh_toan') {
            values.status_hoa_don_id = 1;
            console.log('values', values);
        }
        
        if(props.table.is_multiple_language === 1) {
            let nameLang;
            for (const [key, col] of Object.entries(props.columnsLanguage)) {
                if (col.type_edit === "tiny") {
                    // props.language
                    for (const [keyLang, lang] of Object.entries(props.language)) {
                        nameLang = 'lang' + '_' + lang.id + '_' + col.name;
                        if(tinyRefs.current[nameLang]) {
                            values[nameLang] = tinyRefs.current[nameLang].getContent();
                        }
                    }
                }
            }
        }

        values.tiny_images = tinyImageName;
        values.submit_edirect = submitRedirect;

        values.is_change_selects_table  = false;

        // save nhan viên thực hiên, áp dụng cho thẻ lần
        values.theLan_nvThucHien = theLan_nvThucHien;
        // console.log('xxxxx', values);
        // return;
        
        if(sessionStorage.getItem("storage")) {
            let storage = parseJson(sessionStorage.getItem("storage"));
            for(const [key, val] of Object.entries(storage)) {
                values[key] = val;
                values.is_change_selects_table  = true;
            }
        }
        // console.log('values', values);
        // return;
        if (props.dataId > 0) {
            // thử đổi sang ajax
            router.post(
                route("data.update", [props.table.id, data.id]),
                values
            );
        } else {
            router.post(route("data.store", [props.table.id]), values);
        }
    };

    function formatValueForm(columns, values) {
        for (const [key, col] of Object.entries(columns)) {
            if (col.edit !== 1) {
                values[col.name] = '';
                continue;
            }
            if (col.type_edit === "tiny") {
                values[col.name] = tinyRefs.current[col.name].getContent();
            }
            if (col.type_edit === "permission_list") {
                values[col.name] = isCheckAllPermission
                    ? props.permissionList_all
                    : permissionList;
            }
            if (col.type_edit === "date") {
                values[col.name] = !values[col.name] ? '' : dayjs(values[col.name]).format(DATE_FORMAT);
            }
            if (col.type_edit === "datetime") {
                values[col.name] = !values[col.name] ? '' : dayjs(values[col.name]).format(DATE_TIME_FORMAT);
            }
            if (col.type_edit === "time") {
                values[col.name] = !values[col.name] ? '' : dayjs(values[col.name]).format(TIME_FORMAT);
            }
            if (col.type_edit === "selects_table") {
                values[col.name] = dataSourceSelectTbl[col.name].datas.dataSource;
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
                    values[col.name] = images;
                } else {
                    values[col.name] = "";
                    values[col.name] = "";
                }
            }

        }
        return values;
    }

    const onFinishFailed = (errorInfo) => {
        console.log('fail');
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

                axios.post(route("data.tiny_upload_image"), {
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

    const DraggableUploadListItem = ({ originNode, file }) => {
        const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
          id: file.uid,
        });
        const style = {
          transform: CSS.Transform.toString(transform),
          transition,
          cursor: 'move',
        };
        return (
          <div
            ref={setNodeRef}
            style={style}
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

    const onChange = ({ fileList: newFileList }) => {
        setFileList(newFileList);
    };

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
                    <Row key={col.id}>
                        <Col>
                            <Form.Item
                                name={col.name}
                                rules={checkRule(col)}
                                label={col.display_name}
                            >

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
                                                maxCount={+col.conditions}
                                                onChange={onChange}
                                                itemRender={(originNode, file) => (
                                                    <DraggableUploadListItem originNode={originNode} file={file} />
                                                )}
                                            >
                                                <Button icon={<UploadOutlined />}>Upload({+col.conditions})</Button>
                                            </Upload>
                                            </ImgCrop>
                                        </SortableContext>
                                    </DndContext>

                            </Form.Item>
                        </Col>
                    </Row>
                );
                break;
            case "image":
            case "images":
                result = (
                    <DndContext key={col.id} sensors={[sensor]} onDragEnd={onDragEnd}>
                        <SortableContext items={fileList.map((i) => i.uid)} strategy={verticalListSortingStrategy}>
                            <Upload multiple
                                action={route("data.upload_image")}
                                listType="picture-card" // picture-card
                                fileList={fileList}
                                maxCount={props.countImage}
                                onChange={onChange}
                                itemRender={(originNode, file) => (
                                    <DraggableUploadListItem originNode={originNode} file={file} />
                                )}
                            >
                            <Button icon={<UploadOutlined />}>Upload (Tối đa: {props.countImage})</Button>
                            </Upload>
                        </SortableContext>
                    </DndContext>
                );
                break;
        }

        return result;
    }

    function checkConfig(col) {
        let result = true;
        if(props.request.type && props.table.config_show_data && !props.table.config_show_data.config[props.request.type].includes(col.name)) {
            result = false;
        }
        return result;
    }

    function checkShowFormItem(col) {
        if(props.table.name === 'hoa_don' &&  ["card_gt", "card_tl"].includes(col.name)) {

            // set lại danh sách thẻ gt
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

            const headerService = [
                {
                  title: 'SP/DV',
                  dataIndex: 'product_id',
                  key: 'name',
                },
                {
                  title: 'Số lượng',
                  dataIndex: 'so_luong',
                  key: 'so_luong',
                },
                {
                  title: 'NV thực hiện',
                  dataIndex: 'nv_thuc_hien',
                  key: 'nv_thuc_hien',
                },
                {
                  title: 'Chiết khấu',
                  dataIndex: 'chiet_khau',
                  key: 'chiet_khau',
                },
                {
                  title: 'Ghi chú',
                  dataIndex: 'note',
                  key: 'note',
                },
            ]

            function configColumnService() {
                let result = headerService.map((col) => {
                    console.log('col',col);
                    
                    const fastEditCancel = (e) => {};

                    const saveChietKhau = (e) => {
                        console.log('22', e);
                    };

                    // function onSubmitNVThucHien(record) {
                    //     console.log('formNVThucHien', formNVThucHien);
                    //     console.log('eeeee', e);
                    // }

                    const onSubmitNVThucHien = (values) => {
                        console.log('formNVThucHien');
                        console.log('formNVThucHien', values);
                    }

                    function changeNVThucHien(e,record) {
                        console.log('eeeeee', e);
                        console.log('record', record);
                        console.log('service', service);
                        let theLan_nvThucHien_tmp = theLan_nvThucHien;
                        theLan_nvThucHien_tmp[record.id] = e.value;
                        setTheLan_nvThucHien(theLan_nvThucHien_tmp);

                        const service_tmp = service.map((val) => {
                            if(record.id === val.id) {
                                val.nv_thuc_hien = e.label;
                            }
                            return val;
                        });
                        console.log('service_tmp', service_tmp);
                        // const ser = cloneDeep(service_tmp);
                        setService(service_tmp);
                        
                    }

                    const [formNVThucHien] = Form.useForm();
                    return {
                        title: col.title,
                        dataIndex: col.dataIndex,
                        key: col.key,
                        render: (_, record) => {
                            console.log('___', _);
                            console.log('record', record);
                            if(col.dataIndex === 'nv_thuc_hien') {
                                return <div>
                                    
                                        <Popconfirm
                                            title={<div>
                                               
                                                <Select showSearch className='ht-select'
                                                    style={{ width: '100%' }}
                                                    placeholder="Chọn nhân viên"
                                                    optionFilterProp="children"
                                                    filterOption={(input, option) => (option?.label ?? '').toLowerCase().includes(input.toLowerCase())}
                                                    options={props.admin_users}
                                                    allowClear={true}
                                                    onChange={(value, e)=>{changeNVThucHien(e, record)}}
                                                />
                                               
                                            </div>}
                                            onConfirm={ ()=>{onSubmitNVThucHien} }
                                            onCancel={fastEditCancel}
                                            icon="NV "
                                            cancelText="Hủy"
                                            okText={"OK"}
                                        >
                                            <a className="icon-fast-edit">
                                                {record.nv_thuc_hien}
                                                <FormOutlined />
                                            </a>
                                        </Popconfirm>
                                    </div>;
                            };
                            if(col.dataIndex === 'chiet_khau') {
                                return <div>
                                        <Popconfirm
                                            title={<div>
                                                <InputNumber />
                                            </div>}
                                            onConfirm={saveChietKhau}
                                            // onCancel={fastEditCancel}
                                            icon="$"
                                            cancelText="Hủy"
                                            okText={""}
                                        >
                                            <a className="icon-fast-edit">
                                                <FormOutlined />
                                            </a>
                                        </Popconfirm>
                                    </div>;
                            };
                            return record[col.dataIndex]
                        },
                    };
                });
    
                return result;
            }

            return <div className="width_100">
                    <Col key={col.name} sm={{ span: 12 }} md={{ span: 24 }} lg={{ span: col.col }}>
                        <Form.Item name={col.name} rules={checkRule(col)} label={col.display_name}>
                            <Select showSearch className='ht-select'
                                style={{ width: '100%' }}
                                placeholder="Search to Select"
                                optionFilterProp="children"
                                filterOption={(input, option) => (option?.label ?? '').toLowerCase().includes(input.toLowerCase())}
                                options={props.data.type_hoa_don_id === 1 ? theGT : theLT }
                                allowClear={true}
                            />
                        </Form.Item>
                    </Col>
                    {
                        // nếu là thẻ giá trị thì show ra bảng dịch vụ
                        props.data.status_hoa_don_id !== 2 ? '':
                        <Col key={col.name} sm={{ span: 24 }} md={{ span: 24 }} lg={{ span: 24 }}>
                            <Table
                                size="small"
                                components={{
                                    body: {
                                        cell: EditableCell,
                                    },
                                }}
                                dataSource={service}
                                columns={configColumnService()}
                                // columns={headerService}
                                rowClassName="editable-row"
                                className="table-index"
                            />
                        </Col>
                    }
                    
                </div>
        }
        return showData(col, props);
    }

    const listItems = props.columns.map((col) => {
        if (col.block_type == null || col.block_type == '') {
            if(checkConfig(col) === true) {
                return showData(col, props);
                return checkShowFormItem(col);
            }
        }
    });

    const imageItems = props.columns.map((col) => {
        if (["image", "images", "image_crop", "images_crop"].includes(col.type_edit)) {
            if(checkConfig(col)) {
                return showDataImages(col);
            }
        }
    });

    function onChangePermission(e, type) {
        const id = e.target.value;
        let permissionList_tmp = permissionList;
        if (e.target.checked) {
            permissionList_tmp[type].push(id);
            setPermissionList(permissionList_tmp);
            return;
        }
        let type_tmp = permissionList_tmp[type].map((key) => {
            if (!(key === id || !key)) {
                return key;
            }
        });
        permissionList_tmp[type] = type_tmp;
        setPermissionList(permissionList_tmp);
    }

    function permissionStatus(type, id) {
        let key = null;
        if(permissionList[type]) {
            key = Object.keys(permissionList[type]).find(
                (key) => permissionList[type][key] === id
            );
        }
        if (key) {
            return 1;
        }
        return 0;
    }

    function subPer(sub) {
        return sub.map((tbl) => {
            return <tr key={tbl.id} data-row-key={tbl.id} className="ant-table-row ant-table-row-level-0">
                        <td className="ant-table-cell"><Checkbox onChange={(e)=>{onChangePermission(e, 'table_all')}}>{tbl.display_name}</Checkbox></td>
                        <td className="ant-table-cell"><Checkbox value={tbl.id} onChange={(e)=>{onChangePermission(e, 'table_add')}} defaultChecked={permissionStatus('table_add', tbl.id)}></Checkbox></td>
                        <td className="ant-table-cell"><Checkbox value={tbl.id} onChange={(e)=>{onChangePermission(e, 'table_edit')}} defaultChecked={permissionStatus('table_edit', tbl.id)}></Checkbox></td>
                        <td className="ant-table-cell"><Checkbox value={tbl.id} onChange={(e)=>{onChangePermission(e, 'table_delete')}} defaultChecked={permissionStatus('table_delete', tbl.id)}></Checkbox></td>
                        <td className="ant-table-cell"><Checkbox value={tbl.id} onChange={(e)=>{onChangePermission(e, 'table_view')}} defaultChecked={permissionStatus('table_view', tbl.id)}></Checkbox></td>
                        <td className="ant-table-cell"><Checkbox value={tbl.id} onChange={(e)=>{onChangePermission(e, 'table_create_by')}} defaultChecked={permissionStatus('table_create_by', tbl.id)}></Checkbox></td>
                        {/* <td className="ant-table-cell"><Checkbox value={tbl.id} onChange={(e)=>{onChangePermission(e, 'table_share')}} defaultChecked={permissionStatus('table_share', tbl.id)}></Checkbox></td> */}
                </tr>
        })
    }

    function permissionData() {
        return props.tablesPermission.map((tbl) => {
            if(tbl.sub.length === 0) {
                return <tbody key={tbl.parent.name} className="ant-table-tbody">
                    <tr key={tbl.parent.name} data-row-key={tbl.id} className="ant-table-row ant-table-row-level-0">
                        <td className="ant-table-cell"><Checkbox value={tbl.parent.id} onChange={(e)=>{onChangePermission(e, 'table_all')}} >{tbl.parent.display_name}</Checkbox></td>
                        <td className="ant-table-cell"><Checkbox value={tbl.parent.id} onChange={(e)=>{onChangePermission(e, 'table_add')}} defaultChecked={permissionStatus('table_add', tbl.parent.id)}></Checkbox></td>
                        <td className="ant-table-cell"><Checkbox value={tbl.parent.id} onChange={(e)=>{onChangePermission(e, 'table_edit')}} defaultChecked={permissionStatus('table_edit', tbl.parent.id)}></Checkbox></td>
                        <td className="ant-table-cell"><Checkbox value={tbl.parent.id} onChange={(e)=>{onChangePermission(e, 'table_view')}} defaultChecked={permissionStatus('table_view', tbl.parent.id)}></Checkbox></td>
                        <td className="ant-table-cell"><Checkbox value={tbl.parent.id} onChange={(e)=>{onChangePermission(e, 'table_delete')}} defaultChecked={permissionStatus('table_delete', tbl.parent.id)}></Checkbox></td>
                        <td className="ant-table-cell"><Checkbox value={tbl.parent.id} onChange={(e)=>{onChangePermission(e, 'table_create_by')}} defaultChecked={permissionStatus('table_create_by', tbl.parent.id)}></Checkbox></td>
                        {/* <td className="ant-table-cell"><Checkbox value={tbl.parent.id} onChange={(e)=>{onChangePermission(e, 'table_share')}} defaultChecked={permissionStatus('table_share', tbl.parent.id)}></Checkbox></td> */}
                    </tr>
                    </tbody>
            }

            return <tbody key={tbl.parent.name} className="ant-table-tbody">
                <tr data-row-key={tbl.parent.id} className="ant-table-row ant-table-row-level-0">
                    <td className="ant-table-cell td-parent" colSpan={7}>{tbl.parent.display_name}</td>
                </tr>
                {subPer(tbl.sub)}
            </tbody>
        });
    }

    const changeCheckAllPermission = (e) => {
        setIsCheckAllPermission(e.target.checked);
    }

    function permission() { //  ant-table-small
        return <div className="ant-table ant-table-bordered main-table-permission">
                    <div className="ant-table-container">
                        <div className="ant-table-content">
                            <br/>
                            <Space>
                                <b className='per-title'>Phân quyền quản lý:</b>
                                <Checkbox checked={isCheckAllPermission} onChange={changeCheckAllPermission}>Full quyền</Checkbox>
                            </Space>
                            <table>
                                <thead className="ant-table-thead thead-permission">
                                    <tr>
                                        <th className="ant-table-cell" scope="col">Chức năng</th>
                                        <th className="ant-table-cell" scope="col">Thêm</th>
                                        <th className="ant-table-cell" scope="col">Sửa</th>
                                        <th className="ant-table-cell" scope="col">Xem</th>
                                        <th className="ant-table-cell" scope="col">Xóa</th>
                                        <th className="ant-table-cell" scope="col">Tạo bởi</th>
                                        {/* <th className="ant-table-cell" scope="col">Share</th> */}
                                    </tr>
                                </thead>
                                    {permissionData()}
                            </table>
                        </div>
                    </div>
            </div>;
    }

    function showItemsLg(col) {
        if(!checkConfig(col)) {
            return false;
        }

        if (col.type_edit === "tiny") {
            return (
                <Row layout="vertical" className="main-tiny01">
                    <Col label={col.display_name} className="main-tiny02">
                        <Form.Item rules={checkRule(col)}  label={col.display_name} className="main-tiny03">
                            <TextArea />
                        </Form.Item>
                    </Col>
                </Row>
            );
        }

        if (col.edit === 1 && col.type_edit === "selects_table") {
            return showDataSelectTable(col);
        }

        if (col.type_edit === "permission_list") {
            return permission();
        }
    }

    const listItemsLg = props.columns.map((col) => {
        return showItemsLg(col);
    });

    const onFormLayoutChange = (input) => {
        console.log('input', input);
        const key = Object.keys(input)[0];

        // nếu là table hóa đơn, sau khi chọn KH sẽ get chi nhánh và thẻ
        // todo xxxxxx
        if (props.table.name === 'hoa_don' && key === 'card_gt') {
            console.log('xx', theGT[0].money);
            setTienTheGT(theGT[0].money);
        }
        if (props.table.name === 'hoa_don' && key === 'card_tl') {
            // onchange the lần
            // const serviceData = [
            //     {
            //       key: ,
            //       product_id: 'Mike',
            //       so_luong: 32,
            //       don_gia: '10 Downing Street',
            //       nv_thuc_hien:1,
            //       chiet_khau:1,
            //       note:2
            //     }
            // ];
            console.log('ccc', card);
            const serviceData = card[input[key]].product;
            
            console.log('sssssssss', serviceData);
            setService(serviceData);

        }
        if (props.table.name === 'hoa_don' && key === 'users_id') {
            console.log('formData', formData);
            // formData.setFieldsValue({ card_gt: '' });
            formData.setFieldValue('card_gt', null);
            formData.setFieldValue('card_lt', null);
            setTienTheGT(0);

            input.type_hoa_don_id = props.data.type_hoa_don_id;
            axios.post(route('himalaya.get_card_by_user'), input)
            .then((response) => {
                if (response.data.status_code == 200) {
                    // console.log('cardSelect', response.data.data.cardSelect);
                    // setCard(response.data.data.card);
                    if(props.data.type_hoa_don_id == 1) {
                        // update lại danh sách thẻ gt
                        setTheGT(response.data.data.cardSelect);
                        if(response.data.data.cardSelect[0]) {
                            console.log('cardSelect00', response.data.data.cardSelect[0]);
                        }

                        // get số tiền còn lại của thẻ

                    } else {
                        console.log('type', props.data.type_hoa_don_id);
                        console.log('the LT', response.data.data);
                        // setCard
                        setCard(response.data.data.card);
                        setTheLT(response.data.data.cardSelect);
                    }
                    
                    message.success("Danh sách thẻ đã được cập nhật lại");
                } else {
                    message.error("Lỗi tải danh sách thẻ");
                }
            })
            .catch((error) => {
                console.log('êrr', error);
                message.error("Lỗi không tải được danh sách thẻ");
            });
        }

        // checkall selects
        if(key.search('checkall_') >= 0) {
            const keySelectAll = key.slice(9);
            if(input[key].length > 0) {
                // check all
                const value = props.selectData[keySelectAll].map((val) => {
                    return val.value;
                });
                formData.setFieldValue(keySelectAll, value);
                return;
            }
            // else uncheck
            formData.setFieldValue(keySelectAll, []);
            return;
        }
    };

    function initialValuesForm() {
        if (props.dataId === 0) {
            // return props.request;
            return props.data;
        }
        let data_tmp = props.data;
        props.columns.map((col) => {
            if (col.type_edit === "date" && data_tmp[col.name]) {
                data_tmp[col.name] = dayjs(data_tmp[col.name], DATE_FORMAT);
            }
            if (col.type_edit === "datetime" && data_tmp[col.name]) {
                const zone = new Date().toLocaleTimeString('en-us',{timeZoneName:'short'}).split('GMT')[1]
                data_tmp[col.name] = dayjs(data_tmp[col.name], DATE_TIME_FORMAT).add(zone, 'hour');
            }
            if (col.type_edit === "time" && data_tmp[col.name]) {
                // const zone = new Date().toLocaleTimeString('en-us',{timeZoneName:'short'}).split('GMT')[1]
                data_tmp[col.name] = dayjs(data_tmp[col.name], TIME_FORMAT);
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
                data_tmp[col.name] = selects;
            }
        });
        return data_tmp;
    }

    function tabData() {
        return props.tabs.map((tab) => {
            return {
                key: tab.id,
                label: tab.display_name,
                children: contentTab(tab),
            }
        });
    }

    function contentTab(tab) {
        let have_block = false;

        const content_block = props.blocks.map((block) => {
            if(block.parent_id === tab.id) {
                if(!have_block) {
                    have_block = true;
                }
                return <div key={block.id}>
                            <Divider orientation="left">{block.display_name}</Divider>
                            {contentBlock(block)}
                        </div>

            }
        });

        if(have_block) {
            return content_block;
        }

        return contentBlock(tab)

    }

    function checkShowData() {
        if(props.tabs.length > 0) {
            return <Tabs defaultActiveKey="1" items={tabData()}/>
        }

        if(props.blocks.length > 0) {
            return props.blocks.map((block) => {
                if(checkConfig(block)) {
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

    function contentBlock(block) {
        let content = [],
        contentImage = [],
        contentLong = [];
        for (const [key, col] of Object.entries(props.columns)) {
            if(col.parent_id !== block.id || !checkConfig(col)) {
                continue;
            }

            // check config_show_data

            if (["block_basic"].includes(col.block_type)) {
                const content = props.columns.map((subCol) => {
                    if(subCol.parent_id === col.id) {
                        return showData(subCol, props);
                        return checkShowFormItem(subCol);
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

            // content.push(showData(col, props));
            content.push(checkShowFormItem(col));
        }


        return <Row>
            {content}
            {contentImage}
            {contentLong}
        </Row>
    }

    let name = '';
    if(props.request.type && props.table.config_show_data) {
        name = ' (' + props.table.config_show_data.data[props.request.type] + ')';
    }

    function showDataSelectTable(col) {
        const [loadingBtnAdd, setLoadingBtnAdd] = useState(false);
        const [formSelectTable] = Form.useForm();
        const [isOpenAddSelectTable, setIsOpenAddSelectTable] = useState(props.isShowModalSelectTable);
        const [dataSourceSelectTbl, setDataSourceSelectTbl] = useState(props.selectTbl);
        const [loadingTable, setLoadingTable] = useState(false);
        const [selectTableIndex, setSelectTableIndex] = useState(0);
        const [keyEdit, setKeyEdit] = useState(0);

        const [initialValues, setInitialValues] = useState(null);

        function himalaya_CheckShowTotal() {
            if(props.table.name === 'hoa_don' && ['hoa_don_chi_tiet_id', 'dich_vu_the_lan_id'].includes(col.name)) {
                console.log('himalayaTotalHoaDon', himalayaTotalHoaDon);
                let thanhtoan = himalayaTotalHoaDon.param.thanh_toan;
                console.log('thanhtoan', thanhtoan);
                
                let thanhToanThem = 0;
                if(tienTheGT < thanhtoan) {
                    thanhToanThem = thanhtoan - tienTheGT;
                }

                let tienTrongTheConLai = tienTheGT - thanhtoan;
                if(tienTrongTheConLai < 0) {
                    tienTrongTheConLai = 0;
                }
                return (
                    <div>
                        <Row>
                            <Divider orientation="left">Thanh toán</Divider>
                            <List
                                bordered
                                dataSource={himalayaTotalHoaDon.content}
                                renderItem={(item) => (
                                    <List.Item>
                                    <Typography.Text mark>{item.icon}</Typography.Text> {item.title} {item.value}
                                    </List.Item>
                                )}
                            />

                        </Row>

                        <Row>
                            <p><b className="_success">Tiền còn trong thẻ: {numberFormat(tienTheGT)}</b></p>
                        </Row>
                        <Row>
                            <p><b className="_error">Tiền khách thanh phải toán thêm sau khi trừ thẻ: {numberFormat(thanhToanThem)}</b></p>
                        </Row>
                        <Row>
                            <p><em className="_success">Tiền trong thẻ sau khi thanh toán: <b>{numberFormat(tienTrongTheConLai)}</b></em></p>
                        </Row>
                    </div>
                )
            }

        }

        const onFormSelectTblChange = (input, label) => {
            const key = Object.keys(input)[0];
            console.log('key', key);
            console.log('input', input[key].label);
            
            if(key === 'product_id') {
                console.log('props', props.selectTbl[col.name].select.selectData[key]);
                
                const name = input[key].label;
                const myArray = name.split(" - ");
                console.log('myArray', myArray[2]);
                formSelectTable.setFieldValue('don_gia', myArray[2]);
                formSelectTable.setFieldValue('so_luong', 1);
                changeHoaDon(input);
            }
            

            // check change hoa don
            const checkChangeCol = ['chiet_khau', 'chiet_khau_persen', 'vat', 'thanh_toan','thanh_tien', 'don_gia', 'so_luong', 'vat', 'vat_money'];
            const checkChangeTable = ['hoa_don_chi_tiet_id', 'dich_vu_the_lan_id'];
            if(props.table.name === 'hoa_don' && checkChangeTable.includes(col.name) && checkChangeCol.includes(key)) {
                changeHoaDon(input);
            }
        };

        function changeHoaDon(input) {
            const key = Object.keys(input)[0];
            const don_gia = intval(formSelectTable.getFieldValue('don_gia'));
            const so_luong = intval(formSelectTable.getFieldValue('so_luong'));
            // chiet khau
            let chiet_khau_money = intval(formSelectTable.getFieldValue('chiet_khau_money'));
            let chiet_khau_persen = intval(formSelectTable.getFieldValue('chiet_khau_persen'));
            //vat
            let vat = intval(formSelectTable.getFieldValue('vat'));
            let vat_money = intval(formSelectTable.getFieldValue('vat_money'));

            let thanh_tien =  +don_gia * +so_luong;
            let thanh_toan = thanh_tien;
            // return;
            // Chiet khau
            if(key === 'chiet_khau_persen') {
                chiet_khau_money = (chiet_khau_persen*thanh_tien/100).toFixed(2);
            } else {
                chiet_khau_persen = intval((chiet_khau_money*100/thanh_tien).toFixed(2));
                formSelectTable.setFieldValue('chiet_khau_persen', chiet_khau_persen);
            }
            if(key === 'chiet_khau') {
                chiet_khau_persen = intval((chiet_khau_money*100/thanh_tien).toFixed(2));
                formSelectTable.setFieldValue('chiet_khau_persen', chiet_khau_persen);
            }

            thanh_toan = thanh_toan - chiet_khau_money;

            // VAT
            if(key === 'vat') {
                vat_money = (vat*thanh_tien/100).toFixed(0);
            }

            if(key === 'vat_money' ) {
                vat = (vat_money*100/thanh_tien).toFixed(2);
                formSelectTable.setFieldValue('vat', vat);
            }

            thanh_toan = (+thanh_toan + (+vat_money)).toFixed(0);

            formSelectTable.setFieldValue('chiet_khau', chiet_khau_money);
            formSelectTable.setFieldValue('thanh_tien', thanh_tien);
            formSelectTable.setFieldValue('thanh_toan', thanh_toan);
            formSelectTable.setFieldValue('vat_money', vat_money);
        }

        const onFinishFormSelectTable = (values) => {
            let dataSource_tmp;

            // himalaya - generate voucher
            if(keyEdit === 0) {

                const idx = selectTableIndex - 1;
                setSelectTableIndex(idx);
                values['key'] = idx;
                values['action'] = idx;
                values['index'] = idx;
                const values_tmp = formatValueForm(dataSourceSelectTbl[values.col_name].dataSelectTbl.columns, values);

                if(props.table.name === 'voucher' && col.name === 'voucher_list_id') {
                    const count = +values.count;
                    let code;
                    dataSource_tmp = dataSourceSelectTbl[values.col_name].datas.dataSource;
                    for (let index = 1; index <= count; index++) {
                        code = values.ki_tu_bat_dau + numberFormatBycount(index, values.do_dai) + values.ki_tu_ket_thuc;

                        const key = selectTableIndex - index;
                        // const active = {
                        //     key:2,
                        //     label:'Không',
                        //     title: 'Không',
                        //     value: 2
                        // }
                        dataSource_tmp.push({
                            code:code,
                            count:count,
                            do_dai:values_tmp.do_dai,
                            ki_tu_bat_dau:values_tmp.ki_tu_bat_dau,
                            ki_tu_ket_thuc:values_tmp.ki_tu_ket_thuc,
                            // active:active,
                            key:key,
                            action:key,
                            index:key,
                        });
                    }
                    dataSourceSelectTbl[values.col_name].datas.dataSource = dataSource_tmp;
                    let dataSourceSelectTbl_tmp = cloneDeep(dataSourceSelectTbl);
                    setDataSourceSelectTbl(dataSourceSelectTbl_tmp);

                    endSubmitForm();

                    // save 2 storage
                    saveStorage(values.col_name, dataSource_tmp);

                    return ;
                }

                dataSource_tmp = dataSourceSelectTbl[values.col_name].datas.dataSource;
                dataSource_tmp.push(values_tmp);
            } else {
                values = formatValueForm(dataSourceSelectTbl[values.col_name].dataSelectTbl.columns, values);
                dataSource_tmp = dataSourceSelectTbl[values.col_name].datas.dataSource;
                for (const [key, val] of Object.entries(dataSource_tmp)) {
                    if(val.key === keyEdit) {
                        values['key'] = keyEdit;
                        dataSource_tmp[key] = values;
                        break;
                    }
                }
            }

            // return;
            dataSourceSelectTbl[values.col_name].datas.dataSource = dataSource_tmp;
            let dataSourceSelectTbl_tmp = cloneDeep(dataSourceSelectTbl);
            setDataSourceSelectTbl(dataSourceSelectTbl_tmp);

            endSubmitForm();

            // save 2 storage
            saveStorage(values.col_name, dataSource_tmp);

            //
        };

        function endSubmitForm() {
            setKeyEdit(0);
            formSelectTable.resetFields();
            closeModalSelectTable();
            message.success('Đã thêm thành công');
        }

        function saveStorage(col_name, dataSource_tmp) {
            let storage = {};
            if(sessionStorage.getItem("storage")) {
                storage = parseJson(sessionStorage.getItem("storage"));
            }
            storage[col_name] = dataSource_tmp;
            sessionStorage.setItem("storage", JSON.stringify(storage));
            // hima - update total
            if(props.table.name === 'hoa_don' && col.name === 'hoa_don_chi_tiet_id') {
                const total = setTotalHoaDon(storage, col);
                setHimalayaTotalHoaDon(total);
                formData.setFieldValue('tong_tien', intval(total.param.tong_tien));
                formData.setFieldValue('thanh_toan', intval(total.param.thanh_toan));
                formData.setFieldValue('giam_gia', intval(total.param.giam_gia));
                formData.setFieldValue('vat_money', intval(total.param.vat_money));
            }
            return storage;
        }

        const onOkModalSelectTbl = () => {
            formSelectTable.submit();
        };

        const onCancelModalSelectTbl = () => {
            formSelectTable.resetFields();
            closeModalSelectTable();
            message.error('Đã huỷ');
        };

        const openModalAddSelectTbl = (col) => {
            formSelectTable.setFieldValue('col_name', col.name);
            setKeyEdit(0);
            isOpenAddSelectTable[col.name] = true;
            let dataSourceSelectTbl_tmp = cloneDeep(isOpenAddSelectTable);
            setIsOpenAddSelectTable(dataSourceSelectTbl_tmp);
        };

        const openModalEditSelectTbl = (col, record) => {
            setKeyEdit(record.key);
            for (const [key, val] of Object.entries(props.columnSelectTable[col.name])) {
                // console.log('------------', key, val);
                if(record[val.name]) {
                    if(val.name === 'start_date' || val.name === 'end_date') {
                        formSelectTable.setFieldValue(key, dayjs(record[val.name], DATE_FORMAT));
                        continue;
                    }
                    if(val.type_edit === 'select' && record[val.name].info) {
                        const label = record[val.name].info.label ? record[val.name].info.label : record[val.name].info.name
                        formSelectTable.setFieldValue(key, {
                            disabled: false,
                            key: record[val.name].id,
                            label: label,
                            title: label,
                            value: record[val.name].id
                        });
                        continue;
                    }

                    if(val.type_edit === 'selects' && record[val.name].info) {
                        const slts = [];
                        console.log('selects', record[val.name].info);
                        for(const [k, v] of Object.entries(record[val.name].info)) {
                            slts.push({
                                disabled: false,
                                key: v.value,
                                label: v.label,
                                title: v.label,
                                value: v.value
                            });
                        }
                        console.log('slts', slts);
                        formSelectTable.setFieldValue(key, slts);
                        continue;
                    }

                    // other
                    formSelectTable.setFieldValue(key, record[val.name]);
                }
            }

            formSelectTable.setFieldValue('col_name', col.name);
            //open modal
            isOpenAddSelectTable[col.name] = true;
            let dataSourceSelectTbl_tmp = cloneDeep(isOpenAddSelectTable);
            setIsOpenAddSelectTable(dataSourceSelectTbl_tmp);
        };

        function contentFormSelectTbl(is_edit = 0) {
            if(!dataSourceSelectTbl[col.name].dataSelectTbl) {
                return [];
            }
            const listItems = dataSourceSelectTbl[col.name].dataSelectTbl.columns.map((column) => {
                if(column.edit === 1 && ["image", "image_crop","images", "images_crop"].includes(column.type_edit)) {
                    return ''
                    // return showDataImages_addExpress(column);
                }
                if((keyEdit !== 0 && +column.hide_edit === 1) || (keyEdit === 0 && +column.hide_add === 1)) {
                    return '';
                }

                if (column.block_type === null || column.block_type == '') {
                    return showDataPopup(column, dataSourceSelectTbl[col.name].dataSelectTbl);
                }
            });
            return listItems;
        };

        function configColumnData(column, selectColName) {
            let result = column.filter(function(col) {
                if(col.show_in_list === 0) {
                    return false;
                }
                return true;
              }).map((col) => {
                return {
                    title: col.display_name,
                    dataIndex: col.name,
                    key: col.id,
                    render: (_, record) => {
                        if(['select'].includes(col.type_edit)) {
                            return <div>{showSelect(col, record)} </div>
                        }
            
                        if(['selects'].includes(col.type_edit)) {
                            return <div>{showSelects(record[col.name])}  </div>;
                        }
        
                        if(['date'].includes(col.type_edit)) {
                            return <div>{dayjs(record[col.name]).format(DATE_FORMAT)} </div>;
                        }
    
                        if(['datetime'].includes(col.type_edit)) {
                            return dayjs(record[col.name]).format(DATE_TIME_FORMAT);
                        }
    
                        if(['number'].includes(col.type_edit)) {
                            return record[col.name] ? <div>{numberFormat(record[col.name])} </div> : '';
                        };
    
                        if(['text'].includes(col.type_edit)) {
                            return record[col.name] ? <div>{record[col.name]} </div> : '';
                        };
                        
                        if(['image', 'image_crop'].includes(col.type_edit)) {
                            return <Image className="image-index" src={record[col.name]}></Image>;
                        }
                        
                        if(['images', 'images_crop'].includes(col.type_edit) && record[col.name].avatar) {
                            return <Image className="image-index" src={record[col.name].avatar}></Image>;
                        }
                    },
                };
            });

            function showSelects(item) {
                let result = [];
                if(item && item.info) {
                    for(const [key, val] of Object.entries(item.info)) {
                        result.push(<Tag key={key}>{val.label}</Tag>);
                    }
                }
                return result;
            }

            function onDeleteItemSelectTable(row, colName) {
                const dataSource_tmp = dataSourceSelectTbl[colName].datas.dataSource.filter((val) => {
                    if(val.key !== row.key) {
                        return val;
                    }
                });
                dataSourceSelectTbl[colName].datas.dataSource = dataSource_tmp;
                let dataSourceSelectTbl_tmp = cloneDeep(dataSourceSelectTbl);
                setDataSourceSelectTbl(dataSourceSelectTbl_tmp);
                saveStorage (colName, dataSource_tmp)
            }



            if (props.table.is_show_btn_edit === 1) {
                result.push(
                    {
                        title: '#',
                        dataIndex: 'operation',
                        fixed: 'right',
                        width: 50,
                        render: (_, record) => {
                            return <div>
                                <Button type="button" className="icon-view" onClick={() => openModalEditSelectTbl(col, record)}><EditOutlined /> </Button>
                                <Popconfirm title="Bạn muốn xóa?" onConfirm={() => {onDeleteItemSelectTable(record, selectColName)}} cancelText="Dừng" okText="XÓA">
                                    <Button type="button" className="btn-view" htmlType="button"><DeleteOutlined /> </Button>
                                </Popconfirm>
                            </div>
                        },
                    }
                );
            }
            return result;
        }

        function closeModalSelectTable() {
            let tmp = {};
            for (const [key, value] of Object.entries(isOpenAddSelectTable)) {
                tmp[key] = false;
            }
            setIsOpenAddSelectTable(tmp);
        }

        function formatValueForm(columns, values) {
            for (const [key, val] of Object.entries(columns)) {
                if (val.type_edit === "tiny") {
                    values[val.name] = tinyRefs.current[val.name].getContent();
                }
                if (val.type_edit === "date") {
                    values[val.name] = !values[val.name] ? '' : values[val.name].format(DATE_FORMAT);
                }
                if (val.type_edit === "datetime") {
                    values[val.name] = !values[val.name] ? '' : values[val.name].format(DATE_TIME_FORMAT);
                }

                if (val.type_edit === "select") {
                    if(values[val.name]) {
                        console.log('val', values[val.name]);
                        console.log('dataSourceSelectTbl', dataSourceSelectTbl[col.name].select.selectsData);

                        const select = {
                            id: values[val.name].value,
                            info: values[val.name]
                        }
                        values[val.name] = select;
                    }
                }

                if (val.type_edit === "selects" && values[val.name]) {
                    let item_id = [];
                    for(const[k, v] of Object.entries(values[val.name])) {
                        item_id.push(v.value)
                    }
                    const selects = {
                        info: values[val.name],
                        ids: item_id
                    };
                    values[val.name] = selects;
                }
            }
            return values;
        }

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
                return (
                    <td {...restProps}>{children}</td>
                );
        };

        return (
            <div key={col.id} className='main-select-table'>
            {himalaya_CheckShowTotal()}
            <Row>
                <Modal
                    title={col.display_name}
                    open={isOpenAddSelectTable[col.name]}
                    onOk={onOkModalSelectTbl}
                    onCancel={onCancelModalSelectTbl}
                    confirmLoading={loadingBtnAdd}
                    className='modal-large'
                >
                    <Form
                        layout="vertical"
                        form={formSelectTable}
                        onFinish={onFinishFormSelectTable}
                        autoComplete="off"
                        className='form-modal'
                        initialValues={initialValues}
                        onValuesChange={onFormSelectTblChange}
                    >
                        {/* set name */}
                        <Form.Item className='_hidden' name='col_name' label={'col_name'}>
                            <Input />
                        </Form.Item>
                        {/* content form select */}
                        <Row>
                            {contentFormSelectTbl(col.name)}
                        </Row>
                    </Form>
                </Modal>

                <Divider orientation="left">{col.display_name}</Divider>

                <div>
                    <Button type="primary" onClick={() => openModalAddSelectTbl(col)}>Thêm</Button>
                </div>
                <Table className='table-select'
                    size='small'
                    components={{
                        body: {
                            cell: EditableCell
                        }
                    }}
                    loading={loadingTable}
                    dataSource={dataSourceSelectTbl[col.name].datas.dataSource}
                    columns={configColumnData(props.selectTbl[col.name].dataSelectTbl.columns, col.name)}
                    // rowSelection={rowSelection}
                    rowClassName='editable-row'
                />
            </Row>
            </div>
            );
    }

    function configData(configData) {
        let result = [];
        for (const [key, val] of Object.entries(configData)) {
            result.push( { label: val, value: intval(key) } );
        }
        return result;
    }

    function tabConfigShowData() {
        const onChange = ({ target: { value } }) => {
            setLoading(true);
            router.get('?type=' + value);
        };
        if(props.table.config_show_data && props.table.config_show_data.data) {
            formData.setFieldValue(props.table.config_show_data.column, intval(props.request.type));
            return (
                <Flex vertical gap="middle">
                    <Form.Item name={props.table.config_show_data.column}>
                        <Radio.Group options={configData(props.table.config_show_data.data)} onChange={onChange} optionType="button" buttonStyle="solid" />
                    </Form.Item>
                </Flex>
            );
        }
    }

    function checkShowBtn() {
        if(props.table.name === 'hoa_don') {
            return <Space>
                        <Button type="primary" htmlType="submit" className="btn-error" onClick={()=>{setSubmitRedirect('thanh_toan');   }} loading={loadingBtn}>
                            <FormOutlined />
                            Thanh toán
                        </Button>

                        <Button type="primary" htmlType="submit" onClick={()=>{setSubmitRedirect('detail'); }} loading={loadingBtn}>
                            <CopyOutlined/>
                            Lưu nhap
                        </Button>

                        <Button type="primary" htmlType="submit" className="btn-defaults" onClick={()=>{setSubmitRedirect('huy_hoa_don'); }} loading={loadingBtn}>
                            <FormOutlined />
                            Hủy hóa đơn này
                        </Button>
                    </Space>;
        }
        
        return <Space>
            <Button type="primary" htmlType="submit" onClick={()=>{setSubmitRedirect('detail'); }} loading={loadingBtn}>
                <CopyOutlined/>
                Lưu và xem chi tiết
            </Button>
            <Button type="primary" htmlType="submit" onClick={()=>{setSubmitRedirect('list');   }} loading={loadingBtn}>
                <FormOutlined />
                Lưu và thoát
            </Button>
        </Space>
    }

    return (
        <AdminLayout
            auth={props.auth}
            header={props.table.display_name}
            tables={props.tables}
            current={props.table}
            content={
                <Spin spinning={loading} size="large">
                    {/* form data */}
                    <Form
                        name="basic"
                        layout="vertical"
                        form={formData}
                        onFinish={onFinish}
                        onFinishFailed={onFinishFailed}
                        autoComplete="off"
                        initialValues={initialValuesForm()}
                        onValuesChange={onFormLayoutChange}
                    >

                        <Divider orientation="right">
                            {props.table.display_name}
                            <span className='space02'>|</span>
                            <Link className='divider-thoat' href={route('data.index', [props.table.id])}><RollbackOutlined />Thoát</Link>
                        </Divider>

                            {tabConfigShowData()}

                            {/* show form */}
                            {checkShowData()}
                        <div>
                            <p className="_red">{error}</p>
                            <br/>
                            { checkShowBtn() }
                        </div>
                    </Form>
                </Spin>
            }
        />
    );
}
