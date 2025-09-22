import { useReducer, useState } from 'react';
import {
    Input,
    Popconfirm, DatePicker
} from "antd";

import axios from "axios";
import {
    ArrowRightOutlined,
    CheckOutlined,
} from "@ant-design/icons";
import dayjs from 'dayjs';
const { RangePicker } = DatePicker;
export function searchByTime(thoiGian, onSuccess) {
    const [khoangThoiGian, setKhoangThoiGian] = useState(thoiGian ? [dayjs(thoiGian[0]), dayjs(thoiGian[1])] : [null, null]);
    const [title, setTitle] = useState('7 ngày gần đây');

    return <>
        <label>Chọn khoảng thời gian</label>
        <Popconfirm title="Chọn nhanh khoảng thời gian"
            placement="bottom"
            icon={<ArrowRightOutlined />}
            showCancel={false}
            okText='Đóng'
            description={
            <table className="table05">
                <thead>
                    <tr>
                        <th colSpan={3}>
                            <RangePicker
                                placeholder={['Bắt đầu', 'Kết thúc']}
                                format={'DD/MM/YYYY'}
                                value={khoangThoiGian}
                                onChange={(value) => {
                                    // console.log('val', value);
                                    setKhoangThoiGian(value);
                                    // formSearch.submit();
                                }}
                            />
                        </th>
                    </tr>

                    <tr>
                        <th colSpan={3} style={{ textAlign: 'center', fontWeight: 'bold' }}>
                            <hr />
                        </th>
                    </tr>

                    <tr>
                        <th>Ngày/Tuần</th>
                        <th>Tháng/Quý</th>
                        <th>Theo năm</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td>
                            <a onClick={() => {
                                const start = new Date();
                                start.setHours(0, 0, 0, 0);
                                const end = new Date();
                                end.setHours(23, 59, 59, 999);
                                setKhoangThoiGian([dayjs(start), dayjs(end)]);
                                setTitle('Hôm nay');
                                onSuccess({ 'time': [dayjs(start).format('YYYY-MM-DD'), dayjs(end).format('YYYY-MM-DD')], title: title });
                            }}>Hôm nay</a>
                        </td>
                        <td>
                            <a onClick={() => {
                                // thiết lập ngày bắt đầu là ngày đầu tiên của tháng hiện tại
                                const start = new Date();
                                start.setDate(1);
                                const end = new Date();
                                end.setMonth(end.getMonth() + 1);
                                end.setDate(0);
                                setKhoangThoiGian([dayjs(start), dayjs(end)]);
                                setTitle('Tháng này');
                                onSuccess({ 'time': [dayjs(start).format('YYYY-MM-DD'), dayjs(end).format('YYYY-MM-DD')], title: title });
                            }}>Tháng này</a>
                        </td>
                        <td><a onClick={() => {
                            const start = new Date();
                            start.setMonth(0);
                            start.setDate(1);
                            const end = new Date();
                            end.setMonth(11);
                            end.setDate(31);
                            setKhoangThoiGian([dayjs(start), dayjs(end)]);
                            setTitle('Năm nay');
                            onSuccess({ 'time': [dayjs(start).format('YYYY-MM-DD'), dayjs(end).format('YYYY-MM-DD')], title: title });
                        }}>Năm nay</a></td>
                    </tr>
                    <tr>
                        <td><a onClick={() => {
                            const start = new Date();
                            start.setDate(start.getDate() - 1);
                            start.setHours(0, 0, 0, 0);
                            const end = new Date();
                            end.setHours(23, 59, 59, 999);
                            setKhoangThoiGian([dayjs(start), dayjs(end)]);
                            setTitle('Hôm qua');
                            onSuccess({ 'time': [dayjs(start).format('YYYY-MM-DD'), dayjs(end).format('YYYY-MM-DD')], title: title });
                        }}>Hôm qua</a></td>
                        <td><a onClick={() => {
                            const start = new Date();
                            start.setMonth(start.getMonth() - 1);
                            start.setDate(1);
                            const end = new Date();
                            end.setMonth(end.getMonth(), 0);
                            setKhoangThoiGian([dayjs(start), dayjs(end)]);
                            setTitle('Tháng trước');
                            onSuccess({ 'time': [dayjs(start).format('YYYY-MM-DD'), dayjs(end).format('YYYY-MM-DD')], title: title });
                        }}>Tháng trước</a></td>
                        <td><a onClick={() => {
                            const start = new Date();
                            start.setFullYear(start.getFullYear() - 1);
                            start.setDate(1);
                            const end = new Date();
                            end.setFullYear(end.getFullYear(), 11, 31);
                            setKhoangThoiGian([dayjs(start), dayjs(end)]);
                            setTitle('Năm trước');
                            onSuccess({ 'time': [dayjs(start).format('YYYY-MM-DD'), dayjs(end).format('YYYY-MM-DD')], title: title });
                        }}>Năm trước</a></td>
                    </tr>
                    <tr>
                        <td><a onClick={() => {
                            const start = new Date();
                            start.setDate(start.getDate() - 7);
                            start.setHours(0, 0, 0, 0);
                            const end = new Date();
                            end.setHours(23, 59, 59, 999);
                            setKhoangThoiGian([dayjs(start), dayjs(end)]);
                            setTitle('Tuần này');
                            onSuccess({ 'time': [dayjs(start).format('YYYY-MM-DD'), dayjs(end).format('YYYY-MM-DD')], title: title });
                        }}>Tuần này</a></td>
                        <td><a onClick={() => {
                            const start = new Date();
                            start.setDate(start.getDate() - 30);
                            start.setHours(0, 0, 0, 0);
                            const end = new Date();
                            end.setHours(23, 59, 59, 999);
                            setKhoangThoiGian([dayjs(start), dayjs(end)]);
                            setTitle('30 ngày qua');
                            onSuccess({ 'time': [dayjs(start).format('YYYY-MM-DD'), dayjs(end).format('YYYY-MM-DD')], title: title });
                        }}>30 ngày qua</a></td>
                        <td><a onClick={() => {
                            const start = new Date(0);
                            const end = new Date();
                            setKhoangThoiGian([dayjs(start), dayjs(end)]);
                            setTitle('Toàn thời gian');
                            onSuccess({ 'time': [dayjs(start).format('YYYY-MM-DD'), dayjs(end).format('YYYY-MM-DD')], title: title });
                        }}>Toàn thời gian</a></td>
                    </tr>
                    <tr>
                        <td><a onClick={() => {
                            const start = new Date();
                            start.setDate(start.getDate() - 7);
                            const end = new Date();
                            end.setDate(end.getDate() - 1);
                            setKhoangThoiGian([dayjs(start), dayjs(end)]);
                            setTitle('Tuần trước');
                            onSuccess({ 'time': [dayjs(start).format('YYYY-MM-DD'), dayjs(end).format('YYYY-MM-DD')], title: title });
                        }}>Tuần trước</a></td>
                        <td><a onClick={() => {
                            const start = new Date();
                            start.setMonth(start.getMonth(), 1);
                            const end = new Date();
                            end.setMonth(end.getMonth() + 1, 0);
                            setKhoangThoiGian([dayjs(start), dayjs(end)]);
                            setTitle('Quý này');
                            onSuccess({ 'time': [dayjs(start).format('YYYY-MM-DD'), dayjs(end).format('YYYY-MM-DD')], title: title });
                        }}>Quý này</a></td>
                        <td></td>
                    </tr>
                    <tr>
                        <td><a onClick={() => {
                            const start = new Date();
                            start.setDate(start.getDate() - 7);
                            const end = new Date();
                            end.setDate(end.getDate() - 1);
                            setKhoangThoiGian([dayjs(start), dayjs(end)]);
                            setTitle('07 ngày qua');
                            onSuccess({ 'time': [dayjs(start).format('YYYY-MM-DD'), dayjs(end).format('YYYY-MM-DD')], title: title });
                        }}>07 ngày qua</a></td>
                        <td><a onClick={() => {
                            const start = new Date();
                            start.setMonth(start.getMonth() - 1);
                            start.setDate(1);
                            const end = new Date();
                            end.setMonth(end.getMonth(), 0);
                            setKhoangThoiGian([dayjs(start), dayjs(end)]);
                            setTitle('Quý trước');
                            onSuccess({ 'time': [dayjs(start).format('YYYY-MM-DD'), dayjs(end).format('YYYY-MM-DD')], title: title });
                        }}>Quý trước</a></td>
                        <td></td>
                    </tr>

                </tbody>
            </table>}
        >
            <Input value={title} readOnly />
        </Popconfirm>
    </>
}