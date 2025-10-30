<?php

namespace App\Services\Admin;

use App\Models\Admin\Card;
use App\Models\Admin\CardService;
use App\Models\Admin\HoaDon;
use App\Models\Admin\HoaDonChiTiet;
use App\Models\Admin\NhanVienThucHien;
use App\Models\Admin\NhanVienTuVan;
use App\Models\Admin\PhieuThu;
use App\Models\Admin\PhieuThuChiTiet;
use App\Models\Admin\Product;
use App\Models\AdminUser;
use App\Models\User;
use App\Services\CommonService;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

/**
 * Class CompanyService
 * @package App\Services\Users
 */
class HoaDonService
{

    static function saveHistory_HDonCardLT($data)
    {
        $aduser = \Auth::guard('admin_users')->user();
        
        $khachHang = $data->users_id['info'];
        $theLan = $data->card_tl['info'];

        $services = DB::table('card_service')->where('data_id', $data->card_tl);
        $tableHistory = DB::table('tables')->where('name', 'card_history')->first();
        $columnHistory = DB::table('table_column')->where('table_id', $tableHistory->id)->first();
        $dataHistory = [];
        foreach ($services as $ser) {
            // add history vào 1 array
            $dataHistory[] = [
                'card_id' => $data->card_tl,
                'card_service_id' => $ser->id,
                'card_gt_id' => 0,
                'chi_nhanh_id' => $data->chi_nhanh_id,
                'hoa_don_id' => $data->id,
                'so_luong' => 1,
                'price' => 0,
                'admin_users_id' => $aduser->id,
                'so_luong_duoc_tang' => 0,
                'product_id' => $ser->product_id,
                'note' => 'Khách xử dụng Thẻ LT ' . $theLan->code,
                'user_edit' => '',
            ];
        }

        if (!empty($dataHistory)) {
            TblService::saveData($columnHistory, 0, $tableHistory, $dataHistory);
        }
    }

    static function saveHoaDonChiTiet_HDonCardLT($data)
    {
        $aduser = \Auth::guard('admin_users')->user();
        $khachHang = User::find($data->users_id);
        $theLan = DB::table('card')->find($data->card_tl);
        $services = DB::table('card_service')->where('data_id', $data->card_tl);
        $tableHistory = DB::table('tables')->where('name', 'card_history')->first();
        $columnHistory = DB::table('table_column')->where('table_id', $tableHistory->id)->first();
        $dataHistory = [];
        foreach ($services as $ser) {
            $dataHistory[] = [
                'name' => $data->card_tl,
                'product_id' => $ser->id,
                'service_id' => 0,
                'nv_thuc_hien_id' => $data->chi_nhanh_id,
                'kho_id' => $data->id,
                'the_id' => 1,
                'so_luong' => 0,
                'don_gia' => $aduser->id,
                'chiet_khau_money' => 0,
                'chiet_khau' => 0,
                'vat' => '',
                'vat_money' => '',
                'thanh_tien' => '',
                'ghi_chu' => '',
                'users_id' => '',
            ];
        }

        if (!empty($dataHistory)) {
            TblService::saveData($columnHistory, 0, $tableHistory, $dataHistory);
        }
    }

