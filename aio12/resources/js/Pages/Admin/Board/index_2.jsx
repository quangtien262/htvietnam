import { useState } from "react";
import AdminLayout from "@/Layouts/AdminLayout";
import {
    Button,
    Modal,
    Row,
    Col,
} from "antd";

import { Link } from "@inertiajs/react";
import { PlusCircleOutlined} from "@ant-design/icons";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import "../../../../css/list02.css";

export default function Dashboard(props) {
    const [isModalNgungKinhDoanhOpen, setIsModalNgungKinhDoanhOpen] = useState(0);
    const [isModalXoaOpen, setIsModalXoaOpen] = useState(0);

    

    const initialTasks = {
        todo: [
            { id: "task-1", 
                content: <div>
                    <p><b>Task 01</b></p>
                    <p>Des01</p>
                </div> 
            },
            { id: "task-1.1", 
                content: <div>
                    <p><b>Task 01</b></p>
                    <p>Des01</p>
                </div> 
            },
            { id: "task-1.2", 
                content: <div>
                    <p><b>Task 01</b></p>
                    <p>Des01</p>
                </div> 
            },
        ],
        doing: [
            { id: "task-3", content: "Fix bugs" },
        ],
        done: [
            { id: "task-4", content: "Submit invoice" },
        ],
    };

    const [tasks, setTasks] = useState(initialTasks);
    

    const onDragEnd = (result) => {
        const { source, destination } = result;

        // Không có đích (bị thả ra ngoài)
        if (!destination) return;

        // Kéo trong cùng một cột
        if (source.droppableId === destination.droppableId) {
            const items = Array.from(tasks[source.droppableId]);
            const [reorderedItem] = items.splice(source.index, 1);
            items.splice(destination.index, 0, reorderedItem);

            setTasks({
                ...tasks,
                [source.droppableId]: items,
            });
        } else {
            // Kéo giữa hai cột khác nhau
            const sourceItems = Array.from(tasks[source.droppableId]);
            const destItems = Array.from(tasks[destination.droppableId]);
            const [movedItem] = sourceItems.splice(source.index, 1);
            destItems.splice(destination.index, 0, movedItem);

            setTasks({
                ...tasks,
                [source.droppableId]: sourceItems,
                [destination.droppableId]: destItems,
            });
        }
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
                            <Col>
                                <div style={{ display: "flex", justifyContent: "center", gap: "2rem", marginTop: "2rem" }}>
                                    <DragDropContext onDragEnd={onDragEnd}>
                                        {Object.entries(tasks).map(([columnId, columnTasks]) => (
                                            <Droppable key={columnId} droppableId={columnId}>
                                                {(provided, snapshot) => (
                                                    <div
                                                        ref={provided.innerRef}
                                                        {...provided.droppableProps}
                                                        style={{
                                                            background: snapshot.isDraggingOver ? "#d0f0fd" : "#f0f0f0",
                                                            padding: 16,
                                                            width: 250,
                                                            minHeight: 500,
                                                            borderRadius: 8,
                                                        }}
                                                    >   
                                                        {/* Title column */}
                                                        <h3 style={{ textTransform: "capitalize" }}>{columnId}</h3>

                                                        {/* content */}
                                                        {columnTasks.map((task, index) => (
                                                            <Draggable key={task.id} draggableId={task.id} index={index}>
                                                                {(provided, snapshot) => (
                                                                    <div
                                                                        ref={provided.innerRef}
                                                                        {...provided.draggableProps}
                                                                        {...provided.dragHandleProps}
                                                                        style={{
                                                                            userSelect: "none",
                                                                            padding: 16,
                                                                            margin: "0 0 8px 0",
                                                                            minHeight: "50px",
                                                                            backgroundColor: snapshot.isDragging ? "#00bcd4" : "#ffffff",
                                                                            color: "#333",
                                                                            borderRadius: 4,
                                                                            boxShadow: "0 2px 5px rgba(0,0,0,0.1)",
                                                                            ...provided.draggableProps.style,
                                                                        }}
                                                                    >
                                                                        {task.content}
                                                                    </div>
                                                                )}
                                                            </Draggable>
                                                        ))}
                                                        {provided.placeholder}
                                                    </div>
                                                )}
                                            </Droppable>
                                        ))}
                                    </DragDropContext>
                                </div>
                            </Col>


                        </Row>

                    </div>
                }
            />
        </div>
    );
}
