<div class="social-icons share-icons share-row relative">

    {{-- facebook --}}
    <a href="https://www.facebook.com/sharer.php?u={{ url()->full() }}" data-label="Facebook"
        onclick="window.open(this.href,this.title,'width=500,height=500,top=300px,left=300px');" target="_blank"
        class="icon button circle is-outline tooltip facebook" title="Share on Facebook" aria-label="Share on Facebook"><i
            class="icon-facebook"></i>
    </a>

    {{-- twitter --}}
    <a href="https://twitter.com/share?url={{ url()->full() }}"
        onclick="window.open(this.href,this.title,'width=500,height=500,top=300px,left=300px');" target="_blank"
        class="icon button circle is-outline tooltip twitter" title="Share on Twitter" aria-label="Share on Twitter"><i
            class="icon-twitter"></i>
    </a>

    {{-- email --}}
    <a href="mailto:?subject={{ urlencode($data->name_data) }}&body={{ urlencode('Xem bài viết này: ' . url()->full()) }}"
        class="icon button circle is-outline tooltip email" title="Email to a Friend" aria-label="Email to a Friend">
        <i class="icon-envelop"></i>
    </a>

    {{-- pinterest --}}
    <a href="https://pinterest.com/pin/create/button/?url={{ url()->full() }}&media={{ $data->image }}&description={{ urlencode($data->name_data) }}"
        onclick="window.open(this.href,this.title,'width=500,height=500,top=300px,left=300px');" target="_blank"
        class="icon button circle is-outline tooltip pinterest" title="Share on pinterest"
        aria-label="Share on pinterest"><i class="icon-pinterest"></i>
    </a>

    {{-- linkedin --}}
    <a href="https://www.linkedin.com/shareArticle?mini=true&url={{ url()->full() }}&title={{ urlencode($data->name_data) }}"
        onclick="window.open(this.href,this.title,'width=500,height=500,top=300px,left=300px');" target="_blank"
        class="icon button circle is-outline tooltip linkedin" title="Share on LinkedIn"
        aria-label="Share on LinkedIn"><i class="icon-linkedin"></i>
    </a>
</div>
