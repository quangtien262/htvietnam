import { result } from 'lodash';
import React from 'react';
import { showCheckbox } from './table';
import {
    Tooltip
} from "antd";
import {
    InfoCircleFilled
} from "@ant-design/icons";

export function getGioiTinh(id) {
    if (id === 1) {
        return 'Nam';
    }
    if (id === 2) {
        return 'Nữ';
    }
    if (id === 3) {
        return 'Khác';
    }
    return 'Chưa rõ';
}

export function numberFormat(value) {
    if (value === null) {
        return '0';
    }
    return `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')
}
export function numberFormatBycount(value, count = 2) {
    for (let i = 1; i < count; i++) {
        value = '0' + value;
    }
    return value;
}
export function numberFormat02(value, count = 2) {
    for (let i = 1; i < count; i++) {
        if (value.toString().length <= i) {
            value = '0' + value;
        }
    }
    return value;
}

export function nl2br(str, is_xhtml) {
    if (typeof str === 'undefined' || str === null) {
        return '';
    }
    var breakTag = (is_xhtml || typeof is_xhtml === 'undefined') ? '<br />' : '<br>';
    return (str + '').replace(/([^>\r\n]?)(\r\n|\n\r|\r|\n)/g, '$1' + breakTag + '$2');
}

// This function converts the string to lowercase, then perform the conversion
export function toLowerCaseNonAccentVietnamese(str) {
    if (!str) {
        return '';
    }
    str = str.toLowerCase();
    //     We can also use this instead of from line 11 to line 17
    //     str = str.replace(/\u00E0|\u00E1|\u1EA1|\u1EA3|\u00E3|\u00E2|\u1EA7|\u1EA5|\u1EAD|\u1EA9|\u1EAB|\u0103|\u1EB1|\u1EAF|\u1EB7|\u1EB3|\u1EB5/g, "a");
    //     str = str.replace(/\u00E8|\u00E9|\u1EB9|\u1EBB|\u1EBD|\u00EA|\u1EC1|\u1EBF|\u1EC7|\u1EC3|\u1EC5/g, "e");
    //     str = str.replace(/\u00EC|\u00ED|\u1ECB|\u1EC9|\u0129/g, "i");
    //     str = str.replace(/\u00F2|\u00F3|\u1ECD|\u1ECF|\u00F5|\u00F4|\u1ED3|\u1ED1|\u1ED9|\u1ED5|\u1ED7|\u01A1|\u1EDD|\u1EDB|\u1EE3|\u1EDF|\u1EE1/g, "o");
    //     str = str.replace(/\u00F9|\u00FA|\u1EE5|\u1EE7|\u0169|\u01B0|\u1EEB|\u1EE9|\u1EF1|\u1EED|\u1EEF/g, "u");
    //     str = str.replace(/\u1EF3|\u00FD|\u1EF5|\u1EF7|\u1EF9/g, "y");
    //     str = str.replace(/\u0111/g, "d");
    str = str.replace(/à|á|ạ|ả|ã|â|ầ|ấ|ậ|ẩ|ẫ|ă|ằ|ắ|ặ|ẳ|ẵ/g, "a");
    str = str.replace(/è|é|ẹ|ẻ|ẽ|ê|ề|ế|ệ|ể|ễ/g, "e");
    str = str.replace(/ì|í|ị|ỉ|ĩ/g, "i");
    str = str.replace(/ò|ó|ọ|ỏ|õ|ô|ồ|ố|ộ|ổ|ỗ|ơ|ờ|ớ|ợ|ở|ỡ/g, "o");
    str = str.replace(/ù|ú|ụ|ủ|ũ|ư|ừ|ứ|ự|ử|ữ/g, "u");
    str = str.replace(/ỳ|ý|ỵ|ỷ|ỹ/g, "y");
    str = str.replace(/đ/g, "d");
    // Some system encode vietnamese combining accent as individual utf-8 characters
    str = str.replace(/\u0300|\u0301|\u0303|\u0309|\u0323/g, ""); // Huyền sắc hỏi ngã nặng
    str = str.replace(/\u02C6|\u0306|\u031B/g, ""); // Â, Ê, Ă, Ơ, Ư
    // str = str.replace(/@|#|$|%|^|&|*|(|)|'|"|,|.|\/|\\|`|/g, "-");
    str = str.replace(/ /g, '-');
    str = str.replace(/[^\w\s]/gi, '-')
    // str = str.replace("%", "-");
    // str = str.replace(":", "-");
    return str;
}

// This function keeps the casing unchanged for str, then perform the conversion
export function toNonAccentVietnamese(str) {
    str = str.replace(/A|Á|À|Ã|Ạ|Â|Ấ|Ầ|Ẫ|Ậ|Ă|Ắ|Ằ|Ẵ|Ặ/g, "A");
    str = str.replace(/à|á|ạ|ả|ã|â|ầ|ấ|ậ|ẩ|ẫ|ă|ằ|ắ|ặ|ẳ|ẵ/g, "a");
    str = str.replace(/E|É|È|Ẽ|Ẹ|Ê|Ế|Ề|Ễ|Ệ/, "E");
    str = str.replace(/è|é|ẹ|ẻ|ẽ|ê|ề|ế|ệ|ể|ễ/g, "e");
    str = str.replace(/I|Í|Ì|Ĩ|Ị/g, "I");
    str = str.replace(/ì|í|ị|ỉ|ĩ/g, "i");
    str = str.replace(/O|Ó|Ò|Õ|Ọ|Ô|Ố|Ồ|Ỗ|Ộ|Ơ|Ớ|Ờ|Ỡ|Ợ/g, "O");
    str = str.replace(/ò|ó|ọ|ỏ|õ|ô|ồ|ố|ộ|ổ|ỗ|ơ|ờ|ớ|ợ|ở|ỡ/g, "o");
    str = str.replace(/U|Ú|Ù|Ũ|Ụ|Ư|Ứ|Ừ|Ữ|Ự/g, "U");
    str = str.replace(/ù|ú|ụ|ủ|ũ|ư|ừ|ứ|ự|ử|ữ/g, "u");
    str = str.replace(/Y|Ý|Ỳ|Ỹ|Ỵ/g, "Y");
    str = str.replace(/ỳ|ý|ỵ|ỷ|ỹ/g, "y");
    str = str.replace(/Đ/g, "D");
    str = str.replace(/đ/g, "d");
    // Some system encode vietnamese combining accent as individual utf-8 characters
    str = str.replace(/\u0300|\u0301|\u0303|\u0309|\u0323/g, ""); // Huyền sắc hỏi ngã nặng
    str = str.replace(/\u02C6|\u0306|\u031B/g, ""); // Â, Ê, Ă, Ơ, Ư
    return str;
}