    static function HDonCardLT_saveHDonChiTiet($data, $post)
    {
        $aduser = \Auth::guard('admin_users')->user();
        
        $khachHang = $data->users_id['info'];
        $theLan = $data->card_tl['info'];

        if(empty($theLan->card_service_ids)) {
            return false;
        }
        $serviceIDs = json_decode($theLan->card_service_ids, true);

        $services = DB::table('card_service')->whereIn('id',values: $serviceIDs)->get();
        $tableHistory = DB::table('tables')->where('name', 'card_history')->first();
        $columnHistory = DB::table('table_column')->where('table_id', $tableHistory->id)->first();
        
        $dataHistory = [];
        foreach ($services as $ser) {
            // save, 
            // được copy từ card_service sang hoa_don_chi_tiet, 
            $dataHDonChiTiet[] = [
                'name' => $khachHang->name . ' sử dụng thẻ ' . $theLan->code,
                'product_id' => $ser->product_id, // todo
                'data_id' => $data->id, // hoa_don ID
                // 'service_id' => 0,
                'nv_thuc_hien_id' => !isset($post['theLan_nvThucHien'][$ser->id]) ? 0 : $post['theLan_nvThucHien'][$ser->id],
                // 'kho_id' => $data->id,
                'the_id' => 0,
                'so_luong' => 1,
                'don_gia' => 0,
                'TongTienHang' => 0,
                'so_luong_duoc_tang' => 0,
                'chiet_khau_persen' => 0,
                'chiet_khau' => 0,
                'vat' => 0,
                'vat_money' => 0,
                'thanh_tien' => 0,
                'thanh_toan' => 0,
                'ghi_chu' => 0,
                'lucky_id' => 0,
                
            ];
        }

        if (!empty($dataHistory)) {
            TblService::saveData($columnHistory, 0, $tableHistory, $dataHDonChiTiet);
        }
    }

    static function cardLTInfo($cardId) {
        $cardTL = [
            'code' => '',
            'total' =>  0,
            'totalDuocTang' => 0,
            'suDung' => 0,
            'conlai' => 0,
        ];
        
        if(!empty($data->card_tl)) {
            $card = DB::table('card')->find( $cardId);
            $cardService = DB::table('card_service')->where('data_id', $cardId)->get();

            // Tổng số buổi
            $total = 0;
            $totalDuocTang = 0;
            foreach($cardService as $ser) {
                $total += $ser->so_luong + $ser->so_luong_tang;
                $totalDuocTang += $ser->so_luong_tang;
            }

            // đã xử dụng
            $suDung = 0;
            $soluongDuocTang = 0;
            $cardHistory = DB::table('card_history')->where('card_id', $cardId)->get();
            foreach ($cardHistory as $his) {
                $suDung += intval($his->so_luong) + intval($his->so_luong_duoc_tang); 
                $soluongDuocTang += intval($his->so_luong_duoc_tang); 
            }
            
            // còn lại
            $conLai = $total - $suDung;
            $cardTL = [
                'id' => $card->id,
                'code' => $card->code,
                'total' => $total,
                'totalDuocTang' => $totalDuocTang,
                'suDung' => $suDung,
                'conlai' => $conLai,
            ];
        }

        return $cardTL;
    }

    static function cardGTInfo($cardId) {
        $card_gt_info = [
            'id' => $cardId,
            'code' => '',
            'total' => 0,
            'suDung' => 0,
            'conlai' => 0,
        ];
        if(!empty($data->card_gt)) {
            $card = DB::table('card')->find(intval($cardId));
            // tổng số tiền
            $total = intval($card->menh_gia_the) + intval($card->tien_tang_them);
            $tanggiaTriThe = DB::table('tang_gia_tri_the')->where('card_id', $cardId)->get();

            foreach($tanggiaTriThe as $gt) {
                $total = $total + $gt->DonGia + $gt->TienTangThem;
            }

            //đã xử dung
            $xuDung = 0;
            $historys = DB::table('card_history')->where('card_id', $cardId)->get();
            foreach($historys as $h) {
                $xuDung += intval($h->price);
            }
            //còn lại
            $conlai = $total - $xuDung;
            $card_gt_info = [
                'id' => $cardId,
                'code' => $card->code,
                'total' => $total,
                'suDung' => $xuDung,
                'conlai' => $conlai,
            ];
        }
        return $card_gt_info;
    }

