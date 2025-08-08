<?php

namespace App\Casts;

use Illuminate\Contracts\Database\Eloquent\CastsAttributes;
use App\Models\User;
use Illuminate\Support\Facades\DB;

class CastsCardGT implements CastsAttributes
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
                'id' => 0,
            ];
        }

        $card = DB::table('card')->find($value);
        // dd($card);
        if(empty($card)) {
            return [
                'id' => 0,
            ];
        }
        
        // tổng số tiền
        $total = intval($card->menh_gia_the) + intval($card->tien_tang_them);
        $tanggiaTriThe = DB::table('tang_gia_tri_the')->where('card_id', $card->id)->get();
        // dd($tanggiaTriThe);
        foreach($tanggiaTriThe as $gt) {
            $total = $total + $gt->DonGia + $gt->TienTangThem;
        }

        //đã xử dung
        $xuDung = 0;
        $historys = DB::table('card_history')->where('card_id', $card->id)->get();
        foreach($historys as $h) {
            $xuDung += intval($h->price);
        }
        //còn lại
        $conlai = $total - $xuDung;
        return [
            'id' => $card->id,
            'code' => $value,
            'total' => $total,
            'suDung' => $xuDung,
            'conlai' => $conlai,
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
