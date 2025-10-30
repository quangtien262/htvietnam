import  { useState  } from 'react';
import AdminLayout from '@/layouts/AdminLayout';
import {message, Card, Tree } from 'antd';

import axios from 'axios';
import { router } from '@inertiajs/react';
import { onDrop, showsettingMenu } from "../../../Function/common";



export default function index(props) {
    const [gData, setGData] = useState(props.dataSource);
    const [checkbox, setCheckbox] = useState([]);

    const onSelect = (id) => {
        // router.get(route('admin.setting.column', [id]));
    };

    const onDragEnter = (info) => {
        // console.log(info);
    };

    function onChange(val, tableId) {
      // console.log(val, tableId);
    }

    function formatGdata() {
      const result = gData.map((val) => {
        let children = [];
        if(val.children.length > 0) {
          // sub
          children = val.children.map((sub) => {
            let subTitle = sub.title;
            let settingChildren = '';
            if(sub.is_label !== 1) {
              subTitle = <div><a onClick={() => {router.get(route('admin.setting.column', [sub.key]));}}>{sub.title}</a></div>;
              settingChildren = showsettingMenu(sub);
            }
            return {
              'title': <div>
                        <b>{subTitle}</b>
                        <hr/>
                        {settingChildren}
                      </div>,
              'key': sub.key
            } 
          });
        }
        
        // parent
        let title = val.title;
        let setting = ''
        if(val.is_label !== 1) {
          title = <div><a onClick={() => {router.get(route('admin.setting.column', [val.key]));}}>{val.title}</a></div>
          setting = showsettingMenu(val);
        }
        return {
          'title': <div>
                    <b>{title}</b>
                    <hr/>
                    {setting}
                  </div>,
          'key': val.key,
          'children': children
        };
      })
      return result;
    }

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
    return (
        <AdminLayout
            auth={props.auth}
            header="Cài đặt bảng"
            tables={props.tables}
            content={
                <div>                    
                    <Card type="inner"
                            title={
                                <div>
                                    Cài đặt danh mục chính
                                </div>
                            }
                            extra={''}>
                        <Tree
                            className="draggable-tree"
                            draggable
                            blockNode
                            defaultExpandedKeys={props.expandedKeys}
                            onDragEnter={onDragEnter}
                            onDrop={(info) => onDropData(info)}
                            treeData={formatGdata()}
                            onSelect={onSelect}
                        />
                    </Card>
                </div>
            }
        />
    );
}
