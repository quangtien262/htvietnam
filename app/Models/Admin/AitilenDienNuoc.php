<?php

namespace App\Models\Admin;

use Illuminate\Database\Eloquent\Model;


class AitilenDienNuoc extends Model
{
    protected $table = 'aitilen_dien_nuoc';

    static function getMonthList()
    {
        return [
            1 => 'Tháng 1',
            2 => 'Tháng 2',
            3 => 'Tháng 3',
            4 => 'Tháng 4',
            5 => 'Tháng 5',
            6 => 'Tháng 6',
            7 => 'Tháng 7',
            8 => 'Tháng 8',
            9 => 'Tháng 9',
            10 => 'Tháng 10',
            11 => 'Tháng 11',
            12 => 'Tháng 12',
        ];
    }

    static function getDatas($searchData)
    {
        $datas = self::select('aitilen_dien_nuoc.*', 'aitilen_dien_nuoc.id as key')
            ->where('month', $searchData['month'])
            ->where('year', $searchData['year'])
            ->orderBy('id', 'desc');
        if (!empty($searchData['room'])) {
            $datas = $datas->where('room_id', $searchData['room']);
        }

        if (!empty($searchData['apm'])) {
            $datas = $datas->whereIn('apartment_id', $searchData['apm']);
        }

        $datas = $datas->where('is_recycle_bin', 0)->orderBy('id', 'desc')->paginate(25);

        return $datas;
    }
}
