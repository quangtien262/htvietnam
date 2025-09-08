<div class="col-sm-12">
    <label for="{{ $key }}">
        <b>{{ $block[$key] }}</b>
        <span class="_red">*</span>
    </label>
    <input id="{{ $key }}" name="images_file[]" type="file" class="form-control required valid" multiple/>

    @if(!empty($landingpage->{$key}))
        <br/>
        <div class="row">
        @foreach($landingpage->{$key} as $k => $img)
                <div class="col" id="img-{{ $k }}">
                    <a class="land-icon-delete-img" onclick="removeElement('#img-{{ $k }}')">Xóa</a>
                    <img class="imgs-land" src="{{ $img }}"/>
                    <input type="hidden" value="{{ $img }}" name="data[images][]"/>
                </div>
        @endforeach
    </div>
    @endif
    <br>
</div>
