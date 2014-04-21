;
; BIND data file for example.org
;
$TTL 4h
@  IN  SOA ns1.example.org. root.example.org. (
            2           ; Serial
            604800      ; Refresh
            86400       ; Retry
            2419200     ; Expire
            604800 )    ; Negative Cache TTL
;
@       IN NS   ns1.example.org.
@       IN A    192.168.55.10
www     IN A    192.168.55.10
ns1     IN A    192.168.55.10
smtp    IN A    192.168.55.1