    static function hoaDonChiTiet($hoaDonId) {
        $hoaDonChiTiet = DB::table('hoa_don_chi_tiet')
            ->select(
                'hoa_don_chi_tiet.UserNhap as UserNhap', 
                'hoa_don_chi_tiet.id as id', 
                'hoa_don_chi_tiet.so_luong as so_luong', 
                'hoa_don_chi_tiet.vat as vat', 
                'hoa_don_chi_tiet.vat_money as vat_money', 
                'hoa_don_chi_tiet.thanh_tien as thanh_tien', 
                'hoa_don_chi_tiet.thanh_toan as thanh_toan', 
                'hoa_don_chi_tiet.ghi_chu as ghi_chu', 
                'hoa_don_chi_tiet.TenNhanVienThucHien as TenNhanVienThucHien', 
                'hoa_don_chi_tiet.TenNhanVienTuVan as TenNhanVienTuVan', 
                'hoa_don_chi_tiet.is_recycle_bin as is_recycle_bin', 
                'hoa_don_chi_tiet.chiet_khau_persen as chiet_khau_persen', 
                'hoa_don_chi_tiet.chiet_khau_money as chiet_khau_money', 

                'hoa_don_chi_tiet.product_id as product_id', 
                'hoa_don_chi_tiet.don_vi_id as don_vi_id', 
                'products.name as ten_san_pham', 
            )
            ->leftJoin('products', 'products.id', 'hoa_don_chi_tiet.product_id')
            ->where('data_id', $hoaDonId)
            ->get();

            $detail = [];

            foreach($hoaDonChiTiet as $hd) {
                // dd($hd);
                $nvThucHien = DB::table('nhan_vien_thuc_hien')
                    ->select(
                        'nhan_vien_thuc_hien.TienChietKhau as TienChietKhau', 
                        'nhan_vien_thuc_hien.LaPhanTram as LaPhanTram', 
                        'nhan_vien_thuc_hien.DienGiai as DienGiai', 
                        'nhan_vien_thuc_hien.DuocYeuCau as DuocYeuCau', 
                        'nhan_vien_thuc_hien.ChiPhiThucHien as ChiPhiThucHien', 
                        'nhan_vien_thuc_hien.LaPTChiPhiThucHien as LaPTChiPhiThucHien', 

                        'nhan_vien_thuc_hien.nhan_vien_id as nhan_vien_id', 
                        'admin_users.name as ho_ten', 
                    )
                    ->where('nhan_vien_thuc_hien.chung_tu_chi_tiet_id', $hd->id)
                    ->leftJoin('admin_users', 'admin_users.id', 'nhan_vien_thuc_hien.nhanh_vien_id')
                    ->get();

                $nvTuVan = DB::table('nhan_vien_tu_van')
                    ->select(
                        'nhan_vien_tu_van.name as name', 
                        'nhan_vien_tu_van.TienChietKhau as TienChietKhau', 
                        'nhan_vien_tu_van.LaPhanTram as LaPhanTram', 
                        'nhan_vien_tu_van.DienGiai as DienGiai', 
                        'nhan_vien_tu_van.created_at as created_at', 

                        'nhan_vien_tu_van.nhan_vien_id as nhan_vien_id', 
                        'admin_users.name as ho_ten', 
                    )
                    ->where('nhan_vien_tu_van.chung_tu_chi_tiet_id', $hd->id)
                    ->leftJoin('admin_users', 'admin_users.id', 'nhan_vien_tu_van.nhan_vien_id')
                    ->get();

                $detail[] = [
                    'hoa_don' => $hd,
                    'nvThucHien' => $nvThucHien,
                    'nvTuVan' => $nvTuVan,
                ];
            }
            return $detail;
    }

