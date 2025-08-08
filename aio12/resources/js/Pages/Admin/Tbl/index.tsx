import { useState  } from 'react';
import AdminLayout from '@/Layouts/AdminLayout';
import { Button, Table, message, Modal, Form, Input,Popconfirm, Select, Card, Tree, Space, Descriptions} from 'antd';
import { Link } from '@inertiajs/react';
import axios from 'axios';
import { router } from '@inertiajs/react';
import { showCheckbox} from '../../../Function/table';
import { onDrop } from "../../../Function/common";

export default function index(props) {

    const [loadingBtnDelete, setLoadingBtnDelete] = useState(false);
    const [loadingBtn, setLoadingBtn] = useState(false);
    const [loadingTable, setLoadingTable] = useState(false);
    const [gData, setGData] = useState(props.dataSource);
    const [isOpenConfirmDelete, setIsOpenConfirmDelete] = useState(false);
    const [checkbox, setCheckbox] = useState([]);
    const [isShowArtisan, setIsShowArtisan] = useState('none');
    const [messageApi, contextHolder] = message.useMessage();
    const key = 'updatable';

    const confirmDelete = () => {
        setIsOpenConfirmDelete(true);
    };
    const handleCancelDelete = () => {
        setIsOpenConfirmDelete(false);
    };
    const hasSelected = checkbox.length  > 0;
    const onDragEnter = (info) => {
        console.log(info);
    };

    const onCheck = (checkedKeys, info) => {
        setCheckbox(checkedKeys);
    };
    const deletes = () => {
        setLoadingBtnDelete(true);
        setLoadingTable(true);
        router.post(route('table.deletes'), {
            ids: checkbox
        })
    };

    function onDropData(info) {
        const result = onDrop(info, gData);
        setGData(result);

        axios.post(route('table.update_sort_order'),{
            data:JSON.stringify(result)
        }).then(response => {
            message.success('Cập nhật thứ tự thành công');
        }).catch(error => {
            message.error('Cập nhật thứ tự thất bại');
        });
    }

    const migrate = (e) => {
        e.preventDefault();
        console.log('migrate');
        runArtisan('migrate');
    }

    const migrateRefresh = (e) => {
        e.preventDefault();
        console.log('refresh');
        runArtisan('migrate:refresh');
    }

    const seeder = (e) => {
        e.preventDefault();
        console.log('seeder');
        runArtisan('db:seed');
    }

    const artisanAll = (e) => {
        e.preventDefault();
        runArtisan('all');
    }

    const artisanCache = (e) => {
        e.preventDefault();
        runArtisan('cache');
    }

    function runArtisan(type) {
        setLoadingBtn(true);
        messageApi.open({
            key,
            type: 'loading',
            content: 'Runing ' + type + '....' ,
        });
        axios.post(route('artisan'),{
            type: type
        }).then(response => {
            console.log('response', response);
            setLoadingBtn(false);
            messageApi.open({
                key,
                type: 'success',
                content: 'Loaded!',
                duration: 2,
            });
        })
        .catch(error => {
            console.log('error', error);
            message.error('Có lỗi xảy ra');
            setLoadingBtn(false);
        });
    }

    function showsetting(data) {
        return ['is_edit', 'show_in_menu', 'setting_shotcut', 'is_show_btn_edit', 'have_delete', 'import', 
            'export', 'have_add_new','have_delete', 'smart_search'].map((name, displayName) => {
            return showCheckbox(data, name, 'table.update.edit')
        });
    }

    function formatGdata() {
        const result = gData.map((val) => {
          let children = [];
          if(val.children.length > 0) {
            children = val.children.map((sub) => {
              return {
                'title': <div>
                    <a onClick={() => {router.get(route('table.form', [sub.key]));}}>{sub.title}</a>
                    <hr/>
                    {showsetting(sub)}
                  </div>,
                'key': sub.key
              } 
            });
          }
  
          let title = <div>
                <a onClick={() => {router.get(route('table.form', [val.key]));}}>{val.title}</a><hr/>
                {showsetting(val)}
              </div>
          if(val.is_label === 1) {
            title = val.title;
          }
          return {
            'title': title,
            'key': val.key,
            'children': children
          };
        })
        return result;
    }

    return (
        <AdminLayout
            auth={props.auth}
            header="Cài đặt bảng"
            tables={props.tables}
            content={
                <div>
                    {contextHolder}
                    <Card type="inner"
                            style={{ cursor:'pointer' }}
                            title={<Space onClick={() => {setIsShowArtisan(isShowArtisan === 'none' ? 'block' : 'none')}}><a>Artisan </a> <em className='_em'>Click để Ẩn/Hiện</em></Space>}
                    >
                                <Descriptions bordered  layout="vertical" style={{ display:isShowArtisan }}>
                                    <Descriptions.Item>
                                        <Space>
                                            <Input />
                                            <Button loading={loadingBtn} type="primary">Run query</Button>
                                            <Popconfirm title='Xác nhận migrate'
                                                    onConfirm={migrate}
                                                    cancelText="Cancel"
                                                    okText={'Run'}>
                                                <Button loading={loadingBtn} type="primary" ghost>Migrate</Button>
                                            </Popconfirm>

                                            <Popconfirm title='Xác nhận migrate refresh'
                                                    onConfirm={migrateRefresh}
                                                    cancelText="Cancel"
                                                    okText={'Run'}>
                                                <Button loading={loadingBtn} type="primary" ghost>Migrate Refresh</Button>
                                            </Popconfirm>

                                            <Popconfirm title='Xác nhận Seed'
                                                    onConfirm={seeder}
                                                    cancelText="Cancel"
                                                    okText={'Run'}>
                                                <Button loading={loadingBtn} type="primary" ghost>Seed</Button>
                                            </Popconfirm>

                                            <Popconfirm title='Run ALL là bao gồm cả migrate:refresh và db:seed'
                                                    onConfirm={artisanAll}
                                                    cancelText="Cancel"
                                                    okText={'Run'}>
                                                <Button loading={loadingBtn} type="primary" ghost>ALL</Button>
                                            </Popconfirm>

                                            {/* <Popconfirm title='Xóa Cache'
                                                    onConfirm={artisanCache}
                                                    cancelText="Cancel"
                                                    okText={'Run'}>
                                                <Button loading={loadingBtn} type="primary" danger>Xóa cache</Button>
                                            </Popconfirm> */}
                                        </Space>
                                    </Descriptions.Item>
                                </Descriptions>
                    </Card>
                    
                    <Card type="inner"
                            title={
                                <div>
                                    <Modal title="Xác nhận xóa" open={isOpenConfirmDelete} onOk={deletes} onCancel={handleCancelDelete} confirmLoading={loadingBtnDelete}>
                                        <p>Dữ liệu đã xóa sẽ <b>không thể khôi phục</b> lại được <br/> <b>(Số lượng {checkbox.length})</b></p>
                                    </Modal>
                                    <Button type="primary"
                                        onClick={confirmDelete}
                                        disabled={!hasSelected}
                                        loading={loadingBtnDelete}>
                                            Xóa {checkbox.length > 0 ? '('+checkbox.length+')':''}
                                    </Button>
                                    {/* <span> </span>
                                    <Button loading={loadingBtn} type="primary" htmlType="button" onClick={updateSortOrder}>
                                         Cập nhật thứ tự
                                    </Button> */}
                                </div>
                            }
                            extra={
                                <div>
                                    <span> </span>
                                    <Button loading={loadingBtn} type="primary" htmlType="button">
                                         <Link href={route('table.form', [0])}>Thêm mới</Link>
                                    </Button>

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
                            treeData={formatGdata()}
                            // onSelect={onSelect}
                            onCheck={onCheck}
                            confirmDelete = {confirmDelete}
                            handleCancelDelete = {handleCancelDelete}
                        />
                    </Card>
                </div>
            }
        />
    );
}
