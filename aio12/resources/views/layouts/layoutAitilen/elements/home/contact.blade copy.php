@if ($page->block_type == 'contact')

    @php
        $blockContact01 = app('Helper')->getDataLang(
            'block_contact01',
            ['block_contact01.page_setting_id' => $page->data_id],
            ['block_contact01.sort_order' => 'asc'],
        );
        $blockContact02 = app('Helper')->getDataLang(
            'block_contact02',
            ['block_contact02.page_setting_id' => $page->data_id],
            ['block_contact02.sort_order' => 'asc'],
            1
        );
    @endphp

    <section class="section section8" id="section_2131306808">

        {!! app('Helper')->editTitle($page, true) !!}

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
                            <div id="col-1134378372" class="col medium-4 small-12 large-4">
                                <div class="col-inner">
                                    <div class="icon-box featured-box icon-box-left text-left">
                                        <div class="icon-box-img" style="width: 40px">
                                            <div class="icon">
                                                <div class="icon-inner">
                                                    <svg width="800px" height="800px" viewBox="0 0 1024 1024"
                                                        fill="#000000" class="icon" version="1.1"
                                                        xmlns="http://www.w3.org/2000/svg">
                                                        <path
                                                            d="M456.8 994.4c27.2 30.4 72.8 30.4 100-0.8 2.4-2.4 7.2-8 14.4-16 12-12.8 24.8-28 38.4-44.8 40-47.2 80-98.4 117.6-150.4s70.4-103.2 96.8-151.2c49.6-88.8 76.8-165.6 76.8-228.8 0.8-222.4-176-402.4-394.4-402.4S112 180 112 402.4c0 63.2 27.2 140.8 76.8 229.6 27.2 48 60 99.2 96.8 151.2 37.6 52 77.6 103.2 117.6 150.4 14.4 16.8 27.2 32 38.4 44.8 8 8 12.8 13.6 15.2 16z m35.2-32.8c-2.4-2.4-7.2-8-14.4-16-11.2-12.8-24-28-37.6-44-39.2-46.4-78.4-96.8-115.2-147.2C288 703.2 256 654.4 230.4 608 184.8 525.6 160 455.2 160 402.4 160 207.2 315.2 48.8 506.4 48.8s347.2 158.4 347.2 353.6c0 52.8-24.8 123.2-70.4 204.8-25.6 46.4-57.6 96-94.4 146.4-36.8 51.2-76 100.8-115.2 147.2-13.6 16-26.4 31.2-37.6 44-7.2 8-12 12.8-14.4 16-8.8 9.6-20.8 10.4-29.6 0.8z"
                                                            fill="" />
                                                        <path
                                                            d="M506.4 578.4c-108 0-196-88-196-196s88-196 196-196 196 88 196 196-88 196-196 196z m0-344c-81.6 0-148 66.4-148 148s66.4 148 148 148S654.4 464 654.4 382.4s-66.4-148-148-148z"
                                                            fill="" />
                                                    </svg>
                                                </div>
                                            </div>
                                        </div>
                                        <div class="icon-box-text last-reset">
                                            <h3>VĂN PHÒNG CÔNG TY</h3>
                                            <p>{{ $config->office }}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div id="col-1470040330" class="col medium-4 small-12 large-4">
                                <div class="col-inner">
                                    <div class="icon-box featured-box icon-box-left text-left">
                                        <div class="icon-box-img" style="width: 40px">
                                            <div class="icon">
                                                <div class="icon-inner">
                                                    <svg fill="#000000" width="800px" height="800px"
                                                        viewBox="0 0 32 32" version="1.1"
                                                        xmlns="http://www.w3.org/2000/svg">
                                                        <title>phone-plus</title>
                                                        <path
                                                            d="M19.949 7.75h4.252v4.251c0 0.414 0.336 0.75 0.75 0.75s0.75-0.336 0.75-0.75v0-4.251h4.25c0.414 0 0.75-0.336 0.75-0.75s-0.336-0.75-0.75-0.75v0h-4.25v-4.251c0-0.414-0.336-0.75-0.75-0.75s-0.75 0.336-0.75 0.75v0 4.251h-4.252c-0.414 0-0.75 0.336-0.75 0.75s0.336 0.75 0.75 0.75v0zM30.637 23.15c-0.109-0.675-0.334-1.281-0.654-1.823l0.013 0.024c-0.114-0.186-0.301-0.317-0.521-0.353l-0.004-0.001-8.969-1.424c-0.035-0.006-0.076-0.009-0.117-0.009-0.207 0-0.395 0.083-0.531 0.218l0-0c-0.676 0.68-1.194 1.516-1.496 2.451l-0.012 0.044c-4.016-1.64-7.141-4.765-8.742-8.675l-0.038-0.105c0.978-0.314 1.814-0.833 2.493-1.509l-0 0c0.136-0.136 0.22-0.324 0.22-0.531 0-0.041-0.003-0.081-0.010-0.12l0.001 0.004-1.425-8.969c-0.036-0.224-0.167-0.412-0.35-0.524l-0.003-0.002c-0.505-0.301-1.094-0.522-1.724-0.626l-0.029-0.004c-0.315-0.070-0.677-0.111-1.048-0.111-0.025 0-0.050 0-0.075 0.001l0.004-0h-0.006c-3.497 0.024-6.326 2.855-6.347 6.351v0.002c0.015 12.761 10.355 23.102 23.115 23.117h0.002c3.5-0.023 6.331-2.854 6.354-6.351v-0.002c0-0.020 0-0.044 0-0.068 0-0.356-0.036-0.703-0.106-1.038l0.006 0.033zM24.383 29.076c-11.933-0.014-21.602-9.684-21.616-21.616v-0.001c0.019-2.673 2.182-4.835 4.854-4.853h0.002c0.016-0 0.036-0 0.055-0 0.272 0 0.537 0.030 0.793 0.086l-0.024-0.005c0.366 0.060 0.695 0.161 1.003 0.3l-0.025-0.010 1.302 8.202c-0.628 0.528-1.404 0.901-2.257 1.050l-0.029 0.004c-0.355 0.064-0.62 0.37-0.62 0.739 0 0.088 0.015 0.172 0.043 0.25l-0.002-0.005c1.772 5.072 5.695 8.994 10.646 10.729l0.121 0.037c0.073 0.026 0.157 0.041 0.245 0.041 0.368 0 0.674-0.265 0.737-0.615l0.001-0.005c0.153-0.882 0.526-1.658 1.061-2.295l-0.006 0.007 8.201 1.303c0.133 0.294 0.237 0.636 0.296 0.994l0.003 0.024c0.046 0.219 0.073 0.471 0.073 0.729 0 0.018-0 0.035-0 0.053l0-0.003c-0.016 2.675-2.179 4.84-4.852 4.859h-0.002z">
                                                        </path>
                                                    </svg>
                                                </div>
                                            </div>
                                        </div>
                                        <div class="icon-box-text last-reset">
                                            <h3>GỌI NGAY 24/7</h3>
                                            <p>Hotline: <a
                                                    href="tel:{{ $config->phone_language }}">{{ $config->phone_language }}</a>
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div id="col-1176158673" class="col medium-4 small-12 large-4">
                                <div class="col-inner">
                                    <div class="icon-box featured-box icon-box-left text-left">
                                        <div class="icon-box-img" style="width: 40px">
                                            <div class="icon">
                                                <div class="icon-inner">
                                                    <svg fill="#000000" width="800px" height="800px"
                                                        viewBox="0 0 32 32" version="1.1"
                                                        xmlns="http://www.w3.org/2000/svg">
                                                        <title>envelope-open</title>
                                                        <path
                                                            d="M30.738 11.941c-0-0.030-0.002-0.059-0.006-0.088l0 0.004c-0.009-0.033-0.019-0.060-0.030-0.086l0.002 0.005c-0.014-0.044-0.029-0.082-0.047-0.119l0.002 0.004c-0.014-0.030-0.027-0.055-0.042-0.079l0.002 0.003-0.010-0.021c-0.011-0.016-0.029-0.024-0.041-0.039-0.028-0.034-0.058-0.064-0.090-0.091l-0.001-0.001c-0.016-0.013-0.024-0.032-0.041-0.044l-14.024-10.011c-0.041-0.025-0.089-0.047-0.14-0.064l-0.005-0.001c-0.078-0.041-0.17-0.064-0.267-0.064s-0.189 0.024-0.27 0.066l0.003-0.002c-0.055 0.018-0.103 0.040-0.148 0.067l0.003-0.002-0.024 0.011-14 10c-0.017 0.012-0.025 0.031-0.041 0.044-0.033 0.028-0.062 0.057-0.089 0.089l-0.001 0.001c-0.013 0.016-0.032 0.024-0.044 0.041l-0.010 0.023c-0.012 0.020-0.025 0.044-0.036 0.069l-0.002 0.004c-0.016 0.032-0.032 0.070-0.044 0.109l-0.001 0.005c-0.009 0.022-0.019 0.049-0.027 0.077l-0.001 0.005c-0.003 0.025-0.005 0.054-0.006 0.083v0c-0.002 0.021-0.012 0.038-0.012 0.059v16c0.002 1.518 1.232 2.748 2.75 2.75h24c1.518-0.002 2.748-1.232 2.75-2.75v-16c0-0.021-0.010-0.038-0.012-0.059zM16 21.079l-12.71-9.079 12.71-9.079 12.71 9.079zM28 29.25h-24c-0.69-0.001-1.249-0.56-1.25-1.25v-14.543l12.814 9.152c0.013 0.010 0.031 0.006 0.044 0.014 0.108 0.073 0.241 0.119 0.383 0.124l0.001 0 0.005 0.002h0.002l0.005-0.002c0.144-0.005 0.276-0.051 0.387-0.126l-0.003 0.002c0.014-0.009 0.031-0.005 0.044-0.014l12.814-9.152v14.543c-0.001 0.69-0.56 1.249-1.25 1.25h-0z">
                                                        </path>
                                                    </svg>
                                                </div>
                                            </div>
                                        </div>
                                        <div class="icon-box-text last-reset">
                                            <h3>GỬI EMAIL</h3>
                                            <p>
                                                <a href="mailto:{{ $config->email }}">{{ $config->email }}</a>
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
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
                        <p style="text-align: center;"><span style="color: #808080;">BIỂU MẪU LIÊN HỆ</span></p>
                        <h2 class="text-uppercase topmargin_5 bottommargin_25" style="text-align: center;">CONTACT FORM
                        </h2>
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
                                                    aria-invalid="false"
                                                    placeholder="{{ __('user.enter_your_email') }}" value=""
                                                    type="email" name="contact[email]" />
                                                <label class="error email_error _red" id="email_error"
                                                    for="email"></label>
                                            </span>
                                        </p>
                                    </div>
                                    <div class="col large-6">
                                        <p>
                                            <span class="wpcf7-form-control-wrap" data-name="email-745">
                                                <select id="area" class="wpcf7-form-control wpcf7-text" name="contact[area]">
                                                    <option value="">{{ __('user.select_area') }}</option>
                                                    <option value="1">{{ __('user.vietnam') }}</option>
                                                    <option value="2">{{ __('user.english') }}</option>
                                                    <option value="3">{{ __('user.china') }}</option>
                                                    <option value="4">{{ __('user.other') }}</option>
                                                </select>
                                                <label class="error area_error _red" id="area_error" for="area"></label>
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
            console.log('datazzzx',  formData);

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
