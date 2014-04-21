#-*- mode: ruby -*-
# vi: set ft=ruby :

# base installation script
$script = <<SCRIPT
  # update system
  apt-get update
  # install nodejs
  apt-get update && apt-get install -y python-software-properties python g++ make && add-apt-repository -y ppa:chris-lea/node.js && apt-get update && apt-get install -y nodejs
  # install prosody
  apt-get install -y prosody
  # prosody config
  cp /vagrant/test/prosody/prosody.cfg.lua /etc/prosody/prosody.cfg.lua
  # register test user
  prosodyctl register me example.com me
  # restart prosody server
  service prosody restart
  # install forman
  gem install foreman
SCRIPT

# run as with server to server
  $s2s = <<S2SSCRIPT
  # install bind
  apt-get update
  apt-get install -y bind9
  # http://www.linuxjournal.com/article/10982?page=0,1
  cp /vagrant/test/prosody/bind/* /etc/bind/
  # set local dns server: https://developers.google.com/speed/public-dns/docs/using
  cp /vagrant/test/prosody/dns/resolv.conf /etc/resolv.conf
  service bind9 restart
  service prosody restart
S2SSCRIPT

PROSODY_IP = ENV["PROSODY_IP"] || "192.168.55.10"

Vagrant.configure("2") do |config|

  config.vm.hostname = "example.com"

  config.vm.provider "virtualbox" do |p|
    p.customize ["modifyvm", :id, "--memory", "1048"]
  end

  # private network setup
  config.vm.network :private_network, ip: PROSODY_IP

  config.vm.box = "raring"
  config.vm.box_url = "http://cloud-images.ubuntu.com/vagrant/raring/current/raring-server-cloudimg-amd64-vagrant-disk1.box"

  # component test
  config.vm.provision "shell", inline: $script

  # activate for s2s tests
  config.vm.provision "shell", inline: $s2s
end