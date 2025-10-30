<?php

namespace App\Casts;

use Illuminate\Contracts\Database\Eloquent\CastsAttributes;
use App\Models\User;
use Illuminate\Support\Facades\DB;

class CastsCardTL implements CastsAttributes
{
    /**
     * Cast the given value.
     *
     * @param  \Illuminate\Database\Eloquent\Model  $model
     * @param  string  $key
     * @param  mixed  $value
     * @param  array  $attributes
     * @return array
     */
    public function get($model, $key, $value, $attributes)
    {
        if(empty($value)) {
            return [
                'id' => $value,
            ];
        }

        $card = DB::table('card')->find( $value);
        // echo $value;
        // dd($card);
        if(empty($card)) {
            return [
                'id' => $value,
            ];
        }

        $cardService = DB::table('card_service')->where('data_id', $value)->get();

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
        $cardHistory = DB::table('card_history')->where('card_id', $value)->get();

        foreach ($cardHistory as $his) {
            $suDung += intval($his->so_luong) + intval($his->so_luong_duoc_tang); 
            $soluongDuocTang += intval($his->so_luong_duoc_tang); 
        }
        // còn lại
        $conLai = $total - $suDung;

        return [
            'id' => $card->id,
            'code' => $card->code,
            'total' => $total,
            'totalDuocTang' => $totalDuocTang,
            'suDung' => $suDung,
            'conlai' => $conLai,
        ];
    }

    /**
     * Prepare the given value for storage.
     *
     * @param  \Illuminate\Database\Eloquent\Model  $model
     * @param  string  $key
     * @param  array  $value
     * @param  array  $attributes
     * @return string
     */
    public function set($model, $key, $value, $attributes)
    {
        return $value;
    }
}
