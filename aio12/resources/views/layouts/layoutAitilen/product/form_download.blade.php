<div id="col-1544171652" class="col cot3 small-12 large-12">
    <input type="hidden" id="code" name="code" value="">
    <div class="col-inner">
        <div class="wpcf7 no-js" id="wpcf7-f563-p2-o1" lang="vi" dir="ltr">

            <div class="screen-reader-response">
                <p role="status" aria-live="polite" aria-atomic="true"></p>
                <ul></ul>
            </div>

            <div class="form-confirm row _hidden">
                <div class="col large-12">
                    <p><em class="_success">{{__('layout01.code_description')}}</em></p>
                    <p>
                        <span class="wpcf7-form-control-wrap" data-name="text-981">
                            <input id="enter_code" size="40"
                                class="wpcf7-form-control wpcf7-text wpcf7-validates-as-required" aria-required="true"
                                aria-invalid="false" placeholder="{{ __('layout01.code_confirm') }}" value=""
                                type="text" name="enter_code" />
                            <label class="error name_error _red" id="code_error"></label>
                        </span>

                    </p>
                    <input id="btnDownload" class="wpcf7-form-control has-spinner  btn-submit" type="button"
                        onclick="download()" data-wait="{{ __('user.sending') }}" data-id="contact01" id="btnContact01"
                        value="{{ __('user.download') }}" />
                </div>

            </div>

            <form id="contactForm" action="{{ route('contact') }}" method="post" class="wpcf7-form init"
                aria-label="Contact form" data-status="init">
                @csrf
                <input type="hidden" name="contact[title]" value="download TDS">
                <input type="hidden" name="contact[content]" value="Sản phẩm {{ $product->name_data }} ">
                <div class="form-lien-he row">
                    <div class="col large-6">
                        <p>
                            <span class="wpcf7-form-control-wrap" data-name="text-981">
                                <input id="name" size="40"
                                    class="wpcf7-form-control wpcf7-text wpcf7-validates-as-required"
                                    aria-required="true" aria-invalid="false"
                                    placeholder="{{ __('user.enter_your_name') }}" value="" type="text"
                                    name="contact[name]" />
                                <label class="error name_error _red" id="name_error" for="name"></label>
                            </span>

                        </p>
                    </div>
                    <div class="col large-6">
                        <p>
                            <span class="wpcf7-form-control-wrap" data-name="email-745">
                                <input size="40" id="phone" class="wpcf7-form-control wpcf7-text" aria-invalid="false"
                                    placeholder="{{ __('user.phone') }}" value="" type="text" name="contact[phone]" />
                                <label class="error phone_error _red" id="phone_error" for="phone"></label>
                            </span>
                        </p>
                    </div>

                    <div class="col large-12">
                        <p>
                            <span class="wpcf7-form-control-wrap" data-name="email-745">
                                <textarea size="40" id="content"
                                    class="wpcf7-form-control wpcf7-text wpcf7-email wpcf7-validates-as-email"
                                    aria-invalid="false" placeholder="{{ __('user.enter_your_email') }}" value=""
                                    name="contact[textarea]"></textarea>
                                <label class="error email_error _red" id="email_error" for="email"></label>
                            </span>
                        </p>
                    </div>
                    <div class="col large-12">
                        <p id="result" class="_success text-center"></p>
                        <input class="wpcf7-form-control has-spinner btn-submit" type="button"
                            onclick="sendContact('#contactForm')" data-wait="{{ __('user.sending') }}"
                            data-id="contact01" id="btnContact01" value="Gửi liên hệ" />
                    </div>
                </div>
            </form>
        </div>
    </div>
</div>

<script>
    function download() {
        var code = $jq('#code').val();
        var enter_code = $jq('#enter_code').val();
        if(enter_code == ''){
            $jq('#code_error').text('{{ __('validation.code_is_empty') }}');
            return false;
        }

        if(code != enter_code){
            $jq('#code_error').text('{{ __('validation.code_is_not_match') }}');
            return false;
        }
        $jq('#code_error').text('');
        $jq('#btnDownload').prop('disabled', true);
        window.location.href = '{{ route('product.download', ['id' => $product->id]) }}';
    }
    function sendContact(formID) {

        var check = validationFormContact(formID);
        if(check == false){
            return false;
        }

        $jq('#result').html('<img width="20px" src="/images/loading/loader.big.black.gif"/>Đang gửi yêu cầu.... ');

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
            url: '{{ route('downloadTDS') }}',
            data: formData, //only input
            dataType: 'json',
            success: function(response) {
                console.log('response', response);
                if (response.status_code === 400) {
                    $jq(formID + ' ' + response.message).text(response.errors)
                    $jq('#result').html('');
                }
                if (response.status_code === 200) {
                    // disable button btn-submit
                    // $jq('#btnContact01').prop('disabled', true);
                    // ket qua
                    $jq('#result').html('{{ __('user.request_download_success') }}');
                    $jq('.form-confirm').removeClass('_hidden');
                    $jq('.form-lien-he').addClass('_hidden');
                    $jq('#code').val(response.data);

                    // window.location.href = '{{ route('product.download', ['id' => $product->id]) }}';
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
            $jq(formID + '  .area_error').text('');

            result = true;

            if ($jq('#name').val() == '') {
                $jq('#name_error').text('{{ __('validation.full_name_is_empty') }}');
                result = false;
            }

            if ($jq('#email').val() == '') {
                $jq('#email_error').text('{{ __('validation.email_is_empty') }}');
                result = false;
            } else {
                // check email
                var email = $jq('#email').val();
                var regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (!regex.test(email)) {
                    $jq('#email_error').text('{{ __('validation.email_invalid') }}');
                    result = false;
                }
            }

            if ($jq('#phone').val() == '') {
                $jq('#phone_error').text('{{ __('validation.phone_is_empty') }}');
                result = false;
            }

            if ($jq('#area').val() == '') {
                $jq('#area_error').text('{{ __('validation.area_is_empty') }}');
                result = false;
            }

            return result;
        }
</script>
