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
        'api_token'
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