    static function saveHoaDon($param, $hoaDonId) {
        // cancel: xóa data của hđơn và hđơn chi tiết
        if($param['typeSubmit'] == 'cancel') {
            HoaDonChiTiet::where('data_id', $hoaDonId)->delete();
            // xóa hết nv thực hiện, tư vấn cũ nếu trước đó đã lưu draft
            NhanVienThucHien::where('loai_chung_tu', 'hoa_don')
                ->where('chung_tu_id', $hoaDonId)
                ->delete();
            NhanVienTuVan::where('loai_chung_tu', 'hoa_don')
                ->where('chung_tu_id', $hoaDonId)
                ->delete();

            return 0;
        }

        $adminUser = \Auth::guard('admin_users')->user();
        $customer = User::find($param['user_id']);
        $chiNhanh = DB::table('chi_nhanh')->find($param['chi_nhanh_id']);
        $cardGT = DB::table('card')->where('users_id', $param['user_id'])->where('card_group_id', 14)->first();

        if(empty($hoaDonId)) {
            $hoaDon = new HoaDon();
        } else {
            $hoaDon = HoaDon::find($hoaDonId);
        }

        $hoaDon->users_id = $param['user_id'];
        $hoaDon->note = !empty($param['note']) ? $param['note'] : '';

        // Tên hóa đơn: tên KH + date
        $hoaDon->name = $customer->name . ' ' . date('d/m/Y');
        $hoaDon->chi_nhanh_id = $param['chi_nhanh_id'];
        $hoaDon->type_hoa_don_id = 1; //1: hdon ban lẻ; 2: hdon thẻ lần
        $hoaDon->chiet_khau_nv_thuc_hien = intval($param['chietKhauNVThucHien']);
        $hoaDon->chiet_khau_nv_tu_van = intval($param['chietKhauNVTuVan']);
        $hoaDon->vat_money = $param['VAT'];
        // $hoaDon->TongTienThue = $param['VAT'];
        $hoaDon->don_vi_id = 1; // dv tiền tệ
        $hoaDon->tong_tien = $param['totalVAT']; // tổng tiền hóa đơn
        // $hoaDon->TongChiPhi = $param['totalVAT'];
        $hoaDon->TongTienHang = $param['total']; //TongTienHang chua vat
        $hoaDon->thanh_toan = $param['thanhToan']; // tiền khách fai thanh toán sau khi trừ thẻ
        $hoaDon->card_gt = !empty($cardGT) ? $cardGT->id : 0; // mã thẻ gt
        $hoaDon->card_tl = 0;
        $hoaDon->tien_trong_the = $param['tienTrongThe'];
        $hoaDon->tien_tru_the = $param['tienDaTruTrongThe'];
        $hoaDon->tien_con_lai = $param['tienConLaiSauThanhToan'];
        $hoaDon->chiet_khau_nv_thuc_hien = $param['chietKhauNVThucHien'];
        $hoaDon->chiet_khau_nv_tu_van = $param['chietKhauNVTuVan'];
        $hoaDon->create_by = $adminUser->id;

        // code: chi_nhanh_code + .HIMALAYA + date(Ymd) + <stt gồm 5 chữ số>
        $countToday = DB::table('hoa_don')
            ->whereBetween('created_at', [date('Y-m-d') . ' 00:01:01', date('Y-m-d') . ' 23:59:59'])
            ->where('is_recycle_bin', 0)
            ->count();
        $countToday++;
        $hoaDon->code = self::generateCodeHoaDon($chiNhanh->code, $countToday);

        // draft
        if($param['typeSubmit'] == 'draft') {
          
            // draft: xử lý lưu vào db ở chế độ draft và chưa trừ tiền của khách trong thẻ GT
            $hoaDon->hoa_don_status_id = 2;
            $hoaDon->is_draft = 1;
            $hoaDon->save();
            if(!empty($hoaDonId)) {
                self::deleteSubDataHoaDonDraft($hoaDonId);
            }
            
            // lưu lại tất cả hđơn chi tiết
            for($i = 0; $i<10; $i++) {
                $name = self::getNameHoaDon($i);
                // bỏ qua nếu ko chọn sản phẩm
                if(empty($name['product_id'])) {
                    continue;
                }

                // save hdon chi tiết
                $hdonChiTiet = self::saveHoaDonChiTiet($i, $param, $hoaDon);
                
                // save nv tư vấn và chăm sóc
                self::saveNV_hoaDon($i, $param, $hoaDon, $hdonChiTiet);
                
            }

            return $hoaDon;
        }

        // submit
        if($param['typeSubmit'] == 'submit') {
            // submit: Lưu hóa đơn, hđơn chi tiết, lịch sử dùng thẻ, phiếu thu, phiếu thu chi tiết
            $hoaDon->hoa_don_status_id = 1;
            $hoaDon->is_draft = 0;
            $hoaDon->save();

            if(!empty($hoaDonId)) {
                self::deleteSubDataHoaDonDraft($hoaDonId);
            }

            // save tất cả hđơn chi tiết, nv thực hiên, nv tư vấn
            for($i = 0; $i<10; $i++) {
                $name = self::getNameHoaDon($i);
                // bỏ qua nếu ko chọn sản phẩm
                if(empty($name['product_id'])) {
                    continue;
                }
                // save hdon chi tiết
                $hdonChiTiet = self::saveHoaDonChiTiet($i, $param, $hoaDon);
                
                // save nv tư vấn và chăm sóc
                self::saveNV_hoaDon($i, $param, $hoaDon, $hdonChiTiet);
            }

            // save lịch sử dùng thẻ
            if(!empty($cardGT)) {
                DB::table('card_history')->insert([
                    'card_id' => $cardGT->id,
                    'card_service_id' => 0,
                    'users_id' => $customer->id,
                    'chi_nhanh_id' => $param['chi_nhanh_id'],
                    'hoa_don_id' => $hoaDon->id,
                    'hoa_don_chi_tiet_id' => 0, // ko cần lưu
                    // 'so_luong' => $param['so_luong_' . $i],
                    'price' => $param['tienDaTruTrongThe'],
                    // 'vat' => $param['VAT'],
                    'vat_money' => $param['VAT'],
                    'admin_users_id' => $adminUser->id,
                    'so_luong_duoc_tang' => 0,
                    // 'product_id' =>$param['product_id_' . $i],
                    'ton_luy_ke' =>0,
                    'note' => !empty($param['note']) ? $param['note'] : '',
                    'is_recycle_bin' =>0,
                    'create_by' =>$adminUser->id,
                    'created_at' =>date('Y-m-d H:i:s')
                ]);
            }

            // save phiếu thu
            $phieuThu = new PhieuThu();
            $phieuThu->name = 'Phiếu thu khách hàng ' . $customer->name . ' ' . date('d/m/Y H:i:s');
            $phieuThu->code = '';
            $phieuThu->chi_nhanh_id = $param['chi_nhanh_id'];
            // $phieuThu->hinh_thuc_thu_id = 0;
            // $phieuThu->loai_thu_id = 0;
            $phieuThu->so_tien = $param['thanhToan'];
            // $phieuThu->menh_gia_id = '';
            $phieuThu->thoi_gian = date('Y-m-d H:i:s');
            $phieuThu->user_thu_id = $adminUser->id;
            // $phieuThu->explain = '';
            // $phieuThu->ngan_hang_id = '';
            // $phieuThu->phi_the = '';
            // $phieuThu->file = '';
            $phieuThu->description = '';
            $phieuThu->users_id = $customer->id ;
            // $phieuThu->tien_mat = '';
            // $phieuThu->tien_gui = '';
            // $phieuThu->tien_thu = '';
            $phieuThu->NguoiNopTien = $customer->name;
            $phieuThu->UserLap = $chiNhanh->name;
            // $phieuThu->NgaySuaCuoi = '';
            // $phieuThu->UserSuaCuoi = '';
            $phieuThu->ngoai_te_id = 1;
            $phieuThu->ty_gia_id = 1;
            $phieuThu->create_by = $adminUser->id;
            $phieuThu->save();


            //// save phiếu thu chi tiet
            $phieuThuChiTiet = new PhieuThuChiTiet();
            $phieuThuChiTiet->name = 'Phiếu thu khách hàng ' . $customer->name . ' ' . date('d/m/Y H:i:s');
            $phieuThuChiTiet->phieu_thu_id = $phieuThu->id['id'];
            $phieuThuChiTiet->data_id = $phieuThu->id['id'];
            // $phieuThuChiTiet->ID_KhoanThu = '';
            $phieuThuChiTiet->ID_KhachHang = $customer->id;
            // $phieuThuChiTiet->ID_TheThoanhToan = '';
            $phieuThuChiTiet->ThuTuThe = 0;
            // $phieuThuChiTiet->TienMat = '';
            // $phieuThuChiTiet->TienGui = '';
            // $phieuThuChiTiet->TienThu = '';
            $phieuThuChiTiet->GhiChu = !empty($param['note']) ? $param['note'] : '';
            $phieuThuChiTiet->chung_tu_id = $hoaDon->id;
            $phieuThuChiTiet->LoaiCT = 8;
            // $phieuThuChiTiet->ChiPhiNganHang = '';
            // $phieuThuChiTiet->LaPTChiPhiNganHang = '';
            $phieuThuChiTiet->DiaChi_KhachHang = $customer->address;
            // $phieuThuChiTiet->ThuPhiTienGui = '';
            $phieuThuChiTiet->nhan_vien_id = $adminUser->id;
            $phieuThuChiTiet->create_by = $adminUser->id;
            // dd($phieuThu->id);
            $phieuThuChiTiet->save();

        }

        return $hoaDon;
    }

