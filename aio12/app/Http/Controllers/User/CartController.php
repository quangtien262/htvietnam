<?php

namespace App\Http\Controllers\User;

use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use App\Models\Web\Product;
use App\Models\Web\Orders;
use App\Models\Web\WebConfig;
use App\Http\Requests\User\PaymentRequest;
use App\Models\Web\Contact;

class CartController extends Controller
{
    /**
     * Display a listing of the resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function index(Request $request)
    {
        $config = WebConfig::query()->find(1);
        $cart = \Cart::content();
        if(\Cart::count() == 0) {
            return View('layouts.layout' . $config->layout . '.cart.cart_empty', compact('config', 'cart'));
        }
        return View('layouts.layout' . $config->layout . '.cart.index', compact('config', 'cart'));
    }

    public function sendOrders(Request $request)
    {
        $config = WebConfig::query()->find(1);
        Contact::create($request->all()['contact']);
        return 'success';
    }

    public function add2cart(Request $request) {
        $qty = 1;
        if(!empty($request->quantity)) {
            $qty = $request->quantity;
        }
        if(empty($request->pid)) {

        }
        $product = Product::query()->find($request->pid);
        $price = $product->price;
        if($product->promo_price > 0 && $product->promo_price < $product->price) {
            $price = $product->promo_price;
        }
        \Cart::tax(0, 0, 0);
        //id, name, qty, price, option =[], taxrates
        \Cart::add($request->pid, $product->name, $qty, $price, ['product' => $product], intval($product->taxrates));

        return redirect(route('cart'));
    }

    public function delete($rowId) {
        try {
            \Cart::remove($rowId);
        } catch (\Throwable $th) {

        }
        return redirect(route('cart'));
    }

    public function postPayment(PaymentRequest $request) {
        $config = WebConfig::query()->find(1);
        $user = \Auth::guard('web')->user();
        $cart = \Cart::content();
        foreach ($cart as $c) {
            $product = $c->options['product'];
            $orders = new Orders();
            $orders->user_id = $user->id;
            $orders->product_id = $c->id;
            $orders->email = $user->email;
            $orders->phone = $user->phone;
            $orders->quantity = $c->qty;
            $orders->note = $request->note;
            $orders->price = $product->price;
            $orders->promo_price = intval($product->promo_price);
            $orders->save();
        }
        \Cart::destroy();
        return View('layouts.layout' . $config->layout . '.cart.payment_success', compact('config'));
    }
    public function update_cart(Request $request)
    {
        $cart = \Cart::content();
        foreach ($cart as $key => $c) {
            \Cart::update($key,  $request->qty[$key] );
        }
        return redirect(route('cart'));
    }
}

