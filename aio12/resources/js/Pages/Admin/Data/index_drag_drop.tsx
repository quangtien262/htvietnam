import React, { useState, useEffect  } from 'react';
import AdminLayout from '@/layouts/AdminLayout';
import { Button, Table, message, Modal, Form, Input,InputNumber, Popconfirm, Typography, Select, Radio, Card, Tree, Space  } from 'antd';
import { PlusCircleOutlined } from '@ant-design/icons';
import { routeQLKho } from "../../../Function/config_route";
import { Link } from '@inertiajs/react';
import axios from 'axios';
import { router } from '@inertiajs/react';
import { onDrop } from "../../../Function/common";
import {itemMenu} from "../../../Function/config_route";

export default function index(props) {

    const [loadingBtn, setLoadingBtn] = useState(false);
    const [gData, setGData] = useState(props.dataSource);
    const [checkbox, setCheckbox] = useState([]);

    const onSelect = (id) => {
        router.get(route('data.edit', [props.tableId, id]));
    };

    const onDragEnter = (info) => {
    };

    const onCheck = (checkedKeys, info) => {
        setCheckbox(checkedKeys);
    };

    const deletes = () => {
        setLoadingBtn(true);
        axios.post(route('data.delete',[props.table.id]),{
            ids: checkbox,
            is_drag_drop: 1
        }).then(response => {
            message.success('Đã xóa');
            setLoadingBtn(false);
            setGData(response.data.data);
        })
        .catch(error => {
            setLoadingBtn(false);
            message.error('Có lỗi xảy ra');
        });
    }

    const tab = props.tableTab.map((tab) => {
        let active = 'ht-tab-item';
        if(tab[props.tab_col_name] === props.searchData[props.table.tab_table_name]) {
            active = 'active';
        }
        return <Link className={active} href={ '?' + props.table.tab_table_name + '=' + tab[props.tab_col_name] }>{tab.display_name }</Link>
    });

    function onDropData(info) {
        const result = onDrop(info, gData);
        setGData(result);

        axios.post(route('data.update_sort_order', [props.tableId]),{
            data:JSON.stringify(result)
        }).then(response => {
            message.success('Cập nhật thứ tự thành công');
        }).catch(error => {
            message.error('Cập nhật thứ tự thất bại');
        });
    }

    const btnAddNew = <Link href={route('data.create', [props.table.id, props.searchData])}>
                            <Button type="primary" className="_right">
                                <PlusCircleOutlined />Thêm mới
                            </Button>
                    </Link>;

    return (
        <AdminLayout
            auth={props.auth}
            header={props.table.display_name}
            tables={itemMenu(props.table.name)}
            current={props.table}
            content={
                <div>
                    <p className='current-tab'><b>{ props.table.display_name }</b></p>
                    <hr/>
                    <br/>

                    <p className='current-tab'>
                        <Link className={props.searchData[props.table.tab_table_name] && props.searchData[props.table.tab_table_name] === 'all' ? 'active':''} href={ route('data.index', [props.table.id]) }>Tất cả</Link>
                        { tab }
                    </p>
                    <hr/>

                    <Card type="inner"
                            title={
                                <div>
                                    <Button loading={loadingBtn}
                                        disabled={checkbox.length > 0 ? false:true}
                                        type="primary"
                                        onClick={deletes}
                                        htmlType="button">
                                        Xóa {checkbox.length > 0 ? '('+checkbox.length+')':''}
                                    </Button>
                                </div>
                            }
                            extra={
                                <div>
                                    {props.searchData[props.table.tab_table_name] && props.searchData[props.table.tab_table_name] === 'all' ? '':btnAddNew}
                                </div>
                            }>

                        <Tree
                            className="draggable-tree"
                            draggable
                            blockNode
                            checkable
                            defaultExpandedKeys={props.expandedKeys}
                            onDragEnter={onDragEnter}
                            onDrop={(info) => onDropData(info)}
                            treeData={gData}
                            onSelect={onSelect}
                            onCheck={onCheck}
                        />
                    </Card>
                </div>
            }
        />
    );
}