    static function deleteHoaDon($hoaDonId) {
        // xóa hết nv thực hiện, tư vấn cũ nếu trước đó đã lưu draft
        NhanVienThucHien::where('loai_chung_tu', 'hoa_don')
            ->where('ma_chung_tu', $hoaDonId)
            ->delete();
        NhanVienTuVan::where('loai_chung_tu', 'hoa_don')
            ->where('chung_tu_id', $hoaDonId)
            ->delete();

        // xóa phiếu thu
        $phieuThu = PhieuThu::where('loai_chung_tu','hoa_don')
            ->where('chung_tu_id', $hoaDonId)
            ->first();
        if(!empty($phieuThu->id)) {
            PhieuThuChiTiet::where('data_id', $phieuThu->id)->delete();
            $phieuThu->delete();
        }

        // xoa các hoán đơn chi tiết
        $hoaDonChiTiet = HoaDonChiTiet::where('data_id', $hoaDonId)->get();
        foreach($hoaDonChiTiet as $ct) {
            if(!empty($ct->card_id)) {
                // rolback lại card
                $cardService = Card::find($ct->card_id);
                $cardService->so_luong_da_su_dung -= $ct->so_luong;
                $cardService->so_luong_con_lai = $cardService->so_luong - $cardService->so_luong_da_su_dung;
                $cardService->save();    

                $cardService = CardService::find($ct->card_service_id);
                $cardService->so_luong_da_su_dung -= $ct->so_luong;
                $cardService->save();
                
            }
            // xoa hdon chi tiet
            $ct->delete();
        }

        
        
        // xóa hóa đơn
        $hoaDon = HoaDon::find($hoaDonId);
        if(!empty($hoaDon)) {
            $hoaDon->delete();
        }
    }

