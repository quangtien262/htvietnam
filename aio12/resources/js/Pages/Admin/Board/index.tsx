import React, { useState, useEffect } from "react";
import AdminLayout from "@/Layouts/AdminLayout";
import { Head } from "@inertiajs/inertia-react";

import { Card, Button, Modal, Input } from 'antd';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';


const columnsFromAPI = {
  todo: [],
  doing: [],
  done: [],
};
export default function Dashboard(props) {
  const [columns, setColumns] = useState(board.columns);

  const onDragEnd = result => {
    // handle logic update task position here
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
            <DragDropContext onDragEnd={onDragEnd}>
              <div style={{ display: 'flex', gap: '16px', overflowX: 'auto' }}>
                {columns.map(column => (
                  <Column key={column.id} column={column} />
                ))}
              </div>
            </DragDropContext>
          </div>
        }
      />
    </div>
  );
}
