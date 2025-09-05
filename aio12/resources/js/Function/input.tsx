import React, { useState } from 'react';
import axios from 'axios';
import {
    Select, Col, Row, message, Typography, Divider, Calendar, ColorPicker, Cascader,
    Form, Radio, Space, InputNumber, Input, DatePicker, TimePicker, Modal, Spin, Checkbox
} from 'antd';

import { numberFormat } from './common';
import { checkRule, showDataPopup, showData } from './data';
import { PlusSquareOutlined, CheckCircleOutlined, CloseCircleOutlined, UnorderedListOutlined } from '@ant-design/icons';
import cloneDeep from 'lodash/cloneDeep';

import { DATE_FORMAT, DATE_TIME_FORMAT, TIME_FORMAT } from './constant';

const { TextArea } = Input;
const { RangePicker } = DatePicker;
const DATE_FORMAT_SHOW = 'DD/MM/YYYY';
const { Text, Link } = Typography;

export function formatValueForm(columns: any, values: any) {
    for (const [key, col] of Object.entries(columns)) {
        if (col.edit !== 1) {
            // values[col.name] = '';
            continue;
        }
        if (col.type_edit === "tiny" && editor.current[col.name]) {
            values[col.name] = editor.current[col.name].getContents();
        }
        if (col.type_edit === "permission_list") {
            values[col.name] = isCheckAllPermission
                ? props.permissionList_all
                : permissionList;
        }
        if (col.type_edit === "date") {
            values[col.name] = !values[col.name] ? '' : values[col.name].format(DATE_FORMAT);
        }
        if (col.type_edit === "datetime") {
            values[col.name] = !values[col.name] ? '' : values[col.name].format(DATE_TIME_FORMAT);
        }
        if (col.type_edit === "time") {
            values[col.name] = !values[col.name] ? '' : values[col.name].format(TIME_FORMAT);
        }
        // if (col.type_edit === "selects_table") {
        //     values[col.name] = dataSourceSelectTbl[col.name].datas.dataSource;
        // }
        if (col.type_edit === "color") {
            values[col.name] = values[col.name].toHexString();
        }

        if (['images', 'image', 'image_crop', 'images_crop'].includes(col.type_edit)) {
            if (fileList && fileList.length > 0) {
                let images = fileList.map((file) => {
                    if (!file.status) {
                        return false;
                    }
                    if (file.status === "uploading") {
                        setIsStopSubmit(true);
                        return false;
                    }

                    if (file.status === "OK") {
                        return {
                            name: file.name,
                            status: file.status,
                            url: file.url,
                        };
                    }
                    if (file.status === "done") {
                        return {
                            name: file.response.data.fileName,
                            status: file.status,
                            url: file.response.data.filePath,
                        };
                    }
                });

                // values.images = JSON.stringify(images);
                values[col.name] = images;
            } else {
                values[col.name] = "";
                values[col.name] = "";
            }
        }

    }
    return values;
}