    static function saveHoaDonChiTiet($i, $param, $hoaDon) {
        $name = self::getNameHoaDon($i);
        $product = Product::find($param[$name['product_id']]);
        if(empty($product)) {
            return false;
        }
        // dd($product->name);
        $hdonChiTiet = new HoaDonChiTiet();
        $hdonChiTiet->data_id = $hoaDon->id;
        $hdonChiTiet->name = $product->name . ' - ' . date('d/mY H:i:s');
        $hdonChiTiet->product_id = $param[$name['product_id']];
        $hdonChiTiet->don_gia = $param[$name['price']];
        $hdonChiTiet->TongTienHang = $param[$name['price']];
        // $hdonChiTiet->don_gia = $product->price;
        $hdonChiTiet->so_luong = $param[$name['so_luong']];
        $hdonChiTiet->don_vi_id = $product->don_vi_id;
        $hdonChiTiet->thanh_tien = $param[$name['total']];
        $hdonChiTiet->thanh_toan = $param[$name['total_vat']];
        $hdonChiTiet->vat = $param[$name['vat']];
        $hdonChiTiet->vat_money = $param[$name['vat_money']];
        $hdonChiTiet->users_id = $param['user_id'];
        $hdonChiTiet->ThoiGianThucHien = $param[$name['ThoiGianThucHien']];
        
        $hdonChiTiet->is_draft = $param['typeSubmit'] == 'draft' ? 1 : 0;
        // $hdonChiTiet->LoaiThoiGianBH = $param[$name['so_luong']];
        // $hdonChiTiet->UserNhap = $param[$name['so_luong']];
        $hdonChiTiet->save();

        return $hdonChiTiet;
    }

