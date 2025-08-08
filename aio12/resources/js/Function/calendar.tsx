import React, { useState } from 'react';
import { Select, Col, Row, Badge, Descriptions, Card, Button, Popconfirm, message, Typography, Carousel, Image, Divider, Calendar, Form, Radio, Space, InputNumber, Input  } from 'antd';

// import axios from 'axios';
import { useForm, router, Link } from '@inertiajs/react';
import { numberFormat } from './common';

const { TextArea } = Input;

export function chamCongCellRender(type, chamCong) {
    switch (type) {
        case 1:
            return chamCongTypeDiLam(chamCong, 'success');
            break;
        case 2:
            return chamCongTypeHoliday(chamCong, 'warning');
        case 3:
            return chamCongTypeHoliday(chamCong, 'error');
            break;
        case 4:
        case 5:
            return chamCongTypeHoliday(chamCong, 'processing');
            break;
        default:
            break;
    }
}

export function getH() {
    let result = [];
    let label, value;
    for(let i = 8; i<= 24; i++) {
        label = i + "h";
        value = i;
        if(i < 10) {
            label = '0' + i + "h";
            value = '0' + i;
        }
        result.push({value: value.toString(), label: label})
    }
    return result;
}

export function getM() {
    let result = [];
    let i = 0;
    let value = i;
    while(i<60) {
        let label = i + "'";
        if(i < 10) {
            label = '0' + i + "'";
            value = '0' + i;
        }
        result.push({value: ''+i, label: label });
        i = i+5;
    }
    return result;
}

export function chamCongCurentUser(chamcongId) {
    router.post(
        route("data.cham_cong.current_user", [chamcongId]),
        values
    );
}

function chamCongTypeDiLam(cong, status = 'success') {
    return <ul className="events">
            <li><Badge status='success' text={cong.checkin_h + ':' + cong.checkin_m} /></li>
            <li><Badge status='success' text={cong.checkout_h + ':' + cong.checkout_m} /></li>
            { !cong.kpi || cong.kpi === '' ? '' : <li><Badge status='processing' color='red' text={cong.kpi + ' kpi'} /></li>}
            { !cong.luong_nghi_nua_ngay || cong.luong_nghi_nua_ngay === '' ? '' : <li><Badge status='processing' color='red' text={'Nghỉ nửa ngày:' + numberFormat(cong.luong_nghi_nua_ngay)} /></li>}
            { !cong.luong_nghi_ca_ngay || cong.luong_nghi_ca_ngay === '' ? '' : <li><Badge status='processing' color='red' text={'Nghỉ cả ngày:' + numberFormat(cong.luong_nghi_ca_ngay)} /></li>}
            { !cong.note || cong.note === '' ? '' : <li><Badge status={status} text={cong.note} /></li>}
            { !cong.note || cong.note_curren === '' ? '' : <li><Badge status='success' text={cong.note_curren} /></li>}
        </ul>
}

function chamCongTypeHoliday(cong, status = 'success') {
    return <ul className="events">
                { !cong.luong_nghi_nua_ngay || cong.luong_nghi_nua_ngay === '' ? '' : <li><Badge status='processing' color='red' text={'Nghỉ nửa ngày:' + numberFormat(cong.luong_nghi_nua_ngay)} /></li>}
                { !cong.luong_nghi_ca_ngay || cong.luong_nghi_ca_ngay === '' ? '' : <li><Badge status='processing' color='red' text={'Nghỉ cả ngày:' + numberFormat(cong.luong_nghi_ca_ngay)} /></li>}
                { cong.note === '' ? '' : <li><Badge status={status} text={cong.note} /></li>}
                { !cong.note || cong.note_curren === '' ? '' : <li><Badge status='success' text={cong.note_curren} /></li>}
            </ul>
}

