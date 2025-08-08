<?php

namespace App\Models\Admin;

use App\Casts\Json;
use App\Services\Admin\TblService;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;

class Product extends Model
{
    // save product -> check ton_kho để update lại tên sp nếu đổi tên
    protected $table = 'product';

    protected $casts = [
        'images' => Json::class,
        'product_apply' => Json::class, // product_dich_vu_apply // gói: chọn các dv dc dùng trong gói
        'product_group_ids_apply' => Json::class,
        'product_type_ids_apply' => Json::class,
        'loai_hang_hoa' => Json::class, // thẻ - chọn nhiều loại hàng hóa dc dùng trong thẻ
        'hang_hoa_ap_dung' => Json::class, // thẻ - chọn nhiều các sp dc dùng trong thẻ
        'ton_kho_detail' => Json::class, // thẻ - chọn nhiều các sp dc dùng trong thẻ
        'don_vi_quy_doi_data' => Json::class, // 
        'don_vi_ids' => Json::class // 

    ];

    static function getProduct($id)
    {
        $product = self::find($id);
        return $product;
    }

    static function baseQuery()
    {
        $products = self::select(
            'product.id as key',
            'product.name as name',
            'product.*',
            'product_group.name as product_group_name',
            'thuong_hieu.name as thuong_hieu_name',
            'product_type.name as product_type_name',
            'product_vi_tri.name as vi_tri_name',
        )
            ->leftJoin('thuong_hieu', 'product.thuong_hieu_id', 'thuong_hieu.id')
            ->leftJoin('product_group', 'product.product_group_id', 'product_group.id')
            ->leftJoin('product_type', 'product.product_type_id', 'product_type.id')
            ->leftJoin('product_vi_tri', 'product.vi_tri_id', 'product_vi_tri.id')
            ->where('product.is_parent', 0);
        return $products;
    }

    static function searchProduct($request)
    {
        $products = self::baseQuery();

        if (!empty($request->keyword)) {
            $products = $products->where('product.name', 'like', '%' . $request->keyword . '%');
        }
        if (!empty($request->product_type_id)) {
            $products = $products->whereIn('product.product_type_id', $request->product_type_id);
        }
        if (!empty($request->product_group_id)) {
            $products = $products->whereIn('product.product_group_id', $request->product_group_id);
        }
        if (!empty($request->thuong_hieu_id)) {
            $products = $products->whereIn('product.thuong_hieu_id', $request->thuong_hieu_id);
        }
        if (!empty($request->vi_tri_id)) {
            $products = $products->whereIn('product.vi_tri_id', $request->vi_tri_id);
        }

        if (!empty($request->ngung_kinh_doanh)) {
            if ($request->ngung_kinh_doanh == 2) {
                $products = $products->where('product.is_draft', 1);
            } else {
                $products = $products->where('product.ngung_kinh_doanh', $request->ngung_kinh_doanh);
                $products = $products->where('product.is_draft', '!=', 1);
            }
        } else {
            $products = $products->where('product.ngung_kinh_doanh', '!=', 1);
            $products = $products->where('product.is_draft', '!=', 1);
        }

        $products = $products->orderBy('id', 'desc');
        $products = $products->paginate(500);
        return $products;
    }

