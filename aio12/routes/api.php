<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Admin\DataController;
use App\Http\Controllers\Admin\ApiController;
use App\Http\Controllers\Admin\FileController;
use App\Http\Controllers\Admin\TaskController;
use App\Http\Controllers\Admin\UserController;
use App\Http\Controllers\Admin\TblController;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider and all of them will
| be assigned to the "api" middleware group. Make something great!
|
*/

Route::middleware('auth:sanctum')->get('/user', function (Request $request) {
    return $request->user();
});
Route::post('/data/import/{tableId}', [DataController::class, 'importExcel'])->name('data.import');

// Route::post('/data/upload-image', [DataController::class, 'uploadImage'])->name('data.upload_image');
// Route::post('/data/delete-image-tmp', [DataController::class, 'deleteImageTmp'])->name('data.delete_image_tmp');


// Route::post('/data/tinymce/upload-image', [DataController::class, 'tinyUploadImage2S3'])->name('data.tiny_upload_image');
Route::post('/data/tinymce/upload-image', [DataController::class, 'tinyUploadImage'])->name('data.tiny_upload_image');

Route::post('data/create/cham-cong', [ApiController::class, 'createDataChamCong'])->name('data.create_data_cham_cong');
Route::post('data/update/cham-cong/{userId}', [ApiController::class, 'updateChamCong'])->name('data.cham_cong.current_user');
// update table
Route::post('/tbl/update-field/{tableId}', [TblController::class, 'updateTable'])->name('table.update.edit');
// update col
Route::post('/tbl/column/{colId}', [TblController::class, 'updateColumn'])->name('column.update.edit');

Route::post('artisan', [TblController::class, 'artisan'])->name('artisan');
Route::get('artisan', [TblController::class, 'artisan'])->name('artisan');

//
Route::group(['prefix' => 'news'], function () {
    Route::post('list', [ApiController::class, 'news'])->name('api.news.index');
    Route::post('detail', [ApiController::class, 'newsDetail'])->name('api.news.detail');
    Route::post('top-views', [ApiController::class, 'topViews'])->name('api.news.detail');
});

Route::get('languages', [ApiController::class, 'languages'])->name('api.languages');
Route::post('language/detail', [ApiController::class, 'languagesDetail'])->name('api.languages');


Route::group(['prefix' => 'files'], function () {
    Route::post('upload', [FileController::class, 'upload'])->name('file.upload');
    Route::post('editor/upload', [FileController::class, 'editorUpload'])->name('editor.upload');
});