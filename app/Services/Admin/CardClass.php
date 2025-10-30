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

/**
 * Class CompanyService
 * @package App\Services\Users
 */
class CardClass
{
    static function getCardGTInfo($userId)
    {
        $cards= Card::select(
                'card.*',
                'card.product_id as product_id',
                'products.name as product_name',
                'products.gia_ban as product_gia_ban',
            )
            ->leftJoin('products', 'products.id', 'card.product_id')
            ->where('users_id', $userId)
            ->where('card_group_id', config('constant.card_group.the_gia_tri'))
            ->get();
        return $cards;
    }

    static function getCardGTInfo01($userId)
    {
        $result = [
            'id' => 0,
            'code' => '',
            'tongDaNap' => 0,
            'tienConLai' => 0,
            'lich_su_nap_the' => '',
            'cardHistory' => '',
            'card_info' => []
        ];

        if(empty($userId)) {
            return $result;
        }

        $card = DB::table('card')->where('users_id', $userId)->where('card_group_id', 14)->first();
        if(empty( $card)) {
            return $result;
        }
        $label = $card->code;
        $service = [];
        $total = 0;

        // get tiền trong thẻ GT: =  tổng tiền đã nạp - history

        // tính tổng tiền đã nạp từ bảng lịch sử nạp tiền: tang_gia_tri_the (lucky: TangGiaTriThe)
        $lichSuNapThe = DB::table('tang_gia_tri_the')->where('card_id', $card->id)->get();
        $total = intval($card->menh_gia_the) + intval($card->tien_tang_them);
        foreach ($lichSuNapThe as $gt) {
            // total = tiền nạp vào + Tiền tặng thêm
            $total += intval($gt->DonGia) + intval($gt->TienTangThem) ;
        }

        // tính tổng tiền đã sử dụng từ bảng card_history (lucky: NhatKySuDungThe)
        $cardHistory = DB::table('card_history')->where('card_id', $card->id)->get();
        $history = 0;
        foreach ($cardHistory as $his) {
            $history += intval($his->price);
        }

        $tienConLai = $total - $history;

        $label .= ' - ' . number_format($tienConLai) . " ({$history}/{$total})";


        $result = [
            'id' => $card->id,
            'code' => $card->code,
            'tongDaNap' => $total,
            'tienConLai' => $tienConLai,
            'lich_su_nap_the' => $lichSuNapThe,
            'cardHistory' => $cardHistory,
            'card_info' => $card,
        ];
        return $result;
    }


    static function getCardTLInfo($userId)
    {
        $card = DB::table('card')->where('users_id', $userId)->where('card_group_id', '!=', 14)->get();
        if(empty($card)) {
            return [];
        }
        $card_detail = [];
        $cardSelect = [];
        $cardInfo = [];
        foreach ($card as $c) {

            $cardServices = DB::table('card_service')
                ->select(
                    'card_service.data_id as data_id',
                    'card_service.so_luong as so_luong',
                    'card_service.product_id as product_id',
                    'card_service.don_gia as don_gia',
                    'card_service.phan_tram_chiet_khau as phan_tram_chiet_khau',
                    'card_service.tien_chiet_khau as tien_chiet_khau',
                    'card_service.so_luong_tang as so_luong_tang',
                    'card_service.tang_kem as tang_kem',
                    'card_service.created_at as created_at',
                    'products.name as ten_sp',
                    'products.product_group_id as product_group_id',
                    'products.gia_von as gia_von',
                    'products.thoi_gian_khau_hao as thoi_gian_khau_hao',
                    'products.ton_kho_toi_thieu as ton_kho_toi_thieu',
                    'products.ton_kho_toi_da as ton_kho_toi_da',
                    'products.description as product_description',
                    'products.created_at as product_created_at',
                    'products.updated_at as product_updated_at',
                    'products.price as product_price',
                    'products.don_vi_id as don_vi_id'
                )
                ->where('card_service.data_id', $c->id)
                ->where('card_service.is_recycle_bin', 0)
                ->leftJoin('products', 'products.id', 'card_service.product_id')
                ->get();

            // lấy ra số buổi của thẻ lần
            $productLT = [];
            $soLuong_service = 0;
            $tongSoLuong_service = 0;
            foreach ($cardServices as $ser) {
                $soLuong_service = $ser->so_luong + $ser->so_luong_tang;
                $tongSoLuong_service += $soLuong_service;
                $product = DB::table('products')->find(intval($ser->product_id));
                if (empty($product)) {
                    continue;
                }
            }

            // lấy ra số buổi đã xử dụng của thẻ lần
            $cardHistorys = DB::table('card_history')
                ->select(
                    'card_history.id as id',
                    'card_history.so_luong as so_luong',
                    'card_history.so_luong as so_luong_duoc_tang',
                    'card_history.created_at as created_at',
                    'card_history.product_id as product_id',

                    'products.name as product_name',
                    'products.product_group_id as product_group_id',
                    'products.gia_von as product_gia_von',
                    'products.thoi_gian_khau_hao as product_thoi_gian_khau_hao',
                    'products.ton_kho_toi_thieu as product_ton_kho_toi_thieu',
                    'products.ton_kho_toi_da as product_ton_kho_toi_da',
                    'products.description as product_description',
                    'products.created_at as product_created_at',
                    'products.updated_at as product_updated_at',
                    'products.price as product_price',
                    'products.don_vi_id as don_vi_id'


                )
                ->leftJoin('products', 'products.id', 'card_history.product_id')
                ->where('card_history.card_id', $c->id)
                ->get();
            $soLuong_history = 0;
            foreach($cardHistorys as $his) {
                $soLuong_history += $his->so_luong;
            }

            $cardInfo[] = [
                'card' => $c,
                'soLuong_service' => $soLuong_service,
                'soLuong_history' => $soLuong_history,
                'cardHistorys' => $cardHistorys
            ];

        }
        return $cardInfo;
    }

