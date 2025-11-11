<?php

namespace Tests\Feature\Whmcs;

use App\Models\User;
use App\Models\Whmcs\Invoice;
use App\Models\Whmcs\InvoiceItem;
use App\Models\Whmcs\Product;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class InvoiceApiTest extends TestCase
{
    use RefreshDatabase;

    protected User $user;

    protected function setUp(): void
    {
        parent::setUp();
        $this->user = User::factory()->create();
    }

    public function test_can_list_invoices(): void
    {
        Invoice::factory()->count(3)->create([
            'client_id' => $this->user->id,
        ]);

        $response = $this->actingAs($this->user)
            ->getJson('/aio/api/whmcs/invoices');

        $response->assertOk()
            ->assertJsonStructure([
                'data' => [
                    '*' => [
                        'id',
                        'number',
                        'status',
                        'total',
                        'due_date',
                        'client',
                    ],
                ],
            ])
            ->assertJsonCount(3, 'data');
    }

    public function test_can_create_invoice_with_items(): void
    {
        $product = Product::factory()->create();

        $data = [
            'client_id' => $this->user->id,
            'due_date' => now()->addDays(7)->format('Y-m-d'),
            'status' => 'unpaid',
            'items' => [
                [
                    'description' => 'Web Hosting - Monthly',
                    'amount' => 100000,
                    'quantity' => 1,
                    'product_id' => $product->id,
                ],
                [
                    'description' => 'Domain Registration',
                    'amount' => 50000,
                    'quantity' => 1,
                ],
            ],
        ];

        $response = $this->actingAs($this->user)
            ->postJson('/aio/api/whmcs/invoices', $data);

        $response->assertCreated()
            ->assertJsonStructure([
                'success',
                'data' => ['id', 'number', 'total'],
            ]);

        $this->assertDatabaseHas('whmcs_invoices', [
            'client_id' => $this->user->id,
            'status' => 'unpaid',
        ]);

        $this->assertDatabaseHas('whmcs_invoice_items', [
            'description' => 'Web Hosting - Monthly',
            'unit_price' => 100000,
        ]);

        // Check total calculation
        $invoice = Invoice::latest()->first();
        $this->assertEquals(150000, $invoice->total);
    }

    public function test_can_mark_invoice_as_paid(): void
    {
        $invoice = Invoice::factory()->create([
            'client_id' => $this->user->id,
            'status' => 'unpaid',
            'total' => 100000,
        ]);

        $response = $this->actingAs($this->user)
            ->postJson("/aio/api/whmcs/invoices/{$invoice->id}/payment", [
                'amount' => 100000,
                'payment_method' => 'vnpay',
                'transaction_id' => 'TXN123456',
            ]);

        $response->assertOk()
            ->assertJsonFragment(['status' => 'paid']);

        $this->assertDatabaseHas('whmcs_invoices', [
            'id' => $invoice->id,
            'status' => 'paid',
        ]);
    }

    public function test_can_cancel_unpaid_invoice(): void
    {
        $invoice = Invoice::factory()->create([
            'client_id' => $this->user->id,
            'status' => 'unpaid',
        ]);

        $response = $this->actingAs($this->user)
            ->postJson("/aio/api/whmcs/invoices/{$invoice->id}/cancel");

        $response->assertOk();

        $this->assertDatabaseHas('whmcs_invoices', [
            'id' => $invoice->id,
            'status' => 'cancelled',
        ]);
    }

    public function test_cannot_cancel_paid_invoice(): void
    {
        $invoice = Invoice::factory()->create([
            'client_id' => $this->user->id,
            'status' => 'paid',
        ]);

        $response = $this->actingAs($this->user)
            ->postJson("/aio/api/whmcs/invoices/{$invoice->id}/cancel");

        $response->assertStatus(422)
            ->assertJsonFragment(['message' => 'Cannot cancel paid invoice']);
    }

    public function test_can_filter_invoices_by_status(): void
    {
        Invoice::factory()->create([
            'client_id' => $this->user->id,
            'status' => 'paid',
            'number' => 'INV-001',
        ]);

        Invoice::factory()->create([
            'client_id' => $this->user->id,
            'status' => 'unpaid',
            'number' => 'INV-002',
        ]);

        $response = $this->actingAs($this->user)
            ->getJson('/aio/api/whmcs/invoices?status=unpaid');

        $response->assertOk()
            ->assertJsonFragment(['number' => 'INV-002'])
            ->assertJsonMissing(['number' => 'INV-001']);
    }

    public function test_invoice_total_is_calculated_correctly(): void
    {
        $invoice = Invoice::factory()->create([
            'client_id' => $this->user->id,
        ]);

        InvoiceItem::factory()->create([
            'invoice_id' => $invoice->id,
            'unit_price' => 100000,
            'qty' => 2,
        ]);

        InvoiceItem::factory()->create([
            'invoice_id' => $invoice->id,
            'unit_price' => 50000,
            'qty' => 1,
        ]);

        $invoice->refresh();
        $this->assertEquals(250000, $invoice->total);
    }

    public function test_generates_unique_number(): void
    {
        $invoice1 = Invoice::factory()->create(['client_id' => $this->user->id]);
        $invoice2 = Invoice::factory()->create(['client_id' => $this->user->id]);

        $this->assertNotEquals($invoice1->number, $invoice2->number);
    }
}
