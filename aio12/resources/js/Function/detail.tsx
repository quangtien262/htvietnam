import React, { useState } from "react";
import {
    Col,
    Row,
    Divider,
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
    Radio,
    Popconfirm,
    Table,
    Image,
    Tag, Carousel
} from "antd";
import { useForm, router, Link } from "@inertiajs/react";
import dayjs from "dayjs";
import cloneDeep from 'lodash/cloneDeep';
import { PlusCircleOutlined, ArrowRightOutlined, EyeOutlined, DeleteOutlined, UploadOutlined   } from "@ant-design/icons";
import axios from "axios";
const { TextArea } = Input;
import {DATE_FORMAT, DATE_TIME_FORMAT} from './constant';
import { showDataPopup, checkRule } from "./data";
import { numberFormat, numberFormatBycount, nl2br, toLowerCaseNonAccentVietnamese, parseJson, inArray, numberFormat02 } from './common';
import {  showSelect, showSelects , formatValueForm } from './selects_table';

import { chamCongCellRender } from './calendar';

export function permissionData(tables, permissionList) {
    function permissionStatus(type, id) {
        let key = Object.keys(permissionList[type]).find(
            (key) => permissionList[type][key] === id
        );
        if (key) {
            return 1;
        }
        return 0;
    }

    function subPer(sub) {
        return sub.map((tbl) => {
            return (
                <tr
                    key={tbl.id}
                    data-row-key={tbl.id}
                    className="ant-table-row ant-table-row-level-0"
                >
                    <td className="ant-table-cell">
                        <Checkbox
                            onChange={(e) => {
                                onChangePermission(e, "table_all");
                            }}
                        >
                            {tbl.display_name}
                        </Checkbox>
                    </td>
                    <td className="ant-table-cell">
                        <Checkbox
                            value={tbl.id}
                            checked={permissionStatus("table_add", tbl.id)}
                        ></Checkbox>
                    </td>
                    <td className="ant-table-cell">
                        <Checkbox
                            value={tbl.id}
                            checked={permissionStatus("table_edit", tbl.id)}
                        ></Checkbox>
                    </td>
                    <td className="ant-table-cell">
                        <Checkbox
                            value={tbl.id}
                            checked={permissionStatus("table_delete", tbl.id)}
                        ></Checkbox>
                    </td>
                    <td className="ant-table-cell">
                        <Checkbox
                            value={tbl.id}
                            checked={permissionStatus("table_view", tbl.id)}
                        ></Checkbox>
                    </td>
                    <td className="ant-table-cell">
                        <Checkbox
                            value={tbl.id}
                            checked={permissionStatus(
                                "table_create_by",
                                tbl.id
                            )}
                        ></Checkbox>
                    </td>
                    {/* <td className="ant-table-cell"><Checkbox value={tbl.id} checked={permissionStatus('table_share', tbl.id)}></Checkbox></td> */}
                </tr>
            );
        });
    }
    return tables.map((tbl) => {
        if (tbl.sub.length === 0) {
            return (
                <tbody key={tbl.parent.name} className="ant-table-tbody">
                    <tr
                        key={tbl.parent.name}
                        data-row-key={tbl.id}
                        className="ant-table-row ant-table-row-level-0"
                    >
                        <td className="ant-table-cell">
                            {tbl.parent.display_name}
                        </td>
                        <td className="ant-table-cell">
                            <Checkbox
                                value={tbl.parent.id}
                                checked={permissionStatus(
                                    "table_add",
                                    tbl.parent.id
                                )}
                            ></Checkbox>
                        </td>
                        <td className="ant-table-cell">
                            <Checkbox
                                value={tbl.parent.id}
                                checked={permissionStatus(
                                    "table_edit",
                                    tbl.parent.id
                                )}
                            ></Checkbox>
                        </td>
                        <td className="ant-table-cell">
                            <Checkbox
                                value={tbl.parent.id}
                                checked={permissionStatus(
                                    "table_view",
                                    tbl.parent.id
                                )}
                            ></Checkbox>
                        </td>
                        <td className="ant-table-cell">
                            <Checkbox
                                value={tbl.parent.id}
                                checked={permissionStatus(
                                    "table_delete",
                                    tbl.parent.id
                                )}
                            ></Checkbox>
                        </td>

                        <td className="ant-table-cell">
                            <Checkbox
                                value={tbl.parent.id}
                                checked={permissionStatus(
                                    "table_create_by",
                                    tbl.parent.id
                                )}
                            ></Checkbox>
                        </td>
                        {/* <td className="ant-table-cell"><Checkbox value={tbl.parent.id} checked={permissionStatus('table_share', tbl.parent.id)}></Checkbox></td> */}
                    </tr>
                </tbody>
            );
        }

        return (
            <tbody key={tbl.parent.name} className="ant-table-tbody">
                <tr
                    data-row-key={tbl.parent.id}
                    className="ant-table-row ant-table-row-level-0"
                >
                    <td className="ant-table-cell td-parent" colSpan={7}>
                        {tbl.parent.display_name}
                    </td>
                </tr>
                {subPer(tbl.sub)}
            </tbody>
        );
    });
}