    static function getCardGT($card)
    {
        $card_detail = [];
        $cardSelect = [];
        foreach ($card as $c) {
            $label = $c->code;
            $service = [];
            $total = 0;

            // get tiền trong thẻ GT: =  tổng tiền đã nạp - history

            // tính tổng tiền đã nạp từ bảng lịch sử nạp tiền: card_gt
            $cardGT = DB::table('card_gt')->where('card_id', $c->id)->get();
            $total = intval($c->menh_gia_the) + intval($c->tien_tang_them);
            foreach ($cardGT as $gt) {
                $total += intval($gt->tien_tang_them);
            }

            // tính tổng tiền đã sử dụng từ bảng card_history
            $cardHistory = DB::table('card_history')->where('card_id', $c->id)->get();
            $history = 0;
            foreach ($cardHistory as $his) {
                $history += intval($his->price);
            }

            // tiền còn trong thẻ
            $money = $total - $history;

            $label .= ' - ' . number_format($money) . " ({$history}/{$total})";

            $item = [
                'id' => $c->id,
                'value' => $c->id,
                'label' => $label,
                'service' => $service,
                'money' => $money
            ];
            $card_detail[$c->id] = $item;
            $cardSelect[] = $item;
            continue;
        } // end foreach card


        $result = [
            'card' => $card_detail,
            'cardSelect' => $cardSelect,
        ];
        return $result;
    }

    static function getCardLT($card)
    {
        $card_detail = [];
        $cardSelect = [];
        foreach ($card as $c) {
            // get DV và số buổi trong thẻ LT
            $cardGT = DB::table('card_service')->where('data_id', $c->id)->get();
            $label = $c->code;
            $tongSoLuong = 0;
            if (!empty($c->card_service_ids)) {

                // lấy ra số buổi của thẻ lần
                $serItem = [];
                $card_service_ids = json_decode($c->card_service_ids);
                $cardServices =  DB::table('card_service')->whereIn('id', $card_service_ids)->get();
                $productLT = [];
                $soLuong = 0;
                foreach ($cardServices as $ser) {

                    $soLuong = $ser->so_luong + $ser->so_luong_tang;
                    $tongSoLuong += $soLuong;

                    // lấy ra số buổi đã xử dụng của thẻ lần
                    $countHistoryLT = DB::table('card_history')->where('card_service_id', $ser->id)->count();

                    // luu vào item
                    $serItem[] = [
                        'so_luong_da_su_dung' => $countHistoryLT,
                        'detail' => $ser
                    ];

                    // cập nhật lại label, có kèm tên sp(số lượng) cho dễ hiểu

                    $product = DB::table('products')->find(intval($ser->product_id));
                    if (empty($product)) {
                        continue;
                    }
                    $label .= ' - ' . $product->name . ' (Đã sử dụng ' . $countHistoryLT . '/' . $soLuong . ' lần)';
                    $productLT[] = [
                        'id' => $product->id,
                        'key' => $product->id,
                        'product_id' => $product->name,
                        'so_luong' => $countHistoryLT . '/' . $tongSoLuong,
                        'nv_thuc_hien' => '',
                        // 'chiet_khau' => 0,
                        'note' => $ser->note
                    ];
                }
            }

            // check disable
            $isDisable = false;
            if ($countHistoryLT >= $soLuong) {
                $isDisable = true;
            }

            $cardSelect[] = [
                'id' => $c->id,
                'value' => $c->id,
                'label' => $label,
                'disabled' =>  $isDisable
            ];
            $card_detail[$c->id] = [
                'id' => $c->id,
                'value' => $c->id,
                'label' => $label,
                'so_luong_da_su_dung' => $countHistoryLT,
                'so_luong' => $soLuong,
                'products' => $productLT,
            ];
        }
        return [
            'card' => $card_detail,
            'cardSelect' => $cardSelect,
        ];
    }

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

