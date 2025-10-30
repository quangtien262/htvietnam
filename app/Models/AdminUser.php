<?php

namespace App\Models;

use App\Casts\Json;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class AdminUser extends Authenticatable
{
    use HasFactory, Notifiable;

    protected $guard = 'admin_users';
    protected $table = 'admin_users';

    /**
     * The attributes that are mass assignable.
     *
     * @var array
     */
    protected $fillable = [
        'name', 'email', 'password', 'username',
    ];

    /**
     * The attributes that should be hidden for arrays.
     *
     * @var array
     */
    protected $hidden = [
        'password', 'remember_token',
    ];

    /**
     * The attributes that should be cast to native types.
     *
     * @var array
     */
    protected $casts = [
        'email_verified_at' => 'datetime',
        'thuong_setting' => Json::class,
        'hoa_hong_setting' => Json::class,
        'phu_cap_setting' => Json::class,
        'giam_tru_setting' => Json::class,
    ];

    static function getNhanVien($rq) {
        $users = AdminUser::select(
            'admin_users.*','admin_users.id as key',
            'gioi_tinh.name as gioi_tinh_name',
            'chi_nhanh.name as chi_nhanh_name',
            'permission_group.name as permission_group_name',
        )
        ->leftJoin('gioi_tinh', 'gioi_tinh.id', 'admin_users.gioi_tinh_id')
        ->leftJoin('chi_nhanh', 'chi_nhanh.id', 'admin_users.chi_nhanh_id')
        ->leftJoin('permission_group', 'permission_group.id', 'admin_users.permission_group_id');
        
        // keyword
        if(!empty($rq['keyword']) ) {
            $searchData['keyword'] = $rq['keyword'];
            $users = $users->where(function ($query) use($rq) {
                $query->where('admin_users.name', $rq['keyword']);
                $query->orWhere('admin_users.phone', 'like', '%' . $rq['keyword'] . '%');
                $query->orWhere('admin_users.cmnd', 'like', '%' . $rq['keyword'] . '%');
                $query->orWhere('admin_users.email', 'like', '%' . $rq['keyword'] . '%');
                $query->orWhere('admin_users.username', 'like', '%' . $rq['keyword'] . '%');
            });
        }
        
        //gioi_tinh_id
        if(!empty($rq->gioi_tinh_id)) {
            $users = $users->where('gioi_tinh_id', $rq->gioi_tinh_id);
        }
        //tinh_trang_hon_nhan_id
        if(!empty($rq->tinh_trang_hon_nhan_id)) {
            $users = $users->where('tinh_trang_hon_nhan_id', $rq->tinh_trang_hon_nhan_id);
        }
        // chi_nhanh_id
        if(!empty($rq->chi_nhanh_id)) {
            $users = $users->where('chi_nhanh_id', $rq->chi_nhanh_id);
        }
        // chuc_vu_id
        if(!empty($rq->chuc_vu_id)) {
            $users = $users->where('chuc_vu_id', $rq->chuc_vu_id);
        }
        if(!empty($rq->admin_user_status_id)) {
            $users = $users->where('admin_user_status_id', $rq->admin_user_status_id);
        } else {
            $users = $users->where('admin_user_status_id', 1);
        }

        

        $users = $users->paginate(20);

        return $users;
    }
}
