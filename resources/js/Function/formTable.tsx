import React, { useState } from 'react';
import axios from 'axios';
import {
    Select, Col, Row, message, Typography, Divider, Calendar,ColorPicker, Cascader ,
    Form, Radio, Space, InputNumber, Input, DatePicker, TimePicker, Modal, Spin, Checkbox
} from 'antd';

import { numberFormat } from './common';
import { checkRule, showDataPopup, showData } from './data';
import { PlusSquareOutlined, CheckCircleOutlined, CloseCircleOutlined, UnorderedListOutlined} from '@ant-design/icons';
import cloneDeep from 'lodash/cloneDeep';

const { TextArea } = Input;
const { RangePicker } = DatePicker;
const DATE_FORMAT_SHOW = 'DD/MM/YYYY';
const { Text, Link } = Typography;




export function formCustomerItem(col, prop, langId = 0) {
    
    return <Row>
                <Col md={{ span: 12 }} sm={{ span: 24 }}>
                    <Form.Item name='name' label='Họ tên'>
                        <Input />
                    </Form.Item>
                </Col>
                <Col md={{ span: 12 }} sm={{ span: 24 }}>
                    <Form.Item name='name' label='Họ tên'>
                        <Input />
                    </Form.Item>
                </Col>
            </Row>
}
