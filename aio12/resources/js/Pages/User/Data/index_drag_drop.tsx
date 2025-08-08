import { useState  } from 'react';
import AdminLayout from '@/Layouts/AdminLayout';
import { Button, Table, message, Form, Select, Card, Tree  } from 'antd';
import { PlusCircleOutlined } from '@ant-design/icons';
import { Link } from '@inertiajs/react';
import axios from 'axios';
import { router } from '@inertiajs/react';
export default function index(props) {
    const [loadingBtn, setLoadingBtn] = useState(false);
    const [gData, setGData] = useState(props.dataSource);
    const [checkbox, setCheckbox] = useState([]);
    const onSelect = (id) => {
        router.get(route('data.edit', [props.tableId, id]));
    };

    const onDragEnter = (info) => {
        console.log(info);
    };

    const onDrop = (info) => {
        console.log(info);
        const dropKey = info.node.key;
        const dragKey = info.dragNode.key;
        const dropPos = info.node.pos.split('-');
        const dropPosition = info.dropPosition - Number(dropPos[dropPos.length - 1]);
        const loop = (data, key, callback) => {
          for (let i = 0; i < data.length; i++) {
            if (data[i].key === key) {
              return callback(data[i], i, data);
            }
            if (data[i].children) {
              loop(data[i].children, key, callback);
            }
          }
        };
        const data = [...gData];

        // Find dragObject
        let dragObj;
        loop(data, dragKey, (item, index, arr) => {
          arr.splice(index, 1);
          dragObj = item;
        });
        if (!info.dropToGap) {
          // Drop on the content
          loop(data, dropKey, (item) => {
            item.children = item.children || [];
            // where to insert 示例添加到头部，可以是随意位置
            item.children.unshift(dragObj);
          });
        } else if (
          (info.node.props.children || []).length > 0 &&
          // Has children
          info.node.props.expanded &&
          // Is expanded
          dropPosition === 1 // On the bottom gap
        ) {
          loop(data, dropKey, (item) => {
            item.children = item.children || [];
            // where to insert 示例添加到头部，可以是随意位置
            item.children.unshift(dragObj);
            // in previous version, we use item.children.push(dragObj) to insert the
            // item to the tail of the children
          });
        } else {
          let ar = [];
          let i;
          loop(data, dropKey, (_item, index, arr) => {
            ar = arr;
            i = index;
          });
          if (dropPosition === -1) {
            ar.splice(i, 0, dragObj);
          } else {
            ar.splice(i + 1, 0, dragObj);
          }
        }
        setGData(data);
    };

    const onCheck = (checkedKeys, info) => {
        console.log('onCheck', checkedKeys, info);
        setCheckbox(checkedKeys);
    };

    const updateSortOrder = () => {
        console.log('gData', gData);
        // router.post(route('column.update_sort_order', {data:JSON.stringify(gData)}))
        axios.post(route('data.update_sort_order', [props.tableId]),{
            data:JSON.stringify(gData)
        }).then(response => {
            message.success('Cập nhật thứ tự thành công');
        }).catch(error => {
            message.error('Cập nhật thứ tự thất bại');
        });
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
            console.log(response);
        })
        .catch(error => {
            console.log('error', error);
            setLoadingBtn(false);
            message.error('Có lỗi xảy ra');
        });
    }
    const tab = props.tableTab.map((tab) => {
        let active = 'ht-tab-item';
        if(tab[props.tab_col_name] === props.request[props.table.tab_table_name]) {
            active = 'active';
        }
        return <Link className={active} href={ '?' + props.table.tab_table_name + '=' + tab[props.tab_col_name] }>{tab.display_name }</Link>
    });

    const btnAddNew = <Link href={route('data.create', [props.table.id, props.request])}>
                            <Button type="primary" className="_right">
                                <PlusCircleOutlined />Thêm mới
                            </Button>
                    </Link>;

    return (
        <AdminLayout
            auth={props.auth}
            header={props.table.display_name}
            tables={props.tables}
            current={props.table}
            content={
                <div>
                    <p className='current-tab'><b>{ props.table.display_name }</b></p>
                    <hr/>
                    <br/>

                    <p className='current-tab'>
                        <Link className={props.request[props.table.tab_table_name] && props.request[props.table.tab_table_name] === 'all' ? 'active':''} href={ route('data.index', [props.table.id]) }>Tất cả</Link>
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
                                    <span></span>
                                    <Button loading={loadingBtn} type="primary" htmlType="button" onClick={updateSortOrder}>
                                         Cập nhật thứ tự
                                    </Button>
                                </div>
                            }
                            extra={
                                <div>
                                    {props.request[props.table.tab_table_name] && props.request[props.table.tab_table_name] === 'all' ? '':btnAddNew}
                                </div>
                            }>

                        <Tree
                            className="draggable-tree"
                            draggable
                            blockNode
                            checkable
                            defaultExpandedKeys={props.expandedKeys}
                            onDragEnter={onDragEnter}
                            onDrop={onDrop}
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
