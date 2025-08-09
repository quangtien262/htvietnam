<?php

namespace App\Http\Controllers\User;

use Illuminate\Http\Request;
use App\Http\Controllers\Controller;

use App\Models\Web\BDS;
use App\Models\Web\Menu;
use App\Models\Web\News;
use App\Services\User\UserService;
use App\Models\Web\WebConfig;
use App\Models\Web\Orders;

class OrdersController extends Controller
{
    public function sendOrdersBDS(Request $request)
    {
        $data = $request->all();
        Orders::create($data['orders']);
        return ['success'];
    }
}

