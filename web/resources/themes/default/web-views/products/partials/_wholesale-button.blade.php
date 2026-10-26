@php
    $wsConfig = getWebConfig(name: 'whatsapp');
    $wsPhone = preg_replace('/\D/', '', is_array($wsConfig) ? ($wsConfig['phone'] ?? '') : '');
    if (strlen(ltrim($wsPhone, '0')) < 7) {
        $wsPhone = preg_replace('/\D/', '', (string)getWebConfig(name: 'company_phone'));
    }
    $wsText = translate('Hello_I_want_to_buy_wholesale') . ': ' . $product['name'];
@endphp
<a class="pdp-wholesale-btn" target="_blank" rel="noopener" href="https://wa.me/{{ $wsPhone }}?text={{ rawurlencode($wsText) }}">
    <i class="fa fa-whatsapp"></i>
    <span>{{ translate('Wholesale_on_WhatsApp') }}</span>
</a>
<style>
    .pdp-price-row{display:flex;align-items:center;justify-content:space-between;gap:10px;flex-wrap:wrap}
    .pdp-wholesale-btn{display:inline-flex;align-items:center;gap:7px;background:#25d366;color:#fff!important;font-weight:700;font-size:13.5px;line-height:1.1;padding:9px 13px;border-radius:22px;text-decoration:none!important;box-shadow:0 2px 8px rgba(37,211,102,.35);white-space:nowrap}
    .pdp-wholesale-btn i{font-size:18px}
    .pdp-wholesale-btn:hover{background:#1ebe5a}
</style>