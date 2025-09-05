import React, { useState, useRef } from "react";
import {Tag} from "antd";
import dayjs from "dayjs";
import {DATE_FORMAT, DATE_TIME_FORMAT, TIME_FORMAT} from './constant';
import {numberFormat} from "./common";

export function showSelect(col, record) {
    let result = '';
    const color = record[col.name].info.color ? record[col.name].info.color : ''
    if(record[col.name] && record[col.name].info && record[col.name].info.name) {
        result = <Tag style={{ color: color }}>{ record[col.name].info.name }</Tag>;
    }
    if(record[col.name] && record[col.name].info && record[col.name].info.label) {
        result = <Tag>{ record[col.name].info.label }</Tag> ;
    }
    return result;
}

export function showSelects(record, col) {
    let result = [];
    const color = record[col.name].info.color ? record[col.name].info.color : ''
    if(record[col.name] && record[col.name].info) {
        const item = record[col.name];
        for(const [key, val] of Object.entries(item.info)) {
            result.push(<Tag style={{ color: color }} key={key} style={{ color: record[col.name].info.color }}>{val.label}</Tag>);
        }
    }
    return result;
}

export function formatValueForm(columns, values, editor = useRef([])) {
    for (const [key, col] of Object.entries(columns)) {
        if (col.type_edit === "tiny") {
            values[col.name] = editor.current[col.name].getContents();
        }
        if (col.type_edit === "date") {
            values[col.name] = !values[col.name] ? '' : values[col.name].format(DATE_FORMAT);
        }
        if (col.type_edit === "datetime") {
            console.log('time', values[col.name]);
            values[col.name] = !values[col.name] ? '' : values[col.name].format(DATE_TIME_FORMAT);
        }
        if (col.type_edit === "select") {
            if(values[col.name]) {
                const select = {
                    id: values[col.name].value,
                    info: values[col.name]
                }
                values[col.name] = select;
            }
        }

        if (col.type_edit === "selects" && values[col.name]) {
            let item_id = [];
            for(const[k, v] of Object.entries(values[val.name])) {
                item_id.push(v.value)
            }
            const selects = {
                info: values[val.name],
                ids: item_id
            };
            values[val.name] = selects;
        }
        
        if (col.type_edit === "cascader" && values[col.name]) {
            console.log('kkk', values[col.name]);
        }
    }
    return values;
}

export function saveStorage_selectsTable (col_name, dataSource_tmp) {
    let storage = {};
    if(sessionStorage.getItem("storage")) {
        storage = parseJson(sessionStorage.getItem("storage"));
    }
    storage[col_name] = dataSource_tmp;
    sessionStorage.setItem("storage", JSON.stringify(storage));
    return storage;
}

export function showDate(col) {
    return {
        title: col.display_name,
        dataIndex: col.name,
        key: col.dataIndex,
        render: (_, record) => {
            return dayjs(record[col.name]).format(DATE_FORMAT);
        },
    };
}

export function showDateTime(col) {
    return {
        title: col.display_name,
        dataIndex: col.name,
        key: col.dataIndex,
        render: (_, record) => {
            return dayjs(record[col.name]).format(DATE_TIME_FORMAT);
        },
    };
}