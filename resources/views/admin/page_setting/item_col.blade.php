@foreach($val as $name => $setting)
    @php
        if(!in_array($name, $col)) {
            continue;
        }
    @endphp
    @if(in_array($setting['type'], ['text']))
        <div class="col-sm-12">
            <label for="{{ $name }}">
                <b>{{ $setting['display_name'] }}</b>
                <span class="_red">*</span>
            </label>
            <input id="{{ $name }}" name="data[{{ $name }}]" value="{{ $landingpage->{$name} }}" type="text" maxlength="250" class="form-control required valid"/>
            <br>
        </div>
    @endif

    @if(in_array($setting['type'], ['textarea']))
        <div class="col-sm-12">
            <label for="textarea_{{ $name }}">
                <b>{{ $setting['display_name'] }}</b>
                <span class="_red">*</span>
            </label>
            <textarea id="textarea_{{ $name }}" name="data[{{ $name }}]" class="form-control">{{ $landingpage->{$name} }}</textarea>
            <br>
        </div>
    @endif

    @if(in_array($setting['type'], ['checkbox']))
        <div class="col-sm-12">
            <input id="chk_{{ $name }}" name="data[{{ $name }}]" type="checkbox" value="1" {{ $landingpage->{$name} == 1 ? 'checked':'' }} />
            <label for="chk_{{ $name }}">
                <b>{{ $setting['display_name'] }}</b>
                <span class="_red">*</span>
            </label>
            <br>
            <br>
        </div>
    @endif

    @if(in_array($setting['type'], ['editor']))
        <div class="col-sm-12">
            <label for="chk_{{ $name }}">
                <b>{{ $setting['display_name'] }}</b>
                <span class="_red">*</span>
            </label>
            <textarea id="chk_{{ $name }}" name="data[{{ $name }}]" class="summernote">{{ $landingpage->{$name} }}</textarea>
            <br>
            <br>
        </div>
    @endif

@endforeach