export function showDataText(col, data, prop) {
    const typeEdit = col.type_edit;
    let result;
    if(!data || !data[col.name]) {
        return <Descriptions.Item key={col.name} label={col.display_name}></Descriptions.Item>
    }

    function checkCascader(value, check) {
        return value === check;
    }

    switch (typeEdit) {
        case 'permission_list':
            break;
        case 'date':
            result =  dayjs(data[col.name]).format('DD/MM/YYYY');
            break;
        case 'datetime':
            const zone = new Date().toLocaleTimeString('en-us',{timeZoneName:'short'}).split('GMT')[1]
            result =  dayjs.tz(data[col.name]).add(zone, 'hour').format("YYYY-MM-DD HH:mm:ss");
            break;
        case 'number':
            result = numberFormat(data[col.name]);
            break;
        case 'select':
            result = '';
            if(data[col.name] && data[col.name].info && data[col.name].info.name) {
                result = data[col.name].info.name;
            }
            break;
        case 'tags':
        case 'selects':
            if(prop.selectsData[col.name]) {
                let selects;
                try {
                    if(data[col.name] && data[col.name].info) {
                        result = data[col.name].info.map((select) => {
                            return <Tag key={select.value}>{select.label}</Tag>;
                        });
                    }
                } catch (error) {
                }
            }
            break;
        case 'text':
            result = data[col.name];
            break;
        case 'textarea':
            if(data && data[col.name]) {
                result = <div dangerouslySetInnerHTML={{ __html: nl2br(data[col.name]) }} />;
            }
            break;
        case 'cascader':
            if(data && data[col.name]) {
                const colName = prop.columns.filter(function(val){
                    if(val.name === data[col.name][0]) {
                        return val;
                    }
                });                
                result = '';
                if(colName.length > 0) {
                    result = "["+colName[0].display_name+"]" + data[col.name][1].info.name;
                }
            }
            break;

        default:
            result = data[col.name];
            break;
    }
    return <Descriptions.Item key={col.name} label={col.display_name}>{result}</Descriptions.Item>
}

function showDataImages(col, data) {
    const contentStyle = {
        margin: 0,
        // height: '200px',
        color: '#fff',
        textAlign: 'center',
    };
    // const data = props.data;
    if(!data[col.name]) {
        return '';
    }
    const imgs = data[col.name];
    if(imgs == false) {
        return <div className='main-carousel'>
                    <Carousel autoplay={true} effect='fade'>
                        <div>
                            <h3><Image width={'100%'} src={data[col.name]}/></h3>
                        </div>
                    </Carousel>
                </div>
    }
    return <div key={col.id} className='main-carousel'>
                <Carousel autoplay={true} effect='fade'>
                    {imgs['images'].map((img, idx) => {
                        return <div key={'main-img-' + idx}>
                                    <h3 style={contentStyle}><Image key={col.id} width={'100%'} src={img}/></h3>
                                </div>
                    })}
                </Carousel>
            </div>
}

