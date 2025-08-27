<div id="col-1544171652" class="col cot3 small-12 large-12">
    <div class="col-inner">
        <div class="wpcf7 no-js" id="wpcf7-f563-p2-o1" lang="vi" dir="ltr">

            <div class="screen-reader-response">
                <p role="status" aria-live="polite" aria-atomic="true"></p>
                <ul></ul>
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
                                <input size="40" class="wpcf7-form-control wpcf7-text wpcf7-validates-as-required"
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
                                <input size="40"
                                    class="wpcf7-form-control wpcf7-text wpcf7-email wpcf7-validates-as-email"
                                    aria-invalid="false" placeholder="{{ __('user.enter_your_email') }}" value=""
                                    type="email" name="contact[email]" />
                                <label class="error email_error _red" id="email_error" for="email"></label>
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
                                <input size="40" class="wpcf7-form-control wpcf7-text" aria-invalid="false"
                                    placeholder="{{ __('user.phone') }}" value="" type="text"
                                    name="contact[phone]" />
                                <label class="error phone_error _red" id="phone_error" for="phone"></label>
                            </span>
                        </p>
                    </div>
                    <div class="col large-12">
                        <p id="result" class="_success"></p>
                        <input class="wpcf7-form-control has-spinner wpcf7-submit btn-submit" type="button"
                            onclick="sendContact('#contactForm')" data-wait="{{ __('user.sending') }}"
                            data-id="contact01" id="btnContact01" value="{{ __('user.download') }}" />
                    </div>
                </div>
                <div class="wpcf7-response-output" aria-hidden="true"></div>
            </form>
        </div>
    </div>
</div>

<script>
    function sendContact(formID) {
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
                    $jq('#result').html('{{ __('user.request_download_success') }}');

                    window.location.href = '{{ route('product.download', ['id' => $product->id]) }}';
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
