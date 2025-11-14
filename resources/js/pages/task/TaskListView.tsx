import React from 'react';
import { Table, Tag } from 'antd';
import { CheckCircleOutlined, ClockCircleOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { DATE_SHOW } from '../../function/constant';

interface TaskListViewProps {
    dataSource: any[];
    columns: any[];
    loading: boolean;
    onRowClick: (record: any) => void;
    tableParams: any;
}

const TaskListView: React.FC<TaskListViewProps> = ({
    dataSource,
    columns,
    loading,
    onRowClick,
    tableParams
}) => {
    // Flatten tasks from kanban structure to list structure
    const flattenedData = React.useMemo(() => {
        if (!Array.isArray(dataSource)) return [];

        const flattened: any[] = [];
        dataSource.forEach((statusGroup: any) => {
            if (statusGroup.datas && Array.isArray(statusGroup.datas)) {
                statusGroup.datas.forEach((task: any) => {
                    flattened.push({
                        ...task,
                        statusName: statusGroup.status?.name || '',
                        statusColor: statusGroup.status?.color || '',
                        key: task.id
                    });
                });
            }
        });
        return flattened;
    }, [dataSource]);

    const listColumns = [
        {
            title: 'ID',
            dataIndex: 'id',
            key: 'id',
            width: 60,
            fixed: 'left' as const,
        },
        {
            title: 'Tên công việc',
            dataIndex: 'name',
            key: 'name',
            width: 250,
            fixed: 'left' as const,
            render: (text: string, record: any) => (
                <a onClick={() => onRowClick(record)}>{text}</a>
            ),
        },
        {
            title: 'Trạng thái',
            dataIndex: 'statusName',
            key: 'statusName',
            width: 120,
            render: (text: string, record: any) => (
                <Tag color={record.statusColor}>{text}</Tag>
            ),
        },
        {
            title: 'Ưu tiên',
            dataIndex: 'priority_name',
            key: 'priority_name',
            width: 100,
            render: (text: string, record: any) => {
                const colorMap: any = {
                    'Cao': 'red',
                    'Trung bình': 'orange',
                    'Thấp': 'blue',
                };
                return <Tag color={colorMap[text] || 'default'}>{text}</Tag>;
            },
        },
        {
            title: 'Người thực hiện',
            dataIndex: 'admin_user_name',
            key: 'admin_user_name',
            width: 150,
        },
        {
            title: 'Bắt đầu',
            dataIndex: 'start',
            key: 'start',
            width: 100,
            render: (date: string) => date ? dayjs(date).format(DATE_SHOW) : '-',
        },
        {
            title: 'Kết thúc',
            dataIndex: 'end',
            key: 'end',
            width: 100,
            render: (date: string) => date ? dayjs(date).format(DATE_SHOW) : '-',
        },
        {
            title: 'Tiến độ',
            dataIndex: 'checklist_percent',
            key: 'checklist_percent',
            width: 100,
            render: (percent: number) => (
                <span>
                    {percent === 100 ? (
                        <CheckCircleOutlined style={{ color: '#52c41a', marginRight: 4 }} />
                    ) : (
                        <ClockCircleOutlined style={{ color: '#faad14', marginRight: 4 }} />
                    )}
                    {percent || 0}%
                </span>
            ),
        },
        {
            title: 'Ngày tạo',
            dataIndex: 'created_at',
            key: 'created_at',
            width: 150,
            render: (date: string) => dayjs(date).format(DATE_SHOW),
        },
    ];

    return (
        <Table
            size="small"
            rowClassName={(_, index) => index % 2 === 0 ? "even-row" : "odd-row"}
            loading={loading}
            pagination={tableParams?.pagination || false}
            dataSource={flattenedData}
            columns={listColumns}
            scroll={{ x: 1200 }}
            onRow={(record) => ({
                onClick: () => onRowClick(record),
                style: { cursor: 'pointer' }
            })}
        />
    );
};

export default TaskListView;