    static function savePro($rq)
    {
        $type = $rq->type;
        if (in_array($type, [1, 2]) && isset($rq->subProduct_name_0)) {
            // tạo thư mục sp cha
            $productParent = new Product();
            $productParent = self::setDataProduct($productParent, $rq);
            $productParent->is_parent = 1;
            $productParent->save();
            // tạo sp con
            $products = [];

            // thuoc_tinh
            for ($i = 0; $i < 50; $i++) {
                $name = 'subProduct_name_' . $i;
                if (!isset($rq->{$name})) {
                    break;
                }
                $giaban = 'subProduct_giaban_' . $i;
                $giavon = 'subProduct_giavon_' . $i;
                $tonkho = 'subProduct_tonkho_' . $i;

                $product = new Product();

                $product = self::setDataProduct($product, $rq);

                // set name
                $product->name = $rq->name . ' - ' . $rq->{$name};

                // set parent
                $product->parent_id = $productParent->id;


                // set giá bán
                if (isset($product->{$giaban})) {
                    $product->gia_ban = $rq->{$giaban};
                }

                // set giá vốn
                if (isset($product->{$giavon})) {
                    $product->gia_von = $rq->{$giavon};
                }

                // set tồn kho
                if (isset($product->{$tonkho})) {
                    $product->ton_kho = $rq->{$tonkho};
                }
                // save
                $product->save();
                // update code
                $product = self::updateCode($product, $type);

                // images
                $product = self::uploadProductImages($rq, $product);

                // nguyen_lieu_tieu_hao
                $product = self::saveNguyenLieuTieuHao($rq, $product);

                // add 2 list save
                $products[] = $product;
            }
            return $products;
        }

        if (empty($rq->pid)) {
            $product = new Product();
        } else {
            $product = Product::find($rq->pid);
        }
        $product = self::setDataProduct($product, $rq);

        if ($rq->type == 3) { // gói dv
            // lich_trinh_sd
            $product->lich_trinh_sd = isset($rq->lich_trinh_sd) ? $rq->lich_trinh_sd : 0;

            $product->so_luong = !empty($rq->so_luong) ? $rq->so_luong : 1;

            // khoang_cach_moi_buoi
            $product->lich_trinh_sd__khoang_cach_moi_buoi = 0;
            if ($rq->lich_trinh_sd > 1) { // gói dv
                $product->lich_trinh_sd__khoang_cach_moi_buoi = $rq->lich_trinh_sd__khoang_cach_moi_buoi;
            }

            // nguyen_lieu_tieu_hao
            $product = self::saveNguyenLieuTieuHao($rq, $product);
        }

        if ($rq->type == 2) {
            $product = self::saveNguyenLieuTieuHao($rq, $product);
        }

        if ($rq->type == 4) {
            // loai_hang_hoa
            $product->loai_hang_hoa = [1, 2, 3];
            if (!empty($rq->loai_hang_hoa)) {
                $product->loai_hang_hoa = $rq->loai_hang_hoa;
            }


            // hang_hoa_ap_dung
            $product->hang_hoa_ap_dung = $rq->hang_hoa_ap_dung;
        }

        if ($rq->type == 4 || $rq->type == 3) {
            // han_su_dung
            try {
                $product->han_su_dung = intval($rq->han_su_dung);
            } catch (\Throwable $th) {
                // dd($product);
            }
            $product->han_su_dung = intval($rq->han_su_dung);
            // han_su_dung  - ngày cụ thể
            if ($rq->han_su_dung == 2) {
                $product->hsd_ngay_cu_the = $rq->hsd_ngay_cu_the;
            }
            // han_su_dung - khoảng thời gian
            $product->hsd_khoang_thoi_gian = 0;
            $product->hsd_khoang_thoi_gian_don_vi = 0;
            if ($rq->han_su_dung == 3) {
                $product->hsd_khoang_thoi_gian = $rq->hsd_khoang_thoi_gian;
                $product->hsd_khoang_thoi_gian_don_vi = $rq->donViHSD;
            }
        }
        // don_vi_tinh

        // hoa_hong_nv
        if (in_array($rq->type, [1, 2])) {
            $product->ck_nv_tu_van = isset($rq->ck_nv_tu_van) ? $rq->ck_nv_tu_van : 0;
            $product->ck_nv_cham_soc = isset($rq->ck_nv_cham_soc) ? $rq->ck_nv_cham_soc : 0;
            $product->is_ck_nv_tu_van_percen = isset($rq->is_ck_nv_tu_van_percen) ? $rq->is_ck_nv_tu_van_percen : 0;
            $product->is_ck_nv_cham_soc_percen = isset($rq->is_ck_nv_cham_soc_percen) ? $rq->is_ck_nv_cham_soc_percen : 0;
        }

        // other

        //product_group_ids_apply

        // product_type_ids_apply

        // save
        $product->save();

        // save tồn kho theo kho hàng
        if (isset($rq->ton_kho) && $rq->ton_kho > 0 && !empty($rq->ton_kho_detail)) {
            // xóa tồn kho cũ
            DB::table('kho_hang_data')->where('product_id', $product->id)->delete();

            // add new
            $now = date('Y-m-d h:i:s');
            $dataTonKho = [];
            foreach ($rq->ton_kho_detail as $tk) {
                $dataTonKho[] = [
                    'kho_hang_id' => $tk['kho_hang_id'],
                    'product_id' => $product->id,
                    'ton_kho' => $tk['ton_kho'],
                    'created_at' => $now,
                    'updated_at' => $now,
                ];
            }
            // dd($dataTonKho);
            if (!empty($dataTonKho)) {
                TblService::insertData('kho_hang_data', $dataTonKho, true);
            }
        }

        // images
        $product = self::uploadProductImages($rq, $product);

        // update code
        $product = self::updateCode($product, $type);

        // Dịch vụ trong gói    
        $product = self::saveDVTrongGoi($rq, $product);

        // nếu ko có nhiều đơn vị quy đổi thì return luôn
        if ($rq->type != 1) {
            return $product;
        }
        if (empty($rq->donViQuyDoi['don_vi_quy_doi_id'])) {
            return $product;
        }

        // save don_vi_quy_doi_data 2 product
        $donViQuyDoi = $rq->donViQuyDoi;
        $dataQuyDoi = [];

        // Xóa các đơn vị mà không có trong danh sách mới
        $donVi03 = DonViQuyDoi::where('product_id', $product->id)->get();
        foreach ($donVi03 as $dv) {
            if (!in_array($dv->don_vi_id, $rq->donViSelectedID)) {
                $dv->delete();
            }
        }
        // don_vi_ids là danh sách tất cả các id đơn vị, 
        $don_vi_ids = [$rq->don_vi_id];
        foreach ($donViQuyDoi as $dv) {
            if (empty($dv['ty_le_quy_doi']) || empty($dv['don_vi_quy_doi_id'])) {
                continue;
            }
            // get tất cả đơn vị quy đổi tương ứng với sản phẩm
            $donVi = DonViQuyDoi::where('product_id', $product->id)->where('don_vi_id', $dv['don_vi_quy_doi_id'])->first();
            if (empty($donVi)) {
                // thêm mới nếu đơn vị này chưa có trong danh sách
                $donVi = new DonViQuyDoi();
            }
            // tỷ lệ quy đổi
            $giaTriQuyDoi_theoDVChinh = 1 / $dv['ty_le_quy_doi'];

            // giá quy đổi
            $gia_nhap_quy_doi = $product->gia_von * $giaTriQuyDoi_theoDVChinh;
            $gia_ban_quy_doi = $product->gia_ban * $giaTriQuyDoi_theoDVChinh;

            $donViInfo = DB::table('don_vi')->find($dv['don_vi_quy_doi_id']);
            $donVi->product_id = $product->id;
            $donVi->don_vi_id = $dv['don_vi_quy_doi_id'];
            $donVi->ten_don_vi = $donViInfo->name;
            $donVi->ty_le_quy_doi_theoDVQuyDoi = $dv['ty_le_quy_doi'];
            $donVi->ty_le_quy_doi_theoDVChinh = $giaTriQuyDoi_theoDVChinh;
            $donVi->gia_nhap_quy_doi = $gia_nhap_quy_doi;
            $donVi->gia_ban_quy_doi = $gia_ban_quy_doi;
            $donVi->save();

            $dataQuyDoi[] = $donVi->toArray();
            $don_vi_ids[] = $dv['don_vi_quy_doi_id'];
        }

        // thêm đơn vị chính vào danh sách
        $donViChinhInfo = DB::table('don_vi')->find($product->don_vi_id);
        $dataQuyDoi[] = [
            'product_id' => $product->id,
            'don_vi_id' => $product->don_vi_id,
            'ten_don_vi' => $donViChinhInfo->name,
            'ty_le_quy_doi_theoDVChinh' => 1, // do so sánh với chính nó, nên = 1
            'ty_le_quy_doi_theoDVQuyDoi' => 1, // do so sánh với chính nó, nên = 1
            'gia_nhap_quy_doi' => $product->gia_von,
            'gia_ban_quy_doi' => $product->gia_ban,
        ];

        // save dv quy doi
        $product->don_vi_quy_doi_data = $dataQuyDoi;
        $product->don_vi_ids = $don_vi_ids;
        $product->save();


        // add new đơn vị quy đổi


        return $product;
    }

