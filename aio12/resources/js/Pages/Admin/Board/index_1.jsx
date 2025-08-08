import React, { useState, useEffect } from "react";
import AdminLayout from "@/Layouts/AdminLayout";
import { Head } from "@inertiajs/inertia-react";
import {
  Button,
  Modal,
  Row,
  Col
} from "antd";

import { Link, router } from "@inertiajs/react";
import {PlusCircleOutlined} from "@ant-design/icons";

import "../../../../css/list02.css";
import { v4 as uuidv4 } from "uuid";

import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";

export default function Dashboard(props) {
  const [isModalNgungKinhDoanhOpen, setIsModalNgungKinhDoanhOpen] = useState(0);
  const [isModalXoaOpen, setIsModalXoaOpen] = useState(0);

  // Initial state
  const initialTasks = {
    todo: [],
    doing: [],
    done: [],
  };


  const [tasks, setTasks] = useState(initialTasks);
  const [newTask, setNewTask] = useState("");
  const [editingTaskId, setEditingTaskId] = useState(null);
  const [editingText, setEditingText] = useState("");

  // Xử lý drag & drop
  const onDragEnd = (result) => {
    const { source, destination } = result;
    if (!destination) return;

    const sourceCol = tasks[source.droppableId];
    const destCol = tasks[destination.droppableId];
    const [moved] = sourceCol.splice(source.index, 1);

    if (source.droppableId === destination.droppableId) {
      sourceCol.splice(destination.index, 0, moved);
      setTasks({ ...tasks, [source.droppableId]: sourceCol });
    } else {
      destCol.splice(destination.index, 0, moved);
      setTasks({
        ...tasks,
        [source.droppableId]: sourceCol,
        [destination.droppableId]: destCol,
      });
    }
  };

  // Thêm task vào "todo"
  const addTask = () => {
    if (!newTask.trim()) return;
    const newItem = { id: uuidv4(), content: newTask };
    setTasks((prev) => ({
      ...prev,
      todo: [...prev.todo, newItem],
    }));
    setNewTask("");
  };

  // Xoá task
  const deleteTask = (columnId, taskId) => {
    const updated = tasks[columnId].filter((t) => t.id !== taskId);
    setTasks({ ...tasks, [columnId]: updated });
  };

  // Bắt đầu sửa
  const startEdit = (taskId, content) => {
    setEditingTaskId(taskId);
    setEditingText(content);
  };

  // Lưu sửa
  const saveEdit = (columnId) => {
    const updated = tasks[columnId].map((t) =>
      t.id === editingTaskId ? { ...t, content: editingText } : t
    );
    setTasks({ ...tasks, [columnId]: updated });
    setEditingTaskId(null);
    setEditingText("");
  };

  return (
    <div>
      <AdminLayout
        auth={props.auth}
        header={'Hóa Đơn'}
        tables={props.tables}
        current={props.table}
        content={
          <div>
            <Modal title="Xác nhận Ngừng Kinh Doanh"
              open={isModalNgungKinhDoanhOpen}
              // onOk={ngungKinhDoanh} 
              okText="Ngừng kinh doanh"
              cancelText="Hủy"
            // onCancel={handleCancel}
            >
              <p>Các hàng hóa ngừng kinh doanh sẽ không hiển thị ở danh sách hàng hóa nữa. Bạn có thể xem lại ở phần
                <em>hàng hóa ngừng kinh doanh</em>.</p>

            </Modal>
            <Modal title="Xác nhận xóa"
              open={isModalXoaOpen}
              // onOk={deleteProduct} 
              okText="Đồng ý xóa"
              cancelText="Hủy"
            // onCancel={handleCancelDelete}
            >
              <p>Các thông tin về hàng hóa này sẽ bị xóa hoàn toàn</p>
            </Modal>


            <Row>
              {/* title */}
              <Col sm={{ span: 24 }}>
                <Row>
                  <Col sm={{ span: 8 }}>
                    <p className="title01">Quản lý công việc</p>
                  </Col>
                  <Col sm={{ span: 8 }}>

                  </Col>
                  <Col sm={{ span: 8 }}>
                    <Link>
                      <Button type="primary" className="_right">
                        <PlusCircleOutlined />Thêm mới
                      </Button>
                    </Link>
                  </Col>
                </Row>

              </Col>

              {/* content */}
              <div style={{ padding: 20 }}>
                <h2>Task Manager with Drag & Drop</h2>
                <div style={{ marginBottom: 16 }}>
                  <input
                    type="text"
                    value={newTask}
                    onChange={(e) => setNewTask(e.target.value)}
                    placeholder="New task..."
                  />
                  <button onClick={addTask} style={{ marginLeft: 8 }}>
                    Add
                  </button>
                </div>

                <DragDropContext onDragEnd={onDragEnd}>
                  <div style={{ display: "flex", gap: "1.5rem" }}>
                    {Object.entries(tasks).map(([columnId, columnTasks]) => (
                      <Droppable key={columnId} droppableId={columnId}>
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.droppableProps}
                            style={{
                              backgroundColor: snapshot.isDraggingOver
                                ? "#e0f7fa"
                                : "#f1f1f1",
                              padding: 16,
                              borderRadius: 8,
                              width: 250,
                              minHeight: 500,
                            }}
                          >
                            <h3 style={{ textTransform: "capitalize" }}>{columnId}</h3>
                            {columnTasks.map((task, index) => (
                              <Draggable
                                key={task.id}
                                draggableId={task.id}
                                index={index}
                              >
                                {(provided, snapshot) => (
                                  <div
                                    ref={provided.innerRef}
                                    {...provided.draggableProps}
                                    {...provided.dragHandleProps}
                                    style={{
                                      padding: 10,
                                      marginBottom: 8,
                                      backgroundColor: "#fff",
                                      borderRadius: 4,
                                      boxShadow: "0 1px 4px rgba(0,0,0,0.1)",
                                      ...provided.draggableProps.style,
                                    }}
                                  >
                                    {editingTaskId === task.id ? (
                                      <>
                                        <input
                                          value={editingText}
                                          onChange={(e) =>
                                            setEditingText(e.target.value)
                                          }
                                          style={{ width: "100%" }}
                                        />
                                        <button
                                          onClick={() => saveEdit(columnId)}
                                          style={{ marginTop: 4 }}
                                        >
                                          Save
                                        </button>
                                      </>
                                    ) : (
                                      <>
                                        <div>{task.content}</div>
                                        <div style={{ marginTop: 6 }}>
                                          <button
                                            onClick={() =>
                                              startEdit(task.id, task.content)
                                            }
                                            style={{ marginRight: 6 }}
                                          >
                                            Edit
                                          </button>
                                          <button
                                            onClick={() =>
                                              deleteTask(columnId, task.id)
                                            }
                                          >
                                            Delete
                                          </button>
                                        </div>
                                      </>
                                    )}
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
              </div>


            </Row>

          </div>
        }
      />
    </div>
  );
}
