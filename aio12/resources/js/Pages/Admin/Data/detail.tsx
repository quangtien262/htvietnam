import React, { useState, useEffect  } from 'react';
import AdminLayout from '@/layouts/AdminLayout';
import {
    Card,
    Button,
    Popconfirm,
    message,
    Divider,
    Spin,
} from "antd";

import { Link } from '@inertiajs/react';
import axios from 'axios';
import { router } from '@inertiajs/react';

//dayjs
import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import weekday from "dayjs/plugin/weekday";
import localeData from "dayjs/plugin/localeData";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
dayjs.extend(weekday)
dayjs.extend(localeData)
dayjs.extend(customParseFormat);
dayjs.extend(utc)
dayjs.extend(timezone)
import '../../../../css/admin.css';
import '../../../../css/detail.css';
import '../../../../css/form.css';
import {toLowerCaseNonAccentVietnamese, inArray } from '../../../Function/common';
import { checkShowData } from '../../../Function/detail';
import { showDataRelated } from '../../../Function/data';
import { showLog, loadDataLanguage } from '../../../Function/auto_load';
import {itemMenu} from "../../../Function/config_route";


export default function Dashboard(props) {
    const [loading, setLoading] = useState(false);

    function onDelete(){
        new Promise((resolve) => {
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
        });
    }

    function checkShowLink() {
        if(props.table.route_name && props.table.route_name !== '') {
            if(props.table.name == 'news' && props.data.is_active != 1) {
                const link = route('news.preview', ['preview',props.data.id]) ;
                return <p>Link Preview: <a target='new' href={link}>{link}</a>
                        <br/>
                        <em>Note: Chỉ xem được preview do bài viết chưa active</em>
                    </p>
            }
            if(!props.data.name || props.data.name == '') {
                return '';
            }
            const link = route(props.table.route_name, [toLowerCaseNonAccentVietnamese(props.data.name), props.data.id]);
            return <p>Link: <a target='new' href={link}>{link}</a></p>
        }
    }

    function checkShowBtnDelete() {
        let result = '';
        if(inArray(props.table.id, props.userPermission.table_delete)) {
            result = <Popconfirm title="Bạn muốn xóa?" onConfirm={() => {onDelete()}} cancelText="Dừng" okText="XÓA">
                        <Button type="default" htmlType="button">Xóa</Button>
                    </Popconfirm>
        }
        return result;
    }

    return (
        <AdminLayout
            auth={props.auth}
            header={props.table.display_name}
            menus={props.menus}
            menuParentID={props.p}
            current={props.table}
            content={
                <Spin spinning={loading} size="large">
                    <Card type="inner"
                        title={props.table.display_name}
                        extra={
                            <div>
                                <Link href={route('data.edit', {tableId:props.table.id, dataId:props.data.id, p: props.p})}>
                                    <Button className='btn-edit' type="primary" htmlType="submit">Sửa</Button>
                                </Link>
                                <span> </span>
                                
                                {
                                    props.table.type_show === 5 ? '' : <Link href={route('data.tblName', {tblName:props.table.name, p: props.p})}><Button className='btn-back' onClick={(e)=> {setLoading(true);}}> Quay lại </Button></Link>
                                }
                                
                                <span> </span>

                                {checkShowBtnDelete()}

                            </div>
                        }>
                            {checkShowLink()}

                            {checkShowData(props)}

                    </Card>

                    <br/>

                    {props.table.is_multiple_language == 1 ? loadDataLanguage(props.table, props.data) : ''}

                    <br/>

                    {props.dataRelated && props.table.data_related ? showDataRelated(props.table.data_related, props.dataRelated) : ''}

                    <br/>

                    <Divider orientation="left">Lịch sử thay đổi thông tin</Divider>
                    <div>{showLog(props)}</div>
                </Spin>
            }
        />
    );
}
