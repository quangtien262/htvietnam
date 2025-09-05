<footer id="footer" class="footer-wrapper">
    <section class="section footer-section dark" id="section_1707019293">
        <div class="bg section-bg fill bg-fill  ">
        </div>
        <div class="section-content relative">
            <div class="row" id="row-313125092">
                <div id="col-1266985964" class="col medium-12 small-12 large-3  col-sm-12">
                    <div class="col-inner">
                        <div class="icon-box featured-box icon-box-top text-left">
                            <div class="icon-box-img" style="width: 142px">
                                <div class="icon">
                                    <div class="icon-inner">
                                        <img width="176" height="43" src="{{ $config->logo }}"
                                            class="attachment-medium size-medium" alt="" decoding="async"
                                            loading="lazy" />
                                    </div>
                                </div>
                            </div>
                            <div class="icon-box-text last-reset">
                                <h3 class="title">{{ $config->company_name }}</h3>
                                <p>
                                    {{ !empty($config->footer) ? nl2br(e($config->footer)) : '' }}
                                </p>
                            </div>
                        </div>
                        <div class="social-icons follow-icons full-width text-left">
                            <a href="https://facebook.com/{{ $config->facebook }}" target="_blank" data-label="Facebook"
                                rel="noopener noreferrer nofollow" class="icon primary button circle facebook tooltip"
                                title="Follow on Facebook" aria-label="Follow on Facebook">
                                <i class="icon-facebook"></i>
                            </a>
                            <a href="{{ $config->instagram }}" target="_blank" rel="noopener noreferrer nofollow"
                                data-label="Instagram" class="icon primary button circle  instagram tooltip"
                                title="Follow on Instagram" aria-label="Follow on Instagram"><i
                                    class="icon-instagram"></i></a>

                            <a href="{{ $config->youtube }}" target="_blank" rel="noopener noreferrer nofollow"
                                data-label="YouTube" class="icon primary button circle  youtube tooltip"
                                title="Follow on YouTube" aria-label="Follow on YouTube"><i
                                    class="icon-youtube"></i></a>

                            @if (!empty($config->tiktok))
                                <a href="{{ $config->tiktok }}" target="_blank" rel="noopener noreferrer nofollow"
                                    data-label="TikTok" class="icon primary button circle tiktok tooltip"
                                    title="Follow on TikTok" aria-label="Follow on TikTok"><i
                                        class="icon-tiktok"></i></a>
                            @endif

                            @if (!empty($config->pinterest))
                                <a href="{{ $config->pinterest }}" target="_blank" rel="noopener noreferrer nofollow"
                                    data-label="Pinterest" class="icon primary button circle  pinterest tooltip"
                                    title="Follow on Pinterest" aria-label="Follow on Pinterest"><i
                                        class="icon-pinterest"></i></a>
                            @endif
                        </div>
                    </div>
                </div>

                <div id="col-1994144840" class="col medium-12 small-12 large-3 col-sm-12">
                    <div class="col-inner">
                        <h3 class="title">{{ __('user.title_contact_footer') }}</h3>
                        <div class="icon-box featured-box icon-box-left text-left">
                            <div class="icon-box-img" style="width: 20px">
                                <div class="icon">
                                    <div class="icon-inner">
                                        <!-- Uploaded to: SVG Repo, www.svgrepo.com, Generator: SVG Repo Mixer Tools -->
                                        @include('icons.location02')
                                    </div>
                                </div>
                            </div>
                            <div class="icon-box-text last-reset">
                                <p>{{ $config->address }}</p>
                            </div>
                        </div>
                        <div class="icon-box featured-box icon-box-left text-left">
                            <div class="icon-box-img" style="width: 20px">
                                <div class="icon">
                                    <div class="icon-inner">
                                        @include('icons.phone')
                                    </div>
                                </div>
                            </div>
                            <div class="icon-box-text last-reset">
                                <p>`
                                    {{ $config->phone }}
                                </p>
                            </div>
                        </div>
                        <div class="icon-box featured-box icon-box-left text-left">
                            <div class="icon-box-img" style="width: 20px">
                                <div class="icon">
                                    <div class="icon-inner">
                                        @include('icons.email')
                                    </div>
                                </div>
                            </div>
                            <div class="icon-box-text last-reset">
                                <p>
                                    <a href="" class="__cf_email__">
                                        {{ $config->email }}
                                    </a>
                                    <br />
                                    <a href="" class="__cf_email__">
                                        {{ $config->email02 }}
                                    </a>
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                <div id="col-1439219474" class="col medium-6 small-12 large-3 col-sm-12">
                    <div class="col-inner icon-box-text last-reset">
                        <h3 class="title">{{ __('user.title_office_footer') }}</h3>
                        <p class="address-footer">{!! !empty($config->office) ? nl2br($config->office) : '' !!}</p>
                        <div>
                            {!! !empty($config->code_gg_map_office) ? nl2br($config->code_gg_map_office) : '' !!}
                        </div>
                    </div>
                </div>

                <div id="col-389608184" class="col medium-6 small-12 large-3 col-sm-12">
                    <div class="col-inner icon-box-text last-reset">
                        <h3 class="title">{{ __('user.title_factory_footer') }}</h3>
                        <p class="address-footer">{!! !empty($config->factory) ? nl2br($config->factory) : '' !!}</p>
                        <div>
                            {!! !empty($config->code_gg_map_factory) ? nl2br($config->code_gg_map_factory) : '' !!}
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <style>
            #section_1707019293 {
                padding-top: 100px;
                padding-bottom: 100px;
                background-color: rgb(2, 2, 2);
            }

            #section_1707019293 .section-bg.bg-loaded {
                background-image: url(/layouts/01/images/pattern.png);
            }

            #section_1707019293 .ux-shape-divider--top svg {
                height: 150px;
                --divider-top-width: 100%;
            }

            #section_1707019293 .ux-shape-divider--bottom svg {
                height: 150px;
                --divider-width: 100%;
            }
        </style>
    </section>
    <div class="absolute-footer dark medium-text-center text-center">
        <div class="container clearfix">
            <div class="footer-primary pull-left">
                <div class="copyright-footer">
                    <p class="copyright-text">© 2025 <a href="/" target="_blank"
                            rel="noopener noreferrer nofollow">GCC Group</a>. All rights reserved.</p>
                </div>
            </div>
        </div>
    </div>
    <a href="#top" class="back-to-top button icon invert plain fixed bottom z-1 is-outline hide-for-medium circle"
        id="top-link" aria-label="Go to top"><i class="icon-angle-up"></i></a>
</footer>