export function HTSelect(col, prop, langId = 0) {
    const [colData, setColData] = useState(col);
    const [optionsData, setOptionsData] = useState(prop.selectData[col.name].selectbox ? prop.selectData[col.name].selectbox : prop.selectData[col.name]);
    const [isOpenAddExpress, setIsOpenAddExpress] = useState(false);
    const [loadingBtnAdd, setLoadingBtnAdd] = useState(false);
    const [formData] = Form.useForm();
    const [selectTableId, setSelectTableId] = useState(0);
    const [contentForm, setContentForm] = useState(<Spin />);

    const onFinish = (values: any) => {
        values.table_id = selectTableId;
        axios.post(route('data.tblSelect.save'), values)
            .then((response) => {
                if (response.status === 200) {
                    setOptionsData(response.data.data);
                    message.success("Thêm mới thành công!");
                    setIsOpenAddExpress(false);
                    formData.resetFields();
                } else {
                    message.error("Có lỗi xảy ra, xin vui lòng thử lại!");
                }
            })
            .catch((error) => {
                message.error("Có lỗi xảy ra, xin vui lòng thử lại!");
            });

    };

    const onFinishFailed = (errorInfo: any) => { };
    //onOK
    const onOk = () => {
        formData.submit();
    };

    //onCancel
    const onCancel = () => {
        message.error('Đã huỷ');
        setIsOpenAddExpress(false);
    };

    // open modal
    const openModal = () => {
        setIsOpenAddExpress(true);
        axios.post(route('data.tblSelect'), {
            name: col.name,
            table_id: col.table_id,
        })
            .then((response) => {
                if (response.status === 200) {

                    const listItems = response.data.data.columns.map((column) => {
                        if (column.block_type === null || column.block_type == '') {
                            return showDataPopup(column, response.data.data);
                        }
                    });
                    setContentForm(listItems);
                    setSelectTableId(response.data.data.table.id);
                } else {
                    message.success("Có lỗi xảy ra, xin vui lòng thử lại");
                }
            })
            .catch((response) => {
                message.error("Có lỗi xảy ra, xin vui lòng thử lại xx");
            });
    };


    let name = colData.name;
    if (langId > 0) {
        name = 'lang_' + langId + '_' + colData.name;
    }

    // add_express
    let label = <span>{colData.display_name} <a target='new' href={route('data.index', [colData.select_table_id])} title={'QL danh sách "' + col.display_name + '"'}><UnorderedListOutlined /></a></span>;
    if (colData.add_express === 1) {
        label = <div>
            {label}
            <Text type="success" onClick={openModal} title={'Thêm nhanh "' + col.display_name + '"'}> <PlusSquareOutlined /></Text>
        </div>
    }
    // return
    return <Col key={colData.name} sm={{ span: 12 }} md={{ span: 24 }} lg={{ span: colData.col }}>

        <Modal
            title={colData.display_name}
            open={isOpenAddExpress}
            onOk={onOk}
            onCancel={onCancel}
            confirmLoading={loadingBtnAdd}
        >
            <Form
                name={colData.name}
                layout="vertical"
                form={formData}
                onFinish={onFinish}
                onFinishFailed={onFinishFailed}
                autoComplete="off"
                className='form-modal'
            >
                {/* {listItems} */}
                {contentForm}
            </Form>
        </Modal>

        <Form.Item name={name} rules={checkRule(col)} label={label}>

            <Select showSearch className='ht-select'
                style={{ width: '100%' }}
                placeholder="Search to Select"
                optionFilterProp="children"
                filterOption={(input, option) => (option?.label ?? '').toLowerCase().includes(input.toLowerCase())}
                options={optionsData}
                allowClear={true}
            />
        </Form.Item>
    </Col>
}


export function HTSelectModal(col, prop, langId = 0) {
    let name = col.name;
    if (langId > 0) {
        name = 'lang_' + langId + '_' + col.name;
    }
    // add_express
    let label = <span>{col.display_name} <a target='new' href={route('data.index', [col.select_table_id])} title={'QL danh sách "' + col.display_name + '"'}><UnorderedListOutlined /></a></span>;
    // return
    return <Col key={col.name} sm={{ span: 12 }} md={{ span: 24 }} lg={{ span: col.col }}>
        <Form.Item name={name} rules={checkRule(col)} label={label}>
            <Select showSearch
                labelInValue={true}
                style={{ width: '100%' }}
                placeholder={col.placeholder ?? 'Search to Select'}
                optionFilterProp="children"
                filterOption={(input, option) => (option?.label ?? '').toLowerCase().includes(input.toLowerCase())}
                options={prop.selectData[col.name]}
                allowClear={true}
            />
        </Form.Item>
    </Col>
}

export function HTSelectsNormal(col, prop, langId = 0) {
    let name = col.name;
    if (langId > 0) {
        name = 'lang_' + langId + '_' + col.name;
    }

    // add_express
    let label = <span>{col.display_name} <a target='new' href={route('data.index', [col.select_table_id])} title={'QL danh sách "' + col.display_name + '"'}><UnorderedListOutlined /></a></span>;
    // return
    return <Col key={col.name} sm={{ span: 12 }} md={{ span: 24 }} lg={{ span: col.col }}>
        <Form.Item name={name} rules={checkRule(col)} label={label}>
            <Select showSearch
                mode='multiple'
                style={{ width: '100%' }}
                placeholder={col.placeholder ?? 'Search to Select'}
                optionFilterProp="children"
                filterOption={(input, option) => (option?.label ?? '').toLowerCase().includes(input.toLowerCase())}
                options={prop.selectData[col.name]}
                allowClear={true}
            />
        </Form.Item>
    </Col>
}

