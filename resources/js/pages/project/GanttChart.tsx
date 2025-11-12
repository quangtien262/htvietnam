import React, { useEffect, useRef, useState } from 'react';
import { Card, message, Spin, Empty, Button, Space } from 'antd';
import { ReloadOutlined, ArrowLeftOutlined } from '@ant-design/icons';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { taskApi } from '../../common/api/projectApi';
// @ts-ignore
import Gantt from 'frappe-gantt';

const GanttChart: React.FC = () => {
    const { id: projectId } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const ganttRef = useRef<HTMLDivElement>(null);
    const ganttInstance = useRef<any>(null);

    const [loading, setLoading] = useState(false);
    const [ganttTasks, setGanttTasks] = useState<any[]>([]);
    const [viewMode, setViewMode] = useState<'Day' | 'Week' | 'Month'>('Week');

    useEffect(() => {
        if (projectId) {
            loadGanttData();
        }
    }, [projectId]);

    useEffect(() => {
        if (ganttTasks.length > 0 && ganttRef.current) {
            renderGantt();
        }
    }, [ganttTasks, viewMode]);

    const loadGanttData = async () => {
        if (!projectId) return;

        setLoading(true);
        try {
            const response = await taskApi.getGantt(Number(projectId));

            if (response.data.success) {
                const tasks = response.data.data.map((task: any) => ({
                    id: `task-${task.id}`,
                    name: task.title,
                    start: task.start,
                    end: task.end,
                    progress: task.progress,
                    dependencies: task.dependencies.map((depId: number) => `task-${depId}`).join(', '),
                    custom_class: getTaskClass(task.status),
                }));

                setGanttTasks(tasks);
            }
        } catch (error: any) {
            message.error(error.response?.data?.message || 'Không thể tải dữ liệu Gantt');
        } finally {
            setLoading(false);
        }
    };

    const getTaskClass = (status: string) => {
        switch (status) {
            case 'Hoàn thành':
                return 'gantt-task-completed';
            case 'Đang làm':
                return 'gantt-task-inprogress';
            case 'Bị block':
                return 'gantt-task-blocked';
            default:
                return '';
        }
    };

    const renderGantt = () => {
        if (!ganttRef.current || ganttTasks.length === 0) return;

        // Destroy existing gantt instance
        if (ganttInstance.current) {
            ganttInstance.current = null;
        }

        // Clear container
        ganttRef.current.innerHTML = '';

        try {
            ganttInstance.current = new Gantt(ganttRef.current, ganttTasks, {
                view_mode: viewMode,
                date_format: 'DD/MM/YYYY',
                language: 'vi',
                custom_popup_html: (task: any) => {
                    return `
                        <div class="gantt-popup">
                            <div class="gantt-popup-title">${task.name}</div>
                            <div class="gantt-popup-content">
                                <p><strong>Từ:</strong> ${task._start.toLocaleDateString('vi-VN')}</p>
                                <p><strong>Đến:</strong> ${task._end.toLocaleDateString('vi-VN')}</p>
                                <p><strong>Tiến độ:</strong> ${task.progress}%</p>
                            </div>
                        </div>
                    `;
                },
                on_click: (task: any) => {
                    // Extract task ID from 'task-123' format
                    const taskId = parseInt(task.id.replace('task-', ''));
                    console.log('Clicked task:', taskId);
                    // Could open TaskDetail drawer here
                },
                on_date_change: (task: any, start: Date, end: Date) => {
                    console.log('Date changed:', task, start, end);
                    // Could update task dates via API here
                },
                on_progress_change: (task: any, progress: number) => {
                    console.log('Progress changed:', task, progress);
                    // Could update task progress via API here
                },
            });
        } catch (error) {
            console.error('Error rendering Gantt:', error);
            message.error('Không thể hiển thị Gantt chart');
        }
    };

    if (loading) {
        return (
            <div style={{ textAlign: 'center', padding: '100px 0' }}>
                <Spin size="large" />
            </div>
        );
    }

    if (ganttTasks.length === 0) {
        return (
            <Card>
                <Empty description="Chưa có nhiệm vụ hoặc chưa có thời gian bắt đầu/kết thúc" />
            </Card>
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
                title="Gantt Chart - Timeline dự án"
                extra={
                    <Space>
                        <Button.Group>
                            <Button
                                type={viewMode === 'Day' ? 'primary' : 'default'}
                                onClick={() => setViewMode('Day')}
                            >
                                Ngày
                            </Button>
                            <Button
                                type={viewMode === 'Week' ? 'primary' : 'default'}
                                onClick={() => setViewMode('Week')}
                            >
                                Tuần
                            </Button>
                            <Button
                                type={viewMode === 'Month' ? 'primary' : 'default'}
                                onClick={() => setViewMode('Month')}
                            >
                                Tháng
                            </Button>
                        </Button.Group>
                        <Button icon={<ReloadOutlined />} onClick={loadGanttData}>
                            Làm mới
                        </Button>
                    </Space>
                }
            >
                <div
                    ref={ganttRef}
                    style={{
                        overflowX: 'auto',
                        minHeight: '400px',
                    }}
                />
            </Card>

            <style>{`
                /* Frappe Gantt Base Styles */
                .gantt-container {
                    position: relative;
                    overflow: auto;
                    font-size: 12px;
                }
                .gantt .grid-background {
                    fill: none;
                }
                .gantt .grid-header {
                    fill: #f5f5f5;
                    stroke: #e0e0e0;
                    stroke-width: 1.4;
                }
                .gantt .grid-row {
                    fill: #ffffff;
                }
                .gantt .grid-row:nth-child(even) {
                    fill: #fafafa;
                }
                .gantt .row-line {
                    stroke: #e0e0e0;
                }
                .gantt .tick {
                    stroke: #e0e0e0;
                    stroke-width: 0.2;
                }
                .gantt .tick.thick {
                    stroke: #b0b0b0;
                    stroke-width: 0.4;
                }
                .gantt .today-highlight {
                    fill: #fcf8e3;
                    opacity: 0.5;
                }
                
                /* Grid Text Labels */
                .gantt text {
                    fill: #595959 !important;
                    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                }
                
                .gantt .arrow {
                    fill: none;
                    stroke: #666;
                    stroke-width: 1.4;
                }
                .gantt .bar {
                    fill: #1890ff;
                    stroke: #0050b3;
                    stroke-width: 0;
                    transition: stroke-width 0.3s ease;
                    opacity: 0.8;
                }
                .gantt .bar:hover {
                    opacity: 1;
                }
                .gantt .bar-progress {
                    fill: #096dd9;
                }
                .gantt .bar-label {
                    fill: #fff;
                    dominant-baseline: central;
                    text-anchor: middle;
                    font-size: 11px;
                    font-weight: lighter;
                }
                .gantt .bar-label.big {
                    fill: #555;
                    text-anchor: start;
                }
                .gantt .handle {
                    fill: #ddd;
                    cursor: ew-resize;
                    opacity: 0;
                    visibility: hidden;
                    transition: opacity 0.3s ease;
                }
                .gantt .bar-wrapper:hover .handle {
                    visibility: visible;
                    opacity: 1;
                }
                .gantt .lower-text, .gantt .upper-text {
                    font-size: 11px;
                    text-anchor: middle;
                }
                .gantt .upper-text {
                    fill: #555;
                }
                .gantt .lower-text {
                    fill: #333;
                    font-weight: 500;
                }

                /* Custom Task Colors */
                .gantt-task-completed {
                    fill: #52c41a !important;
                }
                .gantt-task-inprogress {
                    fill: #1890ff !important;
                }
                .gantt-task-blocked {
                    fill: #ff4d4f !important;
                }

                /* Popup Styles */
                .gantt-popup {
                    background: white;
                    border-radius: 4px;
                    padding: 12px;
                    box-shadow: 0 2px 8px rgba(0,0,0,0.15);
                }
                .gantt-popup-title {
                    font-weight: bold;
                    margin-bottom: 8px;
                    color: #262626;
                }
                .gantt-popup-content p {
                    margin: 4px 0;
                    font-size: 13px;
                    color: #595959;
                }
            `}</style>
        </div>
    );
};

export default GanttChart;
