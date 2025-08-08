<?php

namespace App\Services\User;

use Illuminate\Support\Facades\DB;
use App\Services\Service;

use App\Models\Web\BDS;
use App\Models\Web\KhoangGia;
use App\Models\Web\DienTich;

/**
 * Class CompanyService
 * @package App\Services\Users
 */
class BDSService extends Service
{
    static function search($req) {
        $bds = new BDS();

        // Loai bds
        if(!empty($req->bds_type)) {
            $bds = $bds->whereIn('bds_type_id', $req->bds_type);
        }

        // menu
        if(!empty($req->bds)) {
            $bds = $bds->whereIn('menu_id', $req->bds);
        }

        // tỉnh thành
        if(!empty($req->tinh_thanh)) {
            $bds = $bds->whereIn('province_id', $req->tinh_thanh);
        }

        // khoảng giá
        if(!empty($req->khoang_gia)) {
            $khoangGia = KhoangGia::whereIn('id', $req->khoang_gia)->get();
            if (count($khoangGia) > 0) {
                $bds = $bds->where(function ($query) use ($khoangGia) {
                    foreach ($khoangGia as $idx => $gia) {
                        if ($idx == 0) {
                            $query->whereBetween('price', [$gia->start, $gia->end]);
                        } else {
                            $query->orWhereBetween('price', [$gia->start, $gia->end]);
                        }
                    }
                });
            }
        }

        // khoảng diện tích
        if (!empty($req->dien_tich)) {
            $dienTich = DienTich::whereIn('id', $req->dien_tich)->get();
            if (count($dienTich) > 0) {
                $bds = $bds->where(function ($query) use ($dienTich) {
                    foreach ($dienTich as $idx => $gia) {
                        if ($idx == 0) {
                            $query->whereBetween('dien_tich', [$gia->start, $gia->end]);
                        } else {
                            $query->orWhereBetween('dien_tich', [$gia->start, $gia->end]);
                        }
                    }
                });
            }
        }

        //keyword
        if(!empty($req->keyword)) {
            $bds = $bds->where('name', 'like', '%'.$req->keyword.'%');
        }

        // get data
        $bds = $bds->orderBy('id', 'desc')->paginate(40);

        return $bds;
    }

}