function showDataImage(col, data) {
    // const data = props.data;
    if(!data[col.name]) {
        return '';
    }
    return <div className='main-carousel'>
                <Carousel autoplay={true} effect='fade'>
                    <div>
                        <h3><Image width={'100%'} src={data[col.name]}/></h3>
                    </div>
                </Carousel>
            </div>
}


export function checkShowData(prop) {
    const [isOpenAddSelectTable, setIsOpenAddSelectTable] = useState(prop.isShowModalSelectTable);
    const [loadingBtnAdd, setLoadingBtnAdd] = useState(false);
    const [dataSourceSelectTbl, setDataSourceSelectTbl] = useState(prop.selectTbl);

    const [formSelectTable] = Form.useForm();

    const [chamCong, setChamCong] = useState(!prop.data.cham_cong ? {}: JSON.parse(prop.data.cham_cong));

    const listImages = prop.columns.map((col) => {
        if(col.type_edit === 'images' || col.type_edit === 'images_crop') {
            return <Descriptions.Item key={col.name} label={col.display_name}>{showDataImages(col, prop.data)}</Descriptions.Item>
        }
        return false;
    })

    const listImage = prop.columns.map((col) => {
        if(col.type_edit === 'image' || col.type_edit === 'image_crop') {
            return <Descriptions.Item key={col.id} label={col.display_name}> <Image width={200} src={prop.data[col.name]}/></Descriptions.Item>
        }
        return false;
    });

    const listItemsLg = prop.columns.map((col) => {
        return contentLg(col);
    });

    const listItems = prop.columns.map((col) => {
        const ignoreTypes = [
            'ckeditor',
            'tiny',
            'summernote',
            'image',
            'images',
            'image_crop',
            'images_crop',
            'calendar_cham_cong',
            'calendar_lich_hen',
            'selects_table',
        ]
        if(ignoreTypes.includes(col.type_edit)) {
            return false;
        }
        if(col.edit === 1) {
            return showDataText(col, prop.data, prop)
        }
    });

    function closeModalSelectTable() {
        let tmp = {};
        for (const [key, value] of Object.entries(isOpenAddSelectTable)) {
            tmp[key] = false;
        }
        setIsOpenAddSelectTable(tmp);
    }

    function onDeleteItemSelectTable(record, selectColName) {
        axios.post(route('data.select_table.delete'),
        {
            select_table_id: record.id,
            id: prop.data.id,
            col_name: selectColName,
            table_id: prop.table.id
        })
        .then(response => {
            if (response.data.status_code == 200) {
                setDataSourceSelectTbl(response.data.data.selectTbl);
                message.success('Đã xóa');
            } else {
                message.error('Xóa thất bại');
            }
        })
        .catch(error => {
            message.error('Có lỗi xảy ra');
        });
    }

    function configColumnData(column, selectColName, table) {
        let result = column.filter(function(col) {
            if(col.show_in_list === 0) {
                return false;
            }
            return true;
          }).map((col02) => {
            return {
                title: col02.display_name,
                dataIndex: col02.name,
                key: col02.id,
                render: (_, record) => {
                    if(['select'].includes(col02.type_edit)) {
                        return <div>{showSelect(col02, record)} </div>
                    }
        
                    if(['selects'].includes(col02.type_edit)) {
                        return <div>{showSelects(record[col02.name])}  </div>;
                    }
    
                    if(['date'].includes(col02.type_edit)) {
                        return <div>{dayjs(record[col02.name]).format(DATE_FORMAT)} </div>;
                    }

                    if(['datetime'].includes(col02.type_edit)) {
                        return dayjs(record[col02.name]).format(DATE_TIME_FORMAT);
                    }

                    if(['number'].includes(col02.type_edit)) {
                        return record[col02.name] ? <div>{numberFormat(record[col02.name])} </div> : '';
                    };

                    if(['text'].includes(col02.type_edit)) {
                        return record[col02.name] ? <div>{record[col02.name]} </div> : '';
                    };
                    
                    if(['image', 'image_crop'].includes(col02.type_edit)) {
                        return <Image className="image-index" src={record[col02.name]}></Image>;
                    }
                    
                    if(['images', 'images_crop'].includes(col02.type_edit) && record[col02.name].avatar) {
                        return <Image className="image-index" src={record[col02.name].avatar}></Image>;
                    }
                    if(col02.type_edit === 'tiny' && record[col02.name]) {
                        return <div dangerouslySetInnerHTML={{ __html: record[col02.name] }} />;
                    }

                    if(['cascader'].includes(col02.type_edit) && record[col02.name]) {
                        console.log('ccc', record[col02.name]);
                        let result = '';
                        try {
                           result = record[record.cascader].info.name
                        } catch (error) {
                            console.log('cascader', error);
                        }
                        return result;
                    }
                },
            };
        });

        function checkShowBtnView(selectColName, record) {
            if(record.key > 0) {
                return <div>
                    <a target="_blank" rel="noopener noreferrer" href={route('data.detail', [prop.selectTbl[selectColName].dataSelectTbl.table.id,record.key])}>
                        <Button type="button" className="btn-view"><EyeOutlined /> </Button>
                    </a>
                </div>
            }
        }

        if (table.is_show_btn_edit === 1) {
            result.push(
                {
                    title: 'Thao tác',
                    dataIndex: 'operation',
                    fixed: 'right',
                    width: 50,
                    render: (_, record) => {
                        return <Space>
                            {/* delete selects_table */}
                            {checkShowBtnView(selectColName, record)}
                            <Popconfirm title="Bạn muốn xóa?" onConfirm={() => {onDeleteItemSelectTable(record, selectColName)}} cancelText="Dừng" okText="XÓA">
                                <Button  className='btn-delete' type="default" htmlType="button"><DeleteOutlined /></Button>
                            </Popconfirm>
                        </Space>
                    },
                }
            );
        }
        return result;
    }

    function contentLg(col) {
        const onFinishFormSelectTable = (values) => {
            const idx = selectTableIndex - 1;
            setSelectTableIndex(idx);

            values['key'] = idx;
            values['action'] = idx;
            values['index'] = idx;

            setDataSourceSelectTbl(
                [
                    ...dataSourceSelectTbl,
                    values
                ]
            );
            setIsOpenAddSelectTable(false);
            message.success('Đã thêm thành công');
        };

        const onOkModalSelectTbl = () => {
            formSelectTable.submit();
        };
        const onCancelModalSelectTbl = () => {
            formSelectTable.resetFields();
            closeModalSelectTable();
            message.error('Đã huỷ');
        };
        const cellRender = (current) => {
            if (chamCong.length === 0) {
                return "";
            }
            const cong = chamCong[current.format("YYYYMMDD")];
            if (!cong) {
                return "";
            }
            const type = cong.type;
    
            return chamCongCellRender(type, cong);
        };

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
                return (
                    <td {...restProps}>{children}</td>
                );
        };

        if(['tiny'].includes(col.type_edit) && prop.data[col.name]) {
            return <Descriptions key={col.id} bordered layout="vertical">
                        <Descriptions.items label={col.display_name}>
                            <div dangerouslySetInnerHTML={{ __html: prop.data[col.name] }} />
                        </Descriptions.items>
                    </Descriptions>
        }
        // Chấm công
        if(['calendar_cham_cong', 'calendar_lich_hen'].includes(col.type_edit)) {
            return <Calendar
                        mode="month"
                        locale="vi_VN"
                        value={dayjs(prop.data.year + '-' + numberFormat02(prop.data.month, 2) + '-01')}
                        key={col.name}
                        dateCellRender={cellRender}
                        // onSelect={onSelectCalendarChamCong}
                    />
        }

        // permission
        if(col.type_edit === 'permission_list') {
            return permission();
        }
        if (col.show_in_detail === 1 && col.type_edit === "selects_table" ) {
            return <Row>
                <Modal
                    title={col.display_name}
                    open={isOpenAddSelectTable[col.name]}
                    onOk={onOkModalSelectTbl}
                    onCancel={onCancelModalSelectTbl}
                    confirmLoading={loadingBtnAdd}
                    className='modal-large'
                >
                    <Form
                        name="basic"
                        layout="vertical"
                        form={formSelectTable}
                        onFinish={onFinishFormSelectTable}
                        autoComplete="off"
                        className='form-modal'
                    >
                        <Form.Item className='_hidden' name='col_name'>
                            <Input />
                        </Form.Item>

                        {/* content form select */}
                        <Row>
                            {/* {contentFormSelectTbl(col.name, dataSourceSelectTbl[col.name].dataSelectTbl)} */}
                        </Row>
                    </Form>
                </Modal>

                <Divider orientation="left">{col.display_name}</Divider>

                {/* Thêm selects_table */}
                {/* <div>
                    <Button type="primary" onClick={() => openModalAddSelectTbl(col)}>Thêm</Button>
                </div> */}

                {/* table select_table */}
                <Table
                    size='large'
                    components={{
                        body: {
                            cell: EditableCell
                        }
                    }}
                    // loading={loadingTable}
                    dataSource={dataSourceSelectTbl[col.name].datas.dataSource}
                    columns={configColumnData(prop.selectTbl[col.name].dataSelectTbl.columns, col.name, prop.table)}
                    // rowSelection={rowSelection}
                    rowClassName='editable-row'
                    className='table-selects'
                />
            </Row>;
        }
    }

    function permission() {
        return <div className="main-table-permission ant-table">
                    <div className="ant-table-container">
                        <div className="ant-table-content ant-table-body ant-table-header">
                            <br/>
                            <Space>
                                <b className='per-title'>Phân quyền quản lý:</b>
                            </Space>
                            <table>
                                <thead className="thead-permission">
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
                                    {permissionData(prop.tablesPermission, prop.userPermission)}
                            </table>
                        </div>
                    </div>
            </div>;
    }

    function tabData() {
        return prop.tabs.map((tab) => {
            return {
                key: tab.id,
                label: tab.display_name,
                children: contentTab(tab),
            }
        });
    }

    function contentTab(tab) {
        let have_block = false;
        const content_block = prop.blocks.map((block) => {
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

        return ''
    }

    function contentBlock(block) {
        let content = [],
        contentImage = [],
        contentLong = [];
        for (const [key, col] of Object.entries(prop.columns)) {
            if(col.parent_id !== block.id) {
                continue;
            }

            if (["block_basic"].includes(col.block_type)) {
                const content = prop.columns.map((subCol) => {
                    if(subCol.parent_id === col.id) {
                        return showDataText(subCol, prop.data, prop);
                    }
                });
                continue;
            }

            if (["images", "images_crop"].includes(col.type_edit)) {
                contentImage.push(showDataImages(col, prop.data));
                continue;
            }

            if (["image", "image_crop"].includes(col.type_edit)) {
                contentImage.push(showDataImage(col, prop.data));
                continue;
            }

            if (["tiny", "calendar_cham_cong", "permission_list", "selects_table"].includes(col.type_edit)) {
                contentLong.push(contentLg(col));
                continue;
            }
            content.push(showDataText(col, prop.data, prop));
        }


        return <Row>
                    <Descriptions title="" layout="vertical" bordered>
                    {content}
                    </Descriptions>
                    {contentImage}
                    {contentLong}
                </Row>;
    }

    if(prop.tabs.length > 0) {
        return <Tabs defaultActiveKey="1" items={tabData()}/>
    }

    if(prop.blocks.length > 0) {
        return prop.blocks.map((block) => {
            return <Row key={block.id}>
                        <Divider orientation="left">{block.display_name}</Divider>
                        {contentBlock(block)}
                    </Row>
        });
    }

    return <Row gutter={24}>
                { !prop.isImage ? '':<Col><Descriptions bordered layout="vertical">{listImage}</Descriptions></Col> }
                { !prop.isImages ? '' : <Col span={6}>{listImages}</Col> }
                <Col><Descriptions bordered layout="vertical">{listItems}</Descriptions></Col>
                <br/>
                <Col xs={{ span: 24 }} sm={{ span: 12 }} md={{ span: 24 }} lg={{ span: 24 }} >
                    {listItemsLg}
                </Col>
            </Row>
}


export function checkShowDataLang(prop) {

    function listImages() {
        return prop.columns.map((col) => {
            if(col.type_edit === 'images' || col.type_edit === 'images_crop') {
                return <Descriptions.Item key={col.name} label={col.display_name}>{showDataImages(col, prop.data)}</Descriptions.Item>
            }
            return false;
        })
    }


    function listImage() {
        return prop.columns.map((col) => {
            if(col.type_edit === 'image' || col.type_edit === 'image_crop') {
                return <Descriptions.Item key={col.id} label={col.display_name}> <Image width={200} src={prop.data[col.name]}/></Descriptions.Item>
            }
            return false;
        });
    }

    function listItemsLg() {
        return prop.columns.map((col) => {
            return contentLg(col);
        });
    }


    function listItems() {
        return prop.columns.map((col) => {
            const ignoreTypes = [
                'ckeditor',
                'tiny',
                'summernote',
                'image',
                'images',
                'image_crop',
                'images_crop',
                'calendar_cham_cong',
                'calendar_lich_hen',
                'selects_table',
            ]
            if(ignoreTypes.includes(col.type_edit)) {
                return false;
            }
            if(col.edit === 1) {
                return showDataText(col, prop.data, prop)
            }
        });
    }

    function configColumnData(column, selectColName, table) {
        let result = column.filter(function(col) {
            if(col.show_in_list === 0) {
                return false;
            }
            return true;
          }).map((col) => {

            if(['image', 'image_crop'].includes(col.type_edit)) {
                return {
                    title: col.display_name,
                    dataIndex: col.name,
                    key: col.dataIndex,
                    render: (_, record) => {
                        return <Image src={record[col.name]}></Image>;
                    },
                };
            }

            if(['select'].includes(col.type_edit)) {
                return {
                    title: col.display_name,
                    dataIndex: col.name,
                    key: col.dataIndex,
                    render: (_, record) => {
                        if(col.is_view_detail === 1) {
                            return <a target='new' href={route('data.detail', [col.table_id, record.key])}>{dataSourceSelectTbl[selectColName].select.selectData[col.name][record[col.name]] }</a>;
                        }
                        return <span>{dataSourceSelectTbl[selectColName].select.selectData[col.name][record[col.name]] }</span>;
                    },
                };
            }

                return {
                    title: col.display_name,
                    dataIndex: col.name,
                    key: col.id,
                    render: (_, record) => {
                        if(col.is_view_detail === 1) {
                            return <a target='new' href={route('data.detail', [col.table_id, record.key])}>{record[col.name]}</a>;
                        }
                        return record[col.name];
                    },
                };
        });

        if (table.is_show_btn_edit === 1) {
            result.push(
                {
                    title: 'Thao tác',
                    dataIndex: 'operation',
                    fixed: 'right',
                    width: 50,
                    render: (_, record) => {
                        return <Space>
                            <Button className='btn-view' type="default" htmlType="button"><a target='new' href={route('data.detail', [column[0].table_id, record.key])}><EyeOutlined /></a></Button>
                            <Popconfirm title="Bạn muốn xóa?" onConfirm={() => {onDeleteItemSelectTable(record, selectColName)}} cancelText="Dừng" okText="XÓA">
                                <Button  className='btn-delete' type="default" htmlType="button"><DeleteOutlined /></Button>
                            </Popconfirm>
                        </Space>
                    },
                }
            );
        }
        return result;
    }

    function contentLg(col) {
        const onFinishFormSelectTable = (values) => {
            const idx = selectTableIndex - 1;
            setSelectTableIndex(idx);

            values['key'] = idx;
            values['action'] = idx;
            values['index'] = idx;

            setDataSourceSelectTbl(
                [
                    ...dataSourceSelectTbl,
                    values
                ]
            );
            setIsOpenAddSelectTable(false);
            message.success('Đã thêm thành công');
        };

        const onOkModalSelectTbl = () => {
            formSelectTable.submit();
        };
        const onCancelModalSelectTbl = () => {
            formSelectTable.resetFields();
            closeModalSelectTable();
            message.error('Đã huỷ');
        };

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
                return (
                    <td {...restProps}>{children}</td>
                );
        };

        if(['tiny'].includes(col.type_edit) && prop.data[col.name]) {
            return <Descriptions key={col.id} bordered layout="vertical">
                        <Descriptions.items label={col.display_name}>
                            <div dangerouslySetInnerHTML={{ __html: prop.data[col.name] }} />
                        </Descriptions.items>
                    </Descriptions>
        }
        // Chấm công
        // if(['calendar_cham_cong', 'calendar_lich_hen'].includes(col.type_edit)) {
        //     return <Calendar
        //                 mode="month"
        //                 locale="vi_VN"
        //                 value={dayjs(prop.data.year + '-' + numberFormat02(prop.data.month, 2) + '-01')}
        //                 key={col.name}
        //                 dateCellRender={cellRender}
        //                 // onSelect={onSelectCalendarChamCong}
        //             />
        // }
    }

    function tabData() {
        return prop.tabs.map((tab) => {
            return {
                key: tab.id,
                label: tab.display_name,
                children: contentTab(tab),
            }
        });
    }

    function contentTab(tab) {
        let have_block = false;
        const content_block = prop.blocks.map((block) => {
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

        return ''
    }

    function contentBlock(block) {
        let content = [],
        contentImage = [],
        contentLong = [];
        for (const [key, col] of Object.entries(prop.columns)) {
            if(col.parent_id !== block.id) {
                continue;
            }

            if (["block_basic"].includes(col.block_type)) {
                const content = prop.columns.map((subCol) => {
                    if(subCol.parent_id === col.id) {
                        return showDataText(subCol, prop.data, prop);
                    }
                });
                continue;
            }

            if (["images", "images_crop"].includes(col.type_edit)) {
                contentImage.push(showDataImages(col, prop.data));
                continue;
            }

            if (["image", "image_crop"].includes(col.type_edit)) {
                contentImage.push(showDataImage(col));
                continue;
            }

            if (["tiny", "calendar_cham_cong", "permission_list", "selects_table"].includes(col.type_edit)) {
                contentLong.push(contentLg(col));
                continue;
            }
            content.push(showDataText(col, prop.data, prop));
        }


        return <Row>
                    <Descriptions title="" layout="vertical" bordered>
                    {content}
                    </Descriptions>
                    {contentImage}
                    {contentLong}
                </Row>;
    }

    if(prop.tabs.length > 0) {
        return <Tabs defaultActiveKey="1" items={tabData()}/>
    }

    if(prop.blocks.length > 0) {
        return prop.blocks.map((block) => {
            return <Row key={block.id}>
                        <Divider orientation="left">{block.display_name}</Divider>
                        {contentBlock(block)}
                    </Row>
        });
    }

    return <Row gutter={24}>
                { !prop.isImage ? '':<Col><Descriptions bordered layout="vertical">{listImage()}</Descriptions></Col> }
                { !prop.isImages ? '' : <Col span={6}>{listImages()}</Col> }
                <Col><Descriptions bordered layout="vertical">{listItems()}</Descriptions></Col>
                <br/>
                <Col xs={{ span: 24 }} sm={{ span: 12 }} md={{ span: 24 }} lg={{ span: 24 }} >
                    {listItemsLg()}
                </Col>
            </Row>
}



