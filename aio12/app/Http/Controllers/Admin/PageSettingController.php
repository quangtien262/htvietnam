<?php

namespace App\Http\Controllers\Admin;

use App\Models\Admin\Language;
use App\Services\Admin\TblModel;
use App\Services\LandingpageData\Layout01;
use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Http\Controllers\Controller;
use App\Models\Admin\Table;
use App\Models\Web\ListLandingpage;
use App\Models\Web\Landingpage;
use Illuminate\Support\Facades\DB;
use App\Models\Web\WebConfig;
use App\Models\Web\Menu;
use App\Models\Web\PageSetting;
use App\Services\User\UserService;

class PageSettingController extends Controller
{
    public function sortOrder(Request $request, $menuId = 0)
    {
        $htmlListDragDrop = $this->getHtmlPageSettingDragDrop($menuId);
        return View('admin.page_setting.sort_order', compact('htmlListDragDrop', 'menuId'));
    }

    public function updateSortOrder(Request $request, $menuId = 0)
    {
        if (empty($request->data)) {
            return $this->sendErrorResponse('', 'Error');
        }
        $sortOrder = json_decode($request->data, true);
        $result = $this->updateSortOrderPageSetting('page_setting', $sortOrder, $menuId);
        if ($result) {
            return $this->sendSuccessResponse($result, 'successfully');
        }
        return $this->sendErrorResponse($result, 'Error');
    }

    public function listLandingpageDefault(Request $request, $menuId = 0)
    {
        $list = ListLandingpage::orderBy('sort_order', 'asc')->get();
        return View('admin.page_setting.list', compact('list', 'menuId'));
    }

