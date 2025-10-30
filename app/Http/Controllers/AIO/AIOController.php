<?php

namespace App\Http\Controllers\AIO;

use App\Models\Admin\ChiNhanh;
use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Http\Controllers\Controller;
use App\Models\Admin\AdminMenu;
use App\Models\Admin\Column;
use App\Models\Admin\Log;
use App\Models\Admin\Product;
use App\Models\Admin\Table;
use App\Models\AdminUser;
use App\Services\Admin\TblService;
use App\Services\AnalyticService;
use Illuminate\Support\Facades\DB;

class AIOController extends Controller
{

    public function dashboard()
    {
        $param = [
            //
        ];
        return View('AIO.pages.dashboard', $param);
    }
}
