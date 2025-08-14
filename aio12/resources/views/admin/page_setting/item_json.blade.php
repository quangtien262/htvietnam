<div class="col-sm-12">
    <label for="fullname"><b>{{ $val['display_name'] }}</b><span class="_red">*</span></label>
    <input id="description-idx" type="hidden" value="{{ count($val['setting']) + 1 }}"/>
    <table>
        <tr>
            <th>STT</th>
            @foreach($val['setting'] as $k => $v)
                <th>{{ $v['display_name'] }}</th>
            @endforeach
        </tr>

        @for($i = 0; $i<15; $i++)
            @php
                $text = '<td class="stt">'.($i+1).' <a onclick="emptyLandInput(\'#item-'.$i.'\')">Xóa</a></td>';
                $hidden = '_hidden';
            @endphp

            @foreach($val['setting'] as $k => $v)
                {{-- text --}}
                @if($v['type'] == 'text')
                    @php
                        $inputValue = '';
                        if(!empty($landingpage->{$key}[$i][$k])) {
                            $inputValue = $landingpage->{$key}[$i][$k];
                        }
                        if(!empty($landingpage->{$key}[$i][$k])) {
                            $hidden = '';
                        }
                        $text .= '<td><input type="text" name="'.$key.'['.$k.'][]" value="' . $inputValue . '" placeholder="'.$v['display_name'].'"/></td>';
                    @endphp
                @endif

                {{-- textarea --}}
                @if($v['type'] == 'textarea')
                    @php
                        $inputValue = '';
                        if(!empty($landingpage->{$key}[$i][$k])) {
                            $inputValue = $landingpage->{$key}[$i][$k];
                        }
                        if(!empty($landingpage->{$key}[$i][$k])) {
                            $hidden = '';
                        }
                        $text .= '<td><textarea name="'.$key.'['.$k.'][]" placeholder="'.$v['display_name'].'">' . $inputValue . '</textarea></td>';
                    @endphp
                @endif

                {{-- image --}}
                @if($v['type'] == 'image')
                    @php
                        $inputValue = '';
                        if(!empty($landingpage->{$key}[$i][$k])) {
                            $inputValue = $landingpage->{$key}[$i][$k];
                        }
                        if(!empty($landingpage->{$key}[$i][$k])) {
                            $hidden = '';
                        }
                        $text .= '<td class="land-td-img">
                                    <input type="file" name="'.$key.'['.$k.'][]"/>
                                    <img class="imgs-land" src="'.$inputValue.'"/>
                                    <input type="hidden" value="'.$inputValue.'" name="hiden['.$key.']['.$k.'][]"/>
                                </td>';
                    @endphp
                @endif
            @endforeach

            <tr id="item-{{ $i }}" class="{{ $hidden }}">{!! $text !!}</tr>

            @if($i >= count($landingpage->description_json01))
                <tr id="main-add-item-{{ $i }}" class="{{ $i == (count($landingpage->description_json01) + 1) ? '':'_hidden' }}">
                    <td class="main-add-item" colspan="{{ (count($val['setting']) + 1) }}">
                        <a id="btn-add-{{ $i }}" class="btn-add"
                            onclick="addItem('#main-add-item-{{ $i }}', '#item-{{ $i }}', '#main-add-item-{{ ($i + 1) }}')">Thêm</a>
                    </td>
                </tr>
            @endif

        @endfor

    </table>
    <br>
</div>
