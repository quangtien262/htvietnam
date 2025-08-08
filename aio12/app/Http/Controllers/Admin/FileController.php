<?php

namespace App\Http\Controllers\Admin;

use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Http\Controllers\Controller;
use App\Services\Admin\TblService;
use App\Models\Admin\Table;
use App\Models\Admin\Column;
use App\Models\Admin\FileManager;
use Illuminate\Support\Facades\Redirect;
use Illuminate\Support\Facades\DB;
use App\Models\User;
use App\Services\CommonService;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;

class FileController extends Controller
{
    /**
     * Search
     *
     * @param  \App\Models\Column  $tableId
     * @return \Illuminate\Http\Response
     */
    public function index(Request $request)
    {
        $tables = TblService::getAdminMenu(0);
        return Inertia::render(
            'Admin/File/index',
            [
                'tables' => $tables,
            ]
        );
    }


    public function show(Request $request, $type)
    {
        $user = Auth::guard('admin_users')->user();
        $files = FileManager::query()->where('file_manager.parent_id', 0);

        if ($type == 'my') {
            $files = $files->where('file_manager.create_by', $user->id);
        } else if ($type == 'share') {
            $files = $files->when($user, function ($query) use ($user) {
                $query->where(function ($query) use ($user) {
                    $query->orWhereJsonContains('file_manager.share', $user->id);
                });
            });
            // } else if ($type == 'all') {
        } else {
            $files = $files->where('file_manager.is_share_all', 1);
        }

        $files = $files->get();
        return $this->sendSuccessResponse($files);
    }

    public function upload(Request $request)
    {
        $user = Auth::guard('admin_users')->user();
        $directoryUpload = 'documents/' . $user->id;

        $fileManager = new FileManager();
        $shareAll = 0;
        if ($request->uploadType == 'all') {
            $shareAll = 1;
        }

        $fileManager = $this->saveFile($request->file, $directoryUpload, $request->parent_id, $shareAll);

        $data = FileManager::query()
            ->where('file_manager.id', $fileManager->id)
            ->where('file_manager.create_by', $user->id)
            ->where('file_manager.is_recycle_bin', 0)
            ->first();

        return $this->sendSuccessResponse($data, 'Update successfully');
    }

    public function createFolder(Request $request)
    {
        if (empty($request->name)) {
            return $this->sendErrorResponse('Chưa nhập tên thư mục');
        }
        $user = Auth::guard('admin_users')->user();
        $fileManager = new FileManager();

        if ($request->uploadType == 'all') {
            $check = FileManager::where('parent_id', $request->parent_id)->where('name', $request->name)->where('parent_id', $request->parent_id)->where('is_share_all', 1)->count();
            if ($check > 0) {
                return $this->sendErrorResponse('Thư mục đã tồn tại');
            }
            $fileManager->is_share_all = 1;
        } else {
            $check = FileManager::where('parent_id', $request->parent_id)
                ->where('name', $request->name)
                ->where('parent_id', $request->parent_id)
                ->where('create_by', $user->id)
                ->count();
            if ($check > 0) {
                return $this->sendErrorResponse('Thư mục đã tồn tại');
            }
        }

        $fileManager->name = $request->name;
        $fileManager->size = 0;
        $fileManager->type = 'folder';
        $fileManager->path = '';
        $fileManager->url = '';
        $fileManager->parent_id = intval($request->parent_id);
        $fileManager->create_by = $user->id;
        $fileManager->save();
        $datas = FileManager::select('file_manager.*', 'admin_users.name as full_name', 'admin_users.code as admin_user_code')
            ->leftJoin('admin_users', 'file_manager.create_by', 'admin_users.id')
            ->where('file_manager.id', $fileManager->id)
            ->where('file_manager.create_by', $user->id)
            ->where('file_manager.is_recycle_bin', 0)
            ->first();
        return $this->sendSuccessResponse($datas, 'Update successfully', 200);
    }

    public function download($id)
    {
        $data = FileManager::find($id);
        return Storage::download($data->path);
    }