export function HTSelects(col, prop, mode = 'multiple', langId = 0) {
    const [colData, setColData] = useState(col);

    console.log('prop.selectData[col.name]', prop.selectsData[col.name]);

    const [optionsData, setOptionsData] = useState(prop.selectsData[col.name]);

    const [isOpenAddExpress, setIsOpenAddExpress] = useState(false);
    const [loadingBtnAdd, setLoadingBtnAdd] = useState(false);
    const [formData] = Form.useForm();
    const [selectTableId, setSelectTableId] = useState(0);
    const [contentForm, setContentForm] = useState(<Spin />);

    const onFinish = (values: any) => {
        values.table_id = selectTableId;
        axios.post(route('data.tblSelect.save'), values)
            .then((response) => {
                if (response.status === 200) {
                    setOptionsData(response.data.data);
                    message.success("Thêm mới thành công!");
                    setIsOpenAddExpress(false);
                } else {
                    message.error("Có lỗi xảy ra, xin vui lòng thử lại!");
                }
            })
            .catch((error) => {
                message.error("Có lỗi xảy ra, xin vui lòng thử lại!");
            });

    };

    const onFinishFailed = (errorInfo) => { };
    //onOK
    const onOk = () => {
        formData.submit();
    };

    //onCancel
    const onCancel = () => {
        message.error('Đã huỷ');
        setIsOpenAddExpress(false);
    };

    // open modal
    const openModal = () => {
        setIsOpenAddExpress(true);
        axios.post(route('data.tblSelect'), {
            name: col.name,
            table_id: col.table_id,
        })
            .then((response) => {
                if (response.status == 200) {
                    // const listItems = response.data.data.columns.map((column: any) => {
                    //     if (column.block_type === null || column.block_type == '') {
                    //         return showDataPopup(column, response.data.data);
                    //     }
                    // });
                    // ContentForm = listItems;
                    setSelectTableId(response.data.data.table.id);
                } else {
                    message.success("Thêm mới thành công!");
                }
            })
            .catch((response) => {
                message.error("Có lỗi xảy ra, xin vui lòng thử lại 123");
            });
    };

    // add_express
    let label = <span>{colData.display_name} <a target='new' title={'QL danh sách "' + colData.display_name + '"'} href={route('data.index', [colData.select_table_id])}><UnorderedListOutlined /></a></span>;
    if (colData.add_express === 1) {
        label = <div>
            {label}
            <Text className='_point' type="success" onClick={openModal} title={'Thêm nhanh "' + colData.display_name + '"'}> <PlusSquareOutlined /></Text>
        </div>
    }
    label = <div>
        {label}
    </div>

    let name = col.name;
    if (langId > 0) {
        name = 'lang_' + langId + '_' + col.name;
    }
    function checkAll() {
        if (col.check_all_selects && col.check_all_selects === 1) {
            return <Form.Item name={"checkall_" + name} className='checkbox-checkall'>
                <Checkbox.Group><Checkbox value={true} /></Checkbox.Group>
            </Form.Item>
        }
        return '';
    }
    return <Col key={col.name} sm={{ span: 12 }} md={{ span: 24 }} lg={{ span: col.col }} >
        {/* modal */}
        <Modal
            title={colData.display_name}
            open={isOpenAddExpress}
            onOk={onOk}
            onCancel={onCancel}
            confirmLoading={loadingBtnAdd}
        >
            <Form
                name="basic"
                layout="vertical"
                form={formData}
                onFinish={onFinish}
                onFinishFailed={onFinishFailed}
                autoComplete="off"
                className='form-modal'
            >
                {/* {listItems} */}
                {contentForm}
            </Form>
        </Modal>

        {/* form */}
        <Form.Item name={name} rules={checkRule(col)} label={label}>
            <Select mode={mode}
                showSearch
                style={{ width: '100%' }}
                placeholder={col.placeholder ?? 'Search to Select'}
                optionFilterProp="children"
                filterOption={(input, option) => (option?.label ?? '').toLowerCase().includes(input.toLowerCase())}
                options={optionsData.selectbox}
                allowClear={true}
            />
        </Form.Item>

        {/* check all */}
        {checkAll()}
    </Col>
}

