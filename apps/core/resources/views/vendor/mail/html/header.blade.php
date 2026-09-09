@props(['url'])
<tr>
<td class="header">
<a href="{{ $url }}" style="display: inline-block;">
<img src="{{ asset('images/favicon.png') }}" class="brand-mark" alt="Knutsford University logo">
<span class="brand-name">{!! $slot !!}</span>
<span class="brand-subtitle">Student operations notification</span>
</a>
</td>
</tr>