export function inArray(item, array) {
    var length = array.length;
    for (var i = 0; i < length; i++) {
        if (array[i] === item) return true;
    }
    return false;
}

export function parseJson(str: string) {
    try {
        return JSON.parse(str);
    } catch (e) {
        return false;
    }
}

export function onDrop(info, gData) {
    const dropKey = info.node.key;
    const dragKey = info.dragNode.key;
    const dropPos = info.node.pos.split('-');
    const dropPosition = info.dropPosition - Number(dropPos[dropPos.length - 1]);
    const loop = (data, key, callback) => {
        for (let i = 0; i < data.length; i++) {
            if (data[i].key === key) {
                return callback(data[i], i, data);
            }
            if (data[i].children) {
                loop(data[i].children, key, callback);
            }
        }
    };
    const data = [...gData];

    // Find dragObject
    let dragObj;
    loop(data, dragKey, (item, index, arr) => {
        arr.splice(index, 1);
        dragObj = item;
    });
    if (!info.dropToGap) {
        // Drop on the content
        loop(data, dropKey, (item) => {
            item.children = item.children || [];
            // where to insert 示例添加到头部，可以是随意位置
            item.children.unshift(dragObj);
        });
    } else if (
        (info.node.props.children || []).length > 0 &&
        // Has children
        info.node.props.expanded &&
        // Is expanded
        dropPosition === 1 // On the bottom gap
    ) {
        loop(data, dropKey, (item) => {
            item.children = item.children || [];
            // where to insert 示例添加到头部，可以是随意位置
            item.children.unshift(dragObj);
            // in previous version, we use item.children.push(dragObj) to insert the
            // item to the tail of the children
        });
    } else {
        let ar = [];
        let i;
        loop(data, dropKey, (_item, index, arr) => {
            ar = arr;
            i = index;
        });
        if (dropPosition === -1) {
            ar.splice(i, 0, dragObj);
        } else {
            ar.splice(i + 1, 0, dragObj);
        }
    }
    // setGData(data);
    return data;
};

export function formatGdata_column(data) {
    return formatGdata_column_item(data);
}

function formatGdata_column_item(values) {
    return values.map((val) => {
        let children;
        if (val.children && val.children.length > 0) {
            children = formatGdata_column_item(val.children);
        }
        let title = <div>
            <span>{val.title}</span>
            <hr />
            {val.block_type !== '' ? '' : showsetting(val)}
        </div>;
        if (val.is_label === 1) {
            title = val.title;
        }
        return {
            'title': title,
            'key': val.key,
            'children': children
        };
    })
}

function showsetting(data) {
    let listDefault = ['show_in_list', 'add2search', 'require'];
    if (data.type_edit === 'select') {
        listDefault = ['show_in_list', 'add2search', 'require', 'add_express'];
    }
    return listDefault.map((name, displayName) => {
        return showCheckbox(data, name, 'column.update.edit')
    });
}

export function showsettingMenu(data) {
    return ['setting_shotcut', 'import', 'export'].map((name, displayName) => {
        return showCheckbox(data, name, 'table.update.edit')
    });
}

export function intval(value) {
    if (isNaN(value)) {
        return 0;
    }
    return +value;
}

export function generateAndShuffleCombinations(arr1, arr2, arr3) {
    let resultList = arr1.flatMap(a =>
        arr2.flatMap(b =>
            arr3.map(c => [a, b, c])
        )
    );
    resultList.sort(() => Math.random() - 0.5);

    return resultList;
}
export function showInfo(msg) {
    return <Tooltip title={msg} color="orange">
        <span className="tooltip-info"><InfoCircleFilled /></span>
    </Tooltip>
}

export function removeByIndex(array, indexToRemove) {
    if (!Array.isArray(array)) {
        console.error("Not an array!");
        return [];
    }

    array.splice(indexToRemove, 1);  // Xóa phần tử tại vị trí
    return array.sort();             // Trả lại mảng đã sắp xếp
}

export function options(data, haveCode = false) {
    return data.map((val, key) => {
        let label = val.name;
        if (haveCode) {
            let label = val.code + ' - ' + val.name;
        }
        return {
            value: val.id,
            label: label,
        }
    })
}

// key ko bắt đầu từ số 0
export function optionEntries(data: any, haveCode = false) {
    if (!data) {
        return [];
    }
    return Object.entries(data).map(([key, value]: [string, any]) => {

        let label = value.name;
        if (haveCode) {
            label = value.code + ' - ' + value.name;
        }
        return {
            value: value.id.toString(),
            label: label,
            info: value,
        }
    })
}

// key ko bắt đầu từ số 0
export function objEntries(data: any) {
    if (!data) {
        return [];
    }
    const result = Object.entries(data).map(([key, value]) => {
        return value
    });
    return result;
}
