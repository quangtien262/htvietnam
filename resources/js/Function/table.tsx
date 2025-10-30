import React, { useState } from 'react';
import axios from 'axios';
import { Button, Table, message, Modal, Form, Input,InputNumber, Popconfirm, Typography, Select, Radio, Card, Tree, Space, Descriptions, Checkbox  } from 'antd';

import { checkRule, showDataPopup, showData } from './data';
import { PlusSquareOutlined, UnorderedListOutlined } from '@ant-design/icons';


export function onChangeCheckbox(value, data, colName, routeName) {
    let param = {};
    param[colName] = value.target.checked;
    axios.post(route(routeName, [data.key]), param).then(response => {
        message.success('Đã cài đặt thành công: "' + data.title + '"');
    }).catch(error => {
        message.error('Cài đặt thất bại');
    });
}
// 'is_show_btn_edit', 'have_delete', 'import', 'export', 'have_add_new','have_delete', 'is_label', 'smart_search'
export function showCheckbox(data, name, routeName) {
    let checkboxs = {
        show_in_list:'Danh sách',
        add2search:'Tìm kiếm',
        edit:'Sửa',
        require:'Bắt buộc',
        add_express:'Thêm nhanh',
        is_edit:'Sửa',
        setting_shotcut:'Shortcut',
        import:'Nhập excel',
        export:'Xuất excel',
        is_show_btn_edit:'Show nút edit',
        have_delete:'Show nút delete',
        have_add_new:'Show nút add',
        is_label:'Is Label',
        smart_search:'Smart search',
        show_in_menu:'Menu',
        fast_edit: 'Sửa nhanh',
        show_in_detail:'detail'
    };
    if(data[name] === 1) {
        return <Checkbox defaultChecked onChange={(value)=> onChangeCheckbox(value, data, name, routeName) }>{checkboxs[name]}</Checkbox>
    }
    return <Checkbox onChange={(value)=> onChangeCheckbox(value, data, name, routeName) }>{checkboxs[name]}</Checkbox>
}



