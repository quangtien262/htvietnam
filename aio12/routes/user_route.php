<?php

use App\Http\Controllers\User\PagesController;
use App\Http\Controllers\User\NewsController;
use App\Http\Controllers\User\ProductController;
use App\Http\Controllers\User\BDSController;
use App\Http\Controllers\User\ContactController;
use App\Http\Controllers\User\OrdersController;
use App\Http\Controllers\User\CartController;
use App\Http\Controllers\Auth\AuthController;
use App\Http\Controllers\User\FooterController;
use App\Http\Controllers\User\NewsletterController;
use App\Http\Controllers\User\TuyendungController;
use App\Http\Controllers\User\UserController;
use App\Http\Controllers\User\PhanboichauController;

use App\Http\Controllers\User\VideoController;
use Illuminate\Support\Facades\Route;

Route::get('/', [PagesController::class, 'index'])->name('home');

Route::get('lang/{locale}', function ($locale) {
    if (in_array($locale, ['vi', 'en', 'ch'])) {
        session(['locale' => $locale]);
        app()->setLocale($locale);
    }
    return redirect()->back();
})->name('change_language');

//news
Route::get('{sluggable}/n{menuId}.html', [NewsController::class, 'index'])->name('news');
Route::get('{sluggableNews}/s{newsId}.html', [NewsController::class, 'detail'])->name('news.detail');
// Route::get('{sluggableNews}/o{menuId}.html', [NewsController::class, 'recruitment_detail'])->name('recruitment.detail');
Route::get('tags/{sluggable}/tg{tagId}.html', [NewsController::class, 'tags'])->name('news.tags');

// footer
Route::get('{sluggable}/z{footerId}.html', [FooterController::class, 'index'])->name('footer');

// address
Route::get('{sluggable}/y{menuId}.html', [PagesController::class, 'address'])->name('address');
Route::get('{sluggable}/u{menuId}.html', [PagesController::class, 'addressDetail'])->name('address.detail');

// QA
Route::get('{sluggable}/q{menuId}.html', [PagesController::class, 'qa'])->name('qa');
Route::get('{sluggable}/i{menuId}.html', [PagesController::class, 'qaDetail'])->name('qa.detail');

// product
Route::get('{sluggable}/p{menuId}.html', [ProductController::class, 'index'])->name('product');
Route::get('{sluggable}/l{productId}.html', [ProductController::class, 'detail'])->name('product.detail');

Route::get('product-new.html', [ProductController::class, 'productLatest'])->name('product.latest');
Route::get('product-promo.html', [ProductController::class, 'promotion'])->name('product.promo');
Route::get('product-hot.html', [ProductController::class, 'productHot'])->name('product.hot');
Route::get('san-pham-moi.html', [ProductController::class, 'productNew'])->name('product.latest_vi');
Route::get('san-pham-khuyen-mai.html', [ProductController::class, 'productPromo'])->name('product.promo_vi');
Route::get('san-pham-noi-bat.html', [ProductController::class, 'productHot'])->name('product.hot_vi');

//video
Route::get('{sluggable}/v{menuId}.html', [VideoController::class, 'index'])->name('video');
Route::get('{sluggable}/b{productId}.html', [VideoController::class, 'detail'])->name('video.detail');

// add2cart
Route::post('{sluggable}/l{productId}.html', [CartController::class, 'add2cart']);

// search
Route::get('tim-kiem.html', [PagesController::class, 'search'])->name('search');

// contact
Route::get('contact.html', [ContactController::class, 'index'])->name('contact');
Route::post('contact.html', [ContactController::class, 'sendContact']);
Route::post('gui-lien-he.html', [ContactController::class, 'sendContact02'])->name('sendContact02');
Route::get('send-contact.html', [ContactController::class, 'result'])->name('contact.result');
Route::post('sendMail', [ContactController::class, 'sendMail'])->name('sendMail');

// send info
Route::post('contact/send-info', [OrdersController::class, 'sendOrdersBDS'])->name('orders.bds');

Route::get('{sluggable}/h{menuId}.html', [PagesController::class, 'about'])->name('about');

//singlepage
Route::get('{sluggable}/a{menuId}.html', [PagesController::class, 'singlePage'])->name('single_page');
Route::get('{sluggable}/b{menuId}.html', [PagesController::class, 'pageList'])->name('page_list');
Route::get('{sluggable}/c{menuId}.html', [PagesController::class, 'services'])->name('services');
Route::get('{sluggable}/d{menuId}.html', [PagesController::class, 'serviceDetail'])->name('service_detail');

// current page
Route::get('{sluggable}/e{pageId}.html', [PagesController::class, 'currentPage'])->name('current_page');

//about
Route::get('gioi-thieu.html', [PagesController::class, 'about'])->name('about');

//landingpage
Route::get('{sluggable}/f{menuId}.html', [PagesController::class, 'landingpage'])->name('landingpage');

// BDS
Route::get('{sluggable}/b{menuId}.html', [BDSController::class, 'index'])->name('bds');
Route::get('{sluggable}/c{productId}.html', [BDSController::class, 'detail'])->name('bds.detail');

Route::post('them-vao-gio-hang.html', [CartController::class, 'add2cart'])->name('cart.add');
Route::get('gio-hang.html', [CartController::class, 'index'])->name('cart');
Route::get('gio-hang/delete/{cartId}', [CartController::class, 'delete'])->name('cart.delete');
Route::get('gio-hang/thanh-toan', [CartController::class, 'delete']);
Route::post('thanh-toan', [CartController::class, 'postPayment'])->name('cart.payment');
Route::patch('cap-nhat-gio-hang', [CartController::class, 'update_cart'])->name('cart.update');

//
Route::middleware('auth:web')->group(function () {
    Route::get('trang-ca-nhan', [UserController::class, 'profile'])->name('profile');
    Route::get('chinh-sua', [UserController::class, 'edit'])->name('edit');
    Route::get('cai-dat', [UserController::class, 'setting'])->name('setting');
    Route::put('update', [UserController::class, 'update'])->name('user.update');
    Route::put('thay-doi-mat-khau', [UserController::class, 'updatepass'])->name('user.updatepass');
    Route::get('don-hang', [UserController::class, 'order'])->name('order.index');
    Route::get('detail/{id}', [UserController::class, 'detail'])->name('orders.detail');
});
Route::get('takepassword', function () {
    return view('user.takePassword.index');
})->name('takepassword');
Route::post('posttakepassword', [UserController::class, 'takePassword'])->name('posttakepassword');

// Add subcriber email
Route::post('/add-subcriber', [NewsletterController::class, 'addSubcriber'])->name('subcribe');

// Phan boi chau
Route::get('{sluggable}/x{menuId}.html', [PhanboichauController::class, 'giaoVien'])->name('giao_vien');
Route::get('{sluggable}/m{menuId}.html', [PhanboichauController::class, 'review'])->name('review');
Route::post('gui-tuyen-sinh', [PhanboichauController::class, 'sendTuyensinh'])->name('tuyen_sinh');
Route::get('tim-kiem-New.html', [PhanboichauController::class, 'search_pbc'])->name('search_phc');


