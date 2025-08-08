<div class="logo_area hidden-md hidden-sm hidden-xs">
    <div class="container">
        <div class="row">
            <div class="col-12">
                <div class="topbar">
                    <div class="row">
                        <div class="col-md-9 align-self-center">
                            <div class="link_area">
                                <ul class="list-inline menu-top">
                                    <li>
                                        <div class="news_title">
                                            <span class="pull-right clock" id="clock"></span>
                                            <span class="pull-right">{{ __('user.date') }} {{ date('d-m-Y') }}</span>

                                        </div>
                                    </li>
                                    <li class="vst"><a href="#"
                                            title="{{ $config->name }}">{{ $config->name }}</a><span>&nbsp;</span>
                                    </li>
                                </ul>
                            </div>
                        </div>
                        <div class="col-md-3 align-self-center">
                            @php
                                $langs = app('Helper')->getDataByConditions('languages');
                                $langId = app('Helper')->getCurrentLang();
                            @endphp

                            <div class="top_date_social text-right">
                                <div class="lang-3">
                                    <select id="select-option-search" class="lang-3"
                                        onchange="window.location.href = this.value;">

                                        @foreach ($langs as $lang)
                                            <option {{ $langId == $lang->id ? 'selected' : '' }}
                                                value="{{ route('changeLang', ['lang' => $lang->code]) }}">
                                                {{ $lang->name }}
                                            </option>
                                        @endforeach

                                    </select>
                                    <a title="RSS" class="rss" aria-label="rss">
                                        <i class="fas fa-globe-europe"></i>
                                        </i>
                                    </a>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="border4"></div>
                </div>
            </div>

            <div class="logo-area-div align-self-center" style="padding-left: 11px">
                <div class="logo4">
                    <a href="{{ route('home') }}">
                        <img src="{{$config->logo}}" alt="{{ $config->name }}"
                            style="width:120px;" />
                    </a>
                </div>
            </div>
            <div class="col-lg-9 align-self-center">
                <div class="justify-content-end">
                    <div class="row">
                        <div class="col-12">
                            <div class="row justify-content-end top-indexs" id="top-indexs"></div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>
