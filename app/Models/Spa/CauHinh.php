<?php

namespace App\Models\Spa;

use Illuminate\Database\Eloquent\Model;

class CauHinh extends Model
{
    protected $table = 'spa_cau_hinh';
    public $timestamps = false;

    protected $fillable = [
        'key',
        'value',
        'mo_ta',
    ];

    protected $casts = [
        'value' => 'string',
    ];

    // Static helper methods
    public static function getValue($key, $default = null)
    {
        $config = self::where('key', $key)->first();
        return $config ? $config->value : $default;
    }

    public static function setValue($key, $value, $description = null)
    {
        return self::updateOrCreate(
            ['key' => $key],
            [
                'value' => $value,
                'mo_ta' => $description,
            ]
        );
    }

    public static function getPointsPerVND()
    {
        return (int) self::getValue('points_per_vnd', 10000); // Default: 1 point = 10,000 VND
    }

    public static function getVNDPerPoint()
    {
        return (int) self::getValue('vnd_per_point', 10000); // Default: 1 point = 10,000 VND
    }

    public static function getServiceCommissionPercent()
    {
        return (float) self::getValue('service_commission_percent', 20); // Default: 20%
    }

    public static function getProductCommissionPercent()
    {
        return (float) self::getValue('product_commission_percent', 10); // Default: 10%
    }

    public static function getSMSReminderHours()
    {
        return (int) self::getValue('sms_reminder_hours', 2); // Default: 2 hours before
    }
}