export function HTSelectsModal(col, options, mode = 'multiple', langId = 0) {
    let name = col.name;
    if (langId > 0) {
        name = 'lang_' + langId + '_' + col.name;
    }
    return <Col key={col.name} sm={{ span: 12 }} md={{ span: 24 }} lg={{ span: col.col }} >
        <Form.Item name={name} rules={checkRule(col)} label={col.display_name}>
            <Select mode={mode}
                showSearch
                labelInValue={true}
                style={{ width: '100%' }}
                placeholder={col.placeholder ?? 'Search to Select'}
                optionFilterProp="children"
                filterOption={(input, option) => (option?.label ?? '').toLowerCase().includes(input.toLowerCase())}
                options={options}
                allowClear={true}
            />
        </Form.Item>
    </Col>
}

// mode tag
export function HTTags(col: any, options: any, mode = 'tags', langId = 0) {
    let name = col.name;
    if (langId > 0) {
        name = 'lang_' + langId + '_' + col.name;
    }
    return <Col key={col.name} xs={{ span: 24 }} sm={{ span: 12 }} md={{ span: 24 }} lg={{ span: col.col }} >
        <Form.Item name={name} rules={checkRule(col)} label={col.display_name}>
            <Select mode='tags'
                showSearch
                style={{ width: '100%' }}
                placeholder={col.placeholder ?? 'Search to Select'}
                optionFilterProp="children"
                filterOption={(input, option) => (option?.label ?? '').toLowerCase().includes(input.toLowerCase())}
                options={options}
                allowClear={true}
            />
        </Form.Item>
    </Col>
}