    public function createLandingpage(Request $request, $menuId = 0)
    {
        // ListLandingpage: là bảng lưu danh sách các block đã được config sẵn
        $land = ListLandingpage::find($request->list_land_id);
        $block = $this->getBlockModel();
        $block->{$land->name}($request->menu_id, $menuId);
        
        // get data drag and drop
        $htmlListDragDrop = $this->getHtmlPageSettingDragDrop($menuId);
        return $this->sendSuccessResponse([], 'successfully');
        // return View('admin.page_setting.sort_order', compact('htmlListDragDrop'));
        // return $this->sendSuccessResponse([], $message = 'successfully');
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

    public function editPageSetting(Request $request, $tblName, $id = 0)
    {
        $languages = Language::orderBy('sort_order', 'asc')->get();
        $data = TblModel::find($tblName, $id);
        $languagesData = [];
        foreach ($languages as $language) {
            $languagesData[$language->id] = DB::table('page_setting_data')
                ->where('data_id', $id)
                ->where('languages_id', $language->id)
                ->first();
        }
        $config = Layout01::getConfig($data->block_type);
        $data = [
            'data' => $data,
            'id' => $id,
            'request' => $request->all(),
            'languages' => $languages,
            'languagesData' => $languagesData,
            'tblName' => $tblName,
            'config' => $config['page']
        ];
        return View('admin.page_setting.edit_page_setting', $data);
    }

    public function saveData(Request $request, $id = 0)
    {
        if (empty($request->tbl)) {
            return $this->sendErrorResponse('error');
        }
        $tableLang = $request->tbl . '_data';

        // save data
        if (empty($id)) {
            $data = TblModel::model($request->tbl);
        } else {
            $data = TblModel::find($request->tbl, $id);
        }

        $data->active = $request->active ?? 0;
        $data->icon = $request->icon ?? '';

        if($request->tbl != 'page_setting') {
            $data->page_setting_id = $request->pageId;
        }

        if (!empty($request->data)) {
            foreach ($request->data as $key => $val) {
                $data->{$key} = $val;
            }
        }

        $data->save();

        // save language data
        if (!empty($request->lang)) {
            foreach ($request->lang as $key => $values) {
                if (empty($values['id'])) {
                    $dataLang = TblModel::model($tableLang);
                } else {
                    $dataLang = TblModel::find($tableLang, $values['id']);
                }
                $dataLang->data_id = $data->id;
                $dataLang->languages_id = $key;
                foreach ($values as $k => $v) {
                    if ($k == 'id') {
                        continue;
                    }

                    $dataLang->{$k} = $v;
                }

                $dataLang->save();
            }
        }

        // update image
        $image = $request->image_hidden;
        if (!empty($request->image)) {
            if (!file_exists(public_path('files/landingpage'))) {
                mkdir(public_path('files/landingpage'), 0755, true);
            }
            $fileName = app('Helper')->generateRandomString(5) . '_' . time() . '.' . $request->image->extension();
            $request->image->move(public_path('files/landingpage'), $fileName);
            $image = "/files/landingpage/" . $fileName;
        }

        $data->image = $image;

        // update images
        $images = [];
        if (!empty($request->images)) {
            $images = $request->images;
        }

        // save file
        if (!empty($request->file)) {
            // check và tạo thư mục landingpage nếu chưa có
            if (!file_exists(public_path('files/landingpage'))) {
                mkdir(public_path('files/landingpage'), 0755, true);
            }
            // upload multiple file
            foreach ($request->file as $key => $file) {
                if (is_array($file)) {
                    foreach ($file as $f) {
                        $fileName = app('Helper')->generateRandomString(5) . '_' . time() . '.' . $f->extension();
                        $f->move(public_path('files/landingpage'), $fileName);
                        $images[] = "/files/landingpage/" . $fileName;
                    }
                } else {
                    $fileName = app('Helper')->generateRandomString(5) . '_' . time() . '.' . $file->extension();
                    $file->move(public_path('files/landingpage'), $fileName);
                    $images[] = "/files/landingpage/" . $fileName;
                }
            }
        }
        $avatar = $images[0] ?? '';
        $data->images = ['images' => $images, 'avatar' => $avatar];
        $data->save();

        return $this->sendSuccessResponse([], $message = 'successfully');
    }

    public function editBlock(Request $request, $tblName, $id = 0, $pageId = 0)
    {
        $tblLang = $tblName . '_data';
        $languages = Language::orderBy('sort_order', 'asc')->get();

        $page = PageSetting::find($pageId);
        // dd($page);
        // save data
        $data = TblModel::find($tblName, $id);
        // save data lang
        $languagesData = [];
        foreach ($languages as $language) {
            $languagesData[$language->id] = DB::table($tblLang)
                ->where('data_id', $id)
                ->where('languages_id', $language->id)
                ->first();
        }
        
        $config = Layout01::getConfig($tblName);

        $params = [
            'data' => $data,
            'id' => $id,
            'request' => $request->all(),
            'languages' => $languages,
            'languagesData' => $languagesData,
            'tblName' => $tblName,
            'pageId' => $pageId,
            'config' => $config['block'],
            'page' => $page
        ];
        return View('admin.page_setting.edit_block', $params);
    }

    public function listBlock(Request $request, $tblName, $pageId = 0)
    {
        $htmlListDragDrop = $this->getHtmlDataDragDrop($tblName, $pageId);
        return View('admin.page_setting.list_data', compact('htmlListDragDrop', 'tblName', 'pageId'));
    }

    public function deleteData(Request $request, $tblName, $id)
    {
        // delete data
        DB::table($request->t)->where('id', $id)->delete();
        // delete data language
        $tblLang = $request->t . '_data';
        DB::table($tblLang)->where('data_id', $id)->delete();
        return $this->sendSuccessResponse([], 'Xóa thành công');
    }

    public function updateSortOrderData(Request $request, $menuId = 0)
    {
        if (empty($request->tbl) || empty($request->pageId)) {
            return $this->sendErrorResponse('Invalid request');
        }
        if (empty($request->data)) {
            return $this->sendErrorResponse('No data sort order');
        }

        $sortOrder = json_decode($request->data, true);
        $result = $this->updateSortOrderBlock($request->tbl, $sortOrder, $request->pageId);
        if ($result) {
            return $this->sendSuccessResponse($result, 'successfully');
        }
        return $this->sendErrorResponse($result, 'Error');
    }
    private function getHtmlDataDragDrop($tableName, $pageId)
    {
        $langId = UserService::getLang()->id;
        $tableNameData = $tableName . '_data';
        $html = '';
        $tableData = TblModel::model($tableName)
            ->leftJoin($tableNameData, $tableNameData . '.data_id', '=', $tableName . '.id')
            ->where($tableName . '.page_setting_id', $pageId)
            ->where($tableNameData . '.languages_id', $langId)
            ->OrderBy($tableName . '.sort_order', 'asc')
            ->get();

        if (!empty($tableData)) {
            $html = '<ol class="dd-list">';
            foreach ($tableData as $td) {
                $checked = '';
                if (!empty($td->active)) {
                    $checked = 'checked';
                }

                $html .= '<li id="main-block-dad-' . $td->data_id . '" class="dd-item" data-id="' . $td->data_id . '">
                            <div class="card b0 dd-handle">
                                <div class="mda-list">
                                    <div class="mda-list-item">
                                        <div class="mda-list-item-icon item-grab" style="padding-top: 9px;">
                                            <em class="ion-drag icon-lg"></em>
                                        </div>
                                        <div class="mda-list-item-text mda-2-line">
                                            <em class="type-block">' . '' . '</em>
                                            <h3 class="title-dd">' . $td->name_data . '</h3>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div class="option-dd">
                                <input ' . $checked . ' onchange="" id="hide_' . $td->data_id . '" type="checkbox" name="hide[]" value="' . $td->data_id . '"/>
                                <label class"label_hide" for="hide_' . $td->data_id . '">' . __('land.hidden_block') . '</label>

                                <a class="delete-land" href="' . route('pageSetting.editBlock', [$tableName, $td->data_id, $pageId]) . '" >
                                   <b> <i class="fas fa-pencil"></i></i> ' . __('land.edit') . '</b>
                                </a>

                                <a class="delete-land" style="float: right;" onclick="$(\'#delete-confirm-' . $td->data_id . '\').show();window.parent.document.getElementById(\'btnCloseModalXL2\').style.display = \'none\'; window.parent.document.getElementById(\'btnReloadModalXL2\').style.display = \'block\';">
                                   <b> <i class="fas fa-trash"></i> ' . __('land.removed') . '</b>
                                </a>
                            </div>
                            <div id="delete-confirm-' . $td->data_id . '" class="land-confirm-delete _hidden" style="height: 30px;">
                                <em class="confirm-delete-land" style="float: right;">
                                ' . __('land.you_delete') . '
                                    &nbsp;
                                    <a><b class="land-btn-delete" onclick="$.post(\'' . route('pageSetting.deleteData', [$tableName, $td->data_id]) . '\', { t: \'' . $tableName . '\', id: \'' . $td->data_id . '\', _token: \'' . csrf_token() . '\' }, function(response) {location.reload();});"><i class="ion-checkmark-round"></i>' . __('land.removed') . '</b></a>
                                    &nbsp;
                                    <a><b onclick="$(\'#delete-confirm-' . $td->data_id . '\').hide()" class="land-btn-cancel-delete"><i class="ion-close-circled"></i> ' . __('land.cancel') . '</b></a>
                                    &nbsp;
                                </em>
                            </div>';
                $html .= '</li>';
            }
            $html .= '</ol>';
        }

        return $html;
    }

    private function updateSortOrderBlock($tableName, $sortOrder, $menuId = 0)
    {
        try {
            DB::beginTransaction();
            foreach ($sortOrder as $key => $value) {
                $idx = $key + 1;
                DB::table($tableName)->where('id', $value['id'])->update(['sort_order' => $idx]);
                if (isset($value['children'])) {
                    $this->updateSortOrderBlock($tableName, $value['children'], $menuId);
                }
            }
            DB::commit();
            return true;
        } catch (\Throwable $th) {
            DB::rollBack();
            return false;
        }
    }

    private function updateSortOrderPageSetting($tableName, $sortOrder, $menuId = 0)
    {
        try {
            DB::beginTransaction();
            foreach ($sortOrder as $key => $value) {
                $idx = $key + 1;
                DB::table($tableName)->where('id', $value['id'])->update(['sort_order' => $idx]);
                if (isset($value['children'])) {
                    $this->updateSortOrderPageSetting($tableName, $value['children'], $menuId);
                }
            }
            DB::commit();
            return true;
        } catch (\Throwable $th) {
            DB::rollBack();
            return false;
        }
    }

    private function getHtmlPageSettingDragDrop($menuId)
    {

        $html = '';
        $tableData = PageSetting::query()
            ->where('page_setting.menu_id', $menuId)
            ->OrderBy('page_setting.sort_order', 'asc')
            ->get();
        if (!empty($tableData)) {
            $html = '<ol class="dd-list">';
            foreach ($tableData as $td) {
                $checked = '';
                if (empty($td->active)) {
                    $checked = 'checked';
                }

                $html .= '<li id="main-block-dad-' . $td->data_id . '" class="dd-item" data-id="' . $td->data_id . '">
                            <div class="card b0 dd-handle">
                                <div class="mda-list">
                                    <div class="mda-list-item">
                                        <div class="mda-list-item-icon item-grab" style="padding-top: 9px;">
                                            <em class="ion-drag icon-lg"></em>
                                        </div>
                                        <div class="mda-list-item-text mda-2-line">
                                            <em class="type-block">' . $td->block_type . '</em>
                                            <h3 class="title-dd">' . $td->name_data . '</h3>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div class="option-dd">
                                <input ' . $checked . ' onchange="hideLand(this,' . $td->data_id . ')" id="hide_' . $td->data_id . '" type="checkbox" name="hide[]" value="' . $td->data_id . '"/>
                                <label class"label_hide" for="hide_' . $td->data_id . '">' . __('land.hidden_block') . '</label>

                                <a class="delete-land" href="' . route('pageSetting.edit', ['page_setting', $td->data_id]) . '" >
                                   <b> <i class="fas fa-pencil"></i> Sửa </b>
                                </a>

                                <a class="delete-land" style="float: right;" onclick="$(\'#delete-confirm-' . $td->data_id . '\').show();window.parent.document.getElementById(\'btnCloseModalXL2\').style.display = \'none\'; window.parent.document.getElementById(\'btnReloadModalXL2\').style.display = \'block\';">
                                   <b> <i class="fas fa-trash"></i> ' . __('land.removed') . '</b>
                                </a>
                            </div>
                            <div id="delete-confirm-' . $td->data_id . '" class="land-confirm-delete _hidden" style="height: 30px;">
                                <em class="confirm-delete-land" style="float: right;">
                                ' . __('land.you_delete') . '
                                    &nbsp;
                                    <a><b class="land-btn-delete" onclick="$.post(\'' . route('pageSetting.deleteData', ['page_setting', $td->data_id]) . '\', { t: \'page_setting\', id: \'' . $td->data_id . '\', _token: \'' . csrf_token() . '\' }, function(response) {location.reload();});"><i class="ion-checkmark-round"></i>' . __('land.removed') . '</b></a>
                                    &nbsp;
                                    <a><b onclick="$(\'#delete-confirm-' . $td->data_id . '\').hide()" class="land-btn-cancel-delete"><i class="ion-close-circled"></i> ' . __('land.cancel') . '</b></a>
                                    &nbsp;
                                </em>
                            </div>';
                $html .= '</li>';
            }
            $html .= '</ol>';
        }
        // <input ' . $checked . ' onchange="showInMenu(this,' . $td->data_id . ')" id="show-in-menu_' . $td->data_id . '" type="checkbox" name="show_in_menu[]" value="' . $td->data_id . '"/>
        // <label class"label_hide" for="show-in-menu_' . $td->data_id . '">' . __('land.show_in_menu') . '</label>
        return $html;
    }


    private function getBlockModel()
    {
        $config = WebConfig::query()->find(1);
        $class = 'App\Services\LandingpageData\Layout' . $config->layout;
        return new $class();
    }
}
