<?php

namespace App\Services;

use App\Models\Web\WebConfig;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Route;
use App\Models\Web\Menu;
use App\Models\Web\News;
use App\Services\User\UserService;

class DataService
{

    /**
     * condition = ['column_name' => 'value']
     * orderBy = ['column_name' => 'desc/asc']
     * limit: 0: get all; 1: get first; >1: get by limit
     */
    public function getMenuByConditions($conditions = null, $orderBy = ['menus.sort_order' => 'asc'], $limit = 0)
    {
        $data = Menu::select(
            'menus.id as id',
            'menus.name as name',
            'menus.display_type as display_type',
            'menus_data.name_data as name_data',
            'menus_data.id as data_id',
        )
        ->leftJoin('menus_data', 'menus.id', '=', 'menus_data.data_id')
        ->where('menus_data.languages_id', UserService::getLang()->id)
        ->where('menus.is_active', 1)
        ->where('menus.is_recycle_bin', 0);

        if (!empty($conditions)) {
            foreach ($conditions as $key => $val) {
                $data = $data->where($key, $val);
            }
        }

        if (!empty($orderBy)) {
            foreach ($orderBy as $key => $val) {
                $data = $data->orderBy($key, $val);
            }
        }

        if ($limit == 0) {
            $data = $data->get();
        } else if ($limit == 1) {
            $data = $data->first();
        } else {
            $data = $data->paginate($limit);
        }

        return $data;
    }

    /**
     * condition = ['column_name' => 'value']
     * orderBy = ['column_name' => 'desc/asc']
     * limit: 0: get all; 1: get first; >1: get by limit
     */
    public function getNewsByConditions($conditions = null, $orderBy = ['id' => 'desc'], $limit = 0)
    {
        $data = News::query();

        if (!empty($conditions)) {
            foreach ($conditions as $key => $val) {
                $data = $data->where($key, $val);
            }
        }

        if (!empty($orderBy)) {
            foreach ($orderBy as $key => $val) {
                $data = $data->orderBy($key, $val);
            }
        }

        if ($limit == 0) {
            $data = $data->get();
        } else if ($limit == 1) {
            $data = $data->first();
        } else {
            $data = $data->limit($limit)->get();
        }

        return $data;
    }

    /**
     * condition = ['column_name' => 'value']
     * orderBy = ['column_name' => 'desc/asc']
     * limit: 0: get all; 1: get first; >1: get by limit
     */
    public function getNewsByMenu($menu, $limit = 0)
    {
        $data = News::query()->whereJsonContains('news.menu_id', $menu->id)->orderBy('news.create_date', 'desc');

        if ($limit == 0) {
            $data = $data->get();
        } else if ($limit == 1) {
            $data = $data->first();
        } else {
            $data = $data->paginate($limit);
        }

        return $data;
    }

}
