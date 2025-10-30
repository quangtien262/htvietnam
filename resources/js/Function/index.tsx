
import {
    Button,
    Table,
    message,
    Modal,
    Form,
    Input,
    InputNumber,
    Popconfirm,
    Typography,
    Select,
    Row,
    Space,
    Tag,
    Card,
    Descriptions,
    notification,
    Divider,
    Image,
    Upload,
    Dropdown,
} from "antd";

import {
    FormOutlined,
} from "@ant-design/icons";

import { Link } from "@inertiajs/react";
import { numberFormat } from "./common";

export function renderData(col, record) {
    if (["image", "image_crop"].includes(col.type_edit)) {
        return <Image className="image-index" src={record[col.name]}></Image>;
    }

    if (["images", "images_crop"].includes(col.type_edit)) {
        if(record[col.name] && record[col.name].avatar) {
            return <Image className="image-index" src={record[col.name].avatar}></Image>;
        }
        return '';
    }

    if(col.type_edit === "number") {
        return numberFormat(record[col.name]);
    }

    if (col.is_view_detail === 1) {
        return <Link href={route("data.detail", [col.table_id, record.key])}>{record[col.name]}</Link>
    }
    
    return record[col.name];
}
