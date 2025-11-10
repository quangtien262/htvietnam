<?php

namespace App\Models\Business;

use Illuminate\Database\Eloquent\Model;

class DoiThuCanhTranh extends Model
{
    protected $table = 'doi_thu_canh_tranh';
    protected $fillable = ['ten_doi_thu', 'website', 'linh_vuc', 'diem_manh', 'diem_yeu', 'chien_luoc_canh_tranh', 'bang_gia_tham_khao', 'ghi_chu'];
    protected $casts = ['bang_gia_tham_khao' => 'array'];
}
