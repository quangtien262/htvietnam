import React from "react";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { Tag } from "antd";
import dayjs from "dayjs";
import axios from "../../utils/axiosConfig";
import { API } from "../../common/api";

export default function TaskKanbanBoard({
    columns,
    onDragEnd,
    icon,
    setOpenDetail,
    setDataAction,
    setChecklist,
    setChecklistPercent,
    setComments,
    setTaskLog,
    formDesc,
    setLoading
}: any) {

    function clickTaskName(task: any) {
        setOpenDetail(true);
        setLoading(true);
        setDataAction(task);
        axios.post(API.taskInfo, {
            parentName: task.parent_name,
            currentTable: task.current_table,
            id: task.id
        })
            .then((res) => {
                setLoading(false);
                const taskData = res.data.data.task;
                setDataAction(taskData);
                setChecklist(res.data.data.checklist);
                setChecklistPercent(res.data.data.percent);
                setComments(res.data.data.comments);
                setTaskLog(res.data.data.taskLog);
                if (formDesc) {
                    formDesc.setFieldValue('description', taskData.description);
                }
            })
            .catch((err) => {
                console.error('Lỗi khi gọi API editConfigTask:', err);
            });
    }


    return (
        <DragDropContext onDragEnd={onDragEnd}>
            <div style={{ display: "flex", gap: "5px" }}>
                {Object.entries(columns).map(([idx, value]: any) => (
                    <Droppable key={idx} droppableId={value.status.id.toString()} index={idx}>
                        {(provided, snapshot) => (
                            <div
                                ref={provided.innerRef}
                                {...provided.droppableProps}
                                style={{
                                    backgroundColor: snapshot.isDraggingOver
                                        ? "#e0f7fa"
                                        : "#f1f1f1",
                                    borderRadius: 8,
                                    width: value.status.width, // 280
                                    minHeight: 500
                                }}
                                className={`main-task bg-gray-100 rounded p-4 min-h-[400px] ${snapshot.isDraggingOver ? "bg-blue-100" : ""}`}
                            >
                                {/* show status name */}
                                <p className="title-task"
                                    style={{
                                        backgroundColor: value.status.background ? value.status.background : '#64748b',
                                        color: value.status.color ? value.status.color : '#64748b',
                                    }}
                                >
                                    {value.status.icon ? icon[value.status.icon] : ''}
                                    <span> </span>
                                    {value.status.name}
                                </p>

                                {value.datas.map((task: any, index: number) => (
                                    <Draggable key={task.id} draggableId={task.id.toString()} index={index}>
                                        {(provided, snapshot) => (
                                            <div
                                                ref={provided.innerRef}
                                                {...provided.draggableProps}
                                                {...provided.dragHandleProps}
                                                style={{
                                                    ...provided.draggableProps.style,
                                                }}
                                                className={`item-task bg-white p-3 mb-2 rounded shadow ${snapshot.isDragging ? "bg-blue-200" : ""}`}
                                            >
                                                <div className="">
                                                    <h3 className="title04 click"
                                                        onClick={() => clickTaskName(task)}
                                                    >
                                                        {task.task_priority_name ? <Tag className="tag-priority" color={task.task_priority_color}>{task.task_priority_name}</Tag> : ''}
                                                        {task.name}
                                                    </h3>

                                                    <p className="description01">{task.description}</p>

                                                    {!task.nguoi_thuc_hien || task.nguoi_thuc_hien === null ? '' : <Tag>{task.assignee_name}</Tag>}
                                                    <p className="deadline"><em>{task.end ? dayjs(task.end).format('DD/MM/YYYY') : ''}</em></p>
                                                </div>
                                            </div>
                                        )}
                                    </Draggable>
                                ))}
                                {provided.placeholder}
                            </div>
                        )}
                    </Droppable>
                ))}
            </div>
        </DragDropContext>
    );
}
