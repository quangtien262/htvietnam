<?php

namespace App\Services\User;

use Illuminate\Support\Facades\DB;
use App\Services\Service;

use App\Models\Web\Menu;
use App\Models\Web\BDS;
use App\Models\Web\News;
use App\Models\Web\WebConfig;

/**
 * Class CompanyService
 * @package App\Services\Users
 */
class NewsService extends Service
{
    static function search($request) {
        $news = News::query();
        if(!empty($request->keywords)) {
            $news = $news->where('news.name', 'like', '%'.$request->keywords.'%');
        }
        
        if(!empty($request->menu)) {
            $menu = Menu::find($request->menu);
            $subs = [$menu->id];
            if(!empty($menu)) {
                $subMenu = Menu::where('parent_id', $menu->id)->get();
                foreach($subMenu as $m) {
                    $subs[] = $m->id;
                 }
            }
            // dd($subs);
            $news = $news->when($subs , function($query) use ($subs) {
                $query->where(function ($query) use ($subs) {
                    foreach($subs as $sub) {
                        $query->orWhereJsonContains('news.menu_id', $sub);
                    }
                });
            });
        }

        $news = $news->orderBy('news.id', 'desc')->paginate(config('constant.item_of_pages'));

        return $news;
    }
    static function getDataIndex($request, $menuId)
    {
        //config
        $dataView = [
            'config' => WebConfig::find(1),
            'bds' => News::where('menu_id', $menuId)->orderBy('id', 'asc')->paginate(config('constant.paginate'))
        ];

        // check layout
        $layout = $dataView['config']->layout;
        switch ($layout) {
            case 'layout02':

                break;
            case 'layout01':

                break;
            default:
                # code...
                break;
        }

        return $dataView;
    }

    static function getDataDetail($request, $bdsId)
    {
        //config
        $dataView = [
            'config' => WebConfig::find(1),
            'bds' => News::find($bdsId)
        ];

        // check layout
        $layout = $dataView['config']->layout;
        switch ($layout) {
            case 'layout01':

                break;
            default:
                # code...
                break;
        }

        return $dataView;
    }


}