    static function deleteHoaDon($hoaDonId) {

        // xoa các hoán đơn chi tiết
        HoaDonChiTiet::where('data_id', $hoaDonId)->delete();

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
        PhieuThuChiTiet::where('data_id', $phieuThu->id)->delete();
        
        $hoaDon = HoaDon::find($hoaDonId);
        if(!empty($hoaDon)) {
            $hoaDon->delete();
        }
    }

    static function getDVTrongGoi($pid) {
        $nguyenLieu = DB::table('product_dich_vu_trong_goi')
            ->select(
                'product_dich_vu_trong_goi.so_luong as so_luong',
                'product_dich_vu_trong_goi.id as id',
                'products.name as product_name',
                'products.code as product_code',
                'products.gia_von as gia_von',
                'products.gia_ban as gia_ban',
            )
            ->where('product_dich_vu_trong_goi.product_id', $pid)
            ->leftJoin('products', 'products.id', 'product_dich_vu_trong_goi.id_dich_vu_ap_dung')
            ->get();
        $result = [];
        foreach($nguyenLieu as $key => $nl) {
            $stt = $key +1;
            $result[] = [
                'key' => $nl->id,
                'id' => $nl->id,
                'stt' => $stt,
                'product_code' => $nl->product_code,
                'product_name' => $nl->product_name,
                'gia_von' => $nl->gia_von,
                'gia_ban' => $nl->gia_ban,
                'so_luong' => $nl->so_luong,
            ];
        }
        return $result;
    }

    
    static function getGoiDV($userId) {
        $cards= Card::select(
            'card.id as card_id',
                'card.code as card_code',
                'card.product_id as product_id',
                'card.menh_gia_the as menh_gia_the',
                'card.so_luong as so_luong',
                'card.so_luong_da_su_dung as so_luong_da_su_dung',
                'card.so_luong_con_lai as so_luong_con_lai',
                'card.created_at as created_at',

                'products.name as product_name',
                'products.code as product_code',
                'products.gia_ban as gia_ban',
            )
            ->leftJoin('products', 'products.id', 'card.product_id')
            ->leftJoin('hoa_don_chi_tiet', 'hoa_don_chi_tiet.id', 'card.hoa_don_chi_tiet_id')
            ->where('card.users_id', $userId)
            ->where('card.card_group_id', config('constant.card_group.the_lieu_trinh')) // the vip:1 ; thẻ dv: 2
            ->orderBy('card.so_luong_con_lai', 'desc')
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

    static function getTheGT_byUser($userId) {
        $cards = Card::select(
            'card.id as card_id',
                'card.code as card_code',
                'card.product_id as product_id',
                'card.menh_gia_the as menh_gia_the',
                'card.so_luong as so_luong',
                'card.so_luong_con_lai as so_luong_con_lai',
                'card.created_at as created_at',
                'card.thanh_tien as thanh_tien',

                'products.name as product_name',
                'products.code as product_code',
                'products.gia_ban as gia_ban',
            )
            ->leftJoin('products', 'products.id', 'card.product_id')
            ->leftJoin('hoa_don_chi_tiet', 'hoa_don_chi_tiet.id', 'card.hoa_don_chi_tiet_id')
            ->where('card.users_id', $userId)
            ->where('card.card_group_id', config('constant.card_group.the_gia_tri')) // the vip:1 ; thẻ dv: 2
            ->orderBy('card.so_luong_con_lai', 'desc')
            ->get();
        return $cards;
    }

}