    public function openFolder(Request $request)
    {
        if (!isset($request->id)) {
            return '';
        }

        $user = Auth::guard('admin_users')->user();
        $folder = FileManager::find($request->id);
        $datas =  FileManager::where('parent_id', $request->id);

        if ($request->uploadType == 'share') {
            // share current
            $datas = $datas->when($user, function ($query) use ($user) {
                $query->where(function ($query) use ($user) {
                    $query->orWhereJsonContains('share', $user->id);
                });
            });
        } else if ($request->uploadType == 'all') {
            // share all
            $datas = $datas->where('is_share_all', 1);
        } else {
            // my document
            $datas = $datas->where('create_by', $user->id);
        }

        $datas = $datas->where('is_recycle_bin', 0);

        $datas = $datas->get();

        $parent = [];
        if(!empty($folder)) {
            $parent = CommonService::getParentId('file_manager', $folder->id);
        }
        $ids = [];
        foreach ($datas as $data) {
            $ids[$data->id] = false;
        }
        $result = [
            'parent' => array_reverse($parent),
            'datas' => $datas,
            'ids' => $ids
        ];
        return $this->sendSuccessResponse($result, 'Update successfully', 200);
    }

    public function delete(Request $request)
    {
        if (empty($request->id)) {
            return $this->sendErrorResponse('error');
        }
        $file = FileManager::find($request->id);
        $file->is_recycle_bin = 1;
        $file->save();

        $user = Auth::guard('admin_users')->user();
        $datas = FileManager::where('parent_id', $request->parent_id)->where('create_by', $user->id)->where('is_recycle_bin', 0)->get();
        return $this->sendSuccessResponse($datas, 'Delete successfully', 200);
    }

    public function share(Request $request)
    {
        if (empty($request->id)) {
            return $this->sendErrorResponse('error');
        }

        $file = FileManager::find($request->id);

        if (empty($file)) {
            return $this->sendErrorResponse('error');
        }

        // set 2 tmp
        $sharePre = $file->share;

        // save
        $file->share = $request->user_ids;
        $file->save();

        // check admin_users_id bị xóa
        $uidRemove = [];
        foreach($sharePre as $pre) {
            if(!in_array($pre, $request->user_ids)) {
                $uidRemove[] = $pre;
            }
        }

        // check admin_users_id được thêm vào
        $uidNew = [];
        foreach($request->user_ids as $new) {
            if(!in_array($new, $sharePre)) {
                $uidNew[] = $new;
            }
        }
        // share for parent
        if ($file->parent_id > 0) {
            $this->shareAllParent($file, $uidRemove, $uidNew);
        }

        // is folder: share/unshare all sub
        if ($file->type == 'folder') {
            if(!empty($uidNew)) {
                $this->shareAllSub($file, $uidNew);
            }
            if(!empty($uidRemove)) {
                $this->unShareAllSub($file, $uidRemove);
            }
        }

        return $this->sendSuccessResponse('successfully');
    }

    private function shareAllSub($file, $userIds)
    {
        $files = FileManager::where('parent_id', $file->id)->get();
        foreach ($files as $f) {
            if ($f->type == 'folder') {
                self::shareAllSub($f, $userIds);
            }
            $sub = FileManager::find($f->id);

            if(empty($sub->share)) {
                $sub->share = $userIds;
                $sub->save();
                continue;
            }

            $share = $sub->share;
            foreach($userIds as $id) {
                if(!in_array($id, $share)) {
                    $share[] = $id;
                }
            }
            $sub->share = $share;
            $sub->save();
        }
    }

    private function unShareAllSub($file, $userIds)
    {
        $files = FileManager::where('parent_id', $file->id)->get();
        foreach ($files as $f) {
            if ($f->type == 'folder') {
                self::unShareAllSub($f, $userIds);
            }
            $sub = FileManager::find($f->id);
            $share =$sub->share;
            foreach($userIds as $id) {
                $share = CommonService::unsetByValue($share, $id);
            }
            $sub->share = $share;
            $sub->save();
        }
    }

    private function shareAllParent($file, $uidRemove, $uidNew)
    {
        $parents = CommonService::getParentId('file_manager', $file->id);
        // dd($parents);
        foreach($parents as $parent) {
            $item = FileManager::find($parent['id']);
            $share = $item->share;
            // add
            foreach($uidNew as $new) {
                if(!in_array($new, $share)) {
                    $share[] = $new;
                }
            }

            // remove
            foreach($uidRemove as $remove) {
                if(in_array($remove, $share)) {
                    $sub = $this->removeUserOfSub($remove, $file);

                    // check & unset admin_users_id if exist in share
                    $share = CommonService::unsetByValue($share, $remove);
                }
            }

            $item->share = $share;
            $item->save();
        }

    }

