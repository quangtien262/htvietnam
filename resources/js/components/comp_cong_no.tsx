import  { useReducer  } from 'react';
import {
    message,
    Popconfirm,
} from "antd";

import axios from "axios";
import {
    ArrowRightOutlined,
    CheckOutlined,
} from "@ant-design/icons";
import { numberFormat } from "../function/common";

const initialState = { isDisableBtn: true };

// 2. Định nghĩa reducer
function reducer(state, action) {
  switch (action.type) {
    case 'disable':
      return { isDisableBtn: true };
    case 'enable':
      return { isDisableBtn: false };
    default:
      return state;
  }
}

export function tatToanCongNo(record) {
    const [state, dispatch] = useReducer(reducer, initialState);
    let isDisableBtn = false;
    if (record.cong_no === 0) {
        return '';
    }

    return <Popconfirm
        title={'TẤT TOÁN CÔNG NỢ'}
        onConfirm={() => {
            isDisableBtn =  true;
            axios.post(route("tatToanCongNo"), {
                loai_chung_tu: 'product_nhap_hang',
                chung_tu_id: record.id,
            })
                .then((response) => {
                    setLoadingBtn(false);
                    message.success("Cập nhật thứ tự thành công");
                })
                .catch((error) => {
                    message.error("Cập nhật thứ tự thất bại");
                });

            // openNotification("warning", "Đã tất toán thành công");
        }}
        // onCancel={() => openNotification("warning", "Đã hủy")}
        icon={<ArrowRightOutlined style={{ color: "#1890ff" }} />}
        cancelText="Hủy"
        okText="Tất toán"
        description={
            <div>
                <ul>
                    <li>Số tiền thanh toán <b>{numberFormat(record.cong_no)}<sup>đ</sup></b></li>
                    <li>Hóa đơn này sẽ đóng công nợ</li>
                    <li>Cập nhật lại phiếu chi tương ứng</li>
                    <li>Cập nhật lại sổ quỹ tương ứng</li>
                </ul>
            </div>
        }
    >
        <button disabled={state.isDisableBtn} className="btn-print"><CheckOutlined /> Tất toán công nợ</button>
    </Popconfirm>
}
