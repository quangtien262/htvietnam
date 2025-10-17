<?php

namespace App\Http\Controllers\Admin;

use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Http\Controllers\Controller;
use App\Models\Admin\Table;
use App\Models\Web\ListLandingpage;
use App\Models\Web\Landingpage;
use Illuminate\Support\Facades\DB;
use App\Models\Web\WebConfig;
use App\Models\Web\Menu;
use App\Services\Admin\TblService;
use App\Services\User\UserService;

class LandingPageController extends Controller
{
    public function index(Request $request)
    {
        $landingpages = Menu::where('is_active', 1)
            ->where('is_recycle_bin', 0)
            ->whereIn('display_type', ['landingpage', 'home'])
            ->orderBy('sort_order', 'asc')
            ->get();
        $props = [
            'landingpages' => $landingpages,
            'menus' => TblService::getMenus($request->p),
            'p' => $request->p
        ];
        return Inertia::render('Admin/Landingpage/index', $props);
    }

    public function setting(Request $request, $menuId = 0)
    {
        $menu = Menu::where('is_active', 1)
            ->where('is_recycle_bin', 0)
            ->whereIn('display_type', ['landingpage', 'home'])
            ->orderBy('sort_order', 'asc')
            ->find($menuId);
        $link = app('Helper')->getLinkMenu($menu) . '?mod=admin';
        $props = [
            'menu' => $menu,
            'link' => $link,
            'menus' => TblService::getMenus($request->p),
            'p' => $request->p
        ];
        return Inertia::render('Admin/Landingpage/setting', $props);
    }
}