    static function saveNV_hoaDon($idx, $param, $hoaDon, $hdonChiTiet) {
        $adminUser = \Auth::guard('admin_users')->user();
        for($idx_nv = 0; $idx_nv<4; $idx_nv++) {
            // save nv tư vấn
            $name_id_nvTuVan = "nv_tu_van_{$idx}_{$idx_nv}";
            $name_chietKhau_nvTuVan = "nv_tu_van_chiet_khau_money_{$idx}_{$idx_nv}";
            $name_chietKhau_nvTuVan_persen = "nv_tu_van_chiet_khau_persen_{$idx}_{$idx_nv}";
            // dd($param);
            // nv tư vấn
            if(isset($param[$name_id_nvTuVan]) && !empty($param[$name_id_nvTuVan])) {
                $nvtv = AdminUser::find($param[$name_id_nvTuVan]);
                if(empty($nvtv)) {

                }
                $nvTuVan = new NhanVienTuVan();
                $nvTuVan->name = 'HD bán lẻ - ' . $nvtv->name . date('d/mY');
                $nvTuVan->nhan_vien_id = $param[$name_id_nvTuVan];
                $nvTuVan->TienChietKhau = $param[$name_chietKhau_nvTuVan];
                $nvTuVan->LaPhanTram = $param[$name_chietKhau_nvTuVan_persen];
                $nvTuVan->loai_chung_tu = 'hoa_don';
                $nvTuVan->chung_tu_id = $hoaDon->id;
                $nvTuVan->ma_chung_tu = $hoaDon->code;
                $nvTuVan->chung_tu_chi_tiet_id = $hdonChiTiet->id;

                $nvTuVan->create_by = $adminUser->id;
                $nvTuVan->save();
            }

            // save nv thực hiện
            $name_id_nvThucHien = "nv_thuc_hien_{$idx}_{$idx_nv}";
            $name_chietKhau_nvThucHien = "nv_thuc_hien_chiet_khau_money_{$idx}_{$idx_nv}";
            $name_chietKhau_nvThucHien_persen = "nv_thuc_hien_chiet_khau_persen_{$idx}_{$idx_nv}";
            if(!empty($param[$name_id_nvThucHien])) {
                $nvth = AdminUser::find($param[$name_id_nvTuVan]);
                $nvThucHien = new NhanVienThucHien();
                $nvThucHien->name = 'HD bán lẻ - ' . $nvth->name . ' ' . date('d/mY');
                $nvThucHien->nhan_vien_id = $param[$name_id_nvThucHien];
                $nvThucHien->TienChietKhau = $param[$name_chietKhau_nvThucHien];
                $nvThucHien->LaPhanTram = $param[$name_chietKhau_nvThucHien_persen];
                $nvThucHien->loai_chung_tu = 'hoa_don';
                $nvThucHien->ma_chung_tu = $hoaDon->code;
                $nvThucHien->chung_tu_chi_tiet_id = $hdonChiTiet->id;

                // $nvThucHien->LaNhanVienChinh = 100;
                $nvThucHien->create_by = $adminUser->id;
                $nvThucHien->save();
            }
        }
    }

    static function generateCodeHoaDon($pre, $countToday) {
        $countToday++;
        $code = $pre . '.HIMALAYA'. date('dmY') . '_' . CommonService::formatNumber02($countToday, 5);
        $checkCode = DB::table('hoa_don')->where('code', $code)->count();
        if($checkCode > 0) {
            $code = self::generateCodeHoaDon($pre, $countToday);
        }
        return $code;
    }

