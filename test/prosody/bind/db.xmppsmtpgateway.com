;
; BIND data file for xmppsmtpgateway.com
;
$TTL 4h
@  IN  SOA ns1.xmppsmtpgateway.com. root.xmppsmtpgateway.com. (
            2           ; Serial
            604800      ; Refresh
            86400       ; Retry
            2419200     ; Expire
            604800 )    ; Negative Cache TTL
;
@       IN NS   ns1.xmppsmtpgateway.com.
@       IN A    192.168.55.1
www     IN A    192.168.55.1
ns1     IN A    192.168.55.1