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

    static function baseQuery($showRecycle = false, $showDraft = false) {
        $data = self::select(
            'aitilen_invoice.*', 'aitilen_invoice.id as key',
            'users.name as ten_khach_hang',
            'users.code as ma_khach_hang',
            'users.phone as phone',
        )
        ->leftJoin('users', 'users.id', 'aitilen_invoice.user_id');

        // check thùng rác
        // if($showRecycle) {
        //     $data=$data->where('aitilen_invoice.is_recycle_bin', 1);
        // } else {
        //     $data=$data->where('aitilen_invoice.is_recycle_bin', '!=', 1);
        // }

        // check hóa đơn nháp
        if($showDraft) {
            $data=$data->where('aitilen_invoice.is_draft', 1);
        } else {
            $data=$data->where('aitilen_invoice.is_draft', 0);
        }
        $data = $data->orderBy('aitilen_invoice.created_at', 'asc');
        return $data;
    }
}
