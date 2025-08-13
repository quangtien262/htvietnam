<?php

namespace App\Services;

use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Request;

class AnalyticService
{
    protected static $file = 'storage/app/view_stats.json';
    protected static $file_IP = 'storage/app/view_stats_ip.json';

    // Lấy toàn bộ dữ liệu view
    public static function getAll()
    {
        $data = self::readFileViewStats();
        $viewStats = [];
        foreach ($data as $date => $view) {
            $viewStats[] = [
                'date' => $date,
                'view' => $view,
            ];
        }

        return $viewStats;
    }

    public static function readFileViewStats()
    {
        if (!File::exists(base_path(self::$file))) {
            return [];
        }
        $json = File::get(base_path(self::$file));
        return json_decode($json, true) ?? [];
    }


    // Ghi lượt view cho ngày hiện tại
    public static function addView()
    {
        $date = date('Y-m-d');
        $data = self::readFileViewStats();

        if (isset($data[$date])) {
            $data[$date]++;
        } else {
            $data[$date] = 1;
        }

        File::put(base_path(self::$file), json_encode($data, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));
    }

    // Lấy lượt view của một ngày
    public static function getByDate($date)
    {
        $data = self::readFileViewStats();
        return $data[$date] ?? 0;
    }

    // Ghi lượt truy cập theo IP cho ngày hiện tại
    public static function addViewByIp()
    {
        $date = date('Y-m-d');
        $ip = Request::ip();
        $data = self::getAllByIp();

        if (!isset($data[$date])) {
            $data[$date] = [];
        }
        if (isset($data[$date][$ip])) {
            $data[$date][$ip]++;
        } else {
            $data[$date][$ip] = 1;
        }

        File::put(base_path(self::$file_IP), json_encode($data, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));
    }

     // Lấy toàn bộ dữ liệu view theo IP
    public static function readFileViewStatsIP()
    {
        $file = base_path('storage/app/view_stats_ip.json');
        if (!File::exists($file)) {
            return [];
        }
        $json = File::get($file);
        return json_decode($json, true) ?? [];
    }

    // Lấy toàn bộ dữ liệu view theo IP
    public static function getAllByIp()
    {
        $data = self::readFileViewStatsIP();
        if (empty($data)) {
            return [];
        }
        $viewStatsIp = [];
        foreach ($data as $date => $ips) {
            foreach ($ips as $ip => $view) {
                $viewStatsIp[] = [
                    'date' => $date,
                    'ip' => $ip,
                    'view' => $view,
                ];
            }
        }
        return $viewStatsIp;
    }

    // Lấy lượt truy cập của một IP trong ngày
    public static function getByIp($ip, $date = null)
    {
        $date = $date ?? date('Y-m-d');
        $data = self::readFileViewStatsIP();
        return $data[$date][$ip] ?? 0;
    }
}
