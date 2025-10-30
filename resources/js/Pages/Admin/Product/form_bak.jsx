import { useState } from "react";
import AdminLayout from "@/layouts/AdminLayout";
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
    Row,Col,
    Space,
    Tag,
    Card,
    Descriptions,
    notification,
    Divider,
    Image,
    Upload,
    Tooltip ,
    Switch, Radio, DatePicker
} from "antd";

// image
import { DndContext, PointerSensor, useSensor } from '@dnd-kit/core';
import {
    arrayMove,
    SortableContext,
    useSortable,
    verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import ImgCrop from 'antd-img-crop';
import { CSS } from '@dnd-kit/utilities';

import ResizeObserver from "rc-resize-observer";
import { Link, router } from "@inertiajs/react";
import axios from "axios";
import {
    BarsOutlined,   // set giá trị mặc định vào form
    UploadOutlined,
    CheckOutlined,
    CloseOutlined, InfoCircleFilled
} from "@ant-design/icons";
import cloneDeep from 'lodash/cloneDeep';
import "../../../../css/form.css";
import "../../../../css/form_product.css";
import { result, values } from "lodash";
import { TextArea } from "devextreme-react";
import { numberFormat, showInfo } from '../../../Function/common';

import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";
import weekday from "dayjs/plugin/weekday";
import localeData from "dayjs/plugin/localeData";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
dayjs.extend(weekday);
dayjs.extend(localeData);
dayjs.extend(customParseFormat);
dayjs.extend(utc);
dayjs.extend(timezone);
const DATE_FORMAT_SHOW = 'DD/MM/YYYY';

export default function Dashboard(props) {
    const [api, contextHolder] = notification.useNotification();

    const [isOpenConfirmDelete, setIsOpenConfirmDelete] = useState(false);
    const [loadingBtnDelete, setLoadingBtnDelete] = useState(false);

    const [typeSubmit, setTypeSubmit] = useState('save'); // save, save_and_add

    const [formProduct, setFormProduct] = Form.useForm();
    const [thuocTinh, setThuocTinh] = useState(props.thuocTinh);
    const [subProducts, setSubProducts] = useState([]);
    const [subProductsIndex, setSubProductsIndex] = useState([]);
    const [thuocTinhClass, setThuocTinhClass] = useState(props.thuocTinhClass);
    const [thuongHieu, setThuongHieu] = useState(props.thuongHieu);
    const [productGroup, setProductGroup] = useState(props.productGroup);
    const [viTri, setViTri] = useState(props.viTri);
    const [DVTrongGoi, setDVTrongGoi] = useState(props.dvTrongGoi);
    
    const [type, setType] = useState(props.type);
    const [showHideDinhMuc, setShowHideDinhMuc] = useState('_hidden');
    const [showHideMoTa, setShowHideMoTa] = useState('_hidden');
    const [HSD, setHSD] = useState({label:'Vô hạn', value:1});
    const [lichSuDung, setLichSuDung] = useState(props.lichSuDung);
    const [donViHSD, setDonViHSD] = useState('Ngày');

    // file
    const [fileList, setFileList] = useState([]);
    const [isStopSubmit, setIsStopSubmit] = useState(false);

    // HH
    // const [classVitri, setClassVitri] = useState(1);
    // const [classTrongLuong, setClassTrongLuong] = useState(1);
    // const [classTonKho, setClassTonKho] = useState(1);
    // const [classThuocTinh, setClassThuocTinh] = useState(1); // hh,dv,

    // // dv
    // const [classGiaVon, setClassGiaVon] = useState(1); // hh, dv

    // const [classThoiLuong, setClassThoiLuong] = useState(0);

    // // gói
    // const [classDVTrongGoi, setClassDVTrongGoi] = useState(0); 

    // // The TK
    // const [classLoaiHang, setClassLoaiHang] = useState(0);

    // const [fileList, setFileList] = useState(props.imagesData.length == 0 ? [] : props.imagesData.map((item) => {
    //             return {
    //                 name: item.name,
    //                 status: item.status,
    //                 url: item.url
    //             }
    //         }
    //     ));

    const onFinish = (values) => {
        // console.log('values', values);return;
        
        values.sub_product_index = subProductsIndex;
        values.type = type;
        values.donViHSD = donViHSD;
        values.pid = props.pid;
        if(values.hsd_ngay_cu_the) {
            values.hsd_ngay_cu_the = dayjs(values.hsd_ngay_cu_the).format('YYYY-MM-DD')
        }
        

        // set images
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
            values.images = images;
        }

        router.post(route("product.save"),values);
    }

    function saveProduct() {
        formProduct.submit();
    }

    function saveAndContinue() {
        formProduct.submit();
    }

    const changeLichSuDung = (val, info) => {
        setLichSuDung(info);
        const classItem_tmp = classItem;
        classItem_tmp.lich_trinh_sd__khoang_cach_moi_buoi = '';
        if(val === 1) {
            classItem_tmp.lich_trinh_sd__khoang_cach_moi_buoi = '_hidden';
        }
        setClassItem(classItem_tmp);
    }

    const changeDonViHSD = (val, info) => {
        setDonViHSD(val);
    }

    const sensor = useSensor(PointerSensor, {
        activationConstraint: {
            distance: 10,
        },
    });

    const onDragEnd = ({ active, over }) => {
        if (active.id !== over?.id) {
            setFileList((prev) => {
            const activeIndex = prev.findIndex((i) => i.uid === active.id);
            const overIndex = prev.findIndex((i) => i.uid === over?.id);
            return arrayMove(prev, activeIndex, overIndex);
            });
        }
    };

    const onChangeImage = ({ fileList: newFileList }) => {
        console.log('newFileList', newFileList);
        
        setFileList(newFileList);
    };


    const DraggableUploadListItem = ({ originNode, file }) => {
        const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
            id: file.uid,
        });
        const style = {
            transform: CSS.Transform.toString(transform),
            transition,
            cursor: 'move',
        };
        return (
            <div
            ref={setNodeRef}
            style={style}
            // prevent preview event when drag end
            className={isDragging ? 'is-dragging' : ''}
            {...attributes}
            {...listeners}
            >
            {/* hide error tooltip when dragging */}
            {file.status === 'error' && isDragging ? originNode.props.children : originNode}
            </div>
        );
    };

    function handleChangeThuocTinh(value, tt) {
        let thuocTinhClass_tmp = [];
        thuocTinh.map((u) => {
            if(Object.values(value).includes(u.id)) {
                thuocTinhClass_tmp[u.id] = 'active';
            } else {
                thuocTinhClass_tmp[u.id] = '_hidden';
                formProduct.setFieldValue('thuoc_tinh_' + u.id, []);
            }
            
        })
        
        setThuocTinhClass(thuocTinhClass_tmp);
        updateSubProduct();
        
    };

    function updateSubProduct() {
        const thuocTinhIds_active = formProduct.getFieldValue('thuoc_tinh');
        if(!thuocTinhIds_active) {
            return '';
        }
        const thuoc_tinh_key = [];
        let check;
        for (const [key, value] of Object.entries(thuocTinhIds_active)) {
            check = formProduct.getFieldValue('thuoc_tinh_' + value);
            
            if(check && check.length > 0) {
                thuoc_tinh_key.push(check);
            }
        }

        const gia_von = formProduct.getFieldValue('gia_von');
        const gia_ban = formProduct.getFieldValue('gia_ban');
        const ton_kho = formProduct.getFieldValue('ton_kho');
        console.log('gia_von', gia_von);
        
        const proList = generateSubProduct(thuoc_tinh_key);
        setSubProductsIndex(proList);
        const subProducts_tmp = proList.map((pro) => {
            let name = JSON.stringify(pro);
            name = name.replaceAll('"','');
            name = name.replaceAll('[','');
            name = name.replaceAll(']','');
            name = name.replaceAll(',',' - ');
            
            return {
                name: name,
                gia_von: gia_von,
                gia_ban: gia_ban,
                ton_kho: ton_kho,
            }
            
        });

        setSubProducts(subProducts_tmp);
    }

    function generateSubProduct(thuocTinhKey) {
        const leng = thuocTinhKey.length;

        if(leng === 0) {
            return [];
        } 

        if(leng === 1) {
            return thuocTinhKey[0];
        }

        if(leng === 2) {
            return thuocTinhKey[0].flatMap((a) => {
                return thuocTinhKey[1].map((b) => {
                    return [a, b];
                })
            });
        }

        if(leng === 3) {
            return thuocTinhKey[0].flatMap((a) => {
                return thuocTinhKey[1].flatMap((b) => {
                    return thuocTinhKey[2].map((c) => {
                        return [a, b, c];
                    })
                })
            });
        }

        if(leng === 4) {
            return thuocTinhKey[0].flatMap((a) => {
                return thuocTinhKey[1].flatMap((b) => {
                    return thuocTinhKey[2].flatMap((c) => {
                        return thuocTinhKey[3].map((d) => {
                            return [a, b, c, d];
                        })
                    })
                })
            });
        }

        if(leng === 5) {
            return thuocTinhKey[0].flatMap((a) => {
                return thuocTinhKey[1].flatMap((b) => {
                    return thuocTinhKey[2].flatMap((c) => {
                        return thuocTinhKey[3].flatMap((d) => {
                            return thuocTinhKey[4].map((e) => {
                                return [a, b, c, d, e];
                            })
                        })
                    })
                })
            });
        }

        if(leng === 6) {
            return thuocTinhKey[0].flatMap((a) => {
                return thuocTinhKey[1].flatMap((b) => {
                    return thuocTinhKey[2].flatMap((c) => {
                        return thuocTinhKey[3].flatMap((d) => {
                            return thuocTinhKey[4].flatMap((e) => {
                                return thuocTinhKey[4].map((f) => {
                                    return [a, b, c, d, e, f];
                                })
                            })
                        })
                    })
                })
            });
        }


        // key cuối cùng dùng map
        // if(leng === index + 1) {
        //     return thuocTinhKey[index].map((c) => {
        //         resultList[index] = c; 
        //         return resultList;
        //     })
        // }

    
        // return thuocTinhKey[index].flatMap((a) => {
        //         resultList[index] = a; 
        //         return generateSubProduct(resultList, thuocTinhKey, index + 1);
        // });
 

        
    }

    const handleChangeDonVi = (value) => {
        console.log('value', value);
    };
    
    function showThuocTinh() {
        return thuocTinh.map((tt) => {
            return <Form.Item key={tt.id} className={'item-form ' + thuocTinhClass[tt.id]} name={'thuoc_tinh_' + tt.id} label=''>
                        <Select
                            onChange={() => {updateSubProduct();}}
                            mode="tags"
                            style={{ width: '100%' }}
                            tokenSeparators={[',']}
                            options={[]}
                            placeholder={tt.name}
                        />
                    </Form.Item>
        });
    }

    function showSubProduct(subs) {
        return subs.map((sub, key) => {
            formProduct.setFieldValue('subProduct_name_' + key, sub.name);
            formProduct.setFieldValue('subProduct_giavon_' + key, sub.gia_von);
            formProduct.setFieldValue('subProduct_giaban_' + key, sub.gia_ban);
            formProduct.setFieldValue('subProduct_tonkho_' + key, sub.ton_kho);

            return <tr key={key}>
                <td>
                    <Form.Item className="item-form" name={'subProduct_name_' + key} label=''>
                        <Input readOnly={true} placeholder="Tên" />
                    </Form.Item>
                </td>
                <td>
                    <Form.Item className="item-form" name={'subProduct_code_' + key}>
                        <Input placeholder="Mã tự động" />
                    </Form.Item>
                </td>
                <td>
                    <Form.Item className="item-form" name={'subProduct_giavon_' + key} label=''>
                        <Input placeholder="Giá vốn" />
                    </Form.Item>
                </td>
                <td>
                    <Form.Item className="item-form" name={'subProduct_giaban_' + key} label=''>
                        <Input placeholder="Giá bán" />
                    </Form.Item>
                </td>
                <td>
                    <Form.Item className="item-form" name={'subProduct_tonkho_' + key} label=''>
                        <Input placeholder="Tồn kho" />
                    </Form.Item>
                </td>
            </tr>
        });

    }

    const changeDVTrongGoi = (value, info) => {
        console.log('vale', value);
        console.log('info', info);
        
        let soLan = 1;
        let name ='';
        const dv = info.map((val) => {
            name = 'so_lan_' + val.data.id;
            soLan = 1;
            if(formProduct.getFieldValue(name)) {
                soLan = formProduct.getFieldValue(name);
            }
            formProduct.setFieldValue(name , soLan);
            let price = 0;
            if(type == 2) {
                price = val.data.gia_von
            }
            if(type == 3) {
                price = val.data.gia_ban
            }
            const thanhTien = soLan * price;
            return {
                name: 'so_lan_' + val.data.id,
                label: val.data.code + ' - ' + val.data.name,
                id: val.data.id,
                soLan: soLan,
                price: price,
                thanhTien: thanhTien,
            }
        });
        
        setDVTrongGoi(dv);
        
    }

    function updateSLSanPhamTrongGoi(so_lan, index) {
        const DVTrongGoi_tmp = cloneDeep(DVTrongGoi);
        const thanhTien = so_lan * DVTrongGoi[index].price;
        console.log('thanhTien', thanhTien);
        DVTrongGoi_tmp[index] = {
            name: DVTrongGoi[index].name,
            label: DVTrongGoi[index].label,
            id: DVTrongGoi[index].id,
            soLan: so_lan,
            price: DVTrongGoi[index].price,
            thanhTien: thanhTien,
        }
        console.log('DVTrongGoi_tmp', DVTrongGoi_tmp);
        
        setDVTrongGoi(DVTrongGoi_tmp);
    }


    function showDVTrongGoi(dv) {
        let listDV = DVTrongGoi.map((d, i) => {
            return <tr key={i}>
                <td>
                    <p>{d.label}</p>
                </td>
                <td>
                    <Form.Item className="item-form so-lan-su-dung" name={d.name}>
                        <InputNumber onChange={(sl)=>updateSLSanPhamTrongGoi(sl, i)} 
                            placeholder="Số lần sử dụng" 
                            formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')} 
                            parser={(value) => value.replace(/\$\s?|(,*)/g, '')} 
                        />
                    </Form.Item>
                </td>
                <td>{numberFormat(d.price)}</td>
                <td>{numberFormat(d.thanhTien)}</td>
            </tr>
        });

        return listDV;
    }


    
    
    const [classItem, setClassItem] = useState(props.classItem);

    const changeType = (value) => {
        
        const typeProduct = value.target.value;

        // reset all
        setSubProducts([]);
        setType(typeProduct);
        setDVTrongGoi([]);

        formProduct.resetFields();

        let classItem_tmp = cloneDeep(classItem);
        classItem_tmp = getClassItem(typeProduct);
        setClassItem(classItem_tmp);
    }

    function getClassItem(typeProduct) {
        let classItem_tmp = {};
        switch (typeProduct) {
            case 1:
                // set giá trị mặc định vào form
                formProduct.setFieldValue('dinh_muc_ton_it_nhat', 1);
                formProduct.setFieldValue('dinh_muc_ton_nhieu_nhat', 999999999);

                // check ẩn hiện
                classItem_tmp.title_col01 = 'Hàng hóa'
                classItem_tmp.thoi_luong ='_hidden'; // dich vu
                classItem_tmp.ton_kho =''; // HH
                classItem_tmp.product_group_id =''; // HH, dich vu, gói
                classItem_tmp.product_group_ids_apply ='_hidden'; //  thẻ(chọn nhiều)
                classItem_tmp.thuong_hieu_id =''; // HH, dich vu, gói, thẻ
                classItem_tmp.vi_tri_id =''; // HH
                classItem_tmp.gia_von =''; // HH
                classItem_tmp.gia_ban =''; // HH, dich vu, gói, thẻ
                classItem_tmp.menh_gia ='_hidden'; // thẻ
                classItem_tmp.trong_luong =''; // HH
                classItem_tmp.hoa_hong_nv =''; // HH, dich vu
                classItem_tmp.hoa_hong_nv_ban_hang =''; // HH, dich vu
                classItem_tmp.hoa_hong_nv_thuc_hien =''; // HH, dich vu
                classItem_tmp.ban_truc_tiep =''; // HH, dich vu
                classItem_tmp.thuoc_tinh =''; // HH, dich vu
                classItem_tmp.don_vi_tinh =''; // HH, dich vu
                // detail
                classItem_tmp.dinh_muc_ton_it_nhat =''; // HH
                classItem_tmp.dinh_muc_ton_nhieu_nhat =''; // HH (999999999)
                classItem_tmp.mo_ta =''; // HH, dich vu, gói, thẻ
                classItem_tmp.ghi_chu =''; // dich vu, gói,thẻ
                classItem_tmp.nguyen_lieu_tieu_hao ='_hidden'; // dich vu

                classItem_tmp.lich_trinh_sd ='_hidden'; // gói
                classItem_tmp.lich_trinh_sd__khoang_cach_moi_buoi ='_hidden'; // gói

                classItem_tmp.han_su_dung = '_hidden'; // gói, thẻ: Vô hạn, ngày cụ thể, khoảng tg
                classItem_tmp.hsd_ngay_cu_the ='_hidden'; //
                classItem_tmp.hsd_khoang_thoi_gian ='_hidden';


                classItem_tmp.product_apply ='_hidden'; // gói
                classItem_tmp.loai_hang_hoa ='_hidden'; // thẻ - chọn nhiều
                classItem_tmp.hang_hoa_ap_dung ='_hidden'; // thẻ - chọn nhiều
                classItem_tmp.other ='_hidden'; // other - thẻ, gói
        
                classItem_tmp.dichVu_sp ='_hidden';
                classItem_tmp.dichVu_sp_titleInput ='';
                classItem_tmp.dichVu_sp_titlePrice ='';

                //
                classItem_tmp.title_code = 'Mã hàng hóa';
                classItem_tmp.title_name = 'Tên hàng hóa';
                break;
            case 2:
                // set giá trị mặc định vào form
                // formProduct.setFieldValue('han_su_dung', 1);

                // check ẩn hiện
                classItem_tmp.title_col01 = 'Dịch vụ'
                classItem_tmp.thoi_luong =''; // dich vu
                classItem_tmp.ton_kho ='_hidden'; // HH
                classItem_tmp.product_group_id =''; // HH, dich vu, gói
                classItem_tmp.product_group_ids_apply ='_hidden'; //  thẻ(chọn nhiều)
                classItem_tmp.thuong_hieu_id =''; // HH, dich vu, gói, thẻ
                classItem_tmp.vi_tri_id ='_hidden'; // HH
                classItem_tmp.gia_von =''; // HH
                classItem_tmp.gia_ban =''; // HH, dich vu, gói, thẻ
                classItem_tmp.menh_gia ='_hidden'; // thẻ
                classItem_tmp.trong_luong ='_hidden'; // HH
                classItem_tmp.hoa_hong_nv =''; // HH, dich vu
                classItem_tmp.hoa_hong_nv_ban_hang =''; // HH, dich vu
                classItem_tmp.hoa_hong_nv_thuc_hien =''; // HH, dich vu
                classItem_tmp.ban_truc_tiep =''; // HH, dich vu
                classItem_tmp.thuoc_tinh =''; // HH, dich vu
                classItem_tmp.don_vi_tinh =''; // HH, dich vu
                // detail
                classItem_tmp.dinh_muc_ton_it_nhat ='_hidden'; // HH
                classItem_tmp.dinh_muc_ton_nhieu_nhat ='_hidden'; // HH (999999999)
                classItem_tmp.mo_ta =''; // HH, dich vu, gói, thẻ
                classItem_tmp.ghi_chu =''; // dich vu, gói,thẻ
                classItem_tmp.nguyen_lieu_tieu_hao =''; // dich vu

                //lich_trinh_sd
                classItem_tmp.lich_trinh_sd ='_hidden'; // gói
                classItem_tmp.lich_trinh_sd__khoang_cach_moi_buoi ='_hidden'; // gói

                // /han_su_dung
                classItem_tmp.han_su_dung = '_hidden'; // gói, thẻ: Vô hạn, ngày cụ thể, khoảng tg
                classItem_tmp.hsd_ngay_cu_the ='_hidden'; //
                classItem_tmp.hsd_khoang_thoi_gian ='_hidden';

                classItem_tmp.product_apply =''; // gói
                classItem_tmp.loai_hang_hoa ='_hidden'; // thẻ - chọn nhiều
                classItem_tmp.hang_hoa_ap_dung ='_hidden'; // thẻ - chọn nhiều
                classItem_tmp.other ='_hidden'; // other - thẻ, gói

                classItem_tmp.dichVu_sp ='Nguyên liệu tiêu hao';
                classItem_tmp.dichVu_sp_titleInput ='Chọn nguyên liệu';
                classItem_tmp.dichVu_sp_titlePrice ='Giá vốn';

                //
                classItem_tmp.title_code = 'Mã dịch vụ';
                classItem_tmp.title_name = 'Tên dịch vụ';
                break;
            case 3:
                // set giá trị mặc định vào form
                formProduct.setFieldValue('han_su_dung', 1);

                // check ẩn hiện
                classItem_tmp.title_col01 = 'Gói dịch vụ, liệu trình'
                classItem_tmp.thoi_luong ='_hidden'; // dich vu
                classItem_tmp.ton_kho ='_hidden'; // HH
                classItem_tmp.product_group_id =''; // HH, dich vu, gói
                classItem_tmp.product_group_ids_apply ='_hidden'; //  thẻ(chọn nhiều)
                classItem_tmp.thuong_hieu_id =''; // HH, dich vu, gói, thẻ
                classItem_tmp.vi_tri_id ='_hidden'; // HH
                classItem_tmp.gia_von ='_hidden'; // HH
                classItem_tmp.gia_ban =''; // HH, dich vu, gói, thẻ
                classItem_tmp.menh_gia ='_hidden'; // thẻ
                classItem_tmp.trong_luong ='_hidden'; // HH
                classItem_tmp.hoa_hong_nv =''; // HH, dich vu
                classItem_tmp.hoa_hong_nv_ban_hang =''; // HH, dich vu
                classItem_tmp.hoa_hong_nv_thuc_hien ='_hidden'; // HH, dich vu
                classItem_tmp.ban_truc_tiep ='_hidden'; // HH, dich vu
                classItem_tmp.thuoc_tinh ='_hidden'; // HH, dich vu
                classItem_tmp.don_vi_tinh ='_hidden'; // HH, dich vu
                // detail
                classItem_tmp.dinh_muc_ton_it_nhat ='_hidden'; // HH
                classItem_tmp.dinh_muc_ton_nhieu_nhat ='_hidden'; // HH (999999999)
                classItem_tmp.mo_ta =''; // HH, dich vu, gói, thẻ
                classItem_tmp.ghi_chu =''; // dich vu, gói,thẻ
                classItem_tmp.nguyen_lieu_tieu_hao ='_hidden'; // dich vu

                classItem_tmp.lich_trinh_sd =''; // góig tg
                classItem_tmp.lich_trinh_sd__khoang_cach_moi_buoi ='_hidden'; // gói

                classItem_tmp.han_su_dung = ''; // gói, thẻ: Vô hạn, ngày cụ thể, khoản
                classItem_tmp.hsd_ngay_cu_the ='_hidden'; //
                classItem_tmp.hsd_khoang_thoi_gian ='_hidden';

                classItem_tmp.product_apply =''; // gói
                classItem_tmp.loai_hang_hoa ='_hidden'; // thẻ - chọn nhiều
                classItem_tmp.hang_hoa_ap_dung ='_hidden'; // thẻ - chọn nhiều
                classItem_tmp.other ='_hidden'; // other - thẻ, gói
        
                classItem_tmp.dichVu_sp ='Dịch vụ trong gói';
                classItem_tmp.dichVu_sp_titleInput ='Chọn dịch vụ';
                classItem_tmp.dichVu_sp_titlePrice ='Giá bán lẻ';

                //
                classItem_tmp.title_code = 'Mã gói';
                classItem_tmp.title_name = 'Tên gói';
                break;
            case 4:
                classItem_tmp.title_col01 = 'Thẻ khách hàng';
                classItem_tmp.thoi_luong ='_hidden'; // dich vu
                classItem_tmp.ton_kho ='_hidden'; // HH
                classItem_tmp.product_group_id ='_hidden'; // HH, dich vu, gói
                classItem_tmp.product_group_ids_apply =''; //  thẻ(chọn nhiều)
                classItem_tmp.thuong_hieu_id =''; // HH, dich vu, gói, thẻ
                classItem_tmp.vi_tri_id ='_hidden'; // HH
                classItem_tmp.gia_von =''; // HH
                classItem_tmp.gia_ban =''; // HH, dich vu, gói, thẻ
                classItem_tmp.menh_gia ='_hidden'; // thẻ
                classItem_tmp.trong_luong =''; // HH
                classItem_tmp.hoa_hong_nv ='_hidden'; // HH, dich vu
                classItem_tmp.hoa_hong_nv_ban_hang =''; // HH, dich vu
                classItem_tmp.hoa_hong_nv_thuc_hien ='_hidden'; // HH, dich vu
                classItem_tmp.ban_truc_tiep ='_hidden'; // HH, dich vu
                classItem_tmp.thuoc_tinh ='_hidden'; // HH, dich vu
                classItem_tmp.don_vi_tinh =''; // HH, dich vu
                // detail
                classItem_tmp.dinh_muc_ton_it_nhat ='_hidden'; // HH
                classItem_tmp.dinh_muc_ton_nhieu_nhat ='_hidden'; // HH (999999999)
                classItem_tmp.mo_ta =''; // HH, dich vu, gói, thẻ
                classItem_tmp.ghi_chu =''; // dich vu, gói,thẻ
                classItem_tmp.nguyen_lieu_tieu_hao ='_hidden'; // dich vu
                classItem_tmp.lich_trinh_sd ='_hidden'; // gói
                classItem_tmp.lich_trinh_sd__khoang_cach_moi_buoi ='_hidden'; // gói

                classItem_tmp.han_su_dung = ''; // gói, thẻ: Vô hạn, ngày cụ thể, khoảng tg
                classItem_tmp.hsd_ngay_cu_the ='_hidden'; //
                classItem_tmp.hsd_khoang_thoi_gian ='_hidden';

                classItem_tmp.product_apply ='_hidden'; // gói
                classItem_tmp.loai_hang_hoa =''; // thẻ - chọn nhiều
                classItem_tmp.hang_hoa_ap_dung ='_hidden'; // thẻ - chọn nhiều

                classItem_tmp.other =''; // other - thẻ, gói
        
                classItem_tmp.dichVu_sp ='';
                classItem_tmp.dichVu_sp_titleInput ='';

                //
                classItem_tmp.title_code = 'Mã thẻ';
                classItem_tmp.title_name = 'Tên thẻ';
                break;
        
            default:
                break;
        }
        return classItem_tmp;
    }



    const changeHSD = (val) => {
        let classItem_tmp = cloneDeep(classItem);
        // ngày cụ thể
        classItem_tmp.hsd_ngay_cu_the ='_hidden';
        classItem_tmp.hsd_khoang_thoi_gian ='_hidden';
        if(val === 2) {
            classItem_tmp.hsd_ngay_cu_the ='';
            classItem_tmp.hsd_khoang_thoi_gian ='_hidden';
        }

        // khoảng thời gian
        if(val === 3) {
            classItem_tmp.hsd_ngay_cu_the ='_hidden';
            classItem_tmp.hsd_khoang_thoi_gian ='';
        }

        setClassItem(classItem_tmp);
        
    }

    function checkShowHideDinhMuc() {
        let check = '';
        if(showHideDinhMuc === '') {
            check = '_hidden';
        }
        setShowHideDinhMuc(check);
    }

    function checkShowHideMoTa() {
        let check = '';
        if(showHideMoTa === '') {
            check = '_hidden';
        }
        setShowHideMoTa(check);
    }

    function initialValuesForm() {
        let result = props.product;

        // thêm mới
        if(props.pid === 0) {
            result = {};
            result.dinh_muc_ton_it_nhat = 1;
            result.dinh_muc_ton_nhieu_nhat = 999999999;
            result.is_ck_nv_tu_van_percen = true;
            result.is_ck_nv_cham_soc_percen = true;
            console.log(result);
            
            return result;
        }
        // edit
        if(props.product.hsd_ngay_cu_the) {
            result.hsd_ngay_cu_the = dayjs(props.product.hsd_ngay_cu_the, 'YYYY-MM-DD');
        }
        

        if(props.dvTrongGoi) {
            props.dvTrongGoi.forEach((goi) => {
                result[goi.name] = goi.soLan;
            });
        }

        result.product_apply = props.product.product_apply;
        

        return result;
    }

    return (
        <div>
            <AdminLayout
                auth={props.auth}
                header={'Hóa Đơn'}
                tables={props.tables}
                current={props.table}
                content={
                    <div>
                        <Form
                            name="san_pham"
                            form={formProduct}
                            // layout="vertical"
                            onFinish={onFinish}
                            // onFinishFailed={onFinishFailedChamCong}
                            autoComplete="off"
                            initialValues={initialValuesForm()}
                        >
                            <Row>
                                <Col sm={24}>
                                    {/* <Form.Item name='type' label=''> */}
                                        <Radio.Group
                                            block
                                            onChange={changeType}
                                            options={[
                                                { label: 'Hàng hóa', value: 1, disabled:type===1 || props.pid===0?false:true },
                                                { label: 'Dịch vụ', value: 2, disabled:type===2 || props.pid===0?false:true },
                                                { label: 'Gói dịch vụ, liệu trình', value: 3, disabled:type===3 || props.pid===0?false:true },
                                                { label: 'Thẻ khách hàng', value: 4 , disabled:type===4 || props.pid===0?false:true },
                                            ]}
                                            value={type}
                                            optionType="button"
                                            buttonStyle="solid"
                                        />
                                    {/* </Form.Item> */}
                                </Col>
                            </Row>

                            <Row>

                                {/* Thông tin SP */}
                                <Col sm={{ span: 8 }} className="main-item-form">
                                    <div className="sub-main-item-form">
                                        <Divider orientation="left"><Space>{classItem.title_col01}</Space></Divider>
                                        
                                        {/* Mã hàng hóa */}
                                        <Form.Item className={'item-form ' + classItem.code } name='code' 
                                            label={<div>{classItem.title_code} {showInfo('Mã sẽ tự động được tạo ra nếu bạn bỏ trống.')}</div>}>
                                            <Input placeholder="Mã tự động" />
                                        </Form.Item>

                                        {/* Tên hàng hóa */}
                                        <Form.Item className={'item-form ' + classItem.name } name='name' label={classItem.title_name} rules={[{ required: true,message: 'Tên hàng hóa không dc bỏ trống',}]}>
                                            <Input />
                                        </Form.Item>

                                        {/* Trọng lượng */}
                                        <Form.Item className={'item-form ' + classItem.trong_luong } name='trong_luong' 
                                            label={<div>Trọng lượng {showInfo('Trọng lượng của hàng hóa.')}</div>}>
                                            <InputNumber min={0} />
                                        </Form.Item>

                                        {/* Nhóm hàng */}
                                        <Form.Item className={'item-form ' + classItem.product_group_id } 
                                            name='product_group_id' 
                                            label={<div>Nhóm hàng <a target="new" href={route('data.tblName', ['product_group'])}><BarsOutlined /></a></div>}>
                                            <Select
                                                mode={classItem.mode_nhom_hang}
                                                style={{ width: 80 }}
                                                placeholder="Chọn"
                                                optionFilterProp="children"
                                                options={productGroup.map((u) => {
                                                    return {
                                                            value: u.id,
                                                            label: u.name,
                                                        }
                                                    })
                                                }
                                            />
                                        </Form.Item>

                                        {/* Thương hiệu */}
                                        <Form.Item className={'item-form ' + classItem.thuong_hieu_id } name='thuong_hieu_id' 
                                            label={<div>Thương hiệu <a target="new" href={route('data.tblName', ['thuong_hieu'])}><BarsOutlined /></a></div>}>
                                            <Select
                                                style={{ width: 80 }}
                                                placeholder="Chọn"
                                                optionFilterProp="children"
                                                options={thuongHieu.map((u) => {
                                                    return {
                                                            value: u.id,
                                                            label: u.name,
                                                        }
                                                    })
                                                }
                                            />
                                        </Form.Item>
                                    </div>
                                </Col>
                                
                                {/* Giá bán */}
                                <Col sm={{ span: 8 }} className="main-item-form">
                                    <div className="sub-main-item-form">
                                        <Divider orientation="left"><Space>Thông tin chi tiết</Space></Divider>
                                        
                                        {/* Thời lượng */}
                                        <Form.Item className={'item-form ' + classItem.thoi_luong } name='thoi_luong' label='Thời lượng'  rules={[{ required: false,message: 'Giá vốn không dc bỏ trống',}]}>
                                            <InputNumber min={0} suffix="Phút" />
                                        </Form.Item>

                                        {/* Giá vốn */}
                                        <Form.Item className={'item-form ' + classItem.gia_von } name='gia_von' label='Giá vốn'  rules={[{ required: false,message: 'Giá vốn không dc bỏ trống',}]}>
                                            <InputNumber min={0} onBlur={() => { updateSubProduct(); }}
                                                formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')} 
                                                parser={(value) => value.replace(/\$\s?|(,*)/g, '')}  
                                            />
                                        </Form.Item>

                                        {/* Giá bán */}
                                        <Form.Item className={'item-form ' + classItem.gia_ban } name='gia_ban' label='Giá bán' rules={[{ required: true,message: 'Giá bán không dc bỏ trống',}]}>
                                            <InputNumber min={0}  
                                                onBlur={() => { updateSubProduct(); }} 
                                                formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')} 
                                                parser={(value) => value.replace(/\$\s?|(,*)/g, '')}  
                                            />
                                        </Form.Item>

                                        {/* Tồn kho */}
                                        <Form.Item className={'item-form ' + classItem.ton_kho } name='ton_kho' label='Tồn kho'>
                                            <InputNumber readOnly={true} min={0}  onBlur={() => { updateSubProduct(); }} />
                                        </Form.Item>
                                        
                                        {/* Lịch trình sử dụng */}
                                        <Form.Item className={'item-form ' + classItem.lich_trinh_sd } name='lich_trinh_sd' label='Lịch trình SD'  rules={[{ required: false,message: 'Giá vốn không dc bỏ trống',}]}>
                                            <Select onChange={changeLichSuDung}
                                                placeholder="Chọn hạn sử dụng"
                                                optionFilterProp="children"
                                                options={[
                                                    {value:1, label:'Tự do', donvi:''},
                                                    {value:2, label:'Theo ngày', donvi:'Ngày'},
                                                    {value:3, label:'Theo tuần', donvi:'Tuần'},
                                                    {value:4, label:'Theo tháng', donvi:'Tháng'},
                                                ]}
                                            />
                                        </Form.Item>

                                        {/* Mỗi buổi cách nhau */}
                                        <Form.Item className={'item-form ' + classItem.lich_trinh_sd__khoang_cach_moi_buoi } name='lich_trinh_sd__khoang_cach_moi_buoi' label='Mỗi buổi cách nhau'  rules={[{ required: false,message: 'Giá vốn không dc bỏ trống',}]}>
                                            <InputNumber min={1} suffix={'(' + lichSuDung.donvi + ')'} />
                                        </Form.Item>

                                        {/* Hạn sử dụng - chọn date */}
                                        <Form.Item className={'item-form ' + classItem.han_su_dung } name='han_su_dung' label='Hạn sử dụng' rules={[{ required: false,message: 'Hạn sử dụng không dc bỏ trống',}]}>
                                            <Select onChange={changeHSD}
                                                placeholder="Chọn hạn sử dụng"
                                                optionFilterProp="children"
                                                options={[
                                                    {label:'Vô hạn', value:1},
                                                    {label:'Ngày cụ thể', value:2},
                                                    {label:'Khoảng thời gian', value:3},
                                                ]}
                                            />
                                        </Form.Item>

                                        {/* Hạn sử dụng - ngay cụ thể */}
                                        <Form.Item className={'item-form ' + classItem.hsd_ngay_cu_the } name='hsd_ngay_cu_the' label='' rules={[{ required: false,message: 'Hạn sử dụng không dc bỏ trống',}]}>
                                            <DatePicker format={DATE_FORMAT_SHOW} />
                                        </Form.Item>

                                        {/* Hạn sử dụng - khoảng thời gian */}
                                        <Form.Item className={'item-form ' + classItem.hsd_khoang_thoi_gian } name='hsd_khoang_thoi_gian' label='' rules={[{ required: false,message: 'Hạn sử dụng không dc bỏ trống',}]}>
                                            <InputNumber placeholder={'Nhập số ' + donViHSD} addonAfter={<Select defaultValue={donViHSD} onChange={changeDonViHSD}>
                                                                        <Option value="Ngày">Ngày</Option>
                                                                        <Option value="Tuần">Tuần</Option>
                                                                        <Option value="Tháng">Tháng</Option>
                                                                        <Option value="Năm">Năm</Option>
                                                                    </Select>}  
                                            />
                                        </Form.Item>



                                        {/* Vị trí */}
                                        <Form.Item className={'item-form ' + classItem.vi_tri_id } name='vi_tri_id' 
                                            label={<div>Vị trí <a target="new" href={route('data.tblName', ['product_vi_tri'])}><BarsOutlined /></a></div>}>
                                            <Select
                                                style={{ width: 80 }}
                                                placeholder="Chọn"
                                                optionFilterProp="children"
                                                options={viTri.map((u) => {
                                                    return {
                                                            value: u.id,
                                                            label: u.name,
                                                        }
                                                    })
                                                }
                                                
                                            />
                                        </Form.Item>

                                        {/* Bán trực tiếp */}
                                        <Form.Item className={'item-form ' + classItem.ban_truc_tiep } name='ban_truc_tiep' 
                                            label={<div>Bán trực tiếp {showInfo('Cho phép bán lẻ')}</div>}>
                                            <Switch checkedChildren="Có" unCheckedChildren="Không" defaultChecked={false} />
                                        </Form.Item>
                                    </div>
                                </Col>

                                {/* Chiết khấu */}
                                <Col sm={{ span: 8 }} className={'main-item-form ' + classItem.hoa_hong_nv}>
                                    <div className="sub-main-item-form">

                                        <Divider orientation="left"><Space>Chiết khấu mặc định</Space></Divider>

                                        <table>
                                            <tbody>
                                            {/* NV Tư vấn */}
                                            <tr className={classItem.hoa_hong_nv_ban_hang }>
                                                <td><b>Hoa hồng bán hàng{showInfo('Hoa hồng mặc định cho nhân viên bán hàng')}</b></td>
                                                <td>
                                                    <Form.Item className="item-form" name='ck_nv_tu_van' label=''>
                                                        <InputNumber min={0} />
                                                    </Form.Item>
                                                </td>
                                                <td>
                                                    <Form.Item className="item-form" name='is_ck_nv_tu_van_percen' label=''>
                                                        <Switch checkedChildren="%" unCheckedChildren="VNĐ"  />
                                                    </Form.Item>
                                                </td>
                                            </tr>

                                            {/* NV thực hiện chăm sóc */}
                                            <tr className={classItem.hoa_hong_nv_thuc_hien}>
                                                <td><Space><b>Hoa hồng thực hiện{showInfo('Hoa hồng mặc định cho nhân viên thực hiện chăm sóc khách hàng')}</b></Space></td>
                                                <td>
                                                    <Form.Item className="item-form" name='ck_nv_cham_soc' label=''>
                                                        <InputNumber min={0} />
                                                    </Form.Item>
                                                </td>
                                                <td>
                                                    <Form.Item className="item-form" name='is_ck_nv_cham_soc_percen' label=''>
                                                        <Switch checkedChildren="%" unCheckedChildren="VNĐ"  />
                                                    </Form.Item>
                                                </td>
                                            </tr>
                                            </tbody>
                                        </table>
                                        
                                    </div>
                                </Col>

                                <Col sm={{ span: 8 }} className={'main-item-form ' + classItem.other}>
                                    <div className="sub-main-item-form">
                                        <Divider orientation="left"><Space>Áp dụng cho</Space></Divider>

                                        {/* Loại hàng hóa */}
                                        <div className={ classItem.loai_hang_hoa }>
                                            <b> Loại hàng hóa áp dụng: </b>
                                            {showInfo('Chọn loại hàng hóa được áp dụng, nếu bỏ trống sẽ là chọn tất cả')}
                                            <Form.Item className={classItem.loai_hang_hoa } name='loai_hang_hoa'>
                                                <Select
                                                    mode="multiple"
                                                    style={{ width: 80 }}
                                                    placeholder="Chọn"
                                                    optionFilterProp="children"
                                                    options={[
                                                        { label: 'Hàng hóa', value: 1 },
                                                        { label: 'Dịch vụ', value: 2 },
                                                        { label: 'Gói dịch vụ, liệu trình', value: 3 }
                                                    ]}
                                                />
                                            </Form.Item>
                                        </div>

                                        {/* Hàng hóa áp dụng */}
                                        <div className={classItem.product_group_ids_apply}>
                                            <b>Hàng hóa áp dụng </b>
                                            {showInfo('Chọn hàng hóa được áp dụng, nếu bỏ trống sẽ là chọn tất cả')}
                                            <Form.Item className={'item-form '} name='hang_hoa_ap_dung' label=''>
                                                <Select
                                                    mode="multiple"
                                                    placeholder="Chọn"
                                                    optionFilterProp="children"
                                                    options={props.products.map((u) => {
                                                        return {
                                                                value: u.id,
                                                                label: '(' + u.code + ') ' + u.name,
                                                                data: u,
                                                            }
                                                        })
                                                    }
                                                    
                                                />
                                            </Form.Item>
                                        </div>

                                        <div>
                                            <table>
                                                <tbody>
                                                    {/* NV Tư vấn */}
                                                    <tr className={classItem.hoa_hong_nv_ban_hang }>
                                                        <td className="title-hoahong"><b>Hoa hồng bán hàng{showInfo('Hoa hồng mặc định cho nhân viên bán hàng')}</b></td>
                                                        <td>
                                                            <Form.Item className="item-form" name='ck_nv_tu_van' label=''>
                                                                <InputNumber min={0} />
                                                            </Form.Item>
                                                        </td>
                                                        <td>
                                                            <Form.Item className="item-form" name='is_ck_nv_tu_van_percen' label=''>
                                                                <Switch checkedChildren="%" unCheckedChildren="VNĐ"  />
                                                            </Form.Item>
                                                        </td>
                                                    </tr>
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                </Col>

                                {/* Dịch vụ trong gói */}
                                <Col sm={{ span: 24 }} className={'main-item-form ' + classItem.product_apply }>
                                    <div className="sub-main-item-form-image">
                                        <Divider orientation="left"><Space>{classItem.dichVu_sp}</Space></Divider>
                                        
                                        <Form.Item className="item-form" name='product_apply' label={classItem.dichVu_sp_titleInput}>
                                            <Select
                                                mode="multiple"
                                                placeholder="Chọn"
                                                onChange={changeDVTrongGoi}
                                                optionFilterProp="children"
                                                options={props.products.map((u) => {
                                                    return {
                                                            value: u.id,
                                                            label: u.code + ' - ' + u.name,
                                                            data: u,
                                                        }
                                                    })
                                                }
                                                
                                            />
                                        </Form.Item>

                                        <table className="table-normal-02">
                                            <thead>
                                                <tr className="th-dv">
                                                    <th><b>Mã/Tên dịch vụ </b></th>
                                                    <th><b>Số lượng</b></th>
                                                    <th><b>{classItem.dichVu_sp_titlePrice}</b></th>
                                                    <th><b>Thành tiền</b></th>
                                                </tr>
                                            </thead>

                                            <tbody>
                                                {showDVTrongGoi(subProducts)}
                                            </tbody>

                                        </table> 
                                    </div>
                                </Col>

                                {/* Định mức tồn */}
                                <Col sm={{ span: 24 }} className={'main-item-form-02 ' + classItem.dinh_muc_ton_it_nhat}>
                                    <div className="sub-main-item-form-02">
                                        <Divider orientation="left" onClick={() => checkShowHideDinhMuc()} className="title01">
                                            <Space>Định mức tồn {showInfo('Khoảng giới hạn cho số lượng sản phẩm tồn. Định mức mặc định sẽ là từ 01 đến 999.999.999. Click để ẩn/hiện form nhập liệu')}</Space>
                                        </Divider>
                                        <Row className={showHideDinhMuc}>
                                            <Col sm={{ span: 12 }} className="main-item-form">
                                                <Form.Item className="item-form" name='dinh_muc_ton_it_nhat' label='Ít nhất'>
                                                    <InputNumber min={1} max={999999999} />
                                                </Form.Item>
                                            </Col>
                                            

                                            <Col sm={{ span: 12 }} className="main-item-form">
                                                <Form.Item className="item-form" name='dinh_muc_ton_nhieu_nhat' label='Nhiều nhất'>
                                                    <InputNumber min={1} max={999999999} />
                                                </Form.Item>
                                            </Col>
                                        </Row>
                                    </div>
                                </Col>

                                {/* Mô tả chi tiết*/}
                                <Col sm={{ span: 24 }} className="main-item-form-02">
                                    <Divider orientation="left" onClick={() => checkShowHideMoTa()} className="title01">
                                        <Space>Mô tả chi tiết {showInfo('Mô tả hoặc ghi chú chi tiết hơn về hàng hóa này. Click để ẩn/hiện form nhập liệu')}</Space>
                                    </Divider>
                                    <Row className={showHideMoTa}>
                                        <Col sm={{ span: 12 }} className={'main-item-form '}>
                                            <b>Mô tả</b>
                                            <Form.Item className={'item-form '} name='mo_ta' label=''>
                                                <Input.TextArea />
                                            </Form.Item>
                                        </Col>

                                        <Col sm={{ span: 12 }} className={'main-item-form '}>
                                            <b>Ghi chú</b>
                                            <Form.Item className={'item-form '} name='ghi_chu' label=''>
                                                <Input.TextArea />
                                            </Form.Item>
                                        </Col>
                                    </Row>
                                </Col>

                                {/* Hình ảnh */}
                                <Col sm={{ span: 24 }} className="main-item-form">
                                    <div className="sub-main-item-form-image">
                                        <Divider orientation="left"><Space>Hình ảnh {showInfo('Hình ảnh minh họa, có thể upload được nhiều hình ảnh. Click để ẩn/hiện form nhập liệu')}</Space></Divider>
                                        
                                        <DndContext sensors={[sensor]} onDragEnd={onDragEnd}>
                                            <SortableContext strategy={verticalListSortingStrategy}
                                            items={[]}
                                                // items={fileList.map((i) => i.uid)} 
                                            >
                                                <ImgCrop
                                                    aspect={1} // tỷ lệ crop
                                                    aspectSlider={true}
                                                    rotationSlider={true}
                                                    showGrid={true}
                                                    showReset={true}
                                                >
                                                <Upload multiple
                                                    action={route("data.upload_image")}
                                                    listType="picture-card" // picture-card
                                                    fileList={fileList}
                                                    maxCount={10}
                                                    onChange={onChangeImage}
                                                    itemRender={(originNode, file) => (
                                                        <DraggableUploadListItem originNode={originNode} file={file} />
                                                    )}
                                                >
                                                    <Button icon={<UploadOutlined />}>Upload</Button>
                                                </Upload>
                                                </ImgCrop>
                                            </SortableContext>
                                        </DndContext>
                                    </div>
                                </Col>

                                {/* thuộc tính */}
                                <Col sm={{ span: 24 }} className="main-item-form-02">
                                    <Row className={classItem.thuoc_tinh }>
                                        <Col sm={{ span: 8 }} className="main-item-form">
                                            <div className="sub-main-item-form-image">
                                                
                                                <Divider orientation="left">
                                                    <Space>
                                                        Thuộc tính | 
                                                        <a target="new" href={route('data.tblName', ['product_thuoc_tinh'])}><BarsOutlined /></a> | 
                                                        {showInfo('Có thể được chọn nhiều thuộc tính khách nhau. Hệ thống sẽ tự động sinh ra các hàng hóa hoặc dịch vụ tương ứng với mỗi thuộc tính được tạo')}
                                                    </Space>
                                                </Divider>
                                                
                                                {/* chọn Thuộc tính */}
                                                <Form.Item className="item-form" name={'thuoc_tinh'} label=''>
                                                    <Select
                                                        mode="multiple"
                                                        placeholder="Chọn thuộc tính"
                                                        style={{ width: '100%' }}
                                                        onChange={handleChangeThuocTinh}
                                                        tokenSeparators={[',']}
                                                        options={ thuocTinh.map((u) => {
                                                            return {
                                                                    value: u.id,
                                                                    label: u.name,
                                                                    // data: u,
                                                                }
                                                        })}
                                                    />
                                                </Form.Item>

                                                <br/><br/>
                                                
                                                {showThuocTinh()}
                                                
                                            </div>

                                            <div className={'sub-main-item-form-image ' + classItem.don_vi_tinh }>
                                                <Divider orientation="left"><Space>Đơn vị tính {showInfo('Đơn vị của sản phẩm')}</Space></Divider>
                                                <Select
                                                    // mode="tags"
                                                    style={{ width: '100%' }}
                                                    onChange={handleChangeDonVi}
                                                    tokenSeparators={[',']}
                                                    options={[]}
                                                />
                                            </div>
                                        </Col>

                                        {/* Đệ quy sp */}
                                        <Col sm={{ span: 16 }} className={'main-item-form ' + classItem.nhom_hang }>
                                            <div className="sub-main-item-form-image">
                                                <Divider orientation="left"><Space>Danh sách hàng hóa cùng loại</Space></Divider>
                                                
                                                {/* result thuộc tính */}
                                                <table className="table-normal-02">
                                                    <thead>
                                                        <tr className="th-dv">
                                                            <th><b>Tên</b></th>
                                                            <th><b>Mã hàng</b></th>
                                                            <th><b>Giá vốn</b></th>
                                                            <th><b>Giá bán</b></th>
                                                            <th><b>Tồn kho</b></th>
                                                        </tr>
                                                    </thead>

                                                    <tbody>
                                                        {showSubProduct(subProducts)}
                                                    </tbody>

                                                </table>    
                                            </div>
                                        </Col>
                                    </Row>
                                </Col>
                                
                            </Row>

                            <div className="btn-submit-form-pro">
                                <Space>
                                    <Button className="btn-success" onClick={() => {saveProduct()}}> 
                                        <CheckOutlined />
                                        
                                        {props.pid === 0 ? 'THÊM MỚI' : 'CẬP NHẬT'}
                                    </Button> 

                                    <Button 
                                        onClick={() => {saveAndContinue()}}
                                    > 
                                        <CheckOutlined />
                                        LƯU VÀ THÊM MỚI
                                    </Button>  

                                    <Link href={route('product.list')}><Button> <CloseOutlined /> HỦY </Button>   </Link>

                                </Space>     
                            </div>

                        </Form>
                    </div>
                }
            />
        </div>
    );
}
