import React, { useState, useEffect, useContext, useMemo } from "react";
import AdminLayout from "@/layouts/AdminLayout";
import {
  Button,
  message,
  Modal,
  Form, Input, Timeline,
  Popconfirm, Popover,
  Select, Checkbox,
  Row,
  Space, Flex, Progress,
  Tag,
  DatePicker,
  Empty,
  notification,
  Divider, Tree,
  Tabs,
  Col, Drawer,
  Radio, List,
  TableColumnsType,
  Table
} from "antd";
import axios from "axios";
import {
  FieldTimeOutlined, FlagFilled,
  DownOutlined,
  ToolFilled, ProfileOutlined,
  DeleteOutlined,
  EditOutlined, EyeOutlined, CaretRightFilled,
  SettingOutlined,
  InfoCircleFilled, FireFilled,
  PlusSquareFilled, CheckSquareFilled,
  CheckOutlined, HddFilled,
  CloseSquareOutlined,
  ArrowRightOutlined, CheckCircleOutlined,
  SnippetsFilled,
  CheckSquareOutlined, UserOutlined, UsergroupAddOutlined,
  UserSwitchOutlined, PushpinFilled,
  SettingFilled, EditFilled,
  HomeOutlined, PlusCircleFilled, PlusCircleOutlined, HolderOutlined
} from "@ant-design/icons";

