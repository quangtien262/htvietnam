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
            // Delay rendering to ensure DOM is ready
            const timer = setTimeout(() => {
                renderGantt();
            }, 100);
            return () => clearTimeout(timer);
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
        const container = ganttRef.current;

        if (!container || ganttTasks.length === 0) {
            console.log('Cannot render Gantt: ref or tasks missing', {
                hasRef: !!container,
                tasksLength: ganttTasks.length
            });
            return;
        }

        // Double check container exists and is in DOM
        if (!document.body.contains(container)) {
            console.error('Gantt container is not in DOM');
            return;
        }

        // Check if container has proper dimensions
        const rect = container.getBoundingClientRect();
        if (rect.width === 0 || rect.height === 0) {
            console.warn('Gantt container has zero dimensions, retrying...', rect);
            setTimeout(() => renderGantt(), 100);
            return;
        }

        // Destroy existing gantt instance
        if (ganttInstance.current) {
            try {
                ganttInstance.current = null;
            } catch (error) {
                console.error('Error destroying Gantt instance:', error);
            }
        }

        // Clear container safely
        try {
            while (container.firstChild) {
                container.removeChild(container.firstChild);
            }
        } catch (error) {
            console.error('Error clearing container:', error);
            container.innerHTML = '';
        }

        // Initialize Gantt with error handling
        try {
            console.log('Initializing Gantt with tasks:', ganttTasks.length);

            ganttInstance.current = new Gantt(container, ganttTasks, {
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
                    const taskId = parseInt(task.id.replace('task-', ''));
                    console.log('Clicked task:', taskId);
                },
                on_date_change: (task: any, start: Date, end: Date) => {
                    console.log('Date changed:', task, start, end);
                },
                on_progress_change: (task: any, progress: number) => {
                    console.log('Progress changed:', task, progress);
                },
            });

            console.log('Gantt initialized successfully');
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
                title={
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <div
                            style={{
                                width: 4,
                                height: 24,
                                background: 'linear-gradient(180deg, #1890ff 0%, #096dd9 100%)',
                                borderRadius: 2,
                            }}
                        />
                        <span style={{ fontSize: 18, fontWeight: 600, color: '#262626' }}>
                            Gantt Chart - Timeline Dự án
                        </span>
                    </div>
                }
                extra={
                    <Space size="middle">
                        <div style={{
                            display: 'flex',
                            gap: 8,
                            padding: '4px 6px',
                            background: '#f5f5f5',
                            borderRadius: 8,
                        }}>
                            <Button
                                type={viewMode === 'Day' ? 'primary' : 'text'}
                                onClick={() => setViewMode('Day')}
                                size="small"
                                style={{
                                    borderRadius: 6,
                                    fontWeight: 500,
                                }}
                            >
                                📅 Ngày
                            </Button>
                            <Button
                                type={viewMode === 'Week' ? 'primary' : 'text'}
                                onClick={() => setViewMode('Week')}
                                size="small"
                                style={{
                                    borderRadius: 6,
                                    fontWeight: 500,
                                }}
                            >
                                📆 Tuần
                            </Button>
                            <Button
                                type={viewMode === 'Month' ? 'primary' : 'text'}
                                onClick={() => setViewMode('Month')}
                                size="small"
                                style={{
                                    borderRadius: 6,
                                    fontWeight: 500,
                                }}
                            >
                                📊 Tháng
                            </Button>
                        </div>
                        <Button
                            icon={<ReloadOutlined />}
                            onClick={loadGanttData}
                            style={{
                                borderRadius: 8,
                                fontWeight: 500,
                            }}
                        >
                            Làm mới
                        </Button>
                    </Space>
                }
                style={{
                    borderRadius: 12,
                    boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                }}
                styles={{
                    body: {
                        padding: 24,
                    },
                }}
            >
                <div style={{ position: 'relative', width: '100%' }}>
                    <div
                        ref={ganttRef}
                        style={{
                            overflowX: 'auto',
                            minHeight: '450px',
                            background: '#fafafa',
                            borderRadius: 8,
                            padding: '16px 0',
                        }}
                    />
                </div>
            </Card>

            <style>{`
                /* Modern Gantt Chart Styles */
                .gantt-container {
                    position: relative;
                    overflow: auto;
                    font-size: 13px;
                    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                }

                /* Grid Styling */
                .gantt .grid-background {
                    fill: none;
                }

                .gantt .grid-header {
                    fill: #ffffff;
                    stroke: #d9d9d9;
                    stroke-width: 1;
                }

                .gantt .grid-row {
                    fill: #ffffff;
                    transition: fill 0.2s ease;
                }

                .gantt .grid-row:nth-child(even) {
                    fill: #f9f9f9;
                }

                .gantt .grid-row:hover {
                    fill: #f0f5ff !important;
                }

                .gantt .row-line {
                    stroke: #e8e8e8;
                    stroke-width: 0.5;
                }

                .gantt .tick {
                    stroke: #e8e8e8;
                    stroke-width: 0.3;
                }

                .gantt .tick.thick {
                    stroke: #bfbfbf;
                    stroke-width: 0.6;
                }

                .gantt .today-highlight {
                    fill: #e6f7ff;
                    opacity: 0.6;
                }

                /* Text Styling */
                .gantt text {
                    fill: #595959 !important;
                    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                    font-weight: 500;
                }

                /* Arrow Styling */
                .gantt .arrow {
                    fill: none;
                    stroke: #8c8c8c;
                    stroke-width: 1.5;
                    marker-end: url(#arrowhead);
                }

                /* Modern Task Bar with Gradient */
                .gantt .bar {
                    fill: url(#taskGradient);
                    stroke: #096dd9;
                    stroke-width: 0;
                    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                    opacity: 0.9;
                    rx: 4;
                    ry: 4;
                    filter: drop-shadow(0 2px 4px rgba(0,0,0,0.1));
                }

                .gantt .bar:hover {
                    opacity: 1;
                    filter: drop-shadow(0 4px 8px rgba(0,0,0,0.15));
                    transform: translateY(-1px);
                }

                .gantt .bar-progress {
                    fill: url(#progressGradient);
                    rx: 4;
                    ry: 4;
                }

                .gantt .bar-label {
                    fill: #ffffff;
                    dominant-baseline: central;
                    text-anchor: middle;
                    font-size: 12px;
                    font-weight: 600;
                    text-shadow: 0 1px 2px rgba(0,0,0,0.2);
                }

                .gantt .bar-label.big {
                    fill: #262626;
                    text-anchor: start;
                    font-weight: 500;
                    text-shadow: none;
                }

                /* Handle for Resizing */
                .gantt .handle {
                    fill: #ffffff;
                    stroke: #1890ff;
                    stroke-width: 2;
                    cursor: ew-resize;
                    opacity: 0;
                    visibility: hidden;
                    transition: opacity 0.2s ease;
                    rx: 2;
                    ry: 2;
                }

                .gantt .bar-wrapper:hover .handle {
                    visibility: visible;
                    opacity: 0.9;
                }

                .gantt .handle:hover {
                    opacity: 1;
                    fill: #e6f7ff;
                }

                /* Date Labels */
                .gantt .lower-text, .gantt .upper-text {
                    font-size: 12px;
                    text-anchor: middle;
                    font-weight: 500;
                }

                .gantt .upper-text {
                    fill: #8c8c8c;
                    font-size: 11px;
                    font-weight: 400;
                }

                .gantt .lower-text {
                    fill: #262626;
                    font-weight: 600;
                }

                /* Custom Task Status Colors with Gradients */
                .gantt-task-completed {
                    fill: url(#completedGradient) !important;
                    stroke: #389e0d !important;
                }

                .gantt-task-inprogress {
                    fill: url(#inprogressGradient) !important;
                    stroke: #096dd9 !important;
                }

                .gantt-task-blocked {
                    fill: url(#blockedGradient) !important;
                    stroke: #cf1322 !important;
                }

                /* Modern Popup Styles */
                .gantt-popup {
                    background: linear-gradient(135deg, #ffffff 0%, #f9f9f9 100%);
                    border-radius: 12px;
                    padding: 16px;
                    box-shadow: 0 8px 24px rgba(0,0,0,0.12), 0 2px 8px rgba(0,0,0,0.08);
                    border: 1px solid #e8e8e8;
                    min-width: 240px;
                }

                .gantt-popup-title {
                    font-weight: 600;
                    font-size: 15px;
                    margin-bottom: 12px;
                    color: #262626;
                    padding-bottom: 10px;
                    border-bottom: 2px solid #f0f0f0;
                }

                .gantt-popup-content p {
                    margin: 8px 0;
                    font-size: 13px;
                    color: #595959;
                    display: flex;
                    align-items: center;
                    gap: 8px;
                }

                .gantt-popup-content strong {
                    color: #262626;
                    font-weight: 600;
                    min-width: 70px;
                    display: inline-block;
                }

                /* Add gradient definitions */
                .gantt svg defs {
                    display: none;
                }

                /* Scrollbar Styling */
                .gantt-container::-webkit-scrollbar {
                    width: 10px;
                    height: 10px;
                }

                .gantt-container::-webkit-scrollbar-track {
                    background: #f0f0f0;
                    border-radius: 5px;
                }

                .gantt-container::-webkit-scrollbar-thumb {
                    background: linear-gradient(180deg, #bfbfbf 0%, #8c8c8c 100%);
                    border-radius: 5px;
                    border: 2px solid #f0f0f0;
                }

                .gantt-container::-webkit-scrollbar-thumb:hover {
                    background: linear-gradient(180deg, #8c8c8c 0%, #595959 100%);
                }

                /* Add SVG gradients inline */
                .gantt svg {
                    background: transparent;
                }
            `}</style>

            {/* Add gradient definitions */}
            <svg width="0" height="0" style={{ position: 'absolute' }}>
                <defs>
                    <linearGradient id="taskGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stopColor="#40a9ff" stopOpacity="1" />
                        <stop offset="100%" stopColor="#1890ff" stopOpacity="1" />
                    </linearGradient>
                    <linearGradient id="progressGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stopColor="#096dd9" stopOpacity="1" />
                        <stop offset="100%" stopColor="#0050b3" stopOpacity="1" />
                    </linearGradient>
                    <linearGradient id="completedGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stopColor="#73d13d" stopOpacity="1" />
                        <stop offset="100%" stopColor="#52c41a" stopOpacity="1" />
                    </linearGradient>
                    <linearGradient id="inprogressGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stopColor="#40a9ff" stopOpacity="1" />
                        <stop offset="100%" stopColor="#1890ff" stopOpacity="1" />
                    </linearGradient>
                    <linearGradient id="blockedGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stopColor="#ff7875" stopOpacity="1" />
                        <stop offset="100%" stopColor="#ff4d4f" stopOpacity="1" />
                    </linearGradient>
                </defs>
            </svg>
        </div>
    );
};

export default GanttChart;
