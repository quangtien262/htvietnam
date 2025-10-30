<?php
namespace App\Models\Admin;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use App\Casts\Json;
use App\Casts\ParentID;

class FileManager extends Model
{
    use HasFactory;
    protected $table = 'file_manager';
    
    /**
     * The attributes that should be cast.
     *
     * @var array
     */
    protected $casts = [
        'share' =>  Json::class,
    ];

    static function query()
    {
        return FileManager::select(
            'file_manager.parent_id as parent_id', 
            'file_manager.parent_id as parent_info', 
            'file_manager.*', 
            'admin_users.name as full_name', 
            'admin_users.code as admin_user_code'
        )
        ->leftJoin('admin_users', 'file_manager.create_by', 'admin_users.id');
    }

}