    static function uploadProductImages($rq, $product)
    {
        if (empty($rq->images)) {
            return $product;
        }
        $images = [];
        $avatar = '';
        if (!file_exists('files/datas')) {
            mkdir('files/datas', 0777, true);
        }

        // multiple img
        foreach ($rq->images as $idx => $img) {
            $url = $img['url'];
            if ($img['status'] == 'OK') {
                $url = $img['url'];
            }

            if ($img['status'] == 'done') {
                Storage::move($img['url'], 'datas/products/' . $img['name']);
                $url = '/files/datas/products/' . $img['name'];
            }
            if ($idx == 0) {
                $avatar = $url;
            }
            $images[] = $url;
        }

        $imagesInsert = '';
        if (!empty($images)) {
            $imagesInsert = ['avatar' => $avatar, 'images' => $images];
        }
        $product->images = $imagesInsert;
        $product->save();

        return $product;
    }

    static function saveNguyenLieuTieuHao($rq, $product)
    {

        if ($rq->type != 2) {
            return $product;;
        }

        // xóa nguyên liệu cũ
        if (DB::table('product_nguyen_lieu_tieu_hao')->where('product_id', $product->id)->count() > 0) {
            DB::table('product_nguyen_lieu_tieu_hao')->where('product_id', $product->id)->delete();
        }

        // Lưu nguyên liệu mới
        if (!empty($rq->product_apply)) {
            // dd($rq->product_apply);
            // save pro
            $nguyenLieuData = [];
            // $apply = 
            foreach ($rq->product_apply as $nl) {
                // dd($nl);
                $nguyenLieuData[] = [
                    'name' => $product->name,
                    'product_code' => $product->product_code,
                    'product_id' => $product->id,

                    'nguyen_lieu_id' => $nl['product_id'],
                    'so_luong' => $nl['so_luong'],
                    'don_vi_id' => $nl['don_vi_id'],
                    'gia_theo_don_vi_quy_doi' => $nl['gia_nhap_quy_doi'],
                    'gia_theo_don_vi_chinh' => $nl['gia_von'],
                ];
            }
            // dd($nguyenLieuData);
            DB::table('product_nguyen_lieu_tieu_hao')->insert($nguyenLieuData);
            $product->product_apply = $rq->product_apply;
            $product->save();
        }

        return $product;
    }

