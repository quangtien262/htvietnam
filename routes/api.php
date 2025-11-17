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

// Route::middleware('auth:sanctum')->get('/user', function (Request $request) {
//     return $request->user();
// });



Route::post('/data/import/{tableId}', [DataController::class, 'importExcel'])->name('data.import');

// Route::post('/data/upload-image', [DataController::class, 'uploadImage'])->name('data.upload_image');
// Route::post('/data/delete-image-tmp', [DataController::class, 'deleteImageTmp'])->name('data.delete_image_tmp');


// Route::post('/data/tinymce/upload-image', [DataController::class, 'tinyUploadImage2S3'])->name('data.tiny_upload_image');
Route::post('/data/tinymce/upload-image', [DataController::class, 'tinyUploadImage'])->name('data.tiny_upload_image');


Route::get('languages', [ApiController::class, 'languages'])->name('api.languages');
Route::post('language/detail', [ApiController::class, 'languagesDetail'])->name('api.languages');

Route::group(['prefix' => 'files'], function () {
    Route::post('upload', [FileController::class, 'upload'])->name('file.upload');
    Route::post('editor/upload', [FileController::class, 'editorUpload'])->name('editor.upload');
});

