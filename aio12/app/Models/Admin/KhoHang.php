<?php
namespace App\Models\Admin;

use App\Casts\Json;
use App\Services\Admin\TblService;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;

class KhoHang extends Model
{
    protected $table = 'kho_hang';

}
