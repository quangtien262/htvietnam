@extends('admin.landingpage.land_layout')
@section('content')
<div class="card">
    <div class="card-body">
        <div class="row">
            <div class="col-md-12">
                <div id="nestable" class="dd">
                    {!! $htmlListDragDrop !!}
                </div>
                @csrf
                <textarea id="nestable-output" class="well sort-order-output _hidden"></textarea>
            </div>
        </div>

    </div>
@endsection

