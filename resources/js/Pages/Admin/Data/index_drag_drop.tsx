import React, { useState, useEffect } from 'react';
import AdminLayout from '@/layouts/AdminLayout';
import { Button, message, Card, Tree, TreeDataNode, Modal } from 'antd';
import { PlusCircleOutlined } from '@ant-design/icons';
import { routeQLKho } from "../../../Function/config_route";
import { Link } from '@inertiajs/react';
import axios from 'axios';
import { router } from '@inertiajs/react';
import { onDrop } from "../../../Function/common";
import { itemMenu } from "../../../Function/config_route";
import { contentFormData } from '../../../components/comp_data';

export default function index(props: any) {
    console.log('props.dataSource', props.dataSource);

    const [loadingBtn, setLoadingBtn] = useState(false);
    const [gData, setGData] = useState(props.dataSource);
    // const [gData, setGData] = useState(generateData(2));
    const [checkbox, setCheckbox] = useState([]);

    const [dataAction, setDataAction] = useState([]);
    const [isOpenFormEdit, setIsOpenFormEdit] = useState(false);
    const [fileList, setFileList] = useState([]);

    const onSelect = (id) => {

        if (props.table.form_data_type === 1) {
            return router.get(route('data.edit', { tableId: props.tableId, dataId: id, p: props.p }));
        }
        editData(id)
        
    };

    const onDragEnter = (info) => {
    };

    const onCheck = (checkedKeys, info) => {
        setCheckbox(checkedKeys);
    };

    const deletes = () => {
        setLoadingBtn(true);
        axios.post(route('data.delete', [props.table.id]), {
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
        if (tab[props.tab_col_name] === props.searchData[props.table.tab_table_name]) {
            active = 'active';
        }
        return <Link className={active} href={'?' + props.table.tab_table_name + '=' + tab[props.tab_col_name]}>{tab.display_name}</Link>
    });

    function onDropData(info) {
        const result = onDrop(info, gData);
        setGData(result);

        axios.post(route('data.update_sort_order', [props.tableId]), {
            data: JSON.stringify(result)
        }).then(response => {
            message.success('Cập nhật thứ tự thành công');
        }).catch(error => {
            message.error('Cập nhật thứ tự thất bại');
        });
    }

    function addNewData() {
        setIsOpenFormEdit(true);
        axios
            .post(route("data.api.info", { tableId: props.table.id, dataId: 0, p: props.p }))
            .then((response) => {
                if (response.data.status_code == 200) {
                    setDataAction(response.data.data);
                    setFileList(response.data.data.imagesData);
                } else {
                    message.error("Lỗi tải dữ liệu cần sửa");
                }
            })
            .catch((error) => {
                message.error("Lỗi tải dữ liệu cần sửa");
            });
    }

    function editData(id:number) {
        setIsOpenFormEdit(true);
        axios
            .post(route("data.api.info", { tableId: props.table.id, dataId: id, p: props.p }))
            .then((response) => {

                if (response.data.status_code == 200) {
                    setDataAction(response.data.data);
                    setFileList(response.data.data.imagesData);
                } else {
                    message.error("Lỗi tải dữ liệu cần sửa");
                }
            })
            .catch((error) => {
                message.error("Lỗi tải dữ liệu cần sửa");
            });
    }

    function btnAddNew() {
        if (props.table.form_data_type === 1) {
            return <Button type="primary" onClick={() => {
                router.get(route('data.create', { tableId: props.tableId, p: props.p }));
            }}><PlusCircleOutlined /> Thêm mới</Button>
        }
        return <Button type="primary" onClick={() => addNewData()}>
            <PlusCircleOutlined />
            Thêm mới
        </Button>
    }

    return (
        <AdminLayout
            auth={props.auth}
            header={props.table.display_name}
            content={
                <div>
                    <Modal
                        title={""}
                        open={isOpenFormEdit}
                        // onOk={formEdit}
                        onCancel={() => setIsOpenFormEdit(false)}
                        footer={[]}
                        width={1000}
                    >
                        {contentFormData(dataAction, fileList, (result: any) => {
                            // todo: update state
                            setIsOpenFormEdit(false);
                            // reload
                        })}
                    </Modal>


                    <p className='current-tab'><b>{props.table.display_name}</b></p>
                    <hr />
                    <br />

                    <p className='current-tab'>
                        <Link className={props.searchData[props.table.tab_table_name] && props.searchData[props.table.tab_table_name] === 'all' ? 'active' : ''} href={route('data.index', [props.table.id])}>Tất cả</Link>
                        {tab}
                    </p>
                    <hr />

                    <Card type="inner"
                        title={
                            <div>
                                <Button loading={loadingBtn}
                                    disabled={checkbox.length > 0 ? false : true}
                                    type="primary"
                                    onClick={deletes}
                                    htmlType="button">
                                    Xóa {checkbox.length > 0 ? '(' + checkbox.length + ')' : ''}
                                </Button>
                            </div>
                        }
                        extra={
                            <div>
                                {btnAddNew()}
                            </div>
                        }>

                        <Tree
                            className="draggable-tree"
                            draggable
                            blockNode
                            checkable
                            defaultExpandAll
                            onDragEnter={onDragEnter}
                            onDrop={(info) => onDropData(info)}
                            treeData={gData}
                            onSelect={onSelect}
                            onCheck={onCheck}
                            checkStrictly={true}
                        />
                    </Card>
                </div>
            }
        />
    );
}
