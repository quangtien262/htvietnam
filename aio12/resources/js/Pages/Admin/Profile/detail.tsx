import { useState  } from 'react';
import AdminLayout from '@/layouts/AdminLayout';
import { Select, Col, Row, Descriptions, Card, Button,  message, Carousel, Image, Calendar  } from 'antd';
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
import '../../../../css/detail.css';
import '../../../../css/form.css';
import { chamCongCellRender } from '../../../Function/calendar';
import { numberFormat, numberFormat02 } from '../../../Function/common';
import { itemMenu } from "../../../Function/config_route";

export default function DetailUser(props) {
    const [chamCong, setChamCong] = useState(!props.data.cham_cong ? {}: JSON.parse(props.data.cham_cong));

    const contentStyle = {
        margin: 0,
        // height: '200px',
        color: '#fff',
        textAlign: 'center',
    };
    function showData(col) {
        const data = props.data;
        let result;
        const typeEdit = col.type_edit;
        switch (typeEdit) {
            case 'permission_list':
                break;
            case 'date':
                result =  dayjs(data[col.name]).format('DD/MM/YYYY');
                break;
            case 'number':
                result = numberFormat(data[col.name]);
                break;
            case 'images_crop':
            case 'images':
                if(!data[col.name]) {
                    return '';
                }
                const imgs = JSON.parse(data[col.name]);
                result =   <Carousel autoplay={true} effect='fade'>
                            {imgs['images'].map((img, idx) => {
                                return <div key={'main-img-' + idx}>
                                            <h3 style={contentStyle}><Image key={'img-' + idx} width={'100%'} src={img}/></h3>
                                        </div>
                            })}
                        </Carousel>
                break;
            case 'select':
            case 'select2':
                result = '';
                if(props.selectData && props.selectData[col.name])
                    result = props.selectData[col.name][data[col.name]];

                break;
            default:
                result = data[col.name]
                break;
        }

        return result;
    }

    const listImages = props.columns.map((col) => {
        if(col.type_edit === 'images' || col.type_edit === 'images_crop') {
            return <Descriptions.Item key={col.name} label={col.display_name}>{showData(col)}</Descriptions.Item>
        }
        return false;
    })

    const listImage = props.columns.map((col) => {
        if(col.type_edit === 'image' || col.type_edit === 'image_crop') {
            return <Descriptions.Item key={col.name} label={col.display_name}> <Image key={col.name} width={200} src={showData(col)}/></Descriptions.Item>
        }
        return false;
    });

    const listItems = props.columns.map((col) => {
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
            'encryption',
            'permission_list',
        ]
        if(ignoreTypes.includes(col.type_edit)) {
            return false;
        }
        if(['permission_group_id'].includes(col.name)) {
            return false;
        }
        if(col.edit === 1) {
            return <Descriptions.Item key={col.name} label={col.display_name}>{showData(col)}</Descriptions.Item>
        }
    });

    const cellRender = (current) => {
        if(chamCong.length === 0) {
            return '';
        }
        const cong = chamCong[current.format('MMDD')];
        if(!cong) {
            return '';
        }
        const type = cong.type;
        return chamCongCellRender(cong.type, cong);
    };

    const listItemsLg = props.columns.map((col) => {
        // tinyMCE
        if(['summernote', 'tiny', 'ckeditor'].includes(col.type_edit)) {
            return <Descriptions bordered layout="vertical" key={col.name}>
                        <Descriptions.Item label={col.display_name}><div dangerouslySetInnerHTML={{ __html: showData(col) }} /></Descriptions.Item>
                    </Descriptions>
        }
        // Chấm công
        if(['calendar_cham_cong', 'calendar_lich_hen'].includes(col.type_edit)) {
            return <Calendar value={dayjs(props.data.year + '-' + numberFormat02(props.data.month, 2) + '-01')}
                            key={col.name}
                            locale='vi_VN'
                            dateCellRender={cellRender}
                            mode='month' />
        }
    });
    const cancelDelete = () =>
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
        }
    );

    return (
        <AdminLayout
            auth={props.auth}
            header={props.table.display_name}
            tables={itemMenu(props.table.name)}
            current={props.table}
            content={
                <div>
                    <Card type="inner"
                        title={props.table.display_name}
                        extra={
                            <div>
                                <Link href={route('admin_user.edit')}>
                                    <Button type="primary" htmlType="button">Sửa</Button>
                                </Link>
                                <span> </span>
                                <Link href={route('dashboard')}>
                                    <Button >Thoát</Button>
                                </Link>
                            </div>
                        }>
                        <Row gutter={24}>
                            { !props.isImage ? '':<Col><Descriptions bordered layout="vertical">{listImage}</Descriptions></Col> }

                            { !props.isImages ? '':<Col span={6}>{listImages}</Col> }


                            <Col>
                                <Descriptions bordered layout="vertical">{listItems}</Descriptions>
                            </Col>
                        </Row>

                        <br/>
                        <div>{listItemsLg}</div>
                    </Card>
                </div>
            }
        />
    );
}
