FROM kalilinux/kali-rolling

# Packages
RUN apt update 
RUN apt install -y curl unzip jq git figlet nano 
RUN apt install -y golang python3 python3-pip python3-venv ruby php 
RUN apt install -y netcat-traditional whois subfinder assetfinder httpx-toolkit dnsutils ffuf whatweb wafw00f wpscan hydra dnsenum finalrecon nuclei sqlmap

# Files
RUN touch ~/.hushlogin
RUN mkdir -p /opt/lists
RUN mkdir -p /opt/apps
RUN mkdir -p /data

## Lists

# SecLists
RUN cd /opt/lists && git clone --depth 1 https://github.com/danielmiessler/SecLists.git

# Rockyou
RUN curl -L -o /opt/lists/rockyou.txt https://github.com/brannondorsey/naive-hashcat/releases/download/data/rockyou.txt

# Wordlists
RUN cd /opt/lists && git clone --depth 1 https://github.com/imsky/wordlists.git

## Apps

# Subzy
RUN go install -v github.com/PentestPad/subzy@latest

# Username Anarchy
RUN cd /opt/apps && git clone --depth 1 https://github.com/urbanadventurer/username-anarchy.git

# Psudohash
RUN cd /opt/apps && git clone --depth 1 https://github.com/t3l3machus/psudohash.git
RUN cd /opt/apps/psudohash/ && python3 -m venv venv && ./venv/bin/pip3 install tqdm

# WhatWaf
RUN cd /opt/apps && git clone --depth 1 https://github.com/ekultek/whatwaf.git
RUN cd /opt/apps/whatwaf/ && python3 -m venv venv && ./venv/bin/pip3 install -r requirements.txt

# Scrapy
RUN mkdir /opt/apps/scrapy
RUN cd /opt/apps/scrapy/ && python3 -m venv venv && ./venv/bin/pip3 install scrapy

# XSStrike
RUN cd /opt/apps && git clone --depth 1 https://github.com/s0md3v/XSStrike.git
RUN cd /opt/apps/XSStrike/ && python3 -m venv venv && ./venv/bin/pip3 install -r requirements.txt

# XXEInjector
RUN cd /opt/apps && git clone --depth 1 https://github.com/enjoiz/XXEinjector.git

# Graphw00f
RUN cd /opt/apps && git clone --depth 1 https://github.com/dolevf/graphw00f.git
RUN cd /opt/apps/graphw00f/ && python3 -m venv venv && ./venv/bin/pip3 install requests

# GraphqlCop  
RUN cd /opt/apps && git clone --depth 1 https://github.com/dolevf/graphql-cop.git
RUN cd /opt/apps/graphql-cop/ && python3 -m venv venv && ./venv/bin/pip3 install -r requirements.txt

# Graphqlmap
RUN cd /opt/apps && git clone --depth 1 https://github.com/swisskyrepo/GraphQLmap.git
RUN cd /opt/apps/GraphQLmap/ && echo -n "pyreadline\nrequests" > requirements.txt && python3 -m venv venv && ./venv/bin/pip3 install setuptools && ./venv/bin/pip3 install -r requirements.txt && ./venv/bin/python3 setup.py install

## Custom apps

COPY ./apps/cupp /opt/apps/cupp
COPY ./apps/scrapy /opt/apps/scrapy