    static function getNameHoaDon($idx) {
        return [
            'active' => 'active_'  . $idx,
            'product_id' => 'product_id_'  . $idx,
            'price' => 'price_'  . $idx,
            'so_luong' =>'so_luong_'  . $idx,
            'vat' =>'vat_'  . $idx,
            'vat_money' =>'vat_money_'  . $idx,
            'total' =>'total_'  . $idx,
            'total_vat' =>'total_vat_'  . $idx,
            'nv_thuc_hien' =>'nv_thuc_hien_'  . $idx,
            'chiet_khau_persen' =>'chiet_khau_persen_'  . $idx,
            'chiet_khau_money' =>'chiet_khau_money_'  . $idx,
            'ThoiGianThucHien' =>'ThoiGianThucHien_'  . $idx,
        ];
    }


    static function getGoiDV($userId) {
        $cards= Card::select(
            'card.id as card_id',
                'card.code as card_code',
                'card.product_id as product_id',
                'products.name as product_name',
                'card.so_luong as so_luong',
                'card.so_luong_da_su_dung as so_luong_da_su_dung',
                'card.so_luong_con_lai as so_luong_con_lai',
            )
            ->leftJoin('products', 'products.id', 'card.product_id')
            ->where('users_id', $userId)
            ->where('card_group_id', 2)
            ->get();
        $service = [];
        foreach ($cards as $card) {
            $cardService = CardService::select(
                'card_service.so_luong as so_luong',
                    'card_service.id as card_service_id',
                    'card_service.product_id as product_id',
                    'card_service.so_luong_da_su_dung as so_luong_da_su_dung',
                    'products.gia_ban as product_gia_ban',
                    'products.name as product_name',
                    'products.gia_ban as product_gia_ban',
                )
                ->where('card_service.data_id', $card->card_id)
                ->leftJoin('products', 'products.id', 'card_service.product_id')
                ->get();
            $service[] = [
                'card' => $card,
                'cardService' => $cardService
            ];
        }

        return $service;
    }

    static function getCaInfo($nhanVienThuNgan) {
        if(empty($nhanVienThuNgan->id)) {
            return [];
        }
        $caInfo = [
            'nguoiThu' => !empty($nhanVienThuNgan->name) ? $nhanVienThuNgan->name : '',
            'tien_mat' => 0,
            'tien_quet_the' => 0,
            'tien_chuyen_khoan' => 0,
            'tien_tip' => 0,
            'phi_ca_the' => 0,
            'tien_tru_the_vip' => 0,
            'tongThu_baoGomTheVIP' => 0,
            'tongThu_daTruTheVIP' => 0,
            'cong_no' => 0,
        ];
        
        $caLamViec = HoaDon::baseQuery(false, false)
            ->where('hoa_don.nhan_vien_id', $nhanVienThuNgan->id)
            ->whereBetween('hoa_don.created_at', [Carbon::today()->startOfDay()->format('Y-m-d H:i:s'), Carbon::today()->endOfDay()->format('Y-m-d H:i:s')])
            ->get();
     
        foreach($caLamViec as $c) {
            $caInfo['tien_mat'] += $c->tien_mat;
            $caInfo['tien_quet_the'] += $c->tien_quet_the;
            $caInfo['tien_chuyen_khoan'] += $c->tien_chuyen_khoan;
            $caInfo['tien_tip'] += $c->tien_tip;
            $caInfo['phi_ca_the'] += $c->phi_ca_the;
            $caInfo['tien_tru_the_vip'] += $c->tien_tru_the_vip;
            $caInfo['tongThu_baoGomTheVIP'] += $c->TongChiPhi;
            $caInfo['tongThu_daTruTheVIP'] += $c->thanh_toan;
            $caInfo['cong_no'] += $c->cong_no;
        }
        // dd($caInfo);
        return $caInfo;
    }
}

