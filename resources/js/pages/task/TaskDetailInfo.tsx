import React from "react";
import { List, Tag, Popover, Select, DatePicker, Checkbox, Button, Popconfirm } from "antd";
import {
    InfoCircleFilled, PushpinFilled, DownOutlined, FireFilled, CaretRightFilled, UserOutlined, EditOutlined, HddFilled, ClockCircleFilled, FlagFilled, ScheduleFilled, CheckSquareFilled, DiffFilled, FileSyncOutlined, FileSearchOutlined, FileMarkdownOutlined, DeleteOutlined
} from "@ant-design/icons";
import dayjs from "dayjs";

interface TaskDetailInfoProps {
    dataAction: any;
    icon: any;
    status: any;
    priority: any;
    users: any;
    updateTaskColumn: (columnName: string, value: any) => void;
    setOpenDetail: (val: boolean) => void;
    setDataAction: (val: any) => void;
    message?: any;
}

const DATE_SHOW = "DD/MM/YYYY";
const DATE_TIME_FORMAT = "DD/MM/YYYY HH:mm";

const TaskDetailInfo: React.FC<TaskDetailInfoProps> = ({
    dataAction,
    icon,
    status,
    priority,
    users,
    updateTaskColumn,
    setOpenDetail,
    setDataAction,
    message,
}) => {
    return (
        <List
            header={<b><InfoCircleFilled /> Thông tin chi tiết</b>}
            footer={<div></div>}
            bordered
            dataSource={[
                // status
                <div className="item03" key="status">
                    <a><PushpinFilled /> </a>
                    <span>Trạng thái: </span>
                    {
                        !dataAction.task_status_id
                            ? <span className="value-list">Chưa xác định</span>
                            : <>
                                <Tag style={{ color: dataAction.task_status_color, background: dataAction.task_status_background }}>
                                    <span>{dataAction.task_status_icon ? icon[dataAction.task_status_icon] : ''} </span>
                                    <span> {dataAction.task_status_name}</span>
                                </Tag>
                            </>
                    }
                    <Popover placement="bottomLeft"
                        title="Chọn trạng thái"
                        trigger="click"
                        content={
                            <List
                                itemLayout="horizontal"
                                dataSource={status}
                                renderItem={(item: any, key) => (
                                    <p style={{ color: item.background }}
                                        className="cursor"
                                        onClick={() => updateTaskColumn('task_status_id', item.value)}
                                    >
                                        {icon[item.icon]} {item.label}
                                    </p>
                                )}
                            />
                        }
                    >
                        <a onClick={(e) => e.preventDefault()} className="_right">
                            <DownOutlined />
                        </a>
                    </Popover>
                </div>,

                // độ ưu tiên
                <div className="item03" key="priority">
                    <a><FireFilled /> </a>
                    <span>Độ ưu tiên: </span>
                    {
                        !dataAction.task_priority_id
                            ? <span className="value-list">Chưa xác định</span>
                            : <Tag style={{ color: dataAction.task_priority_color }}>{dataAction.task_priority_name} </Tag>
                    }
                    <Popover placement="bottomLeft"
                        title="Chọn mức độ ưu tiên"
                        trigger="click"
                        content={
                            <List
                                itemLayout="horizontal"
                                dataSource={priority}
                                renderItem={(item: any, key: number) => (
                                    <p style={{ color: item.color }}
                                        className="cursor"
                                        onClick={() => updateTaskColumn('task_priority_id', item.value)}
                                    >
                                        <CaretRightFilled /> {item.label}
                                    </p>
                                )}
                            />
                        }
                    >
                        <a onClick={(e) => e.preventDefault()} className="_right">
                            <DownOutlined />
                        </a>
                    </Popover>
                </div>,

                // người thực hiện
                <div className="item03" key="assignee">
                    <a><UserOutlined /> </a>
                    <span>Người thực hiện: </span>
                    <Popover placement="bottomLeft"
                        title="Chọn người thực hiện"
                        trigger="click"
                        content={
                            <Select
                                showSearch
                                style={{ width: "100%" }}
                                value={dataAction.nguoi_thuc_hien ? dataAction.nguoi_thuc_hien.toString() : null}
                                placeholder="Chọn nhân viên thực hiện"
                                optionFilterProp="children"
                                options={users}
                                filterOption={(input, option) =>
                                    (option?.label ?? "")
                                        .toLowerCase()
                                        .includes(input.toLowerCase())
                                }
                                onChange={(value) => {
                                    updateTaskColumn('nguoi_thuc_hien', value);
                                }}
                            />
                        }
                    >
                        <a onClick={(e) => e.preventDefault()} className="_right">
                            <EditOutlined />
                        </a>
                    </Popover>
                    <p>
                        {
                            !dataAction.nguoi_thuc_hien
                                ? <span className="value-list">Chưa xác định</span>
                                : <Tag style={{ color: '#03ba56ff' }}>{dataAction.assignee_name} </Tag>
                        }
                    </p>
                </div>,

                // Tags
                <div className="item03" key="tags">
                    <a><HddFilled /> </a>
                    <span>Tags: </span>
                    <Popover placement="bottomLeft"
                        title="Thêm tags"
                        trigger="click"
                        content={
                            <Select
                                showSearch
                                mode="tags"
                                style={{ width: "100%" }}
                                value={dataAction.tags}
                                placeholder="Chọn nhân viên thực hiện"
                                optionFilterProp="children"
                                filterOption={(input, option) =>
                                    (option?.label ?? "")
                                        .toLowerCase()
                                        .includes(input.toLowerCase())
                                }
                                onChange={(value) => updateTaskColumn('tags', value)}
                            />
                        }
                    >
                        <a onClick={(e) => e.preventDefault()} className="_right">
                            <EditOutlined />
                        </a>
                    </Popover>
                    <p>
                        {
                            !dataAction.tags
                                ? <span className="value-list">Chưa xác định</span>
                                : <div>
                                    {dataAction.tags.map((item: any, key: number) => (
                                        <Tag style={{ color: '#045ea8ff' }} key={key}>{item} </Tag>
                                    ))}
                                </div>
                        }
                    </p>
                </div>,

                // Thời gian
                <div className="item03" key="time">
                    <b><PushpinFilled />  Thời gian: </b>
                </div>,

                // Ngày tạo
                <div key="created">
                    <a><ClockCircleFilled /> </a>
                    Ngày tạo:
                    <span className="value-list"> {dataAction.created_at ? dayjs(dataAction.created_at).format(DATE_SHOW) : ''}</span>
                </div>,
                // Ngày cập nhật
                <div className="item03" key="start">
                    <a><FlagFilled /> </a>
                    Bắt đầu:
                    <span className="value-list"> {dataAction.start ? dayjs(dataAction.start).format(DATE_SHOW) : 'Chưa xác định'}</span>
                    <Popover placement="bottomLeft"
                        title="Ngày bắt đầu"
                        trigger="click"
                        content={
                            <DatePicker format='DD/MM/YYYY'
                                onChange={(date) => {
                                    updateTaskColumn('start', date.format('YYYY-MM-DD'));
                                }}
                            />
                        }
                    >
                        <a onClick={(e) => e.preventDefault()} className="_right">
                            <EditOutlined />
                        </a>
                    </Popover>
                </div>,

                // ngày hoàn thành
                <div className="item03" key="end">
                    <a><ScheduleFilled /> </a>
                    Hoàn thành:
                    <span className="value-list"> {dataAction.end ? dayjs(dataAction.end).format(DATE_SHOW) : 'Chưa xác định'}</span>
                    <Popover placement="bottomLeft"
                        title="Ngày hoàn thành"
                        trigger="click"
                        content={
                            <DatePicker format='DD/MM/YYYY'
                                onChange={(date) => {
                                    updateTaskColumn('end', date.format('YYYY-MM-DD'));
                                }}
                            />
                        }
                    >
                        <a onClick={(e) => e.preventDefault()} className="_right">
                            <EditOutlined />
                        </a>
                    </Popover>
                </div>,

                // ngày thực tế
                <div className="item03" key="actual">
                    <a><CheckSquareFilled /> </a>
                    Thực tế:
                    <span className="value-list"> {dataAction.actual ? dayjs(dataAction.actual).format(DATE_SHOW) : 'Chưa xác định'}</span>
                    <Popover placement="bottomLeft"
                        title="Ngày hoàn thành"
                        trigger="click"
                        content={
                            <DatePicker format='DD/MM/YYYY'
                                onChange={(date) => {
                                    updateTaskColumn('actual', date.format('YYYY-MM-DD'));
                                }}
                            />
                        }
                    >
                        <a onClick={(e) => e.preventDefault()} className="_right">
                            <EditOutlined />
                        </a>
                    </Popover>
                </div>,

                <div className="item03" key="meeting">
                    <b><DiffFilled />  Thêm vào meeting: </b>
                    <Popover placement="bottomLeft"
                        title="Thêm vào meeting"
                        trigger="click"
                        content={
                            <div>
                                <Checkbox
                                    onChange={(e) => {
                                        let status = 0;
                                        if (e.target.checked) {
                                            status = 1;
                                        }
                                        updateTaskColumn('is_daily', status);
                                    }}
                                    defaultChecked={dataAction.is_daily}
                                >Daily</Checkbox>
                                <Checkbox value="is_weekly"
                                    onChange={(e) => {
                                        let status = 0;
                                        if (e.target.checked) {
                                            status = 1;
                                        }
                                        updateTaskColumn('is_weekly', status);
                                    }}
                                    checked={dataAction.is_weekly}>Weekly</Checkbox>
                                <Checkbox value="1"
                                    onChange={(e) => {
                                        let status = 0;
                                        if (e.target.checked) {
                                            status = 1;
                                        }
                                        updateTaskColumn('is_monthly', status);
                                    }}
                                    checked={dataAction.is_monthly}>Monthly</Checkbox>
                            </div>
                        }
                    >
                        <a onClick={(e) => e.preventDefault()} className="_right">
                            <EditOutlined />
                        </a>
                    </Popover>
                </div>,

                // daily
                <div className="item03" key="daily">
                    <a><FileSyncOutlined /> </a>
                    Daily:
                    <span className="value-list"> {dataAction.is_daily ? 'Có' : 'Không'}</span>
                </div>,

                // weekly
                <div className="item03" key="weekly">
                    <a><FileSearchOutlined /> </a>
                    Weekly:
                    <span className="value-list"> {dataAction.is_weekly ? 'Có' : 'Không'}</span>
                </div>,

                // monthly
                <div className="item03" key="monthly">
                    <a><FileMarkdownOutlined /> </a>
                    Monthly:
                    <span className="value-list"> {dataAction.is_monthly ? 'Có' : 'Không'}</span>
                </div>,

                // delete
                <div className="item03" key="delete">
                    <Popconfirm
                        icon={<DeleteOutlined />}
                        title="Xác nhận xóa"
                        description="Dữ liệu sẽ bị xóa hòa toàn, bạn xác nhận chứ?"
                        onConfirm={() => {
                            setOpenDetail(false);
                            updateTaskColumn('is_recycle_bin', 1)
                            setDataAction({ 'id': 0 });
                        }}
                    >
                        <Button className="_right"><DeleteOutlined /> Xóa </Button>
                    </Popconfirm>
                </div>
            ]}
            renderItem={(item) => (
                <List.Item>{item}</List.Item>
            )}
        />
    );
};

export default TaskDetailInfo;