// Keyword chứa từ khóa chính, từ khóa phụ và từ khóa liên quan tới thương hiệu, dịch vụ
// Không lặp lại các keyword tránh tình trạng Google phạt lỗi Duplicate Contens
// Tối thiểu phải từ 2 - 5 từ khóa trở lên
// Hạn chế sử dụng từ khóa dài.
export function HTTextarea(col: any, langId = 0) {
    const keyword_tmp = <div><p>(<b>Ghi chú: </b><em>Từ khóa nên chứa từ khóa chính, từ khóa phụ và từ khóa liên quan tới thương hiệu, dịch vụ)</em></p></div>;
    const description_tmp = <div><p><b>Ghi chú: </b> <b>[SEO] Mô tả là</b><em> Mô tả ngắn gọn về bài viết này</em></p></div>;
    const [seo, setSeo] = useState({ meta_keyword: keyword_tmp, meta_description: description_tmp });
    let name = col.name;
    if (langId > 0) {
        name = 'lang_' + langId + '_' + col.name;
    }

    function blurTextArea(value: any, col: any) {
        const val = value.target.value;


        if (col.name.search("meta_description") >= 0) {
            let checkLength = <></>;
            if (val.length > 300) {
                checkLength = <li className='_error'><CloseCircleOutlined /> Nội dung quá dài, vượi quá 300 ký tự, số lượng hiện tại <b>{val.length}</b> ký tự</li>;
            }
            if (val.length < 20) {
                checkLength = <li className='_error'><CloseCircleOutlined /> Nội dung quá ngắn, dưới 20 ký tự, số lượng hiện tại <b>{val.length}</b> ký tự</li>;
            }
            if (val.length >= 20 && val.length < 50) {
                checkLength = <li className='_warning'><CloseCircleOutlined /> Nội dung hơi ngắn, Nội dung đạt yêu cầu là trên 50 ký tự, số lượng hiện tại <b>{val.length}</b> ký tự</li>;
            }
            if (val.length >= 50) {
                checkLength = <li className='_success'><CloseCircleOutlined /> Số lượng hiện tại <b>{val.length}</b> ký tự</li>;
            }
            const description_tmp = <div>
                <p><b>Ghi chú: </b> Là mô tả ngắn gọn về bài viết này,</p>
                <p>- <em> Nội dung tối thiểu là 20 ký tự</em></p>
                <p>- <em> Nội dung đạt chuẩn yêu cầu của google là 50 đến 300 ký tự</em></p>
                <ul>
                    {checkLength}
                </ul>
            </div>
            seo['meta_description'] = description_tmp;
            let seo_tmp = cloneDeep(seo);
            setSeo(seo_tmp);
        }

        // keyword
        if (col.name.search("meta_keyword") >= 0) {
            // check số lượng
            let checkSoLuong = <></>;
            let soKyTu = <></>;
            let keyword_max = <></>;
            const keywords = val.split(",");
            if (keywords.length > 0 && keywords.length < 5) {
                checkSoLuong = <li className='_warning'><CloseCircleOutlined />Mới chỉ có <b>0{keywords.length}</b> từ khóa, nên có từ 05 từ khóa trở lên để bài viết được đánh giá cao hơn</li>;
            }
            if (keywords.length >= 5) {
                checkSoLuong = <li className='_success'><CheckCircleOutlined /> Đã có {keywords.length} từ khóa</li>;
            }
            if (val === '') {
                checkSoLuong = <li className='_error'><CloseCircleOutlined /> Bạn chưa có từ khóa nào</li>;
            }

            // so ky tu
            if (val.length > 250) {
                soKyTu = <li className='_error'><CloseCircleOutlined /> Số lượng vượt quá 250 ký tự, Đối với nội dung quá dài thì từ ký tự thứ 251 trở đi google sẽ bỏ qua</li>;
            }
            if (val.length < 20) {
                soKyTu = <li className='_error'><CloseCircleOutlined /> Số lượng ký tự hơi ít quá, hiện tại {val.length}</li>;
            }
            // so ky tu
            if (val.length >= 20 && val.length <= 250) {
                soKyTu = <li className='_success'><CheckCircleOutlined /> Số lượng ký tự: {val.length}</li>;
            }

            // check độ dài
            keywords.forEach(function callback(k, index) {
                if (k.length > 50) {
                    keyword_max = <li className='_error'><CloseCircleOutlined /> Từ khóa <b>"{k}"</b> quá dài, <b>{k.length}</b> ký tự</li>;
                }
            });

            const keyword_tmp = <div>
                <p><b>Ghi chú: </b><em> <b>Từ khóa</b> bao gồm từ khóa chính có liên quan đến nội dung của bài viết, và từ khóa phụ và từ khóa liên quan tới thương hiệu, dịch vụ</em></p>
                <p><b>Ví dụ: </b><em>Các từ khóa cách nhau bằng dấu phẩy: Tin tức, tin tuc, bất động sản, bat dong san</em></p>
                <ul>
                    {checkSoLuong}
                    {soKyTu}
                    {keyword_max}
                </ul>
            </div>;

            seo['meta_keyword'] = keyword_tmp;
            let seo_tmp = cloneDeep(seo);
            setSeo(seo_tmp);
        }
    }

    let seoName = col.name;
    return <Col key={col.id} onBlur={(value) => { blurTextArea(value, col); }} key={col.id} xs={{ span: 24 }} sm={{ span: 12 }} md={{ span: 24 }} lg={{ span: col.col }}>
        <Form.Item name={name} rules={checkRule(col)} label={col.display_name}>
            <TextArea placeholder={col.placeholder ?? ''} />
        </Form.Item>
        <div>{seo[seoName]}</div>
    </Col>
}

export function HTNumber(col, langId = 0) {
    let name = col.name;
    if (langId > 0) {
        name = 'lang_' + langId + '_' + col.name;
    }
    return <Col key={col.id} xs={{ span: 24 }} sm={{ span: 12 }} md={{ span: 24 }} lg={{ span: col.col }}>
        <Form.Item name={name} rules={checkRule(col)} label={col.display_name}>
            <InputNumber style={{ width: '100%' }}
                placeholder={col.placeholder ?? ''}
                formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                parser={(value) => value.replace(/\$\s?|(,*)/g, '')} />
        </Form.Item>
    </Col>
}


export function HTDate(col, langId = 0) {
    let name = col.name;
    if (langId > 0) {
        name = 'lang_' + langId + '_' + col.name;
    }
    return <Col key={col.name} xs={{ span: 24 }} sm={{ span: 12 }} md={{ span: 24 }} lg={{ span: col.col }} >
        <Form.Item name={name} rules={checkRule(col)} label={col.display_name}>
            <DatePicker placeholder={col.placeholder ?? ''} format={DATE_FORMAT_SHOW} />
        </Form.Item>
    </Col>
}

