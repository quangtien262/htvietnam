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


class Apartment extends Model
{
    protected $table = 'apartment';

}
