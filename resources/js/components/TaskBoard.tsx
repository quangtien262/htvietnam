import React, { useEffect, useState } from "react";
import {
  DragDropContext,
  Droppable,
  Draggable,
} from "react-beautiful-dnd";
import {
  getTasks,
  createTask,
  updateTask,
  deleteTask,
} from "../Function/api";

const columnsFromAPI = {
  todo: [],
  doing: [],
  done: [],
};

const TaskBoard = () => {
  const [columns, setColumns] = useState(columnsFromAPI);
  const [taskInput, setTaskInput] = useState("");

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    const res = await getTasks();
    const grouped = { todo: [], doing: [], done: [] };
    res.data.forEach((task) => grouped[task.status].push(task));
    setColumns(grouped);
  };

  const handleAddTask = async () => {
    if (!taskInput.trim()) return;
    const res = await createTask({ content: taskInput, status: "todo" });
    setColumns((prev) => ({
      ...prev,
      todo: [...prev.todo, res.data],
    }));
    setTaskInput("");
  };

  const handleDelete = async (id, status) => {
    await deleteTask(id);
    setColumns((prev) => ({
      ...prev,
      [status]: prev[status].filter((t) => t.id !== id),
    }));
  };

  const onDragEnd = async (result) => {
    const { source, destination } = result;
    if (!destination) return;

    const sourceCol = [...columns[source.droppableId]];
    const destCol = [...columns[destination.droppableId]];
    const [moved] = sourceCol.splice(source.index, 1);

    moved.status = destination.droppableId;
    await updateTask(moved.id, moved);

    destCol.splice(destination.index, 0, moved);
    setColumns({
      ...columns,
      [source.droppableId]: sourceCol,
      [destination.droppableId]: destCol,
    });
  };

  return (
    <div>
      <div className="flex mb-4">
        <input
          className="flex-1 p-2 border rounded"
          placeholder="New task..."
          value={taskInput}
          onChange={(e) => setTaskInput(e.target.value)}
        />
        <button
          className="ml-2 bg-blue-500 text-white px-4 py-2 rounded"
          onClick={handleAddTask}
        >
          Add
        </button>
      </div>

      <DragDropContext onDragEnd={onDragEnd}>
        <div className="grid grid-cols-3 gap-4">
          {Object.entries(columns).map(([status, tasks]) => (
            <Droppable key={status} droppableId={status}>
              {(provided, snapshot) => (
                <div
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  className={`bg-gray-100 rounded p-4 min-h-[400px] ${
                    snapshot.isDraggingOver ? "bg-blue-100" : ""
                  }`}
                >
                  <h2 className="font-semibold text-lg mb-2 capitalize">{status}</h2>
                  {tasks.map((task, index) => (
                    <Draggable key={task.id} draggableId={task.id.toString()} index={index}>
                      {(provided, snapshot) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                          className={`bg-white p-3 mb-2 rounded shadow ${
                            snapshot.isDragging ? "bg-blue-200" : ""
                          }`}
                        >
                          <div>{task.content}</div>
                          <button
                            className="text-sm text-red-500 mt-1"
                            onClick={() => handleDelete(task.id, status)}
                          >
                            Delete
                          </button>
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
  );
};

export default TaskBoard;
