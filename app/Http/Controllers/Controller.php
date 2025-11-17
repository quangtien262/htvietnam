<?php

namespace App\Http\Controllers;

use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Support\Facades\App;

abstract class Controller
{
    use AuthorizesRequests;

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

    protected function sendErrorResponse($message, $code = 400, $errors = [])
    {
        return response()->json([
            'success' => false,
            'status_code' => $code,
            'message' => $message,
            'errors' => $errors,
        ]);
    }

    protected function sendSuccessResponse($data, $message = '', $code = 200)
    {
        return response()->json([
            'success' => true,
            'status_code' => $code,
            'message' => $message,
            'data' => $data,
        ]);
    }

}
