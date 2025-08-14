@extends('admin.page_setting_layout.land_layout')
 @section('content')
<div class="card">
    <div class="card-body">
        <h4><span class="type-block"> {{ $landingpage->type }} </span>: "{{ $landingpage->name }}"</h4>
        <fieldset>
            <input type="hidden" name="id" value="{{ $id }}"/>
            <input type="hidden" name="block_name" value="{{ $blockName }}"/>
            <div class="row">

                <div class="col-sm-12">
                    <input id="chk_active" name="data[active]" type="checkbox" value="0" />
                    <label for="chk_active">
                        Tạm Ẩn khối này ({{ $landingpage->name }})
                    </label>
                    <br>
                    <br>
                </div>

                @foreach($block as $key => $val)

                @if($key == 'col')
                    @include('admin.landingpage.item_col')
                @endif

                @php
                    if(!in_array($key, $col)) {
                        continue;
                    }
                @endphp

                @if(in_array($key, ['description_json01', 'description_json02', 'description_json03', 'description_json04']))
                    @include('admin.landingpage.item_json')
                @endif

                @if(in_array($key, ['image01', 'image02', 'image03', 'image04']))
                    @include('admin.landingpage.item_image')
                @endif

                @if(in_array($key, ['images']))
                    @include('admin.landingpage.item_images')
                @endif

                @endforeach
            </div>
        </fieldset>
    </div>
</div>
@endsection