export function HTDateTime(col, langId = 0) {
    // return;
    let name = col.name;
    if (langId > 0) {
        name = 'lang_' + langId + '_' + col.name;
    }
    return <Col key={col.name} xs={{ span: 24 }} sm={{ span: 12 }} md={{ span: 24 }} lg={{ span: col.col }} >
        <Form.Item name={name} rules={checkRule(col)} label={col.display_name}>
            <DatePicker placeholder={col.placeholder ?? ''} showTime={{ format: 'HH:mm:ss' }} format="DD/MM/YY HH:mm:ss" />
        </Form.Item>
    </Col>
}

export function HTTime(col, langId = 0) {
    let name = col.name;
    if (langId > 0) {
        name = 'lang_' + langId + '_' + col.name;
    }
    return <Col key={col.name} xs={{ span: 24 }} sm={{ span: 12 }} md={{ span: 24 }} lg={{ span: col.col }} >
        <Form.Item name={name} rules={checkRule(col)} label={col.display_name}>
            <TimePicker />
        </Form.Item>
    </Col>
}


export function HTPassword(col, langId = 0) {
    let name = col.name;
    if (langId > 0) {
        name = 'lang_' + langId + '_' + col.name;
    }
    return <Col key={col.name} xs={{ span: 24 }} sm={{ span: 12 }} md={{ span: 24 }} lg={{ span: col.col }}>
        <Form.Item name={name} rules={checkRule(col)} label={col.display_name}>
            <Input.Password placeholder={col.placeholder ?? ''} />
        </Form.Item>
    </Col>
}


export function HTInput(col: any, langId = 0) {
    let name = col.name;
    if (langId > 0) {
        name = 'lang_' + langId + '_' + col.name;
    }
    let note = <span></span>;
    if (col.name.search("meta_title") >= 0) {
        note = <p><b>Ghi chú: </b><em> "[SEO] Tiêu đề" là thẻ tiêu đề của bài viết, Nếu bỏ trống, sẽ tư động lấy tiêu đề của bài viết</em></p>
    }
    let placeholder = '';
    if (col.auto_generate_code) {
        placeholder = 'Auto tạo nêu nếu để trống';
    }
    const classMainInput = 'input-' + col.id;
    return <Col key={col.id} xs={{ span: 24 }} sm={{ span: 12 }} md={{ span: 24 }} lg={{ span: col.col }} className={classMainInput}>
        <Form.Item name={name} rules={checkRule(col)} label={col.display_name}>
            <Input placeholder={col.placeholder ?? ''} />
        </Form.Item>
        {note}
    </Col>
}
export function smartSearch(table: any) {
    if (table.smart_search === 1) {
        return <Col xs={{ span: 24 }} sm={{ span: 12 }} md={{ span: 24 }} lg={{ span: 6 }} >
            <Form.Item name='sm_keyword' label='Từ khoá'>
                <Input />
            </Form.Item>
        </Col>
    }
}

export function smartSearch02(table: any) {
    if (table.smart_search === 1) {
        return <Col key={10000} sm={{ span: 24 }} className='item-search'>
            <Form.Item name='sm_keyword' label='Từ khoá'>
                <Input />
            </Form.Item>
        </Col>
    }
}

// form search
export function showDataSearch(col: any, prop: any) {
    let result;
    const typeEdit = col.type_edit;
    if (col.add2search !== 1) {
        return false;
    }
    switch (typeEdit) {
        case 'summoner':
            result = '';
            break;
        case 'textarea':
            result = <Form.Item key={col.name} name={col.name} label={col.display_name}>
                <TextArea rows={4} />
            </Form.Item>

            break;
        case 'number':
            result = <Form.Item key={col.name} name={col.name} label={col.display_name}>
                <InputNumber style={{ width: '100%' }}
                    formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                    parser={(value) => value.replace(/\$\s?|(,*)/g, '')} />
            </Form.Item>

            break;
        case 'select':
            result = <Form.Item key={col.name} name={col.name} label={col.display_name}>
                <Select
                    allowClear={true}
                    showSearch
                    style={{ width: '100%' }}
                    placeholder="Search to Select"
                    optionFilterProp="children"
                    filterOption={(input, option) => (option?.label ?? '').toLowerCase().includes(input.toLowerCase())}
                    options={prop.selectData[col.name]['selectbox']}
                />
            </Form.Item>

            break;

        case 'selects':
        case 'tags':
            result = <Form.Item key={col.name} name={col.name} label={col.display_name}>
                <Select
                    showSearch
                    style={{ width: '100%' }}
                    placeholder="Search to Select"
                    optionFilterProp="children"
                    filterOption={(input, option) => (option?.label ?? '').toLowerCase().includes(input.toLowerCase())}
                    options={prop.selectsData[col.name]['selectbox']}
                />
            </Form.Item>

            break;
        case 'date':
            result = <Form.Item key={col.name} name={col.name} label={col.display_name}>
                <RangePicker />
            </Form.Item>

            break;
        default:
            result = <Form.Item key={col.name} name={col.name} label={col.display_name}>
                <Input />
            </Form.Item>

            break;
    }

    return result;
}