    private function isShareSub($remove, $file) {
        $subs = FileManager::where('parent_id', $file->id)->get();
        foreach($subs as $sub) {
            if(in_array($remove, $sub->share)) {
                return true;
            }
        }
        return false;
    }


    public function showShare(Request $request)
    {
        $user = Auth::guard('admin_users')->user();
        $files = FileManager::select('file_manager.*', 'admin_users.name as full_name', 'admin_users.code as admin_user_code')
            ->leftJoin('admin_users', 'file_manager.create_by', 'admin_users.id')
            ->when($user, function ($query) use ($user) {
                $query->where(function ($query) use ($user) {
                    $query->orWhereJsonContains('share', $user->id);
                });
            })->get();
        return $this->sendSuccessResponse($files);
    }

    public function editorUpload(Request $request)
    {
        $user = Auth::guard('admin_users')->user();
        $directoryUpload = 'editor/' . $user->id;

        // parent is editor folder
        $parent = CommonService::getEditorFolder();

        $result = [];
        foreach($request->all() as $file) {
            $item = $this->saveFile($file, $directoryUpload, $parent->id);
            $result[] = [
                "url" => $item->url,
                "name"=> $item->name,
                "size"=> $item->size
            ];
        }
        return $this->sendSuccessResponse($result);
    }

    public function getAllFile(){
        $user = Auth::guard('admin_users')->user();
        $parent = CommonService::getEditorFolder();
        $files = FileManager::select(
            'url as src', 
            'url_thumb as thumbnail', 
            'name as name',
            'alt as alt',
            'alt as tag')
            ->where('parent_id', $parent->id)->get();
        return [
            "result" => $files,
            "nullMessage" => '',
            "errorMessage" => ''
        ];
    }

    private function saveFile($file, $directoryUpload, $parentId, $shareAll = 0) {
        $thumb = $directoryUpload . '/thumb';
        CommonService::createDir('documents');
        CommonService::createDir('editor');
        CommonService::createDir($directoryUpload);
        CommonService::createDir($thumb);

        $user = Auth::guard('admin_users')->user();
        $size = $file->getSize();
        $clientOriginalName = $file->getClientOriginalName();
        $fileName_arr = explode('.', $clientOriginalName);
        $extension = '';
        if (count($fileName_arr) > 1) {
            $extension = end($fileName_arr);
        }

        $count = FileManager::where('parent_id', $parentId)
                ->where('name', $clientOriginalName)
                ->where('is_share_all', $shareAll)->count();
        if($count > 0) {
            $clientOriginalName .= '_' . $count;
        }

        $alt = '';
        $parent = FileManager::find($parentId);
        if(!empty($parent)) {
            $alt = $parent->name;
        }


        // set file name
        $nameRandom = app('Helper')->generateRandomString(4);
        $fileName = $nameRandom . '_' . time() . '.' . $extension;
        $fileName_thumb = $nameRandom . '_' . time() . '_thumb.' . $extension;
        $newFile = $file->storeAs($directoryUpload, $fileName, 'public');
        $newFile = $file->storeAs($thumb, $fileName_thumb, 'public');

        $fileManager = new FileManager();
        $fileManager->name = $clientOriginalName;
        $fileManager->alt = $alt;
        $fileManager->size = $size;
        $fileManager->type = $extension;
        $fileManager->path = $newFile;
        $fileManager->url = '/files/' . $directoryUpload . '/' . $fileName;
        $fileManager->url_thumb = '/files/' . $thumb . '/' . $fileName_thumb;
        $fileManager->parent_id = $parentId;
        $fileManager->create_by = $user->id;
        $fileManager->is_share_all = $shareAll;
        $fileManager->save();

        $data = FileManager::select('file_manager.*', 'admin_users.name as full_name')
            ->leftJoin('admin_users', 'file_manager.create_by', 'admin_users.id')
            ->where('file_manager.id', $fileManager->id)
            ->where('file_manager.create_by', $user->id)
            ->where('file_manager.is_recycle_bin', 0)
            ->first();
        return $data;
    }

}
