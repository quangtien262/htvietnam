<?php
namespace App\Models\Admin;

use App\Casts\CastsUsers;
use App\Casts\CastsCardTL;
use App\Casts\CastsCardGT;
use App\Casts\CastsHoaDonChiTiet;
use App\Services\Admin\TblService;
use App\Services\Admin\UserService;
use Carbon\Carbon;
use Illuminate\Database\Eloquent\Model;


class HoaDon extends Model
{
    protected $table = 'hoa_don';

    static function baseQuery($showRecycle = false, $showDraft = false) {
        $data = self::select(
            'hoa_don.*', 'hoa_don.id as key',
            'users.name as ten_khach_hang',
            'users.code as ma_khach_hang',
            'users.phone as phone',
            'users.phone02 as phone02',
            'users.customer_group_id as customer_group_id',
            'users.tong_tien_da_nap as user__tong_tien_da_nap',
            'users.tien_con_lai as user__tien_con_lai',
            'users.tien_da_su_dung as user__tien_da_su_dung',
            'chi_nhanh.name as chi_nhanh',
            'admin_users.name as nguoi_tao',
        )
        ->leftJoin('users', 'users.id', 'hoa_don.users_id')
        ->leftJoin('admin_users', 'admin_users.id', 'hoa_don.create_by')
        ->leftJoin('chi_nhanh', 'chi_nhanh.id', 'hoa_don.chi_nhanh_id');

        // check thùng rác
        if($showRecycle) {
            $data=$data->where('hoa_don.is_recycle_bin', 1);
        } else {
            $data=$data->where('hoa_don.is_recycle_bin', '!=', 1);
        }

        // check hđơn nháp
        if($showDraft) {
            $data=$data->where('hoa_don.is_draft', 1);
        } else {
            $data=$data->where('hoa_don.is_draft', 0);
        }
        $data = $data->orderBy('hoa_don.created_at', 'asc');
        return $data;
    }

    static function getHoaDonChoThanhToan() {
        return self::baseQuery(false, true)->where('hoa_don.is_draft', 1)->get();
    }

    static function insertHoaDonChoThanhToan() {
        $date = date('d/m/Y H:i:s');
        $hoaDon = new self();
        $hoaDon->name = $date;
        $hoaDon->is_draft = 1;
        $hoaDon->is_recycle_bin = 0;
        $hoaDon->tien_tru_the = 0;
        $hoaDon->tien_trong_the = 0;
        $hoaDon->tien_con_lai = 0;
        $hoaDon->chi_nhanh_id = 0;
        $hoaDon->save();
        return $hoaDon;
    }

    static function search($request) {
        $data = self::baseQuery(false);

        // khoangThoiGian
        if(!empty($request->khoangThoiGian)) {
            $data = $data->whereBetween('hoa_don.created_at', [$request->khoangThoiGian[0] . ' 00:01:00', $request->khoangThoiGian[1] . ' 23:59:59',]);
        } else {
            $mocThoiGian = 'today';
            if(!empty($request->mocThoiGian)) {
                $mocThoiGian = $request->mocThoiGian;
            }
            $data = TblService::searchByDate($data, $mocThoiGian, 'hoa_don.created_at');
        }

        // hinh_thuc_thanh_toan
        if(!empty($request->hinh_thuc_thanh_toan_id) ) {
            $data = $data->whereIn('hinh_thuc_thanh_toan_id', $request->hinh_thuc_thanh_toan_id);
        }


        if (!empty($request['id'])) {
            $data = $data->where('id', $request->id);
        }

        if(!empty($request->sm_keyword) ) {
            $data = $data->where(function ($query) use($request) {
                $query->where('hoa_don.code', 'like', '%' . $request->sm_keyword . '%');
                $query->orWhere('users.name', 'like', '%' . $request->sm_keyword . '%');
            });
        }
        $status = 1;
        if(!empty($request->status) ) {
            $status = $request->status;
        }

        if(!empty($request->is_draft) ) {
             $data = $data->where('hoa_don.is_draft', 1);
        } else {
            $data = $data->where('hoa_don.is_draft', '!=', 1);
        }
        
        if(!empty($request->is_recycle_bin) ) {
            $data = $data->where('hoa_don.is_recycle_bin', 1);
        } else {
            $data = $data->where('hoa_don.is_recycle_bin', '!=', 1);
        }
        
        $data = $data->orderBy('hoa_don.id', 'desc');

        $data = $data->paginate(20);
        return $data;
    }

    static function info($id) {
        $hoaDon = HoaDon::find($id);
        $hoaDonChiTiet = HoaDonChiTiet::getByHoaDonId($id);

       
        // lich su thanh toan hdon nay
        $phieuThu = PhieuThu::select('phieu_thu.*', 'phieu_thu.id as key')
            ->where('loai_chung_tu','hoa_don')
            ->where('chung_tu_id', $id)->get();
       
        $khachHangData = [];
        if(!empty($hoaDon->users_id)) {
            $khachHangData = UserService::khachHangInfo($hoaDon->users_id);
        }
        
        
        return [
            'hoaDonChiTiet' => $hoaDonChiTiet,
            'khachHangData' => $khachHangData,
            'phieuThu' => $phieuThu,
        ];
    }
}
