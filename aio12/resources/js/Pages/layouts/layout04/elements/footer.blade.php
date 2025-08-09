<footer id="footer" class="footer-wrapper">
    <section class="section tin-khuyen-mai dark" id="section_1959881970">
        <div class="bg section-bg fill bg-fill  bg-loaded">
        </div>
        <div class="section-content relative">
            <div class="row" id="row-620204441">
                <div class="col medium-6 small-12 large-6">
                    <div class="col-inner">
                        <div class="img has-hover x md-x lg-x y md-y lg-y" id="image_2061051908">
                            <div class="img-inner dark" style="margin:-30px 0px 0px 0px;">
                                <img width="550" height="157" src="/layouts/layout04/images/banner_newsletter-2.png"
                                    class="attachment-original size-original" alt=""
                                    srcset="/layouts/layout04/images/banner_newsletter-2.png 550w, /layouts/layout04/images/banner_newsletter-2-300x86.png 300w"
                                    sizes="(max-width: 550px) 100vw, 550px" />
                            </div>
                            <style scope="scope">
                                #image_2061051908 {
                                    width: 100%;
                                }
                            </style>
                        </div>
                    </div>
                </div>
                <div class="col cot2 medium-6 small-12 large-6">
                    <div class="col-inner">
                        <div id="gap-1557079879" class="gap-element clearfix" style="display:block; height:auto;">
                            <style scope="scope">
                                #gap-1557079879 {
                                    padding-top: 44px;
                                }
                            </style>
                        </div>
                        <div role="form" class="wpcf7" id="wpcf7-f87-o1" lang="vi" dir="ltr">
                            <div class="screen-reader-response"></div>
                            <form id="DOMContentLoaded" action="{{ route('sendMail') }}" method="POST"
                            enctype="multipart/form-data" class="wpcf7-form" >
                            @csrf
                                <div class="flex-row form-flat medium-flex-wrap">
                                    <div class="flex-col flex-grow">
                                        <span class="wpcf7-form-control-wrap your-email">
                                            <input type="email" name="mailMess" id="mailMess" value="" size="40" 
                                                class="wpcf7-form-control wpcf7-text wpcf7-email wpcf7-validates-as-required wpcf7-validates-as-email" 
                                               placeholder="Địa chỉ Email" />
                                        </span>
                                    </div>
                                   
                                    <div class="flex-col ml-half">
                                        <input type="submit" onclick="checkEmail()" value="Đăng Ký" class="wpcf7-form-control wpcf7-submit" />
                                    </div>
                                </div>
                                <div class="error"></div>
                                <div class="wpcf7-response-output wpcf7-display-none"></div>
                            </form>
                            <script>
                                document.getElementById('DOMContentLoaded').addEventListener('submit', function(event) {
                                    var emailInput = document.getElementById('mailMess').value;
                                    var errorParagraph = document.querySelector('.error');
                            
                                    if (!emailInput.includes('@') || !emailInput.includes('.com')) {
                                        event.preventDefault();
                                        errorParagraph.textContent = 'Vui lòng viết đúng định dạng email';
                                    } else {
                                        errorParagraph.textContent = '';
                                    }
                                });
                            </script>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <style scope="scope">
            #section_1959881970 {
                padding-top: 0px;
                padding-bottom: 0px;
                background-color: #37b5ff;
            }
        </style>
    </section>
    <section class="section footer-section" id="section_1396926993">
        <div class="bg section-bg fill bg-fill  bg-loaded">
        </div>
        <div class="section-content relative">
            <div class="row" id="row-804353785">
                <div class="col medium-4 small-12 large-4">
                    <div class="col-inner">
                        <h3><span class="text-blue1">Thông tin liên hệ</span></h3>
                        <hr />
                        <p><span style="font-size: 90%;"><strong>{{ $config->name }}</strong></span></p>
                        <p><span style="font-size: 90%;"><strong> Địa chỉ</strong>: {{ $config->address }}</span></p>
                    </div>
                </div>
                <div class="col medium-4 small-12 large-4">
                    <div class="col-inner">
                        <h3><span class="text-blue1">Hotline liên hệ</span></h3>
                        <hr />
                        <div class="icon-box featured-box icon-box-left text-left is-small">
                            <div class="icon-box-img" style="width: 60px">
                                <div class="icon">
                                    <div class="icon-inner">
                                        <img width="53" height="40" src="/layouts/layout04/images/hotline.png"
                                            class="attachment-medium size-medium" alt="" />
                                    </div>
                                </div>
                            </div>
                            <div class="icon-box-text last-reset">
                                <p>
                                    <span style="font-size: 130%;">
                                        <strong>
                                            <a href="tel:{{ $config->phone }}"><span class="text-blue1">{{ $config->phone }}</span></a>
                                        </strong>
                                    </span>
                                </p>
                            </div>
                        </div>
                        <p>
                       
                    </div>
                </div>
                <div class="col medium-4 small-12 large-4">
                    <div class="col-inner">
                        <h3><span class="text-blue1">Kết nối với chúng tôi</span></h3>
                        <hr />
                        <div class="social-icons follow-icons">

                            @if(!empty($config->facebook_id)) 
                                <a href="http://facebook.com/{{ $config->facebook_id }}"
                                    target="_blank" 
                                    data-label="Facebook" 
                                    rel="noopener noreferrer nofollow"
                                    class="icon primary button circle facebook tooltip" 
                                    title="Follow on Facebook">
                                        <i class="icon-facebook"></i>
                                </a> 
                            @endif
                            
                            @if (!empty($config->instagram)) 
                                <a href="{{ $config->instagram }}" 
                                    data-label="Instagram"
                                    class="icon primary button circle  instagram tooltip" 
                                    title="Follow on Instagram">
                                    <i class="icon-instagram"></i>
                                </a> 
                            @endif 
                            
                            @if (!empty($config->twitter)) 
                                <a href="{{ $config->twiter }}" data-label="Twitter"
                                class="icon primary button circle  instagram tooltip" title="Follow on Twitter">
                                <i class="icon-twitter"></i>
                            </a> 
                            @endif 
                            
                            @if (!empty($config->likedin)) 
                                <a href="{{ $config->likedin }}" 
                                    data-label="LinkedIn"
                                    class="icon primary button circle  LinkedIn tooltip" 
                                    title="Follow on Twitter">
                                    <i class="icon-linkedin"></i>
                                </a>
                            @endif 
                            
                            @if(!empty($config->email))
                                <a href="mailto:{{ $config->email }}"
                                    data-label="E-mail" 
                                    rel="nofollow" 
                                    class="icon primary button circle  email tooltip"
                                    title="Send us an email">
                                    <i class="icon-envelop"></i>
                                </a>
                            @endif

                            @if(!empty($config->phone))
                                <a href="tel:{{ $config->phone }}" target="_blank" data-label="Phone" rel="noopener noreferrer nofollow" class="icon primary button circle  phone tooltip"  title="Call us">
                                    <i class="icon-phone"></i>
                                </a>
                            @endif
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <style scope="scope">
            #section_1396926993 {
                padding-top: 30px;
                padding-bottom: 30px;
            }
        </style>
    </section>
    <div class="absolute-footer dark medium-text-center small-text-center">
        <div class="container clearfix">
            <div class="footer-primary pull-left">
                <div class="copyright-footer">
                </div>
            </div>
        </div>
    </div>
    <a href="#top" class="back-to-top button icon invert plain fixed bottom z-1 is-outline hide-for-medium circle"
        id="top-link"><i class="icon-angle-up"></i></a>
</footer>