    static function saveDVTrongGoi($rq, $product)
    {
        if ($rq->type != 3) {
            return $product;
        }
        // xóa dv cũ
        DB::table('product_dich_vu_trong_goi')
            ->where('product_id', $product->id)
            ->delete();

        // Lưu nguyên liệu mới
        if (!empty($rq->product_apply)) {
            $dv = [];
            foreach ($rq->product_apply as $nl) {
                $nameSL = 'so_lan_' . $nl;
                $soLuong = 1;
                if (!empty($rq->{$nameSL})) {
                    $soLuong = intval($rq->{$nameSL});
                }

                $dv[] = [
                    'product_id' => $product->id,
                    'so_luong' => $soLuong,
                    'id_dich_vu_ap_dung' => $nl
                ];
            }
            DB::table('product_dich_vu_trong_goi')->insert($dv);
            $product->product_apply = $rq->product_apply;
            $product->save();
        }

        return $product;
    }

    static function setDataProduct($product, $rq)
    {
        $product->status_product_id = 1;
        $product->ngung_kinh_doanh = 0;
        $product->is_draft = 0;
        $product->product_type_id = $rq->type;
        $product->code = '';
        $product->lich_trinh_sd = isset($rq->lich_trinh_sd) ? $rq->lich_trinh_sd : 0;
        $product->name = $rq->name;
        $product->code = isset($rq->code) ? $rq->code : '';
        $product->product_group_id = isset($rq->product_group_id) ? $rq->product_group_id : 0;
        $product->thuong_hieu_id = isset($rq->thuong_hieu_id) ? $rq->thuong_hieu_id : 0;
        $product->vi_tri_id = isset($rq->vi_tri_id) ? $rq->vi_tri_id : 0;
        $product->status_product_id = isset($rq->status_product_id) ? $rq->status_product_id : 0;
        $product->gia_von = intval($rq->gia_von);
        $product->gia_ban = intval($rq->gia_ban);
        $product->menh_gia = intval($rq->menh_gia);
        $product->trong_luong = isset($rq->trong_luong) ? $rq->trong_luong : 0;
        $product->ban_truc_tiep = isset($rq->ban_truc_tiep) ? $rq->ban_truc_tiep : 0;
        $product->ck_nv_tu_van = isset($rq->ck_nv_tu_van) ? $rq->ck_nv_tu_van : 0;
        $product->ck_nv_cham_soc = isset($rq->ck_nv_cham_soc) ? $rq->ck_nv_cham_soc : 0;
        $product->ck_chi_nhanh = isset($rq->ck_chi_nhanh) ? $rq->ck_chi_nhanh : 0;
        $product->ck_toan_he_thong = isset($rq->ck_toan_he_thong) ? $rq->ck_toan_he_thong : 0;
        $product->is_ck_nv_tu_van_percen = !isset($rq->is_ck_nv_tu_van_percen) || $rq->is_ck_nv_tu_van_percen == true ? 1 : 0;
        $product->is_ck_nv_cham_soc_percen = !isset($rq->is_ck_nv_cham_soc_percen) || $rq->is_ck_nv_cham_soc_percen == true ? 1 : 0;
        $product->is_ck_chi_nhanh_percen = !isset($rq->is_ck_chi_nhanh_percen) || $rq->is_ck_chi_nhanh_percen == true ? 1 : 0;
        $product->is_ck_toan_he_thong_percen = !isset($rq->is_ck_toan_he_thong_percen) || $rq->is_ck_toan_he_thong_percen == true ? 1 : 0;
        $product->parent_id = 0;

        $product->thoi_luong = isset($rq->thoi_luong) ? $rq->thoi_luong : 0;

        // ton kho
        $product->ton_kho = isset($rq->ton_kho) ? $rq->ton_kho : 0;

        // save tồn kho theo kho hàng
        if (isset($rq->ton_kho) && $rq->ton_kho > 0 && !empty($rq->ton_kho_detail)) {
            $product->ton_kho_detail = $rq->ton_kho_detail;
        }


        // don vi
        $product->don_vi_id = isset($rq->don_vi_id) ? $rq->don_vi_id : 0;

        // Định mức tồn
        $product->dinh_muc_ton_it_nhat = 1;
        $product->dinh_muc_ton_nhieu_nhat = 999999999;
        if ($rq->type == 1) {
            $product->dinh_muc_ton_it_nhat = isset($rq->dinh_muc_ton_it_nhat) ? $rq->dinh_muc_ton_it_nhat : 1;
            $product->dinh_muc_ton_nhieu_nhat = isset($rq->dinh_muc_ton_nhieu_nhat) ? $rq->dinh_muc_ton_nhieu_nhat : 999999999;
        }


        if (isset($rq->mo_ta))
            $product->mo_ta = $rq->mo_ta;

        if (isset($rq->ghi_chu))
            $product->ghi_chu = isset($rq->ghi_chu) ? $rq->ghi_chu : '';

        return $product;
    }

    static function updateCode($product, $type)
    {
        if (empty($rq->code)) {
            $code = TblService::formatNumberByLength($product->id);
            $pre = 'SP-';
            if ($type == '2') {
                $pre = 'DV-';
            }
            if ($type == '3') {
                $pre = 'LT-';
            }
            if ($type == '4') {
                $pre = 'VIP-';
            }
            $product->code = $pre . $code;
            $product->save();
        }
        return $product;
    }
}
