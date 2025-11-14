<?php
namespace App\Models\Admin;

use App\Casts\Json;
use Illuminate\Database\Eloquent\Model;


class Contract extends Model
{

    protected $table = 'contract';

    protected $casts = [
        'services' => Json::class,
    ];

    static function baseQuery($showRecycle = false, $showDraft = false) {
        $data = self::select(
            'contract.*', 'contract.id as key'
        );

        // check thùng rác
        if($showRecycle) {
            $data=$data->where('contract.is_recycle_bin', 1);
        } else {
            $data=$data->where('contract.is_recycle_bin', '!=', 1);
        }

        // check hóa đơn nháp
        if($showDraft) {
            $data=$data->where('contract.is_draft', 1);
        } else {
            $data=$data->where('contract.is_draft', 0);
        }
        return $data;
    }

    static function getContract($dataFilter = []) {
        $datas = Contract::baseQuery();
        // filter
        if(!empty($dataFilter['keyword'])) {
            $keyword = $dataFilter['keyword'];
            $datas = $datas->where(function($query) use ($keyword) {
                $query->where('contract.name', 'like', '%'.$keyword.'%');
            });
        }
        if(!empty($dataFilter['contract'])) {
            $datas = $datas->where('contract.id', $dataFilter['contract']);
        }
        if(!empty($dataFilter['room'])) {
            $datas = $datas->where('contract.room_id', $dataFilter['room']);
        }
        if(!empty($dataFilter['apm'])) {
            $datas = $datas->whereIn('contract.apartment_id', $dataFilter['apm']);
        }
        if(!empty($dataFilter['end_date'])) {
            $datas = $datas->where('contract.end_date', 'like', '%'.$dataFilter['end_date'].'%');
        }

        if(!empty($dataFilter['status'])) {
            $datas = $datas->where('contract.contract_status_id', $dataFilter['status']);
        }

        $datas = $datas->orderBy('contract.id', 'desc')->paginate(20);
        return $datas;
    }

    static function baseQueryInfo() {
        $data = self::select(
            'contract.*',
            'room.name as room_name',
            'apartment.name as apartment_name',
            'contract_status.name as contract_status_name',
            'contract_status.color as contract_status_color'
        )
        ->leftJoin('room', 'room.id', 'contract.room_id')
        ->leftJoin('apartment', 'apartment.id', 'contract.apartment_id')
        ->leftJoin('contract_status', 'contract_status.id', 'contract.contract_status_id');

        return $data;
    }


}
