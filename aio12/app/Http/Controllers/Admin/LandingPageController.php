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
use App\Services\User\UserService;

class LandingPageController extends Controller
{

    /**
     * Display a listing of the resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function formBasic(Request $request, $id)
    {
        if (empty($request->block) || empty($request->col)) {
            return 'Block này đã bị xóa, vui lòng tải lại trình duyệt để cập nhật lại nội dung mới nhất';
        }
        $col = explode('-', $request->col);
        $blockName = $request->block;
        $landingpage = Landingpage::find($id);
        $block = $this->getBlockConfig()::CONFIG[$blockName];
        return View('admin.landingpage.form_basic', compact('block', 'landingpage', 'id', 'blockName', 'col'));
    }

    public function update(Request $request)
    {
        $block = $this->getBlockConfig()::CONFIG[$request->block_name];
        $post = $request->all();
        $data = [];
        if (isset($post['data'])) {
            $data = $post['data'];
        }

        if (empty($data['is_show_btn_register'])) {
            $data['is_show_btn_register'] = 0;
        }
        if (empty($data['is_show_hotline'])) {
            $data['is_show_hotline'] = 0;
        }
        if (empty($data['images'])) {
            $data['images'] = [];
        }
        $json = ['description_json01', 'description_json02', 'description_json03', 'description_json04'];
        foreach ($post as $key => $val) {
            if (in_array($key, ['data', 'id', 'block_name', 'hiden'])) {
                continue;
            }
            if (in_array($key, $json)) {
                $setting = [];
                for ($i = 0; $i < 15; $i++) {
                    $tmp = [];
                    $isAdd = false;
                    foreach ($block[$key]['setting'] as $k => $v) {
                        // upload file
                        if ($k == 'image') {
                            if (!empty($val[$k][$i])) {
                                $image = $val[$k][$i];
                                // $fileName = time() . '.' . $image->extension();
                                $fileName = app('Helper')->generateRandomString(6) .'_'. time() . '.' . $image->extension();
                                $image->move(public_path('files/landingpage'), $fileName);
                                $tmp[$k] = "/files/landingpage/" . $fileName;
                                $isAdd = true;
                                continue;
                            }
                            if (!empty($post['hiden'][$key]['image'][$i])) {
                                $tmp[$k] = $post['hiden'][$key]['image'][$i];
                                $isAdd = true;
                            }
                            continue;
                        }

                        $tmp[$k] = $val[$k][$i];
                        if (!empty($val[$k][$i])) {
                            $isAdd = true;
                        }
                    }
                    if ($isAdd) {
                        $setting[] = $tmp;
                    }
                }
                if (!empty($setting)) {
                    $data[$key] = $setting;
                }
            }
        }

        if (!empty($request->img)) {
            foreach ($request->img as $colName => $image) {
                $fileName = time() . '.' . $image->extension();

                $type = $image->getClientMimeType();
                $size = $image->getSize();
                $image->move(public_path('files/landingpage'), $fileName);
                $data[$colName] = "/files/landingpage/" . $fileName;
            }
        }

        if (!empty($request->images_file)) {
            $imgs = [];
            foreach ($request->images_file as $image) {
                $fileName = app('Helper')->generateRandomString(5) . '_' . time() . '.' . $image->extension();
                $image->move(public_path('files/landingpage'), $fileName);
                $data['images'][] = "/files/landingpage/" . $fileName;
            }
        }


        Landingpage::where('id', $request->id)->update($data);
        $land = Landingpage::find($request->id);
        if ($land->menu_id == 0) {
            return redirect('/#' . app('Helper')->generateLandingpageId($land));
        }

        $menu = Menu::find($land->menu_id);
        $link = app('Helper')->getLinkMenu($menu) . '/#' . app('Helper')->generateLandingpageId($land);
        return redirect($link);
    }

    public function sortOrder(Request $request, $menuId = 0)
    {
        $htmlListDragDrop = $this->getHtmlListDragDrop($menuId);
        return View('admin.landingpage.sort_order', compact('htmlListDragDrop'));
    }

    public function updateSortOrder(Request $request, $menuId = 0)
    {
        if (empty($request->data)) {
            return $this->sendSuccessResponse('', config('constants.return.success'));
        }
        $sortOrder = json_decode($request->data, true);
        $result = $this->updateSortOrderTable('landingpage', $sortOrder, $menuId);
        if ($result) {
            return $this->sendSuccessResponse($result, $message = 'successfully');
        }
        return $this->sendErrorResponse($result, $message = 'Error');
    }

    public function listLandingpageDefault(Request $request, $menuId = 0)
    {
        $list = ListLandingpage::orderBy('sort_order', 'asc')->get();
        return View('admin.landingpage.list', compact('list', 'menuId'));
    }

    public function createLandingpage(Request $request)
    {
        $land = ListLandingpage::find($request->id);
        $block = $this->getBlockConfig();
        $block->{$land->name}(0, $request->menu_id);
        return $this->sendSuccessResponse([], $message = 'successfully');
    }

    public function activeLand(Request $request)
    {
        if (empty($request->id)) {
            return $this->sendErrorResponse('error');
        }
        $land = Landingpage::find($request->id);
        $land->active = $request->active;
        $land->save();
        return $this->sendSuccessResponse([], $message = 'successfully');
    }

    public function showInMenu(Request $request)
    {
        if (empty($request->id)) {
            return $this->sendErrorResponse('error');
        }
        $land = Landingpage::find($request->id);
        $land->is_menu = $request->is_menu;
        $land->save();
        return $this->sendSuccessResponse([], $message = 'successfully');
    }

    public function delete(Request $request)
    {
        if (empty($request->id)) {
            return $this->sendErrorResponse('error');
        }
        $land = Landingpage::find($request->id);
        $land->delete();
        return $this->sendSuccessResponse([], $message = 'successfully');
    }

    private function updateSortOrderTable($tableName, $sortOrder, $menuId = 0)
    {
        try {
            DB::beginTransaction();
            foreach ($sortOrder as $key => $value) {
                $idx = $key + 1;
                DB::table($tableName)->where('id', $value['id'])->update(['sort_order' => $idx]);
                if (isset($value['children'])) {
                    $this->updateSortOrderTable($tableName, $value['children'], $menuId);
                }
            }
            DB::commit();
            return true;
        } catch (\Throwable $th) {
            DB::rollBack();
            return false;
        }
    }

    private function getHtmlListDragDrop($menuId)
    {
        $html = '';
        $langId = UserService::getLang();
        $tableData = Landingpage::where('language_id', $langId)->where('menu_id', $menuId)->OrderBy('sort_order', 'asc')->get();
        if (!empty($tableData)) {
            $html = '<ol class="dd-list">';
            foreach ($tableData as $td) {
                $checked = '';
                if (empty($td->active)) {
                    $checked = 'checked';
                }

                $html .= '<li id="main-block-dad-' . $td->id . '" class="dd-item" data-id="' . $td->id . '">
                            <div class="card b0 dd-handle">
                                <div class="mda-list">
                                    <div class="mda-list-item">
                                        <div class="mda-list-item-icon item-grab" style="padding-top: 9px;">
                                            <em class="ion-drag icon-lg"></em>
                                        </div>
                                        <div class="mda-list-item-text mda-2-line">
                                            <h3><b class="type-block">' . $td->type . '</b><br/>' . $td->name . '</h3>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div class="option-dd">
                                <input ' . $checked . ' onchange="hideLand(this,' . $td->id . ')" id="hide_' . $td->id . '" type="checkbox" name="hide[]" value="' . $td->id . '"/>
                                <label class"label_hide" for="hide_' . $td->id . '">' . __('land.hidden_block') . '</label>

                                <input ' . $checked . ' onchange="showInMenu(this,' . $td->id . ')" id="show-in-menu_' . $td->id . '" type="checkbox" name="show_in_menu[]" value="' . $td->id . '"/>
                                <label class"label_hide" for="hide_' . $td->id . '">' . __('land.show_in_menu') . '</label>

                                <a class="delete-land" onclick="deleteConfirm(\'#delete-confirm-' . $td->id . '\')" >
                                   <b> <i class="ion-trash-a"></i> ' . __('land.removed') . '</b>
                                </a>
                            </div>
                            <div id="delete-confirm-' . $td->id . '" class="land-confirm-delete _hidden">
                                <a class="confirm-delete-land">
                                ' . __('land.you_delete') . '
                                    &nbsp;
                                    <b class="land-btn-delete" onclick="deletedLand(' . $td->id . ')"><i class="ion-checkmark-round"></i>' . __('land.removed') . '</b>
                                    &nbsp;
                                    <b onclick="cancelDeleteLand(\'#delete-confirm-' . $td->id . '\')"" class="land-btn-cancel-delete"><i class="ion-close-circled"></i> ' . __('land.cancel') . '</b>
                                    &nbsp;
                                </a>
                            </div>
                            ';
                // check sub data
                // $subData = DB::table($table->name)->where('parent_id', $td->id)->count();
                // if ($subData > 0) {
                //     $html .= self::getHtmlListDragDrop($table, $td->id);
                // }
                $html .= '</li>';
            }
            $html .= '</ol>';
        }

        return $html;
    }


    private function getBlockConfig()
    {
        $config = WebConfig::query()->find(1);
        $class = 'App\Services\LandingpageData\Layout' . $config->layout;
        return new $class();
    }
}
