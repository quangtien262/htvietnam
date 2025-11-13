<?php

namespace App\Models\Admin;

use App\Casts\Json;
use Illuminate\Database\Eloquent\Model;


class AitilenInvoice extends Model
{
    protected $table = 'aitilen_invoice';
    protected $casts = [
        'services' => Json::class,
    ];

    static function baseQuery($showRecycle = false, $showDraft = false)
    {
        $data = self::select(
            'aitilen_invoice.*',
            'aitilen_invoice.id as key',
            'users.name as ten_khach_hang',
            'users.code as ma_khach_hang',
            'users.phone as phone',
            'contract.name as hop_dong_name',
            'contract.code as contract_code',
            'room.name as ten_phong',
        )
            ->leftJoin('contract', 'contract.id', 'aitilen_invoice.contract_id')
            ->leftJoin('users', 'users.id', 'aitilen_invoice.user_id')
            ->leftJoin('room', 'room.id', 'aitilen_invoice.room_id');

        // check thùng rác
        if ($showRecycle) {
            $data = $data->where('aitilen_invoice.is_recycle_bin', 1);
        } else {
            $data = $data->where('aitilen_invoice.is_recycle_bin', '!=', 1);
        }

        // check hóa đơn nháp
        if ($showDraft) {
            $data = $data->where('aitilen_invoice.is_draft', 1);
        } else {
            $data = $data->where('aitilen_invoice.is_draft', 0);
        }
        $data = $data->orderBy('aitilen_invoice.created_at', 'asc');
        return $data;
    }

    static function getInvoice($dataFilter = [])
    {
        // dd($dataFilter);
        $datas = AitilenInvoice::baseQuery();
        // filter
        if (!empty($dataFilter['keyword'])) {
            $keyword = $dataFilter['keyword'];
            $datas = $datas->where(function ($query) use ($keyword) {
                $query->where('aitilen_invoice.name', 'like', '%' . $keyword . '%')
                    ->orWhere('users.name', 'like', '%' . $keyword . '%')
                    ->orWhere('users.code', 'like', '%' . $keyword . '%')
                    ->orWhere('users.phone', 'like', '%' . $keyword . '%');
            });
        }
        if (!empty($dataFilter['contract_id'])) {
            $datas = $datas->where('aitilen_invoice.contract_id', $dataFilter['contract']);
        }
        if (!empty($dataFilter['room_id'])) {
            $datas = $datas->where('aitilen_invoice.room_id', $dataFilter['room']);
        }
        if (!empty($dataFilter['status'])) {
            $datas = $datas->where('aitilen_invoice.aitilen_invoice_status_id', $dataFilter['status']);
        }
        if (!empty($dataFilter['apartment_ids'])) {
            $datas = $datas->whereIn('aitilen_invoice.apartment_id', $dataFilter['apartment_ids']);
        }

        if (!empty($dataFilter['month'])) {
            $datas = $datas->where('aitilen_invoice.month', '>=', $dataFilter['month']);
        }
        if (!empty($dataFilter['year'])) {
            $datas = $datas->where('aitilen_invoice.year', '>=', $dataFilter['year']);
        }

        if (isset($dataFilter['active'])) {
            $datas = $datas->where('aitilen_invoice.is_active', $dataFilter['active']);
        }

        if(!empty($dataFilter['sort_by'])) {
            if($dataFilter['sort_by'] == 'user_name') {
                $datas = $datas->orderBy('users.name', 'asc');
            } elseif($dataFilter['sort_by'] == 'total_asc') {
                $datas = $datas->orderBy('aitilen_invoice.total', 'asc');
            } elseif($dataFilter['sort_by'] == 'total_desc') {
                $datas = $datas->orderBy('aitilen_invoice.total', 'desc');
            } elseif($dataFilter['sort_by'] == 'room') {
                $datas = $datas->orderBy('room.name', 'asc');
            }
        }

        if (!empty($dataFilter['count'])) {
            $datas = $datas->paginate($dataFilter['count']);
        } else {
            $datas = $datas->paginate(25);
        }
        // dd($datas);
        return $datas;
    }
}