// start import DND
import type { DragEndEvent } from '@dnd-kit/core';
import { DndContext } from '@dnd-kit/core';
import type { SyntheticListenerMap } from '@dnd-kit/core/dist/hooks/utilities';
import { restrictToVerticalAxis } from '@dnd-kit/modifiers';
import {
  arrayMove,
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
// END DND

import "../../../../css/list02.css";
import "../../../../css/task.css";
import "../../../../css/form.css";

import { optionEntries, formatGdata_column, onDrop, nl2br, objEntries, showInfo } from "../../../Function/common";
import { callApi } from "../../../Function/api";
import { DATE_TIME_FORMAT } from "../../../Function/constant";
import { icon } from "../../../components/comp_icon";
import { formAddExpress } from "../../../components/comp_data";

import {
  getTasks,
  createTask,
  updateTask,
  deleteTask,
} from "../../../Function/api";
import { cloneDeep } from "lodash";
import dayjs from "dayjs";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import { routeTask } from "../../../Function/config_route";

export default function Dashboard(props) {
  const [status, setStatus] = useState(props.status);
  const [statusData, setStatusData] = useState(props.statusData_DragDrop);

  const [isModalAddExpress, setIsModalAddExpress] = useState(false);
  const [isLoadingBtn, setIsLoadingBtn] = useState(false);

  // checklist
  const formChecklist_default = { name: '', content: '', admin_user_id: null };
  const [formChecklist, setFormChecklist] = useState([formChecklist_default, formChecklist_default, formChecklist_default]);
  const [nguoiThucHien, setNguoiThucHien] = useState(null);
  const [isApplyAll, setIsApplyAll] = useState(true);
  const [checklist, setChecklist] = useState([]);
  const [isModalChecklist, setIsModalChecklist] = useState(false);

  const [formDesc] = Form.useForm();
  const [formData] = Form.useForm();
  const [formSearch] = Form.useForm();
  const [formComment] = Form.useForm();

  const [comments, setComments] = useState([]);

  const [api, contextHolder] = notification.useNotification();
  const [isShowStatusSetting, setIsShowStatusSetting] = useState(false);

  const [openDetail, setOpenDetail] = useState(false);

  const [statusAction, setStatusAction] = useState(1);
  const [dataAction, setDataAction] = useState(0);
  const [idxDataAction, setIdxDataAction] = useState(0);
  const [idxColumnAction, setIdxColumnAction] = useState(0);

  // save: save and close
  // save_continue: save and add new
  const [typeSubmit, setTypeSubmit] = useState('save');

  const [isModalXoaOpen, setIsModalXoaOpen] = useState(0);
  const [isModalAddOpen, setIsModalAddOpen] = useState(0);

  const [columns, setColumns] = useState(props.datas);
  const [taskInput, setTaskInput] = useState("");

  const [saveStatus, setSaveStatus] = useState(false);

  function formAddTaskExpress(users: any) {
    const formAddTaskExpress_default = {
      name: '',
      description: '',
      nguoi_thuc_hien: null,
      task_status_id: '1'
    };
    const [formAddTaskExpress, setFormAddTaskExpress] = useState([formAddTaskExpress_default, formAddTaskExpress_default, formAddTaskExpress_default]);
    const [nguoiThucHien_applyAll, setNguoiThucHien_applyAll] = useState(true);
    const [status_applyAll, setStatus_applyAll] = useState(true);

    function remove(key) {
      setFormAddTaskExpress(prev =>
        prev.filter((_, index) => index !== key)
      );
    }

    function updateformAddTaskExpres(idx, key, val) {
      if (key === 'nguoi_thuc_hien' && nguoiThucHien_applyAll) {
        setFormAddTaskExpress(prev =>
          prev.map(item => ({
            ...item,
            [key]: val
          }))
        );
        return;
      }

      if (key === 'task_status_id' && status_applyAll) {
        setFormAddTaskExpress(prev =>
          prev.map(item => ({
            ...item,
            [key]: val
          }))
        );
        return;
      }

      let updated = [...formAddTaskExpress]; // sao chép mảng
      updated[idx] = { ...updated[idx], [key]: val }; // cập nhật phần tử
      setFormAddTaskExpress(updated); // cập nhật state
    };

    function addExpress() {
      setIsLoadingBtn(true);
      axios.post(route("task.addTaskExpress"), {
        datas: formAddTaskExpress
      }).then((response) => {
        // location.reload();
        setIsLoadingBtn(false);
        setIsModalAddExpress(false);
        setColumns(response.data.data);
      }).catch((error) => {
        message.error("Tạo checklist thất bại");
      });
    }

    return <table className="table-sub">
      <thead>
        <tr>
          <th>
            <span>Tiêu đề </span>
            {showInfo('Chỉ lưu những công việc có nhập nội dung cho tiêu đề. nếu bỏ trống tiêu đề thì sẽ bỏ qua')}
          </th>
          <th>
            <span>Mô tả </span>
            {showInfo('Mô tả ngắn về công việc (nếu có)')}
          </th>
          <th>
            <span>Trạng thái </span>
            {showInfo('Trạng thái hoặc tiến độ hiện tại của công việc, chọn áp dụng tất cả thì sẽ được áp dụng cho tất cả cho các trạng thái khác giống như trạng thái mà bạn vừa chọn')}
            <br />
            <Checkbox checked={status_applyAll}
              onChange={(e) => { setStatus_applyAll(e.target.checked) }}
            >
              <em>Áp dụng tất cả</em>
            </Checkbox>
          </th>
          <th>
            <span>Người thực hiện </span>
            {showInfo('Chọn người làm chính cho công việc này, chọn áp dụng tất cả thì sẽ được áp dụng cho tất cả cho các "Người thực hiện" đều giống như lựa chọn mà bạn vừa chọn')}
            <br />
            <Checkbox checked={nguoiThucHien_applyAll}
              onChange={(e) => { setNguoiThucHien_applyAll(e.target.checked) }}
            >
              <em>Áp dụng tất cả</em>
            </Checkbox>
          </th>
          <th>Xóa</th>
        </tr>
      </thead>
      {/* form Thêm task express */}
      {
        formAddTaskExpress.map((item, key) => {
          return <tbody key={key}>
            <tr>
              <td>
                <Input value={item.name}
                  placeholder="Nhập tiêu đề"
                  onChange={(e) => {
                    updateformAddTaskExpres(key, 'name', e.target.value);
                  }}
                />
              </td>
              <td>
                <Input.TextArea value={item.description}
                  placeholder="Nhập mô tả ngắn"
                  onChange={(e) => {
                    updateformAddTaskExpres(key, 'description', e.target.value);
                  }}
                />
              </td>
              <td>
                <Select
                  showSearch
                  style={{ width: "100%" }}
                  placeholder="Chọn trạng thái"
                  optionFilterProp="children"
                  filterOption={(input, option) =>
                    (option?.label ?? "")
                      .toLowerCase()
                      .includes(input.toLowerCase())
                  }
                  options={optionEntries(status)}
                  value={item.task_status_id}
                  onChange={(val) => {
                    updateformAddTaskExpres(key, 'task_status_id', val);
                  }}
                />
              </td>
              <td>
                <Select
                  showSearch
                  style={{ width: "100%" }}
                  placeholder="Chọn nhân viên thực hiện"
                  optionFilterProp="children"
                  filterOption={(input, option) =>
                    (option?.label ?? "")
                      .toLowerCase()
                      .includes(input.toLowerCase())
                  }
                  options={optionEntries(users)}
                  value={item.nguoi_thuc_hien}
                  onChange={(val) => {
                    updateformAddTaskExpres(key, 'nguoi_thuc_hien', val);
                  }}
                />
              </td>
              <td>
                <span onClick={() => remove(key)} title="Xóa" className="icon-large cursor" key="list-loadmore-more"><DeleteOutlined /></span>
              </td>
            </tr>

          </tbody>
        })
      }

      <tbody>
        <tr>
          <td colSpan={4}>
            <a className="add-item01" onClick={() => addFormCheckList()}>
              <span className="icon-b" onClick={() => setFormAddTaskExpress(prev => [...prev, formAddTaskExpress_default])}>
                <PlusCircleOutlined /> Thêm công việc
              </span>
            </a>
          </td>
        </tr>
        <tr>
          <td colSpan={4}>
            <Row className="main-modal-footer01">
              <Col span={24} className="main-btn-popup">
                <Button className="btn-popup" type="primary" onClick={() => addExpress()} loading={isLoadingBtn}>
                  <CheckOutlined />
                  Tạo Công việc
                </Button>
                <span> </span>
                <Button className="btn-popup" onClick={() => setIsModalAddExpress(false)} loading={isLoadingBtn}>
                  <CloseSquareOutlined />
                  Đóng
                </Button>
              </Col>
            </Row>
          </td>
        </tr>
      </tbody>

    </table>
  }

  // createChecklist
  function createChecklist() {
    setIsLoadingBtn(true);
    axios.post(route("task.addChecklist"), {
      data: formChecklist,
      task_id: dataAction.id
    }).then((response) => {
      setChecklist(response.data.data);
      setIsLoadingBtn(false);
      setIsModalChecklist(false);
      message.success("Tạo checklist thành công");

      // let formChecklist_tmp = cloneDeep(formChecklist);
      const formChecklist_tmp = [formChecklist_default, formChecklist_default, formChecklist_default];
      setFormChecklist(formChecklist_tmp);
    }).catch((error) => {
      message.error("Tạo checklist thất bại");
    });
  }

  // form desc
  const onFinishFormDesc = async (values) => {
    updateTaskByColumn(dataAction.id, 'description', values.description);
  }

  function updateTaskByColumn(id, columnName, value) {
    setDataAction({
      ...dataAction,
      [columnName]: value,
    });

    axios.post(route('task.fastEditTask'), {
      column_name: columnName,
      id: dataAction.id,
      value: value
    }).then(response => {
      console.log('re', response);

      setIsLoadingBtn(false);
      setColumns(response.data.data);
      message.success('Cập nhật thành công');
    }).catch(error => {
      message.error('Cập nhật thất bại');
    });
  }

  //onFinishFormComment
  const onFinishFormComment = async (values) => {
    setIsLoadingBtn(true);

    axios.post(route('task.addComment'), {
      task_id: dataAction.id,
      content: values.content
    }).then(response => {
      console.log('ds', response.data.data);
      formComment.resetFields();
      setIsLoadingBtn(false);
      setComments(response.data.data);
      message.success('Đã thêm comment');
    }).catch(error => {
      message.error('Thêm comment thất bại');
    });
  }

  // xoa check list
  const removeChecklistByIndex = (indexToRemove, id) => {
    setChecklist(prev => prev.filter((checklist, index) => index !== indexToRemove));
    axios.post(route('data.fastEditByTableName'), {
      column_name: 'is_recycle_bin',
      tbl_name: 'task_checklist',
      id: id,
      value: 1
    }).then(response => {
      setIsLoadingBtn(false);
      message.success('Xóa checklist thành công');
    }).catch(error => {
      message.error('Xóa checklist thất bại');
    });
  };

  // form data
  const onFinishData = async (values) => {
    setIsLoadingBtn(true);

    values.typeSubmit = typeSubmit;
    if (values.start) {
      values.start = values.start.format('YYYY-MM-DD');
    }
    if (values.end) {
      values.end = values.end.format('YYYY-MM-DD');
    }

    const res = await createTask(values);

    setIsLoadingBtn(false);

    setColumns(res.data.data);

    formData.resetFields();

    message.success("Đã lưu dữ liệu thành công");

    // case lưu và đóng, đóng modal sau khu lưu thành công
    if (typeSubmit === 'save') {
      setIsModalAddOpen(false);
    }

    // setColumns((prev) => ({
    //   ...prev,
    //   1: [...prev[1], res.data],
    // }));
    // formData.resetFields();
    // setIsModalAddOpen(false);
  }

  const onFinishSearch = async (values) => {

  }

  function addFormCheckList() {
    setFormChecklist(prev => [...prev, formChecklist_default]);
  }

  function removeFormChecklist(key) {
    setFormChecklist(prev =>
      prev.filter((_, index) => index !== key)
    );
  }

  useEffect(() => {
    fetchTasks();
  }, []);

  // get task data
  const fetchTasks = async () => {
    // const res = await getTasks();
    // const grouped = {1:[],2:[],3:[],4:[]};
    // res.data.forEach((task) => grouped[task.status].push(task));
    // console.log('grouped', grouped);

    // setColumns(grouped);
  };


  // xóa task
  const handleDelete = async (id, status) => {
    await deleteTask(id);
    setColumns((prev) => ({
      ...prev,
      [status]: prev[status].filter((t) => t.id !== id),
    }));
  };

  // di chuyển item trong mảng
  function moveItemInArray(array, fromIndex, toIndex) {
    const result = [...array];
    const [removed] = result.splice(fromIndex, 1);
    result.splice(toIndex, 0, removed);
    return result;
  }

  const onDragEnd = async (result) => {
    const { source, destination } = result;
    if (!destination) return;
    console.log('result', result);

    console.log('source', source);
    console.log('destination', destination);
    console.log('columns', columns);

    if (source.droppableId === destination.droppableId && source.index === destination.index) {
      return;
    }

    // Sao chép mảng gốc
    const newDatas = [...columns];

    // lấy index của cột
    const source_index = columns.findIndex(item => item.status.id === +source.droppableId);
    const destination_index = columns.findIndex(item => item.status.id === +destination.droppableId);
    console.log('source_index', source_index);
    console.log('destination_index', destination_index);

    // data cần di chuyển
    const itemToMove = newDatas[source_index].datas[source.index];

    // trường hợp sắp xếp thứ tự trên cùng 1 cột
    if (source.droppableId === destination.droppableId) {
      // sắp xếp lại thứ tự của data
      newDatas[source_index].datas = moveItemInArray(newDatas[source_index].datas, source.index, destination.index);

      // save 2 state
      setColumns(newDatas); // Cập nhật state

      // lọc ra ids là danh sách id của data sau khi đã sắp xếp
      const ids = newDatas[destination_index].datas.map(item => item.id);
      // save 2 db
      await updateTask(itemToMove.id, {
        task_status_id: destination.droppableId,
        ids: ids
      });

      return;
    }

    // trường hợp di chuyển sang cột khác

    // Xoá khỏi vị trí cũ
    newDatas[source_index].datas = newDatas[source_index].datas.filter((_, i) => i !== source.index);

    // Thêm vào vị trí mới
    newDatas[destination_index].datas = [...newDatas[destination_index].datas, itemToMove];
    // sắp xếp lại thứ tự của data
    const lastIndex = newDatas[destination_index].datas.length - 1;
    newDatas[destination_index].datas = moveItemInArray(newDatas[destination_index].datas, lastIndex, destination.index);


    // Cập nhật state
    setColumns(newDatas);

    // lọc ra ids là danh sách id của data sau khi đã sắp xếp
    const ids = newDatas[destination_index].datas.map(item => item.id);

    await updateTask(itemToMove.id, {
      task_status_id: destination.droppableId,
      ids: ids
    });

  };

  function initialValuesForm() {
    return {
      // nguoi_tạo: props.admin.id
    }
  }

  function closeModalAdd() {
    setIsModalAddOpen(false);
  }

  function onDropData(info) {
    const result = onDrop(info, statusData);
    setStatusData(result);

    axios.post(route('task.sortOrder'), {
      data: JSON.stringify(result),
      table_name: 'task_status'
    }).then(response => {
      message.success('Cập nhật thứ tự thành công');
      setColumns(response.data.data);
    }).catch(error => {
      message.error('Cập nhật thứ tự thất bại');
    });
  }


  function formAddTaskChecklist(users, task) {
    function addFormCheckList() {
      setFormChecklist(prev => [...prev, formChecklist_default]);
    }

    function updateChecklistByIndex(indexToUpdate, updatedData) {
      setFormChecklist(prev =>
        prev.map((item, index) =>
          index === indexToUpdate ? { ...item, ...updatedData } : item
        )
      );
    }

    return <table className="table-sub">
      <thead>
        <tr>
          <th>Tiêu đề</th>
          <th>Mô tả</th>
          <th>
            Người thực hiện
            <br />
            <Checkbox checked={isApplyAll}
              onChange={(e) => setIsApplyAll(e.target.checked)}
            >
              Áp dụng tất cả
            </Checkbox>
          </th>
          <th>Xóa</th>
        </tr>
      </thead>
      {/* form Thêm checklist */}
      {
        formChecklist.map((item, key) => {
          return <tbody key={key}>
            <tr>
              <td>
                <Input value={item.name} onChange={(e) => updateChecklistByIndex(key, { name: e.target.value })} />
              </td>
              <td>
                <Input.TextArea value={item.content} onChange={(e) => updateChecklistByIndex(key, { content: e.target.value })} />
              </td>
              <td>
                <Select
                  showSearch
                  style={{ width: "100%" }}
                  placeholder="Chọn nhân viên thực hiện"
                  optionFilterProp="children"
                  filterOption={(input, option) =>
                    (option?.label ?? "")
                      .toLowerCase()
                      .includes(input.toLowerCase())
                  }
                  value={item.admin_user_id}
                  options={optionEntries(users)}
                  onChange={(value) => {
                    if (!isApplyAll) {
                      updateChecklistByIndex(key, { admin_user_id: value });
                    }
                    setFormChecklist(prev =>
                      prev.map(item => ({
                        ...item,
                        admin_user_id: value
                      }))
                    );
                    return;

                  }}
                />
              </td>
              <td>
                <span onClick={() => removeFormChecklist(key)} title="Xóa" className="icon-large cursor" key="list-loadmore-more"><DeleteOutlined /></span>
              </td>
            </tr>

          </tbody>
        })
      }

      <tbody>
        <tr>
          <td colSpan={4}>
            <a className="add-item01" onClick={() => addFormCheckList()}>
              <span className="icon-b"><PlusCircleOutlined /> Thêm Checklist</span>
            </a>
          </td>
        </tr>
        <tr>
          <td colSpan={4}>
            <Row className="main-modal-footer01">
              <Col span={24} className="main-btn-popup">
                <span> </span>
                <Button className="btn-popup"
                  loading={isLoadingBtn}
                  type="primary"
                  onClick={() => createChecklist()}
                >
                  <CheckOutlined />
                  Tạo Checklist
                </Button>
              </Col>
            </Row>
          </td>
        </tr>
      </tbody>

    </table>
  }

  function closePopupStatus() {
    setIsShowStatusSetting(false);
  }



  //////////////////////////////////////
  interface DataType {
    key: string;
    name: string;
    age: number;
    address: string;
  }

  interface RowContextProps {
    setActivatorNodeRef?: (element: HTMLElement | null) => void;
    listeners?: SyntheticListenerMap;
  }

  const RowContext = React.createContext<RowContextProps>({});

  const DragHandle: React.FC = () => {
    const { setActivatorNodeRef, listeners } = useContext(RowContext);
    return (
      <Button
        type="text"
        size="small"
        icon={<HolderOutlined />}
        style={{ cursor: 'move' }}
        ref={setActivatorNodeRef}
        {...listeners}
      />
    );
  };

  const columns2: TableColumnsType<DataType> = [
    { key: 'sort', align: 'center', width: 80, render: () => <DragHandle /> },
    { title: 'Name', dataIndex: 'name' },
    { title: 'Age', dataIndex: 'age' },
    { title: 'Address', dataIndex: 'address' },
  ];

  const initialData: DataType[] = [
    { key: '1', name: 'John Brown', age: 32, address: 'Long text Long' },
    { key: '2', name: 'Jim Green', age: 42, address: 'London No. 1 Lake Park' },
    { key: '3', name: 'Joe Black', age: 32, address: 'Sidney No. 1 Lake Park' },
  ];

  interface RowProps extends React.HTMLAttributes<HTMLTableRowElement> {
    'data-row-key': string;
  }

  const Row: React.FC<RowProps> = (props) => {
    const {
      attributes,
      listeners,
      setNodeRef,
      setActivatorNodeRef,
      transform,
      transition,
      isDragging,
    } = useSortable({ id: props['data-row-key'] });

    const style: React.CSSProperties = {
      ...props.style,
      transform: CSS.Translate.toString(transform),
      transition,
      ...(isDragging ? { position: 'relative', zIndex: 9999 } : {}),
    };

    const contextValue = useMemo<RowContextProps>(
      () => ({ setActivatorNodeRef, listeners }),
      [setActivatorNodeRef, listeners],
    );

    return (
      <RowContext.Provider value={contextValue}>
        <tr {...props} ref={setNodeRef} style={style} {...attributes} />
      </RowContext.Provider>
    );
  };

  const [dataSource, setDataSource] = React.useState<DataType[]>(initialData);

  const onDragEnd2 = ({ active, over }: DragEndEvent) => {
    if (active.id !== over?.id) {
      setDataSource((prevState) => {
        const activeIndex = prevState.findIndex((record) => record.key === active?.id);
        const overIndex = prevState.findIndex((record) => record.key === over?.id);
        return arrayMove(prevState, activeIndex, overIndex);
      });
    }
  };

  return (
    <div>
      <AdminLayout
        auth={props.auth}
        header={''}
        current={props.table}
        content={

          <div>

            <Col sm={24}>
                  <DndContext modifiers={[restrictToVerticalAxis]} onDragEnd={onDragEnd2}>
                    <SortableContext items={dataSource.map((i) => i.key)} strategy={verticalListSortingStrategy}>
                      <Table<DataType>
                        rowKey="key"
                        components={{ body: { row: Row } }}
                        columns={columns2}
                        dataSource={dataSource}
                      />
                    </SortableContext>
                  </DndContext>
                </Col>

            {/* modal xóa */}
            <Modal title="Xác nhận xóa"
              open={isModalXoaOpen}
              // onOk={deleteProduct} 
              okText="Đồng ý xóa"
              cancelText="Hủy"
            // onCancel={handleCancelDelete}
            >
              <p>Các thông tin về hàng hóa này sẽ bị xóa hoàn toàn</p>
            </Modal>

            <Modal title="Cài đặt quy trình"
              className="status-setting"
              open={isShowStatusSetting}
              onCancel={() => closePopupStatus()}
              footer={[]}
            >

              <Tabs className={' '}
                defaultActiveKey="1"
                items={[
                  // Danh sách
                  {
                    label: <span className="title-sub-tab">Danh sách</span>,
                    key: '1',
                    children: <div>
                      <em>Kéo thả để sắp xếp thứ tự</em>
                      <Tree
                        className="draggable-tree tree-modal"
                        draggable
                        blockNode
                        onDrop={(info) => onDropData(info)}
                        treeData={formatGdata_column(statusData)}
                      />

                      <Row>
                        <Col sm={24} className="text-center">
                          <br />
                          <Button type="primary"
                            className="btn-submit01"
                            onClick={() => closePopupStatus()}>
                            Đóng
                          </Button>
                        </Col>
                      </Row>

                    </div>
                  },
                  // Thêm mới
                  {
                    label: <span className="title-sub-tab">Thêm mới</span>,
                    key: '2',
                    children: formAddExpress('tasks', { name: 'Quy trình' }, route('task.addConfig', { parentName: 'tasks', tableName: 'task_status' }), (data: any) => {
                      setStatusData(data);
                      message.success('Thêm mới thành công');
                    })
                  },
                ]
                } />
            </Modal>

            {/* Thêm nhanh công việc */}
            <Modal title="Thêm nhanh công việc"
              open={isModalAddExpress}
              onCancel={() => setIsModalAddExpress(false)}
              footer={[]}
              width={1000}
            >
              {formAddTaskExpress(props.users)}
            </Modal>

            <Modal title="Thêm checklist"
              open={isModalChecklist}
              onCancel={() => setIsModalChecklist(false)}
              footer={[]}
              width={1000}
            >
              {formAddTaskChecklist(props.users, dataAction)}
            </Modal>

            {/* Thêm mới */}
            <Modal title="Thêm công việc"
              open={isModalAddOpen}
              onCancel={() => closeModalAdd()}
              footer={[]}
              width={{
                xs: '90%',
                sm: '80%',
                md: '70%',
                lg: '60%',
                xl: '50%',
                xxl: '40%',
              }}
            >
              <Form
                name="htvn"
                form={formData}
                layout="vertical"
                onFinish={onFinishData}
                autoComplete="off"
                initialValues={initialValuesForm()}
                className="form-popup"
              >

                <Row>
                  <Col sm={24}>
                    <Form.Item name='task_status_id' label=''>
                      <Radio.Group
                        block
                        optionType="button"
                        buttonStyle="solid"
                        defaultValue={1}
                        options={Object.entries(status).map(([key, value]) => {
                          return {
                            value: value.id,
                            label: value.name,
                            key: value.id,
                          }
                        })}
                      />
                    </Form.Item>
                  </Col>
                </Row>

                <Row>
                  {/* Nội dung chi tiết */}
                  <Col sm={{ span: 16 }}>
                    <Row>
                      <Col sm={{ span: 24 }} className="main-item-form">
                        <div>
                          <Divider orientation="left"><Space>Nội dung chi tiết</Space></Divider>
                        </div>
                      </Col>

                      <Col sm={{ span: 24 }}>
                        {/* Tên công việc */}
                        <Form.Item className="item-form-textarea" name='name' label="Tên công việc" rules={[{ required: true, message: 'Vui lòng nhập tên công việc', }]}>
                          <Input />
                        </Form.Item>
                      </Col>


                      <Col sm={{ span: 24 }}>
                        <Form.Item className="item-form" name='nguoi_thuc_hien' label="Người thực hiện">
                          <Select
                            showSearch
                            style={{ width: "100%" }}
                            placeholder="Chọn nhân viên thực hiện"
                            optionFilterProp="children"
                            filterOption={(input, option) =>
                              (option?.label ?? "")
                                .toLowerCase()
                                .includes(input.toLowerCase())
                            }
                            options={optionEntries(props.users)}
                          />
                        </Form.Item>
                      </Col>

                      <Col sm={{ span: 24 }}>
                        <Form.Item className="item-form" name='nguoi_theo_doi' label="Người phối hợp thực hiện hoặc theo dõi">
                          <Select showSearch
                            mode="multiple"
                            style={{ width: "100%" }}
                            placeholder="Người phối hợp thực hiện hoặc theo dõi"
                            optionFilterProp="children"
                            filterOption={(input, option) =>
                              (option?.label ?? "")
                                .toLowerCase()
                                .includes(input.toLowerCase())
                            }
                            options={optionEntries(props.users)}
                          />
                        </Form.Item>
                      </Col>

                      <Col sm={{ span: 24 }}>
                        {/* Mô tả chi tiết */}
                        <Form.Item className="item-form-textarea" name='description' label="Mô tả thêm">
                          <Input.TextArea rows={4} />
                        </Form.Item>
                      </Col>
                    </Row>
                  </Col>

                  {/* Cài đặt */}
                  <Col sm={{ span: 8 }}>
                    <Row>
                      <Col sm={{ span: 24 }} className="main-item-form">
                        <div>
                          <Divider orientation="left"><Space>Cài đặt</Space></Divider>
                        </div>
                      </Col>
                      {/* Độ ưu tiên */}
                      <Col sm={{ span: 24 }}>
                        <Form.Item className="item-form" name='task_prority_id' label="Độ ưu tiên">
                          <Select showSearch
                            style={{ width: "100%" }}
                            placeholder="Chọn mức độ ưu tiên"
                            optionFilterProp="children"
                            filterOption={(input, option) =>
                              (option?.label ?? "")
                                .toLowerCase()
                                .includes(input.toLowerCase())
                            }
                            options={optionEntries(props.prority)}
                          />
                        </Form.Item>
                      </Col>
                      {/* Loại công việc */}
                      <Col sm={{ span: 24 }}>
                        <Form.Item className="item-form" name='task_type_ids' label="Loại công việc">
                          <Select showSearch
                            style={{ width: "100%" }}
                            placeholder="Chọn loại công việc"
                            optionFilterProp="children"
                            filterOption={(input, option) =>
                              (option?.label ?? "")
                                .toLowerCase()
                                .includes(input.toLowerCase())
                            }
                            options={optionEntries(props.type)}
                          />
                        </Form.Item>
                      </Col>

                      {/* Ngày bắt đầu */}
                      <Col sm={{ span: 24 }} className="main-item-form">
                        <Form.Item className="item-form" name='start' label="Ngày bắt đầu">
                          <DatePicker format='DD/MM/YYYY' />
                        </Form.Item>
                      </Col>

                      {/* Ngày hoàn thành */}
                      <Col sm={{ span: 24 }} className="main-item-form">
                        <Form.Item className="item-form" name='end' label="Ngày hoàn thành">
                          <DatePicker format='DD/MM/YYYY' />
                        </Form.Item>
                      </Col>

                      {/* Người giao việc */}
                      <Col sm={{ span: 24 }} className="main-item-form">
                        <Form.Item className="item-form" name='nguoi_tạo' label="Người giao việc">
                          <Select showSearch
                            style={{ width: "100%" }}
                            placeholder="Chọn mức độ ưu tiên"
                            optionFilterProp="children"
                            filterOption={(input, option) =>
                              (option?.label ?? "")
                                .toLowerCase()
                                .includes(input.toLowerCase())
                            }
                            options={optionEntries(props.users)}
                          />
                        </Form.Item>
                      </Col>

                      <Col sm={{ span: 24 }}></Col>
                    </Row>
                  </Col>

                  {/* footer */}
                  <Col sm={{ span: 24 }}>
                    <Col span={24} className="main-btn-popup">
                      <Button className="btn-popup"
                        onClick={() => closeModalAdd(false)}
                      >
                        <CloseSquareOutlined />
                        Hủy
                      </Button>
                      <span> </span>
                      <Button className="btn-popup btn-success" type="primary" loading={isLoadingBtn}
                        onClick={() => {
                          setTypeSubmit('save');
                          formData.submit();
                        }}
                      >
                        <CheckOutlined />
                        Lưu và đóng
                      </Button>
                      <span> </span>
                      <Button className="btn-popup" type="primary"
                        loading={isLoadingBtn}
                        onClick={() => {
                          setTypeSubmit('save_continue');
                          formData.submit();
                        }}
                      >
                        <CheckSquareOutlined />
                        <ArrowRightOutlined />
                        <PlusCircleOutlined />
                        Lưu và thêm mới
                      </Button>
                    </Col>
                  </Col>
                </Row>
              </Form>
            </Modal>

            {/* title */}
            <Row>

              <Col sm={{ span: 8 }}>
                <h3 className="title04">Quản lý công việc</h3>
              </Col>

              <Col sm={{ span: 16 }}>

                {/* Cài đặt quy trình */}
                <Button className="_right"
                  onClick={() => setIsShowStatusSetting(true)}
                >
                  <SettingFilled /> Cài đặt quy trình
                </Button>

                {/* Thêm công việc */}
                <Button type="primary"
                  className="_right btn-submit01"
                  onClick={() => setIsModalAddOpen(true)}
                >
                  <PlusCircleFilled /> Thêm công việc
                </Button>

                <Button type="primary"
                  className="_right btn-submit01"
                  onClick={() => setIsModalAddExpress(true)}
                >
                  <PlusCircleFilled /> Thêm nhanh
                </Button>

              </Col>
            </Row>

            <Divider orientation="left" className="divider02">
              <Space>
                <span>Tìm kiếm</span>
                <span> | </span>
                <a><ToolFilled /> Tìm kiếm nâng cao</a>
              </Space>
            </Divider>

            <Form
              name="formSearch"
              form={formSearch}
              layout="vertical"
              onFinish={onFinishSearch}
              // onFinishFailed={onFinishFailedChamCong}
              autoComplete="off"
              initialValues={initialValuesForm()}
              className="form-popup"
            >
              <Row>
                <Col sm={6}>
                  <Form.Item name='task_status_id' label='Từ khóa'>
                    <Input />
                  </Form.Item>
                </Col>

                <Col sm={6}>
                  <Form.Item name='task_status_id' label='Nhân viên'>
                    <Input />
                  </Form.Item>
                </Col>

                <Col sm={6}>
                  <Form.Item name='task_status_id' label='Thời hạn'>
                    <Input />
                  </Form.Item>
                </Col>

                <Col sm={6}>
                  <Form.Item name='task_status_id' label='Nhóm công việc'>
                    <Input />
                  </Form.Item>
                </Col>
              </Row>
            </Form>


            <div className="tasks-container">

              <Row>
                {/* content */}
                <div>
                  <DragDropContext onDragEnd={onDragEnd}>
                    <div style={{ display: "flex", gap: "5px" }}>
                      {Object.entries(columns).map(([idx, value]) => (
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
                                {value.status.name}
                              </p>

                              {value.datas.map((task, index) => (
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
                                            setIdxDataAction(index);
                                            setIdxColumnAction(idx);
                                            const res = await callApi(route('task.getTaskInfo', [task.id]));
                                            setChecklist(res.data.data.checklist);
                                            setComments(res.data.data.comments);
                                            if (formDesc) {
                                              formDesc.setFieldValue('description', task.description);
                                            }

                                          }}
                                        >
                                          {task.name}
                                        </h3>

                                        <p className="description01">{task.description}</p>

                                        {!task.nguoi_thuc_hien || task.nguoi_thuc_hien === null ? '' : <Tag>{props.users[task.nguoi_thuc_hien].name}</Tag>}
                                        {!task.end ? '' : <em><br />Deadline: {dayjs(task.end).format('DD/MM/YYYY')}</em>}

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
                </div>
              </Row>

              <Drawer
                title="Chi tiết công việc"
                placement="right"
                open={openDetail}
                // size={'large'}
                onClose={() => setOpenDetail(false)}
                width="90%"
              >
                <Row>
                  <Col sm={16}>

                    {/* <Button
                      className=""
                      onClick={() => handleDelete(task.id, status)}
                    >
                      Xóa
                    </Button> */}
                    <h3>{dataAction.name}</h3>
                    <p className="description01">Tạo bởi: {props.users[dataAction.create_by] ? props.users[dataAction.create_by].name : ''}</p>
                    <Divider orientation="left">
                      <span className="title-desc"><SnippetsFilled /> Mô tả</span>
                      <span> | </span>
                      <Popconfirm
                        icon={<EditFilled />}
                        title="Sửa mô tả"
                        okButtonProps={{ loading: isLoadingBtn }}
                        onConfirm={() => formDesc.submit()}
                        description={
                          <Form
                            name="formDesc"
                            form={formDesc}
                            layout="vertical"
                            onFinish={onFinishFormDesc}
                            autoComplete="off"
                            initialValues={{ description: dataAction.description }}
                          >
                            <Form.Item className="edit-description" name='description' label=''>
                              <Input.TextArea rows={4} />
                            </Form.Item>
                          </Form>
                        }
                      >
                        <span className="desc cursor"> <EditFilled /> Sửa</span>
                      </Popconfirm>

                    </Divider>
                    <div>
                      <p className="description01">{dataAction.description === null ? <Empty image={null} description="Chưa có mô tả" /> : dataAction.description}</p>
                    </div>

                    {/* Checklist */}
                    <div>
                      <Divider orientation="left">
                        <span className="title-desc"><CheckSquareFilled /> Checklist</span>
                        <span> | </span>
                        <span className="desc cursor" onClick={() => setIsModalChecklist(true)}> <PlusSquareFilled /> Thêm</span>
                      </Divider>
                      <Flex gap="small" vertical>
                        {/* <Progress percent={30} />
                        <Progress percent={50} status="active" /> */}
                        <Progress percent={70} status="exception" />
                        {/* <Progress percent={100} /> */}
                      </Flex>

                      <List
                        className="demo-loadmore-list"
                        itemLayout="horizontal"
                        pagination={{
                          pageSize: 10, //  số item mỗi trang
                        }}
                        dataSource={!checklist ? [] : checklist.map((item) => { return item; })}
                        locale={{ emptyText: 'Danh sách checklist trống' }}
                        renderItem={(item, key) => (
                          <List.Item
                            actions={[
                              <a title="Chọn người thực hiện" className="icon-large" key="list-loadmore-edit"><UserSwitchOutlined /></a>,
                              <Popconfirm
                                icon={<DeleteOutlined />}
                                title="Xác nhận xóa"
                                description="Dữ liệu sẽ bị xóa hòa toàn, bạn xác nhận chứ?"
                                onConfirm={() => {
                                  removeChecklistByIndex(key, item.id);
                                }}
                              >
                                <span title="Xóa" className="icon-large cursor" key="list-loadmore-more"><DeleteOutlined /></span>
                              </Popconfirm>
                            ]}
                          >
                            <List.Item.Meta
                              avatar={
                                <Checkbox checked={item.is_checked ? true : false}
                                  onChange={(e) => {
                                    let status = 0;
                                    if (e.target.checked) {
                                      status = 1;
                                    }
                                    console.log(status);

                                    // update status state
                                    let checklist_tmp = cloneDeep(checklist);
                                    checklist_tmp[key].is_checked = status;
                                    setChecklist(checklist_tmp);
                                    // update status 2 db
                                    axios.post(route('data.fastEditByTableName'), {
                                      column_name: 'is_checked',
                                      tbl_name: 'task_checklist',
                                      id: item.id,
                                      value: status
                                    }).then(response => {
                                      message.success('Cập nhật thứ tự thành công');
                                    }).catch(error => {
                                      message.error('Cập nhật thứ tự thất bại');
                                    });
                                  }}
                                />
                              }
                              title={<span className="text-normal">{item.name}</span>}
                              description={item.content !== null || item.content !== '' ? <div dangerouslySetInnerHTML={{ __html: nl2br(item.content) }} /> : ''}
                            />
                          </List.Item>
                        )}
                      />
                    </div>

                    {/* Comment */}
                    <div>
                      <Divider orientation="left">
                        <span className="title-desc"><CheckSquareFilled /> Comment</span>
                        <span> | </span>
                        <Popconfirm
                          icon={<EditFilled />}
                          title="Thêm comment"
                          okButtonProps={{ loading: isLoadingBtn }}
                          onConfirm={() => { formComment.submit() }}
                          description={
                            <Form
                              name="formComment"
                              form={formComment}
                              layout="vertical"
                              onFinish={onFinishFormComment}
                              autoComplete="off"
                            // initialValues={}
                            >
                              <Form.Item className="edit-description" name='content' label=''>
                                <Input.TextArea rows={4} />
                              </Form.Item>
                            </Form>
                          }
                        >
                          <span className="desc cursor"> <PlusSquareFilled /> Thêm</span>
                        </Popconfirm>
                      </Divider>

                      <List
                        className="demo-loadmore-list"
                        itemLayout="horizontal"
                        pagination={{
                          pageSize: 5, // 👉 số item mỗi trang
                        }}
                        dataSource={!comments ? [] : comments.map((item) => { return item; })}
                        renderItem={(item) => (
                          <List.Item
                            actions={[
                              <a title="Sửa comment này" className="icon-large" key="list-loadmore-edit"><EditOutlined /></a>,
                              <Popconfirm
                                icon={<DeleteOutlined />}
                                title="Xác nhận xóa"
                                description="Dữ liệu sẽ bị xóa hòa toàn, bạn xác nhận chứ?"
                              >
                                <span title="Xóa" className="icon-large cursor" key="list-loadmore-more"><DeleteOutlined /></span>
                              </Popconfirm>
                            ]}
                          >
                            <List.Item.Meta
                              avatar={<div>
                              </div>
                              }
                              title={<div>
                                <b>{item.admin_users_name}</b>
                              </div>
                              }
                              description={
                                <div>
                                  <em className="text-normal date01"> {dayjs(item.created_at).format(DATE_TIME_FORMAT)}</em>
                                  <p>{item.content}</p>
                                </div>

                              }
                            />
                          </List.Item>
                        )}
                      />
                    </div>
                  </Col>

                  {/* right */}
                  <Col sm={8}>
                    <List
                      header={<b><InfoCircleFilled /> Thông tin chi tiết</b>}
                      footer={<div></div>}
                      bordered
                      dataSource={[
                        // status
                        <div>
                          <a><PushpinFilled /> </a>
                          <span>Trạng thái: </span>
                          {
                            !dataAction.task_status_id
                              ?
                              <span className="value-list">Chưa xác định</span>
                              :
                              <>
                                <Tag style={{ color: status[dataAction.task_status_id].color, background: status[dataAction.task_status_id].background }}>
                                  <span>{icon[status[dataAction.task_status_id].icon]} </span>
                                  <span> {status[dataAction.task_status_id].name}</span>
                                </Tag>
                              </>
                          }
                          <Popover placement="bottomLeft"
                            title="Chọn trạng thái"
                            trigger="click"
                            content={
                              <List
                                itemLayout="horizontal"
                                dataSource={objEntries(status)}
                                renderItem={(item, key) => (
                                  <p style={{ color: item.background }}
                                    className="cursor"
                                    onClick={() => {
                                      updateTaskByColumn(dataAction.id, 'task_status_id', item.id);
                                    }}
                                  >
                                    {icon[item.icon]} {item.name}
                                  </p>
                                )}
                              />
                            }
                          >
                            <a onClick={(e) => e.preventDefault()}>
                              <DownOutlined />
                            </a>
                          </Popover>
                        </div>,

                        // độ ưu tiên
                        <div>
                          <a><FireFilled /> </a>
                          <span>Độ ưu tiên: </span>
                          {
                            !dataAction.task_prority_id
                              ?
                              <span className="value-list">Chưa xác định</span>
                              :
                              <Tag style={{ color: props.prority[dataAction.task_prority_id].color }}>{props.prority[dataAction.task_prority_id].name} </Tag>

                          }
                          <Popover placement="bottomLeft"
                            title="Chọn mức độ ưu tiên"
                            trigger="click"
                            content={
                              <List
                                itemLayout="horizontal"
                                dataSource={objEntries(props.prority)}
                                renderItem={(item, key) => (
                                  <p style={{ color: item.color }}
                                    className="cursor"
                                    onClick={() => {
                                      console.log('item.id', item);
                                      updateTaskByColumn(dataAction.id, 'task_prority_id', item.id);
                                    }}
                                  >
                                    <CaretRightFilled /> {item.name}
                                  </p>
                                )}
                              />
                            }
                          >
                            <a onClick={(e) => e.preventDefault()}>
                              <DownOutlined />
                            </a>
                          </Popover>

                        </div>,

                        // loại công việc
                        <div>
                          <a><HddFilled /> </a>
                          <span>Loại công việc: </span>
                          <span className="value-list"></span>
                        </div>,
                        <div>
                          <a><HddFilled /> </a>
                          <span>Loại dự án: </span>
                          <span className="value-list"></span>
                        </div>,
                        <div>
                          <a><UserOutlined /> </a>
                          <span>Người thực hiện: </span>
                          <Select
                            showSearch
                            style={{ width: "100%" }}
                            value={dataAction.nguoi_thuc_hien}
                            placeholder="Chọn nhân viên thực hiện"
                            optionFilterProp="children"
                            filterOption={(input, option) =>
                              (option?.label ?? "")
                                .toLowerCase()
                                .includes(input.toLowerCase())
                            }
                            options={optionEntries(props.users)}
                          />
                        </div>,
                        <div>
                          <a><UsergroupAddOutlined /> </a>
                          Làm cùng hoặc theo dõi:
                          <Select mode="multiple"
                            showSearch
                            style={{ width: "100%" }}
                            value={dataAction.nguoi_theo_doi}
                            placeholder="Chọn nhân viên thực hiện"
                            optionFilterProp="children"
                            filterOption={(input, option) =>
                              (option?.label ?? "")
                                .toLowerCase()
                                .includes(input.toLowerCase())
                            }
                            options={optionEntries(props.users)}
                          />
                        </div>,
                        <div>
                          <a><FieldTimeOutlined /> </a>
                          Ngày tạo:
                          <span className="value-list">{dataAction.created_at ? dayjs(dataAction.created_at).format(DATE_TIME_FORMAT) : ''}</span></div>,
                        <div>
                          <a><FieldTimeOutlined /> </a>
                          Ngày bắt đầu:
                          <span className="value-list">{dataAction.start ? dayjs(dataAction.start).format(DATE_TIME_FORMAT) : 'Chưa xác định'}</span></div>,
                        <div>
                          <a><CheckCircleOutlined /> </a>
                          Ngày hoàn thành
                          <span className="value-list">{dataAction.end ? dayjs(dataAction.end).format(DATE_TIME_FORMAT) : 'Chưa xác định'}</span>
                        </div>,
                        <div>
                          <a><FieldTimeOutlined /> </a>
                          Thời gian hoàn thành thực tế:
                          <br />
                          <span className="value-list">{dataAction.actual ? dayjs(dataAction.actual).format(DATE_TIME_FORMAT) : 'Chưa xác định'}</span>
                        </div>,
                        <div>
                          <a><FlagFilled /> </a>
                          Milestone:
                        </div>
                      ]}
                      renderItem={(item) => (
                        <List.Item>{item}</List.Item>
                      )}
                    />
                    <div><br /></div>

                    <h3><ProfileOutlined /> Lịch sử thay đổi</h3>
                    <Timeline
                      items={[
                        {
                          children: 'Create a services site 2015-09-01',
                        },
                        {
                          children: 'Solve initial network problems 2015-09-01',
                        },
                        {
                          children: 'Technical testing 2015-09-01',
                        },
                        {
                          children: 'Network problems being solved 2015-09-01',
                        },
                      ]}
                    />
                  </Col>
                </Row>

                <br />

              </Drawer>

            </div>
          </div >
        }
      />
    </div >
  );
}
