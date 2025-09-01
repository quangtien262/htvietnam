@if ($page->block_type == 'contact')

    @php

        $countries = app('Helper')->getDataByConditions(
            'countries',
            [], 
            ['sort_order' => 'asc']
        );

        $blockContact01 = app('Helper')->getDataLang(
            'block_contact01',
            ['block_contact01.page_setting_id' => $page->data_id],
            ['block_contact01.sort_order' => 'asc'],
        );
        $blockContact02 = app('Helper')->getDataLang(
            'block_contact02',
            ['block_contact02.page_setting_id' => $page->data_id],
            ['block_contact02.sort_order' => 'asc'],
            1,
        );
    @endphp

    <section class="section section8" id="section_2131306808">

        <div class="main-btn-edit">
            {!! app('Helper')->editTitle($page, false) !!}
            {!! app('Helper')->editContent($page, 'block_contact01', false) !!}
        </div>

        <div class="bg section-bg fill bg-fill  bg-loaded">
        </div>
        <div class="section-content relative">
            <div class="row" id="row-1685652838">
                <div id="col-1326594740" class="col small-12 large-12">
                    <div class="col-inner">
                        <div class="tieu-de">
                            <p style="text-align: center;">{{ $page->description }}</p>
                            <h2 style="text-align: center;">{{ $page->name_data }}</h2>
                        </div>
                        <p style="text-align: center;"><span
                                style="color: #808080; font-size: 95%;"><em>{!! $page->content !!}</em></span>
                        </p>
                    </div>
                </div>
                <div id="col-138382314" class="col cot2 small-12 large-12">
                    <div class="col-inner">
                        <div class="row" id="row-1920657609">

                            @foreach ($blockContact01 as $block1)
                                <div id="col-{{ $block1->id }}" class="col medium-4 small-12 large-4">
                                    <div class="col-inner">
                                        <div class="icon-box featured-box icon-box-left text-left">
                                            <div class="icon-box-img" style="width: 40px">
                                                <div class="icon">
                                                    <div class="icon-inner" style="font-size: 40px">
                                                        {!! $block1->icon !!}</div>
                                                </div>
                                            </div>
                                            <div class="icon-box-text last-reset">
                                                <h3>{{ $block1->name_data }}</h3>
                                                <p>{!! $block1->content !!}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            @endforeach

                        </div>
                    </div>
                </div>
            </div>
            <div id="gap-1849631399" class="gap-element clearfix" style="display:block; height:auto;">
                <style>
                    #gap-1849631399 {
                        padding-top: 15px;
                    }
                </style>
            </div>
            <div class="row row2" style="max-width:800px" id="row-933585152">

                <div id="col-1544171652" class="col cot3 small-12 large-12">
                    <div class="col-inner">

                        {!! app('Helper')->editBlock($page, 'block_contact02', $blockContact02->data_id, true) !!}

                        <p style="text-align: center;"><span
                                style="color: #808080;">{{ $blockContact02->description }}</span></p>
                        <h2 class="text-uppercase topmargin_5 bottommargin_25" style="text-align: center;">
                            {{ $blockContact02->name_data }}</h2>
                        <div class="wpcf7 no-js" id="wpcf7-f563-p2-o1" lang="vi" dir="ltr">

                            <div class="screen-reader-response">
                                <p role="status" aria-live="polite" aria-atomic="true"></p>
                                <ul></ul>
                            </div>
                            <form id="contactForm" action="{{ route('contact') }}" method="post"
                                class="wpcf7-form init" aria-label="Contact form" data-status="init">
                                @csrf
                                <div class="form-lien-he row">
                                    <div class="col large-6">
                                        <p>
                                            <span class="wpcf7-form-control-wrap" data-name="text-981">
                                                <input size="40"
                                                    class="wpcf7-form-control wpcf7-text wpcf7-validates-as-required"
                                                    aria-required="true" aria-invalid="false"
                                                    placeholder="{{ __('user.enter_your_name') }}" value=""
                                                    type="text" name="contact[name]" />
                                                <label class="error name_error _red" id="name_error"
                                                    for="name"></label>
                                            </span>

                                        </p>
                                    </div>
                                    <div class="col large-6">
                                        <p>
                                            <span class="wpcf7-form-control-wrap" data-name="email-745">
                                                <input size="40"
                                                    class="wpcf7-form-control wpcf7-text wpcf7-email wpcf7-validates-as-email"
                                                    aria-invalid="false" placeholder="{{ __('user.enter_your_email') }}"
                                                    value="" type="email" name="contact[email]" />
                                                <label class="error email_error _red" id="email_error"
                                                    for="email"></label>
                                            </span>
                                        </p>
                                    </div>
                                    <div class="col large-6">
                                        <p>
                                            <span class="wpcf7-form-control-wrap" data-name="email-745">
                                                <select id="area" class="wpcf7-form-control wpcf7-text"
                                                    name="contact[area]">
                                                    @foreach ($countries as $country)
                                                        <option value="{{ $country->id }}">{{ $country->name }}</option>
                                                    @endforeach
                                                </select>
                                                <label class="error area_error _red" id="area_error"
                                                    for="area"></label>
                                            </span>
                                        </p>
                                    </div>
                                    <div class="col large-6">
                                        <p>
                                            <span class="wpcf7-form-control-wrap" data-name="email-745">
                                                <input size="40" class="wpcf7-form-control wpcf7-text"
                                                    aria-invalid="false" placeholder="{{ __('user.phone') }}"
                                                    value="" type="text" name="contact[phone]" />
                                                <label class="error phone_error _red" id="phone_error"
                                                    for="phone"></label>
                                            </span>
                                        </p>
                                    </div>

                                    <div class="col large-12">
                                        <p>
                                            <span class="wpcf7-form-control-wrap" data-name="title">
                                                <input size="40" class="wpcf7-form-control wpcf7-text"
                                                    aria-invalid="false" placeholder="{{ __('user.title') }}"
                                                    value="" type="text" name="contact[title]" />
                                                <label class="error title_error _red" id="title_error"
                                                    for="title"></label>
                                            </span>
                                        </p>
                                    </div>
                                    <div class="col large-12">
                                        <p>
                                            <span class="wpcf7-form-control-wrap" data-name="content">
                                                <textarea cols="40" rows="10" class="wpcf7-form-control wpcf7-textarea" aria-invalid="false"
                                                    placeholder="{{ __('user.enter_your_message') }}" name="contact[content]"></textarea>
                                                <label class="error content_error _red" id="content_error"
                                                    for="content"></label>
                                            </span>
                                            <br />
                                        <p id="result" class="_success"></p>
                                        <input class="wpcf7-form-control has-spinner wpcf7-submit btn-submit"
                                            type="button" onclick="sendContact('#contactForm')"
                                            data-wait="{{ __('user.sending') }}" data-id="contact01"
                                            id="btnContact01" value="{{ __('user.send_message') }}" />
                                        </p>
                                    </div>
                                </div>
                                <div class="wpcf7-response-output" aria-hidden="true"></div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </section>

    <script>
        

        function sendContact(formID) {
            var $jq = jQuery.noConflict();
            $jq('#result').html('<img width="20px" src="/images/loading/loader.big.black.gif"/>Đang gửi yêu cầu.... ');

            validationFormContact(formID);

            var form = $jq(formID);

            var formArray = $jq(formID).serializeArray();
            var formData = formArray.reduce(function(obj, item) {
                obj[item.name] = item.value;
                return obj;
            }, {});
            console.log(formData);
            console.log('datazzzx', formData);

            $jq.ajax({
                type: "POST",
                url: '{{ route('sendContact02') }}',
                data: formData, //only input
                dataType: 'json',
                success: function(response) {
                    console.log(response);
                    if (response.status_code === 400) {
                        $jq(formID + ' ' + response.message).text(response.errors)
                        $jq('#result').html('');
                    }
                    if (response.status_code === 200) {
                        // disable button btn-submit
                        $jq('#btnContact01').prop('disabled', true);
                        // ket qua
                        $jq('#result').html('{{ __('user.send_contact_success') }}')
                    }
                },
                error: function(error) {
                    $jq(formID + ' .result').text(
                        '{{ __('user.send_contact_error') }}'
                    )
                }
            });
        };


        function validationFormContact(formID) {
            $jq(formID + '  .name_error').text('');
            $jq(formID + '  .email_error').text('');
            $jq(formID + '  .phone_error').text('');
            $jq(formID + '  .content_error').text('');
            $jq(formID + '  .title_error').text('');
            $jq(formID + '  .area_error').text('');
        }
    </script>
@endif
