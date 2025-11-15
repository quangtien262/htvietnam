import React, { useEffect, useState } from 'react';
import { Card, message, Spin, Empty, Button, Space } from 'antd';
import { ReloadOutlined, ArrowLeftOutlined } from '@ant-design/icons';
import { useParams, useNavigate } from 'react-router-dom';
import { taskApi } from '../../common/api/projectApi';
import { Gantt, Task, ViewMode } from 'gantt-task-react';
import 'gantt-task-react/dist/index.css';

const GanttChart: React.FC = () => {
    const { id: projectId } = useParams<{ id: string }>();
    const navigate = useNavigate();

    const [loading, setLoading] = useState(false);
    const [ganttTasks, setGanttTasks] = useState<Task[]>([]);
    const [viewMode, setViewMode] = useState<ViewMode>(ViewMode.Week);

    useEffect(() => {
        if (projectId) {
            loadGanttData();
        }
    }, [projectId]);

    const loadGanttData = async () => {
        if (!projectId) return;

        setLoading(true);
        try {
            const response = await taskApi.getGantt(Number(projectId));

            if (response.data.success) {
                const tasks: Task[] = response.data.data.map((task: any) => {
                    const startDate = new Date(task.start);
                    const endDate = new Date(task.end);

                    return {
                        id: `task-${task.id}`,
                        name: task.title || 'Untitled Task',
                        start: startDate,
                        end: endDate,
                        progress: task.progress || 0,
                        type: 'task',
                        styles: {
                            backgroundColor: getTaskColor(task.status),
                            progressColor: '#52c41a',
                            progressSelectedColor: '#389e0d',
                        },
                    } as Task;
                });

                setGanttTasks(tasks);
            }
        } catch (error: any) {
            message.error(error.response?.data?.message || 'Không thể tải dữ liệu Gantt');
        } finally {
            setLoading(false);
        }
    };

    const getTaskColor = (status: string) => {
        switch (status) {
            case 'Hoàn thành':
                return '#52c41a';
            case 'Đang làm':
                return '#1890ff';
            case 'Bị block':
                return '#ff4d4f';
            default:
                return '#8c8c8c';
        }
    };

    if (loading) {
        return (
            <div style={{ textAlign: 'center', padding: '100px 0' }}>
                <Spin size="large" />
            </div>
        );
    }

    if (!loading && ganttTasks.length === 0) {
        return (
            <div style={{ padding: 24 }}>
                <div style={{ marginBottom: 16 }}>
                    <Button icon={<ArrowLeftOutlined />} onClick={() => navigate(-1)}>
                        Quay lại
                    </Button>
                </div>
                <Card>
                    <Empty description="Chưa có nhiệm vụ hoặc chưa có thời gian bắt đầu/kết thúc" />
                </Card>
            </div>
        );
    }

    return (
        <div style={{ padding: 24 }}>
            <div style={{ marginBottom: 16 }}>
                <Button
                    icon={<ArrowLeftOutlined />}
                    onClick={() => navigate(-1)}
                >
                    Quay lại
                </Button>
            </div>
            <Card
                title={
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <div style={{ width: 4, height: 24, background: 'linear-gradient(180deg, #1890ff 0%, #096dd9 100%)', borderRadius: 2 }} />
                        <span style={{ fontSize: 18, fontWeight: 600 }}>Gantt Chart</span>
                    </div>
                }
                extra={
                    <Space>
                        <Button type={viewMode === ViewMode.Day ? 'primary' : 'text'} onClick={() => setViewMode(ViewMode.Day)} size="small">📅 Ngày</Button>
                        <Button type={viewMode === ViewMode.Week ? 'primary' : 'text'} onClick={() => setViewMode(ViewMode.Week)} size="small">📆 Tuần</Button>
                        <Button type={viewMode === ViewMode.Month ? 'primary' : 'text'} onClick={() => setViewMode(ViewMode.Month)} size="small">📊 Tháng</Button>
                        <Button icon={<ReloadOutlined />} onClick={loadGanttData}>Làm mới</Button>
                    </Space>
                }
                styles={{ body: { padding: 24 } }}
            >
                <Gantt tasks={ganttTasks} viewMode={viewMode} listCellWidth="" columnWidth={65} />
            </Card>
        </div>
    );
};

export default GanttChart;
