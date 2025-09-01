<?php

namespace App\Http\Controllers;

use Illuminate\Support\Facades\App;

abstract class Controller
{

    function __construct()
    {
        // if (empty(session()->get('locale'))) {
        //     App::setLocale(config('app.locale'));
        //     session()->put('locale', config('app.locale'));
        // } else {
        //     App::setLocales(session()->get('locale'));
        //     session()->put('locale', session()->get('locale'));
        // }
    }

    protected function sendErrorResponse($message, $errors = null, $code = 400)
    {
        return response()->json([
            'status_code' => $code,
            'message' => $message,
            'errors' => $errors,
        ]);
    }

    protected function sendSuccessResponse($data, $message = '', $code = 200)
    {
        return response()->json([
            'status_code' => $code,
            'message' => $message,
            'data' => $data,
        ]);
    }

    protected function getLocation($data = null, $message = '', $code = 200)
    {
        $ip = request()->ip(); // Lấy IP user
        $response = @file_get_contents("http://ip-api.com/json/{$ip}?fields=status,country,regionName,city,query");
        $location = $response ? json_decode($response, true) : null;
        return [
            'ip' => $ip,
            'location' => $location,
        ];
    }
}
