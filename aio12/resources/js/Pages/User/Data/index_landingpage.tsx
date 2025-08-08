import React, { useState, useEffect  } from 'react';
import AdminLayout from '@/layouts/AdminLayout';
import { Button, Table, message, Modal, Form, Input, InputNumber, Popconfirm, Typography, Select, Row, Space, Tag, Card, Descriptions  } from 'antd';
import { ExclamationCircleOutlined, DownOutlined } from '@ant-design/icons';
import { Link } from '@inertiajs/react';
import axios from 'axios';
import { router } from '@inertiajs/react';
import { ArrowRightOutlined, FormOutlined, SearchOutlined, PlusCircleOutlined, DeleteOutlined, EditOutlined } from '@ant-design/icons';
import '../../../../css/list.css';
import { btnIndex } from '../../../Function/data';

const { Option } = Select;
const { TextArea } = Input;

export default function Dashboard(props) {

    const [selectedRowKeys, setSelectedRowKeys] = useState([]);
    const [loadingBtnDelete, setLoadingBtnDelete] = useState(false);
    const [loadingTable, setLoadingTable] = useState(false);
    const [loadingBtnSearch, setLoadingBtnSearch] = useState(false);
    const [isOpenConfirmDelete, setIsOpenConfirmDelete] = useState(false);
    const [dataSource, setDataSource] = useState(props.dataSource);
    const [fastEditValue, setFastEditValue] = useState('');
    const [columnData, setColumnData] = useState(props.columnData);
    const [tableWidth, setTableWidth] = useState(0);
    const [request, setRequest] = useState(props.request);
    const [tableParams, setTableParams] = useState({
        pagination: {
          current: props.pageConfig.currentPage,
          pageSize: props.pageConfig.perPage,
          position: ['bottonRight'],
          total:props.pageConfig.total,
          onChange: (page, pageSize) => setPagination({page, pageSize})
        }
    });
    function setPagination(pagination) {
        router.get(route('data.index', [props.table.id]), pagination);
    }

    //
    const EditableCell = ({
      editing,
      dataIndex,
      title,
      inputType,
      record,
      index,
      children,
      ...restProps
    }) => {
        let inputNode;
        return (
            <td {...restProps}>{children}</td>
          );
    };
    //
    const deletes = () => {
        setLoadingBtnDelete(true); // ajax request after empty completing
        setLoadingTable(true);
        axios.post(route('data.delete',[props.table.id]),{
            ids: selectedRowKeys
        }).then(response => {
            if (response.data.status_code == 200) {
                let dataSrc = [];
                for (var key in dataSource) {
                    if (!selectedRowKeys.includes(dataSource[key].key)) {
                        dataSrc.push(dataSource[key]);
                    }
                }
                message.success('Đã xóa (' + response.data.data + ')');
                setDataSource(dataSrc);
                setSelectedRowKeys([]);
            } else {
                setSelectedRowKeys([]);
                message.error('Xóa thất bại');
            }
            setLoadingBtnDelete(false);
            setIsOpenConfirmDelete(false);
            setLoadingTable(false);
        })
        .catch(error => {
            setLoadingBtnDelete(false);
            setSelectedRowKeys([]);
            setIsOpenConfirmDelete(false);
            setLoadingTable(false);
            message.error('Có lỗi xảy ra');
        });
    };

    const onSelectChange = (newSelectedRowKeys) => {
        setSelectedRowKeys(newSelectedRowKeys);
    };

    const rowSelection = {
        selectedRowKeys,
        onChange: onSelectChange,
    };
    const hasSelected = selectedRowKeys.length > 0;

    const confirmDelete = () => {
        setIsOpenConfirmDelete(true);
    };
    const handleCancelDelete = () => {
        setIsOpenConfirmDelete(false);
    };

    // editable
    const [form] = Form.useForm();
    const [data, setData] = useState(props.dataSource);
    const [editingKey, setEditingKey] = useState('');

    const isEditing = (record) => record.key === editingKey;

    const edit = (record) => {
      const item = dataSource[record.index];
      let formData = {};
      for(let i = 0; i<columnData.length; i++) {

        if(columnData[i].dataIndex === 'operation') {
            continue;
        }

        formData[columnData[i].dataIndex] = item[columnData[i].dataIndex];
        if(columnData[i].inputType === 'select') {
            const colName = columnData[i].dataIndex;
            formData[columnData[i].dataIndex] = {
                value: item[colName],
                label: props.selectData[colName][item[colName]]
            };
        }
      }
      form.setFieldsValue(formData);
      setEditingKey(record.key);
    };

    const cancel = () => {
        setEditingKey('');
    };

    function formatData(data) {
        return dataSource.map((data) => {
            let dataTmp = {};
            for (const [key, value] of Object.entries(data)) {
                dataTmp[key] = value;

                if(value == null) {
                    dataTmp[key] = '';
                    continue;
                }
                // check type == select
                if(props.selectData[key]) {
                    if(props.selectData[key]['selectbox'][value] && props.selectData[key]['selectbox'][value]['color']) {
                        let style = { color: props.selectData[key]['selectbox'][value]['color'] };
                        dataTmp[key] = <Tag style={style} >{props.selectData[key][value]}</Tag>;
                    } else {
                        dataTmp[key] = <Tag>{props.selectData[key][value]} </Tag>;
                    }
                }

                // check type == selects
                if(props.selectsData[key]) {
                    let selects;
                    try {
                        selects = JSON.parse(data[key]).map((select) => {
                            return <Tag key={props.selectsData[key][select]}>{props.selectsData[key][select]}</Tag>;
                        });
                        dataTmp[key] = <div>{selects}</div>;
                    } catch (error) {
                        // console.log(error);
                    }
                }
            }
            return dataTmp;
        });
    }

    const onFinishInputFastEdit = (value) => {
        if(value[value.column_name] == null) {
            value[value.column_name] = '';
        }
        axios.post(route('data.fastEdit',[props.tableId]),value).then(response => {
            if (response.data.status_code == 200) {
                console.log('succ', response);
                message.success('Đã lưu thành công!');
                let dataSource_tmp = props.dataSource.map((data) => {
                    if(data.key === value.id) {
                        console.log('value[value.column_name]', value[value.column_name]);
                        data[value.column_name] = value[value.column_name];
                        if(value[value.column_name].constructor === Array) {
                            data[value.column_name] = JSON.stringify(value[value.column_name]);
                        }
                    }
                    return data;
                });
                setDataSource(dataSource_tmp);
            } else {
                message.error('Cập nhật thất bại');
            }
        })
        .catch(error => {
            message.error('Cập nhật thất bại');
        });

    };

    const onFinishFailedFastEdit = (value) => {
        message.error('Cập nhật thất bại');
    };

    function fastEditText(col, record) {
        let rule = '';
        if(col.require === 1) {
            rule = [{ required: true, message: '"' + col.display_name + '" Không được bỏ trống' }];
        }
        const type = col.type_edit
        switch (type) {
            case 'text':
                return <Form.Item label={col.display_name} name={col.name} rules={rule} >
                            <Input />
                        </Form.Item>
            case 'number':
                return <Form.Item label={col.display_name} name={col.name} rules={rule} >
                            <InputNumber style={{ width: '150px' }} formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}  parser={(value) => value.replace(/\$\s?|(,*)/g, '')}/>
                        </Form.Item>
            case 'textarea':
                return <Form.Item label={col.display_name} name={col.name} rules={rule} >
                            <TextArea rows={4} />
                        </Form.Item>
            case 'select':
                return <Form.Item label={col.display_name} name={col.name} rules={rule} >
                            <Select
                                showSearch
                                style={{ width: '100%' }}
                                placeholder="Search to Select"
                                optionFilterProp="children"
                                filterOption={(input, option) => (option?.label ?? '').toLowerCase().includes(input.toLowerCase())}
                                options={props.selectData[col.name].selectbox}
                            />
                        </Form.Item>
            case 'selects':
                return <Form.Item label={col.display_name} name={col.name} rules={rule} >
                            <Select
                                mode="multiple"
                                showSearch
                                style={{ width: '100%' }}
                                placeholder="Search to Select"
                                optionFilterProp="children"
                                filterOption={(input, option) => (option?.label ?? '').toLowerCase().includes(input.toLowerCase())}
                                options={props.selectsData[col.name].selectbox}
                            />
                        </Form.Item>
            case 'date':
                return <span>{type}</span>
            case 'color':
                return <span>{type}</span>

            default:
                return <Form.Item label={col.display_name} name={col.name} rules={rule} >
                        <TextArea rows={4} />
                    </Form.Item>
        }

    }

    function numberFormat(value) {
        return `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')
    }

    function fastEditContent(col, record) {
        let initialValues = [];
        initialValues['column_name'] = col.name;
        initialValues['id'] = record.key;
        initialValues[col.name] = record[col.name];
        if(col.type_edit === 'selects') {
            let selects_data = dataSource.filter(function(d) {
                            if(d.key === record.key) {
                                return d[col.name];
                            }
                        });
            let selects;
            try {
                selects = JSON.parse(selects_data[0][col.name]).map((select) => {
                    return +select;
                });
            } catch (error) {
                // console.log('err', error);
            }
            initialValues[col.name] = selects;
        }
        return <div>
                    <Form
                        name="basic"
                        layout="vertical"
                        style={{ maxWidth: 600 }}
                        initialValues={initialValues}
                        onFinish={onFinishInputFastEdit}
                        onFinishFailed={onFinishFailedFastEdit}
                        autoComplete="off"
                    >
                        <div>{fastEditText(col, record)}</div>
                        <Form.Item name="id" value={record.key} style={{ display: 'none' }}><Input type="text" /></Form.Item>
                        <Form.Item name="column_name" style={{ display: 'none' }}><Input type="text" /></Form.Item>
                        <Form.Item className="btn-fast-edit">
                            <Button name="id" value={1} type="primary" htmlType="submit">
                                Cập nhật
                            </Button>
                        </Form.Item>
                    </Form>
                </div>
    }

    const fastEditOK = (e) => {
    };

    const fastEditCancel = (e) => {
        message.error('Đã hủy');
      };

    function configColumnData() {
        let result = props.columns.filter(function(col) {
            if(col.show_in_list === 0) {
                return false;
            }
            return true;
          }).map((col) => {
            if(col.is_view_detail === 1) {
                return {
                    title: col.display_name,
                    dataIndex: col.name,
                    key: col.dataIndex,
                    render: (_, record) => {
                        return <Link href={route('data.detail', [props.tableId, record.key])}>{record[col.name]}</Link>;
                    },
                };
            }
            if(col.fast_edit === 1) {
                return {
                    title: col.display_name,
                    dataIndex: col.name,
                    key: col.dataIndex,
                    render: (_, record) => {
                        return <div>
                            <span>{ col.type_edit === 'number' ? numberFormat(record[col.name]) : record[col.name]}</span>
                            <Popconfirm title={fastEditContent(col,record)}
                                        onConfirm={fastEditOK}
                                        onCancel={fastEditCancel}
                                        icon={<ArrowRightOutlined style={{ color: '#1890ff' }} />}
                                        className='confirm-fast-edit'
                                        cancelText="Hủy"
                                        okText={'Cập nhật'}>
                                <a className="icon-fast-edit"><FormOutlined /></a>
                            </Popconfirm>
                        </div>;
                    },
                };
            }
            return {
                title: col.display_name,
                dataIndex: col.name,
                key: col.dataIndex,
            };
        });
        if (props.table.is_show_btn_edit === 1) {
            result.push(
                {
                    title: '#',
                    dataIndex: 'operation',
                    fixed: 'right',
                    width: 50,
                    render: (_, record) => {
                        return <Link href={route('data.edit', [props.tableId, record.index])}><EditOutlined /> Sửa</Link>;
                    },
                }
            );
        }
        return result;
    }

    const onFinishSearch = (values) => {
        setLoadingTable(true);
        setLoadingBtnSearch(true);

        router.get(route('data.index', [props.table.id]), values);

    };

    const onFinishSearchFailed = (errorInfo) => {
        console.log('Failed:', errorInfo);
    };

    // form search
    function showData(col) {
        const data = props.data;
        let result;
        const typeEdit = col.type_edit;
        if(col.add2search !== 1) {
            return false;
        }
        switch (typeEdit) {
            case 'summoner':
                result = '';
                break;
            case 'textarea':
                result =<Form.Item key={col.name} name={col.name} label={col.display_name}>
                            <TextArea rows={4} />
                        </Form.Item>

                break;
            case 'number':
                result =<Form.Item key={col.name} name={col.name} label={col.display_name}>
                            <InputNumber style={{ width: '100%' }}
                                formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                                parser={(value) => value.replace(/\$\s?|(,*)/g, '')}/>
                        </Form.Item>

                break;
            case 'select':
                result =<Form.Item key={col.name} name={col.name} label={col.display_name}>
                            <Select
                                showSearch
                                style={{ width: '100%' }}
                                placeholder="Search to Select"
                                optionFilterProp="children"
                                filterOption={(input, option) => (option?.label ?? '').toLowerCase().includes(input.toLowerCase())}
                                options={props.selectData[col.name]['selectbox']}
                            />
                        </Form.Item>

                break;
            default:
                result = <Form.Item key={col.name} name={col.name} label={col.display_name}>
                            <Input  />
                        </Form.Item>

                break;
        }

        return result;
    }

    const listItemsSearch = props.columns.map((col) =>
        showData(col)
    );
    function requestFormat(){
        let result = [];

        for (const [key, value] of Object.entries(props.request)) {
            if(props.selectData[key]) {
                result[key] = {
                    label: props.selectData[key][value],
                    value: [value],
                };
            } else {
                result[key] = value;
            }
            result[key] = value;
        }
        return result;
    }
    return (
        <AdminLayout
            auth={props.auth}
            header={props.table.display_name}
            tables={props.tables}
            current={props.table}
            content={
                <div>
                    <Card type="inner"
                        title="Tìm kiếm"
                        extra={''}>
                        <Form
                            name="basic"
                            layout="vertical"
                            onFinish={onFinishSearch}
                            onFinishFailed={onFinishSearchFailed}
                            autoComplete="off"
                            initialValues={requestFormat()}
                            >
                                <Row gutter={24}>
                                    {listItemsSearch}
                                </Row>
                                <Button type="primary" htmlType="submit" loading={loadingBtnSearch}>
                                    <SearchOutlined />
                                    Tìm kiếm
                                </Button>
                        </Form>
                    </Card>
                    <br/>

                    <Form form={form} component={false}>
                        <div style={{ marginBottom: 16 }}>
                            <Modal title="Xác nhận xóa" open={isOpenConfirmDelete} onOk={deletes} onCancel={handleCancelDelete} confirmLoading={loadingBtnDelete}>
                                <p>Dữ liệu đã xóa sẽ <b>không thể khôi phục</b> lại được <br/> <b>(Số lượng {selectedRowKeys.length})</b></p>
                            </Modal>
                            <Button type="primary"
                                onClick={confirmDelete}
                                disabled={!hasSelected}
                                loading={loadingBtnDelete}>
                                    <DeleteOutlined />
                                    Xóa {hasSelected ? `(${selectedRowKeys.length})` : ''}
                            </Button>
                            <em> Trang {props.pageConfig.currentPage}, hiển thị {props.pageConfig.perPage}/{props.pageConfig.total}</em>

                            {btnIndex(props)}

                        </div>

                        <hr/><br/>

                        <Table size="small" scroll={{ x: 1500, y: 700 }}
                          components={{
                              body: {
                                  cell: EditableCell,
                              },
                          }}
                          loading={loadingTable}
                          pagination={tableParams.pagination}
                          dataSource={formatData(dataSource)}
                          columns={configColumnData()}
                          rowSelection={rowSelection}
                          rowClassName="editable-row"
                          className='table-index'
                        />
                    </Form>
                </div>
            }
        />
    );
}
