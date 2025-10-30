import React from "react";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import { Tag } from "antd";
import dayjs from "dayjs";
import { callApi } from "../../../Function/api";
import { Link, router } from "@inertiajs/react";

export default function TaskKanbanBoard({
    columns,
    onDragEnd,
    icon,
    priority,
    users,
    setOpenDetail,
    setDataAction,
    setChecklist,
    setChecklistPercent,
    setComments,
    setTaskLog,
    formDesc
}: any) {




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
                                    width: 280,
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
                                                        onClick={async () => {
                                                            setOpenDetail(true);
                                                            setDataAction(task);
                                                            const res = await callApi(route('task.getTaskInfo', [task.id]));
                                                            setChecklist(res.data.data.checklist);
                                                            setChecklistPercent(res.data.data.percent);
                                                            setComments(res.data.data.comments);
                                                            setTaskLog(res.data.data.logs);
                                                            if (formDesc) {
                                                                formDesc.setFieldValue('description', task.description);
                                                            }
                                                        }}
                                                    >
                                                        {task.task_priority_name ? <Tag color={task.task_priority_color}>{task.task_priority_name}</Tag> : ''}
                                                        {task.name}
                                                    </h3>

                                                    <p className="description01">{task.description}</p>

                                                    {!task.nguoi_thuc_hien || task.nguoi_thuc_hien === null ? '' : <Tag>{users[task.nguoi_thuc_hien].name}</Tag>}
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