export function showDataSearch02(col: any, prop: any) {
    let result;
    const typeEdit = col.type_edit;
    if (col.add2search !== 1) {
        return false;
    }
    switch (typeEdit) {
        case 'summoner':
            result = '';
            break;
        case 'textarea':
            result = <Col key={col.name} sm={{ span: 24 }} className='item-search'>
                <Form.Item name={col.name} label={col.display_name}>
                    <TextArea rows={4} />
                </Form.Item>
            </Col>

            break;
        case 'number':
            result = <Col key={col.name} sm={{ span: 24 }} className='item-search'>
                <Form.Item name={col.name} label={col.display_name}>
                    <InputNumber style={{ width: '100%' }}
                        formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                        parser={(value) => value.replace(/\$\s?|(,*)/g, '')} />
                </Form.Item>
            </Col>
            break;
        case 'select':
            result = <Col key={col.name} sm={{ span: 24 }} className='item-search'>
                <Form.Item name={col.name} label={col.display_name}>
                    <Select
                        allowClear={true}
                        showSearch
                        style={{ width: '100%' }}
                        placeholder="Search to Select"
                        optionFilterProp="children"
                        filterOption={(input, option) => (option?.label ?? '').toLowerCase().includes(input.toLowerCase())}
                        options={prop.selectData[col.name]['selectbox']}
                    />
                </Form.Item>
            </Col>
            break;

        case 'selects':
        case 'tags':
            result = <Col key={col.name} sm={{ span: 24 }} className='item-search'>
                <Form.Item name={col.name} label={col.display_name}>
                    <Select
                        showSearch
                        style={{ width: '100%' }}
                        placeholder="Search to Select"
                        optionFilterProp="children"
                        filterOption={(input, option) => (option?.label ?? '').toLowerCase().includes(input.toLowerCase())}
                        options={prop.selectsData[col.name]['selectbox']}
                    />
                </Form.Item>
            </Col>
            break;
        case 'date':
            result = <Col key={col.name} sm={{ span: 24 }} className='item-search'>
                <Form.Item name={col.name} label={col.display_name}>
                    <RangePicker />
                </Form.Item>
            </Col>
            break;
        default:
            result = <Col sm={{ span: 24 }} className='item-search'>
                <Form.Item key={col.name} name={col.name} label={col.display_name}>
                    <Input />
                </Form.Item>
            </Col>
            break;
    }

    return result;
}

export function HTColor(col: any) {
    return <Col key={col.id} xs={{ span: 24 }} sm={{ span: 12 }} md={{ span: 24 }} lg={{ span: col.col }}>
        <Form.Item name={col.name} rules={checkRule(col)} label={col.display_name}>
            <ColorPicker showText />
        </Form.Item>
    </Col>
}

export function HTCascaderTable(col: any, prop: any) {
    const filter = (inputValue, path) => path.some(
        (option) => option.label.toLowerCase().indexOf(inputValue.toLowerCase()) > -1,
    );

    return <Col key={col.id} xs={{ span: 24 }} sm={{ span: 12 }} md={{ span: 24 }} lg={{ span: col.col }}>
        <Form.Item name={col.name} rules={checkRule(col)} label={col.display_name}>
            <Cascader options={prop.cascaderData[col.name]} showSearch={{ filter }} />
        </Form.Item>
    </Col>
}