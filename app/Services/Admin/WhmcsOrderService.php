<?php

namespace App\Services\Admin;

use App\Models\Whmcs\WhmcsOrder;
use App\Models\Whmcs\WhmcsOrderItem;
use App\Models\Whmcs\WhmcsInvoice;
use App\Models\Whmcs\WhmcsInvoiceItem;
use App\Models\Whmcs\WhmcsService;
use App\Models\Whmcs\WhmcsPromoCode;
use Illuminate\Support\Str;

class WhmcsOrderService
{
    public function createOrder(array $data)
    {
        try {
            \DB::beginTransaction();

            // Generate order number
            $orderNumber = 'ORD-' . date('Ymd') . '-' . strtoupper(Str::random(6));

            // Create order
            $order = WhmcsOrder::create([
                'order_number' => $orderNumber,
                'client_id' => $data['client_id'],
                'currency_id' => $data['currency_id'],
                'status' => 'Pending',
                'payment_method' => $data['payment_method'] ?? null,
                'promo_code_id' => isset($data['promo_code']) ? $this->getPromoCodeId($data['promo_code']) : null,
                'notes' => $data['notes'] ?? null,
                'ip_address' => request()->ip()
            ]);

            // Create order items
            $subtotal = 0;
            foreach ($data['items'] as $item) {
                $product = \App\Models\Whmcs\WhmcsProduct::findOrFail($item['product_id']);
                $pricing = $product->pricing()
                    ->where('billing_cycle', $item['billing_cycle'])
                    ->where('currency_id', $data['currency_id'])
                    ->first();

                if (!$pricing) {
                    throw new \Exception("Không tìm thấy giá cho sản phẩm {$product->name} với chu kỳ {$item['billing_cycle']}");
                }

                $quantity = $item['quantity'] ?? 1;
                $amount = $pricing->price * $quantity;

                WhmcsOrderItem::create([
                    'order_id' => $order->id,
                    'product_id' => $product->id,
                    'billing_cycle' => $item['billing_cycle'],
                    'quantity' => $quantity,
                    'amount' => $amount
                ]);

                $subtotal += $amount;
            }

            // Apply promo code
            $discount = 0;
            if ($order->promo_code_id) {
                $promoCode = WhmcsPromoCode::find($order->promo_code_id);
                if ($promoCode->type == 'Percentage') {
                    $discount = $subtotal * ($promoCode->value / 100);
                } else {
                    $discount = $promoCode->value;
                }
            }

            // Update order totals
            $order->update([
                'subtotal' => $subtotal,
                'discount' => $discount,
                'total' => $subtotal - $discount
            ]);

            // Create invoice
            $this->createInvoiceFromOrder($order);

            \DB::commit();
            return $order->load('items.product', 'invoice');
        } catch (\Exception $e) {
            \DB::rollBack();
            throw $e;
        }
    }

    public function updateOrderStatus(WhmcsOrder $order, string $status)
    {
        $order->update(['status' => $status]);

        if ($status == 'Active') {
            // Provision services
            $this->provisionServices($order);
        }

        return $order;
    }

    protected function provisionServices(WhmcsOrder $order)
    {
        foreach ($order->items as $item) {
            WhmcsService::create([
                'client_id' => $order->client_id,
                'product_id' => $item->product_id,
                'order_item_id' => $item->id,
                'billing_cycle' => $item->billing_cycle,
                'amount' => $item->amount,
                'registration_date' => now(),
                'next_due_date' => $this->calculateNextDueDate($item->billing_cycle),
                'status' => 'Pending'
            ]);
        }
    }

    protected function calculateNextDueDate($billingCycle)
    {
        $intervals = [
            'Monthly' => '+1 month',
            'Quarterly' => '+3 months',
            'Semi-Annually' => '+6 months',
            'Annually' => '+1 year',
            'Biennially' => '+2 years',
            'Triennially' => '+3 years'
        ];

        return isset($intervals[$billingCycle]) ?
            date('Y-m-d', strtotime($intervals[$billingCycle])) :
            date('Y-m-d', strtotime('+1 month'));
    }

    protected function createInvoiceFromOrder(WhmcsOrder $order)
    {
        $invoiceNumber = 'INV-' . date('Ymd') . '-' . strtoupper(Str::random(6));

        $invoice = WhmcsInvoice::create([
            'invoice_number' => $invoiceNumber,
            'client_id' => $order->client_id,
            'currency_id' => $order->currency_id,
            'date' => now(),
            'due_date' => now()->addDays(7),
            'subtotal' => $order->subtotal,
            'tax' => 0,
            'total' => $order->total,
            'status' => 'Unpaid',
            'payment_method' => $order->payment_method
        ]);

        foreach ($order->items as $item) {
            WhmcsInvoiceItem::create([
                'invoice_id' => $invoice->id,
                'type' => 'Product',
                'related_id' => $item->product_id,
                'description' => $item->product->name . ' - ' . $item->billing_cycle,
                'amount' => $item->amount,
                'tax_rate' => 0
            ]);
        }

        $order->update(['invoice_id' => $invoice->id]);

        return $invoice;
    }

    protected function getPromoCodeId($code)
    {
        $promoCode = WhmcsPromoCode::where('code', $code)
            ->where('start_date', '<=', now())
            ->where(function ($q) {
                $q->whereNull('expiry_date')
                    ->orWhere('expiry_date', '>=', now());
            })
            ->where(function ($q) {
                $q->where('max_uses', 0)
                    ->orWhereRaw('uses < max_uses');
            })
            ->first();

        if ($promoCode) {
            $promoCode->increment('uses');
            return $promoCode->id;
        }

        return null;
    }
}
