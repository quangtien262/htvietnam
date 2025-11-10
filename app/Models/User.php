<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

class User extends Authenticatable
{
    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasFactory, Notifiable;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'email',
        'password',
        'username',
        'image',
        'user_type',
        'cmtnd',
        'dob',
        'noi_cap',
        'phone',
        'hktt',
        'full_name',
        'api_token',
        // Sales fields
        'ma_khach_hang',
        'role',
        'tinh_thanh',
        'quan_huyen',
        'xa_phuong',
        'loai_khach_hang',
        'ma_so_thue',
        'nhom_khach_hang',
        'nhan_vien_phu_trach_id',
        'han_muc_no',
        'tong_mua',
        'cong_no_hien_tai',
        'diem_tich_luy',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
        ];
    }

    // Auto-generate mã khách hàng
    protected static function boot()
    {
        parent::boot();

        static::creating(function ($user) {
            if (empty($user->ma_khach_hang) && $user->role === 'khach_hang') {
                $user->ma_khach_hang = self::generateMaKhachHang();
            }
        });
    }

    public static function generateMaKhachHang()
    {
        $lastKhachHang = self::where('role', 'khach_hang')
            ->whereNotNull('ma_khach_hang')
            ->orderBy('id', 'desc')
            ->first();

        if (!$lastKhachHang) {
            return 'KH0001';
        }

        $lastNumber = (int) substr($lastKhachHang->ma_khach_hang, 2);
        $newNumber = str_pad($lastNumber + 1, 4, '0', STR_PAD_LEFT);

        return 'KH' . $newNumber;
    }

    // Relationships for Sales module
    public function donHangs()
    {
        return $this->hasMany(\App\Models\Sales\DonHang::class, 'user_id');
    }

    public function phieuThus()
    {
        return $this->hasMany(\App\Models\Sales\PhieuThu::class, 'user_id');
    }

    public function phieuTraHangs()
    {
        return $this->hasMany(\App\Models\Sales\PhieuTraHang::class, 'user_id');
    }

    public function nhanVienPhuTrach()
    {
        return $this->belongsTo(\App\Models\AdminUser::class, 'nhan_vien_phu_trach_id');
    }

    // Scopes for Sales
    public function scopeKhachHang($query)
    {
        return $query->where('role', 'khach_hang');
    }

    public function scopeActive($query)
    {
        return $query->where('customer_status_id', 1);
    }

    public function scopeVip($query)
    {
        return $query->where('nhom_khach_hang', 'vip');
    }

    public function scopeCoNo($query)
    {
        return $query->where('cong_no_hien_tai', '>', 0);
    }

    static function baseQuery() {
        $users = self::select(
            'users.*',
            'users.id as key',
            'customer_group.name as customer_group_name',
        )
            ->leftJoin('customer_group', 'customer_group.id', 'users.customer_group_id');
        return $users;
    }

    static function getUsers($request)
    {
        $users = self::baseQuery();
        if (!empty($request->keyword)) {
            $users = $users->where('users.name', 'like', '%' . $request->keyword . '%');
        }
        if (!empty($request->customer_group_id)) {
            $users = $users->where('users.customer_group_id', $request->customer_group_id);
        }
        if (!empty($request->gioi_tinh_id)) {
            $users = $users->where('users.gioi_tinh_id', $request->gioi_tinh_id);
        }

        if (isset($request->customer_status_id)) {
            $users = $users->where('users.customer_status_id', $request->customer_status_id);
        }
        $users = $users->orderBy('users.id','desc')->paginate(20);
        return $users;
    }
}
