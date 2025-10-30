
import {
    Button,
} from "antd";

import {
    PayCircleOutlined,
    PercentageOutlined,
    FileDoneOutlined,
    TransactionOutlined,
} from "@ant-design/icons";

import { Link } from "@inertiajs/react";
import { intval, numberFormat } from "./common";

export function getTotalHoaDon(prop) {
    if(prop.table.name !== 'hoa_don') {
        return [];
    }
    let tong_tien = prop.data.tong_tien ? numberFormat(prop.data.tong_tien) : 0,
        giam_gia = prop.data.giam_gia ? numberFormat(prop.data.giam_gia) : 0,
        vat_money = prop.data.vat_money ? numberFormat(prop.data.vat_money) : 0,
        thanh_toan = prop.data.thanh_toan ? numberFormat(prop.data.thanh_toan) : 0;
    const content = [
        {
            title: <b>Tổng Thanh Toán</b>,
            value: tong_tien,
            icon: <PayCircleOutlined />
        },
        {
            title: <b>Giảm Giá</b>,
            value: giam_gia,
            icon: <PercentageOutlined />
        },
        {
            title: <b>Thuế</b>,
            value: vat_money,
            icon: <FileDoneOutlined />
        },
        {
            title: <b>Khách Thanh Toán</b>,
            value: thanh_toan,
            icon: <TransactionOutlined />
        },
    ];
    return {
        content: content,
        param: {
            tong_tien:tong_tien,
            vat_money:vat_money,
            thanh_toan:thanh_toan,
            giam_gia:giam_gia
        }
    };
}

export function setTotalHoaDon(param, col) {
    console.log('param', param);
    let tong_tien = 0,
    giam_gia = 0,
    vat_money = 0,
    thanh_toan = 0;
    for (const [key, val] of Object.entries(param[col.name])) {
        console.log('val', intval(val))
        tong_tien += intval(val.thanh_tien);
        giam_gia += intval(val.chiet_khau);
        vat_money += intval(val.vat_money);
        thanh_toan += intval(val.thanh_toan);
    }
    giam_gia = 0 - giam_gia;
    const content = [
        {
            title: <b>Tổng Thanh Toán</b>,
            value: numberFormat(tong_tien),
            icon: <PayCircleOutlined />
        },
        {
            title: <b>Giảm Giá</b>,
            value: (numberFormat(giam_gia)),
            icon: <PercentageOutlined />
        },
        {
            title: <b>Thuế</b>,
            value: numberFormat(vat_money),
            icon: <FileDoneOutlined />
        },
        {
            title: <b>Khách Thanh Toán</b>,
            value: numberFormat(thanh_toan),
            icon: <TransactionOutlined />
        },
    ];
    return {
        content:content,
        param: {
            tong_tien:tong_tien,
            vat_money:vat_money,
            thanh_toan:thanh_toan,
            giam_gia:giam_gia
        }
    };
}
