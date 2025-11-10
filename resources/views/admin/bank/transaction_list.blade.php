@extends('admin.layout')

@section('title', 'Giao dịch ngân hàng')

@section('content')
<div id="bank-transaction-root"></div>
@endsection

@push('scripts')
@viteReactRefresh
@vite('resources/js/pages/bank/BankTransactionList.tsx')
@endpush
